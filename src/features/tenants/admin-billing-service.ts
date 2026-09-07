import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";

/**
 * Service Query untuk Halaman Admin Billing (/admin/billing)
 *
 * Mengambil:
 * 1. Agregat Statistik Keuangan & Tagihan Global
 * 2. Daftar Seluruh Tagihan (dengan rincian tenant, kamar, bukti transfer, & promo claim)
 * 3. Daftar Pengajuan Klaim Promo Menunggu Verifikasi
 */

export const getAdminBillingOverview = cache(async (query?: string, statusFilter?: string) => {
  return unstable_cache(
    async () => {
      // 1. Fetch All Active & Past Invoices
      const invoices = await prisma.invoice.findMany({
        include: {
          lease: {
            include: {
              room: {
                select: {
                  number: true,
                  name: true,
                  price: true,
                  property: { select: { name: true } },
                },
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  tenantProfile: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
          discountClaims: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { dueDate: "desc" },
      });

      // 2. Filter Invoices if search query or status filter is provided
      let filteredInvoices = invoices;

      if (statusFilter && statusFilter !== "ALL") {
        filteredInvoices = filteredInvoices.filter(
          (inv) => inv.status === statusFilter
        );
      }

      if (query && query.trim() !== "") {
        const q = query.toLowerCase();
        filteredInvoices = filteredInvoices.filter((inv) => {
          const tenantName =
            inv.lease.user.tenantProfile?.fullName?.toLowerCase() || "";
          const roomNumber = inv.lease.room.number.toLowerCase();
          const roomName = inv.lease.room.name.toLowerCase();
          return (
            tenantName.includes(q) ||
            roomNumber.includes(q) ||
            roomName.includes(q)
          );
        });
      }

      // 3. Aggregate Global Statistics
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      let totalBilledThisMonth = 0;
      let totalPaidThisMonth = 0;
      let totalUnpaidAmount = 0;
      let pendingTransfersCount = 0;

      for (const inv of invoices) {
        // Unpaid or Overdue amount
        if (inv.status === "UNPAID" || inv.status === "OVERDUE" || inv.status === "PENDING") {
          totalUnpaidAmount += inv.amount;
        }

        // Count pending manual transfers waiting for verification
        if (inv.status === "PENDING" && inv.proofUrl && inv.provider === "MANUAL") {
          pendingTransfersCount++;
        }

        // Monthly stats
        if (new Date(inv.dueDate) >= currentMonthStart) {
          totalBilledThisMonth += inv.amount;
          if (inv.status === "PAID") {
            totalPaidThisMonth += inv.amount;
          }
        }
      }

      // 4. Fetch Pending Promo Claims
      const pendingPromoClaims = await prisma.discountClaim.findMany({
        where: { status: "PENDING" },
        include: {
          invoice: {
            select: {
              id: true,
              dueDate: true,
              amount: true,
              rentAmount: true,
              tenantAdminFee: true,
              discountAmount: true,
              discountReason: true,
              status: true,
              lease: {
                select: {
                  room: {
                    select: { number: true, name: true },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              tenantProfile: {
                select: { fullName: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        stats: {
          totalBilledThisMonth,
          totalPaidThisMonth,
          totalUnpaidAmount,
          pendingTransfersCount,
          pendingPromoClaimsCount: pendingPromoClaims.length,
        },
        invoices: filteredInvoices,
        pendingPromoClaims,
      };
    },
    [`admin-billing-overview-${query || ""}-${statusFilter || "ALL"}`],
    {
      tags: [
        CACHE_TAGS.DASHBOARD_STATS,
        CACHE_TAGS.ADMIN_TENANTS,
        CACHE_TAGS.DISCOUNT_PRESETS,
      ],
      revalidate: 30,
    }
  )();
});
