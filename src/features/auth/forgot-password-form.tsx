"use client";

import { useActionState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, KeyRound, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { requestPasswordResetAction } from "./forgot-password-actions";
import type { ActionResult } from "./forgot-password-actions";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | undefined, FormData>(
    requestPasswordResetAction,
    undefined
  );

  return (
    <Card className="border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1 pb-6 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
          <KeyRound className="h-6 w-6 text-violet-400" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Lupa Password?
        </CardTitle>
        <CardDescription className="text-zinc-400 text-xs">
          Masukkan email atau No. HP terdaftar Anda. Kami akan mengirimkan tautan reset password via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 p-3.5 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{state.error}</p>
            </div>
          )}

          {state?.success && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{state.message}</p>
            </div>
          )}

          {!state?.success && (
            <>
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-zinc-300">
                  Email atau No. HP
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="admin@oskost.com / 081234..."
                  required
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-[11px] text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-300">ℹ️ Informasi Penting:</p>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                  <li>Tautan reset berlaku selama <strong>5 menit</strong>.</li>
                  <li>Batas permintaan maksimal <strong>2 kali per hari</strong>.</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-violet-600 text-white hover:bg-violet-700 font-bold transition-all mt-4 rounded-xl h-10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    MENGIRIM EMAIL...
                  </>
                ) : (
                  <>
                    KIRIM TAUTAN RESET
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Kembali ke Halaman Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
