"use client";

import { useState, useMemo } from "react";
import {
  ECOSYSTEM_PACKAGES,
  calculateAutoSplit,
  type EcosystemPackage,
} from "../data/mock-fund";
import {
  Coins,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  Building,
  Lock,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck2,
} from "lucide-react";

export function OsFundView() {
  // State paket ekosistem terpilih
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>(
    ECOSYSTEM_PACKAGES.map((p) => p.id)
  );

  // State parameter kalkulator auto-split
  const [newRoomsCount, setNewRoomsCount] = useState<number>(5);
  const [rentPricePerRoom, setRentPricePerRoom] = useState<number>(1500000);
  const [splitPctBtn, setSplitPctBtn] = useState<number>(25);
  const [occupancyPct, setOccupancyPct] = useState<number>(90);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Toggle pilihan paket
  const togglePackage = (pkgId: string) => {
    setSelectedPackageIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  // Hitung total RAB dari paket terpilih
  const totalLoanAmount = useMemo(() => {
    return ECOSYSTEM_PACKAGES.filter((p) =>
      selectedPackageIds.includes(p.id)
    ).reduce((sum, p) => sum + p.costEstimate, 0);
  }, [selectedPackageIds]);

  // Hitung hasil simulasi auto-split
  const simulation = useMemo(() => {
    return calculateAutoSplit({
      totalLoanAmount,
      newRoomsCount,
      rentPricePerRoom,
      occupancyRatePct: occupancyPct,
      splitPercentageBtn: splitPctBtn,
    });
  }, [totalLoanAmount, newRoomsCount, rentPricePerRoom, occupancyPct, splitPctBtn]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* ── Banner Konsep Utama OsFund ── */}
      <div className="p-6 bg-gradient-to-br from-[#00529C]/10 via-[#FFFFFF] to-[#EFF6FF] rounded-3xl border-2 border-[#00529C]/30 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00529C] text-white text-xs font-black uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5 text-[#C7EBD4]" />
            <span>Revenue-Financed Renovation Hub</span>
          </div>

          <h2 className="font-editorial text-2xl sm:text-3xl font-black text-[#111827]">
            OsFund — Pembiayaan Renovasi Kost Tanpa Cicilan Tetap
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-[#1F2937] leading-relaxed">
            Pemilik kost dapat merenovasi atau menambah kamar menggunakan karya
            alumni pemenang BTN Housingpreneur yang didanai Bank BTN, dan dilunasi secara{" "}
            <span className="font-bold text-[#00529C]">
              Auto-Split (Potong Otomatis Persentase Uang Sewa)
            </span>
            . Tidak ada cicilan tetap yang memberatkan saat kamar sedang kosong!
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border-2 border-[#1E1B18]/15 shadow-xs shrink-0 flex flex-col items-center sm:items-start">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#065F46] bg-[#C7EBD4] px-2.5 py-0.5 rounded-full">
            Model Win-Win-Win
          </span>
          <div className="text-xs font-bold text-[#111827] mt-2 space-y-1">
            <p>✅ Owner: Bangunan baru, cicilan fleksibel</p>
            <p>✅ BTN: Arus kas aman terpotong di sistem</p>
            <p>✅ Vendor: Produk juara BTN terserap pasar</p>
          </div>
        </div>
      </div>

      {/* ── LANGKAH 1: Pilih Paket Ekosistem Juara BTN ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#1E1B18]/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#00529C] text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <h3 className="font-editorial text-xl sm:text-2xl font-black text-[#111827]">
                Pilih Paket Ekosistem Juara BTN Housingpreneur
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#4B5563] mt-1">
              Pilih komponen vendor siap pakai untuk menghitung Rencana Anggaran Biaya (RAB) otomatis:
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4B5563]">
              Estimasi Total Plafon RAB:
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#00529C]">
              {formatRupiah(totalLoanAmount)}
            </div>
          </div>
        </div>

        {/* Bento Grid 4 Paket Ekosistem */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ECOSYSTEM_PACKAGES.map((pkg) => {
            const isSelected = selectedPackageIds.includes(pkg.id);
            return (
              <div
                key={pkg.id}
                onClick={() => togglePackage(pkg.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 select-none ${
                  isSelected
                    ? "bg-[#FFFFFF] border-[#00529C] shadow-md scale-101"
                    : "bg-[#F9FAFB] border-[#E5E7EB] opacity-65 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-2xl">{pkg.icon}</span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? "bg-[#00529C] border-[#00529C] text-white"
                          : "bg-white border-[#9CA3AF] text-transparent"
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  <span className="text-[10px] font-black text-[#00529C] bg-[#00529C]/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                    {pkg.winnerAward}
                  </span>

                  <h4 className="text-sm font-black text-[#111827] leading-tight">
                    {pkg.title}
                  </h4>

                  <p className="text-[11px] font-bold text-[#00529C] mt-1">
                    Partner: {pkg.partnerName}
                  </p>

                  <p className="text-xs font-medium text-[#4B5563] mt-2 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-[#1E1B18]/10 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-[#4B5563]">
                    Estimasi Biaya:
                  </span>
                  <span className="text-xs font-black text-[#111827]">
                    {formatRupiah(pkg.costEstimate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LANGKAH 2: Kalkulator Interaktif Auto-Split ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-[#1E1B18]/10 pb-3">
          <span className="w-6 h-6 rounded-lg bg-[#00529C] text-white text-xs font-black flex items-center justify-center">
            2
          </span>
          <div>
            <h3 className="font-editorial text-xl sm:text-2xl font-black text-[#111827]">
              Simulasi Finansial Bagi Hasil Otomatis (Auto-Split Payment)
            </h3>
            <p className="text-xs font-semibold text-[#4B5563] mt-0.5">
              Geser parameter di bawah untuk melihat simulasi pemotongan sewa bulanan:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Controls Input (5 Kolom di Desktop) */}
          <div className="lg:col-span-5 p-6 bg-white rounded-3xl border-2 border-[#1E1B18]/15 shadow-sm space-y-5">
            <span className="text-xs font-black uppercase tracking-wider text-[#00529C] bg-[#00529C]/10 px-3 py-1 rounded-md inline-block">
              Parameter Kost
            </span>

            {/* Slider 1: Jumlah Kamar Baru */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-[#111827]">
                <span>Tambahan Kamar Baru Hasil Renovasi:</span>
                <span className="text-sm font-black text-[#00529C] bg-[#EFF6FF] px-2.5 py-0.5 rounded-lg border border-[#00529C]/30">
                  {newRoomsCount} Kamar
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={newRoomsCount}
                onChange={(e) => setNewRoomsCount(Number(e.target.value))}
                className="w-full accent-[#00529C] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#6B7280]">
                <span>2 Kamar</span>
                <span>8 Kamar</span>
                <span>15 Kamar</span>
              </div>
            </div>

            {/* Slider 2: Tarif Sewa per Kamar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-[#111827]">
                <span>Tarif Sewa per Kamar / Bulan:</span>
                <span className="text-sm font-black text-[#00529C] bg-[#EFF6FF] px-2.5 py-0.5 rounded-lg border border-[#00529C]/30">
                  {formatRupiah(rentPricePerRoom)}
                </span>
              </div>
              <input
                type="range"
                min="800000"
                max="3000000"
                step="100000"
                value={rentPricePerRoom}
                onChange={(e) => setRentPricePerRoom(Number(e.target.value))}
                className="w-full accent-[#00529C] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#6B7280]">
                <span>Rp 800 Ribu</span>
                <span>Rp 1,8 Juta</span>
                <span>Rp 3,0 Juta</span>
              </div>
            </div>

            {/* Slider 3: Persentase Potong Auto-Split ke BTN */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-[#111827]">
                <span>Porsi Auto-Split untuk Cicilan BTN:</span>
                <span className="text-sm font-black text-[#10B981] bg-[#F0FDF4] px-2.5 py-0.5 rounded-lg border border-[#10B981]/30">
                  {splitPctBtn}% (Owner: {100 - splitPctBtn}%)
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="40"
                step="5"
                value={splitPctBtn}
                onChange={(e) => setSplitPctBtn(Number(e.target.value))}
                className="w-full accent-[#10B981] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#6B7280]">
                <span>15% (Santai)</span>
                <span>25% (Rekomendasi)</span>
                <span>40% (Cepat Lunas)</span>
              </div>
            </div>

            {/* Slider 4: Asumsi Okupansi */}
            <div className="space-y-2 pt-2 border-t-2 border-[#1E1B18]/10">
              <div className="flex justify-between items-center text-xs font-black text-[#111827]">
                <span>Asumsi Tingkat Okupansi Kost:</span>
                <span className="text-xs font-bold text-[#374151]">
                  {occupancyPct}% (Didukung Ring 3 Anchor)
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                step="5"
                value={occupancyPct}
                onChange={(e) => setOccupancyPct(Number(e.target.value))}
                className="w-full accent-[#00529C] cursor-pointer"
              />
            </div>
          </div>

          {/* Result Presentation Card (7 Kolom di Desktop) */}
          <div className="lg:col-span-7 p-6 bg-white rounded-3xl border-2 border-[#1E1B18]/15 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#1E1B18]/10 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#111827]">
                  Diagram Aliran Dana Auto-Split
                </span>
                <span className="text-xs font-black text-[#00529C] bg-[#00529C]/10 px-2.5 py-0.5 rounded-full">
                  Tanpa Cicilan Tetap
                </span>
              </div>

              {/* Visual Split Diagram */}
              <div className="p-4 rounded-2xl bg-[#F8F6F1] border-2 border-[#1E1B18]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4B5563]">
                    Total Uang Sewa Masuk ({newRoomsCount} kamar × {occupancyPct}% okupansi):
                  </span>
                  <span className="text-sm font-black text-[#111827]">
                    {formatRupiah(simulation.monthlyGrossRevenue)} / bulan
                  </span>
                </div>

                {/* Visual Branch Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Branch BTN */}
                  <div className="p-3.5 rounded-xl bg-[#EFF6FF] border-2 border-[#00529C]/30 space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#00529C] tracking-wide">
                      ⚡ {splitPctBtn}% Otomatis ke BTN
                    </span>
                    <div className="text-lg font-black text-[#00529C]">
                      {formatRupiah(simulation.monthlyBtnRepayment)}
                    </div>
                    <p className="text-[10px] font-semibold text-[#1F2937]">
                      Melunasi dana talang secara bertahap saat kamar terisi.
                    </p>
                  </div>

                  {/* Branch Owner */}
                  <div className="p-3.5 rounded-xl bg-[#F0FDF4] border-2 border-[#10B981]/30 space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#065F46] tracking-wide">
                      💰 {100 - splitPctBtn}% Bersih ke Rekening Owner
                    </span>
                    <div className="text-lg font-black text-[#065F46]">
                      {formatRupiah(simulation.monthlyOwnerNetIncome)}
                    </div>
                    <p className="text-[10px] font-semibold text-[#1F2937]">
                      Langsung dinikmati pemilik tanpa potongan tersembunyi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Highlights Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF5FF] border-2 border-[#7C3AED]/30">
                  <span className="text-[10px] font-black uppercase text-[#5B21B6] tracking-wider">
                    Estimasi Waktu Lunas:
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#5B21B6]">
                      ~{simulation.estimatedPayoffMonths}
                    </span>
                    <span className="text-xs font-bold text-[#5B21B6]">Bulan</span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#5B21B6] mt-1">
                    Hanya sekitar {(simulation.estimatedPayoffMonths / 12).toFixed(1)} tahun!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#D97706]/30">
                  <span className="text-[10px] font-black uppercase text-[#B45309] tracking-wider">
                    Tambahan Omzet Bersih Owner:
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#B45309]">
                      +{formatRupiah(simulation.annualOwnerExtraRevenue)}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#B45309] mt-1">
                    Per tahun pasca-pelunasan dana talang.
                  </p>
                </div>
              </div>
            </div>

            {/* ── LANGKAH 3: Jaminan Anti-Curang IoT (OsNode) ── */}
            <div className="p-4 rounded-2xl bg-[#111827] text-white space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C7EBD4]">
                  Jaminan Kepatuhan IoT (OsNode Enforcer)
                </h4>
              </div>
              <p className="text-xs font-medium text-white/80 leading-relaxed">
                Mengapa modal Bank BTN aman? Kunci e-KTP dan relay listrik kamar dikontrol
                langsung oleh status pembayaran di server. Pembayaran wajib tercatat lewat
                sistem OsKost–BTN untuk mengaktifkan akses kamar, menghilangkan risiko
                pembayaran tunai di bawah tangan.
              </p>
            </div>

            {/* Submission Action Button */}
            <div>
              {isSubmitted ? (
                <div className="p-4 bg-[#C7EBD4] rounded-2xl border-2 border-[#10B981] flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#065F46] shrink-0" />
                  <div>
                    <h5 className="text-xs font-black text-[#065F46]">
                      Simulasi Pengajuan Berhasil Disimpan!
                    </h5>
                    <p className="text-[11px] font-semibold text-[#065F46]/90">
                      Dokumen RAB dan jadwal survei lapangan siap dicetak untuk evaluasi kredit mikro Bank BTN.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSubmitted(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-[#00529C] hover:bg-[#003E75] text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(0,82,156,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileCheck2 className="w-5 h-5" />
                  <span>Simulasikan &amp; Unduh Proposal Dana Talang BTN</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}

              <p className="text-[10px] font-semibold text-[#6B7280] text-center mt-2">
                *Simulasi model bisnis yang diajukan untuk validasi regulasi OJK &amp; business matching resmi bersama Bank BTN selama masa inkubasi 3 bulan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

