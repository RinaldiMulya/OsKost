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

export default async function HomePage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "name": "Smartkost Pulo Jahe",
        "image": "https://smartkost.local/images/hero-bg.webp",
        "description": "Kost modern fasilitas lengkap di Pulo Jahe Cakung",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Pulo Jahe",
            "addressLocality": "Cakung",
            "addressRegion": "Jakarta Timur",
            "addressCountry": "ID"
        },
        "priceRange": "$$"
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
