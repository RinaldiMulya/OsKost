"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

interface NavLink {
    href: string;
    label: string;
}

interface MobileNavToggleProps {
    navLinks: NavLink[];
}

export function MobileNavToggle({ navLinks }: MobileNavToggleProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="lg:hidden">
            <button
                className="p-2 text-[#1E1B18] hover:text-[#A45A3D] transition-colors rounded-lg bg-[#EFE7DE]/50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {isMenuOpen && (
                <div className="absolute top-20 left-0 right-0 py-6 border-b border-[#2C2825]/10 bg-[#F8F6F1]/98 backdrop-blur-xl shadow-2xl px-6 z-40 transition-all">
                    <div className="flex flex-col gap-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[#54433D] hover:text-[#A45A3D] font-medium text-sm py-2 border-b border-[#2C2825]/5"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-2 flex flex-col gap-2.5">
                            <Link
                                href="/login"
                                className="text-[#1E1B18] hover:text-[#A45A3D] font-semibold text-sm py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Masuk ke Portal Penghuni
                            </Link>
                            <Link
                                href="#kamar"
                                className="w-full bg-[#A45A3D] text-white text-center font-semibold py-3 rounded-xl shadow-md"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Cek Kamar Tersedia
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
