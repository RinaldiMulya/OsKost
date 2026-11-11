"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
    Building2, 
    MapPin, 
    Train, 
    Navigation, 
    Plus, 
    Minus, 
    LocateFixed, 
    Loader2, 
    Factory, 
    Bus, 
    ShoppingBag, 
    Clock,
    ExternalLink,
    HeartPulse,
    Sparkles
} from "lucide-react";
import type L from "leaflet";
import type { LocationPoint } from "./interactive-map";

// Dynamically import InteractiveMap to disable SSR
const InteractiveMap = dynamic(
    () => import("./interactive-map").then((mod) => mod.InteractiveMap),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-[#EFE7DE]/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-[#757069]">
                    <Loader2 className="w-7 h-7 animate-spin text-[#A45A3D]" />
                    <span className="text-xs font-semibold">Memuat Peta Kawasan...</span>
                </div>
            </div>
        ),
    }
);

interface HubCategory {
    id: string;
    category: string;
    shortLabel: string;
    icon: React.ReactNode;
    items: {
        name: string;
        desc: string;
        time: string;
        isHighlight?: boolean;
    }[];
}

const nearbyHubs: HubCategory[] = [
    {
        id: "industri",
        category: "Industri & Manufaktur",
        shortLabel: "Industri",
        icon: <Factory className="w-4 h-4 text-[#A45A3D]" />,
        items: [
            { name: "Kawasan Industri Pulo Gadung (PT JIEP)", desc: "Sentra industri utama Jakarta Timur", time: "19 Mnt (1,4 km / r 700m)", isHighlight: true },
            { name: "PT. Jakarta Kyoei Steel Works Tbk", desc: "Pabrik peleburan baja", time: "850 Meter" },
            { name: "PT. JAKARTA MARTEN LOGAMINDO", desc: "Peleburan logam & suku cadang", time: "700 Meter" },
            { name: "PT. Kemas Indah Maju (Plant Alpha)", desc: "Pabrik manufaktur kemasan", time: "700 Meter" },
            { name: "PT Yamaha Motor Parts Mfg Indonesia", desc: "Akses jalan pintas warga", time: "3 Menit" },
        ],
    },
    {
        id: "transportasi",
        category: "Transportasi Publik & KRL",
        shortLabel: "Transportasi",
        icon: <Train className="w-4 h-4 text-[#2C4C3B]" />,
        items: [
            { name: "Halte TransJakarta Pengarengan", desc: "Akses bus paling dekat & jalan kaki", time: "11 Mnt (850m / r 550m)", isHighlight: true },
            { name: "Stasiun KRL Buaran", desc: "Jalur Cikarang - Manggarai via jalan raya", time: "13 Mnt (4,7 km)", isHighlight: true },
            { name: "Halte TransJakarta JIEP", desc: "Pintu gerbang utama kawasan industri", time: "1,0 km" },
            { name: "Stasiun KRL Klender Baru", desc: "Alternatif stasiun Commuter Line", time: "3,2 km" },
            { name: "Stasiun KRL Cakung", desc: "Akses peron KRL alternatif", time: "4,3 km" },
        ],
    },
    {
        id: "pasar",
        category: "Kebutuhan Harian & Pasar",
        shortLabel: "Pasar & Belanja",
        icon: <ShoppingBag className="w-4 h-4 text-[#C98A2C]" />,
        items: [
            { name: "Pasar Pulo Jahe", desc: "Pasar bahan pangan segar harian", time: "< 1 Mnt (45m)", isHighlight: true },
            { name: "Toko Sembako 24 Jam (Monicha Jaya)", desc: "Kebutuhan sembako & air galon 24 jam", time: "100 Meter", isHighlight: true },
            { name: "Toko Embun Via & Pasar Tradisional", desc: "Kebutuhan harian rumah tangga", time: "83 - 90 Meter" },
            { name: "Alfamart Radjiman III", desc: "Minimarket berpendingin & ATM Center", time: "6 Mnt (500m)" },
            { name: "Pasar Cakung Sentral", desc: "Pasar komersial skala besar", time: "2,0 km" },
        ],
    },
    {
        id: "kesehatan",
        category: "Fasilitas Kesehatan & Medis",
        shortLabel: "Medis",
        icon: <HeartPulse className="w-4 h-4 text-[#A45A3D]" />,
        items: [
            { name: "Klinik Pratama Sumber Waluyo Medika", desc: "Faskes tingkat pertama bisa jalan kaki", time: "8 Mnt (650m)", isHighlight: true },
            { name: "RS Harapan Jayakarta", desc: "Rumah Sakit Rujukan & UGD 24 Jam", time: "13 Mnt (4,7 km)", isHighlight: true },
            { name: "Klinik Pratama Bina Husada Bakti", desc: "Klinik rawat jalan & medis umum", time: "1,4 km" },
            { name: "Primaya Hospital Kelapa Gading", desc: "Rumah sakit spesialis modern", time: "3,6 km" },
        ],
    },
];

