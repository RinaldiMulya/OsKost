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
                className="p-2 text-[#1E1B18] hover:text-[#A45A3D] transition-colors rounded-lg bg-[#EFE7DE]/50 cursor-pointer"
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
                                href="/radar"
                                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#00529C]/10 text-[#00529C] font-bold text-sm border border-[#00529C]/20"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                <span>✨ OsRadar Spatial AI</span>
                            </Link>
                            <Link
                                href="/login"
                                className="text-[#1E1B18] hover:text-[#A45A3D] font-semibold text-sm py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Masuk Dashboard Owner
                            </Link>
                            <Link
                                href="/#pemilik-kost"
                                className="w-full bg-[#A45A3D] hover:bg-[#864327] text-white text-center font-semibold py-3 rounded-xl shadow-md text-sm transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Coba Gratis 14 Hari
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
