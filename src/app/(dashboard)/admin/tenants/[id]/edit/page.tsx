import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { updateTenantAction } from "@/features/tenants/actions";
import { getTenantById } from "@/features/tenants/tenant-service";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

interface EditTenantPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditTenantPageProps): Promise<Metadata> {
  const { id } = await params;
  const tenant = await getTenantById(id);
  return {
    title: tenant?.tenantProfile
      ? `Edit ${tenant.tenantProfile.fullName} | Admin Smartkost`
      : "Penghuni Tidak Ditemukan | Admin Smartkost",
  };
}

export default async function EditTenantPage({ params }: EditTenantPageProps) {
  const { id } = await params;
  const tenant = await getTenantById(id);

  if (!tenant) {
    notFound();
  }

  // Fetch rooms that are AVAILABLE, plus the room currently leased by the tenant
  const activeLease = tenant.leases.find((l: any) => l.isActive);
  const currentRoomId = activeLease?.roomId ?? "";

  const availableRooms = await prisma.room.findMany({
    where: {
      OR: [
        { status: "AVAILABLE" },
        ...(currentRoomId ? [{ id: currentRoomId }] : []),
      ],
    },
    orderBy: { number: "asc" },
  });

  return (
    <div className="space-y-6 w-full max-w-[2800px] mx-auto lg:p-4 p-2 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="size-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Link href="/admin/tenants">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Edit Data: {tenant.tenantProfile?.fullName ?? "Penghuni"}
          </h1>
          <p className="text-xl text-zinc-400 mt-1">
            Perbarui informasi pribadi penyewa atau pindahkan kamar sewa.
          </p>
        </div>
      </div>

      <TenantForm
        tenant={tenant}
        action={updateTenantAction}
        submitLabel="Simpan Perubahan"
        availableRooms={availableRooms}
      />
    </div>
  );
}
