import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/features/rooms/components/room-form";
import { updateRoomAction } from "@/features/rooms/actions";
import { getRoomById } from "@/features/rooms/room-service";
import type { RoomForAdmin } from "@/features/rooms/room-service";
import { auth } from "@/auth";
import type { Metadata } from "next";

interface EditRoomPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditRoomPageProps): Promise<Metadata> {
    const { id } = await params;
    const room = await getRoomById(id);
    return {
        title: room
            ? `Edit Kamar ${room.number} | Admin Smartkost`
            : "Kamar Tidak Ditemukan | Admin Smartkost",
    };
}

export default async function EditRoomPage({ params }: EditRoomPageProps) {
    const { id } = await params;
    const room = await getRoomById(id);
    const session = await auth();
    const userId = session?.user?.id ?? "unknown";

    if (!room) {
        notFound();
    }

    // Cast RoomDetail to RoomForAdmin (add propertyId placeholder — not editable)
    const roomForForm: RoomForAdmin = {
        ...room,
        propertyId: "",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                >
                    <Link href="/admin/rooms">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Edit Kamar {room.number}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Perbarui informasi kamar di bawah ini.
                    </p>
                </div>
            </div>

            <RoomForm
                room={roomForForm}
                action={updateRoomAction}
                submitLabel="Simpan Perubahan"
                userId={userId}
            />
        </div>
    );
}
