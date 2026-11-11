import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  Wifi,
  Phone,
  BedDouble,
  ArrowRight,
  Compass,
  CheckCircle2,
} from "lucide-react";
import type { PropertyPublicDetail } from "@/features/rooms/room-service";

interface PropertyHeroSectionProps {
  property: PropertyPublicDetail;
}

export function PropertyHeroSection({ property }: PropertyHeroSectionProps) {
  const minPrice =
    property.rooms.length > 0
      ? Math.min(...property.rooms.map((r) => r.price))
      : 1350000;

  const formattedMinPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(minPrice);

  const cleanPhone =
    property.managerPhone?.replace(/\D/g, "") || "6287890976782";
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo Pengelola ${property.name}, saya tertarik dengan kamar di website resmi Anda dan ingin menanyakan ketersediaan unit serta jadwal survei lokasi.`
  )}`;

  // Ambil foto thumbnail kamar pertama jika ada
  const firstRoomWithImage = property.rooms.find((r) => r.images.length > 0);
  const heroImage =
    firstRoomWithImage?.images[0] || property.logoUrl || "/images/hero-bg.webp";

  return (
    <section className="relative w-full overflow-hidden bg-[#F8F6F1] pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 border-b border-[#2C2825]/6">
      {/* Ambient Warm Gradient Backdrop */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#A45A3D]/5 via-[#C7EBD4]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#EFE7DE] via-[#F8F6F1] to-transparent rounded-full blur-2xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (Copywriting & Property Info) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFFF] border border-[#2C2825]/10 shadow-[0_2px_8px_rgba(44,40,37,0.04)] mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A45A3D] animate-pulse" />
              <span className="text-[#A45A3D] text-xs sm:text-sm font-bold tracking-wide">
                {property.availableRooms > 0
                  ? `${property.availableRooms} Kamar Siap Huni Tersedia`
                  : "Hunian Eksklusif & Nyaman"}
              </span>
            </div>

            {/* Main Property Headline */}
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#1E1B18] tracking-tight leading-[1.15] mb-4">
              {property.name}
            </h1>

            {/* Address */}
            <div className="flex items-start gap-2 text-sm sm:text-base text-[#4A453F] font-medium mb-6">
              <MapPin className="w-5 h-5 text-[#A45A3D] shrink-0 mt-0.5" />
              <span>{property.address}</span>
            </div>

            {/* Starting Price Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#2C2825]/10 shadow-sm mb-8 w-full sm:w-auto">
              <div className="text-xs uppercase font-bold text-[#757069] tracking-wider mb-1">
                Tarif Sewa Bulanan
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#1E1B18]">
                  {formattedMinPrice}
                </span>
                <span className="text-sm font-medium text-[#757069]">
                  / bulan
                </span>
              </div>
            </div>

            {/* Key Amenities */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#2C2825]/8 shadow-xs text-xs sm:text-sm font-semibold text-[#1E1B18]">
                <Wifi className="w-4 h-4 text-[#A45A3D]" />
                <span>WiFi Fiber Optic</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#2C2825]/8 shadow-xs text-xs sm:text-sm font-semibold text-[#1E1B18]">
                <ShieldCheck className="w-4 h-4 text-[#5D6654]" />
                <span>Keamanan 24/7</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#2C2825]/8 shadow-xs text-xs sm:text-sm font-semibold text-[#1E1B18]">
                <BedDouble className="w-4 h-4 text-[#A45A3D]" />
                <span>Fully Furnished</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href="#katalog-kamar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#8C6239] text-white hover:bg-[#724e2c] font-semibold text-sm sm:text-base shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Lihat Tipe Kamar</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] font-semibold text-sm sm:text-base shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                <Phone className="w-4 h-4" />
                <span>Chat Pengelola (WhatsApp)</span>
              </a>
            </div>
          </div>

          {/* Right Column (Hero Visual Showcase) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(44,40,37,0.12)] border border-[#2C2825]/10">
              <Image
                src={heroImage}
                alt={property.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Badge inside photo */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#A45A3D] uppercase tracking-wider">
                    Website Resmi Properti
                  </div>
                  <div className="text-sm font-bold text-[#1E1B18]">
                    {property.name}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

