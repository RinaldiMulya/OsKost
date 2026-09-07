"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, X, CheckCircle } from "lucide-react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { uploadImageToSupabase } from "@/lib/supabase/storage-client";
import { addPanoramaAction } from "@/features/rooms/actions";
import { compressImage } from "@/lib/utils/image-compression";
import { useRouter } from "next/navigation";

interface PanoramaUploadDropzoneProps {
  roomId?: string;
  userId: string; // The admin's ID performing the upload
  onSuccess?: () => void;
  onUploadOnly?: (metadata: {
    title: string;
    description: string;
    imageUrl: string;
    storagePath: string;
    userId: string;
  }) => void;
}

type UploadState = "IDLE" | "PREVIEW" | "UPLOADING" | "SUCCESS" | "ERROR";

export function PanoramaUploadDropzone({
  roomId,
  userId,
  onSuccess,
  onUploadOnly,
}: PanoramaUploadDropzoneProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("IDLE");
  const [errorMessage, setErrorMessage] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    // Max 50MB check is also handled by dropzone config, but double check
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File terlalu besar. Maksimal 10MB.");
      return;
    }

    setFile(selectedFile);
    // Generate local preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setUploadState("PREVIEW");
    setErrorMessage("");

    // Default title to filename without extension
    setTitle(selectedFile.name.split(".").slice(0, -1).join("."));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleCancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setUploadState("IDLE");
    setErrorMessage("");
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setErrorMessage("Judul gambar wajib diisi.");
      return;
    }

    try {
      setUploadState("UPLOADING");

      // Compress 360 panorama image client-side to webp (high quality)
      const compressedFile = await compressImage(file, {
        maxSizeMB: 3,
        maxWidthOrHeight: 4096,
        fileType: "image/webp",
      });

      // 1. Upload file fisik ke Supabase Storage (Oskost-Data-Public)
      const folderPath = `panoramas/${userId}`;
      const { imageUrl, storagePath } = await uploadImageToSupabase(
        compressedFile,
        "Oskost-Data-Public",
        folderPath,
      );

      // 2. Simpan metadata (Langsung atau Deferred)
      const metadata = {
        title,
        description,
        imageUrl,
        storagePath,
        userId,
      };

      if (roomId) {
        await addPanoramaAction({
          roomId,
          ...metadata,
        });
      } else if (onUploadOnly) {
        onUploadOnly(metadata);
      }

      setUploadState("SUCCESS");

      // Clean up object URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      // Refresh UI
      router.refresh();

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage(`Gagal mengupload: ${error.message}`);
      setUploadState("ERROR");
    }
  };

  if (uploadState === "SUCCESS") {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-green-50/50">
        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-green-900">Upload Berhasil!</h3>
        <p className="text-green-700 mb-6">
          Gambar 360 telah ditambahkan ke kamar ini.
        </p>
        <Button onClick={handleCancel} variant="outline">
          Upload Gambar Lainnya
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DROPZONE AREA (Hanya tampil jika belum ada file) */}
      {uploadState === "IDLE" || uploadState === "ERROR" ? (
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-muted rounded-full">
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  Drag & drop gambar 360° di sini
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  atau klik untuk memilih file (JPG/PNG, max 50MB)
                </p>
              </div>
            </div>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </div>
      ) : null}

      {/* PREVIEW & FORM AREA */}
      {(uploadState === "PREVIEW" || uploadState === "UPLOADING") &&
        previewUrl && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-xl p-6 bg-card">
            {/* Interaktif 360 Preview */}
            <div className="space-y-2">
              <Label>Preview Interaktif 360°</Label>
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-black relative">
                <ReactPhotoSphereViewer
                  src={previewUrl}
                  height={"100%"}
                  width={"100%"}
                  littlePlanet={false}
                />
                {/* Overlay saat upload */}
                {uploadState === "UPLOADING" && (
                  <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium">
                      Mengupload Gambar (max 50MB)...
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Geser gambar untuk melihat preview 360 derajat.
              </p>
            </div>

            {/* Metadata Form */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Detail Gambar</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={uploadState === "UPLOADING"}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Judul Gambar <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Tampilan Tengah Kamar"
                    disabled={uploadState === "UPLOADING"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi (Opsional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi singkat mengenai sudut gambar ini..."
                    rows={4}
                    disabled={uploadState === "UPLOADING"}
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={uploadState === "UPLOADING"}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleUpload}
                  disabled={uploadState === "UPLOADING" || !title.trim()}
                >
                  {uploadState === "UPLOADING" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Upload...
                    </>
                  ) : (
                    "Simpan Gambar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
