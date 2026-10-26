import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  ChevronRight,
  Home,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/features/rooms/components/room-form";
import { updateRoomAction } from "@/features/rooms/actions";
import { getRoomById } from "@/features/rooms/room-service";
import type { RoomForAdmin } from "@/features/rooms/room-service";
import { auth } from "@/auth";
import type { Metadata } from "next";

interface EditRoomPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditRoomPageProps): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoomById(id);
  return {
    title: room
      ? `Edit Kamar ${room.number} | Admin OsKost`
      : "Kamar Tidak Ditemukan | Admin OsKost",
  };
}

const statusBadgeConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  AVAILABLE: {
    label: "Tersedia",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  OCCUPIED: {
    label: "Terisi",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  MAINTENANCE: {
    label: "Dalam Perbaikan",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
};

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = await params;
  const room = await getRoomById(id);
  const session = await auth();
  const userId = session?.user?.id ?? "unknown";

  if (!room) {
    notFound();
  }

  // Cast RoomDetail to RoomForAdmin
  const roomForForm: RoomForAdmin = {
    ...room,
    propertyId: room.propertyId || "",
  };

  const statusMeta =
    statusBadgeConfig[room.status] || statusBadgeConfig.AVAILABLE;

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
        <span className="font-semibold text-[#1E1B18]">
          Edit Kamar {room.number}
        </span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#2C2825]/10">
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
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B18] tracking-tight">
                Edit Kamar {room.number}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
              >
                <span className={`size-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Room Specs Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-[#2C2825]/10 shadow-xs">
          <div className="p-2 rounded-xl bg-[#FAF2EA] text-[#714A23]">
            <BedDouble className="size-5" />
          </div>
          <div className="text-right">
            <div className="text-xs text-[#7A7A7A] font-medium">Tipe Kamar</div>
            <div className="text-sm font-bold text-[#1E1B18]">
              {room.name || "Standard Unit"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Room Form */}
      <RoomForm
        room={roomForForm}
        action={updateRoomAction}
        submitLabel="Simpan Perubahan"
        userId={userId}
      />
    </div>
  );
}
