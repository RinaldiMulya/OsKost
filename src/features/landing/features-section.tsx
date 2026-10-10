import {
  Wifi,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: <Wifi className="w-6 h-6 text-[#A45A3D]" />,
    title: "WiFi Fiber Optic 1Gbps",
    badge: "Ultra Fast",
    description:
      "Koneksi internet fiber stabil dedicated di setiap lantai. Bebas lag untuk aktivitas kerja remote (WFA), meeting Zoom, maupun streaming 4K.",
  },
  {
    icon: <Smartphone className="w-6 h-6 text-[#2C4C3B]" />,
    title: "Smart Access Digital RFID & App",
    badge: "Keyless Entry",
    description:
      "Tinggalkan kunci konvensional. Masuk kamar cukup tempel kartu RFID atau buka langsung dari aplikasi smartphone dengan enkripsi keamanan bank.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#A45A3D]" />,
    title: "Keamanan AI 24/7 & Pengawasan",
    badge: "CCTV Cloud",
    description:
      "Kamera keamanan resolusi tinggi dengan deteksi gerak otomatis di setiap koridor dan parkiran motor untuk melindungi ketenangan Anda.",
  },
  {
    icon: <CreditCard className="w-6 h-6 text-[#C98A2C]" />,
    title: "Pembayaran & Rekonsiliasi Otomatis",
    badge: "Escrow Aman",
    description:
      "Tagihan bulanan terbit otomatis dengan Virtual Account, QRIS, dan konfirmasi instan tanpa perlu repot kirim bukti transfer manual via WhatsApp.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="fasilitas"
      className="w-full bg-[#FFFFFF] py-10 sm:py-14 lg:py-16 border-b border-[#2C2825]/6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#A45A3D] bg-[#A45A3D]/10 px-4 py-1.5 rounded-full inline-block mb-3.5">
              Fasilitas Unggulan
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight">
              Standar Kenyamanan Arsitektur Modern
            </h2>
          </div>

          <p className="font-ui text-base text-[#38332E] max-w-md leading-relaxed">
            Setiap detail fasilitas dikurasi untuk menghadirkan harmoni hunian
            yang fungsional, estetik, dan aman bagi profesional urban.
          </p>
        </div>

        {/* Feature Cards Grid (4 Kolom Taktil Keramik) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <div
              key={index}
              className="p-6 sm:p-7 rounded-3xl bg-[#F8F6F1] border border-[#2C2825]/8 hover:bg-[#FFFFFF] hover:shadow-[0_12px_32px_rgba(44,40,37,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#2C2825]/8 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                    {feat.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A453F] bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#2C2825]/8">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#1E1B18] mb-2.5 group-hover:text-[#A45A3D] transition-colors">
                  {feat.title}
                </h3>
                <p className="font-ui text-sm text-[#38332E] leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2C2825]/8 flex items-center gap-1.5 text-xs font-semibold text-[#A45A3D] opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-4 h-4" />
                <span>Fasilitas Terpasang</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
