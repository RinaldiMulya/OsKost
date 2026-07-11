"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, Hand } from "lucide-react";
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
    panoramaImages,
    roomName,
    roomNumber,
    priceDisplay,
}: RoomImageGalleryProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activePanoramaIndex, setActivePanoramaIndex] = useState(0);
    const [show360, setShow360] = useState(false);

    const totalItems = images.length + (panoramaImages?.length ?? 0);

    return (
        <>
            {/* ===== HERO IMAGE / 360° ===== */}
            <section className="mb-2 lg:mb-6">
                {show360 ? (
                    <div className="relative h-[65svh] lg:h-auto">
                        <div className="h-full lg:aspect-video">
                            <Room360Viewer imageUrl={panoramaImages?.[activePanoramaIndex]?.imageUrl} />
                        </div>
                        <button
                            onClick={() => setShow360(false)}
                            className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-zinc-700 text-xs lg:text-sm text-white hover:bg-black/80 transition-colors"
                        >
                            Kembali ke Foto
                        </button>
                    </div>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden group">
                        {/* Main image — 65svh on mobile, aspect-video on desktop */}
                        <div className="relative h-[65svh] lg:h-auto lg:aspect-video">
                            <Image
                                src={images[activeImageIndex] ?? "/images/rooms/room-1.webp"}
                                alt={`${roomName} - ${roomNumber}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                                priority
                            />
                            {/* Bottom gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>

                        {/* Price tag - top right */}
                        <div className="absolute top-4 right-4 z-10">
                            <div className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-secondary/30 shadow-[0_0_20px_rgba(0,204,64,0.15)]">
                                <p className="text-secondary font-bold text-xs lg:text-sm tracking-wide">
                                    {priceDisplay}
                                </p>
                            </div>
                        </div>

                        {/* 360° trigger button - bottom left */}
                        {panoramaImages && panoramaImages.length > 0 && (
                            <button
                                onClick={() => setShow360(true)}
                                className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 hover:bg-black/70 hover:border-white/30 transition-all duration-300 group/btn"
                            >
                                <Hand className="w-4 h-4 text-white/70 group-hover/btn:text-secondary transition-colors" />
                                <span className="text-white/80 text-[10px] lg:text-xs font-medium uppercase tracking-widest group-hover/btn:text-white transition-colors">
                                    Geser Untuk 360° View
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* ===== GALLERY - JELAJAH LINGKUNGAN ===== */}
            {totalItems > 1 && (
                <section className="mb-6 lg:mb-8">
                    <h3 className="text-xs lg:text-sm text-zinc-300 uppercase tracking-[0.25em] font-medium mb-2 lg:mb-3">
                        Jelajah Lingkungan
                    </h3>
                    {/* Mobile: fill remaining ~25svh | Desktop: normal row */}
                    <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 p-3 scrollbar-hide">
                        {/* 360 Panorama Images */}
                        {panoramaImages?.map((pano, index) => {
                            const isActive = show360 && activePanoramaIndex === index;
                            return (
                                <button
                                    key={`pano-${pano.id || index}`}
                                    onClick={() => {
                                        setActivePanoramaIndex(index);
                                        setShow360(true);
                                    }}
                                    className={cn(
                                        "relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300",
                                        "w-[35vw] h-[20svh] lg:w-56 lg:h-36 xl:w-56 xl:h-36",
                                        isActive
                                            ? "ring-2 ring-secondary ring-offset-2 ring-offset-[#0a0f0a]"
                                            : "opacity-60 hover:opacity-90"
                                    )}
                                >
                                    <Image
                                        src={pano.imageUrl}
                                        alt={pano.title || `360 View ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    {isActive ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <span className="bg-secondary text-black text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                                                <span className="text-[10px] font-extrabold">360°</span> VIEW
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-white/10">
                                                <span className="text-[9px] font-bold">360°</span>
                                            </span>
                                        </div>
                                    )}
                                    <p
                                        className={cn(
                                            "absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] lg:text-sm font-semibold uppercase tracking-wider text-center w-full px-2 truncate",
                                            isActive ? "text-secondary font-bold" : "text-zinc-300"
                                        )}
                                    >
                                        {pano.title}
                                    </p>
                                </button>
                            );
                        })}

                        {/* Standard Images */}
                        {images.map((img, index) => {
                            const isActive = !show360 && activeImageIndex === index;
                            return (
                                <button
                                    key={`img-${index}`}
                                    onClick={() => {
                                        setActiveImageIndex(index);
                                        setShow360(false);
                                    }}
                                    className={cn(
                                        "relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300",
                                        "w-[35vw] h-[20svh] lg:w-56 lg:h-36 xl:w-56 xl:h-36",
                                        isActive
                                            ? "ring-2 ring-secondary ring-offset-2 ring-offset-[#0a0f0a]"
                                            : "opacity-50 hover:opacity-90"
                                    )}
                                >
                                    <Image
                                        src={img}
                                        alt={`View ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    {isActive ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <span className="px-3 py-1 rounded-md bg-secondary/90 text-[10px] lg:text-xs font-bold text-black uppercase tracking-widest">
                                                View
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="absolute top-2 right-2">
                                            <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-white/60" />
                                        </div>
                                    )}
                                    <p
                                        className={cn(
                                            "absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] lg:text-sm font-semibold uppercase tracking-wider",
                                            isActive ? "text-secondary font-bold" : "text-zinc-500"
                                        )}
                                    >
                                        {index === 0 ? "Depan" : index === 1 ? "Dalam" : "Luar"}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}
        </>
    );
}
