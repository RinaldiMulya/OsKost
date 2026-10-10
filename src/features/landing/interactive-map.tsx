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
    name: "OsKost Pulo Jahe (Cakung Sentral)",
    address:
      "Jl. Kp. Pulo Jahe No.104 b, RT.3/RW.5, Jatinegara, Kec. Cakung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13930",
    lat: -6.1952196,
    lng: 106.92452,
    isMain: true,
    availableRooms: 4,
    googleMapsUrl:
      "https://www.google.com/maps/place/Kost+Buayu/@-6.1952196,106.9219451,880m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2e698b17c81090fd:0x33ca246c2c7b8768!8m2!3d-6.1952196!4d106.92452!16s%2Fg%2F11v3nss9gz",
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

export function InteractiveMap({
  onMapReady,
  onSelectLocation,
}: InteractiveMapProps) {
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

    // ESRI ArcGIS World Street Map (Bebas API Key, tanpa watermark, tampilan jernih & detail)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, USGS',
      },
    ).addTo(map);

    // Add custom HTML DivIcon Marker untuk Lokasi Utama
    DEFAULT_LOCATIONS.forEach((loc) => {
      const isMain = loc.isMain;

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
                    <div class="relative flex items-center justify-center cursor-pointer group">
                        ${
                          isMain
                            ? `<div class="absolute -inset-3 rounded-full bg-[rgba(164,90,61,0.25)] animate-ping"></div>`
                            : `<div class="absolute -inset-2 rounded-full bg-[rgba(44,76,59,0.2)] animate-pulse"></div>`
                        }
                        <div class="relative w-10 h-10 rounded-2xl ${
                          isMain
                            ? "bg-[#A45A3D] shadow-[0_4px_16px_rgba(164,90,61,0.4)] border-2 border-white"
                            : "bg-[#2C4C3B] shadow-[0_4px_12px_rgba(44,76,59,0.3)] border-2 border-white"
                        } flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                        </div>
                    </div>
                `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(
        map,
      );

      // Styled Leaflet Popup (Japandi Porcelain Card)
      const popupContent = `
        <div style="font-family: inherit; color: #1E1B18; min-width: 220px; padding: 2px;">
            <div style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #A45A3D; letter-spacing: 0.08em; background: rgba(164, 90, 61, 0.1); padding: 3px 8px; border-radius: 9999px; margin-bottom: 6px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #A45A3D;"></span>
                Lokasi Utama OsKost
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #1E1B18; letter-spacing: -0.01em; margin-bottom: 4px; line-height: 1.3;">
                ${loc.name}
            </div>
            <div style="font-size: 11px; color: #757069; line-height: 1.4; margin-bottom: 10px;">
                ${loc.address}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600; color: #1E1B18; border-top: 1px solid rgba(44, 40, 37, 0.08); padding-top: 8px;">
                <span style="color: #757069;">Status Unit:</span>
                <span style="display: inline-flex; align-items: center; gap: 4px; color: #2C4C3B; font-weight: 700; background: #C7EBD4; padding: 2px 8px; border-radius: 9999px; font-size: 10px;">
                    <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #2C4C3B;"></span>
                    ${loc.availableRooms} Kamar Tersedia
                </span>
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
          background: #FFFFFF !important;
          color: #1E1B18 !important;
          border: 1px solid rgba(44, 40, 37, 0.12) !important;
          border-radius: 18px !important;
          box-shadow: 0 16px 36px rgba(44, 40, 37, 0.12), 0 4px 12px rgba(44, 40, 37, 0.04) !important;
          padding: 8px 10px !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: #FFFFFF !important;
          border: 1px solid rgba(44, 40, 37, 0.12) !important;
          box-shadow: 0 4px 12px rgba(44, 40, 37, 0.08) !important;
        }
        .custom-leaflet-popup .leaflet-popup-close-button {
          color: #757069 !important;
          padding: 8px !important;
          font-size: 16px !important;
          top: 6px !important;
          right: 6px !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          transition: all 0.2s ease !important;
        }
        .custom-leaflet-popup .leaflet-popup-close-button:hover {
          color: #1E1B18 !important;
          background: #F8F6F1 !important;
        }
      `}</style>
    </div>
  );
}
