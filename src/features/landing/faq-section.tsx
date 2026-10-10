"use client";

import { useState } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import Link from "next/link";

const faqs = [
    {
        id: "faq-1",
        question: "Bagaimana cara booking kamar di OsKost?",
        answer: "Pilih kamar favorit Anda dari katalog klaster, lalu klik 'Ajukan Sewa'. Anda dapat langsung terhubung dengan pengelola atau memilih reservasi online dengan verifikasi identitas dan pembayaran aman via QRIS/Virtual Account resmi.",
    },
    {
        id: "faq-2",
        question: "Berapa lama estimasi jalan kaki ke PT Yamaha Motor Parts?",
        answer: "Hanya sekitar 3 menit jalan kaki. Properti OsKost Cakung Sentral memiliki akses jalan pintas pemukiman warga yang aman, teduh, dan bebas macet langsung menuju gerbang operasional karyawan.",
    },
    {
        id: "faq-3",
        question: "Apakah biaya sewa sudah termasuk listrik dan WiFi?",
        answer: "WiFi Fiber Optic 1Gbps, air bersih, keamanan CCTV AI 24/7, dan kebersihan area publik sudah termasuk gratis dalam biaya sewa bulanan. Untuk listrik kamar menggunakan token digital mandiri transparan tanpa mark-up agar Anda hanya membayar sesuai pemakaian pribadi.",
    },
    {
        id: "faq-4",
        question: "Apakah tersedia paket sewa jangka panjang (6 bulan atau tahunan)?",
        answer: "Ya, kami menyediakan promo Paket Kontrak 6+ Bulan dengan potongan harga spesial hingga 10%, prioritas pemilihan unit lantai, serta gratis cleaning service berkala.",
    },
    {
        id: "faq-5",
        question: "Bagaimana jika saya pemilik kost lain dan ingin menggunakan sistem OsKost SaaS?",
        answer: "OsKost menyediakan paket Gratis Selamanya untuk pemilik dengan 1 - 5 unit kamar pertama. Untuk kapasitas di atasnya, tersedia paket Starter (6-15 kamar), Growth (16-40 kamar), dan Pro (41-100 kamar) dengan jaminan uji coba 14 hari gratis tanpa kartu kredit. Seluruh paket mendukung unlimited lokasi properti dan otomatisasi penagihan via QRIS/VA Midtrans.",
    },
];

export function FaqSection() {
    const [openId, setOpenId] = useState<string | null>("faq-1");

    const toggleAccordion = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="w-full bg-[#FFFFFF] py-8 sm:py-10 lg:py-10 border-b border-[#2C2825]/6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A45A3D] bg-[#A45A3D]/10 px-4 py-1.5 rounded-full inline-block mb-3.5">
                        Pusat Bantuan &amp; Tanya Jawab
                    </span>
                    <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight mb-3">
                        Pertanyaan Umum Seputar OsKost
                    </h2>
                    <p className="font-ui text-base sm:text-lg text-[#38332E] leading-relaxed max-w-xl mx-auto">
                        Jawaban lengkap seputar fasilitas kamar, akses transportasi Cakung, dan tata cara pembayaran sewa.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="space-y-4 mb-8 sm:mb-10">
                    {faqs.map((faq) => {
                        const isOpen = openId === faq.id;

                        return (
                            <div
                                key={faq.id}
                                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                    isOpen
                                        ? "bg-[#F8F6F1] border-[#A45A3D]/30 shadow-[0_4px_16px_rgba(44,40,37,0.04)]"
                                        : "bg-[#FFFFFF] border-[#2C2825]/8 hover:border-[#2C2825]/15"
                                }`}
                            >
                                <button
                                    onClick={() => toggleAccordion(faq.id)}
                                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                                >
                                    <span className="font-editorial text-base sm:text-lg font-bold text-[#1E1B18]">
                                        {faq.question}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                        isOpen ? "bg-[#A45A3D] text-white rotate-180" : "bg-[#EFE7DE] text-[#54433D]"
                                    }`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-6 pb-5 pt-2 text-sm sm:text-base text-[#38332E] leading-relaxed border-t border-[#2C2825]/8">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* WhatsApp Help CTA Card */}
                <div className="p-6 sm:p-7 rounded-2xl bg-[#F8F6F1] border border-[#2C2825]/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div>
                        <h4 className="font-editorial text-lg font-bold text-[#1E1B18]">
                            Masih ada pertanyaan yang belum terjawab?
                        </h4>
                        <p className="text-sm text-[#38332E] mt-1">
                            Tim pengelola kami selalu siap sedia membantu konsultasi kamar dan jadwal kunjungan survey.
                        </p>
                    </div>

                    <Link
                        href="https://wa.me/6281234567890?text=Halo%20Admin%20OsKost,%20saya%20ingin%20tanya%20seputar%20sewa%20kamar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#2C4C3B] hover:bg-[#1E372A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-sm whitespace-nowrap transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat WhatsApp Admin</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
