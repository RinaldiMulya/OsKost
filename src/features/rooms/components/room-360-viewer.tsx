"use client";

import React, { useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { Loader2 } from "lucide-react";

interface Room360ViewerProps {
    imageUrl?: string;
}

export function Room360Viewer({ imageUrl }: Room360ViewerProps) {
    const [isLoading, setIsLoading] = useState(true);

    if (!imageUrl) {
        return (
            <div className="w-full h-full min-h-[360px] flex items-center justify-center bg-[#FAF2EA] rounded-2xl border border-[#2C2825]/8">
                <p className="text-[#757069] text-xs font-medium">Citra panorama 360° belum tersedia untuk unit ini.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1E1B18] group">
            {/* Loading state handled by the library and our overlay */}
            <div className="w-full h-full">
                <ReactPhotoSphereViewer
                    src={imageUrl}
                    height={"100%"}
                    width={"100%"}
                    onReady={() => setIsLoading(false)}
                    littlePlanet={false}
                    containerClass="rounded-2xl"
                />
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E1B18] z-10">
                    <Loader2 className="w-8 h-8 text-[#A45A3D] animate-spin mb-3" />
                    <p className="text-xs text-[#EFE7DE] uppercase tracking-widest font-semibold">
                        Memuat Pengalaman 360°...
                    </p>
                </div>
            )}

            {/* Hint Overlay (fades out on interaction) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/80 text-[10px] tracking-widest uppercase pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-500 font-medium">
                Klik &amp; Geser untuk Melihat Sekeliling
            </div>

            {/* Corner Tag */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1E1B18]/70 backdrop-blur-md border border-white/10 text-[#C7EBD4] text-[10px] font-bold tracking-widest uppercase z-20">
                Mode Interaktif 360°
            </div>
        </div>
    );
}
