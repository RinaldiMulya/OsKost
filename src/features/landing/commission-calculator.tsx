"use client";

import { useState } from "react";
import { Calculator, TrendingUp, CheckCircle, ArrowRight, Wallet } from "lucide-react";

export function CommissionCalculator() {
  const [roomCount, setRoomCount] = useState<number>(20);
  const [roomPrice, setRoomPrice] = useState<number>(1500000);

  // Perhitungan
  const monthlyRevenue = roomCount * roomPrice;
  const yearlyRevenue = monthlyRevenue * 12;

  // Potongan Aplikasi Lain (15%)
  const otherMonthlyCut = monthlyRevenue * 0.15;
  const otherYearlyCut = otherMonthlyCut * 12;

  // Biaya OsKost
  let oskostMonthlyFee = 69000;
  let oskostTier = "Starter";
  if (roomCount <= 5) {
    oskostMonthlyFee = 0;
    oskostTier = "Free";
  } else if (roomCount <= 15) {
    oskostMonthlyFee = 69000;
    oskostTier = "Starter";
  } else if (roomCount <= 40) {
    oskostMonthlyFee = 179000;
    oskostTier = "Growth";
  } else {
    oskostMonthlyFee = 349000;
    oskostTier = "Pro";
  }
  const oskostYearlyFee = oskostMonthlyFee * 12;

  // Penghematan Bersih
  const yearlySavings = otherYearlyCut - oskostYearlyFee;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <section id="kalkulator" className="w-full bg-[#FFFFFF] py-14 sm:py-20 border-b border-[#2C2825]/6 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-3">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kalkulator Cuan Pemilik Kost</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight mb-4">
            Berapa Banyak Uang Anda Terpotong di Aplikasi Agregator Lain?
          </h2>
          <p className="text-sm sm:text-base text-[#4A453F] leading-relaxed">
            Aplikasi agregator umumnya memotong komisi <strong>13% – 20%</strong> dari setiap uang sewa yang masuk. 
            Di OsKost, Anda hanya membayar biaya langganan flat tanpa potongan komisi seperserpun.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-[#F8F6F1] rounded-3xl p-6 sm:p-10 border border-[#2C2825]/10 shadow-[0_15px_40px_rgba(44,40,37,0.06)]">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#4A453F] block mb-2">
                Pilih Jumlah Unit Kamar Kost
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((count) => (
                  <button
                    key={count}
                    onClick={() => setRoomCount(count)}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                      roomCount === count
                        ? "bg-[#8C6239] text-white shadow-xs"
                        : "bg-white text-[#1E1B18] border border-[#2C2825]/10 hover:bg-[#EFE7DE]"
                    }`}
                  >
                    {count} Kmr
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#4A453F] block mb-2">
                Estimasi Harga Sewa Rata-Rata / Kamar
              </label>
              <select
                value={roomPrice}
                onChange={(e) => setRoomPrice(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#2C2825]/15 text-sm font-semibold text-[#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/40"
              >
                <option value={1000000}>Rp 1.000.000 / bulan</option>
                <option value={1500000}>Rp 1.500.000 / bulan (Standar)</option>
                <option value={2000000}>Rp 2.000.000 / bulan</option>
                <option value={2500000}>Rp 2.500.000 / bulan (Eksklusif)</option>
              </select>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch mb-8">
            {/* Other App Card */}
            <div className="p-6 rounded-2xl bg-white/70 border border-red-200/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  Agregator Lain (Potongan 15%)
                </span>
                <div className="mt-4 text-xs text-[#757069]">Uang Terpotong Tiap Bulan:</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  - {formatIDR(otherMonthlyCut)} / bln
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-red-100 text-xs text-[#757069]">
                Total potongan sewa setahun: <strong className="text-red-700">{formatIDR(otherYearlyCut)}</strong> melayang ke pihak ketiga.
              </div>
            </div>

            {/* OsKost Card */}
            <div className="p-6 rounded-2xl bg-white border-2 border-[#8C6239] shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#8C6239] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                Paket {oskostTier}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C6239] bg-[#8C6239]/10 px-3 py-1 rounded-full">
                  Pakai Platform OsKost (0% Komisi)
                </span>
                <div className="mt-4 text-xs text-[#757069]">Biaya Langganan Flat:</div>
                <div className="text-xl sm:text-2xl font-bold text-[#1E1B18]">
                  {formatIDR(oskostMonthlyFee)} <span className="text-xs font-normal text-[#757069]">/ bln</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#8C6239]/15 text-xs text-[#5D6654]">
                Biaya software setahun: <strong>{formatIDR(oskostYearlyFee)}</strong>. Uang sewa 100% masuk ke rekening Anda!
              </div>
            </div>
          </div>

          {/* Big Savings Callout */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Estimasi Penghematan Bersih Anda:
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-0.5">
                Hemat {formatIDR(yearlySavings)} / tahun
              </div>
            </div>
            <a
              href="#pemilik-kost"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs sm:text-sm hover:bg-emerald-800 transition-colors shrink-0"
            >
              <span>Lihat Paket SaaS</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

