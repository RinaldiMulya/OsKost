"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  Layers,
  Sparkles,
  MapPin,
  Waves,
  Building,
  GraduationCap,
  Briefcase,
  Loader2,
  Check,
  MousePointerClick,
  SlidersHorizontal,
} from "lucide-react";
import {
  PRESET_LOCATIONS,
  simulateDynamicScan,
  type RadarLocation,
  type DynamicScanResult,
  type RingKey,
} from "../data/mock-radar";
import { OsRadarAnalytics } from "./os-radar-analytics";

// Dynamic import untuk Leaflet map agar bebas SSR error
const OsRadarMap = dynamic(
  () => import("./os-radar-map").then((mod) => mod.OsRadarMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#EFE7DE]/50 flex flex-col items-center justify-center gap-3 text-[#111827] rounded-3xl">
        <Loader2 className="w-9 h-9 animate-spin text-[#00529C]" />
        <span className="text-sm font-bold tracking-wide">
          Memuat Peta Spatial AI &amp; Lapisan Hidrologi...
        </span>
      </div>
    ),
  }
);

interface OsRadarScannerViewProps {
  onNavigateToFund?: () => void;
}

export function OsRadarScannerView({ onNavigateToFund }: OsRadarScannerViewProps = {}) {
  // Preset default: Pulo Jahe (Data Riil)
  const [selectedPresetId, setSelectedPresetId] = useState<string>("pulo-jahe-cakung");
  const [selectedLocation, setSelectedLocation] = useState<RadarLocation | null>(
    PRESET_LOCATIONS[0]
  );

  // Dynamic Scan State (Mode B)
  const [dynamicResult, setDynamicResult] = useState<{
    address: string;
    coords: { lat: number; lng: number };
    data: DynamicScanResult;
  } | null>(null);

  // Input text search
  const [searchInput, setSearchInput] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Layer Toggles
  const [activeRings, setActiveRings] = useState({
    ring1: true,
    ring2: true,
    ring3: true,
  });
  const [showFloodLayer, setShowFloodLayer] = useState<boolean>(true);
  const [activeRingTab, setActiveRingTab] = useState<RingKey>("ring1");

  // Handler Pilih Preset (Mode A)
  const handleSelectPreset = (preset: RadarLocation) => {
    setIsScanning(true);
    setSelectedPresetId(preset.id);
    setSearchInput(preset.name);

    setTimeout(() => {
      setSelectedLocation(preset);
      setDynamicResult(null);
      setIsScanning(false);
    }, 700);
  };

  // Handler Trigger Scan Bebas / Klik Peta (Mode B)
  const triggerDynamicScan = useCallback(
    (lat: number, lng: number, customName?: string) => {
      setIsScanning(true);
      setSelectedPresetId("custom");
      setSelectedLocation(null);

      setTimeout(() => {
        const scan = simulateDynamicScan(lat, lng);
        setDynamicResult({
          address: customName || `Titik Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          coords: { lat, lng },
          data: scan,
        });
        setIsScanning(false);
      }, 1200);
    },
    []
  );

  // Handler Search Form Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    // Cek apakah cocok dengan salah satu preset
    const matched = PRESET_LOCATIONS.find(
      (p) =>
        p.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.address.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.short_name.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (matched) {
      handleSelectPreset(matched);
    } else {
      // Jika alamat custom, gunakan random offset dari Jakarta atau koordinat simulasi
      const baseLat = -6.2;
      const baseLng = 106.85;
      const randomLat = baseLat + (Math.random() - 0.5) * 0.15;
      const randomLng = baseLng + (Math.random() - 0.5) * 0.15;
      triggerDynamicScan(randomLat, randomLng, searchInput.trim());
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Control Console: Input & Preset Buttons ── */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-[#1E1B18]/15 shadow-md space-y-5">
        
        {/* Row 1: Search Input & Action */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ketik alamat properti atau klik salah satu tombol preset di bawah..."
              className="w-full bg-[#F8F6F1] border-2 border-[#1E1B18]/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base font-semibold text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#00529C] focus:bg-white transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="px-7 py-3.5 rounded-2xl bg-[#00529C] hover:bg-[#003E75] text-white text-sm font-extrabold shadow-[0_4px_16px_rgba(0,82,156,0.35)] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memindai...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#C7EBD4]" />
                <span>Pindai Alamat</span>
              </>
            )}
          </button>
        </form>

        {/* Row 2: Preset Buttons (Mode A) & Layer Toggles */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-4 border-t-2 border-[#1E1B18]/10">
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-[#111827] flex items-center gap-1.5 mr-1 bg-[#1E1B18]/5 px-2.5 py-1 rounded-lg">
              <MousePointerClick className="w-3.5 h-3.5 text-[#00529C]" />
              <span>Pilih Contoh Lokasi:</span>
            </span>

            {PRESET_LOCATIONS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-2 shadow-xs ${
                    isSelected
                      ? "bg-[#00529C] text-white border-[#00529C] shadow-md scale-105"
                      : "bg-[#FFFFFF] text-[#111827] hover:bg-[#F0FDF4] hover:border-[#10B981] border-[#1E1B18]/20"
                  }`}
                >
                  {preset.segment === "industrial" && <Building className="w-4 h-4 shrink-0" />}
                  {preset.segment === "campus" && <GraduationCap className="w-4 h-4 shrink-0" />}
                  {preset.segment === "suburban" && <Briefcase className="w-4 h-4 shrink-0" />}
                  <span>{preset.short_name}</span>
                  
                  {preset.is_real_data ? (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white text-[#00529C]"
                          : "bg-[#C7EBD4] text-[#065F46]"
                      }`}
                    >
                      ✓ DATA RIIL
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#E5E7EB] text-[#4B5563]"
                      }`}
                    >
                      SIMULASI
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Layer Quick Toggles */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 xl:pt-0">
            <span className="text-xs font-black uppercase tracking-wider text-[#111827] flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#4B5563]" />
              <span>Layer:</span>
            </span>

            <button
              type="button"
              onClick={() => setShowFloodLayer((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 shadow-2xs ${
                showFloodLayer
                  ? "bg-[#10B981] text-white border-[#10B981]"
                  : "bg-white text-[#4B5563] border-[#D1D5DB] hover:border-[#10B981]"
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Banjir (GeoFlood)</span>
              {showFloodLayer && <Check className="w-3 h-3 stroke-[3]" />}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveRings((prev) => ({
                  ring1: !prev.ring1,
                  ring2: !prev.ring2,
                  ring3: !prev.ring3,
                }))
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 shadow-2xs ${
                activeRings.ring1
                  ? "bg-[#00529C] text-white border-[#00529C]"
                  : "bg-white text-[#4B5563] border-[#D1D5DB] hover:border-[#00529C]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3 Cincin Zona</span>
              {activeRings.ring1 && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Split Screen: 65% Map, 35% Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[720px] items-stretch">
        {/* Left Map View */}
        <div className="lg:col-span-7 xl:col-span-8 relative rounded-3xl overflow-hidden border-2 border-[#1E1B18]/15 shadow-md min-h-[500px] h-[550px] lg:h-auto bg-[#E5E7EB] z-0 isolate">
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            <OsRadarMap
              location={selectedLocation}
              dynamicCoords={dynamicResult ? dynamicResult.coords : null}
              dynamicFloodRisk={dynamicResult?.data.flood_risk ?? "LOW"}
              isScanning={isScanning}
              onMapClick={(lat, lng) => triggerDynamicScan(lat, lng)}
              activeRings={activeRings}
              showFloodLayer={showFloodLayer}
            />
          </div>

          {/* Floating Instruction Banner in Map */}
          <div className="absolute top-4 left-4 right-4 sm:right-auto z-10 pointer-events-none">
            <div className="bg-[#111827]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2.5 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping shrink-0" />
              <span className="text-xs font-bold tracking-wide">
                Mode Interaktif: Klik sembarang titik di peta untuk memindai koordinat baru
              </span>
            </div>
          </div>
        </div>

        {/* Right Analytics Panel */}
        <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[660px]">
          <OsRadarAnalytics
            location={selectedLocation}
            dynamicResult={dynamicResult}
            isScanning={isScanning}
            activeRingTab={activeRingTab}
            onSelectRingTab={setActiveRingTab}
            onNavigateToFund={onNavigateToFund}
          />
        </div>
      </div>
    </div>
  );
}
