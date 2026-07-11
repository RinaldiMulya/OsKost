import Link from "next/link";
import { Plus, Pencil, BedDouble, Key, Wrench, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getRoomsForAdmin,
  getAdminRoomStats,
} from "@/features/rooms/room-service";
import { DeleteRoomButton } from "@/features/rooms/components/delete-room-button";
import { RoomsFilterHeader } from "@/features/rooms/components/rooms-filter-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
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

      {/* Table Card Container */}
      <div className="rounded-2xl border border-zinc-800/85 bg-zinc-950/40 backdrop-blur-md shadow-xl relative">
        {/* Custom scrollbar for horizontal overflow */}
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 transition-all pb-2">
          <Table className="min-w-[700px] border-collapse">
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/30">
                <TableHead className="text-zinc-400 pl-6 h-12 sticky left-0 z-20 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)]">
                  No. Kamar
                </TableHead>
                <TableHead className="text-zinc-400 h-12">Tipe</TableHead>
                <TableHead className="text-zinc-400 h-12">
                  Harga Bulanan
                </TableHead>
                <TableHead className="text-zinc-400 h-12">Status</TableHead>
                <TableHead className="text-zinc-400 h-12 hidden md:table-cell">
                  Fasilitas
                </TableHead>
                <TableHead className="text-zinc-400 text-right pr-6 h-12">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow className="border-zinc-800/60">
                  <TableCell
                    colSpan={6}
                    className="h-44 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <p className="text-base font-semibold text-zinc-300">
                        Tidak ada kamar ditemukan
                      </p>
                      <p className="text-sm text-zinc-500">
                        Coba ubah kata kunci pencarian atau filter Anda.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => {
                  const statusInfo = statusStyles[room.status];
                  return (
                    <TableRow
                      key={room.id}
                      className="border-zinc-800/60 hover:bg-zinc-900/40 transition-colors group relative"
                    >
                      <TableCell className="font-mono font-bold text-white pl-6 relative py-4 sticky left-0 z-10 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] group-hover:bg-zinc-900/90 transition-colors">
                        {/* Interactive hover row-indicator strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-primary transition-all duration-300" />
                        {room.number}
                      </TableCell>
                      <TableCell className="text-white py-4 font-medium">
                        {room.name}
                      </TableCell>
                      <TableCell className="text-white py-4">
                        {formatCurrency(room.price)}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={statusInfo?.className}
                        >
                          {statusInfo?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[240px] py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {room.facilities.slice(0, 3).map((f, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] font-medium border-zinc-800 text-zinc-400 bg-zinc-900/40 rounded-md px-1.5 py-0.5"
                            >
                              {f}
                            </Badge>
                          ))}
                          {room.facilities.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium border-zinc-800 text-zinc-500 bg-zinc-900/10 rounded-md px-1.5 py-0.5"
                            >
                              +{room.facilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-all"
                          >
                            <Link href={`/admin/rooms/${room.id}/edit`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <DeleteRoomButton
                            roomId={room.id}
                            roomNumber={room.number}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit}
        />
      </div>
    </div>
  );
}
