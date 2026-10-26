"use server";

import { revalidateTag, revalidatePath, updateTag, refresh } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import logger from "@/lib/logger";

const log = logger.child({ module: "dashboard-actions" });

export async function syncAllCachesAction() {
    try {
        // Purge unstable_cache tags
        revalidateTag(CACHE_TAGS.DASHBOARD_STATS, "default");
        revalidateTag(CACHE_TAGS.ROOMS_LANDING, "default");
        revalidateTag(CACHE_TAGS.ADMIN_ROOMS, "default");
        revalidateTag(CACHE_TAGS.ADMIN_ROOM_STATS, "default");
        revalidateTag(CACHE_TAGS.ADMIN_TENANTS, "default");

        // Update tags
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ROOMS_LANDING);
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.ADMIN_ROOM_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);

        // Refresh client cache
        refresh();

        // Revalidate admin paths
        revalidatePath("/admin");
        revalidatePath("/admin/rooms");
        revalidatePath("/admin/tenants");
        
        // Return a success object that can be used by the client
        return { success: true };
    } catch (error) {
        log.error({ err: error }, "Gagal sinkronisasi cache");
        return { success: false, error: "Gagal mensinkronisasi data" };
    }
}
