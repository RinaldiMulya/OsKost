import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/features/rooms/components/room-form";
import { createRoomAction } from "@/features/rooms/actions";
import { auth } from "@/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tambah Kamar | Admin Smartkost",
};

export default async function CreateRoomPage() {
    const session = await auth();
    const userId = session?.user?.id ?? "unknown";

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
                        Tambah Kamar Baru
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Isi form di bawah untuk menambahkan kamar baru.
                    </p>
                </div>
            </div>

            <RoomForm action={createRoomAction} submitLabel="Tambah Kamar" userId={userId} />
        </div>
    );
}
