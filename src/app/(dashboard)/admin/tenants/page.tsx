import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllTenants } from "@/features/tenants/tenant-service";
import { DashboardStats } from "@/features/tenants/components/DashboardStats";
import { TenantTable } from "@/features/tenants/components/TenantTable";
import { ExportTenantsButton } from "@/features/tenants/components/export-tenants-button";
import { SendAnnouncementDialog } from "@/features/tenants/components/send-announcement-dialog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Penghuni | Admin Smartkost",
};

export default async function AdminTenantsPage() {
  const tenants = await getAllTenants();

  // Hitung statistik hanya dari penyewa yang memiliki lease aktif
  let totalCount = 0;
  let paidCount = 0;
  let unpaidCount = 0;
  let warningCount = 0;
  let newTenantsThisMonth = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  tenants.forEach((tenant) => {
    const activeLease = tenant.leases.find((l: any) => l.isActive);
    if (activeLease) {
      totalCount++;

      // Hitung penyewa baru (check-in dalam 30 hari terakhir)
      const startDate = new Date(activeLease.startDate);
      if (startDate >= thirtyDaysAgo) {
        newTenantsThisMonth++;
      }

      const unpaidInvoices = activeLease.invoices.filter(
        (inv: any) => inv.status === "UNPAID" || inv.status === "OVERDUE",
      );
      const hasUnpaid = unpaidInvoices.length > 0;
      if (hasUnpaid) {
        unpaidCount++;
      } else {
        const endDate = activeLease.endDate
          ? new Date(activeLease.endDate)
          : null;
        if (endDate) {
          const todayCheck = new Date();
          todayCheck.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          const diffTime = endDate.getTime() - todayCheck.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (daysLeft <= 30) {
            // Kontrak hampir habis atau sudah habis
            warningCount++;
          } else {
            paidCount++;
          }
        } else {
          paidCount++;
        }
      }
    }
  });

  return (
    <div className="space-y-8 lg:p-8 w-full lg:max-w-[2400px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#2C2825]/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">
            Manajemen Penghuni
          </h2>
          <p className="text-sm sm:text-base text-[#4A453F] font-medium mt-1">
            Kelola data, status pembayaran, dan kontrak penyewa kost Anda secara terpusat.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            asChild
            className="gap-2 bg-[#714A23] text-white hover:bg-[#5C3B1A] transition-all active:scale-95 text-sm font-semibold h-11 px-5 rounded-xl shadow-sm"
          >
            <Link href="/admin/tenants/create">
              <Plus className="size-4" />
              Check-in Tenant
            </Link>
          </Button>
          <SendAnnouncementDialog tenants={tenants} />
          <ExportTenantsButton />
        </div>
      </div>

      {/* Stats Bento Grid */}
      <DashboardStats
        totalCount={totalCount}
        paidCount={paidCount}
        unpaidCount={unpaidCount}
        warningCount={warningCount}
        newTenantsThisMonth={newTenantsThisMonth}
      />

      {/* Tenant Table Wrapper */}
      <TenantTable tenants={tenants} />
    </div>
  );
}
