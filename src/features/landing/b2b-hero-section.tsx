import Link from "next/link";
import {
  ShieldCheck,
  Percent,
  Globe,
  Smartphone,
  ArrowRight,
  Phone,
  CheckCircle2,
  Sparkles,
  Building2,
  TrendingUp,
} from "lucide-react";

export function B2bHeroSection() {
  const superAdminPhone = "6287890976782";
  const waUrl = `https://wa.me/${superAdminPhone}?text=${encodeURIComponent(
    "Halo Tim OsKost, saya pemilik kost dan tertarik mencoba coba gratis 14 hari sistem manajemen OsKost untuk properti saya."
  )}`;

  return (
    <section className="relative w-full overflow-hidden bg-[#F8F6F1] pt-24 pb-14 sm:pt-28 sm:pb-18 lg:pt-32 lg:pb-24 border-b border-[#2C2825]/6">
      {/* Warm Ambient Backdrop */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#A45A3D]/8 via-[#C7EBD4]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#EFE7DE] via-[#F8F6F1] to-transparent rounded-full blur-2xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#2C2825]/10 shadow-[0_2px_8px_rgba(44,40,37,0.04)] mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A45A3D] animate-pulse" />
            <span className="text-[#A45A3D] text-xs sm:text-sm font-bold tracking-wide">
              Platform Manajemen B2B SaaS &amp; Katalog Kost Nasional
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E1B18] tracking-tight leading-[1.12] mb-6">
            Kelola Kost Modern Tanpa Potongan Komisi. <br className="hidden sm:inline" />
            <span className="text-[#8C6239]">Uang Sewa 100% Masuk ke Rekening Anda.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-ui text-base sm:text-xl text-[#4A453F] leading-relaxed mb-8 max-w-3xl mx-auto">
            Tinggalkan buku tulis manual dan potongan komisi 15%–20%. OsKost memberikan 
            <strong> website marketing resmi mandiri</strong>, <strong>aplikasi mobile eksklusif untuk penghuni</strong>, 
            serta otomatisasi penagihan sewa dan pembukuan bebas ribet.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#8C6239] text-white hover:bg-[#724e2c] font-bold text-base shadow-[0_8px_25px_rgba(140,98,57,0.25)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              <span>Mulai Coba Gratis 14 Hari</span>
            </a>
            <a
              href="#katalog-properti"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white text-[#1E1B18] hover:bg-[#F2ECE4] border border-[#2C2825]/15 font-bold text-base shadow-xs hover:-translate-y-0.5 transition-all duration-200"
            >
              <Building2 className="w-5 h-5 text-[#8C6239]" />
              <span>Jelajahi Kost Terdaftar</span>
            </a>
          </div>

          {/* 4 Value Pillars Mini Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white border border-[#2C2825]/8 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E1B18]">0% Potongan Komisi</div>
                <div className="text-[11px] text-[#757069] mt-0.5">Uang sewa 100% langsung ke rekening/QRIS owner</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#2C2825]/8 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E1B18]">Website Subdomain Pribadi</div>
                <div className="text-[11px] text-[#757069] mt-0.5">Dapat nama-kost.oskost.id + Tur Virtual 360°</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#2C2825]/8 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E1B18]">Aplikasi Mobile Tenant</div>
                <div className="text-[11px] text-[#757069] mt-0.5">Aplikasi Flutter otomatis sesuaikan warna &amp; logo kost</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#2C2825]/8 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E1B18]">Bebas Pajak Daerah 10%</div>
                <div className="text-[11px] text-[#757069] mt-0.5">Sesuai UU HKPD No. 1/2022 &amp; PP 55/2022</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

