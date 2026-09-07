"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import logger from "@/lib/logger";

const log = logger.child({ module: "dashboard-actions" });

export async function syncAllCachesAction() {
    try {
        // We revalidate all important tags to ensure the UI is fully synced
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ROOMS_LANDING);
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.ADMIN_ROOM_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);
        
        // Return a success object that can be used by the client
        return { success: true };
    } catch (error) {
        log.error({ err: error }, "Gagal sinkronisasi cache");
        return { success: false, error: "Gagal mensinkronisasi data" };
    }
}
