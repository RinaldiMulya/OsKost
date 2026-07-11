"use client";

import { useActionState } from "react";
import { deleteTenantAction } from "@/features/tenants/actions";
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

interface DeleteTenantButtonProps {
    userId: string;
    tenantName: string;
}

export function DeleteTenantButton({
    userId,
    tenantName,
}: DeleteTenantButtonProps) {
    const [state, formAction, isPending] = useActionState(
        deleteTenantAction,
        null
    );

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
                        Hapus Penghuni &quot;{tenantName}&quot;?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        Tindakan ini akan menghapus akun penghuni dan seluruh
                        data profilnya secara permanen.
                    </AlertDialogDescription>
                    {state?.error && (
                        <p className="mt-2 text-sm text-red-400">
                            {state.error}
                        </p>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
                        Batal
                    </AlertDialogCancel>
                    <form action={formAction}>
                        <input type="hidden" name="id" value={userId} />
                        <AlertDialogAction
                            type="submit"
                            disabled={isPending}
                            className="bg-red-600 text-white hover:bg-red-700 gap-2"
                        >
                            {isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Hapus
                        </AlertDialogAction>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
