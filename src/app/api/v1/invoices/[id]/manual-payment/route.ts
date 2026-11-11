import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { sendNotification } from "@/features/notifications/notification-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const manualPaymentSchema = z.object({
  proofUrl: z.string().url("URL bukti pembayaran tidak valid"),
  note: z.string().max(255, "Catatan maksimal 255 karakter").optional(),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return apiError("UNAUTHORIZED", "Sesi login tidak valid atau telah kadaluarsa", 401);
    }

    const { id: invoiceId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = manualPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0]?.message || "Data tidak valid", 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        property: true,
        lease: {
          include: {
            room: true,
            property: true,
            user: {
              select: {
                id: true,
                tenantProfile: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return apiError("NOT_FOUND", "Tagihan tidak ditemukan", 404);
    }

    // Pastikan user adalah pemilik tagihan atau admin
    if (authUser.role === "TENANT" && invoice.lease.userId !== authUser.id) {
      return apiError("FORBIDDEN", "Anda tidak memiliki akses ke tagihan ini", 403);
    }

    if (invoice.status === "PAID") {
      return apiError("ALREADY_PAID", "Tagihan ini sudah lunas", 400);
    }

    // Idempotency check: jika bukti yang sama sudah dikirim dan status masih PENDING
    if (invoice.status === "PENDING" && invoice.provider === "MANUAL" && invoice.proofUrl === parsed.data.proofUrl) {
      return apiSuccess(
        {
          id: invoice.id,
          status: invoice.status,
          provider: invoice.provider,
          proofUrl: invoice.proofUrl,
          adminNote: invoice.adminNote,
        },
        { message: "Bukti pembayaran sudah tersimpan sebelumnya. Menunggu verifikasi pengelola kost." }
      );
    }

    // Update status tagihan menjadi PENDING (MANUAL)
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PENDING",
        provider: "MANUAL",
        proofUrl: parsed.data.proofUrl,
        adminNote: parsed.data.note || "Menunggu verifikasi bukti transfer manual oleh pengelola kost.",
        verifiedBy: null,
        verifiedAt: null,
      },
    });

    // Kirim notifikasi ke Admin / Owner properti
    const targetProperty = invoice.property || invoice.lease.property;
    const roomNumber = invoice.lease.room.number;
    const tenantName = invoice.lease.user.tenantProfile?.fullName || "Penghuni";

    if (targetProperty?.ownerId) {
      await sendNotification({
        userId: targetProperty.ownerId,
        title: "Bukti Pembayaran Sewa Masuk",
        message: `${tenantName} (Kamar ${roomNumber}) telah mengunggah bukti transfer sewa. Harap verifikasi di menu Billing.`,
        type: "BILLING",
        url: "/admin/billing",
      }).catch((err) => console.error("[MANUAL_PAYMENT_NOTIF_ERROR]", err));
    }

    return apiSuccess(
      {
        id: updatedInvoice.id,
        status: updatedInvoice.status,
        provider: updatedInvoice.provider,
        proofUrl: updatedInvoice.proofUrl,
        adminNote: updatedInvoice.adminNote,
      },
      { message: "Bukti pembayaran berhasil diunggah. Menunggu verifikasi pengelola kost." }
    );
  } catch (error) {
    console.error("[API_MANUAL_PAYMENT_ERROR]", error);
    return apiError("INTERNAL_ERROR", "Gagal memproses unggah bukti transfer manual", 500);
  }
}