export function MapsSection() {
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [selectedLocation, setSelectedLocation] = useState<LocationPoint>({
        id: "main",
        name: "OsKost Pulo Jahe (Cakung Sentral)",
        address: "Jl. Kp. Pulo Jahe No.104 b, RT.3/RW.5, Jatinegara, Kec. Cakung, Kota Jakarta Timur, 13930",
        lat: -6.1952196,
        lng: 106.92452,
        isMain: true,
        availableRooms: 4,
        googleMapsUrl: "https://www.google.com/maps/place/Kost+Buayu/@-6.1952196,106.9219451,880m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2e698b17c81090fd:0x33ca246c2c7b8768!8m2!3d-6.1952196!4d106.92452!16s%2Fg%2F11v3nss9gz",
    });

    const handleZoomIn = () => {
        if (mapInstance) mapInstance.zoomIn();
    };

    const handleZoomOut = () => {
        if (mapInstance) mapInstance.zoomOut();
    };

    const handleRecenter = () => {
        if (mapInstance) {
            mapInstance.flyTo([selectedLocation.lat, selectedLocation.lng], 17, {
                duration: 1.2,
            });
        }
    };

    const handleGetDirections = () => {
        const url = selectedLocation.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    // Filter categories based on active tab
    const displayedCategories = activeTab === "all" 
        ? nearbyHubs 
        : nearbyHubs.filter(cat => cat.id === activeTab);

    return (
        <section id="lokasi" className="w-full bg-[#FFFFFF] py-8 sm:py-10 lg:py-10 border-b border-[#2C2825]/6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6 sm:mb-8">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#A45A3D] bg-[#A45A3D]/10 px-3.5 py-1.5 rounded-full inline-block mb-3.5">
                            Konektivitas Strategis
                        </span>
                        <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight">
                            Pusat Industri &amp; Mobilitas Urban
                        </h2>
                    </div>

                    <p className="font-ui text-sm text-[#757069] max-w-md">
                        Tepat di samping Pasar Pulo Jahe (45 m) dan berdampingan langsung dengan Kawasan Industri Pulogadung (PT JIEP). Akses cepat ke stasiun KRL, halte TransJakarta, dan klinik medis.
                    </p>
                </div>

                {/* 2 Column Layout: Left Nearby Facilities, Right Map Frame */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left Column: Nearby Facilities List */}
                    <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                        
                        {/* Category Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F8F6F1] rounded-2xl border border-[#2C2825]/6">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === "all"
                                        ? "bg-[#FFFFFF] text-[#1E1B18] shadow-xs"
                                        : "text-[#757069] hover:text-[#1E1B18]"
                                }`}
                            >
                                Semua
                            </button>
                            {nearbyHubs.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        activeTab === cat.id
                                            ? "bg-[#FFFFFF] text-[#1E1B18] shadow-xs"
                                            : "text-[#757069] hover:text-[#1E1B18]"
                                    }`}
                                >
                                    {cat.shortLabel}
                                </button>
                            ))}
                        </div>

                        {/* List Cards */}
                        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                            {displayedCategories.map((cat) => {
                                // If "all" tab, show highlights (or top 2-3); if specific tab, show all items
                                const itemsToShow = activeTab === "all"
                                    ? cat.items.slice(0, 2)
                                    : cat.items;

                                return (
                                    <div
                                        key={cat.id}
                                        className="p-4 sm:p-5 rounded-2xl bg-[#F8F6F1] border border-[#2C2825]/8"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] flex items-center justify-center shadow-xs">
                                                    {cat.icon}
                                                </div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B18]">
                                                    {cat.category}
                                                </h3>
                                            </div>
                                            {activeTab === "all" && (
                                                <button
                                                    onClick={() => setActiveTab(cat.id)}
                                                    className="text-[11px] font-semibold text-[#A45A3D] hover:underline cursor-pointer"
                                                >
                                                    Lihat semua ({cat.items.length})
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {itemsToShow.map((item, iIdx) => (
                                                <div
                                                    key={iIdx}
                                                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FFFFFF] border border-[#2C2825]/5 hover:border-[#2C2825]/15 transition-colors"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-[#1E1B18] truncate">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-[11px] text-[#757069] truncate">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 text-[11px] font-bold text-[#A45A3D] bg-[#A45A3D]/10 px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {item.time}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Location Details Card */}
                        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#2C2825]/8 shadow-[0_4px_20px_rgba(44,40,37,0.04)]">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#C7EBD4] text-[#2C4C3B] flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-editorial text-base font-bold text-[#1E1B18]">
                                            {selectedLocation.name}
                                        </h4>
                                        <span className="text-[10px] font-bold text-[#2C4C3B] bg-[#C7EBD4] px-2 py-0.5 rounded-full">
                                            Bebas Banjir
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#757069] mt-0.5">
                                        {selectedLocation.address}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleGetDirections}
                                className="w-full bg-[#A45A3D] hover:bg-[#864327] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(164,90,61,0.25)] transition-all cursor-pointer"
                            >
                                <Navigation className="w-4 h-4" />
                                <span>Petunjuk Rute Google Maps</span>
                            </button>

                            <Link
                                href="/radar"
                                className="w-full bg-[#00529C]/10 hover:bg-[#00529C]/15 text-[#00529C] border border-[#00529C]/20 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-2.5"
                            >
                                <Sparkles className="w-4 h-4 text-[#00529C]" />
                                <span>Buka OsRadar Spatial AI (3 Cincin Zona) &rarr;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Stylized Leaflet Map Frame */}
                    <div className="lg:col-span-7 relative min-h-[450px] lg:min-h-full rounded-3xl overflow-hidden border border-[#2C2825]/8 shadow-[0_8px_30px_rgba(44,40,37,0.06)] bg-[#F8F6F1]">
                        <div className="absolute inset-0 z-0">
                            <InteractiveMap
                                onMapReady={setMapInstance}
                                onSelectLocation={setSelectedLocation}
                            />
                        </div>

                        {/* Map Controls */}
                        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <button
                                onClick={handleZoomIn}
                                title="Perbesar"
                                className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-[#2C2825]/10 flex items-center justify-center text-[#1E1B18] hover:bg-white shadow-md transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleZoomOut}
                                title="Perkecil"
                                className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-[#2C2825]/10 flex items-center justify-center text-[#1E1B18] hover:bg-white shadow-md transition-all"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleRecenter}
                                title="Pusatkan"
                                className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-[#A45A3D]/30 flex items-center justify-center text-[#A45A3D] hover:bg-white shadow-md transition-all"
                            >
                                <LocateFixed className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Floating Bottom Info Pill */}
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                            <div className="bg-white/95 backdrop-blur-md border border-[#2C2825]/10 p-3 rounded-2xl shadow-lg flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-[#1E1B18]">
                                    <MapPin className="w-4 h-4 text-[#A45A3D] shrink-0" />
                                    <span className="truncate">Area Cakung - Pulo Jahe, Jakarta Timur</span>
                                </div>
                                <span className="text-[11px] font-bold text-[#2C4C3B] bg-[#C7EBD4] px-2.5 py-1 rounded-full whitespace-nowrap">
                                    Lokasi Bebas Banjir
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
