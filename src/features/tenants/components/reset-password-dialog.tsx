"use client";

import { useState } from "react";
import { useActionState } from "react";
import { resetTenantPasswordAction } from "@/features/tenants/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import type { ActionResult } from "../actions";

interface ResetPasswordDialogProps {
  userId: string;
  tenantName: string;
}

export function ResetPasswordDialog({
  userId,
  tenantName,
}: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(resetTenantPasswordAction, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-white">Reset Password</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Reset password untuk <strong>{tenantName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {state?.success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
            <p className="text-sm text-green-400">Password berhasil direset!</p>
            <Button
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800"
              onClick={() => {
                setOpen(false);
              }}
            >
              Tutup
            </Button>
          </div>
        ) : (
          <form action={formAction}>
            <input type="hidden" name="userId" value={userId} />

            {state?.error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {state.error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white pb-2">
                  Password Baru
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-800"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className="gap-2 bg-yellow-600 text-white hover:bg-yellow-700"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
