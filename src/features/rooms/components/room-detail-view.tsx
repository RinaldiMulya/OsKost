"use client";

import Image from "next/image";
import Link from "next/link";
import {
    X,
    ShowerHead,
    Wifi,
    BedDouble,
    Rocket,
    ShieldCheck,
    Clock,
    AirVent,
    Tv,
    CookingPot,
    Car,
    Sun,
    Plug,
    Check,
    Key,
    Coffee,
    Lock,
    Shirt,
    Trash2,
    Utensils,
    ParkingCircle,
    Droplets,
    Fan,
    Refrigerator,
    Armchair,
    BookOpen,
    Bath,
    Sofa,
    DoorOpen,
    Lamp,
    WashingMachine,
    Cctv,
    MapPin,
    Building2,
    Phone,
    Share2,
    Sparkles,
    Calendar,
    CheckCircle2,
    ArrowLeft,
    Factory,
    Train,
    ShoppingBag,
    HeartPulse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoomImageGallery } from "./room-image-gallery";
import type { RoomDetail } from "../room-service";

// Icon mapping by facility keyword
const facilityIconMap: [string[], React.ComponentType<{ className?: string }>][] = [
    [["wifi", "internet", "wi-fi", "fiber"], Wifi],
    [["ac", "air conditioner", "pendingin"], AirVent],
    [["kipas", "fan", "exhaust"], Fan],
    [["listrik", "token", "va"], Plug],
    [["water heater", "pemanas air"], Droplets],
    [["kamar mandi", "shower", "mandi dalam", "wc", "toilet"], ShowerHead],
    [["bathtub", "bak mandi"], Bath],
    [["kasur", "bed", "springbed", "tempat tidur"], BedDouble],
    [["meja", "desk", "work desk", "meja kerja", "sungkai"], BookOpen],
    [["lemari", "wardrobe", "closet"], DoorOpen],
    [["tv", "smart tv", "televisi"], Tv],
    [["balkon", "balcony", "teras"], Sun],
    [["kulkas", "refrigerator", "pantry"], Refrigerator],
    [["smart lock", "keyless", "rfid", "kunci"], Key],
    [["dapur", "kitchen"], CookingPot],
    [["parkir", "parking"], ParkingCircle],
    [["cctv", "keamanan"], Cctv],
];

function getFacilityIcon(facilityName: string) {
    const lower = facilityName.toLowerCase();
    for (const [keywords, IconComponent] of facilityIconMap) {
        if (keywords.some((kw) => lower.includes(kw))) {
            return IconComponent;
        }
    }
    return Sparkles;
}

function formatRupiah(price: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(price);
}

interface RoomDetailViewProps {
    room: RoomDetail;
}

