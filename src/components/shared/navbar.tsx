import Link from "next/link";
import Image from "next/image";
import { User, Sparkles } from "lucide-react";
import { MobileNavToggle } from "./mobile-nav-toggle";

const navLinks = [
  // { href: "/kamar", label: "Kamar" },
  { href: "/#tur-360", label: "Tur 360°" },
  { href: "/#fasilitas", label: "Fasilitas" },
  { href: "/#lokasi", label: "Lokasi" },
  { href: "/#pemilik-kost", label: "Untuk Pemilik Kost" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F6F1]/90 backdrop-blur-xl border-b border-[#2C2825]/8 shadow-[0_2px_12px_rgba(44,40,37,0.03)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo Icon: Hanya muncul saat mobile mode (< sm) */}
            <div className="sm:hidden w-10 h-10 rounded-xl bg-white border border-[#2C2825]/8 shadow-[0_2px_8px_rgba(44,40,37,0.04)] flex items-center justify-center transition-transform group-hover:scale-105 p-1">
              <Image
                src="/images/logo-icon.png"
                alt="OsKost Mark"
                width={32}
                height={32}
                className="w-7 h-7 object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Brand Logo: Ditampilkan di Desktop & Tablet */}
              <Image
                src="/images/logo-brand.png"
                alt="OsKost SaaS Platform"
                width={190}
                height={48}
                className="h-11 md:h-12 w-auto object-contain hidden sm:block transition-opacity group-hover:opacity-90"
                priority
              />
              {/* Teks Brand saat Mobile mode */}
              <span className="font-editorial text-2xl font-bold text-[#1E1B18] tracking-tight sm:hidden">
                OsKost
              </span>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-[#C7EBD4] text-[#2C4C3B] text-[10px] font-bold tracking-wider uppercase">
                Residences
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-[#EFE7DE]/50 p-1.5 rounded-full border border-[#2C2825]/5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#757069] hover:text-[#1E1B18] hover:bg-[#A45A3D]/30 px-4 py-1.5 rounded-full transition-all duration-200 text-xs font-semibold tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-[#54433D] hover:text-[#A45A3D] text-xs font-semibold tracking-wide transition-colors px-2 py-1"
            >
              Portal Penghuni
            </Link>

            <Link
              href="/kamar"
              className="inline-flex items-center justify-center gap-2 bg-[#A45A3D] hover:bg-[#864327] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(164,90,61,0.25)] hover:shadow-[0_6px_20px_rgba(164,90,61,0.35)] transition-all duration-200"
            >
              <span>Properti</span>
            </Link>

            {/* <Link
              href="/login"
              className="w-9 h-9 rounded-full bg-[#EFE7DE] hover:bg-[#A45A3D]/20 text-[#54433D] flex items-center justify-center transition-colors"
              title="Akun Saya"
            >
              <User className="w-4 h-4" />
            </Link> */}
          </div>

          {/* Mobile Menu Button + Navigation */}
          <MobileNavToggle navLinks={navLinks} />
        </div>
      </nav>
    </header>
  );
}
