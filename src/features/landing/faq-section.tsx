"use client";

import { useState } from "react";
import { ChevronDown, Headset, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        id: "faq-1",
        question: "Bagaimana cara booking kamar di Smartkost?",
        answer: "Proses booking sangat mudah. Pilih kamar yang Anda inginkan dari daftar properti kami, klik tombol 'Booking Sekarang', lalu ikuti instruksi pembayaran. Anda bisa membayar menggunakan transfer bank, virtual account, atau e-wallet yang didukung."
    },
    {
        id: "faq-2",
        question: "Apakah bisa survey lokasi sebelum booking?",
        answer: "Tentu saja. Kami sangat menyarankan Anda untuk melakukan survey. Anda dapat menjadwalkan kunjungan melalui fitur 'Jadwalkan Survey' di halaman detail properti. Tim kami akan menghubungi Anda untuk konfirmasi waktu kunjungan."
    },
    {
        id: "faq-3",
        question: "Apa saja fasilitas yang termasuk dalam harga sewa?",
        answer: "Fasilitas bervariasi tergantung tipe kamar. Namun, umumnya harga sewa sudah termasuk listrik (kuota tertentu), air bersih, koneksi Wi-Fi berkecepatan tinggi, kebersihan area umum, dan keamanan 24 jam. Cek halaman detail masing-masing kamar untuk informasi spesifik."
    },
    {
        id: "faq-4",
        question: "Bagaimana kebijakan pembatalan booking?",
        answer: "Pembatalan dapat dilakukan maksimal H-7 sebelum tanggal masuk untuk mendapatkan pengembalian dana sebagian (sesuai S&K). Pembatalan kurang dari waktu tersebut mungkin tidak akan mendapatkan refund. Silakan hubungi customer service kami untuk bantuan lebih lanjut."
    }
];

export function FaqSection() {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-16 md:py-20">
            {/* Header Section */}
            <div className="text-center mb-16 relative">
                <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20 pointer-events-none">
                    <div className="w-64 h-64 bg-primary rounded-full blur-[100px]"></div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">FAQ & Help Center</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Temukan jawaban untuk pertanyaan umum seputar pencarian, pemesanan, dan fasilitas Smartkost.
                </p>
            </div>

            {/* Accordion Section */}
            <div className="space-y-4">
                {faqs.map((faq) => {
                    const isOpen = openId === faq.id;
                    
                    return (
                        <div 
                            key={faq.id} 
                            className={cn(
                                "bg-card/40 backdrop-blur-xl border rounded-xl overflow-hidden transition-all duration-300",
                                isOpen ? "border-secondary/50 shadow-lg shadow-black/10" : "border-border/30 hover:border-secondary/30"
                            )}
                        >
                            <button
                                aria-expanded={isOpen}
                                onClick={() => toggleAccordion(faq.id)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-xl group"
                            >
                                <span className={cn(
                                    "text-lg font-semibold transition-colors duration-200",
                                    isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                                )}>
                                    {faq.question}
                                </span>
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                                    isOpen ? "bg-muted" : "bg-card group-hover:bg-muted"
                                )}>
                                    <ChevronDown 
                                        className={cn(
                                            "w-5 h-5 text-foreground transition-transform duration-300",
                                            isOpen ? "rotate-180" : ""
                                        )}
                                    />
                                </div>
                            </button>
                            <div 
                                className={cn(
                                    "px-6 bg-muted/30 overflow-hidden transition-all duration-300 ease-in-out",
                                    isOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
                                )}
                            >
                                <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Contact Support CTA */}
            <div className="mt-20 text-center bg-card/40 backdrop-blur-xl border border-border/30 rounded-xl p-8 relative overflow-hidden">
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary opacity-10 rounded-full blur-[80px]"></div>
                <div className="relative z-10">
                    <div className="inline-flex justify-center mb-4">
                        <Headset className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Masih butuh bantuan?</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Tim support kami siap membantu menjawab pertanyaan Anda 24/7. Jangan ragu untuk menghubungi kami.
                    </p>
                    <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(156,0,253,0.3)] hover:shadow-[0_0_25px_rgba(156,0,253,0.5)]">
                        <MessageSquare className="w-4 h-4" />
                        Hubungi Customer Service
                    </button>
                </div>
            </div>
        </section>
    );
}
