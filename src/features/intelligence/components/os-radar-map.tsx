"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, LocateFixed } from "lucide-react";
import type { RadarLocation, FloodRiskLevel } from "../data/mock-radar";

// ─── Warna Cincin ──────────────────────────────────────────
const RING_COLORS = {
  ring1: { stroke: "#10B981", fill: "#10B981", label: "Ring 1: Walkable Tropis (<500m)" },
  ring2: { stroke: "#00529C", fill: "#00529C", label: "Ring 2: Feeder Roda Dua (1.5km)" },
  ring3: { stroke: "#7C3AED", fill: "#7C3AED", label: "Ring 3: Penyangga Sprawl (5km)" },
};

// Flood polygon palettes
const FLOOD_POLYGON_COLORS: Record<FloodRiskLevel, string> = {
  LOW: "#10B981",
  MODERATE: "#F59E0B",
  HIGH: "#F43F5E",
};

interface OsRadarMapProps {
  location: RadarLocation | null;
  dynamicCoords: { lat: number; lng: number } | null;
  dynamicFloodRisk: FloodRiskLevel;
  isScanning: boolean;
  onMapClick: (lat: number, lng: number) => void;
  activeRings: { ring1: boolean; ring2: boolean; ring3: boolean };
  showFloodLayer: boolean;
}

