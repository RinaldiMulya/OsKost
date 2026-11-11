import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export function FooterSection() {
    return (
        <footer className="w-full bg-[#1E1B18] text-[#F8F6F1] pt-12 pb-8 sm:pt-14 sm:pb-10 border-t border-[#2C2825]/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-8 sm:pb-10 border-b border-white/10">
                    {/* Brand Column */}
                    <div className="lg:col-span-5 flex flex-col items-start">
                        <Link href="/" className="flex items-center gap-3 mb-4 group">
                            {/* Logo Icon: Hanya muncul saat mobile mode (< sm) */}
                            <div className="sm:hidden w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
                                <Image
                                    src="/images/logo-icon-white.png"
                                    alt="OsKost Mark"
                                    width={28}
                                    height={28}
                                    className="w-6 h-6 object-contain"
                                />
                            </div>
                            <div className="flex items-center gap-2.5">
                                {/* Brand Lockup: Ditampilkan di Desktop & Tablet */}
                                <Image
                                    src="/images/logo-brand-white.png"
                                    alt="OsKost SaaS Platform"
                                    width={160}
                                    height={44}
                                    className="h-10 md:h-11 w-auto object-contain hidden sm:block"
                                />
                                {/* Teks Brand saat Mobile mode */}
                                <span className="font-editorial text-2xl font-bold tracking-tight text-white sm:hidden">
                                    OsKost
                                </span>
                                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-[#C7EBD4] text-[10px] font-bold tracking-wider uppercase">
                                    SaaS Platform
                                </span>
                            </div>
                        </Link>

                        <p className="font-ui text-xs sm:text-sm text-[#A8A29E] leading-relaxed max-w-sm mb-6">
                            Platform B2B SaaS Manajemen Kost #1 di Indonesia tanpa potongan komisi sewa (0% take rate). Otomatisasi pembukuan, tagihan WhatsApp otomatis, website subdomain mandiri per kost, dan aplikasi mobile penghuni.
                        </p>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#C7EBD4]">
                            <ShieldCheck className="w-4 h-4 text-[#C7EBD4]" />
                            <span>Sertifikasi Standar Data Escrow & Multi-Tenant Aman</span>
                        </div>
                    </div>

                    {/* Navigation 1: Eksplorasi Kamar */}
                    <div className="lg:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#A45A3D] mb-4">
                            Platform
                        </h4>
                        <ul className="space-y-2.5 text-xs text-[#A8A29E]">
                            <li>
                                <Link href="/#katalog" className="hover:text-white transition-colors">
                                    Katalog Kost Nasional
                                </Link>
                            </li>
                            <li>
                                <Link href="/#kalkulator" className="hover:text-white transition-colors">
                                    Kalkulator Penghematan
                                </Link>
                            </li>
                            <li>
                                <Link href="/#fasilitas" className="hover:text-white transition-colors">
                                    Fitur Unggulan
                                </Link>
                            </li>
                            <li>
                                <Link href="/#faq" className="hover:text-white transition-colors">
                                    Pusat Bantuan & FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Navigation 2: SaaS & Kemitraan */}
                    <div className="lg:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#A45A3D] mb-4">
                            Mitra Juragan Kost
                        </h4>
                        <ul className="space-y-2.5 text-xs text-[#A8A29E]">
                            <li>
                                <Link href="/#pemilik-kost" className="hover:text-white transition-colors">
                                    SaaS Pemilik Kost
                                </Link>
                            </li>
                            <li>
                                <Link href="/#pemilik-kost" className="hover:text-white transition-colors">
                                    Paket Langganan
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-white transition-colors">
                                    Login Dashboard Owner
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Navigation 3: Kontak & Hotline */}
                    <div className="lg:col-span-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#A45A3D] mb-4">
                            Kontak & Layanan
                        </h4>
                        <ul className="space-y-3 text-xs text-[#A8A29E]">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-[#A45A3D] shrink-0 mt-0.5" />
                                <span>Jakarta Timur, DKI Jakarta, Indonesia</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-[#2C4C3B] shrink-0" />
                                <a href="https://wa.me/6287890976782" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    +62 878-9097-6782 (WhatsApp CS)
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-[#C98A2C] shrink-0" />
                                <a href="mailto:halo@oskost.id" className="hover:text-white transition-colors">
                                    halo@oskost.id
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Legal & Copyright Bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#757069]">
                    <p>
                        &copy; 2025/2026 PT OsKost Harmoni Platform. Seluruh hak cipta dilindungi.
                    </p>
                    <div className="flex items-center gap-6 text-[11px]">
                        <Link href="/#fasilitas" className="hover:text-white transition-colors">
                            Ketentuan Layanan
                        </Link>
                        <Link href="/#faq" className="hover:text-white transition-colors">
                            Kebijakan Privasi
                        </Link>
                        <Link href="/#pemilik-kost" className="hover:text-white transition-colors">
                            Syarat Langganan SaaS
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
