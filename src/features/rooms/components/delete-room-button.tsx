"use client";

import { useActionState } from "react";
import { deleteRoomAction } from "@/features/rooms/actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteRoomButtonProps {
    roomId: string;
    roomNumber: string;
}

export function DeleteRoomButton({ roomId, roomNumber }: DeleteRoomButtonProps) {
    const [state, formAction, isPending] = useActionState(deleteRoomAction, null);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-zinc-800 bg-zinc-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                        Hapus Kamar {roomNumber}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        Tindakan ini tidak bisa dibatalkan. Data kamar akan dihapus secara
                        permanen dari database.
                    </AlertDialogDescription>
                    {state?.error && (
                        <p className="mt-2 text-sm text-red-400">{state.error}</p>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
                        Batal
                    </AlertDialogCancel>
                    <form action={formAction}>
                        <input type="hidden" name="id" value={roomId} />
                        <AlertDialogAction
                            type="submit"
                            disabled={isPending}
                            className="bg-red-600 text-white hover:bg-red-700 gap-2"
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Hapus
                        </AlertDialogAction>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
