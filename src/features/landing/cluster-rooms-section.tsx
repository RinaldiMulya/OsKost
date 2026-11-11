"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wifi,
  Wind,
  ShowerHead,
  Bed,
  Calendar,
  ArrowRight,
  MapPin,
  Building2,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  Key,
  Tv,
  Coffee,
  Users,
  Phone,
  Copy,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Share2,
  Eye,
  Smartphone,
} from "lucide-react";
import type {
  RoomDetail,
  PropertyWithStats,
} from "@/features/rooms/room-service";

interface ClusterRoomsSectionProps {
  property?: PropertyWithStats | null;
  rooms?: RoomDetail[];
}

export function ClusterRoomsSection({
  property,
  rooms = [],
}: ClusterRoomsSectionProps) {
  // Modal states
  const [activeModalRoom, setActiveModalRoom] = useState<RoomDetail | null>(
    null,
  );
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [voucherCopied, setVoucherCopied] = useState<boolean>(false);

  // Default fallback property if not provided
  const propInfo = property || {
    id: "pulo-jahe",
    name: "OSkost Pulo Jahe Cakung",
    slug: "pulo-jahe",
    address: "Jl. Pulo Jahe No. 104b, Jatinegara, Kec. Cakung, Jakarta Timur",
    managerPhone: "087890976782",
    guardPhone: "08123456789",
    totalRooms: rooms.length || 11,
    availableRooms: rooms.filter((r) => r.status === "AVAILABLE").length || 6,
    occupiedRooms: rooms.filter((r) => r.status === "OCCUPIED").length || 5,
    maintenanceRooms: 0,
  };

  // Take top 4 representative rooms for the Landing Page showcase (Standard & Large)
  const showcaseRooms = rooms.length > 0 ? rooms.slice(0, 4) : [];

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText("OSKOST250K");
    setVoucherCopied(true);
    setTimeout(() => setVoucherCopied(false), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C7EBD4] text-[#2C4C3B] font-ui text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#2C4C3B] animate-pulse" />
            Tersedia
          </span>
        );
      case "OCCUPIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9E1D9] text-[#757069] font-ui text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#757069]" />
            Terisi
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDDB6] text-[#784C00] font-ui text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#784C00]" />
            Sedang Maintain
          </span>
        );
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section
      id="kamar"
      className="w-full bg-[#F8F6F1] py-8 sm:py-10 lg:py-10 border-b border-[#2C2825]/8"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8 lg:gap-8">
        {/* ========================================================
                    1. FEATURED INTRO BANNER
                   ======================================================== */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 lg:p-8 shadow-[0_4px_24px_rgba(44,40,37,0.06)] border border-[#2C2825]/8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 relative overflow-hidden">
          <div className="flex-1 flex flex-col items-start gap-4 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE7DE] text-[#A45A3D]">
              <Building2 className="w-4 h-4 text-[#A45A3D]" />
              <span className="font-ui text-xs font-bold uppercase tracking-wider">
                Katalog Residensi &amp; Unit Kamar
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight leading-tight">
              Koleksi Ruang Tenang &amp; Terkurasi
            </h2>
            <p className="font-ui text-base sm:text-lg text-[#38332E] leading-relaxed max-w-xl">
              Eksplorasi kost modern terintegrasi IoT di kawasan Cakung - Pulo
              Jahe. 100% data live realtime, WiFi fiber ultra cepat, dan
              transparansi harga sewa tanpa biaya tersembunyi.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[#38332E]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF2EA] text-xs sm:text-sm font-semibold text-[#2C4C3B] border border-[#2C2825]/8">
                <ShieldCheck className="w-4 h-4 text-[#2C4C3B]" />
                <span>100% Terverifikasi</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF2EA] text-xs sm:text-sm font-semibold text-[#A45A3D] border border-[#2C2825]/8">
                <Wifi className="w-4 h-4 text-[#A45A3D]" />
                <span>WiFi Fiber Dedicated</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF2EA] text-xs sm:text-sm font-semibold text-[#C98A2C] border border-[#2C2825]/8">
                <Smartphone className="w-4 h-4 text-[#C98A2C]" />
                <span>Mobile Smart App</span>
              </div>
            </div>
          </div>

          {/* Promo Highlight Card */}
          <div className="w-full lg:w-96 bg-[#FAF2EA] rounded-2xl p-5 flex flex-col gap-3.5 border border-[#2C2825]/8 shadow-sm z-10">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
              <Image
                src="/images/hero-bg.webp"
                alt="Promo Kontrak OsKost"
                fill
                className="object-cover"
              />
              <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-[#A45A3D] text-white font-ui text-xs font-bold tracking-wider uppercase">
                Promo Bulan Ini
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-ui text-xs font-bold text-[#C98A2C] uppercase tracking-wider">
                Potongan Rp 150.000 / Bulan
              </span>
              <h4 className="font-editorial text-lg sm:text-xl font-bold text-[#1E1B18]">
                Paket Kontrak 6+ Bulan
              </h4>
              <p className="font-ui text-sm text-[#38332E]">
                Berlaku untuk unit Tipe Standar &amp; Deluxe di OSkost Pulo
                Jahe.
              </p>
            </div>
            <button
              onClick={() => setShowVoucherModal(true)}
              className="w-full mt-1 py-3 rounded-xl bg-[#A45A3D] hover:bg-[#864327] text-white font-ui text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Klaim Voucher Promo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================
                    2. PROPERTY HEADER (REALTIME DARI DATABASE)
                   ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EFE7DE] pb-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1B18]">
                {propInfo.name}
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#C7EBD4] text-[#2C4C3B] text-xs font-bold tracking-wider uppercase">
                Industrial Hub
              </span>
              <span className="px-3 py-1 rounded-full bg-[#EFE7DE] text-[#A45A3D] text-xs font-bold tracking-wider uppercase">
                {propInfo.availableRooms} Kamar Tersedia
              </span>
            </div>
            <p className="font-ui text-sm sm:text-base text-[#38332E] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#A45A3D] shrink-0" />
              <span>
                {propInfo.address} • Dekat Pabrik PT Yamaha Motor Parts &amp;
                Stasiun Buaran
              </span>
            </p>
          </div>

          <Link
            href="/kamar"
            className="inline-flex items-center gap-2 text-[#A45A3D] hover:text-[#864327] font-ui text-sm sm:text-base font-bold group transition-colors"
          >
            <span>Lihat Semua Unit ({propInfo.totalRooms} Kamar)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ========================================================
                    3. ROOMS SHOWCASE GRID (SAMPLE 4 KAMAR REALTIME)
                   ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseRooms.map((room) => {
            const isAvailable = room.status === "AVAILABLE";
            const roomImg = room.images?.[0] || "/images/rooms/room-1.webp";

            return (
              <div
                key={room.id}
                className="bg-[#FFFFFF] rounded-2xl p-4 flex flex-col gap-3.5 border border-[#2C2825]/8 shadow-[0_4px_16px_rgba(44,40,37,0.04)] hover:shadow-[0_12px_28px_rgba(44,40,37,0.08)] hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Room Image Container */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#EFE7DE]">
                  <Image
                    src={roomImg}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    {getStatusBadge(room.status)}
                  </div>

                  {/* Room Number Tag */}
                  <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-lg bg-[#1E1B18]/85 backdrop-blur-md text-white text-xs font-bold">
                    No. {room.number}
                  </div>
                </div>

                {/* Room Content */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-editorial text-lg font-bold text-[#1E1B18]">
                      {room.name}
                    </h4>
                    <span className="text-xs font-bold text-[#A45A3D] uppercase tracking-wider bg-[#A45A3D]/10 px-2.5 py-0.5 rounded-md">
                      {room.type || "Standar"}
                    </span>
                  </div>
                  <p className="font-ui text-sm text-[#38332E] line-clamp-1">
                    {room.description || "Fasilitas lengkap & nyaman."}
                  </p>
                </div>

                {/* Facility Tags */}
                <div className="flex flex-wrap gap-1.5 text-[#38332E]">
                  {room.facilities.slice(0, 3).map((fac, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF2EA] text-xs font-medium text-[#4A453F]"
                    >
                      {fac}
                    </span>
                  ))}
                </div>

                {/* Price & Actions */}
                <div className="mt-auto pt-2 border-t border-[#2C2825]/8 flex flex-col gap-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-ui text-xs uppercase font-bold text-[#5C564E]">
                      Tarif Sewa
                    </span>
                    <span className="font-ui text-lg font-bold text-[#A45A3D]">
                      {formatPrice(room.price)}
                      <span className="text-xs font-normal text-[#5C564E] ml-0.5">
                        /bln
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/rooms/${room.id}`}
                      className="w-full py-2.5 rounded-xl bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#1E1B18] font-ui text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-[#A45A3D]" />
                      <span>Detail</span>
                    </Link>

                    <button
                      onClick={() => setActiveModalRoom(room)}
                      className="w-full py-2.5 rounded-xl bg-[#A45A3D] hover:bg-[#864327] text-white font-ui text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Booking</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="bg-[#FAF2EA] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#2C2825]/8 text-center sm:text-left">
          <div className="flex flex-col gap-1 max-w-xl">
            <h4 className="font-editorial text-xl sm:text-2xl font-bold text-[#1E1B18]">
              Ingin melihat seluruh pilihan kamar yang tersedia?
            </h4>
            <p className="font-ui text-sm sm:text-base text-[#38332E]">
              Kunjungi katalog properti lengkap untuk memfilter kamar
              berdasarkan tipe, lantai, dan kisaran harga sewa.
            </p>
          </div>

          <Link
            href="/kamar"
            className="px-6 py-3.5 rounded-xl bg-[#A45A3D] hover:bg-[#864327] text-white font-ui text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
          >
            <span>Jelajahi Katalog Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ========================================================
                MODAL 1: DETAIL & BOOKING VIA WHATSAPP KE PENGELOLA
               ======================================================== */}
      {activeModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2C2825]/10 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalRoom(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#757069] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#A45A3D]/10 text-[#A45A3D] text-[11px] font-bold uppercase">
                No. {activeModalRoom.number}
              </span>
              {getStatusBadge(activeModalRoom.status)}
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-editorial text-2xl font-bold text-[#1E1B18]">
                {activeModalRoom.name}
              </h3>
              <p className="font-ui text-xs text-[#757069]">
                {propInfo.name} • {propInfo.address}
              </p>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#FAF2EA]">
              <Image
                src={activeModalRoom.images?.[0] || "/images/rooms/room-1.webp"}
                alt={activeModalRoom.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF2EA] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-ui text-[10px] text-[#757069] uppercase font-bold">
                  Tarif Sewa
                </span>
                <span className="font-editorial text-xl font-bold text-[#A45A3D]">
                  {formatPrice(activeModalRoom.price)}
                  <span className="text-xs font-normal text-[#757069]">
                    {" "}
                    / bulan
                  </span>
                </span>
              </div>
              <span className="text-xs font-semibold text-[#2C4C3B] bg-[#C7EBD4] px-3 py-1 rounded-full">
                {activeModalRoom.type || "Standar (1 Orang)"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-ui text-xs font-bold text-[#1E1B18]">
                Fasilitas Kamar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeModalRoom.facilities.map((fac, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-[#FAF2EA] text-xs font-medium text-[#757069]"
                  >
                    ✓ {fac}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#2C2825]/8">
              <a
                href={`https://wa.me/${propInfo.managerPhone || "6287890976782"}?text=${encodeURIComponent(
                  `Halo Pengelola ${propInfo.name}, saya tertarik untuk survei/booking Kamar No. ${activeModalRoom.number} (${activeModalRoom.name}) seharga ${formatPrice(activeModalRoom.price)}/bln. Apakah unit masih dapat disewa?`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#2C4C3B] hover:bg-[#1E3629] text-white font-ui text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>
                  Hubungi Pengelola via WhatsApp (
                  {propInfo.managerPhone || "0878-9097-6782"})
                </span>
              </a>

              <Link
                href={`/rooms/${activeModalRoom.id}`}
                className="w-full py-2.5 rounded-xl bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#1E1B18] font-ui text-xs font-semibold text-center transition-colors"
              >
                Buka Halaman Spesifikasi Penuh &amp; Tur 360°
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
                MODAL 2: VOUCHER PROMO
               ======================================================== */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2C2825]/10 flex flex-col items-center text-center gap-4 relative">
            <button
              onClick={() => setShowVoucherModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#757069] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#A45A3D]/10 text-[#A45A3D] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-editorial text-2xl font-bold text-[#1E1B18]">
                Voucher Promo OsKost
              </h3>
              <p className="font-ui text-xs text-[#757069]">
                Salin kode voucher berikut dan tunjukkan saat konfirmasi sewa
                paket 6 bulan.
              </p>
            </div>

            <div className="w-full p-4 rounded-2xl bg-[#FAF2EA] border border-dashed border-[#A45A3D]/40 flex items-center justify-between">
              <span className="font-mono text-xl font-bold text-[#A45A3D] tracking-widest">
                OSKOST250K
              </span>
              <button
                onClick={handleCopyVoucher}
                className="p-2 rounded-lg bg-[#A45A3D] text-white hover:bg-[#864327] transition-colors cursor-pointer"
                title="Salin Kode"
              >
                {voucherCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {voucherCopied && (
              <span className="text-xs font-semibold text-[#2C4C3B] animate-in fade-in">
                ✓ Kode voucher berhasil disalin ke clipboard!
              </span>
            )}

            <button
              onClick={() => setShowVoucherModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#FAF2EA] text-[#1E1B18] font-ui text-xs font-semibold hover:bg-[#EFE7DE] transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
