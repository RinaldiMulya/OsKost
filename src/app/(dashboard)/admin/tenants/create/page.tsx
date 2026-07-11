import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { createTenantAction } from "@/features/tenants/actions";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tambah Penghuni | Admin Smartkost",
};

export default async function CreateTenantPage() {
  // Fetch only rooms that are currently AVAILABLE for check-in
  const availableRooms = await prisma.room.findMany({
    where: { status: "AVAILABLE" },
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
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Daftarkan Penghuni Baru (Check-in)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Isi profil penyewa, pilih kamar, kontrak, dan detail pembayaran
            awal.
          </p>
        </div>
      </div>

      <TenantForm
        action={createTenantAction}
        submitLabel="Check-in Tenant"
        availableRooms={availableRooms}
      />
    </div>
  );
}
