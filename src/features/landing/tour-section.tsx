"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
    Compass, 
    Maximize2, 
    Bed, 
    Laptop, 
    ShowerHead, 
    Zap, 
    Sparkles, 
    Layers,
    Loader2
} from "lucide-react";

// Dynamically import PhotoSphere Viewer without SSR
const Room360Viewer = dynamic(
    () => import("@/features/rooms/components/room-360-viewer").then((mod) => mod.Room360Viewer),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#2C2825] rounded-2xl min-h-[380px] sm:min-h-[460px]">
                <Loader2 className="w-8 h-8 text-[#A45A3D] animate-spin mb-3" />
                <p className="text-xs text-[#EFE7DE] uppercase tracking-widest font-semibold">
                    Memuat Pengalaman 360°...
                </p>
            </div>
        ),
    }
);

interface PanoramaItem {
    id: string;
    label: string;
    subtitle: string;
    url: string;
}

const defaultPanoramas: PanoramaItem[] = [
    {
        id: "pano-bedroom",
        label: "Kamar Tidur Utama 360°",
        subtitle: "Kasur Orthopedic & Pencahayaan Alami",
        url: "https://wmepodmqusjhlvungyzc.supabase.co/storage/v1/object/public/Oskost-Data-Public/panoramas/cmnbxthln0000b8zfpwjrern1/c998b926-b7eb-43ac-a71a-0f0595da0de6.jpeg",
    },
    {
        id: "pano-bathroom",
        label: "Kamar Mandi En-Suite 360°",
        subtitle: "Water Heater Instan & Sanitair Toto",
        url: "https://wmepodmqusjhlvungyzc.supabase.co/storage/v1/object/public/Oskost-Data-Public/panoramas/cmnbxthln0000b8zfpwjrern1/ec4f7258-56d3-4ce0-b6a8-a649b67bef3f.jpeg",
    },
];

const featureHighlights = [
    {
        icon: <Bed className="w-5 h-5 text-[#A45A3D]" />,
        title: "Kasur Orthopedic 160x200",
        description: "Springbed premium dengan sprei katun Jepang sejuk untuk tidur berkualitas.",
    },
    {
        icon: <Laptop className="w-5 h-5 text-[#2C4C3B]" />,
        title: "Meja Kerja Ergonomis",
        description: "Material kayu sungkai solid, kursi kerja nyaman, colokan universal & USB.",
    },
    {
        icon: <ShowerHead className="w-5 h-5 text-[#A45A3D]" />,
        title: "Kamar Mandi Dalam",
        description: "Dilengkapi water heater Ariston instan 24 jam dan ventilasi exhaust segar.",
    },
    {
        icon: <Zap className="w-5 h-5 text-[#C98A2C]" />,
        title: "AC & Token Listrik Mandiri",
        description: "AC 1/2 PK hening 19dB dengan meteran listrik token 1300 VA tanpa mark-up tarif.",
    },
];

interface TourSectionProps {
    panoramas?: PanoramaItem[];
}

export function TourSection({ panoramas = defaultPanoramas }: TourSectionProps) {
    const [activePano, setActivePano] = useState<PanoramaItem>(panoramas[0] || defaultPanoramas[0]);

    return (
        <section id="tur-360" className="w-full bg-[#FFFFFF] py-8 sm:py-10 lg:py-10 border-b border-[#2C2825]/6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A45A3D] bg-[#A45A3D]/10 px-4 py-1.5 rounded-full inline-block mb-3.5">
                        Eksplorasi Transparan
                    </span>
                    <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight mb-3">
                        Survei Kamar Nyata dari Ponsel Anda.
                    </h2>
                    <p className="font-ui text-base sm:text-lg text-[#38332E] leading-relaxed">
                        Eksplorasi setiap sudut tanpa distorsi lensa sudut lebar buatan. Pengalaman imersif interaktif 360° yang merefleksikan dimensi asli dan detail furnitur kamar.
                    </p>
                </div>

                {/* 360 Viewer Card Frame */}
                <div className="relative rounded-3xl overflow-hidden bg-[#F8F6F1] border border-[#2C2825]/8 shadow-[0_12px_40px_rgba(44,40,37,0.06)] p-3 sm:p-5 mb-8 sm:mb-10">
                    {/* Top Switcher Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
                        <div className="flex items-center gap-1.5 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#2C2825]/8 shadow-sm">
                            {panoramas.map((pano) => (
                                <button
                                    key={pano.id}
                                    onClick={() => setActivePano(pano)}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                        activePano.id === pano.id
                                            ? "bg-[#A45A3D] text-white shadow-sm"
                                            : "text-[#4A453F] hover:text-[#1E1B18] hover:bg-[#F8F6F1]"
                                    }`}
                                >
                                    {pano.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#2C4C3B] font-semibold bg-[#C7EBD4] px-3.5 py-1.5 rounded-full">
                                <Sparkles className="w-4 h-4" />
                                Interactive 360° Spherical
                            </span>
                            <Link
                                href="/kamar"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#2C2825]/8 text-xs sm:text-sm font-semibold text-[#1E1B18] hover:text-[#A45A3D] transition-colors"
                            >
                                <Compass className="w-4 h-4 text-[#A45A3D]" />
                                <span>Katalog Kamar</span>
                            </Link>
                        </div>
                    </div>

                    {/* Interactive PhotoSphere Viewport */}
                    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden bg-[#1E1B18] shadow-inner">
                        <Room360Viewer key={activePano.id} imageUrl={activePano.url} />
                    </div>

                    {/* Subtitle info below viewer */}
                    <div className="mt-3.5 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-[#38332E] gap-1">
                        <span className="font-semibold text-[#1E1B18]">
                            📍 Menampilkan: {activePano.label} — {activePano.subtitle}
                        </span>
                        <span className="text-xs text-[#A45A3D] font-bold">
                            💡 Klik &amp; geser mouse / swipe layar untuk memutar 360°
                        </span>
                    </div>
                </div>

                {/* 4 Room Feature Highlight Pills Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {featureHighlights.map((feat, idx) => (
                        <div
                            key={idx}
                            className="p-5 sm:p-6 rounded-2xl bg-[#F8F6F1] border border-[#2C2825]/8 hover:bg-[#FFFFFF] hover:shadow-[0_8px_24px_rgba(44,40,37,0.06)] hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#2C2825]/8 flex items-center justify-center mb-3.5 shadow-sm">
                                {feat.icon}
                            </div>
                            <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1E1B18] mb-1.5">
                                {feat.title}
                            </h3>
                            <p className="font-ui text-xs sm:text-sm text-[#38332E] leading-relaxed">
                                {feat.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
