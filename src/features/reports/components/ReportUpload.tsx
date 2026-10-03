"use client";

import { ImageUploadCloudinary } from "@/components/ui/image-upload-cloudinary";

interface ReportUploadProps {
  onUploadComplete: (url: string, storagePath: string) => void;
  userId: string; // Folder prefix
}

export function ReportUpload({ onUploadComplete, userId }: ReportUploadProps) {
  return (
    <ImageUploadCloudinary
      folder={`oskost/reports/${userId}`}
      onUploadComplete={(url, publicId) => onUploadComplete(url, publicId)}
      label=""
      className="w-full"
    />
  );
}