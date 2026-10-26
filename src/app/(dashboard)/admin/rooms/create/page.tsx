import Link from "next/link";
import { ArrowLeft, ChevronRight, Home, PlusCircle, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/features/rooms/components/room-form";
import { createRoomAction } from "@/features/rooms/actions";
import { checkRoomQuota } from "@/features/rooms/room-service";
import { auth } from "@/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tambah Kamar Baru | Admin OsKost",
};

export default async function CreateRoomPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "unknown";
  const quota = await checkRoomQuota();

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
          href="/admin/rooms"
          className="hover:text-[#1E1B18] transition-colors"
        >
          Manajemen Kamar
        </Link>
        <ChevronRight className="size-3.5 text-[#2C2825]/20" />
        <span className="font-semibold text-[#1E1B18]">Tambah Kamar Baru</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2C2825]/10">
        <div className="flex items-start sm:items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-11 w-11 shrink-0 rounded-xl border-[#2C2825]/15 bg-white text-[#4A453F] hover:text-[#1E1B18] hover:bg-[#F4EDE4] shadow-xs transition-colors"
          >
            <Link href="/admin/rooms" title="Kembali ke Daftar Kamar">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B18] tracking-tight">
              Tambah Kamar Baru
            </h1>
            <p className="text-sm sm:text-base text-[#4A453F]">
              Masukkan detail unit, harga sewa, fasilitas, serta foto untuk
              menambahkan kamar ke properti Anda.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#714A23] bg-[#FAF2EA] px-3.5 py-2 rounded-xl border border-[#714A23]/20">
          <PlusCircle className="size-4" />
          <span>Unit Baru</span>
        </div>
      </div>

      {/* Quota Exceeded Alert Banner */}
      {!quota.allowed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#1E1B18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-sm sm:text-base text-amber-900">
                Batas Kuota Paket Tercapai ({quota.currentRooms}/{quota.maxRooms} Kamar)
              </h2>
              <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5">
                Properti Anda berada pada paket <b>{quota.planTier}</b>. Untuk menambah unit kamar baru, silakan lakukan upgrade paket langganan SaaS.
              </p>
            </div>
          </div>
          <Button asChild className="bg-[#714A23] hover:bg-[#5A3B1C] text-white shrink-0 rounded-xl gap-2 font-bold shadow-xs">
            <Link href="/admin/settings">
              <Zap className="size-4" />
              Upgrade Paket
            </Link>
          </Button>
        </div>
      )}

      {/* Main Room Form */}
      <RoomForm
        action={createRoomAction}
        submitLabel="Simpan & Tambah Kamar"
        userId={userId}
      />
    </div>
  );
}
