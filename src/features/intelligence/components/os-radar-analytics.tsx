"use client";

import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Waves,
  MapPin,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  MousePointerClick,
  Info,
} from "lucide-react";
import type {
  RadarLocation,
  DynamicScanResult,
  RingKey,
} from "../data/mock-radar";

interface OsRadarAnalyticsProps {
  location: RadarLocation | null;
  dynamicResult: {
    address: string;
    coords: { lat: number; lng: number };
    data: DynamicScanResult;
  } | null;
  isScanning: boolean;
  activeRingTab: RingKey;
  onSelectRingTab: (ring: RingKey) => void;
  onNavigateToFund?: () => void;
}

export function OsRadarAnalytics({
  location,
  dynamicResult,
  isScanning,
  activeRingTab,
  onSelectRingTab,
  onNavigateToFund,
}: OsRadarAnalyticsProps) {
  const isPreset = Boolean(location);

  // Normalisasi data tampilan
  const title = isPreset
    ? location!.name
    : dynamicResult?.address || "Lokasi Hasil Scan Interaktif";
  const address = isPreset
    ? location!.address
    : `${dynamicResult?.coords.lat.toFixed(5)}, ${dynamicResult?.coords.lng.toFixed(5)}`;
  const isRealData = isPreset ? location!.is_real_data : false;

  const overallScore = isPreset
    ? location!.overall_score
    : dynamicResult?.data.score ?? 80;
  const scoreGrade = isPreset
    ? location!.score_grade
    : dynamicResult?.data.grade ?? "A — Strategis";
  const occupancyProjection = isPreset
    ? location!.rings.ring3.occupancy_projection_pct
    : dynamicResult?.data.occupancy_projection ?? 88;
  const bankVerdict = isPreset
    ? location!.bank_recommendation
    : dynamicResult?.data.score && dynamicResult.data.score >= 75
      ? "LAYAK DANA TALANG RENOVASI & KPR MIKRO BTN"
      : "PERLU EVALUASI RISIKO & MITIGASI INFRASTRUKTUR";

  const floodStatus = isPreset
    ? location!.flood.status
    : dynamicResult?.data.flood_risk === "LOW"
      ? "ZONA AMAN BANJIR (Model Hidrologi AI)"
      : dynamicResult?.data.flood_risk === "MODERATE"
        ? "WASPADA GENANGAN TEMPORAL (<20 cm)"
        : "RAWAN LIMPASAN BANJIR HISTORIS";

  const floodColor = isPreset
    ? location!.flood.color_code
    : dynamicResult?.data.flood_risk === "LOW"
      ? "#10B981"
      : dynamicResult?.data.flood_risk === "MODERATE"
        ? "#F59E0B"
        : "#F43F5E";

  const floodNote = isPreset
    ? location!.flood.notes
    : dynamicResult?.data.flood_note ??
      "Data topografi Digital Elevation Model (DEM) menunjukkan stabilitas kontur.";

  const ring1Score = isPreset
    ? location!.rings.ring1.score
    : dynamicResult?.data.ring1_score ?? 80;
  const ring2Score = isPreset
    ? location!.rings.ring2.score
    : dynamicResult?.data.ring2_score ?? 80;
  const ring3Score = isPreset
    ? location!.rings.ring3.score
    : dynamicResult?.data.ring3_score ?? 85;

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] rounded-3xl border-2 border-[#1E1B18]/15 shadow-md overflow-hidden">
      
      {/* ── 1. Header Lokasi & Badge Validasi (High Contrast) ── */}
      <div className="p-5 border-b-2 border-[#1E1B18]/10 bg-[#F9FAFB]">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#00529C] text-white shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C7EBD4]" />
              Spatial ROI Engine
            </span>
            {isRealData ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#C7EBD4] text-[#065F46] border border-[#10B981]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Data Riil
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E5E7EB] text-[#374151]">
                Simulasi
              </span>
            )}
          </div>

          <span className="text-xs font-black text-[#111827] bg-white px-2 py-0.5 rounded-md border border-[#1E1B18]/15">
            15-Min Living
          </span>
        </div>

        <h3 className="font-editorial text-2xl font-black text-[#111827] leading-tight mb-1.5">
          {title}
        </h3>
        <p className="text-xs font-bold text-[#374151] flex items-center gap-1.5 truncate">
          <MapPin className="w-4 h-4 text-[#A45A3D] shrink-0" />
          <span className="truncate">{address}</span>
        </p>
      </div>

      {/* ── 2. Scrollable Body Analisis ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll">
        
        {/* KPI Grid: Spatial ROI Score + Okupansi */}
        <div className="grid grid-cols-12 gap-3">
          {/* Big Score Card */}
          <div className="col-span-7 p-4 rounded-2xl bg-gradient-to-br from-[#FFFFFF] to-[#EFF6FF] border-2 border-[#00529C]/30 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-black tracking-wider text-[#00529C] uppercase">
                Spatial ROI Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-editorial text-4xl sm:text-5xl font-black text-[#00529C] tracking-tight">
                  {overallScore}
                </span>
                <span className="text-sm font-extrabold text-[#4B5563]">
                  / 100
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-[#00529C]/20 flex items-center justify-between">
              <span className="text-xs font-black text-[#111827]">
                {scoreGrade}
              </span>
              <span className="text-xs font-black text-[#065F46] bg-[#C7EBD4] px-2 py-0.5 rounded-full">
                Sangat Layak
              </span>
            </div>
          </div>

          {/* Occupancy & Bank Readiness */}
          <div className="col-span-5 flex flex-col gap-2">
            <div className="flex-1 p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#10B981]/30 flex flex-col justify-center">
              <span className="text-[10px] font-black tracking-wider text-[#065F46] uppercase">
                Proyeksi Okupansi
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-4 h-4 text-[#065F46]" />
                <span className="font-editorial text-2xl font-black text-[#065F46]">
                  {occupancyProjection}%
                </span>
              </div>
              <span className="text-[10px] text-[#065F46] font-bold mt-0.5">
                Keterisian Tinggi
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#00529C]/10 border-2 border-[#00529C]/20 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00529C] shrink-0" />
              <span className="text-[11px] font-extrabold text-[#00529C] leading-tight">
                Standar Agunan BTN
              </span>
            </div>
          </div>
        </div>

        {/* Layer Risiko Banjir & Hidrologi (GeoFloodAI Class) */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border-2 border-[#1E1B18]/15 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00529C]/10 border border-[#00529C]/20 flex items-center justify-center text-[#00529C]">
                <Waves className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#111827] uppercase tracking-wide">
                  Analisis Hidrologi &amp; Elevasi
                </h4>
                <p className="text-[11px] font-bold text-[#4B5563]">
                  Simulasi GeoFlood Engine (ML)
                </p>
              </div>
            </div>

            <span
              className="text-xs font-black px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto border-2 shadow-2xs"
              style={{
                backgroundColor: `${floodColor}15`,
                color: floodColor === "#10B981" ? "#065F46" : floodColor,
                borderColor: floodColor,
              }}
            >
              {floodStatus}
            </span>
          </div>

          <p className="text-xs font-bold text-[#1F2937] leading-relaxed bg-[#F9FAFB] p-3 rounded-xl border border-[#1E1B18]/10">
            {floodNote}
          </p>
        </div>

        {/* ── 3 Cincin Zona Hidup Tabs & Breakdown (CLEAR AFFORDANCE) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-[#00529C]" />
              <h4 className="text-xs font-black text-[#111827] uppercase tracking-wider">
                Pilih Cincin Zona untuk Rincian Fasilitas:
              </h4>
            </div>
            <span className="text-[11px] font-extrabold text-[#00529C] bg-[#00529C]/10 px-2 py-0.5 rounded-md">
              Interaktif
            </span>
          </div>

          {/* Tab Selector 3 Cincin (Clear Interactive Affordance) */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#E5E7EB] rounded-2xl border-2 border-[#1E1B18]/15">
            {/* Tab Ring 1 */}
            <button
              type="button"
              onClick={() => onSelectRingTab("ring1")}
              className={`py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer border-2 ${
                activeRingTab === "ring1"
                  ? "bg-[#FFFFFF] text-[#111827] border-[#10B981] shadow-md scale-102 font-black"
                  : "bg-transparent text-[#374151] border-transparent hover:bg-white/60 font-bold"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-[#065F46] font-extrabold">Ring 1</div>
              <div className="text-sm text-[#065F46] font-black">
                {ring1Score}/100
              </div>
              <div className="text-[10px] text-[#111827] font-extrabold">&lt;500m Tropis</div>
            </button>

            {/* Tab Ring 2 */}
            <button
              type="button"
              onClick={() => onSelectRingTab("ring2")}
              className={`py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer border-2 ${
                activeRingTab === "ring2"
                  ? "bg-[#FFFFFF] text-[#111827] border-[#00529C] shadow-md scale-102 font-black"
                  : "bg-transparent text-[#374151] border-transparent hover:bg-white/60 font-bold"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-[#00529C] font-extrabold">Ring 2</div>
              <div className="text-sm text-[#00529C] font-black">
                {ring2Score}/100
              </div>
              <div className="text-[10px] text-[#111827] font-extrabold">1.5km Feeder</div>
            </button>

            {/* Tab Ring 3 */}
            <button
              type="button"
              onClick={() => onSelectRingTab("ring3")}
              className={`py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer border-2 ${
                activeRingTab === "ring3"
                  ? "bg-[#FFFFFF] text-[#111827] border-[#7C3AED] shadow-md scale-102 font-black"
                  : "bg-transparent text-[#374151] border-transparent hover:bg-white/60 font-bold"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-[#5B21B6] font-extrabold">Ring 3</div>
              <div className="text-sm text-[#5B21B6] font-black">
                {ring3Score}/100
              </div>
              <div className="text-[10px] text-[#111827] font-extrabold">5km Sprawl</div>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border-2 border-[#1E1B18]/15 space-y-3">
            {activeRingTab === "ring1" && (
              <>
                <div className="flex items-center justify-between border-b border-[#1E1B18]/10 pb-2">
                  <span className="text-xs font-black text-[#065F46] uppercase">
                    Ring 1: Mikro-Walkable Tropis (&lt;500m)
                  </span>
                  <span className="text-xs font-bold text-[#111827]">
                    Batas Suhu 33°C &amp; Trotoar
                  </span>
                </div>

                {isPreset && location?.rings.ring1.amenities ? (
                  <div className="space-y-2">
                    {location.rings.ring1.amenities.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1B18]/10 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">{item.icon}</span>
                          <span className="font-extrabold text-[#111827] truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#065F46] bg-[#C7EBD4] px-2.5 py-0.5 rounded-full shrink-0">
                          {item.distance_m} m
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border-2 border-[#1E1B18]/10 text-xs font-bold text-[#111827]">
                    Terdeteksi fasilitas warung makan harian, minimarket, dan apotek dalam radius jalan kaki santai 3–5 menit.
                  </div>
                )}

                {/* Whitespace Alert if available (High Contrast Gold Card) */}
                {(isPreset && location?.rings.ring1.whitespace) ||
                dynamicResult?.data.whitespace_alert ? (
                  <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#D97706] space-y-2.5 mt-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-black text-[#92400E]">
                      <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />
                      <span>PELUANG INVESTOR: LAHAN BASAH (WHITESPACE)</span>
                    </div>

                    <p className="text-xs font-extrabold text-[#78350F] leading-relaxed">
                      {isPreset
                        ? location!.rings.ring1.whitespace!.actionable_insight
                        : `Kawasan padat penduduk namun teridentifikasi celah pasar: ${dynamicResult?.data.whitespace_alert}. Potensi omzet UMKM tinggi.`}
                    </p>

                    <div className="pt-2.5 border-t-2 border-[#D97706]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#78350F]">
                        Rekomendasi Pembiayaan:
                      </span>
                      <span className="text-xs font-black text-[#00529C] bg-white px-3 py-1 rounded-lg border-2 border-[#00529C]/30 shadow-2xs inline-block text-center">
                        KUR Mikro BTN &rarr;
                      </span>
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {activeRingTab === "ring2" && (
              <>
                <div className="flex items-center justify-between border-b border-[#1E1B18]/10 pb-2">
                  <span className="text-xs font-black text-[#00529C] uppercase">
                    Ring 2: Feeder Transit &amp; Roda Dua (1–1,5 km)
                  </span>
                  <span className="text-xs font-black text-[#00529C] bg-[#00529C]/10 px-2.5 py-0.5 rounded-full">
                    Sewa +{isPreset ? location?.rings.ring2.rent_premium_pct : 15}%
                  </span>
                </div>

                {isPreset && location?.rings.ring2.nodes ? (
                  <div className="space-y-2">
                    {location.rings.ring2.nodes.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1B18]/10 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">{item.icon}</span>
                          <span className="font-extrabold text-[#111827] truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#00529C] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full shrink-0 border border-[#00529C]/20">
                          {item.distance_m} m
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border-2 border-[#1E1B18]/10 text-xs font-bold text-[#111827]">
                    Konektivitas transit memadai: akses halte busway dan stasiun commuter dalam rentang 3–5 menit perjalanan motor.
                  </div>
                )}

                <p className="text-xs font-bold text-[#374151] leading-relaxed bg-white p-2.5 rounded-xl border border-[#1E1B18]/10">
                  {isPreset
                    ? location?.rings.ring2.mobility_verdict
                    : "Simpul mobilitas efisien menekan ongkos perjalanan penghuni sehingga meningkatkan daya sewa."}
                </p>
              </>
            )}

            {activeRingTab === "ring3" && (
              <>
                <div className="flex items-center justify-between border-b border-[#1E1B18]/10 pb-2">
                  <span className="text-xs font-black text-[#5B21B6] uppercase">
                    Ring 3: Generator Pasar &amp; Penyangga Sprawl (3–5 km)
                  </span>
                  <span className="text-xs font-extrabold text-[#111827]">
                    Kawasan Industri &amp; Kampus
                  </span>
                </div>

                {isPreset && location?.rings.ring3.anchors ? (
                  <div className="space-y-2">
                    {location.rings.ring3.anchors.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1B18]/10 text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-[#111827] truncate">
                            {item.icon} {item.name}
                          </span>
                          <span className="text-xs font-black text-[#5B21B6] bg-[#FAF5FF] px-2.5 py-0.5 rounded-full shrink-0 border border-[#7C3AED]/20">
                            {(item.distance_m / 1000).toFixed(1)} km
                          </span>
                        </div>
                        {item.estimated_population && (
                          <p className="text-xs font-bold text-[#4B5563]">
                            👥 {item.estimated_population}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border-2 border-[#1E1B18]/10 text-xs font-bold text-[#111827]">
                    Didukung sentra tenaga kerja dan institusi pendidikan dalam radius 5 km sebagai sumber calon penyewa berkelanjutan.
                  </div>
                )}

                <p className="text-xs font-bold text-[#374151] leading-relaxed bg-white p-2.5 rounded-xl border border-[#1E1B18]/10">
                  {isPreset
                    ? location?.rings.ring3.demand_verdict
                    : "Penyangga okupansi memastikan kost tidak mengalami masa kosong berkepanjangan."}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Footer Rekomendasi Bank BTN (Bold High Contrast) ── */}
      <div className="p-4 border-t-2 border-[#1E1B18]/10 bg-[#F9FAFB] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#111827]">
            Keputusan Kelayakan Sistem:
          </span>
          <span className="text-xs font-black text-[#00529C] bg-[#00529C]/10 px-2.5 py-0.5 rounded-full">
            BTN Housing Ecosystem
          </span>
        </div>

        {onNavigateToFund ? (
          <button
            type="button"
            onClick={onNavigateToFund}
            className="text-xs sm:text-sm font-black text-[#00529C] hover:text-white bg-white hover:bg-[#00529C] p-3 rounded-xl border-2 border-[#00529C]/40 flex items-center justify-between shadow-xs transition-all cursor-pointer group text-left"
          >
            <div>
              <span className="block text-[#111827] group-hover:text-white font-black">{bankVerdict}</span>
              <span className="block text-[11px] font-extrabold text-[#065F46] group-hover:text-[#C7EBD4] mt-0.5">
                👉 Klik di sini untuk simulasikan Dana Talang di OsFund &rarr;
              </span>
            </div>
            <ArrowUpRight className="w-5 h-5 text-[#00529C] group-hover:text-white shrink-0 ml-2" />
          </button>
        ) : (
          <div className="text-xs sm:text-sm font-black text-[#111827] bg-white p-3 rounded-xl border-2 border-[#00529C]/40 flex items-center justify-between shadow-xs">
            <span>{bankVerdict}</span>
            <ArrowUpRight className="w-5 h-5 text-[#00529C] shrink-0" />
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(30, 27, 24, 0.25);
          border-radius: 9999px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(30, 27, 24, 0.45);
        }
      `}</style>
    </div>
  );
}
