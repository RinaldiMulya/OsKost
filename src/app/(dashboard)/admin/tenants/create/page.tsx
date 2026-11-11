import Link from "next/link";
import { ArrowLeft, ChevronRight, Home, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { createTenantAction } from "@/features/tenants/actions";
import { requireOwnerSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check-in Penghuni Baru | Admin OsKost",
};

export default async function CreateTenantPage() {
  const user = await requireOwnerSession();

  // Fetch only rooms that are currently AVAILABLE in this property for check-in
  const availableRooms = await prisma.room.findMany({
    where: {
      propertyId: user.propertyId,
      status: "AVAILABLE",
    },
    orderBy: { number: "asc" },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-[#7A7A7A]"
      >
        <Link
          href="/admin"
          className="hover:text-[#1E1B18] transition-colors flex items-center gap-1.5"
        >
          <Home className="size-3.5" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="size-3.5 text-[#2C2825]/20" />
        <Link
          href="/admin/tenants"
          className="hover:text-[#1E1B18] transition-colors"
        >
          Manajemen Penghuni
        </Link>
        <ChevronRight className="size-3.5 text-[#2C2825]/20" />
        <span className="font-semibold text-[#1E1B18]">
          Check-in Tenant Baru
        </span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-[#2C2825]/30">
        <div className="flex items-start sm:items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-11 w-11 shrink-0 rounded-xl border-[#2C2825]/15 bg-white text-[#4A453F] hover:text-[#1E1B18] hover:bg-[#F4EDE4] shadow-xs transition-colors"
          >
            <Link href="/admin/tenants" title="Kembali ke Daftar Penghuni">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B18] tracking-tight">
              Daftarkan Penghuni Baru (Check-in)
            </h1>
            <p className="text-sm sm:text-base text-[#4A453F]">
              Isi profil penyewa, tentukan kamar, periode sewa, dan nominal
              tagihan awal.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-[#2C2825]/10 shadow-xs">
          <div className="p-2 rounded-xl bg-[#FAF2EA] text-[#714A23]">
            <Users className="size-5" />
          </div>
          <div className="text-right">
            <div className="text-xs text-[#7A7A7A] font-medium">
              Kamar Siap Sewa
            </div>
            <div className="text-sm font-bold text-[#1E1B18]">
              {availableRooms.length} Kamar Tersedia
            </div>
          </div>
        </div>
      </div>

      {/* Main Tenant Form */}
      <TenantForm
        action={createTenantAction}
        submitLabel="Check-in Tenant"
        availableRooms={availableRooms}
      />
    </div>
  );
}
