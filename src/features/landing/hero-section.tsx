import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Home,
  Sparkles,
  Search,
  ShieldCheck,
  Wifi,
  Star,
  CircleDollarSign,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F8F6F1] pt-24 pb-8 sm:pt-28 sm:pb-10 lg:pt-32 lg:pb-12 border-b border-[#2C2825]/6">
      {/* Ambient Warm Gradient Backdrop */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#A45A3D]/5 via-[#C7EBD4]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#EFE7DE] via-[#F8F6F1] to-transparent rounded-full blur-2xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (Copywriting & Search) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Location Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFFF] border border-[#2C2825]/10 shadow-[0_2px_8px_rgba(44,40,37,0.04)] mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A45A3D] animate-pulse" />
              <span className="text-[#A45A3D] text-xs sm:text-sm font-bold tracking-wide">
                Hunian Modern &amp; Tenang di Cakung, Jakarta Timur
              </span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#1E1B18] tracking-tight leading-[1.15] mb-6">
              Temukan Ketenangan Hunian di Tengah Hiruk Pikuk Industri.
            </h1>

            {/* Subtitle */}
            <p className="font-ui text-base sm:text-lg text-[#38332E] leading-relaxed mb-6 max-w-2xl">
              Kost eksklusif dekat Pabrik Yamaha &amp; Stasiun Buaran. Fasilitas
              lengkap, WiFi Fiber ultra cepat, akses kunci digital terenkripsi,
              dan transparansi sewa tanpa ribet.
            </p>

            {/* Floating Tactile Ceramic Search Card */}
            <div className="w-full bg-[#FFFFFF] border border-[#2C2825]/10 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(44,40,37,0.06)] mb-6">
              <form
                action="/kamar"
                method="GET"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                {/* Filter Lokasi */}
                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-[#F8F6F1] hover:bg-[#FAF2EA] transition-colors border border-[#2C2825]/8">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4A453F] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A45A3D]" />
                    Lokasi Properti
                  </label>
                  <select
                    name="property"
                    defaultValue="pulo-jahe"
                    className="bg-transparent text-sm font-semibold text-[#1E1B18] outline-none cursor-pointer"
                  >
                    <option value="pulo-jahe">OSkost Pulo Jahe (Utama)</option>
                  </select>
                </div>

                {/* Filter Tipe Kamar */}
                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-[#F8F6F1] hover:bg-[#FAF2EA] transition-colors border border-[#2C2825]/8">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4A453F] flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#2C4C3B]" />
                    Tipe Kamar
                  </label>
                  <select
                    name="type"
                    defaultValue="all"
                    className="bg-transparent text-sm font-semibold text-[#1E1B18] outline-none cursor-pointer"
                  >
                    <option value="all">Semua Tipe Kamar</option>
                    <option value="standar">Standar (1 Orang)</option>
                    <option value="besar">Besar (2 - 3 Orang)</option>
                  </select>
                </div>

                {/* Filter Rentang Harga */}
                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-[#F8F6F1] hover:bg-[#FAF2EA] transition-colors border border-[#2C2825]/8">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4A453F] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C98A2C]" />
                    Rentang Harga
                  </label>
                  <select
                    name="price"
                    defaultValue="all"
                    className="bg-transparent text-sm font-semibold text-[#1E1B18] outline-none cursor-pointer"
                  >
                    <option value="all">Semua Harga</option>
                    <option value="under_1500k">&lt; Rp 1.5jt / bln</option>
                    <option value="1500k_2500k">Rp 1.5jt - 2.5jt / bln</option>
                    <option value="above_2500k">&gt; Rp 2.5jt / bln</option>
                  </select>
                </div>

                {/* Tombol Submit */}
                <div className="flex items-center">
                  <button
                    type="submit"
                    className="w-full h-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-[#A45A3D] hover:bg-[#864327] text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_14px_rgba(164,90,61,0.25)] hover:shadow-[0_6px_20px_rgba(164,90,61,0.35)] transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Cek Kamar</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#38332E]">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#A45A3D]" />
                <span>WiFi Fiber Dedicated</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C98A2C]" />
                <span>Tanpa Biaya Tersembunyi</span>
              </div>
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-[#C98A2C]" />
                <span>Bayar Kost Mudah</span>
              </div>
            </div>
          </div>

          {/* Right Column (Visual Architectural Frame) */}
          <div className="lg:col-span-5 relative">
            {/* Main Image Frame with Ceramic Border */}
            <div className="relative rounded-3xl overflow-hidden bg-[#FFFFFF] p-2.5 shadow-[0_12px_40px_rgba(44,40,37,0.08)] border border-[#2C2825]/8">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#EFE7DE]">
                <Image
                  src="/images/Hero2.jpg"
                  alt="Interior Kamar OsKost Sanctuary"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                {/* 360 Badge on Image */}
                <Link
                  href="#tur-360"
                  className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md text-[#1E1B18] text-xs font-bold hover:bg-white transition-all shadow-md group"
                >
                  <span className="w-2 h-2 rounded-full bg-[#A45A3D] group-hover:scale-125 transition-transform" />
                  <span>Tur Virtual 360° Tersedia</span>
                </Link>
              </div>

              {/* Floating Top Badge: Kamar Tersedia */}
              {/* <div className="absolute -top-3 -right-3 sm:-right-4 bg-[#FFFFFF] border border-[#2C2825]/10 rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_rgba(44,40,37,0.08)] flex items-center gap-2.5 animate-bounce [animation-duration:4s]">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2C4C3B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2C4C3B]" />
                </span>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#757069]">
                    Status Terkini
                  </p>
                  <p className="text-xs font-bold text-[#2C4C3B]">
                    2 Kamar Tersedia Hari Ini
                  </p>
                </div>
              </div> */}

              {/* Floating Bottom Badge: Verified Rating */}
              {/* <div className="absolute -bottom-4 -left-3 sm:-left-4 bg-[#FFFFFF] border border-[#2C2825]/10 rounded-2xl px-4 py-3 shadow-[0_8px_24px_rgba(44,40,37,0.08)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C98A2C]/10 flex items-center justify-center text-[#C98A2C]">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-[#1E1B18]">
                      4.9 / 5.0
                    </span>
                    <span className="text-[10px] text-[#757069]">
                      (128 Ulasan)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#757069]">
                    Penghuni Aktif Terverifikasi
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
