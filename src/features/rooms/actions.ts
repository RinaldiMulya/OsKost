"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { redirect } from "next/navigation";
import {
    roomFormSchema,
    createRoom,
    updateRoom,
    deleteRoom,
} from "./room-service";

// ============================================
// Types
// ============================================

export interface ActionResult {
    success: boolean;
    error?: string;
}

// ============================================
// Helper: Parse form values to service input
// ============================================

function parseFormToServiceInput(parsed: ReturnType<typeof roomFormSchema.parse>) {
    return {
        number: parsed.number,
        name: parsed.name,
        price: parsed.price,
        status: parsed.status as "AVAILABLE" | "OCCUPIED" | "MAINTENANCE",
        description: parsed.description || undefined,
        facilities: parsed.facilities
            ? parsed.facilities.split(",").map((f) => f.trim()).filter(Boolean)
            : [],
        images: parsed.images
            ? parsed.images.split(",").map((u) => u.trim()).filter(Boolean)
            : [],
    };
}

// ============================================
// CREATE
// ============================================

export async function createRoomAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const raw = Object.fromEntries(formData);
        const parsed = roomFormSchema.safeParse(raw);

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0].message,
            };
        }

        const panoramaMetadataRaw = formData.get("panoramaMetadata") as string;
        const panoramaImages = panoramaMetadataRaw ? JSON.parse(panoramaMetadataRaw) : [];

        await createRoom({
            ...parseFormToServiceInput(parsed.data),
            panoramaImages,
        });

        revalidatePath("/admin/rooms");
        revalidatePath("/"); // Landing page cache
        updateTag(CACHE_TAGS.ROOMS_LANDING);
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.ADMIN_ROOM_STATS);
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat membuat kamar." };
    }

    redirect("/admin/rooms");
}

// ============================================
// UPDATE
// ============================================

export async function updateRoomAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const raw = Object.fromEntries(formData);
        const roomId = raw.id as string;

        if (!roomId) {
            return { success: false, error: "Room ID is required." };
        }

        const parsed = roomFormSchema.safeParse(raw);

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0].message,
            };
        }

        await updateRoom(roomId, parseFormToServiceInput(parsed.data));

        revalidatePath("/admin/rooms");
        revalidatePath(`/rooms/${roomId}`);
        revalidatePath("/"); // Landing page cache
        updateTag(CACHE_TAGS.ROOMS_LANDING);
        updateTag(CACHE_TAGS.roomDetail(roomId));
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.ADMIN_ROOM_STATS);
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat mengupdate kamar." };
    }

    redirect("/admin/rooms");
}

// ============================================
// DELETE
// ============================================

export async function deleteRoomAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const roomId = formData.get("id") as string;

        if (!roomId) {
            return { success: false, error: "Room ID is required." };
        }

        await deleteRoom(roomId);

        revalidatePath("/admin/rooms");
        revalidatePath("/"); // Landing page cache
        updateTag(CACHE_TAGS.ROOMS_LANDING);
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.ADMIN_ROOM_STATS);
        updateTag(CACHE_TAGS.DASHBOARD_STATS);

        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat menghapus kamar." };
    }
}

// ============================================
// PANORAMA 360° ACTIONS
// ============================================

export async function addPanoramaAction(data: {
    roomId: string;
    userId: string;
    title: string;
    description?: string;
    imageUrl: string;
    storagePath: string;
}) {
    try {
        const { addPanoramaToRoom } = await import("./room-service");
        await addPanoramaToRoom(data);

        // Revalidate admin and public pages cache
        revalidatePath(`/admin/rooms/${data.roomId}/edit`);
        revalidatePath(`/rooms/${data.roomId}`);
        revalidatePath("/");
        updateTag(CACHE_TAGS.ROOMS_LANDING);
        updateTag(CACHE_TAGS.roomDetail(data.roomId));
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.DASHBOARD_STATS);

        return { success: true };
    } catch (error) {
        console.error("Error adding panorama:", error);
        throw error;
    }
}

export async function deletePanoramaAction(panoramaId: string, roomId: string) {
    try {
        const { deletePanoramaFromRoom } = await import("./room-service");
        await deletePanoramaFromRoom(panoramaId);

        // Revalidate admin and public pages cache
        revalidatePath(`/admin/rooms/${roomId}/edit`);
        revalidatePath(`/rooms/${roomId}`);
        revalidatePath("/");
        updateTag(CACHE_TAGS.ROOMS_LANDING);
        updateTag(CACHE_TAGS.roomDetail(roomId));
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.DASHBOARD_STATS);

        return { success: true };
    } catch (error) {
        console.error("Error deleting panorama:", error);
        throw error;
    }
}

