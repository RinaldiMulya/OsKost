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
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800">
                <p className="text-zinc-500 text-sm">Gambar 360 tidak tersedia.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black group">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-10">
                    <Loader2 className="w-8 h-8 text-secondary animate-spin mb-3" />
                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">
                        Memuat Pengalaman 360°...
                    </p>
                </div>
            )}

            {/* Hint Overlay (fades out on interaction) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 text-[10px] tracking-widest uppercase pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                Klik & Geser untuk Melihat Sekeliling
            </div>

            {/* Corner Tag */}
            <div className="absolute top-4 left-4 px-2 py-1 rounded-md bg-secondary/20 border border-secondary/40 text-secondary text-[10px] font-bold tracking-widest z-20">
                INTERACTIVE 360°
            </div>
        </div>
    );
}
