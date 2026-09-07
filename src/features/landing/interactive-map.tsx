"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface LocationPoint {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    isMain?: boolean;
    availableRooms?: number;
    googleMapsUrl?: string;
}

const DEFAULT_LOCATIONS: LocationPoint[] = [
    {
        id: "main",
        name: "Smartkost Pulo Jahe",
        address: "Jl. Kp. Pulo Jahe No.104 b, RT.3/RW.5, Jatinegara, Kec. Cakung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13930",
        lat: -6.1952196,
        lng: 106.92452,
        isMain: true,
        availableRooms: 4,
        googleMapsUrl: "https://www.google.com/maps/place/Kost+Buayu/@-6.1952196,106.9219451,880m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2e698b17c81090fd:0x33ca246c2c7b8768!8m2!3d-6.1952196!4d106.92452!16s%2Fg%2F11v3nss9gz",
    },
    /* Cabang cabang di-comment sesuai arahan
    {
        id: "unit-2",
        name: "Smartkost Swadaya",
        address: "Jl. Swadaya Pulo Jahe No. 45, Cakung, Jakarta Timur",
        lat: -6.1965,
        lng: 106.9368,
        availableRooms: 2,
    },
    {
        id: "unit-3",
        name: "Smartkost Raya",
        address: "Jl. Raya Pulo Jahe No. 88, Cakung, Jakarta Timur",
        lat: -6.1938,
        lng: 106.9395,
        availableRooms: 3,
    },
    {
        id: "unit-4",
        name: "Smartkost Boulevard",
        address: "Jl. Pulo Jahe Blok B No. 7, Cakung, Jakarta Timur",
        lat: -6.1970,
        lng: 106.9410,
        availableRooms: 2,
    },
    */
];

interface InteractiveMapProps {
    onMapReady?: (mapInstance: L.Map) => void;
    selectedLocationId?: string;
    onSelectLocation?: (location: LocationPoint) => void;
}

export function InteractiveMap({ onMapReady, onSelectLocation }: InteractiveMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Lokasi akurat Kost Buayu / Smartkost Pulo Jahe
        const centerLat = -6.1952196;
        const centerLng = 106.92452;

        const map = L.map(mapContainerRef.current, {
            center: [centerLat, centerLng],
            zoom: 17,
            zoomControl: false, // Gunakan tombol Zoom kustom di UI
            scrollWheelZoom: false, // NONAKTIFKAN scroll wheel zoom agar scroll halaman web tetap normal!
            doubleClickZoom: false,
            touchZoom: false, // Mencegah pinch zoom mengganggu touch scroll mobile
            attributionControl: false,
        });

        // CartoDB Dark Matter Tiles
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
            subdomains: "abcd",
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map);

        // Add custom HTML DivIcon Marker untuk Lokasi Utama
        DEFAULT_LOCATIONS.forEach((loc) => {
            const isMain = loc.isMain;

            const customIcon = L.divIcon({
                className: "custom-leaflet-marker",
                html: `
                    <div class="relative flex items-center justify-center cursor-pointer group">
                        ${
                            isMain
                                ? `<div class="absolute -inset-3 rounded-full bg-[rgba(0,204,64,0.35)] animate-ping"></div>`
                                : `<div class="absolute -inset-2 rounded-full bg-[rgba(156,0,253,0.3)] animate-pulse"></div>`
                        }
                        <div class="relative w-9 h-9 rounded-full ${
                            isMain 
                                ? "bg-[#00cc40] shadow-[0_0_25px_rgba(0,204,64,1)] border-2 border-[#090d16]" 
                                : "bg-[#9c00fd] shadow-[0_0_12px_rgba(156,0,253,0.8)] border-2 border-[#090d16]"
                        } flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-125">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                        </div>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            });

            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

            // Styled Leaflet Popup
            const popupContent = `
                <div style="font-family: inherit; color: #f3f4f6; min-width: 200px; padding: 4px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #00cc40; letter-spacing: 0.05em; margin-bottom: 2px;">
                        ★ Lokasi Utama Kost
                    </div>
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                        ${loc.name}
                    </div>
                    <div style="font-size: 12px; color: #9ca3af; line-height: 1.3; margin-bottom: 8px;">
                        ${loc.address}
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600; color: #e5e7eb; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
                        <span>Kamar Tersedia:</span>
                        <span style="color: #00cc40; font-weight: 700;">${loc.availableRooms} Kamar</span>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, {
                className: "custom-leaflet-popup",
                closeButton: true,
            });

            marker.on("click", () => {
                if (onSelectLocation) {
                    onSelectLocation(loc);
                }
            });
        });

        mapInstanceRef.current = map;
        if (onMapReady) {
            onMapReady(map);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [onMapReady, onSelectLocation]);

    return (
        <div className="w-full h-full relative z-0">
            <div ref={mapContainerRef} className="w-full h-full" />
            <style jsx global>{`
                .custom-leaflet-popup .leaflet-popup-content-wrapper {
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
                    padding: 8px;
                }
                .custom-leaflet-popup .leaflet-popup-tip {
                    background: rgba(15, 23, 42, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }
                .custom-leaflet-popup .leaflet-popup-close-button {
                    color: #9ca3af !important;
                    padding: 6px !important;
                }
                .custom-leaflet-popup .leaflet-popup-close-button:hover {
                    color: #ffffff !important;
                }
            `}</style>
        </div>
    );
}
