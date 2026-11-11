import Link from "next/link";
import { headers } from "next/headers";
import { Building2, ShieldCheck, Phone, Home, DoorOpen } from "lucide-react";
import { getPropertyPublicBySlug } from "@/features/rooms/room-service";

interface PropertyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function PropertyLayout({
  children,
  params,
}: PropertyLayoutProps) {
  const { slug } = await params;
  const property = await getPropertyPublicBySlug(slug);

  const propertyName = property?.name || "Website Resmi Kost";
  const managerPhone = property?.managerPhone
    ? property.managerPhone.replace(/^0/, "62")
    : null;

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
  const kamarHref = isSubdomain ? "/kamar" : `/p/${slug}/kamar`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#1E1B18] font-sans antialiased selection:bg-[#A45A3D]/20 selection:text-[#A45A3D]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#2C2825]/8 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <Link href={homeHref} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#8C6239] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#1E1B18] text-sm sm:text-base tracking-tight group-hover:text-[#8C6239] transition-colors leading-tight">
              {propertyName}
            </span>
            <span className="text-[10px] text-[#7A7067] font-medium tracking-wide">
              Website Resmi Properti
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#54433D]">
          <Link
            href={homeHref}
            className="flex items-center gap-1.5 hover:text-[#8C6239] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
          <Link
            href={kamarHref}
            className="flex items-center gap-1.5 hover:text-[#8C6239] transition-colors"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Katalog Seluruh Kamar</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {managerPhone && (
            <a
              href={`https://wa.me/${managerPhone}?text=${encodeURIComponent(
                `Halo Pengelola ${propertyName}, saya ingin tanya informasi ketersediaan kamar.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF2EA] text-[#8C6239] hover:bg-[#F2E5D6] text-xs font-semibold border border-[#8C6239]/20 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Tanya Pengelola</span>
            </a>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terdaftar di OsKost</span>
          </div>

          <Link
            href={kamarHref}
            className="px-3.5 py-1.5 rounded-lg bg-[#8C6239] text-white text-xs sm:text-sm font-semibold hover:bg-[#724e2c] transition-colors shadow-2xs"
          >
            Pilihan Kamar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Subtle White-Label Footer */}
      <footer className="w-full bg-[#1E1B18] text-[#EFE7DE] py-10 px-4 sm:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="font-bold text-base text-white">
              Website Resmi {propertyName}
            </div>
            <p className="text-xs text-[#A89F91] mt-1 max-w-md">
              {property?.address
                ? `Berlokasi di ${property.address}. Situs ini dikelola langsung oleh pemilik dan pengelola properti untuk transparansi sewa dan kemudahan calon penghuni.`
                : "Situs ini dikelola langsung oleh pemilik dan pengelola properti untuk transparansi sewa dan kemudahan calon penghuni."}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-[#C7A379]">
              <Link href={homeHref} className="hover:underline">
                Beranda
              </Link>
              <span>•</span>
              <Link href={kamarHref} className="hover:underline">
                Katalog Kamar
              </Link>
              {managerPhone && (
                <>
                  <span>•</span>
                  <a
                    href={`https://wa.me/${managerPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Kontak Pengelola
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#A89F91]">
            <span>Didukung oleh</span>
            <Link
              href="https://oskost.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#EFE7DE] hover:text-[#C7A379] underline underline-offset-4 transition-colors"
            >
              OsKost Platform
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
