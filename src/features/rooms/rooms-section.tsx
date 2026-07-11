import { RoomCard, type RoomCardProps } from "./room-card";
import { getRoomsForLanding, type RoomForLanding } from "./room-service";

// Helper to format price (e.g., 850000 -> 850K, 1200000 -> 1.2M)
const formatPrice = (price: number): string => {
    if (price >= 1000000) {
        return (price / 1000000).toString() + "M";
    }
    return (price / 1000).toString() + "K";
};

// Helper to map DB status to UI status
const mapStatus = (
    status: RoomForLanding["status"],
    isHottest: boolean = false
): RoomCardProps["status"] => {
    if (status === "OCCUPIED" || status === "MAINTENANCE") return "sold_out";
    if (isHottest) return "hottest";
    return "available";
};

// Map DB room to component props
function toRoomCardProps(room: RoomForLanding): RoomCardProps {
    return {
        id: room.id,
        name: room.name,
        description: room.description ?? "",
        price: formatPrice(room.price),
        priceLabel: "STARTING AT",
        image: room.images[0] ?? "/images/rooms/room-1.webp",
        status: mapStatus(room.status, room.name.includes("Standard B")),
        tags: room.facilities.slice(0, 2),
        has360: room.panoramaImages ? room.panoramaImages.length > 0 : false,
    };
}

export async function RoomsSection() {
    const dbRooms = await getRoomsForLanding();
    const rooms = dbRooms.map(toRoomCardProps);

    return (
        <section id="rooms" className="py-20 lg:py-32 bg-foreground">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-12 lg:mb-16">
                    <div className="w-1 h-10 bg-primary rounded-full" />
                    <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground uppercase tracking-wide">
                        Available Drops
                    </h2>
                </div>

                {/* Room Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ">
                    {rooms.map((room) => (
                        <RoomCard key={room.id} {...room} />
                    ))}
                </div>
            </div>
        </section>
    );
}
