import Link from "next/link";
import { Plus, Pencil, BedDouble, Key, Wrench, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getRoomsForAdmin,
  getAdminRoomStats,
} from "@/features/rooms/room-service";
import { RoomsFilterHeader } from "@/features/rooms/components/rooms-filter-header";
import { RoomsTable } from "@/features/rooms/components/rooms-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kamar | Admin Smartkost",
};

const statusStyles: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Tersedia",
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5",
  },
  OCCUPIED: {
    label: "Terisi",
    className:
      "bg-blue-500/10 text-blue-400 border-blue-500/20 text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20 text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5",
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function AdminRoomsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const status = resolvedParams.status || "";
  const type = resolvedParams.type || "";

  const page = Number(resolvedParams.page) || 1;
  const limit = 10;

  const [stats, { data: rooms, totalCount }] = await Promise.all([
    getAdminRoomStats(),
    getRoomsForAdmin({ search, status, type, page, limit }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Extract unique room type names dynamically for the filter dropdown
  const types = stats.uniqueTypes;

  // Calculate full statistics (always based on total database items for context)
  const totalRoomsCount = stats.totalRooms;
  const occupiedCount = stats.occupiedRooms;
  const availableCount = stats.availableRooms;
  const maintenanceCount = stats.maintenanceRooms;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden md:overflow-visible">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Manajemen Kamar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data kamar, tipe, harga, status, dan fasilitas kost Anda
            secara terpusat.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Button
            asChild
            className="w-full sm:w-auto gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl px-5 h-11 font-medium transition-all shadow-[0_0_15px_rgba(0,204,64,0.15)] hover:shadow-[0_0_20px_rgba(0,204,64,0.25)] hover:-translate-y-0.5 duration-200"
          >
            <Link href="/admin/rooms/create">
              <Plus className="size-4" />
              Tambah Kamar
            </Link>
          </Button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Total Kamar */}
        <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-2xl p-4 sm:p-6 relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 group border-t-2 border-t-purple-500">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Kamar
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <BedDouble className="size-4 sm:size-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {totalRoomsCount}
          </div>
        </div>

        {/* Terisi */}
        <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-2xl p-4 sm:p-6 relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 group border-t-2 border-t-blue-500">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Terisi
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Lock className="size-4 sm:size-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {occupiedCount}
          </div>
        </div>

        {/* Tersedia */}
        <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-2xl p-4 sm:p-6 relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 group border-t-2 border-t-secondary">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Tersedia
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
              <Key className="size-4 sm:size-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {availableCount}
          </div>
        </div>

        {/* Perbaikan */}
        <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-2xl p-4 sm:p-6 relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 group border-t-2 border-t-amber-500">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Perbaikan
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Wrench className="size-4 sm:size-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {maintenanceCount}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-zinc-950/30 p-4 border border-zinc-800/80 rounded-2xl backdrop-blur-md shadow-inner">
        <RoomsFilterHeader
          types={types}
          initialSearch={search}
          initialStatus={status}
          initialType={type}
        />
      </div>

      {/* Rooms Table Component with Bulk Status Update */}
      <RoomsTable
        rooms={rooms}
        page={page}
        limit={limit}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    </div>
  );
}
