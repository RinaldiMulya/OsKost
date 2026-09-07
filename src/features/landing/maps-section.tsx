"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Building2, MapPin, Train, Verified, Navigation, Plus, Minus, LocateFixed, Loader2 } from "lucide-react";
import type L from "leaflet";
import type { LocationPoint } from "./interactive-map";

// Dynamically import InteractiveMap to disable SSR
const InteractiveMap = dynamic(
    () => import("./interactive-map").then((mod) => mod.InteractiveMap),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-card/60 flex items-center justify-center backdrop-blur-md">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                    <span className="text-sm font-medium">Memuat Peta Interaktif...</span>
                </div>
            </div>
        ),
    }
);

export function MapsSection() {
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationPoint>({
        id: "main",
        name: "Smartkost Pulo Jahe",
        address: "Jl. Kp. Pulo Jahe No.104 b, RT.3/RW.5, Jatinegara, Kec. Cakung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13930",
        lat: -6.1952196,
        lng: 106.92452,
        isMain: true,
        availableRooms: 4,
        googleMapsUrl: "https://www.google.com/maps/place/Kost+Buayu/@-6.1952196,106.9219451,880m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2e698b17c81090fd:0x33ca246c2c7b8768!8m2!3d-6.1952196!4d106.92452!16s%2Fg%2F11v3nss9gz",
    });

    const handleZoomIn = () => {
        if (mapInstance) {
            mapInstance.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapInstance) {
            mapInstance.zoomOut();
        }
    };

    const handleRecenter = () => {
        if (mapInstance) {
            mapInstance.flyTo([selectedLocation.lat, selectedLocation.lng], 17, {
                duration: 1.2,
            });
        }
    };

    const handleGetDirections = () => {
        const url = selectedLocation.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <section className="relative w-full h-[600px] md:h-screen min-h-[600px] overflow-hidden bg-background">
            {/* Interactive Leaflet Map Background */}
            <div className="absolute inset-0 z-0">
                <InteractiveMap 
                    onMapReady={setMapInstance} 
                    onSelectLocation={setSelectedLocation}
                />
                
                {/* Decorative Overlays for Visual Depth */}
                <div 
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10 pointer-events-none"></div>
            </div>

            {/* Floating High-Contrast Information Card (Bottom-Left) */}
            <div className="absolute bottom-8 md:bottom-12 left-4 md:left-8 z-30 w-[calc(100%-32px)] md:w-full max-w-[400px]">
                <div className="bg-card/85 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-border/50 border-l-4 border-l-secondary transform transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] border border-secondary/30 mb-2 uppercase tracking-widest font-semibold">
                                Lokasi Kost Utama
                            </span>
                            <h2 className="text-2xl font-bold text-foreground">
                                {selectedLocation.name}
                            </h2>
                            <p className="text-primary text-sm mt-0.5 opacity-90 font-medium">
                                Jatinegara, Cakung, Jakarta Timur
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border/50 text-muted-foreground shrink-0">
                            <Building2 className="w-5 h-5 text-secondary" />
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-2.5">
                            <MapPin className="text-secondary w-5 h-5 mt-0.5 shrink-0" />
                            <p className="text-foreground/90 text-sm leading-snug">
                                {selectedLocation.address}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Train className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium">Akses Strategis</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Verified className="w-4 h-4 text-secondary" />
                                <span className="text-xs font-medium">Lingkungan Nyaman</span>
                            </div>
                        </div>
                    </div>

                    {/* Get Directions Button */}
                    <button 
                        onClick={handleGetDirections}
                        className="group w-full bg-secondary text-secondary-foreground py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,204,64,0.4)] hover:brightness-110 active:scale-[0.98]"
                    >
                        <Navigation className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        Petunjuk Arah (Google Maps)
                    </button>
                </div>
            </div>

            {/* Map Interactive Controls */}
            <div className="hidden md:flex absolute top-12 right-8 z-30 flex-col gap-2">
                <button 
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="w-10 h-10 rounded-full bg-card/85 backdrop-blur-xl border border-border/50 flex items-center justify-center text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="w-10 h-10 rounded-full bg-card/85 backdrop-blur-xl border border-border/50 flex items-center justify-center text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                >
                    <Minus className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleRecenter}
                    title="Pusatkan Ke Lokasi Kost"
                    className="w-10 h-10 rounded-full bg-card/85 backdrop-blur-xl border border-secondary/40 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg mt-2"
                >
                    <LocateFixed className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
}
