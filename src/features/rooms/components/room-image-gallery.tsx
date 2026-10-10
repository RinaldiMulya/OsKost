"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, Hand, Sparkles, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Room360Viewer } from "./room-360-viewer";

interface RoomImageGalleryProps {
    images: string[];
    panoramaImages?: {
        id: string;
        title: string;
        description: string | null;
        imageUrl: string;
    }[];
    roomName: string;
    roomNumber: string;
    priceDisplay: string;
}

export function RoomImageGallery({
    images,
    panoramaImages = [],
    roomName,
    roomNumber,
    priceDisplay,
}: RoomImageGalleryProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activePanoramaIndex, setActivePanoramaIndex] = useState(0);
    const [show360, setShow360] = useState(false);

    const safeImages = images.length > 0 ? images : ["/images/rooms/room-1.webp"];
    const hasPanoramas = panoramaImages && panoramaImages.length > 0;
    const totalItems = safeImages.length + (panoramaImages?.length ?? 0);

    return (
        <section className="flex flex-col gap-4 mb-8">
            {/* Main Stage Viewport */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-[#EFE7DE] border border-[#2C2825]/8 shadow-[0_8px_30px_rgba(44,40,37,0.06)] aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/10] group">
                {show360 && hasPanoramas ? (
                    <div className="w-full h-full relative">
                        <Room360Viewer imageUrl={panoramaImages[activePanoramaIndex]?.imageUrl} />
                        <button
                            onClick={() => setShow360(false)}
                            className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/90 backdrop-blur-md border border-[#2C2825]/10 text-xs font-bold text-[#1E1B18] hover:bg-[#FFFFFF] shadow-md transition-all cursor-pointer"
                        >
                            Kembali ke Foto
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
                        <Image
                            src={safeImages[activeImageIndex] || "/images/rooms/room-1.webp"}
                            alt={`${roomName} - Kamar ${roomNumber}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Top Left Tag: Room Number */}
                        <div className="absolute top-4 left-4 z-10">
                            <span className="px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/95 backdrop-blur-md border border-[#2C2825]/8 text-xs font-bold text-[#1E1B18] shadow-sm">
                                Unit No. {roomNumber}
                            </span>
                        </div>

                        {/* Top Right Tag: Price Display */}
                        <div className="absolute top-4 right-4 z-10">
                            <span className="px-3.5 py-1.5 rounded-full bg-[#A45A3D] text-white text-xs font-bold shadow-md">
                                {priceDisplay}
                            </span>
                        </div>

                        {/* Bottom Left: Switch to 360 Mode Button */}
                        {hasPanoramas && (
                            <button
                                onClick={() => setShow360(true)}
                                className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#2C2825]/10 text-[#A45A3D] hover:bg-[#A45A3D] hover:text-white transition-all shadow-lg group/btn cursor-pointer"
                            >
                                <Compass className="w-4 h-4 animate-spin-slow" />
                                <span className="font-ui text-xs font-bold tracking-wide">
                                    Buka Tur 360° Interaktif
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Thumbnails Row */}
            {totalItems > 1 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-[#757069] px-1">
                        <span className="font-semibold uppercase tracking-wider text-[11px]">
                            Pilihan Sudut Pandang ({totalItems} Aset)
                        </span>
                        {hasPanoramas && (
                            <span className="text-[11px] text-[#A45A3D] font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Tersedia foto panorama 360°
                            </span>
                        )}
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {/* 360 Panoramas */}
                        {panoramaImages.map((pano, idx) => {
                            const isActive = show360 && activePanoramaIndex === idx;
                            return (
                                <button
                                    key={pano.id || idx}
                                    onClick={() => {
                                        setActivePanoramaIndex(idx);
                                        setShow360(true);
                                    }}
                                    className={cn(
                                        "relative flex-shrink-0 w-32 sm:w-40 aspect-video rounded-2xl overflow-hidden transition-all duration-200 border cursor-pointer",
                                        isActive
                                            ? "ring-2 ring-[#A45A3D] ring-offset-2 ring-offset-[#F8F6F1] border-transparent shadow-md"
                                            : "border-[#2C2825]/10 opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <Image
                                        src={pano.imageUrl}
                                        alt={pano.title || `360 View ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <span className="px-2 py-0.5 rounded-full bg-[#A45A3D] text-white text-[10px] font-bold flex items-center gap-1">
                                            <span>360°</span>
                                        </span>
                                    </div>
                                    <div className="absolute bottom-1 left-1 right-1 text-center bg-black/60 backdrop-blur-xs rounded py-0.5 px-1">
                                        <p className="text-[10px] text-white truncate font-medium">
                                            {pano.title || `360° View ${idx + 1}`}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}

                        {/* Normal Room Photos */}
                        {safeImages.map((imgUrl, idx) => {
                            const isActive = !show360 && activeImageIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setActiveImageIndex(idx);
                                        setShow360(false);
                                    }}
                                    className={cn(
                                        "relative flex-shrink-0 w-32 sm:w-40 aspect-video rounded-2xl overflow-hidden transition-all duration-200 border cursor-pointer",
                                        isActive
                                            ? "ring-2 ring-[#A45A3D] ring-offset-2 ring-offset-[#F8F6F1] border-transparent shadow-md"
                                            : "border-[#2C2825]/10 opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <Image
                                        src={imgUrl}
                                        alt={`Foto ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute bottom-1 left-1 right-1 text-center bg-black/50 backdrop-blur-xs rounded py-0.5 px-1">
                                        <p className="text-[10px] text-white truncate font-medium">
                                            Foto {idx + 1}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
