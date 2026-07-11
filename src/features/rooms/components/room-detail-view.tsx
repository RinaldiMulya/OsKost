import Image from "next/image";
import Link from "next/link";
import {
    X,
    Zap,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoomImageGallery } from "./room-image-gallery";
import type { RoomDetail } from "../room-service";

// --- Icon mapping by keyword ---
const facilityIconMap: [string[], React.ComponentType<{ className?: string }>][] = [
    // Connectivity
    [["wifi", "internet", "wi-fi"], Wifi],
    // Climate
    [["ac", "air conditioner", "pendingin", "air conditioning"], AirVent],
    [["kipas", "fan"], Fan],
    // Electricity
    [["listrik", "token", "va", "electricity"], Zap],
    [["stop kontak", "colokan", "plug"], Plug],
    // Bathroom
    [["water heater", "pemanas air"], Droplets],
    [["kamar mandi", "shower", "mandi dalam", "wc", "toilet"], ShowerHead],
    [["bathtub", "bak mandi"], Bath],
    // Bed & Furniture
    [["kasur", "bed", "springbed", "spring bed", "tempat tidur"], BedDouble],
    [["furnished", "full furnished", "fully furnished"], Armchair],
    [["lemari", "wardrobe", "closet", "cupboard"], DoorOpen],
    [["meja", "desk", "work desk", "meja belajar", "meja kerja"], BookOpen],
    [["kursi", "chair", "sofa"], Sofa],
    [["lampu", "lamp", "lighting", "penerangan"], Lamp],
    // Entertainment
    [["tv", "smart tv", "television", "televisi"], Tv],
    // Kitchen & Dining
    [["kitchen", "dapur", "masak", "kompor", "stove"], CookingPot],
    [["kulkas", "refrigerator", "fridge"], Refrigerator],
    [["kopi", "coffee", "dispenser", "galon"], Coffee],
    [["makan", "dining", "eating"], Utensils],
    // Parking & Vehicle
    [["garage", "parkir", "car", "motor", "kendaraan"], ParkingCircle],
    // Outdoor & Lighting
    [["balcony", "balkon", "teras", "terrace"], Sun],
    [["jendela", "natural light", "ventilasi", "window"], Sun],
    // Laundry
    [["laundry", "mesin cuci", "cuci", "washing"], WashingMachine],
    [["jemuran", "drying", "jemur"], Shirt],
    // Security
    [["cctv", "kamera", "camera", "security cam"], Cctv],
    [["keamanan", "security", "satpam", "guard"], ShieldCheck],
    [["kunci", "key", "lock", "gembok"], Lock],
    // Cleaning
    [["sampah", "trash", "cleaning", "kebersihan"], Trash2],
    // Area / Size
    [["area", "luas", "size", "3x4", "4x4", "3x3", "5x5"], Key],
];

function getFacilityIcon(label: string): React.ComponentType<{ className?: string }> {
    const lower = label.toLowerCase();
    for (const [keywords, Icon] of facilityIconMap) {
        if (keywords.some((kw) => lower.includes(kw))) {
            return Icon;
        }
    }
    return Check; // fallback — generic checkmark
}

function formatPrice(price: number): string {
    if (price >= 1000000) {
        const jt = price / 1000000;
        return jt % 1 === 0 ? `Rp ${jt} Jt` : `Rp ${jt.toFixed(1)} Jt`;
    }
    if (price >= 1000) {
        const rb = price / 1000;
        return rb % 1 === 0 ? `Rp ${rb} Rb` : `Rp ${rb.toFixed(0)} Rb`;
    }
    return `Rp ${price}`;
}


interface RoomDetailViewProps {
    room: RoomDetail;
}

