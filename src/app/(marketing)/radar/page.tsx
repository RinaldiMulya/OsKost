import type { Metadata } from "next";
import { HousingIntelligenceHub } from "@/features/intelligence";
import {
  Sparkles,
  Compass,
  ShieldCheck,
  TrendingUp,
  MousePointerClick,
  SunMedium,
  Bike,
  Building2,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "OsRadar — Tropical Transit-Oriented Living | OsKost Housing Intelligence",
  description:
    "Validasi kelayakan lokasi hunian berbasis Tropical Transit-Oriented Living (TTOL) Framework: adaptasi konsep 15-Minute City untuk iklim tropis, mobilitas roda dua, dan diagnostik ketimpangan fasilitas perumahan di Indonesia.",
  keywords: [
    "tropical transit oriented living",
    "spatial roi",
    "housing intelligence",
    "risiko banjir",
    "15 minute living indonesia",
    "btn housingpreneur",
    "investasi kost",
    "analisis lokasi properti",
  ],
};

export default function RadarPage() {
  return (
    <div className="w-full pt-28 pb-20 px-4 sm:px-6 lg:px-18 max-w-8xl mx-auto">
      {/* ── 1. Header & Konsep Inti ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 pb-6 border-b border-[#1E1B18]/10">
        <div className="max-w-3xl">
          {/* Badge Platform Category */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00529C] text-white text-xs font-bold tracking-wider uppercase mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C7EBD4]" />
            <span>OsKost Housing Intelligence Platform</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
            OsRadar — Spatial ROI &amp; Risk Scanner
          </h1>

          <p className="font-ui text-sm sm:text-base text-[#1F2937] mt-3.5 font-medium leading-relaxed">
            Evaluasi kelayakan properti berbasis{" "}
            <span className="font-bold text-[#00529C] underline decoration-[#00529C]/30 underline-offset-4">
              Tropical Transit-Oriented Living (TTOL) Framework
            </span>
            : rekayasa model 15-Minute Living yang dikalibrasi khusus untuk
            iklim tropis, budaya mobilitas roda dua, serta diagnostik
            ketimpangan fasilitas perumahan di Indonesia.
          </p>

          {/* Banner Interaktif: Panduan Khusus Juri */}
          <div className="mt-4 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#00529C]/10 border border-[#00529C]/30 text-[#00529C] text-xs font-bold">
            <MousePointerClick className="w-4 h-4 shrink-0 text-[#00529C] animate-bounce" />
            <span>
              Panduan Demo: Pilih preset lokasi di bawah atau klik sembarang
              titik di peta untuk memindai koordinat baru.
            </span>
          </div>
        </div>

        {/* 3 Value Pillars Badges (High Contrast) */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-white rounded-2xl border-2 border-[#1E1B18]/15 shadow-sm shrink-0">
          <div className="flex flex-col items-center text-center px-2">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 flex items-center justify-center mb-1.5">
              <Compass className="w-4 h-4 text-[#065F46]" />
            </div>
            <span className="text-xs font-extrabold text-[#111827]">
              TTOL Tropis
            </span>
            <span className="text-[11px] font-bold text-[#065F46]">
              Walkable &amp; Feeder
            </span>
          </div>

          <div className="flex flex-col items-center text-center px-2 border-x-2 border-[#1E1B18]/10">
            <div className="w-8 h-8 rounded-xl bg-[#00529C]/15 flex items-center justify-center mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00529C]" />
            </div>
            <span className="text-xs font-extrabold text-[#111827]">
              Aman Banjir
            </span>
            <span className="text-[11px] font-bold text-[#00529C]">
              Model Hidrologi
            </span>
          </div>

          <div className="flex flex-col items-center text-center px-2">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center mb-1.5">
              <TrendingUp className="w-4 h-4 text-[#5B21B6]" />
            </div>
            <span className="text-xs font-extrabold text-[#111827]">
              Lahan Basah
            </span>
            <span className="text-[11px] font-bold text-[#5B21B6]">
              Peluang Investor
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Main Interactive Hub: OsRadar (Spatial ROI) & OsFund (Dana Talang) ── */}
      <HousingIntelligenceHub />

      {/* ── 3. Metodologi: Rekalibrasi untuk Realitas Indonesia ── */}
      <div className="mt-14 p-6 sm:p-8 bg-white rounded-3xl border-2 border-[#1E1B18]/15 shadow-md space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-2 border-[#1E1B18]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00529C] bg-[#00529C]/10 px-2.5 py-0.5 rounded-md">
                Standarisasi Metodologi
              </span>
              <span className="text-xs font-bold text-[#4B5563]">
                Adaptasi Nyata Karakteristik Indonesia
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
              Tropical Transit-Oriented Living (TTOL) Framework
            </h2>
            <p className="text-xs font-semibold text-[#4B5563] mt-1">
              Mengapa konsep 15-Minute City Carlos Moreno tidak bisa diimpor
              mentah-mentah ke Indonesia tanpa rekayasa lokal?
            </p>
          </div>

          <span className="text-xs font-bold font-mono px-3 py-1 bg-[#111827] text-white rounded-lg self-start lg:self-auto shrink-0">
            BTN Housing Innovation Framework
          </span>
        </div>

        {/* 4 Pilar Rekayasa Lokal Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pilar 1: Suhu Tropis & Trotoar */}
          <div className="p-5 rounded-2xl bg-[#F0FDF4] border-2 border-[#10B981]/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-xl bg-[#10B981] text-white text-xs font-black flex items-center justify-center shadow-xs">
                  <SunMedium className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-[#065F46] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-[#10B981]/30">
                  Radius &lt; 500 M
                </span>
              </div>
              <h3 className="text-sm font-black text-[#111827]">
                1. Mikro-Walkable Tropis
              </h3>
              <p className="text-xs font-semibold text-[#1F2937] leading-relaxed mt-2">
                Di iklim tropis 33°C dengan trotoar terbatas, batas kenyamanan
                pejalan kaki adalah{" "}
                <strong>maksimal 300–500 meter (3–5 menit)</strong>. Sistem
                hanya memvalidasi warteg, minimarket, sembako, dan apotek yang
                benar-benar bisa dijangkau tanpa motor.
              </p>
            </div>
            <div className="pt-3 border-t border-[#10B981]/25">
              <span className="text-[11px] font-bold text-[#065F46]">
                ✅ Solusi: Penilaian kenyamanan harian riil penghuni.
              </span>
            </div>
          </div>

          {/* Pilar 2: Feeder Roda Dua */}
          <div className="p-5 rounded-2xl bg-[#EFF6FF] border-2 border-[#00529C]/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-xl bg-[#00529C] text-white text-xs font-black flex items-center justify-center shadow-xs">
                  <Bike className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-[#00529C] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-[#00529C]/30">
                  Radius 1–1.5 KM
                </span>
              </div>
              <h3 className="text-sm font-black text-[#111827]">
                2. Feeder Motor &amp; Transit
              </h3>
              <p className="text-xs font-semibold text-[#1F2937] leading-relaxed mt-2">
                Bukan utopia anti-kendaraan, melainkan mengakui sepeda motor
                sebagai{" "}
                <strong>
                  penyambung first-mile/last-mile tercepat (3–5 menit)
                </strong>{" "}
                menuju simpul angkutan massal: Halte JakLingko, Stasiun KRL/LRT,
                dan SPBU.
              </p>
            </div>
            <div className="pt-3 border-t border-[#00529C]/25">
              <span className="text-[11px] font-bold text-[#00529C]">
                ✅ Solusi: Menekan ongkos komuter &amp; menaikkan sewa +15–20%.
              </span>
            </div>
          </div>

          {/* Pilar 3: Penyangga Urban Sprawl */}
          <div className="p-5 rounded-2xl bg-[#FAF5FF] border-2 border-[#7C3AED]/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white text-xs font-black flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-[#5B21B6] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-[#7C3AED]/30">
                  Radius 3–5 KM
                </span>
              </div>
              <h3 className="text-sm font-black text-[#111827]">
                3. Penyangga Urban Sprawl
              </h3>
              <p className="text-xs font-semibold text-[#1F2937] leading-relaxed mt-2">
                Mengatasi pemekaran kota pinggiran dengan memetakan{" "}
                <strong>generator kerja riil lokal</strong>: Kawasan Industri
                (seperti JIEP/MM2100), sentra pabrik, kampus universitas, dan
                RSUD rujukan tipe B.
              </p>
            </div>
            <div className="pt-3 border-t border-[#7C3AED]/25">
              <span className="text-[11px] font-bold text-[#5B21B6]">
                ✅ Solusi: Penjamin keterisian (okupansi &gt; 85%) kredit BTN.
              </span>
            </div>
          </div>

          {/* Pilar 4: Diagnostik Ketimpangan Spasial */}
          <div className="p-5 rounded-2xl bg-[#FFFBEB] border-2 border-[#D97706]/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-xl bg-[#D97706] text-white text-xs font-black flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-[#B45309] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-[#D97706]/30">
                  Celah Pasar
                </span>
              </div>
              <h3 className="text-sm font-black text-[#111827]">
                4. Diagnostik Ketimpangan
              </h3>
              <p className="text-xs font-semibold text-[#1F2937] leading-relaxed mt-2">
                Karena fasilitas di Indonesia sangat timpang dan terpusat di
                inti kota, OsRadar mendeteksi kantong hunian yang padat namun{" "}
                <strong>
                  defisit layanan primer (seperti laundry kiloan / apotek 24
                  jam)
                </strong>
                .
              </p>
            </div>
            <div className="pt-3 border-t border-[#D97706]/25">
              <span className="text-[11px] font-bold text-[#B45309]">
                ✅ Solusi: Target akurat penyaluran KUR Mikro Bank BTN.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
