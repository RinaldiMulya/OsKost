import {
  DoorOpen,
  IdCard,
  CreditCard,
  Key,
  ArrowRight,
  Home,
} from "lucide-react";

const steps = [
  {
    num: "01",
    icon: <DoorOpen className="w-6 h-6 text-[#A45A3D]" />,
    title: "Pilih Properti Terdekat",
    description:
      "Cari properti terdekat dengan lokasi Anda dan dapatkan informasi lengkap tentang fasilitas dan ketersediaan kamar.",
  },
  {
    num: "02",
    icon: <Home className="w-6 h-6 text-[#A45A3D]" />,
    title: "Pilih Kamar dan Tipe Unit",
    description:
      "Pilih kamar yang sesuai dengan kebutuhan Anda dan dapatkan informasi lengkap tentang fasilitas dan ketersediaan kamar.",
  },
  {
    num: "03",
    icon: <IdCard className="w-6 h-6 text-[#A45A3D]" />,
    title: "Verifikasi Data Digital",
    description:
      "Unggah foto identitas secara aman untuk pembuatan kontrak sewa digital yang sah dan transparan.",
  },
  {
    num: "04",
    icon: <CreditCard className="w-6 h-6 text-[#A45A3D]" />,
    title: "Lakukan Pembayaran",
    description:
      "Selesaikan pembayaran sewa pertama melalui Virtual Account atau QRIS otomatis tanpa risiko transfer bodong.",
  },
  {
    num: "05",
    icon: <Key className="w-6 h-6 text-[#C98A2C]" />,
    title: "Akses Kunci & Check-In",
    description:
      "Dapatkan akses kunci kamar serta akses login aplikasi, lalu masuk ke hunian nyaman Anda dengan tenang.",
  },
];

export function BookingStepsSection() {
  return (
    <section className="w-full bg-[#F8F6F1] py-8 sm:py-10 lg:py-10 border-b border-[#2C2825]/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#A45A3D] bg-[#A45A3D]/10 px-3.5 py-1.5 rounded-full inline-block mb-3.5">
            Alur Pemesanan
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight mb-4">
            5 Langkah Mudah Memulai Hunian
          </h2>
          <p className="font-ui text-sm sm:text-base text-[#757069] leading-relaxed">
            Proses booking cepat, aman, dan transparan langsung dari genggaman
            ponsel Anda.
          </p>
        </div>

        {/* Steps Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative bg-[#FFFFFF] rounded-3xl p-7 border border-[#2C2825]/40 shadow-[0_4px_20px_rgba(44,40,37,0.04)] hover:shadow-[0_12px_32px_rgba(44,40,37,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Step Number Watermark */}
              <div className="font-editorial text-4xl font-extrabold text-black absolute top-5 right-6 select-none pointer-events-none">
                {step.num}
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#F8F6F1] border border-[#2C2825]/8 flex items-center justify-center mb-5">
                  {step.icon}
                </div>
                <h3 className="font-editorial text-lg font-bold text-[#1E1B18] mb-2">
                  {step.title}
                </h3>
                <p className="font-ui text-xs text-[#757069] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
