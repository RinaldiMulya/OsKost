"use client";

import { useActionState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Trash2, X } from "lucide-react";
import type { RoomForAdmin } from "../room-service";
import type { ActionResult } from "../actions";
import { ImageUploadCloudinary } from "@/components/ui/image-upload-cloudinary";
import { PanoramaUploadDropzone } from "@/components/admin/room/panorama-upload-dropzone";
import Image from "next/image";
import { useState } from "react";

interface RoomFormProps {
  room?: RoomForAdmin;
  action: (
    prevState: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
  userId: string; // Needed for panorama upload
}

interface PendingPanorama {
  title: string;
  description: string;
  imageUrl: string;
  storagePath: string;
  userId: string;
}

export function RoomForm({ room, action, submitLabel, userId }: RoomFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [images, setImages] = useState<string[]>(room?.images || []);
  const [pendingPanoramas, setPendingPanoramas] = useState<PendingPanorama[]>(
    [],
  );
  const [facilities, setFacilities] = useState<string[]>(
    room?.facilities || [],
  );
  const [facilityInput, setFacilityInput] = useState("");

  const formatRupiahInput = (value: string | number): string => {
    const numberString =
      typeof value === "number"
        ? value.toString()
        : value.replace(/[^0-9]/g, "");
    if (!numberString) return "";
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [rawPrice, setRawPrice] = useState<string>(
    room?.price?.toString() ?? "",
  );
  const [formattedPrice, setFormattedPrice] = useState<string>(
    room?.price ? formatRupiahInput(room.price) : "",
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const clean = val.replace(/[^0-9]/g, "");
    setRawPrice(clean);
    setFormattedPrice(formatRupiahInput(clean));
  };

  const handleStandardUpload = (url: string) => {
    if (url) {
      setImages([url]);
    }
  };

  const handlePanoramaUploadOnly = (metadata: PendingPanorama) => {
    setPendingPanoramas((prev) => [...prev, metadata]);
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removePendingPanorama = (indexToRemove: number) => {
    setPendingPanoramas((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  return (
    <form action={formAction}>
      {/* Hidden ID for edit mode */}
      {room && <input type="hidden" name="id" value={room.id} />}

      {state?.error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column — Basic Info */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="number">Nomor Kamar</Label>
                <Input
                  id="number"
                  name="number"
                  placeholder="Contoh : 001"
                  defaultValue={room?.number ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama / Tipe</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh : Standard A"
                  defaultValue={room?.name ?? ""}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price-display">Harga (Rp/bulan)</Label>
                <Input
                  id="price-display"
                  type="text"
                  placeholder="1.500.000"
                  value={formattedPrice}
                  onChange={handlePriceChange}
                  required
                />
                <input type="hidden" name="price" value={rawPrice} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  defaultValue={room?.status ?? "AVAILABLE"}
                >
                  <SelectTrigger id="status" className="rounded-xl w-1/2 bg-zinc-950/40 border-zinc-800 text-white">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white rounded-xl">
                    <SelectItem value="AVAILABLE" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Tersedia</SelectItem>
                    <SelectItem value="OCCUPIED" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Terisi</SelectItem>
                    <SelectItem value="MAINTENANCE" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 ">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Deskripsikan keunggulan kamar ini..."
                rows={4}
                defaultValue={room?.description ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column — Facilities & Media */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Fasilitas & Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facilities">Fasilitas</Label>

              <input
                type="hidden"
                name="facilities"
                value={facilities.join(",")}
              />

              {facilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 bg-zinc-800 text-zinc-100 px-3 py-1.5 rounded-full text-sm border border-zinc-700 transition-colors"
                    >
                      <span>{facility}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFacilities(
                            facilities.filter((_, i) => i !== index),
                          )
                        }
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Input
                id="facility-input"
                placeholder="Ketik fasilitas dan tekan Enter..."
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const value = facilityInput.trim();
                    // Cegah input ganda atau kosong
                    if (value && !facilities.includes(value)) {
                      setFacilities([...facilities, value]);
                    }
                    setFacilityInput("");
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              <Label>Gambar Standar (Thumbnail Halaman Utama)</Label>

              {/* Hidden input to submit images as comma-separated string */}
              <input type="hidden" name="images" value={images.join(",")} />

              {images.length > 0 ? (
                <div className="relative group rounded-md border border-zinc-800 overflow-hidden aspect-video max-w-md bg-black/50">
                  <Image
                    src={images[0]}
                    alt="Room thumbnail"
                    fill
                    className="object-cover opacity-80"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(0)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    title="Hapus gambar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <ImageUploadCloudinary
                  folder="oskost/rooms"
                  onUploadComplete={handleStandardUpload}
                  label="Upload Gambar Thumbnail"
                  compressionOptions={{
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1200,
                    initialQuality: 0.8,
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panorama 360 Section - Only shown when editing */}
      <div className="mt-6">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Gambar 360° Panorama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Hidden input for deferred panorama metadata (Create Mode) */}
              {!room?.id && (
                <input
                  type="hidden"
                  name="panoramaMetadata"
                  value={JSON.stringify(pendingPanoramas)}
                />
              )}

              {/* List of existing panoramas (Edit mode) or pending ones (Create mode) */}
              <div className="space-y-3">
                <Label>
                  {room?.id
                    ? "Gambar 360° Tersimpan"
                    : "Gambar 360° Akan Diupload"}
                </Label>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Existing Panoramas */}
                  {room?.panoramaImages?.map((pano) => (
                    <div
                      key={pano.id}
                      className="p-4 border rounded-lg bg-black/20 flex flex-col gap-2 relative group"
                    >
                      <span className="font-medium text-sm text-white">
                        {pano.title}
                      </span>
                      <a
                        href={pano.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Lihat Gambar
                      </a>
                    </div>
                  ))}

                  {/* Pending Panoramas (Create mode) */}
                  {pendingPanoramas.map((pano, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col gap-2 relative group"
                    >
                      <span className="font-medium text-sm text-white">
                        {pano.title} (Baru)
                      </span>
                      <div className="flex justify-between items-center">
                        <a
                          href={pano.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-400 hover:underline"
                        >
                          Preview
                        </a>
                        <button
                          type="button"
                          onClick={() => removePendingPanorama(idx)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}

                  {!room?.panoramaImages?.length &&
                    !pendingPanoramas.length && (
                      <div className="col-span-full p-8 border border-dashed rounded-lg text-center text-muted-foreground bg-muted/20">
                        Belum ada gambar 360°. Gunakan dropzone di bawah untuk
                        menambahkan.
                      </div>
                    )}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <Label className="mb-4 block">Upload Gambar 360° Baru</Label>
                <PanoramaUploadDropzone
                  roomId={room?.id || ""}
                  userId={userId}
                  onUploadOnly={handlePanoramaUploadOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
