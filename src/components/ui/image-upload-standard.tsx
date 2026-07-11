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
        <div className="relative w-40 h-40 rounded-lg border overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="object-cover w-full h-full"
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-dashed flex flex-col gap-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Mengupload & Kompresi...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Klik untuk upload gambar
                </span>
              </>
            )}
          </Button>
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
