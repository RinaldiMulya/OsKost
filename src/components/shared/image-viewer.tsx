"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
}

export function ImageViewer({ src, alt = "Image", className, imageClassName }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={cn("relative group cursor-pointer overflow-hidden rounded-md", className)}>
          <Image
            src={src}
            alt={alt}
            fill
            className={cn("object-cover transition-transform duration-300 group-hover:scale-105", imageClassName)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md h-6 w-6" />
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] h-auto p-0 border-none bg-transparent shadow-none overflow-hidden flex flex-col justify-center">
        {/* Title and Description are required by accessibility guidelines */}
        <DialogTitle className="sr-only">Tampilan Penuh Gambar</DialogTitle>
        <DialogDescription className="sr-only">
          Tampilan detail dari gambar {alt}
        </DialogDescription>
        
        <div className="relative w-full h-[85vh] flex items-center justify-center">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            quality={100}
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
