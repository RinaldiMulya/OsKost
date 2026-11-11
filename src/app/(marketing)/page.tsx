import {
  B2bHeroSection,
  CommissionCalculator,
  PropertiesShowcaseSection,
  TourSection,
  ClusterRoomsSection,
  FeaturesSection,
  BookingStepsSection,
  SaasPricingSection,
  TestimonialSection,
  FaqSection,
} from "@/features/landing";
import { OnboardingTour } from "@/components/shared/onboarding-tour";
import {
  getActivePropertyWithStats,
  getRoomsForLanding,
  getAllActivePropertiesForShowcase,
} from "@/features/rooms/room-service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oskost.id";

export const metadata: Metadata = {
  title:
    "OsKost | Platform B2B SaaS Manajemen Kost & Katalog Kost Modern Indonesia",
  description:
    "Software manajemen kost tanpa potongan komisi (0% take rate). Dapatkan website subdomain mandiri untuk kost Anda, aplikasi mobile penghuni, tur 360°, dan otomatisasi pembukuan.",
  keywords: [
    "software manajemen kost",
    "aplikasi kost",
    "sistem manajemen kost",
    "b2b saas kost",
    "website kost pribadi",
    "katalog kost indonesia",
    "kelola kost otomatis",
    "oskost",
  ],
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const [property, rooms, properties] = await Promise.all([
    getActivePropertyWithStats(),
    getRoomsForLanding(),
    getAllActivePropertiesForShowcase(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OsKost",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    description:
      "Platform B2B SaaS Manajemen Kost & Etalase Hunian Modern di Indonesia tanpa potongan komisi sewa.",
    url: baseUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
  };

  return (
    <div className="flex flex-col w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <OnboardingTour
        storageKey="oskost_landing_tour_completed"
        steps={[
          {
            title: "Selamat Datang di OsKost!",
            description:
              "Platform manajemen kost serba otomatis dan direktori hunian modern tanpa potongan komisi.",
            badge: "Panduan Pengunjung (1/4)",
          },
          {
            title: "Kalkulator Cuan Pemilik Kost",
            description:
              "Hitung berapa puluh juta rupiah yang bisa Anda hemat dibanding aplikasi agregator yang memotong komisi 15%.",
            badge: "Panduan Pengunjung (2/4)",
          },
          {
            title: "Katalog Properti & Unit Kamar",
            description:
              "Jelajahi kost binaan kami. Setiap properti memiliki website resmi sendiri dengan tur 360°.",
            badge: "Panduan Pengunjung (3/4)",
          },
          {
            title: "Coba Gratis 14 Hari untuk Juragan Kost",
            description:
              "Otomatisasi pembukuan dan penagihan sewa untuk pengusaha kost dengan kuota coba gratis 14 hari.",
            badge: "Panduan Pengunjung (4/4)",
          },
        ]}
      />

      {/* 1. B2B SaaS Hero Section (0% Komisi & Value Proposition) */}
      <B2bHeroSection />

      {/* 2. Kalkulator Hemat Komisi vs 15% Agregator (Hemat > Rp 46 Jt/thn) */}
      <CommissionCalculator />

      {/* 3. Katalog & Showcase Seluruh Properti Kost Milik Owner (Dual Value) */}
      <PropertiesShowcaseSection properties={properties} />

      {/* 7. Alur Pemesanan 5 Langkah Mudah */}
      <BookingStepsSection />

      {/* 4. Rekomendasi Tipe Kamar & Ketersediaan Realtime */}
      <ClusterRoomsSection property={property} rooms={rooms} />

      {/* 5. Eksplorasi Virtual Tour 360° Interaktif */}
      {/* <TourSection /> */}

      {/* 6. Standar Fasilitas & Keamanan */}
      <FeaturesSection />

      {/* 8. Platform SaaS untuk Pemilik Kost (Paket Harga & Coba Gratis 14 Hari) */}
      <SaasPricingSection />

      {/* 9. Ulasan Penghuni & Pemilik Kost Aktif */}
      <TestimonialSection />

      {/* 10. Pusat Bantuan & Pertanyaan Umum */}
      <FaqSection />
    </div>
  );
}