export function RoomDetailView({ room }: RoomDetailViewProps) {
    const statusConfig = {
        AVAILABLE: { label: "TERSEDIA", color: "bg-secondary/20 text-secondary border-secondary/40" },
        OCCUPIED: { label: "TERISI", color: "bg-red-500/20 text-red-400 border-red-500/40" },
        MAINTENANCE: { label: "MAINTENANCE", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" },
    };

    const status = statusConfig[room.status];
    const priceDisplay = formatPrice(room.price) + " / bln";

    return (
        <div className="min-h-screen bg-[#0a0f0a] relative">
            {/* Ambient glow background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />
            </div>

            {/* ===== 1. HEADER BAR ===== */}
            <header className="sticky top-4 z-50 mx-auto max-w-3xl px-4">
                <div className="flex items-center justify-between px-5 py-3 bg-zinc-400/40 backdrop-blur-xl rounded-full border border-zinc-800/60">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image
                            src="/images/logo.webp"
                            alt="Smartkost Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                        />
                        <span className="font-bold text-white text-sm tracking-tight">
                            Smartkost
                        </span>
                    </Link>
                    <Link
                        href="/"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                        <X className="w-4 h-4 text-zinc-400" />
                    </Link>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-4 pb-8 pt-4 lg:pt-6">

                {/* Client Component for Interactive Gallery */}
                <RoomImageGallery
                    images={room.images}
                    panoramaImages={room.panoramaImages}
                    roomName={room.name}
                    roomNumber={room.number}
                    priceDisplay={priceDisplay}
                />

                {/* ===== 4. ROOM INFO ===== */}
                <section className="mb-8">
                    {/* Status */}
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className={cn(
                                "inline-flex px-2.5 py-1 rounded-md text-[15px] font-bold uppercase tracking-widest border",
                                status.color
                            )}
                        >
                            {status.label}
                        </span>
                    </div>

                    {/* Title row */}
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-none">
                            <span className="text-white">KAMAR {room.number} </span>
                            <span className="text-secondary">({room.name})</span>
                        </h1>

                        {/* Price box with glow */}
                        <div className="px-4 py-2.5 rounded-xl border border-secondary/40 shadow-[0_0_15px_rgba(0,204,64,0.2)] bg-secondary/5">
                            <p className="text-secondary font-bold text-sm lg:text-base tracking-wide whitespace-nowrap">
                                {priceDisplay}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ===== 5. FACILITIES GRID ===== */}
                <section className="mb-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {room.facilities.map((facility, index) => {
                            const IconComponent = getFacilityIcon(facility);
                            return (
                                <div
                                    key={index}
                                    className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/60 hover:border-secondary/30 hover:bg-zinc-800/50 transition-all duration-300"
                                >
                                    <IconComponent className="w-6 h-6 text-secondary" />
                                    <span className="text-white/80 text-xs font-medium">
                                        {facility}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ===== 6. CTA BUTTON ===== */}
                <section className="sticky bottom-4 z-40">
                    {room.status === "AVAILABLE" ? (
                        <a
                            href={`https://wa.me/6281212923623?text=Halo, saya tertarik dengan Kamar ${room.number} (${room.name}) - ${priceDisplay}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-300 hover:to-cyan-300 transition-all duration-300 shadow-[0_0_30px_rgba(0,204,64,0.3)] hover:shadow-[0_0_50px_rgba(0,204,64,0.5)] group"
                        >
                            <span className="text-black font-bold text-sm uppercase tracking-wider">
                                Amankan Kamar Ini
                            </span>
                            <Rocket className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                    ) : (
                        <div className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-zinc-800/60 border border-zinc-700/50 cursor-not-allowed">
                            <span className="text-zinc-500 font-bold text-sm uppercase tracking-wider">
                                {room.status === "MAINTENANCE" ? "Sedang Maintenance" : "Kamar Tidak Tersedia"}
                            </span>
                        </div>
                    )}

                    {/* Footer text */}
                    <div className="flex items-center justify-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-zinc-300 text-[10px] uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Listing</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300 text-[10px] uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            <span>Update 2h Ago</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
