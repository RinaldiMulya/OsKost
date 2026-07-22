"use client";

import { useState } from "react";
import { ImageUploadStandard } from "@/components/ui/image-upload-standard";

interface ReportUploadProps {
  onUploadComplete: (url: string, storagePath: string) => void;
  userId: string; // For folder path, e.g., reports/{userId}
}

export function ReportUpload({ onUploadComplete, userId }: ReportUploadProps) {
  return (
    <ImageUploadStandard
      bucket="Oskost-Data-Public"
      folderPath={`reports/${userId}`}
      onUploadComplete={onUploadComplete}
      label=""
      className="w-full"
    />
  );
}