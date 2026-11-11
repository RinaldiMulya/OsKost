import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPropertyPublicBySlug } from "@/features/rooms/room-service";
import { PropertyHeroSection } from "@/features/landing/property-hero-section";
import { FloatingWhatsApp } from "@/features/landing/floating-whatsapp";
import {
  TourSection,
  ClusterRoomsSection,
  FeaturesSection,
  BookingStepsSection,
  MapsSection,
  FaqSection,
} from "@/features/landing";

export const dynamic = "force-dynamic";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyPublicBySlug(slug);

  if (!property) {
    return {
      title: "Properti Kost Tidak Ditemukan | OsKost",
    };
  }

  return {
    title: `${property.name} | Website Resmi Kost & Ketersediaan Kamar Realtime`,
    description: `Sewa kamar kost di ${property.name}. Alamat: ${property.address}. Fasilitas lengkap, WiFi Fiber Optic, tur 360°, dan pemesanan sewa langsung tanpa perantara.`,
    keywords: [
      property.name.toLowerCase(),
      `kost ${property.slug}`,
      "sewa kost bulanan",
      "kost eksklusif",
      "kamar kost siap huni",
    ],
  };
}

export default async function PropertyMicrositePage({
  params,
}: PropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyPublicBySlug(slug);

  if (!property) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oskost.id";
  const firstRoomImage =
    property.rooms.find((r) => r.images.length > 0)?.images[0] ||
    `${baseUrl}/images/hero-bg.webp`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    image: firstRoomImage,
    description: `Website resmi ${property.name}. ${property.address}. Fasilitas lengkap & pemesanan langsung ke pengelola.`,
    url: `${baseUrl}/p/${property.slug}`,
    telephone: property.managerPhone || "+6281234567890",
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressCountry: "ID",
    },
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8F6F1]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* 1. Hero Section Eksklusif Properti */}
      <PropertyHeroSection property={property} />

      {/* 2. Eksplorasi Virtual Tour 360° */}
      <TourSection />

      {/* 3. Daftar Tipe Kamar & Status Ketersediaan */}
      <div id="katalog-kamar" className="w-full">
        <ClusterRoomsSection property={property} rooms={property.rooms} />
      </div>

      {/* 4. Standar Fasilitas Unggulan */}
      <FeaturesSection />

      {/* 5. Alur Pemesanan Mudah 4 Langkah */}
      <BookingStepsSection />

      {/* 6. Konektivitas Lokasi & Akses Peta */}
      {property.slug === "pulo-jahe" && <MapsSection />}

      {/* 7. Pertanyaan Umum Calon Penghuni */}
      <FaqSection />

      {/* 8. Floating Action Button WhatsApp ke Pengelola */}
      {property.managerPhone && (
        <FloatingWhatsApp
          phoneNumber={property.managerPhone}
          propertyName={property.name}
        />
      )}
    </div>
  );
}

