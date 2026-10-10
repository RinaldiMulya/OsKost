import { 
    HeroSection,
    TourSection,
    ClusterRoomsSection,
    FeaturesSection,
    BookingStepsSection, 
    MapsSection, 
    SaasPricingSection,
    TestimonialSection, 
    FaqSection 
} from "@/features/landing";
import { OnboardingTour } from "@/components/shared/onboarding-tour";
import { getActivePropertyWithStats, getRoomsForLanding } from "@/features/rooms/room-service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oskost.id";

export const metadata: Metadata = {
    title: "OsKost Residences | Kost Modern & Tenang di Cakung, Jakarta Timur",
    description: "Kost eksklusif dekat Pabrik Yamaha & Stasiun Buaran, Cakung. Fasilitas lengkap, WiFi Fiber ultra cepat 1Gbps, akses kunci digital terenkripsi, tur 360°, dan software manajemen kost modern.",
    keywords: [
        "kost pulo jahe",
        "kost cakung jakarta timur",
        "kost dekat pabrik yamaha",
        "kost dekat stasiun buaran",
        "sewa kost bulanan cakung",
        "oskost residences",
        "kost eksklusif jakarta timur",
        "kost smart living cakung",
        "software manajemen kost"
    ],
    alternates: {
        canonical: "/",
    },
};

export default async function HomePage() {
    const property = await getActivePropertyWithStats();
    const rooms = await getRoomsForLanding();
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "name": "OsKost Residences - Cakung Sentral",
        "image": `${baseUrl}/images/hero-bg.webp`,
        "description": "Kost modern Japandi, WiFi Fiber Optic 1Gbps, Keamanan 24/7 dekat PT Yamaha Pulo Jahe dan Stasiun KRL Buaran, Cakung, Jakarta Timur.",
        "url": baseUrl,
        "telephone": "+6281234567890",
        "priceRange": "Rp 1.350.000 - Rp 2.650.000",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jl. Kp. Pulo Jahe No.104b, RT.03/RW.05, Jatinegara, Kec. Cakung",
            "addressLocality": "Cakung",
            "addressRegion": "Jakarta Timur",
            "postalCode": "13930",
            "addressCountry": "ID"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -6.1952196,
            "longitude": 106.92452
        }
    };

    return (
        <div className="flex flex-col w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            
            <OnboardingTour
                storageKey="oskost_landing_tour_completed"
                steps={[
                    {
                        title: "Selamat Datang di OsKost Residences!",
                        description: "Nikmati hunian modern, tenang, dan strategis dekat PT Yamaha & Stasiun Buaran dengan sistem digital terintegrasi.",
                        badge: "Panduan Pengunjung (1/4)"
                    },
                    {
                        title: "Eksplorasi Virtual Tour 360°",
                        description: "Survei interior kamar nyata secara interaktif langsung dari layar HP Anda sebelum berkunjung.",
                        badge: "Panduan Pengunjung (2/4)"
                    },
                    {
                        title: "Katalog Klaster & Tipe Kamar",
                        description: "Pilih unit favorit di klaster Cakung Sentral, Sudirman Residence, atau Millennial Hub.",
                        badge: "Panduan Pengunjung (3/4)"
                    },
                    {
                        title: "Software Manajemen Pemilik Kost",
                        description: "Otomatisasi pembukuan dan penagihan sewa untuk pengusaha kost dengan coba gratis 14 hari.",
                        badge: "Panduan Pengunjung (4/4)"
                    }
                ]}
            />

            {/* 1. Hero Section (Pencarian & Showcase Arsitektur) */}
            <HeroSection />

            {/* 2. Eksplorasi Transparan & 360 Virtual Tour Preview */}
            <TourSection />

            {/* 3. Katalog Kamar & Properti Klaster Baru */}
            <ClusterRoomsSection property={property} rooms={rooms} />

            {/* 4. Standar Fasilitas Unggulan */}
            <FeaturesSection />

            {/* 5. Alur Pemesanan 4 Langkah Mudah */}
            <BookingStepsSection />

            {/* 6. Konektivitas Lokasi & Hub Industri/Transportasi Cakung */}
            <MapsSection />

            {/* 7. Platform SaaS untuk Pemilik Kost (Monetisasi & Paket Harga) */}
            <SaasPricingSection />

            {/* 8. Ulasan Penghuni Aktif */}
            <TestimonialSection />

            {/* 9. Pusat Bantuan & Pertanyaan Umum */}
            <FaqSection />
        </div>
    );
}
