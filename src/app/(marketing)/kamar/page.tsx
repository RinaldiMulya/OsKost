import { Metadata } from "next";
import { getPublicCatalogRooms, getActivePropertyWithStats } from "@/features/rooms/room-service";
import { CatalogClientView } from "./catalog-client-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Katalog Kamar & Ketersediaan Realtime | OSkost Pulo Jahe",
    description: "Eksplorasi seluruh kamar kost siap huni di OSkost Pulo Jahe, Cakung, Jakarta Timur. Tipe Standar (1 Orang) & Tipe Besar (2-3 Orang), harga transparan dan pembaruan realtime.",
};

interface KamarPageProps {
    searchParams: Promise<{
        property?: string;
        type?: string;
        price?: string;
        status?: string;
        search?: string;
    }>;
}

export default async function KamarPage({ searchParams }: KamarPageProps) {
    const params = await searchParams;

    const property = await getActivePropertyWithStats();
    const rooms = await getPublicCatalogRooms({
        propertySlug: params.property || "pulo-jahe",
        type: params.type || "all",
        priceRange: params.price || "all",
        status: params.status || "all",
        search: params.search || "",
    });

    return (
        <div className="w-full min-h-screen bg-[#F8F6F1] pt-28 pb-20 sm:pt-32 sm:pb-28">
            <CatalogClientView 
                property={property}
                initialRooms={rooms}
                initialParams={{
                    property: params.property || "pulo-jahe",
                    type: params.type || "all",
                    price: params.price || "all",
                    status: params.status || "all",
                    search: params.search || "",
                }}
            />
        </div>
    );
}
