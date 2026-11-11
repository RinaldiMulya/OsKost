import Link from "next/link";
import {
  Check,
  ShieldCheck,
  ArrowRight,
  Zap,
  Building2,
  Sparkles,
  PhoneCall,
  Gift,
  BadgeCheck,
  Smartphone,
  LayoutDashboard,
  Globe,
  BellRing,
} from "lucide-react";

const stats = [
  {
    value: "0%",
    label: "Bukti Transfer Fiktif",
    desc: "Verifikasi QRIS & Virtual Account Real-Time",
  },
  {
    value: "98.4%",
    label: "Tingkat Okupansi",
    desc: "Rata-rata Mitra Properti Aktif OsKost",
  },
  {
    value: "3 Menit",
    label: "Setup Properti",
    desc: "Input kamar & langsung siap terima booking",
  },
  {
    value: "Rp 0",
    label: "Biaya Setup & Hidden Fee",
    desc: "Semua paket transparan tanpa biaya tersembunyi",
  },
];

const plans = [
  {
    name: "Starter",
    badge: "Juragan Pemula",
    tier: "6 - 15 Unit Kamar",
    price: "Rp 69.000",
    period: "/ bulan",
    description:
      "Pilihan pas untuk pemilik kost yang ingin lepas dari buku tulis dan ingin pembayaran sewa berjalan rapi otomatis.",
    isPopular: false,
    features: [
      "Kapasitas 6 - 15 unit kamar kost",
      "Bebas tambah lokasi kost tanpa batas",
      "Dashboard Pembukuan & Arus Kas Otomatis",
      "Halaman Promosi Kost Online Siap Pakai",
      "Aplikasi Khusus Penghuni (Android & iOS)",
      "Pengingat Jatuh Tempo Otomatis ke HP Penghuni",
      "Pembayaran Otomatis QRIS & Virtual Account Bank",
      "Download Laporan Keuangan Rapi (Excel/CSV)",
    ],
    ctaText: "Mulai 14 Hari Coba Gratis",
    ctaHref: "https://wa.me/6287890976782?text=Halo%20OsKost%2C%20saya%20tertarik%20mencoba%20coba%20gratis%2014%20hari%20Paket%20Starter%20(6-15%20Kamar).",
  },
  {
    name: "Growth",
    badge: "Paling Diminati",
    tier: "16 - 40 Unit Kamar",
    price: "Rp 179.000",
    period: "/ bulan",
    description:
      "Cocok untuk kost yang terus berkembang dan butuh pembagian tugas dengan penjaga kost agar operasional terkontrol.",
    isPopular: true,
    features: [
      "Kapasitas 16 - 40 unit kamar kost",
      "Bebas tambah lokasi kost tanpa batas",
      "Semua fasilitas di Paket Starter",
      "Wisata Virtual Kamar 360° Interaktif",
      "Akses Terpisah: Akun Pemilik & Penjaga Kost",
      "Laporan Kerusakan Fasilitas dengan Bukti Foto",
      "Rekap Pajak Usaha Kost Otomatis (PPh Final 0.5%)",
      "Catatan Riwayat Uang & Aktivitas Staf Lengkap",
    ],
    ctaText: "Mulai 14 Hari Coba Gratis",
    ctaHref: "https://wa.me/6287890976782?text=Halo%20OsKost%2C%20saya%20tertarik%20mencoba%20coba%20gratis%2014%20hari%20Paket%20Growth%20(16-40%20Kamar).",
  },
  {
    name: "Pro Residence",
    badge: "Skala Profesional",
    tier: "41 - 100 Unit Kamar",
    price: "Rp 349.000",
    period: "/ bulan",
    description:
      "Solusi lengkap untuk pemilik properti besar yang ingin operasional berjalan mandiri dengan branding eksklusif.",
    isPopular: false,
    features: [
      "Kapasitas 41 - 100 unit kamar kost",
      "Bebas tambah lokasi kost tanpa batas",
      "Semua fasilitas di Paket Growth",
      "Tampilkan Nama & Logo Kost Sendiri di Aplikasi",
      "Dukungan Kunci Pintu Pintar (Smart Lock IoT)",
      "Didampingi Tim Spesialis Saat Memulai Setup",
      "Bantuan Layanan Cepat Prioritas",
      "Format Surat Perjanjian Sewa Digital",
    ],
    ctaText: "Mulai 14 Hari Coba Gratis",
    ctaHref: "https://wa.me/6287890976782?text=Halo%20OsKost%2C%20saya%20tertarik%20mencoba%20coba%20gratis%2014%20hari%20Paket%20Pro%20Residence%20(41-100%20Kamar).",
  },
];

