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
import { uploadImageToSupabase } from "@/lib/supabase/storage-client";
import Image from "next/image";

interface ImageUploadStandardProps {
  bucket?: string;
  folderPath: string;
  compressionOptions?: CompressionOptions;
  onUploadComplete: (url: string, storagePath: string) => void;
  onError?: (error: Error) => void;
  label?: string;
  className?: string;
  defaultImageUrl?: string;
}

export function ImageUploadStandard({
  bucket = "Oskost-Data-Private",
  folderPath,
  compressionOptions,
  onUploadComplete,
  onError,
  label = "Upload Image",
  className = "",
  defaultImageUrl = "",
}: ImageUploadStandardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultImageUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Generate local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // 2. Compress image
      const compressedFile = await compressImage(file, compressionOptions);

      // 3. Upload to Supabase Storage
      const { imageUrl, storagePath } = await uploadImageToSupabase(
        compressedFile,
        bucket,
        folderPath,
      );

      // 4. Update parent component
      onUploadComplete(imageUrl, storagePath);
      setPreviewUrl(imageUrl); // Switch to remote URL once done
    } catch (error: any) {
      console.error("Upload error:", error);
      if (onError) {
        onError(error);
      } else {
        alert(`Gagal mengupload gambar: ${error.message}`);
      }
      setPreviewUrl(defaultImageUrl || null); // Revert on error
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete("", ""); // Send empty string to indicate removal
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>{label}</Label>

      {previewUrl ? (
        <div className="relative w-44 h-44 rounded-2xl border border-[#2C2825]/15 overflow-hidden group shadow-xs bg-[#FAF8F5]">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          {!isUploading && (
            <div className="absolute inset-0 bg-[#1E1B18]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="h-9 w-9 rounded-full shadow-sm hover:scale-105 transition-transform"
                title="Hapus gambar"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-[#1E1B18]/70 flex items-center justify-center backdrop-blur-xs">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-[#2C2825]/20 hover:border-[#714A23] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-[#FAF8F5] hover:bg-[#F4EDE4]/50 text-[#4A453F] group"
        >
          <div className="h-10 w-10 rounded-full bg-white border border-[#2C2825]/10 shadow-2xs flex items-center justify-center group-hover:scale-105 group-hover:border-[#714A23]/30 transition-transform">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#714A23]" />
            ) : (
              <Upload className="h-5 w-5 text-[#714A23]" />
            )}
          </div>
          <div className="text-xs font-medium text-center">
            <span className="text-[#714A23] font-bold block text-sm mb-0.5">
              Klik untuk upload foto KTP
            </span>
            <p className="text-[#7A7A7A] text-[11px]">
              Format JPG, PNG, atau WebP (Disimpan di server privat terenkripsi)
            </p>
          </div>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