export function OsRadarMap({
  location,
  dynamicCoords,
  dynamicFloodRisk,
  isScanning,
  onMapClick,
  activeRings,
  showFloodLayer,
}: OsRadarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const markerRef = useRef<L.Marker | null>(null);

  // ─── Inisialisasi Peta ───────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialLat = location ? location.coordinates.lat : -6.1952196;
    const initialLng = location ? location.coordinates.lng : 106.92452;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      attributionControl: false,
    });

    // Tile: ESRI ArcGIS World Street Map (jernih, bebas watermark)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19 }
    ).addTo(map);

    // Click handler untuk Mode B
    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    // Fix: Invalidate size after layout completes to prevent gray tiles and overflow
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    // ResizeObserver agar peta otomatis menyesuaikan saat ukuran kontainer berubah
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render Layers (Cincin + Flood + Marker) ─────────────
  const renderLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Pastikan ukuran peta valid
    map.invalidateSize();

    // Hapus semua layer lama
    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    const coords = location
      ? ([location.coordinates.lat, location.coordinates.lng] as L.LatLngTuple)
      : dynamicCoords
        ? ([dynamicCoords.lat, dynamicCoords.lng] as L.LatLngTuple)
        : null;

    if (!coords) return;

    const floodRisk = location?.flood.risk_level ?? dynamicFloodRisk;
    const floodColor = FLOOD_POLYGON_COLORS[floodRisk];

    // ── Flood layer: poligon semi-transparan di luar Ring3 ──
    if (showFloodLayer) {
      const floodCircle = L.circle(coords, {
        radius: 2600,
        color: floodColor,
        fillColor: floodColor,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6 4",
      });
      floodCircle.addTo(map);
      layersRef.current.push(floodCircle);

      // Label flood
      const floodLabel = L.tooltip({
        permanent: true,
        direction: "right",
        className: "flood-tooltip",
        offset: [12, 0],
      })
        .setContent(
          `<div style="font-size:11px;font-weight:800;background:rgba(255,255,255,0.95);padding:3px 8px;border-radius:9999px;border:1.5px solid ${floodColor};color:${floodColor};box-shadow:0 2px 8px rgba(0,0,0,0.12)">
            ${floodRisk === "LOW" ? "🟢 AMAN BANJIR (10-Yr)" : floodRisk === "MODERATE" ? "🟡 WASPADA GENANGAN" : "🔴 RAWAN BANJIR"}
          </div>`
        )
        .setLatLng(L.latLng(coords[0], coords[1] + 0.024));
      floodLabel.addTo(map);
      layersRef.current.push(floodLabel as unknown as L.Layer);
    }

    // ── 3 Concentric Rings ───────────────────────────────────
    const ringsConfig = [
      { key: "ring1" as const, radius: 500 },
      { key: "ring2" as const, radius: 1500 },
      { key: "ring3" as const, radius: 5000 },
    ];

    ringsConfig.forEach(({ key, radius }) => {
      if (!activeRings[key]) return;
      const cfg = RING_COLORS[key];
      const ring = L.circle(coords, {
        radius,
        color: cfg.stroke,
        fillColor: cfg.fill,
        fillOpacity: 0.07,
        weight: 2.5,
        dashArray: key === "ring3" ? "10 6" : key === "ring2" ? "6 4" : undefined,
      });
      ring.addTo(map);
      layersRef.current.push(ring);

      // Label posisi kanan cincin
      const lngOffset = key === "ring1" ? 0.0052 : key === "ring2" ? 0.015 : 0.048;
      const ringLabel = L.tooltip({
        permanent: true,
        direction: "right",
        className: "ring-label-tooltip",
        offset: [6, 0],
      })
        .setContent(
          `<div style="font-size:10px;font-weight:800;background:rgba(255,255,255,0.95);padding:2px 7px;border-radius:9999px;border:1.5px solid ${cfg.stroke};color:${cfg.stroke};box-shadow:0 2px 6px rgba(0,0,0,0.08);white-space:nowrap">
            ${cfg.label}
          </div>`
        )
        .setLatLng(L.latLng(coords[0], coords[1] + lngOffset));
      ringLabel.addTo(map);
      layersRef.current.push(ringLabel as unknown as L.Layer);
    });

    // ── Custom Marker ────────────────────────────────────────
    const markerHtml = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(0,82,156,0.25);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:relative;width:38px;height:38px;border-radius:50%;background:#00529C;border:3px solid white;box-shadow:0 4px 16px rgba(0,82,156,0.45);display:flex;align-items:center;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>`;

    const icon = L.divIcon({
      className: "os-radar-marker",
      html: markerHtml,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const marker = L.marker(coords, { icon });
    marker.addTo(map);
    markerRef.current = marker;

    // ── Fly to location ──────────────────────────────────────
    const zoom = location ? 14 : 13;
    map.flyTo(coords, zoom, { duration: 1.0, easeLinearity: 0.5 });
  }, [location, dynamicCoords, dynamicFloodRisk, activeRings, showFloodLayer]);

  useEffect(() => {
    renderLayers();
  }, [renderLayers]);

  // Zoom Handlers
  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleRecenter = () => {
    const coords = location
      ? ([location.coordinates.lat, location.coordinates.lng] as L.LatLngTuple)
      : dynamicCoords
        ? ([dynamicCoords.lat, dynamicCoords.lng] as L.LatLngTuple)
        : null;

    if (mapRef.current && coords) {
      mapRef.current.flyTo(coords, 14, { duration: 0.8 });
    }
  };

  return (
    <div className="relative w-full h-full z-0 overflow-hidden isolate">
      {/* Container utama leaflet (absolute inset-0 untuk mencegah overflow) */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Floating Zoom & Recenter Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Perbesar"
          className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border-2 border-[#1E1B18]/15 flex items-center justify-center text-[#111827] hover:bg-white shadow-md transition-all cursor-pointer font-bold"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Perkecil"
          className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border-2 border-[#1E1B18]/15 flex items-center justify-center text-[#111827] hover:bg-white shadow-md transition-all cursor-pointer font-bold"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          title="Pusatkan Ulang"
          className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border-2 border-[#00529C]/30 flex items-center justify-center text-[#00529C] hover:bg-white shadow-md transition-all cursor-pointer font-bold"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* Scanning Overlay — Mode B HUD */}
      {isScanning && (
        <div className="absolute inset-0 z-30 bg-[#111827]/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#10B981]/40 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-[#10B981]/60 animate-ping [animation-delay:0.3s]" />
            <div className="w-16 h-16 rounded-full border-3 border-t-[#10B981] border-[#10B981]/20 animate-spin" />
          </div>
          <div className="text-center space-y-1.5 px-4">
            <p className="text-sm font-extrabold text-[#10B981] tracking-widest uppercase animate-pulse">
              🛰️ Memindai Koordinat Geospasial…
            </p>
            <p className="text-xs font-bold text-white/80">
              Menghitung Ring 1 (Walkable), Ring 2 (Transit), Ring 3 (Tarikan Ekonomi) &amp; Lapisan Banjir
            </p>
          </div>
        </div>
      )}

      {/* Global CSS for Leaflet isolation & custom styling */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .os-radar-marker { background: transparent !important; border: none !important; }
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          background: #E5E7EB !important;
          z-index: 0 !important;
          border-radius: inherit !important;
          overflow: hidden !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 10 !important;
        }
        .leaflet-tooltip.ring-label-tooltip,
        .leaflet-tooltip.flood-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip.ring-label-tooltip::before,
        .leaflet-tooltip.flood-tooltip::before { display: none !important; }
      `}</style>
    </div>
  );
}
