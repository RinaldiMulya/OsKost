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
            className="border-2 border-[#2C2825]/18 rounded-xl bg-white text-[#1E1B18] hover:bg-[#F2EDE9] hover:border-[#2C2825]/30 hover:text-[#1E1B18] font-semibold text-sm shadow-2xs h-9 px-3.5 transition-all"
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Data"}
        </Button>
    );
}