export function RoomDetailView({ room }: RoomDetailViewProps) {
    const propertyName = room.property?.name || "OSkost Pulo Jahe";
    const propertyAddress = room.property?.address || "Jl. Pulo Jahe No. 104b, Jatinegara, Kec. Cakung, Jakarta Timur";
    const managerPhone = (room.property?.managerPhone || "6287890976782").replace(/^0/, "62");
    const guardPhone = room.property?.guardPhone || "0812-3456-789";

    const isAvailable = room.status === "AVAILABLE";
    const isMaintenance = room.status === "MAINTENANCE";

    const statusBadge = () => {
        if (isAvailable) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C7EBD4] text-[#2C4C3B] font-ui text-xs font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#2C4C3B] animate-pulse" />
                    Kamar Tersedia
                </span>
            );
        }
        if (isMaintenance) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDDB6] text-[#784C00] font-ui text-xs font-semibold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#784C00]" />
                    Sedang Maintenance
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9E1D9] text-[#757069] font-ui text-xs font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#757069]" />
                Kamar Terisi / Disewa
            </span>
        );
    };

    const priceFormatted = formatRupiah(room.price);
    const depositFormatted = formatRupiah(500000);

    const isLargeRoom = room.type?.toLowerCase().includes("besar");
    const roomDimensions = isLargeRoom ? "4.0m x 4.5m (18 m²)" : "3.0m x 3.5m (10.5 m²)";
    const roomCapacity = isLargeRoom ? "Kapasitas 2 - 3 Orang" : "Kapasitas 1 Orang";
    const bedType = isLargeRoom ? "Springbed Queen Size (160x200)" : "Springbed Single Size (100x200)";

    return (
        <div className="min-h-screen bg-[#F8F6F1] text-[#1E1B18] antialiased">
            {/* ========================================================
                1. TOP FLOATING JAPANDI NAVIGATION BAR
               ======================================================== */}
            <header className="sticky top-0 z-50 w-full bg-[#F8F6F1]/90 backdrop-blur-xl border-b border-[#2C2825]/8 shadow-[0_2px_12px_rgba(44,40,37,0.03)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Link */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#2C2825]/8 shadow-sm flex items-center justify-center p-1 transition-transform group-hover:scale-105">
                            <Image
                                src="/images/logo-icon.png"
                                alt="OsKost"
                                width={28}
                                height={28}
                                className="w-6 h-6 object-contain"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-editorial text-2xl font-bold tracking-tight text-[#1E1B18]">
                                OsKost
                            </span>
                            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#C7EBD4] text-[#2C4C3B] text-[10px] font-bold tracking-wider uppercase">
                                Residences
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/kamar"
                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#2C2825]/8 text-xs font-semibold text-[#54433D] hover:text-[#A45A3D] transition-colors shadow-xs"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Katalog</span>
                        </Link>

                        <Link
                            href="/kamar"
                            className="w-10 h-10 rounded-xl bg-white border border-[#2C2825]/8 flex items-center justify-center text-[#54433D] hover:text-[#A45A3D] hover:bg-[#FAF2EA] transition-colors"
                            title="Tutup & Kembali"
                        >
                            <X className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* ========================================================
                2. MAIN CONTENT STAGE
               ======================================================== */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-28">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[#757069] mb-6">
                    <Link href="/" className="hover:text-[#A45A3D] transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/kamar" className="hover:text-[#A45A3D] transition-colors">Katalog Kamar</Link>
                    <span>/</span>
                    <span className="text-[#1E1B18] font-bold">Kamar No. {room.number}</span>
                </div>

                {/* Gallery & 360 Viewport Section */}
                <RoomImageGallery
                    images={room.images}
                    panoramaImages={room.panoramaImages}
                    roomName={room.name}
                    roomNumber={room.number}
                    priceDisplay={`${priceFormatted} / bln`}
                />

                {/* Two-Column Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    
                    {/* LEFT COLUMN: ROOM SPECS & DETAILS (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Title & Property Badges Card */}
                        <div className="bg-[#FFFFFF] border border-[#2C2825]/8 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(44,40,37,0.04)] flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="px-3 py-1 rounded-full bg-[#A45A3D]/10 text-[#A45A3D] font-ui text-xs font-bold uppercase tracking-wider">
                                        Unit No. {room.number}
                                    </span>
                                    {statusBadge()}
                                </div>
                                <span className="px-3 py-1 rounded-full bg-[#FAF2EA] text-[#A45A3D] font-ui text-xs font-bold border border-[#2C2825]/5">
                                    {room.type || "Standar (1 Orang)"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight">
                                    Kamar {room.number} — {room.name}
                                </h1>
                                <p className="font-ui text-xs sm:text-sm text-[#757069] flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-[#A45A3D] shrink-0" />
                                    <span>{propertyName} • {propertyAddress}</span>
                                </p>
                            </div>

                            <div className="h-px w-full bg-[#2C2825]/6 my-1" />

                            {/* 4 Architectural Micro-Tiles */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3.5 rounded-2xl bg-[#FAF2EA] flex flex-col gap-1 border border-[#2C2825]/5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#757069]">
                                        Dimensi Kamar
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-[#1E1B18]">
                                        {roomDimensions}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-[#FAF2EA] flex flex-col gap-1 border border-[#2C2825]/5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#757069]">
                                        Kapasitas
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-[#1E1B18]">
                                        {roomCapacity}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-[#FAF2EA] flex flex-col gap-1 border border-[#2C2825]/5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#757069]">
                                        Kasur / Matras
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-[#1E1B18] truncate">
                                        Orthopedic Bed
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-[#FAF2EA] flex flex-col gap-1 border border-[#2C2825]/5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#757069]">
                                        Meteran Listrik
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-[#1E1B18]">
                                        Token 1300 VA
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Room Description Card */}
                        <div className="bg-[#FFFFFF] border border-[#2C2825]/8 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(44,40,37,0.04)] flex flex-col gap-4">
                            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#1E1B18]">
                                Deskripsi &amp; Kenyamanan Ruang
                            </h2>
                            <p className="font-ui text-sm text-[#54433D] leading-relaxed">
                                {room.description || "Kamar kost modern bergaya Japandi minimalis yang mengedepankan sirkulasi udara bersih, ketenangan bekerja dari rumah, dan privasi penuh penghuni. Dilengkapi meja kerja fungsional, pencahayaan alami jendela besar, serta akses keamanan terenkripsi."}
                            </p>
                            <p className="font-ui text-xs text-[#757069] leading-relaxed">
                                Bebas jam malam dengan akses smart lock digital RFID. Lingkungan tenang, bebas banjir, serta dibersihkan secara rutin di area komunal dan koridor.
                            </p>
                        </div>

                        {/* Facilities Grid Card */}
                        <div className="bg-[#FFFFFF] border border-[#2C2825]/8 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(44,40,37,0.04)] flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#1E1B18]">
                                    Fasilitas Kamar &amp; Hunian
                                </h2>
                                <span className="text-xs text-[#757069]">
                                    {room.facilities.length} Fasilitas Lengkap
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                                {room.facilities.map((facility, index) => {
                                    const IconComponent = getFacilityIcon(facility);
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF2EA] border border-[#2C2825]/5 hover:bg-[#EFE7DE] transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#A45A3D] shadow-xs shrink-0">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <span className="font-ui text-xs font-semibold text-[#1E1B18] line-clamp-1">
                                                {facility}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Connectivity & Neighborhood Card */}
                        <div className="bg-[#FFFFFF] border border-[#2C2825]/8 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(44,40,37,0.04)] flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF2EA] text-[#A45A3D] text-[11px] font-bold uppercase tracking-wider w-fit">
                                    <MapPin className="w-3.5 h-3.5 text-[#A45A3D]" />
                                    <span>Peta Lingkungan &amp; Titik Strategis</span>
                                </div>
                                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#1E1B18]">
                                    Aksesibilitas &amp; Kawasan Sekitar
                                </h2>
                                <p className="font-ui text-xs sm:text-sm text-[#757069] leading-relaxed">
                                    Berada persis di pinggiran timur sentra industri raksasa Jakarta Timur. Tepat di samping Pasar Pulo Jahe (45 meter), berbatasan langsung dengan perimeter Kawasan Industri Pulogadung (PT JIEP), dan didukung fasilitas transportasi publik lengkap.
                                </p>
                            </div>

                            {/* 4 Pillars Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {/* Pillar 1: Industri */}
                                <div className="p-4 rounded-2xl bg-[#FAF2EA] border border-[#2C2825]/5 flex flex-col justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-[#A45A3D]">
                                            <Factory className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                                Sentra Industri &amp; Manufaktur
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 text-xs text-[#1E1B18]">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-semibold">Kawasan Industri Pulo Gadung (PT JIEP)</span>
                                                <span className="text-[11px] font-bold text-[#A45A3D] shrink-0">19 Mnt (1,4 km / r 700m)</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>PT. Jakarta Kyoei Steel Works Tbk</span>
                                                <span className="text-[11px] font-medium shrink-0">850 m</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>PT. JAKARTA MARTEN LOGAMINDO &amp; Kemas Indah</span>
                                                <span className="text-[11px] font-medium shrink-0">Radius 700 m</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>PT Yamaha Motor Parts Mfg</span>
                                                <span className="text-[11px] font-medium shrink-0">3 Mnt Jalan Kaki</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pillar 2: Transportasi */}
                                <div className="p-4 rounded-2xl bg-[#FAF2EA] border border-[#2C2825]/5 flex flex-col justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-[#2C4C3B]">
                                            <Train className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                                Transportasi Publik &amp; KRL
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 text-xs text-[#1E1B18]">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-semibold">Halte TransJakarta Pengarengan</span>
                                                <span className="text-[11px] font-bold text-[#2C4C3B] shrink-0">11 Mnt Jalan (850m)</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>Stasiun KRL Buaran (Jalur Cikarang-Mri)</span>
                                                <span className="text-[11px] font-medium shrink-0">13 Mnt (4,7 km)</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>Halte TransJakarta JIEP</span>
                                                <span className="text-[11px] font-medium shrink-0">1,0 km</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>Stasiun KRL Klender Baru &amp; Cakung</span>
                                                <span className="text-[11px] font-medium shrink-0">3,2 km - 4,3 km</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pillar 3: Kebutuhan Harian & Pasar */}
                                <div className="p-4 rounded-2xl bg-[#FAF2EA] border border-[#2C2825]/5 flex flex-col justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-[#C98A2C]">
                                            <ShoppingBag className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                                Pasar &amp; Kebutuhan Harian
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 text-xs text-[#1E1B18]">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-semibold">Pasar Pulo Jahe</span>
                                                <span className="text-[11px] font-bold text-[#C98A2C] shrink-0">&lt; 1 Mnt (Hanya 45m)</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>Toko Sembako 24 Jam (Monicha Jaya)</span>
                                                <span className="text-[11px] font-medium shrink-0">100 Meter</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>Toko Embun Via &amp; Pasar Tradisional</span>
                                                <span className="text-[11px] font-medium shrink-0">83 - 90 Meter</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>Minimarket Alfamart Radjiman III</span>
                                                <span className="text-[11px] font-medium shrink-0">6-7 Mnt (500m)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pillar 4: Fasilitas Kesehatan */}
                                <div className="p-4 rounded-2xl bg-[#FAF2EA] border border-[#2C2825]/5 flex flex-col justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-[#A45A3D]">
                                            <HeartPulse className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                                Fasilitas Medis &amp; Darurat
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 text-xs text-[#1E1B18]">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-semibold">Klinik Pratama Sumber Waluyo Medika</span>
                                                <span className="text-[11px] font-bold text-[#A45A3D] shrink-0">8 Mnt Jalan (650m)</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>RS Harapan Jayakarta (UGD 24 Jam)</span>
                                                <span className="text-[11px] font-medium shrink-0">13 Mnt Mobil (4,7 km)</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>Klinik Bina Husada &amp; Mitra</span>
                                                <span className="text-[11px] font-medium shrink-0">1,4 km - 1,5 km</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2 text-[#757069]">
                                                <span>Primaya Hospital Kelapa Gading</span>
                                                <span className="text-[11px] font-medium shrink-0">3,6 km</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STICKY BOOKING & PRICING CARD (4 cols) */}
                    <div className="lg:col-span-4 sticky top-28 flex flex-col gap-4">
                        <div className="bg-[#FFFFFF] border border-[#2C2825]/8 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(44,40,37,0.06)] flex flex-col gap-5">
                            {/* Price Header */}
                            <div className="flex flex-col gap-1 border-b border-[#2C2825]/6 pb-4">
                                <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-[#757069]">
                                    Tarif Sewa Bulanan
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-editorial text-3xl sm:text-4xl font-bold text-[#A45A3D]">
                                        {priceFormatted}
                                    </span>
                                    <span className="font-ui text-xs text-[#757069]">/ bulan</span>
                                </div>
                            </div>

                            {/* Transparent Cost Breakdown */}
                            <div className="flex flex-col gap-2.5 text-xs text-[#54433D]">
                                <div className="flex items-center justify-between">
                                    <span>Uang Sewa Pokok</span>
                                    <span className="font-semibold text-[#1E1B18]">{priceFormatted}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Deposit Jaminan (Refundable)</span>
                                    <span className="font-semibold text-[#1E1B18]">{depositFormatted}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>WiFi Fiber 100 Mbps</span>
                                    <span className="font-semibold text-[#2C4C3B]">Gratis (Termasuk)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Iuran Kebersihan Lingkungan</span>
                                    <span className="font-semibold text-[#2C4C3B]">Gratis (Termasuk)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Listrik Kamar</span>
                                    <span className="font-semibold text-[#1E1B18]">Token Mandiri (1300 VA)</span>
                                </div>
                            </div>

                            <div className="h-px w-full bg-[#2C2825]/6" />

                            {/* Action Booking Buttons */}
                            <div className="flex flex-col gap-3">
                                {isAvailable ? (
                                    <a
                                        href={`https://wa.me/${managerPhone}?text=${encodeURIComponent(
                                            `Halo Pengelola ${propertyName}, saya tertarik untuk booking Kamar No. ${room.number} (${room.name}) seharga ${priceFormatted}/bulan. Mohon info ketersediaan unit untuk survei/check-in.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 rounded-xl bg-[#A45A3D] hover:bg-[#864327] text-white font-ui text-xs font-bold transition-all shadow-[0_4px_14px_rgba(164,90,61,0.25)] hover:shadow-[0_6px_20px_rgba(164,90,61,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>Hubungi Pengelola via WhatsApp</span>
                                    </a>
                                ) : (
                                    <div className="w-full py-3.5 rounded-xl bg-[#E9E1D9] text-[#757069] font-ui text-xs font-bold text-center">
                                        {isMaintenance ? "Kamar Sedang Dalam Perbaikan" : "Kamar Sedang Terisi"}
                                    </div>
                                )}

                                <a
                                    href={`https://wa.me/${managerPhone}?text=${encodeURIComponent(
                                        `Halo Pengelola ${propertyName}, saya ingin tanya jadwal survei fisik langsung ke lokasi untuk Kamar No. ${room.number}.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 rounded-xl bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#1E1B18] font-ui text-xs font-semibold text-center transition-colors border border-[#2C2825]/5"
                                >
                                    Jadwalkan Survei Lokasi Langsung
                                </a>
                            </div>

                            {/* Trust Micro-Checklist */}
                            <div className="flex flex-col gap-2 pt-2 border-t border-[#2C2825]/6 text-[11px] text-[#757069]">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2C4C3B]" />
                                    <span>Deposit Aman Terverifikasi &amp; Transparan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2C4C3B]" />
                                    <span>Akses Kunci Digital Smartlock Keyless</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2C4C3B]" />
                                    <span>Pemberitahuan Tagihan Sewa Otomatis via WA</span>
                                </div>
                            </div>
                        </div>

                        {/* Guard / Emergency Assistance Card */}
                        <div className="bg-[#FAF2EA] border border-[#2C2825]/8 rounded-2xl p-4 flex items-center justify-between text-xs text-[#757069]">
                            <div className="flex items-center gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-[#A45A3D]" />
                                <span>Pos Jaga &amp; Keamanan 24 Jam:</span>
                            </div>
                            <span className="font-semibold text-[#1E1B18]">
                                {guardPhone}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
