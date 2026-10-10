"use client";

import { useRef } from "react";
import { Star, ArrowLeft, ArrowRight, Quote } from "lucide-react";

const testimonials = [
    {
        id: 1,
        rating: 5,
        text: "Tinggal di sini bikin berangkat kerja tenang banget. Cuma 3 menit jalan kaki ke PT Yamaha lewat jalan pintas warga. Kamarnya adem, kasurnya empuk, dan akses smart lock di HP bikin praktis.",
        name: "Bagus Setiawan",
        role: "Operator Senior — PT Yamaha Motor Parts",
        cluster: "Kost Sejahtera Cakung",
    },
    {
        id: 2,
        rating: 5,
        text: "Desain interior Japandi-nya beneran estetik dan menenangkan setelah seharian kerja di pabrik. Internet 1Gbps-nya lancar buat streaming dan video call keluarga di kampung tanpa putus.",
        name: "Siti Rahmawati",
        role: "Quality Assurance — Kawasan JIEP Pulogadung",
        cluster: "Kost Sejahtera Cakung",
    },
    {
        id: 3,
        rating: 5,
        text: "Dekat banget sama Stasiun KRL Buaran. Tiap pagi tinggal naik motor 7 menit udah sampai peron. Tagihan sewa transparan pake Virtual Account, gak pernah ada tagihan misterius.",
        name: "Andi Prasetyo",
        role: "IT Support — Segitiga Emas Kuningan",
        cluster: "Kost Sudirman Residence",
    },
    {
        id: 4,
        rating: 5,
        text: "Sebagai perempuan yang tinggal sendiri, sistem keamanan CCTV AI dan gerbang RFID bikin merasa aman 24 jam. Pengelola responsif banget kalau ada kendala fasilitas kamar.",
        name: "Dewi Lestari",
        role: "Staff Administrasi Logistik",
        cluster: "Kost Millennial Hub",
    },
];

export function TestimonialSection() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -360, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
        }
    };

    return (
        <section className="w-full bg-[#F8F6F1] py-8 sm:py-10 lg:py-10 border-b border-[#2C2825]/6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Navigation Controls */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-6 sm:mb-8">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#2C4C3B] bg-[#C7EBD4] px-3.5 py-1.5 rounded-full inline-block mb-3.5">
                            Pengalaman Penghuni
                        </span>
                        <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight">
                            Kenyamanan yang Dirasakan Nyata
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={scrollLeft}
                            aria-label="Geser ke kiri"
                            className="w-11 h-11 rounded-full bg-[#FFFFFF] border border-[#2C2825]/10 text-[#1E1B18] hover:text-[#A45A3D] hover:border-[#A45A3D] flex items-center justify-center transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={scrollRight}
                            aria-label="Geser ke kanan"
                            className="w-11 h-11 rounded-full bg-[#A45A3D] text-white hover:bg-[#864327] flex items-center justify-center transition-all shadow-md"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll Testimonials */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
                >
                    {testimonials.map((item) => (
                        <div
                            key={item.id}
                            className="w-[320px] sm:w-[380px] shrink-0 bg-[#FFFFFF] rounded-3xl p-7 border border-[#2C2825]/8 shadow-[0_4px_20px_rgba(44,40,37,0.04)] hover:shadow-[0_12px_32px_rgba(44,40,37,0.08)] transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                {/* Rating Stars */}
                                <div className="flex items-center gap-1 text-[#C98A2C] mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>

                                <p className="font-editorial italic text-sm text-[#1E1B18] leading-relaxed mb-6">
                                    &ldquo;{item.text}&rdquo;
                                </p>
                            </div>

                            <div className="pt-4 border-t border-[#2C2825]/6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-editorial text-sm font-bold text-[#1E1B18]">
                                        {item.name}
                                    </h4>
                                    <p className="text-[11px] text-[#757069] mt-0.5">
                                        {item.role}
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold text-[#2C4C3B] bg-[#C7EBD4] px-2.5 py-1 rounded-full">
                                    {item.cluster}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
