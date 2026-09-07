"use client";

import { useActionState, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { resetPasswordAction } from "./forgot-password-actions";
import type { ActionResult } from "./forgot-password-actions";
import Link from "next/link";

interface ResetPasswordFormProps {
  token: string;
  isValidToken: boolean;
  tokenErrorReason?: string;
}

export function ResetPasswordForm({
  token,
  isValidToken,
  tokenErrorReason,
}: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState<ActionResult | undefined, FormData>(
    resetPasswordAction,
    undefined
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isValidToken) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Tautan Tidak Valid
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            {tokenErrorReason || "Tautan reset password ini tidak dapat digunakan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-xs text-zinc-400">
            Tautan reset password hanya berlaku selama 5 menit dan hanya dapat digunakan 1 kali.
          </p>
          <Button
            asChild
            className="w-full bg-violet-600 text-white hover:bg-violet-700 font-bold transition-all rounded-xl h-10"
          >
            <Link href="/forgot-password">
              MINTA TAUTAN BARU
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1 pb-6 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
          <Lock className="h-6 w-6 text-violet-400" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Set Password Baru
        </CardTitle>
        <CardDescription className="text-zinc-400 text-xs">
          Buat password baru yang aman untuk akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          {state?.error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 p-3.5 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{state.error}</p>
            </div>
          )}

          {state?.success ? (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-xs text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <p className="font-semibold leading-relaxed">{state.message}</p>
              </div>
              <Button
                asChild
                className="w-full bg-secondary text-black hover:bg-secondary/90 font-bold transition-all rounded-xl h-10"
              >
                <Link href="/login">
                  MASUK DENGAN PASSWORD BARU
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-zinc-300">
                  Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-violet-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-300 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300">
                  Konfirmasi Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password baru"
                    required
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-violet-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-300 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-violet-600 text-white hover:bg-violet-700 font-bold transition-all mt-4 rounded-xl h-10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    MEMPROSES...
                  </>
                ) : (
                  <>
                    SIMPAN PASSWORD BARU
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