export function SaasPricingSection() {
  return (
    <section
      id="pemilik-kost"
      className="w-full bg-[#FFFFFF] py-10 sm:py-14 lg:py-16 border-b border-[#2C2825]/6 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A45A3D] bg-[#A45A3D]/10 px-4 py-1.5 rounded-full inline-block mb-3.5">
            Software Manajemen Kost &amp; Aplikasi Kost Modern
          </span>

          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight mb-4">
            Kelola Kost Lebih Tenang, Uang Sewa Masuk Tepat Waktu.
          </h2>

          <p className="font-ui text-base sm:text-lg text-[#38332E] leading-relaxed mb-6 max-w-2xl mx-auto">
            Tidak perlu lagi repot mencatat di buku, canggung menagih sewa tiap
            awal bulan, atau khawatir bukti transfer palsu. OsKost membantu
            pembukuan otomatis, mengirim pengingat sewa langsung ke HP penghuni,
            dan mempromosikan kamar Anda agar cepat penuh.
          </p>

          {/* Free Tier Funnel Callout Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-[#C7EBD4]/50 border border-[#2C4C3B]/25 text-[#1E372A] px-5 py-2.5 rounded-full text-sm sm:text-base font-medium shadow-xs">
            <Gift className="w-4 h-4 text-[#2C4C3B] shrink-0" />
            <span>
              Baru punya <strong>1 - 5 kamar</strong>? Nikmati seluruh kemudahan
              OsKost <strong>100% GRATIS</strong> selamanya.
            </span>
            <a
              href="https://wa.me/6287890976782?text=Halo%20OsKost%2C%20saya%20memiliki%201-5%20kamar%20kost%20dan%20ingin%20mendaftar%20Paket%20Free%20Rp%200%20selamanya."
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-[#14261C] inline-flex items-center gap-1 ml-1"
            >
              Daftar Gratis <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 4 Stat Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#F8F6F1] border border-[#2C2825]/8 rounded-2xl p-5 sm:p-6 text-center hover:bg-[#FFFFFF] hover:shadow-[0_8px_24px_rgba(44,40,37,0.06)] transition-all"
            >
              <div className="font-editorial text-3xl sm:text-4xl font-extrabold text-[#A45A3D] mb-1.5">
                {item.value}
              </div>
              <div className="font-ui text-sm sm:text-base font-bold text-[#1E1B18] mb-1">
                {item.label}
              </div>
              <div className="text-xs sm:text-sm text-[#4A453F] font-medium leading-normal">
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* 3-in-1 Ecosystem Value Proposition Banner */}
        <div className="bg-[#F8F6F1] border border-[#A45A3D]/20 rounded-2xl p-6 sm:p-8 mb-10 sm:mb-12">
          <div className="text-center mb-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A45A3D] bg-[#A45A3D]/10 px-3.5 py-1.5 rounded-full inline-block">
              Semua Paket Sudah Termasuk 3 Fasilitas Lengkap
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1B18] mt-2.5">
              Bukan Cuma Catatan Keuangan, Anda Dapat 3 Fasilitas Sekaligus
            </h3>
            <p className="text-sm sm:text-base text-[#4A453F] max-w-2xl mx-auto mt-2 leading-relaxed">
              Mulai dari paket paling terjangkau (Rp 69rb/bln) bahkan yang
              Gratis, Anda sudah mendapatkan fasilitas lengkap siap pakai untuk
              pemilik dan penghuni:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="bg-white border border-[#2C2825]/10 rounded-xl p-5 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#A45A3D]/10 text-[#A45A3D] flex items-center justify-center shrink-0 mt-0.5">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#1E1B18]">
                  1. Dashboard Pemilik Kost
                </h4>
                <p className="text-xs sm:text-sm text-[#38332E] mt-1 leading-relaxed">
                  Buka lewat HP atau laptop. Pantau kamar kosong, pemasukan
                  bulanan, dan rekap keuangan otomatis tanpa pusing rumus Excel.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#2C2825]/10 rounded-xl p-5 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#2C4C3B]/10 text-[#2C4C3B] flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#1E1B18]">
                  2. Halaman Promosi &amp; Wisata Kamar 360°
                </h4>
                <p className="text-xs sm:text-sm text-[#38332E] mt-1 leading-relaxed">
                  Calon anak kost bisa keliling lihat kamar dari layar HP secara
                  virtual. Kamar lebih cepat laku tanpa repot bolak-balik antar
                  survei.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#2C2825]/10 rounded-xl p-5 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#864327]/10 text-[#864327] flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#1E1B18]">
                  3. Aplikasi Khusus Penghuni Kost
                </h4>
                <p className="text-xs sm:text-sm text-[#38332E] mt-1 leading-relaxed">
                  Anak kost bayar sewa praktis lewat scan QRIS/Transfer Bank
                  &amp; terima pengingat jatuh tempo otomatis langsung di HP
                  mereka (mudah, cepat dan aman).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Model Explanatory Subheader */}
        <div className="text-center mb-8">
          <p className="text-sm sm:text-base text-[#38332E] inline-flex items-center gap-2 bg-[#F8F6F1] border border-[#2C2825]/10 px-5 py-2 rounded-full font-medium">
            <Building2 className="w-4 h-4 text-[#A45A3D]" />
            <span>
              Harga dihitung berdasarkan <strong>Total Unit Kamar</strong> —
              seluruh paket mendukung <strong>Unlimited Lokasi Properti</strong>
              !
            </span>
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-10 sm:mb-12">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.isPopular
                  ? "bg-[#FFFFFF] border-2 border-[#A45A3D] shadow-[0_12px_40px_rgba(164,90,61,0.15)] -translate-y-2"
                  : "bg-[#F8F6F1] border border-[#2C2825]/10 hover:bg-[#FFFFFF] hover:shadow-[0_8px_24px_rgba(44,40,37,0.06)]"
              }`}
            >
              {/* Popular Ribbon */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#A45A3D] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Paling Populer
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A45A3D] bg-[#A45A3D]/10 px-3 py-1 rounded-md">
                    {plan.badge}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#4A453F]">
                    {plan.tier}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1B18] mt-3 mb-2.5">
                  {plan.name}
                </h3>

                <p className="text-sm text-[#38332E] leading-relaxed mb-6 font-normal">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-[#2C2825]/10">
                  <span className="font-editorial text-3xl sm:text-4xl font-bold text-[#1E1B18]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#5C564E] font-medium">
                    {plan.period}
                  </span>
                </div>

                {/* Checklist */}
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li
                      key={fIdx}
                      className="flex items-start gap-3 text-sm text-[#2C2825] font-medium leading-normal"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#C7EBD4] text-[#2C4C3B] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                href={plan.ctaHref}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 ${
                  plan.isPopular
                    ? "bg-[#A45A3D] hover:bg-[#864327] text-white shadow-[0_4px_14px_rgba(164,90,61,0.25)] hover:shadow-[0_6px_20px_rgba(164,90,61,0.35)]"
                    : "bg-[#FFFFFF] hover:bg-[#A45A3D] hover:text-white text-[#1E1B18] border border-[#2C2825]/12"
                }`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise Tier Banner (>100 Kamar) */}
        <div className="rounded-2xl bg-[#F8F6F1] border border-[#2C2825]/10 p-6 sm:p-8 mb-10 sm:mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 hover:border-[#A45A3D]/30 transition-all">
          <div className="max-w-3xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5C564E] mb-2">
              <Building2 className="w-4 h-4 text-[#A45A3D]" />
              <span>Paket Khusus Jaringan Kost &amp; Pengelola Properti</span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1B18] mb-2.5">
              Punya Lebih Dari 100 Unit Kamar?
            </h3>
            <p className="text-sm sm:text-base text-[#38332E] leading-relaxed">
              Dapatkan tarif hemat khusus mulai{" "}
              <strong>Rp 4.500/kamar/bulan</strong> dengan bantuan tim ahli kami
              untuk input data awal, integrasi sistem khusus, dan layanan
              pendamping pribadi untuk bisnis properti Anda.
            </p>
          </div>

          <Link
            href="https://wa.me/6281234567890?text=Halo%20OsKost,%20saya%20tertarik%20konsultasi%20paket%20Enterprise%20(100+%20kamar)"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[#1E1B18] hover:bg-[#A45A3D] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-4 rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <span>Konsultasi Paket Khusus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Free Trial / Guarantee Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#A45A3D] to-[#864327] text-white p-8 sm:p-10 shadow-[0_12px_40px_rgba(164,90,61,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFE8DE] bg-white/15 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Bebas Risiko Finansial
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight mb-2.5">
              Mau coba dulu tanpa keluar biaya?
            </h3>
            <p className="text-sm sm:text-base text-[#FFF0EA] leading-relaxed">
              Rasakan mudahnya mengelola kost dengan seluruh fitur paket Growth
              selama 14 hari gratis. Langsung aktif dalam 3 menit, tanpa perlu
              kartu kredit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
            <Link
              href="/login?trial=true"
              className="bg-[#FFFFFF] text-[#A45A3D] hover:bg-[#F8F6F1] font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-4 rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              Mulai Coba Gratis 14 Hari
            </Link>
            <Link
              href="https://wa.me/6281234567890?text=Halo%20OsKost,%20saya%20ingin%20tanya-tanya%20dulu%20soal%20aplikasi"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent hover:bg-white/10 text-white border border-white/40 font-semibold text-xs sm:text-sm px-5 py-4 rounded-xl transition-all whitespace-nowrap flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Tanya Kami Dulu</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
