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
      "bg-emerald-50 text-emerald-800 border-emerald-300 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1",
  },
  OCCUPIED: {
    label: "Terisi",
    className:
      "bg-blue-50 text-blue-800 border-blue-300 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className:
      "bg-amber-50 text-amber-800 border-amber-300 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1",
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
      <div className="rounded-2xl border border-[#2C2825]/10 bg-white shadow-sm relative overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <Table className="min-w-[800px] border-collapse">
            <TableHeader>
              <TableRow className="border-b border-[#2C2825]/10 bg-[#F8F6F1]/80 hover:bg-[#F8F6F1]/80">
                <TableHead className="w-12 text-center pl-4">
                  <div
                    onClick={handleSelectAll}
                    className={`mx-auto flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-150 ${
                      isAllSelected
                        ? "bg-[#714A23] border-[#714A23] text-white"
                        : "border-[#2C2825]/30 bg-white text-transparent hover:border-[#714A23]"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                </TableHead>
                <TableHead className="text-[#1E1B18] font-bold text-sm pl-2 h-12 sticky left-0 z-20 bg-[#F8F6F1] border-r border-[#2C2825]/10 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.05)]">
                  No. Kamar
                </TableHead>
                <TableHead className="text-[#1E1B18] font-bold text-sm h-12">Tipe</TableHead>
                <TableHead className="text-[#1E1B18] font-bold text-sm h-12">
                  Harga Bulanan
                </TableHead>
                <TableHead className="text-[#1E1B18] font-bold text-sm h-12">Status</TableHead>
                <TableHead className="text-[#1E1B18] font-bold text-sm h-12 hidden md:table-cell">
                  Fasilitas
                </TableHead>
                <TableHead className="text-[#1E1B18] font-bold text-sm text-right pr-6 h-12">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow className="border-b border-[#2C2825]/8">
                  <TableCell
                    colSpan={7}
                    className="h-44 text-center text-[#4A453F]"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <p className="text-base font-bold text-[#1E1B18]">
                        Tidak ada kamar ditemukan
                      </p>
                      <p className="text-sm font-medium text-[#4A453F]">
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
                      className={`border-b border-[#2C2825]/8 hover:bg-[#F8F6F1]/70 transition-colors group relative ${
                        isSelected ? "bg-[#FAF2EA]" : ""
                      }`}
                    >
                      <TableCell className="w-12 text-center pl-4 py-4">
                        <div
                          onClick={() => handleSelectRow(room.id)}
                          className={`mx-auto flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-150 ${
                            isSelected
                              ? "bg-[#714A23] border-[#714A23] text-white"
                              : "border-[#2C2825]/30 bg-white text-transparent hover:border-[#714A23]"
                          }`}
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-base text-[#1E1B18] pl-2 relative py-4 sticky left-0 z-10 bg-white border-r border-[#2C2825]/10 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.05)] group-hover:bg-[#F8F6F1] transition-colors">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-[3px] bg-transparent transition-all duration-300 ${
                            isSelected ? "bg-[#714A23]" : "group-hover:bg-[#8C6239]"
                          }`}
                        />
                        {room.number}
                      </TableCell>
                      <TableCell className="text-[#1E1B18] py-4 font-bold text-sm">
                        {room.name}
                      </TableCell>
                      <TableCell className="text-[#1E1B18] py-4 font-semibold text-sm">
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
                              className="text-xs font-semibold border-[#2C2825]/15 text-[#4A453F] bg-[#F2EDE9] rounded-lg px-2.5 py-0.5"
                            >
                              {f}
                            </Badge>
                          ))}
                          {room.facilities.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs font-bold border-[#2C2825]/15 text-[#714A23] bg-[#FAF2EA] rounded-lg px-2 py-0.5"
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
                            className="h-8 w-8 text-[#4A453F] hover:text-[#1E1B18] hover:bg-[#F2EDE9] rounded-lg transition-all"
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
            <div className="bg-white border border-[#2C2825]/15 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF2EA] text-[#714A23]">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B18]">
                    {selectedIds.length} Kamar Terpilih
                  </h4>
                  <p className="text-xs font-medium text-[#4A453F]">
                    Pilih aksi status di samping untuk update massal.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Button
                  onClick={() => setSelectedIds([])}
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-[#4A453F] hover:text-[#1E1B18] rounded-xl hover:bg-[#F2EDE9]"
                  disabled={isPending}
                >
                  <X className="size-3.5 mr-1" />
                  Batal
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => handleBulkUpdateStatus("AVAILABLE")}
                    size="sm"
                    className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl"
                    disabled={isPending}
                  >
                    <Key className="size-3 mr-1" />
                    Tersedia
                  </Button>
                  <Button
                    onClick={() => handleBulkUpdateStatus("OCCUPIED")}
                    size="sm"
                    className="text-xs font-bold bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 rounded-xl"
                    disabled={isPending}
                  >
                    <Lock className="size-3 mr-1" />
                    Terisi
                  </Button>
                  <Button
                    onClick={() => handleBulkUpdateStatus("MAINTENANCE")}
                    size="sm"
                    className="text-xs font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-xl"
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
