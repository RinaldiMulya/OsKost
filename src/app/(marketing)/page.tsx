import { Suspense } from "react";
import { HeroSection } from "@/features/landing/hero-section";
import { FeaturesSection } from "@/features/landing/features-section";
import { 
    BookingStepsSection, 
    MapsSection, 
    TestimonialSection, 
    FaqSection 
} from "@/features/landing";
import { RoomsSection, RoomsSkeleton } from "@/features/rooms";
import { OnboardingTour } from "@/components/shared/onboarding-tour";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
    title: "Sewa Kost Pulo Jahe Cakung Murah & Lengkap | Smartkost Pulo Jahe",
    description: "Cari kost modern di Pulo Jahe, Cakung? Nikmati sewa kost bulanan dekat PT Yamaha (pabrik) & Stasiun Buaran dengan WiFi Fiber Optic, Keamanan 24/7, dan Virtual Tour 360°.",
    keywords: [
        "kost pulo jahe",
        "kost dekat pabrik yamaha pulo jahe",
        "kost dekat pt yamaha",
        "kost bulanan cakung jakarta timur",
        "kost eksklusif dekat stasiun buaran",
        "kost murah pulo jahe",
        "sewa kost cakung",
        "kost modern jakarta timur"
    ],
    alternates: {
        canonical: "/",
    },
};

export default async function HomePage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "name": "Smartkost Pulo Jahe",
        "image": `${baseUrl}/images/hero-bg.webp`,
        "description": "Kost modern fasilitas lengkap, WiFi Fiber Optic, Keamanan AI 24/7 dekat PT Yamaha Pulo Jahe dan Stasiun Buaran, Cakung, Jakarta Timur.",
        "url": baseUrl,
        "telephone": "+6281234567890", // Ganti dengan nomor WhatsApp admin yang riil jika ada
        "priceRange": "Rp 1.000.000 - Rp 2.500.000",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jl. Pulo Jahe, RT.03/RW.10, Jatinegara, Kec. Cakung",
            "addressLocality": "Cakung",
            "addressRegion": "Jakarta Timur",
            "postalCode": "13930",
            "addressCountry": "ID"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -6.195047, // Lintang sekitar Pulo Jahe
            "longitude": 106.924874 // Bujur sekitar Pulo Jahe
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
            />
            <OnboardingTour
                storageKey="oskost_landing_tour_completed"
                steps={[
                    {
                        title: "Selamat Datang di Smartkost Pulo Jahe!",
                        description: "Nikmati kemudahan melihat dan memesan sewa kamar kost eksklusif dengan fitur 360° Virtual Tour.",
                        badge: "Panduan Pengunjung (1/4)"
                    },
                    {
                        title: "Katalog Kamar & 360° Virtual Tour",
                        description: "Jelajahi interior kamar secara interaktif dari HP Anda sebelum melakukan booking lokasi.",
                        badge: "Panduan Pengunjung (2/4)"
                    },
                    {
                        title: "Tata Cara Pemesanan Transparan",
                        description: "Pilih kamar favorit Anda, langsung hubungi pengelola via WhatsApp, dan selesaikan pendaftaran.",
                        badge: "Panduan Pengunjung (3/4)"
                    },
                    {
                        title: "Peta Lokasi & Pusat Bantuan FAQ",
                        description: "Cek lokasi strategis dekat PT Yamaha & Stasiun Buaran, serta temukan jawaban pertanyaan umum di bagian bawah halaman.",
                        badge: "Panduan Pengunjung (4/4)"
                    }
                ]}
            />
            <HeroSection />
            <FeaturesSection />
            <BookingStepsSection />
            <MapsSection />
            <Suspense fallback={<RoomsSkeleton />}>
                <RoomsSection />
            </Suspense>
            <TestimonialSection />
            <FaqSection />
        </>
    );
}

