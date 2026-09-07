import { notFound } from "next/navigation";
import { getRoomById } from "@/features/rooms/room-service";
import { RoomDetailView } from "@/features/rooms/components/room-detail-view";
import type { Metadata } from "next";

interface RoomDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
    const { id } = await params;
    const room = await getRoomById(id);

    if (!room) {
        notFound();
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const amenityFeature = room.facilities.map((facility) => ({
        "@type": "LocationFeatureSpecification",
        "name": facility,
        "value": true
    }));

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Room",
        "name": `Kamar ${room.number} ${room.name}`,
        "image": room.images.length > 0 ? room.images[0] : `${baseUrl}/images/hero-bg.webp`,
        "description": room.description ?? `Sewa Kamar ${room.number} di Smartkost Pulo Jahe. Fasilitas: ${room.facilities.join(", ")}.`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jl. Pulo Jahe, RT.03/RW.10, Jatinegara, Kec. Cakung",
            "addressLocality": "Cakung",
            "addressRegion": "Jakarta Timur",
            "postalCode": "13930",
            "addressCountry": "ID"
        },
        "occupancy": {
            "@type": "QuantitativeValue",
            "value": 1
        },
        "amenityFeature": amenityFeature,
        "offers": {
            "@type": "Offer",
            "priceCurrency": "IDR",
            "price": room.price,
            "availability": room.status === "AVAILABLE" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `${baseUrl}/rooms/${room.id}`,
            "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": room.price,
                "priceCurrency": "IDR",
                "unitText": "MONTH",
                "referenceQuantity": {
                    "@type": "QuantitativeValue",
                    "value": 1,
                    "unitText": "MONTH"
                }
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
            />
            <RoomDetailView room={room} />
        </>
    );
}

export async function generateMetadata({
    params,
}: RoomDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const room = await getRoomById(id);

    if (!room) {
        return {
            title: "Kamar Tidak Ditemukan | Smartkost Pulo Jahe",
        };
    }

    const priceFormatted =
        room.price >= 1000000
            ? `${(room.price / 1000000).toFixed(1)}jt`
            : `${(room.price / 1000).toFixed(0)}rb`;

    const description = room.description ?? `Lihat detail Kamar ${room.number} di Smartkost Pulo Jahe. Fasilitas: ${room.facilities.slice(0, 3).join(", ")}.`;

    return {
        title: `Kamar ${room.number} ${room.name} — ${priceFormatted}/bln | Smartkost Pulo Jahe`,
        description,
        openGraph: {
            title: `Kamar ${room.number} ${room.name} — ${priceFormatted}/bln`,
            description,
            images: room.images.length > 0 ? [{ url: room.images[0] }] : undefined,
        },
        alternates: {
            canonical: `/rooms/${room.id}`,
        },
    };
}
