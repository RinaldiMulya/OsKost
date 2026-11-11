"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    Search, 
    MapPin, 
    Home, 
    Sparkles, 
    Building2, 
    ShieldCheck, 
    Wifi, 
    Key, 
    Eye, 
    Calendar, 
    Phone, 
    X, 
    Check, 
    SlidersHorizontal, 
    RotateCcw,
    Users,
    ArrowRight
} from "lucide-react";
import type { RoomDetail, PropertyWithStats } from "@/features/rooms/room-service";

interface CatalogClientViewProps {
    property: PropertyWithStats | null;
    initialRooms: RoomDetail[];
    initialParams: {
        property: string;
        type: string;
        price: string;
        status: string;
        search: string;
    };
    showSaaSPromo?: boolean;
    homeHref?: string;
}

export function CatalogClientView({
    property,
    initialRooms,
    initialParams,
    showSaaSPromo = true,
    homeHref = "/",
}: CatalogClientViewProps) {
    const router = useRouter();

    // Filter states
    const [searchQuery, setSearchQuery] = useState(initialParams.search);
    const [selectedType, setSelectedType] = useState(initialParams.type);
    const [selectedStatus, setSelectedStatus] = useState(initialParams.status);
    const [selectedPrice, setSelectedPrice] = useState(initialParams.price);

    // Modal state for quick booking
    const [activeModalRoom, setActiveModalRoom] = useState<RoomDetail | null>(null);

    const propInfo = property || {
        id: "pulo-jahe",
        name: "OSkost Pulo Jahe Cakung",
        slug: "pulo-jahe",
        address: "Jl. Pulo Jahe No. 104b, Jatinegara, Kec. Cakung, Jakarta Timur",
        managerPhone: "087890976782",
        guardPhone: "08123456789",
        totalRooms: initialRooms.length,
        availableRooms: initialRooms.filter((r) => r.status === "AVAILABLE").length,
        occupiedRooms: initialRooms.filter((r) => r.status === "OCCUPIED").length,
        maintenanceRooms: 0,
    };

    // Client-side filtering
    const filteredRooms = useMemo(() => {
        return initialRooms.filter((room) => {
            // Search query filter
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                const matchNumber = room.number.toLowerCase().includes(q);
                const matchName = room.name.toLowerCase().includes(q);
                const matchDesc = room.description?.toLowerCase().includes(q);
                const matchFac = room.facilities.some((f) => f.toLowerCase().includes(q));
                if (!matchNumber && !matchName && !matchDesc && !matchFac) {
                    return false;
                }
            }

            // Type filter (standar vs besar)
            if (selectedType !== "all") {
                if (selectedType === "standar" || selectedType === "standard") {
                    if (!room.type?.toLowerCase().includes("standar")) return false;
                } else if (selectedType === "besar" || selectedType === "large" || selectedType === "deluxe") {
                    if (!room.type?.toLowerCase().includes("besar")) return false;
                }
            }

            // Status filter
            if (selectedStatus !== "all") {
                if (room.status.toLowerCase() !== selectedStatus.toLowerCase()) {
                    return false;
                }
            }

            // Price range filter
            if (selectedPrice !== "all") {
                if (selectedPrice === "under_1500k" && room.price >= 1500000) return false;
                if (selectedPrice === "1500k_2500k" && (room.price < 1500000 || room.price > 2500000)) return false;
                if (selectedPrice === "above_2500k" && room.price <= 2500000) return false;
            }

            return true;
        });
    }, [initialRooms, searchQuery, selectedType, selectedStatus, selectedPrice]);

    const handleReset = () => {
        setSearchQuery("");
        setSelectedType("all");
        setSelectedStatus("all");
        setSelectedPrice("all");
        router.replace("/kamar");
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "AVAILABLE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C7EBD4] text-[#2C4C3B] text-xs font-bold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#2C4C3B] animate-pulse" />
                        Tersedia
                    </span>
                );
            case "OCCUPIED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9E1D9] text-[#757069] text-xs font-semibold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#757069]" />
                        Terisi
                    </span>
                );
            case "MAINTENANCE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDDB6] text-[#784C00] text-xs font-semibold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#784C00]" />
                        Maintenance
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 sm:gap-10">
            {/* ========================================================
                1. HEADER TITLE & BREADCRUMB
               ======================================================== */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-[#757069]">
                    <Link href={homeHref} className="hover:text-[#A45A3D] transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-[#1E1B18] font-semibold">Katalog Kamar</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7DE] text-[#A45A3D] w-fit">
                            <Building2 className="w-4 h-4 text-[#A45A3D]" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                {propInfo.name}
                            </span>
                        </div>
                        <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B18] tracking-tight">
                            Katalog Seluruh Unit Kamar
                        </h1>
                        <p className="font-ui text-sm sm:text-base text-[#757069]">
                            {propInfo.address} • Total {propInfo.totalRooms} kamar ({propInfo.availableRooms} kamar tersedia siap huni hari ini).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`https://wa.me/${propInfo.managerPhone || "6287890976782"}?text=${encodeURIComponent(
                                `Halo Pengelola ${propInfo.name}, saya ingin menanyakan info ketersediaan kamar secara umum.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C4C3B] hover:bg-[#1E3629] text-white text-xs font-bold transition-all shadow-sm"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Kontak Pengelola ({propInfo.managerPhone || "0878-9097-6782"})</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* ========================================================
                2. TACTILE CERAMIC FILTER CONTROLS BAR
               ======================================================== */}
            <div className="bg-[#FFFFFF] border border-[#2C2825]/8 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(44,40,37,0.04)] flex flex-col gap-4">
                {/* Search Bar + Price Dropdown Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    {/* Search Input */}
                    <div className="md:col-span-8 relative">
                        <Search className="w-4 h-4 text-[#757069] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nomor kamar, nama, atau fasilitas (misal: 002, AC, Kasur)..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F6F1] border border-[#2C2825]/8 text-xs font-medium text-[#1E1B18] placeholder:text-[#757069] focus:outline-none focus:ring-2 focus:ring-[#A45A3D]/30"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#757069] hover:text-[#1E1B18]"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Rentang Harga Select */}
                    <div className="md:col-span-4 flex items-center gap-2">
                        <select
                            value={selectedPrice}
                            onChange={(e) => setSelectedPrice(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#2C2825]/8 text-xs font-semibold text-[#1E1B18] focus:outline-none cursor-pointer"
                        >
                            <option value="all">Semua Rentang Harga</option>
                            <option value="under_1500k">&lt; Rp 1.5jt / bulan</option>
                            <option value="1500k_2500k">Rp 1.5jt - Rp 2.5jt / bulan</option>
                            <option value="above_2500k">&gt; Rp 2.5jt / bulan</option>
                        </select>

                        {(searchQuery || selectedType !== "all" || selectedStatus !== "all" || selectedPrice !== "all") && (
                            <button
                                onClick={handleReset}
                                className="p-2.5 rounded-xl bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#A45A3D] transition-colors cursor-pointer"
                                title="Reset Filter"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Pills: Tipe Kamar & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2C2825]/5">
                    {/* Tipe Kamar Switcher */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#757069] mr-1">
                            Tipe:
                        </span>
                        <button
                            onClick={() => setSelectedType("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                selectedType === "all"
                                    ? "bg-[#A45A3D] text-white shadow-sm"
                                    : "bg-[#F8F6F1] text-[#757069] hover:text-[#1E1B18]"
                            }`}
                        >
                            Semua ({initialRooms.length})
                        </button>
                        <button
                            onClick={() => setSelectedType("standar")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                selectedType === "standar"
                                    ? "bg-[#A45A3D] text-white shadow-sm"
                                    : "bg-[#F8F6F1] text-[#757069] hover:text-[#1E1B18]"
                            }`}
                        >
                            <span>Standar (1 Orang)</span>
                        </button>
                        <button
                            onClick={() => setSelectedType("besar")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                selectedType === "besar"
                                    ? "bg-[#A45A3D] text-white shadow-sm"
                                    : "bg-[#F8F6F1] text-[#757069] hover:text-[#1E1B18]"
                            }`}
                        >
                            <span>Besar / Deluxe (2-3 Orang)</span>
                        </button>
                    </div>

                    {/* Status Switcher */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#757069] mr-1">
                            Status:
                        </span>
                        <button
                            onClick={() => setSelectedStatus("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                selectedStatus === "all"
                                    ? "bg-[#2C4C3B] text-white shadow-sm"
                                    : "bg-[#F8F6F1] text-[#757069] hover:text-[#1E1B18]"
                            }`}
                        >
                            Semua Status
                        </button>
                        <button
                            onClick={() => setSelectedStatus("AVAILABLE")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                selectedStatus === "AVAILABLE"
                                    ? "bg-[#C7EBD4] text-[#2C4C3B] font-bold"
                                    : "bg-[#F8F6F1] text-[#757069] hover:text-[#1E1B18]"
                            }`}
                        >
                            Tersedia ({propInfo.availableRooms})
                        </button>
                        <button
                            onClick={() => setSelectedStatus("OCCUPIED")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                selectedStatus === "OCCUPIED"
                                    ? "bg-[#E9E1D9] text-[#1E1B18] font-bold"
                                    : "bg-[#F8F6F1] text-[#757069] hover:text-[#1E1B18]"
                            }`}
                        >
                            Terisi
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Counter Bar */}
            <div className="flex items-center justify-between text-xs text-[#757069] px-1">
                <span>
                    Menampilkan <strong className="text-[#1E1B18]">{filteredRooms.length}</strong> unit kamar
                </span>
                <span className="text-[11px]">
                    Sinkronisasi data real-time dengan database OsKost
                </span>
            </div>

            {/* ========================================================
                3. ROOMS GRID
               ======================================================== */}
            {filteredRooms.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#2C2825]/8 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF2EA] flex items-center justify-center text-[#A45A3D]">
                        <Home className="w-6 h-6" />
                    </div>
                    <h3 className="font-editorial text-xl font-bold text-[#1E1B18]">
                        Tidak ada kamar yang sesuai filter
                    </h3>
                    <p className="font-ui text-xs text-[#757069] max-w-sm">
                        Coba sesuaikan pencarian Anda atau reset filter untuk melihat seluruh unit kamar yang tersedia.
                    </p>
                    <button
                        onClick={handleReset}
                        className="mt-2 px-4 py-2 rounded-xl bg-[#A45A3D] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                        Reset Semua Filter
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRooms.map((room) => {
                        const roomImg = room.images?.[0] || "/images/rooms/room-1.webp";

                        return (
                            <div
                                key={room.id}
                                className="bg-[#FFFFFF] rounded-2xl p-4 flex flex-col gap-3.5 border border-[#2C2825]/8 shadow-[0_4px_16px_rgba(44,40,37,0.04)] hover:shadow-[0_12px_28px_rgba(44,40,37,0.08)] hover:-translate-y-1 transition-all duration-300 group"
                            >
                                {/* Room Image Container */}
                                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#EFE7DE]">
                                    <Image
                                        src={roomImg}
                                        alt={room.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Status Badge */}
                                    <div className="absolute top-2.5 left-2.5 z-10">
                                        {getStatusBadge(room.status)}
                                    </div>

                                    {/* Room Number Tag */}
                                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#1E1B18]/80 backdrop-blur-md text-white text-[11px] font-bold">
                                        No. {room.number}
                                    </div>
                                </div>

                                {/* Room Content */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-editorial text-lg font-bold text-[#1E1B18]">
                                            {room.name}
                                        </h4>
                                        <span className="text-[10px] font-bold text-[#A45A3D] uppercase tracking-wider bg-[#A45A3D]/10 px-2 py-0.5 rounded-md">
                                            {room.type || "Standar"}
                                        </span>
                                    </div>
                                    <p className="font-ui text-xs text-[#757069] line-clamp-1">
                                        {room.description || "Fasilitas lengkap & nyaman."}
                                    </p>
                                </div>

                                {/* Facility Tags */}
                                <div className="flex flex-wrap gap-1.5 text-[#757069]">
                                    {room.facilities.slice(0, 3).map((fac, idx) => (
                                        <span 
                                            key={idx}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FAF2EA] text-[10px] font-medium"
                                        >
                                            {fac}
                                        </span>
                                    ))}
                                </div>

                                {/* Price & Actions */}
                                <div className="mt-auto pt-2 border-t border-[#2C2825]/5 flex flex-col gap-2.5">
                                    <div className="flex items-baseline justify-between">
                                        <span className="font-ui text-[10px] uppercase font-bold text-[#757069]">
                                            Tarif Sewa
                                        </span>
                                        <span className="font-ui text-base font-bold text-[#A45A3D]">
                                            {formatPrice(room.price)}
                                            <span className="text-[11px] font-normal text-[#757069]">/bln</span>
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href={`/rooms/${room.id}`}
                                            className="w-full py-2 rounded-xl bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#1E1B18] font-ui text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-[#A45A3D]" />
                                            <span>Detail</span>
                                        </Link>

                                        <button
                                            onClick={() => setActiveModalRoom(room)}
                                            className="w-full py-2 rounded-xl bg-[#A45A3D] hover:bg-[#864327] text-white font-ui text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Booking</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ========================================================
                4. SAAS OWNER CALLOUT BANNER (Hanya di domain utama)
               ======================================================== */}
            {showSaaSPromo && (
                <div className="bg-[#FAF2EA] rounded-3xl p-6 sm:p-10 border border-[#2C2825]/8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left mt-6">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7DE] text-[#A45A3D] w-fit mx-auto lg:mx-0">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                Untuk Pemilik Kost &amp; Investor
                            </span>
                        </div>
                        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1B18]">
                            Punya Properti Kost di Kawasan Cakung atau Sekitarnya?
                        </h3>
                        <p className="font-ui text-xs sm:text-sm text-[#757069] leading-relaxed">
                            Kelola penagihan uang sewa otomatis, pembukuan digital, dan pasarkan seluruh unit kamar Anda langsung di etalase OsKost tanpa potongan komisi sewa.
                        </p>
                    </div>

                    <Link
                        href="/#pemilik-kost"
                        className="px-6 py-3.5 rounded-xl bg-[#A45A3D] hover:bg-[#864327] text-white font-ui text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
                    >
                        <span>Mulai Coba OsKost SaaS (14 Hari)</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {/* ========================================================
                MODAL: DETAIL & BOOKING VIA WHATSAPP KE PENGELOLA
               ======================================================== */}
            {activeModalRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#FFFFFF] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2C2825]/10 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setActiveModalRoom(null)}
                            className="absolute top-5 right-5 p-2 rounded-full bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#757069] transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#A45A3D]/10 text-[#A45A3D] text-[11px] font-bold uppercase">
                                No. {activeModalRoom.number}
                            </span>
                            {getStatusBadge(activeModalRoom.status)}
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="font-editorial text-2xl font-bold text-[#1E1B18]">
                                {activeModalRoom.name}
                            </h3>
                            <p className="font-ui text-xs text-[#757069]">
                                {propInfo.name} • {propInfo.address}
                            </p>
                        </div>

                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#FAF2EA]">
                            <Image
                                src={activeModalRoom.images?.[0] || "/images/rooms/room-1.webp"}
                                alt={activeModalRoom.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#FAF2EA] flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-ui text-[10px] text-[#757069] uppercase font-bold">
                                    Tarif Sewa
                                </span>
                                <span className="font-editorial text-xl font-bold text-[#A45A3D]">
                                    {formatPrice(activeModalRoom.price)}
                                    <span className="text-xs font-normal text-[#757069]"> / bulan</span>
                                </span>
                            </div>
                            <span className="text-xs font-semibold text-[#2C4C3B] bg-[#C7EBD4] px-3 py-1 rounded-full">
                                {activeModalRoom.type || "Standar (1 Orang)"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="font-ui text-xs font-bold text-[#1E1B18]">Fasilitas Kamar:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {activeModalRoom.facilities.map((fac, idx) => (
                                    <span key={idx} className="px-2.5 py-1 rounded-md bg-[#FAF2EA] text-xs font-medium text-[#757069]">
                                        ✓ {fac}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-[#2C2825]/8">
                            <a
                                href={`https://wa.me/${propInfo.managerPhone || "6287890976782"}?text=${encodeURIComponent(
                                    `Halo Pengelola ${propInfo.name}, saya tertarik untuk survei/booking Kamar No. ${activeModalRoom.number} (${activeModalRoom.name}) seharga ${formatPrice(activeModalRoom.price)}/bln. Apakah unit masih dapat disewa?`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl bg-[#2C4C3B] hover:bg-[#1E3629] text-white font-ui text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Hubungi Pengelola via WhatsApp ({propInfo.managerPhone || "0878-9097-6782"})</span>
                            </a>

                            <Link
                                href={`/rooms/${activeModalRoom.id}`}
                                className="w-full py-2.5 rounded-xl bg-[#FAF2EA] hover:bg-[#EFE7DE] text-[#1E1B18] font-ui text-xs font-semibold text-center transition-colors"
                            >
                                Buka Halaman Spesifikasi Penuh &amp; Tur 360°
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
