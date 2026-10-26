"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  BedDouble,
  Home,
  Tag,
  Banknote,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  X,
  ExternalLink,
  Save,
  Loader2,
  AlertCircle,
  Eye,
  Camera,
  Compass,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RoomForAdmin } from "../room-service";
import type { ActionResult } from "../actions";
import { deletePanoramaAction } from "../actions";
import { ImageUploadCloudinary } from "@/components/ui/image-upload-cloudinary";
import { PanoramaUploadDropzone } from "@/components/admin/room/panorama-upload-dropzone";

// Dynamically import 360 viewer for the preview modal to keep bundle lightweight
const ReactPhotoSphereViewer = dynamic(
  () =>
    import("react-photo-sphere-viewer").then(
      (mod) => mod.ReactPhotoSphereViewer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video rounded-xl bg-[#1E1B18] flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#A45A3D]" />
        <span className="text-xs text-white/70">Memuat penampil 360°...</span>
      </div>
    ),
  }
);

interface RoomFormProps {
  room?: RoomForAdmin;
  action: (
    prevState: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  submitLabel: string;
  userId: string;
}

interface PendingPanorama {
  title: string;
  description: string;
  imageUrl: string;
  storagePath: string;
  userId: string;
}

const PRESET_FACILITIES = [
  "AC",
  "WiFi Cepat",
  "Kamar Mandi Dalam",
  "Kloset Duduk",
  "Kasur Springbed",
  "Lemari Pakaian",
  "Meja & Kursi Kerja",
  "Water Heater",
  "Jendela Luar",
  "Listrik Token",
  "Dapur Bersama",
  "Balkon",
];

export function RoomForm({ room, action, submitLabel, userId }: RoomFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  // Form states
  const [images, setImages] = useState<string[]>(room?.images || []);
  const [facilities, setFacilities] = useState<string[]>(
    room?.facilities || []
  );
  const [facilityInput, setFacilityInput] = useState("");
  const [existingPanoramas, setExistingPanoramas] = useState(
    room?.panoramaImages || []
  );
  const [pendingPanoramas, setPendingPanoramas] = useState<PendingPanorama[]>(
    []
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    room?.status ?? "AVAILABLE"
  );

  // Panorama preview modal state
  const [activePreviewPano, setActivePreviewPano] = useState<{
    title: string;
    imageUrl: string;
  } | null>(null);

  // Async state for deleting existing 360
  const [deletingPanoId, setDeletingPanoId] = useState<string | null>(null);

  // Rupiah formatting helper
  const formatRupiahInput = (value: string | number): string => {
    const numberString =
      typeof value === "number"
        ? value.toString()
        : value.replace(/[^0-9]/g, "");
    if (!numberString) return "";
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [rawPrice, setRawPrice] = useState<string>(
    room?.price?.toString() ?? ""
  );
  const [formattedPrice, setFormattedPrice] = useState<string>(
    room?.price ? formatRupiahInput(room.price) : ""
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const clean = val.replace(/[^0-9]/g, "");
    setRawPrice(clean);
    setFormattedPrice(formatRupiahInput(clean));
  };

  const setQuickPrice = (amount: number) => {
    const str = amount.toString();
    setRawPrice(str);
    setFormattedPrice(formatRupiahInput(str));
  };

  const handleStandardUpload = (url: string) => {
    if (url) {
      setImages([url]);
    }
  };

  const handlePanoramaUploadOnly = (metadata: PendingPanorama) => {
    setPendingPanoramas((prev) => [...prev, metadata]);
  };

  const removeImage = () => {
    setImages([]);
  };

  const removePendingPanorama = (indexToRemove: number) => {
    setPendingPanoramas((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleDeleteExistingPanorama = async (panoId: string) => {
    if (!room?.id) return;
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus foto 360° ini dari data kamar?"
      )
    ) {
      return;
    }

    try {
      setDeletingPanoId(panoId);
      await deletePanoramaAction(panoId, room.id);
      setExistingPanoramas((prev) => prev.filter((p) => p.id !== panoId));
      router.refresh();
    } catch (err: any) {
      alert(
        "Gagal menghapus panorama: " + (err?.message || "Terjadi kesalahan")
      );
    } finally {
      setDeletingPanoId(null);
    }
  };

  const toggleFacility = (facilityName: string) => {
    const trimmed = facilityName.trim();
    if (!trimmed) return;

    if (facilities.includes(trimmed)) {
      setFacilities((prev) => prev.filter((f) => f !== trimmed));
    } else {
      setFacilities((prev) => [...prev, trimmed]);
    }
  };

  const handleAddCustomFacility = () => {
    const trimmed = facilityInput.trim();
    if (trimmed && !facilities.includes(trimmed)) {
      setFacilities((prev) => [...prev, trimmed]);
      setFacilityInput("");
    }
  };

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden input for Room ID in Edit Mode */}
      {room && <input type="hidden" name="id" value={room.id} />}

      {/* Hidden inputs for arrays & formatted values */}
      <input type="hidden" name="price" value={rawPrice} />
      <input type="hidden" name="facilities" value={facilities.join(",")} />
      <input type="hidden" name="images" value={images.join(",")} />
      <input type="hidden" name="status" value={selectedStatus} />

      {/* Hidden input for deferred panorama metadata (Create Mode) */}
      {!room?.id && (
        <input
          type="hidden"
          name="panoramaMetadata"
          value={JSON.stringify(pendingPanoramas)}
        />
      )}

      {/* Error Banner */}
      {state?.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 text-sm text-red-800 flex items-start gap-3 shadow-xs animate-in fade-in-50 duration-200">
          <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-900">Perhatian</div>
            <div className="mt-0.5">{state.error}</div>
          </div>
        </div>
      )}

      {/* Grid: 2 Columns for Sections */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Basic Info & Facilities (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Card 1: Identitas & Informasi Kamar */}
          <div className="bg-white border border-[#2C2825]/10 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-[#FAF8F5] border-b border-[#2C2825]/8 px-6 py-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#2C2825]/10 text-[#714A23] shadow-2xs">
                <Home className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E1B18]">
                  Identitas & Detail Kamar
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Nomor unit, tipe, status ketersediaan, dan deskripsi kamar.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Row: Nomor Kamar & Nama/Tipe */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="number"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    Nomor Kamar <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="number"
                      name="number"
                      placeholder="Contoh: 001"
                      defaultValue={room?.number ?? ""}
                      required
                      className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-semibold pl-4 pr-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-[#7A7A7A]">
                    Harus unik di properti ini (misal: 001, 101, VIP-1).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    Nama / Tipe Kamar <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Contoh: Standard A / Deluxe Suite"
                    defaultValue={room?.name ?? ""}
                    required
                    className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium pl-4 pr-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                  />
                  <p className="text-[11px] text-[#7A7A7A]">
                    Label yang akan ditampilkan pada calon penyewa.
                  </p>
                </div>
              </div>

              {/* Row: Tarif Sewa & Status */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Tarif Sewa */}
                <div className="space-y-2">
                  <Label
                    htmlFor="price-display"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    Harga Sewa Bulanan <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 px-2 py-0.5 rounded-lg bg-[#FAF2EA] text-[#714A23] font-bold text-xs pointer-events-none border border-[#714A23]/20">
                      Rp
                    </div>
                    <Input
                      id="price-display"
                      type="text"
                      placeholder="1.500.000"
                      value={formattedPrice}
                      onChange={handlePriceChange}
                      required
                      className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-bold pl-14 pr-16 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs text-base"
                    />
                    <div className="absolute right-3 text-xs text-[#7A7A7A] font-medium pointer-events-none">
                      / bln
                    </div>
                  </div>

                  {/* Quick Price Helper Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[1200000, 1500000, 1800000, 2000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuickPrice(amt)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
                          rawPrice === amt.toString()
                            ? "bg-[#714A23] text-white border-[#714A23]"
                            : "bg-[#FAF8F5] text-[#4A453F] border-[#2C2825]/10 hover:border-[#714A23]/40"
                        }`}
                      >
                        {(amt / 1000000).toFixed(1).replace(".0", "")} jt
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Kamar */}
                <div className="space-y-2">
                  <Label
                    htmlFor="status-select"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                  >
                    Status Ketersediaan
                  </Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(val) => setSelectedStatus(val)}
                  >
                    <SelectTrigger
                      id="status-select"
                      className="h-11 w-full rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium px-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                    >
                      <SelectValue placeholder="Pilih status kamar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#2C2825]/15 text-[#1E1B18] rounded-xl shadow-md p-1">
                      <SelectItem
                        value="AVAILABLE"
                        className="rounded-lg cursor-pointer py-2 focus:bg-[#F4EDE4]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          <span className="font-semibold text-emerald-800">
                            Tersedia
                          </span>
                          <span className="text-xs text-[#7A7A7A]">
                            (Siap disewakan)
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="OCCUPIED"
                        className="rounded-lg cursor-pointer py-2 focus:bg-[#F4EDE4]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500" />
                          <span className="font-semibold text-blue-800">
                            Terisi
                          </span>
                          <span className="text-xs text-[#7A7A7A]">
                            (Sedang dihuni tenant)
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="MAINTENANCE"
                        className="rounded-lg cursor-pointer py-2 focus:bg-[#F4EDE4]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-amber-500" />
                          <span className="font-semibold text-amber-800">
                            Dalam Perbaikan
                          </span>
                          <span className="text-xs text-[#7A7A7A]">
                            (Renovasi / service)
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-[#7A7A7A]">
                    Hanya unit &quot;Tersedia&quot; yang muncul di halaman booking.
                  </p>
                </div>
              </div>

              {/* Deskripsi Kamar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="description"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                  >
                    Deskripsi & Catatan Kamar
                  </Label>
                  <span className="text-[11px] text-[#7A7A7A]">Opsional</span>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ceritakan kelebihan kamar ini (misal: menghadap ke taman, pencahayaan alami melimpah, baru dicat ulang, sirkulasi udara sejuk)..."
                  rows={4}
                  defaultValue={room?.description ?? ""}
                  className="rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] p-3.5 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs resize-y text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Fasilitas Kamar */}
          <div className="bg-white border border-[#2C2825]/10 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-[#FAF8F5] border-b border-[#2C2825]/8 px-6 py-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#2C2825]/10 text-[#714A23] shadow-2xs">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E1B18]">
                  Fasilitas Kamar
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Pilih fasilitas bawaan kamar atau tambahkan item khusus.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Preset Quick Chips */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-[#7A7A7A] uppercase tracking-wider">
                  Pilihan Cepat Fasilitas Populer (Klik untuk tambah / hapus)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_FACILITIES.map((preset) => {
                    const isSelected = facilities.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => toggleFacility(preset)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-[#2C4C3B] text-white shadow-2xs scale-102 font-semibold"
                            : "bg-[#FAF8F5] text-[#4A453F] border border-[#2C2825]/15 hover:border-[#714A23]/40 hover:bg-[#F4EDE4]"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="size-3.5 stroke-[2.5]" />
                        ) : (
                          <Plus className="size-3.5 text-[#7A7A7A]" />
                        )}
                        <span>{preset}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Facilities Chips */}
              <div className="space-y-2 pt-2 border-t border-[#2C2825]/8">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                    Fasilitas Terpasang ({facilities.length})
                  </Label>
                  {facilities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFacilities([])}
                      className="text-xs text-[#A45A3D] hover:underline font-semibold"
                    >
                      Reset Semua
                    </button>
                  )}
                </div>

                {facilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#2C2825]/10 min-h-[50px] items-center">
                    {facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1.5 bg-[#FAF2EA] text-[#714A23] border border-[#714A23]/25 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs transition-all animate-in fade-in-50 duration-150"
                      >
                        <span>{facility}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFacilities(
                              facilities.filter((_, i) => i !== index)
                            )
                          }
                          className="hover:bg-[#714A23]/15 rounded-full p-0.5 text-[#714A23] transition-colors"
                          title={`Hapus ${facility}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-[#2C2825]/20 text-center text-xs text-[#7A7A7A] bg-[#FAF8F5]">
                    Belum ada fasilitas yang dipilih. Klik opsi di atas atau
                    ketik fasilitas baru di bawah.
                  </div>
                )}
              </div>

              {/* Custom Facility Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="facility-input"
                  className="text-xs font-bold text-[#7A7A7A] uppercase tracking-wider"
                >
                  Tambah Fasilitas Kustom
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="facility-input"
                    placeholder="Contoh: Kulkas Mini, Meja Rias, Smart Door Lock..."
                    value={facilityInput}
                    onChange={(e) => setFacilityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddCustomFacility();
                      }
                    }}
                    className="h-10 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] text-sm focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomFacility}
                    disabled={!facilityInput.trim()}
                    className="h-10 px-4 rounded-xl bg-[#FAF2EA] text-[#714A23] hover:bg-[#F4EDE4] border border-[#714A23]/25 font-bold text-xs gap-1.5 shrink-0 transition-colors"
                  >
                    <Plus className="size-4" />
                    Tambah
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Media & 360 Panorama (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Card 3: Foto Standar Thumbnail */}
          <div className="bg-white border border-[#2C2825]/10 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-[#FAF8F5] border-b border-[#2C2825]/8 px-6 py-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#2C2825]/10 text-[#714A23] shadow-2xs">
                <Camera className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E1B18]">
                  Foto Utama (Thumbnail)
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Ditampilkan di daftar kamar dan halaman depan.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4">
              {images.length > 0 && images[0] ? (
                <div className="space-y-3">
                  <div className="relative group rounded-2xl border border-[#2C2825]/15 overflow-hidden aspect-video bg-[#1E1B18]/5 shadow-xs">
                    <Image
                      src={images[0]}
                      alt="Thumbnail Kamar"
                      fill
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-[#1E1B18]/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                      Thumbnail Aktif
                    </div>
                    <div className="absolute inset-0 bg-[#1E1B18]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="rounded-xl gap-1.5 shadow-sm font-semibold"
                      >
                        <Trash2 className="size-3.5" />
                        Hapus Foto
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7A7A7A] px-1">
                    <span>Format: WebP / JPG Cloudinary</span>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Ganti Foto Lain
                    </button>
                  </div>
                </div>
              ) : (
                <ImageUploadCloudinary
                  folder="oskost/rooms"
                  onUploadComplete={handleStandardUpload}
                  label="Pilih Foto Thumbnail Kamar"
                  compressionOptions={{
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1400,
                    initialQuality: 0.85,
                  }}
                />
              )}
            </div>
          </div>

          {/* Card 4: Tur Virtual 360° Panorama */}
          <div className="bg-white border border-[#2C2825]/10 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-[#FAF8F5] border-b border-[#2C2825]/8 px-6 py-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#2C2825]/10 text-[#714A23] shadow-2xs">
                <Compass className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E1B18]">
                  Tur Virtual 360° Panorama
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Pengalaman tur interaktif bagi calon penyewa.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Existing / Pending 360 Panoramas */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider block">
                  Foto 360° Tersedia (
                  {existingPanoramas.length + pendingPanoramas.length})
                </Label>

                {/* List of Existing Panoramas */}
                {existingPanoramas.length > 0 && (
                  <div className="space-y-2.5">
                    {existingPanoramas.map((pano) => (
                      <div
                        key={pano.id}
                        className="p-3.5 border border-[#2C2825]/10 rounded-2xl bg-[#FAF8F5] hover:bg-white hover:border-[#714A23]/30 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-xl bg-[#FAF2EA] text-[#714A23] border border-[#714A23]/20 flex items-center justify-center shrink-0">
                            <Compass className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#1E1B18] truncate">
                              {pano.title}
                            </h4>
                            <p className="text-[11px] text-[#7A7A7A] truncate">
                              {pano.description || "Tampilan sudut 360 derajat"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActivePreviewPano({
                                title: pano.title,
                                imageUrl: pano.imageUrl,
                              })
                            }
                            className="h-8 px-2.5 text-xs text-[#714A23] hover:bg-[#FAF2EA] rounded-lg gap-1 font-semibold"
                            title="Preview 360 interaktif"
                          >
                            <Eye className="size-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={deletingPanoId === pano.id}
                            onClick={() =>
                              handleDeleteExistingPanorama(pano.id)
                            }
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Hapus gambar 360"
                          >
                            {deletingPanoId === pano.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List of Pending Panoramas (Create mode) */}
                {pendingPanoramas.length > 0 && (
                  <div className="space-y-2.5">
                    {pendingPanoramas.map((pano, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 border border-[#2C4C3B]/20 rounded-2xl bg-[#C7EBD4]/20 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-9 rounded-xl bg-[#2C4C3B] text-white flex items-center justify-center shrink-0">
                            <Check className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#2C4C3B] block">
                              Siap Disimpan
                            </span>
                            <h4 className="text-sm font-semibold text-[#1E1B18] truncate">
                              {pano.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActivePreviewPano({
                                title: pano.title,
                                imageUrl: pano.imageUrl,
                              })
                            }
                            className="h-8 px-2 text-xs text-[#2C4C3B] hover:bg-white rounded-lg"
                          >
                            Preview
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePendingPanorama(idx)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {existingPanoramas.length === 0 &&
                  pendingPanoramas.length === 0 && (
                    <div className="p-6 rounded-2xl border border-dashed border-[#2C2825]/15 text-center bg-[#FAF8F5]">
                      <Compass className="size-8 text-[#7A7A7A]/50 mx-auto mb-2" />
                      <p className="text-xs text-[#7A7A7A] max-w-xs mx-auto">
                        Belum ada gambar 360°. Upload foto panorama di bawah
                        untuk menghadirkan tur virtual kamar.
                      </p>
                    </div>
                  )}
              </div>

              {/* Upload Dropzone */}
              <div className="pt-4 border-t border-[#2C2825]/8">
                <Label className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider mb-3 block">
                  Unggah Foto 360° Baru
                </Label>
                <PanoramaUploadDropzone
                  roomId={room?.id || ""}
                  userId={userId}
                  onUploadOnly={handlePanoramaUploadOnly}
                  onSuccess={() => {
                    router.refresh();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md border border-[#2C2825]/15 rounded-2xl p-4 sm:px-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-[#4A453F]">
          <div className="size-2 rounded-full bg-[#714A23] animate-pulse" />
          <span>
            {room
              ? `Mengedit Kamar ${room.number} (${room.name})`
              : "Menambahkan unit kamar baru ke properti"}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            asChild
            className="flex-1 sm:flex-none rounded-xl border-[#2C2825]/15 text-[#4A453F] hover:bg-[#F4EDE4] font-semibold h-11 px-5"
          >
            <Link href="/admin/rooms">Batal</Link>
          </Button>

          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none rounded-xl bg-[#714A23] hover:bg-[#5C3B1A] text-white font-bold h-11 px-7 shadow-xs hover:shadow-sm transition-all gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>{submitLabel}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Interactive 360 Panorama Modal Preview */}
      <Dialog
        open={!!activePreviewPano}
        onOpenChange={(open) => !open && setActivePreviewPano(null)}
      >
        <DialogContent className="max-w-4xl bg-white border-[#2C2825]/15 rounded-2xl p-6 sm:p-7 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1E1B18] flex items-center gap-2">
              <Compass className="size-5 text-[#714A23]" />
              <span>Preview 360°: {activePreviewPano?.title}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {activePreviewPano?.imageUrl && (
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner relative">
                <ReactPhotoSphereViewer
                  src={activePreviewPano.imageUrl}
                  height={"100%"}
                  width={"100%"}
                  littlePlanet={false}
                />
              </div>
            )}
            <p className="text-xs text-[#7A7A7A] text-center mt-3">
              Klik dan seret (drag) menggunakan mouse/layar sentuh untuk
              menjelajahi sudut ruangan 360°.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
