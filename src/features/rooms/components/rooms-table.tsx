"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Check, X, ShieldAlert, Key, Wrench, Lock } from "lucide-react";
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
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DeleteRoomButton } from "./delete-room-button";
import { bulkUpdateRoomStatusAction } from "../actions";
import { toast } from "sonner";
import { RoomForAdmin } from "../room-service";
import { motion, AnimatePresence } from "framer-motion";

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

interface RoomsTableProps {
  rooms: RoomForAdmin[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export function RoomsTable({
  rooms,
  page,
  limit,
  totalCount,
  totalPages,
}: RoomsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === rooms.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rooms.map((room) => room.id));
    }
  };

  const isAllSelected = rooms.length > 0 && selectedIds.length === rooms.length;

  const handleBulkUpdateStatus = (
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
  ) => {
    startTransition(async () => {
      try {
        const result = await bulkUpdateRoomStatusAction(selectedIds, status);
        if (result.success) {
          toast.success(
            `Berhasil memperbarui ${selectedIds.length} kamar menjadi ${
              statusStyles[status].label
            }`
          );
          setSelectedIds([]);
        } else {
          toast.error(
            result.error || "Gagal memperbarui status kamar secara massal."
          );
        }
      } catch (err) {
        toast.error("Terjadi kesalahan saat memproses bulk update.");
        console.error(err);
      }
    });
  };

  return (
    <div className="relative">
      <div className="rounded-2xl border border-zinc-800/85 bg-zinc-950/40 backdrop-blur-md shadow-xl relative">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 transition-all pb-2">
          <Table className="min-w-[800px] border-collapse">
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/30">
                <TableHead className="w-12 text-center pl-4">
                  <div
                    onClick={handleSelectAll}
                    className={`mx-auto flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-150 ${
                      isAllSelected
                        ? "bg-secondary border-secondary text-secondary-foreground"
                        : "border-zinc-800 bg-zinc-950/40 text-transparent hover:border-zinc-700"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                </TableHead>
                <TableHead className="text-zinc-400 pl-2 h-12 sticky left-0 z-20 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)]">
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
                    colSpan={7}
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
                  const isSelected = selectedIds.includes(room.id);
                  return (
                    <TableRow
                      key={room.id}
                      className={`border-zinc-800/60 hover:bg-zinc-900/40 transition-colors group relative ${
                        isSelected ? "bg-zinc-900/30" : ""
                      }`}
                    >
                      <TableCell className="w-12 text-center pl-4 py-4">
                        <div
                          onClick={() => handleSelectRow(room.id)}
                          className={`mx-auto flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-150 ${
                            isSelected
                              ? "bg-secondary border-secondary text-secondary-foreground"
                              : "border-zinc-800 bg-zinc-950/40 text-transparent hover:border-zinc-700"
                          }`}
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-white pl-2 relative py-4 sticky left-0 z-10 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] group-hover:bg-zinc-900/90 transition-colors">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-[3px] bg-transparent transition-all duration-300 ${
                            isSelected ? "bg-secondary" : "group-hover:bg-primary"
                          }`}
                        />
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

        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit}
        />
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl"
          >
            <div className="bg-zinc-950/95 border border-zinc-800/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-black/45">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <ShieldAlert className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {selectedIds.length} Kamar Terpilih
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Pilih aksi status di samping untuk update massal.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Button
                  onClick={() => setSelectedIds([])}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900/60"
                  disabled={isPending}
                >
                  <X className="size-3 mr-1" />
                  Batal
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => handleBulkUpdateStatus("AVAILABLE")}
                    size="sm"
                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-xl"
                    disabled={isPending}
                  >
                    <Key className="size-3 mr-1" />
                    Tersedia
                  </Button>
                  <Button
                    onClick={() => handleBulkUpdateStatus("OCCUPIED")}
                    size="sm"
                    className="text-xs bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/20 text-blue-400 rounded-xl"
                    disabled={isPending}
                  >
                    <Lock className="size-3 mr-1" />
                    Terisi
                  </Button>
                  <Button
                    onClick={() => handleBulkUpdateStatus("MAINTENANCE")}
                    size="sm"
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 rounded-xl"
                    disabled={isPending}
                  >
                    <Wrench className="size-3 mr-1" />
                    Perbaikan
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
