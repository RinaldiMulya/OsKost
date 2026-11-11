import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  getPropertyPublicBySlug,
  getPublicCatalogRooms,
} from "@/features/rooms/room-service";
import { CatalogClientView } from "@/app/(marketing)/kamar/catalog-client-view";

export const dynamic = "force-dynamic";

interface PropertyKamarPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    type?: string;
    price?: string;
    status?: string;
    search?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PropertyKamarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyPublicBySlug(slug);

  if (!property) {
    return {
      title: "Katalog Kamar Tidak Ditemukan | OsKost",
    };
  }

  return {
    title: `Katalog Kamar & Ketersediaan Realtime | ${property.name}`,
    description: `Daftar seluruh tipe dan unit kamar kost siap huni di ${property.name}. Alamat: ${property.address}. Update realtime ketersediaan, fasilitas lengkap, dan kontak langsung ke pengelola properti.`,
  };
}

export default async function PropertyKamarPage({
  params,
  searchParams,
}: PropertyKamarPageProps) {
  const { slug } = await params;
  const filterParams = await searchParams;

  const property = await getPropertyPublicBySlug(slug);
  if (!property) {
    notFound();
  }

  const rooms = await getPublicCatalogRooms({
    propertySlug: slug,
    type: filterParams.type || "all",
    priceRange: filterParams.price || "all",
    status: filterParams.status || "all",
    search: filterParams.search || "",
  });

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const hostname = host.replace(/:\d+$/, "").toLowerCase();
  const rootDomains = ["oskost.id", "oskost.my.id", "localhost", "127.0.0.1"];
  const isSubdomain =
    !rootDomains.some(
      (domain) => hostname === domain || hostname === `www.${domain}`
    ) &&
    !hostname.endsWith(".trycloudflare.com") &&
    !hostname.endsWith(".ngrok-free.app") &&
    !hostname.endsWith(".loca.lt");

  const homeHref = isSubdomain ? "/" : `/p/${slug}`;

  return (
    <div className="w-full min-h-screen bg-[#F8F6F1] py-8 sm:py-12">
      <CatalogClientView
        property={property}
        initialRooms={rooms}
        initialParams={{
          property: slug,
          type: filterParams.type || "all",
          price: filterParams.price || "all",
          status: filterParams.status || "all",
          search: filterParams.search || "",
        }}
        showSaaSPromo={false}
        homeHref={homeHref}
      />
    </div>
  );
}
