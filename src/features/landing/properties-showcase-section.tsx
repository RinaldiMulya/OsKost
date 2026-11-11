import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  BedDouble,
} from "lucide-react";
import type { PropertyShowcaseItem } from "@/features/rooms/room-service";

interface PropertiesShowcaseSectionProps {
  properties: PropertyShowcaseItem[];
}

export function PropertiesShowcaseSection({
  properties,
}: PropertiesShowcaseSectionProps) {
  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <section
      id="katalog"
      className="w-full bg-[#F8F6F1] py-14 sm:py-20 border-b border-[#2C2825]/6 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8C6239]/10 text-[#8C6239] text-xs font-bold mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Direktori Kost Nasional</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight">
              Katalog Properti Kost di Ekosistem OsKost
            </h2>
            <p className="text-sm sm:text-base text-[#4A453F] font-medium mt-2">
              Jelajahi kost siap huni dari para juragan kost terpercaya. Setiap
              properti dilengkapi website mandiri dan tur virtual 360°.
            </p>
          </div>

          <Link
            href="/kamar"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#8C6239] hover:text-[#724e2c] transition-colors shrink-0"
          >
            <span>Lihat Semua Unit Kamar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {properties.map((property) => {
            const propertyUrl = property.slug
              ? `/p/${property.slug}`
              : `/kamar?property=${property.id}`;

            return (
              <div
                key={property.id}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#2C2825]/10 shadow-[0_4px_20px_rgba(44,40,37,0.04)] hover:shadow-[0_12px_30px_rgba(44,40,37,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image Showcase */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EFE7DE]">
                  <Image
                    src={property.thumbnailUrl}
                    alt={property.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-[#1E1B18] shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Terdaftar di OsKost</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5" />
                      {property.availableRooms > 0
                        ? `${property.availableRooms} Kamar Kosong`
                        : "Kamar Penuh"}
                    </span>
                    <span className="bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                      {property.slug ? `${property.slug}.oskost.id` : "oskost.id"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-[#1E1B18] group-hover:text-[#8C6239] transition-colors mb-2">
                      {property.name}
                    </h3>
                    <div className="flex items-start gap-1.5 text-xs text-[#757069] mb-4">
                      <MapPin className="w-3.5 h-3.5 text-[#A45A3D] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{property.address}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#2C2825]/8 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#757069] tracking-wider">
                        Harga Mulai
                      </div>
                      <div className="text-base font-bold text-[#1E1B18]">
                        {formatIDR(property.minPrice || 1350000)}
                        <span className="text-[11px] font-normal text-[#757069]">
                          /bln
                        </span>
                      </div>
                    </div>

                    <Link
                      href={propertyUrl}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C6239] text-white hover:bg-[#724e2c] text-xs font-bold shadow-xs transition-colors shrink-0"
                    >
                      <span>Lihat Website Kost</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pitch Banner to Prospective Owners */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#1E1B18] text-[#EFE7DE] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C7A379] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Untuk Juragan Kost di Indonesia</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ingin Kost Anda Memiliki Website Resmi &amp; Dipromosikan di Sini?
            </h3>
            <p className="text-xs sm:text-sm text-[#A89F91] max-w-2xl">
              Daftarkan kost Anda di OsKost. Dapatkan website subdomain mandiri (nama-kost.oskost.id), aplikasi mobile untuk anak kost, dan otomatisasi pembukuan dengan coba gratis 14 hari.
            </p>
          </div>

          <a
            href="https://wa.me/6287890976782?text=Halo%20OsKost%2C%20saya%20pemilik%20kost%20ingin%20mendaftarkan%20properti%20saya%20agar%20memiliki%20website%20resmi."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-[#8C6239] text-white hover:bg-[#A45A3D] font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            Daftarkan Kost Saya (Coba Gratis)
          </a>
        </div>
      </div>
    </section>
  );
}

