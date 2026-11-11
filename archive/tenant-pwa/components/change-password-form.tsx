"use client";

import React, { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "../actions";
import { toast } from "sonner";
import { Loader2, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";

export function ChangePasswordForm() {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      setClientError("");
      const newPwd = formData.get("newPassword") as string;
      if (newPwd !== confirmPassword) {
        setClientError("Password baru dan konfirmasi password tidak cocok.");
        return;
      }
      return await changePasswordAction(prevState, formData);
    },
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Password berhasil diubah!");
      setConfirmPassword("");
      // Clear inputs manually by resetting form
      const form = document.getElementById(
        "change-password-form",
      ) as HTMLFormElement;
      form?.reset();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form
      id="change-password-form"
      action={formAction}
      className="space-y-4 bg-zinc-900/40 p-4 border border-zinc-800 rounded-2xl"
    >
      <div className="flex items-center gap-2 font-bold text-sm text-white">
        <KeyRound className="h-4 w-4 text-secondary" />
        <span>Ganti Password</span>
      </div>

      <div className="space-y-1.5 relative">
        <Label htmlFor="currentPassword" className="text-xs text-zinc-300">
          Password Saat Ini
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type={showCurrentPassword ? "text" : "password"}
          required
          className="bg-zinc-900 border-zinc-700 text-sm focus-visible:ring-secondary text-white pr-10"
        />
        <button
          type="button"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          className="absolute right-3 bottom-2 text-zinc-500 hover:text-zinc-300"
        >
          {showCurrentPassword ? (
            <EyeOff className="h-4 w-4 mb-2" />
          ) : (
            <Eye className="h-4 w-4 mb-2" />
          )}
        </button>
      </div>

      <div className="space-y-1.5 relative">
        <Label htmlFor="newPassword" className="text-xs text-zinc-300">
          Password Baru
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type={showNewPassword ? "text" : "password"}
          required
          className="bg-zinc-900 border-zinc-700 text-sm focus-visible:ring-secondary text-white pr-10"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-3 bottom-2 text-zinc-500 hover:text-zinc-300"
        >
          {showNewPassword ? (
            <EyeOff className="h-4 w-4 mb-2" />
          ) : (
            <Eye className="h-4 w-4 mb-2" />
          )}
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs text-zinc-300">
          Konfirmasi Password Baru
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="bg-zinc-900 border-zinc-700 text-sm focus-visible:ring-secondary text-white"
        />
      </div>

      {(state?.error || clientError) && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{clientError || state?.error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-zinc-800 text-zinc-200 hover:bg-zinc-750 font-bold transition-all text-xs"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengubah...
          </>
        ) : (
          "Simpan Password Baru"
        )}
      </Button>
    </form>
  );
}
