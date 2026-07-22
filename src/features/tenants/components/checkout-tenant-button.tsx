"use client";

import { useActionState } from "react";
import { checkoutTenantAction } from "@/features/tenants/actions";
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
import { LogOut, Loader2 } from "lucide-react";

interface CheckoutTenantButtonProps {
  userId: string;
  tenantName: string;
  variant?: "icon" | "full";
}

export function CheckoutTenantButton({
  userId,
  tenantName,
  variant = "full",
}: CheckoutTenantButtonProps) {
  const [state, formAction, isPending] = useActionState(
    checkoutTenantAction,
    null,
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
            title="Check-out Penghuni"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-transparent text-xs w-full gap-1.5"
          >
            <LogOut className="size-3.5" />
            Check-out
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[800px] border-zinc-800 bg-zinc-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Check-out Penghuni &quot;{tenantName}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground tracking-[1px] [word-spacing:0.3rem] text-md">
            Tindakan ini akan menghentikan masa sewa aktif untuk penghuni ini
            dan mengubah status kamar kembali menjadi tersedia (AVAILABLE).
            Riwayat tagihan dan data profil akan tetap tersimpan di database.
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
            <input type="hidden" name="id" value={userId} />
            <AlertDialogAction
              type="submit"
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700 gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Proses Check-out
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
