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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[#2C2825]/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">
            Manajemen Kamar
          </h1>
          <p className="text-sm sm:text-base text-[#4A453F] font-medium mt-1">
            Kelola data kamar, tipe, harga, status, dan fasilitas kost Anda secara terpusat.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Button
            asChild
            className="w-full sm:w-auto gap-2 bg-[#714A23] text-white hover:bg-[#5C3B1A] rounded-xl px-5 h-11 text-sm font-semibold transition-all shadow-sm hover:-translate-y-0.5 duration-200"
          >
            <Link href="/admin/rooms/create">
              <Plus className="size-4" />
              Tambah Kamar
            </Link>
          </Button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Kamar */}
        <div className="bg-white border border-[#2C2825]/10 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all duration-300 group border-t-4 border-t-purple-600">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-sm font-bold text-[#4A453F]">
              Total Kamar
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-110 transition-transform">
              <BedDouble className="size-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1E1B18] tracking-tight">
            {totalRoomsCount}
          </div>
        </div>

        {/* Terisi */}
        <div className="bg-white border border-[#2C2825]/10 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all duration-300 group border-t-4 border-t-blue-600">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-sm font-bold text-[#4A453F]">
              Terisi
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:scale-110 transition-transform">
              <Lock className="size-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1E1B18] tracking-tight">
            {occupiedCount}
          </div>
        </div>

        {/* Tersedia */}
        <div className="bg-white border border-[#2C2825]/10 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all duration-300 group border-t-4 border-t-emerald-600">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-sm font-bold text-[#4A453F]">
              Tersedia
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
              <Key className="size-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1E1B18] tracking-tight">
            {availableCount}
          </div>
        </div>

        {/* Perbaikan */}
        <div className="bg-white border border-[#2C2825]/10 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all duration-300 group border-t-4 border-t-amber-600">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-sm font-bold text-[#4A453F]">
              Perbaikan
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
              <Wrench className="size-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1E1B18] tracking-tight">
            {maintenanceCount}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 border border-[#2C2825]/10 rounded-2xl shadow-sm">
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
