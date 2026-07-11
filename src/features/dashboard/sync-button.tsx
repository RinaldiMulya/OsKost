"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncAllCachesAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncAllCachesAction();
            if (result.success) {
                toast.success("Sinkronisasi berhasil", {
                    description: "Data terbaru dari database telah dimuat.",
                });
                router.refresh(); // Force Next.js to re-fetch the page data
            } else {
                toast.error("Gagal", {
                    description: result.error,
                });
            }
        } catch (error) {
            toast.error("Terjadi Kesalahan", {
                description: "Tidak dapat menghubungi server.",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={isSyncing}
            className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white"
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Data"}
        </Button>
    );
}
