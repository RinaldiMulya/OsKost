"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import {
  compressImage,
  CompressionOptions,
} from "@/lib/utils/image-compression";
import Image from "next/image";

interface ImageUploadCloudinaryProps {
  folder?: string;
  compressionOptions?: CompressionOptions;
  onUploadComplete: (url: string, publicId: string) => void;
  onError?: (error: Error) => void;
  label?: string;
  className?: string;
  defaultImageUrl?: string;
}

export function ImageUploadCloudinary({
  folder = "oskost/reports",
  compressionOptions,
  onUploadComplete,
  onError,
  label = "Unggah Gambar",
  className = "",
  defaultImageUrl = "",
}: ImageUploadCloudinaryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Preview lokal instan
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // 2. Kompresi gambar client-side (WebP, maks. 500KB)
      const compressedFile = await compressImage(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        initialQuality: 0.8,
        fileType: "image/webp",
        ...compressionOptions,
      });

      let secureUrl = "";
      let publicId = "";

      // 3. Request signature dari backend OsKost
      const signRes = await fetch("/api/v1/media/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      if (signRes.ok) {
        const signJson = await signRes.json();
        const { signature, timestamp, apiKey, uploadUrl, folder: targetFolder } = signJson.data;

        // 4. Upload langsung ke Cloudinary API
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", targetFolder);

        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          secureUrl = uploadJson.secure_url;
          publicId = uploadJson.public_id;
        }
      }

      // 5. Fallback: jika direct upload ke Cloudinary gagal, gunakan backend proxy
      if (!secureUrl) {
        const fallbackData = new FormData();
        fallbackData.append("file", compressedFile);
        fallbackData.append("folder", folder);

        const fallbackRes = await fetch("/api/v1/media/upload", {
          method: "POST",
          body: fallbackData,
        });

        if (!fallbackRes.ok) {
          const errData = await fallbackRes.json().catch(() => ({}));
          throw new Error(errData.error?.message || "Gagal mengunggah gambar");
        }

        const fallbackJson = await fallbackRes.json();
        secureUrl = fallbackJson.data.secureUrl;
        publicId = fallbackJson.data.publicId;
      }

      // 6. Callback ke parent component
      onUploadComplete(secureUrl, publicId);
      setPreviewUrl(secureUrl);
    } catch (error: any) {
      console.error("[IMAGE_UPLOAD_CLOUDINARY_ERROR]", error);
      if (onError) {
        onError(error);
      } else {
        alert(`Gagal mengunggah gambar: ${error.message || "Terjadi kesalahan"}`);
      }
      setPreviewUrl(defaultImageUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete("", "");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      {previewUrl ? (
        <div className="relative w-40 h-40 rounded-xl border border-zinc-700/50 overflow-hidden group shadow-sm bg-zinc-900">
          <Image
            src={previewUrl}
            alt="Preview Gambar"
            fill
            sizes="160px"
            className="object-cover"
            unoptimized={previewUrl.startsWith("blob:")}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-zinc-700/60 hover:border-amber-700/70 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-zinc-900/40 hover:bg-zinc-900/70 text-zinc-400 hover:text-zinc-200"
        >
          <div className="h-10 w-10 rounded-full bg-zinc-800/80 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            ) : (
              <Upload className="h-5 w-5 text-zinc-300" />
            )}
          </div>
          <div className="text-xs font-medium text-center">
            <span className="text-amber-500 font-semibold">Klik untuk memilih gambar</span>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Otomatis dikompresi ke WebP maks. 500KB (Cloudinary CDN)
            </p>
          </div>
        </div>
      )}

      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
