"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { changePasswordAction } from "../actions";
import type { ActionResult } from "../actions";

export function PasswordForm() {
    const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
        changePasswordAction,
        null
    );

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <Card className="bg-card rounded-2xl border border-border shadow-xs">
            <CardHeader className="space-y-1 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Lock className="size-4" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground font-editorial">Keamanan &amp; Kata Sandi</CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                    Ganti kata sandi akun admin secara berkala untuk menjaga keamanan data kos.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form action={formAction} className="space-y-4">
                    {state?.error && (
                        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{state.error}</span>
                        </div>
                    )}
                    {state?.success && (
                        <div className="flex items-center gap-2 rounded-xl bg-secondary/10 border border-secondary/20 p-3 text-xs text-secondary">
                            <CheckCircle2 className="size-4 shrink-0" />
                            <span>{state.message}</span>
                        </div>
                    )}

                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Kata Sandi Saat Ini
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type={showCurrent ? "text" : "password"}
                                placeholder="Masukkan sandi saat ini"
                                required
                                className="h-11 pl-10 pr-10 bg-background border-input focus:border-primary focus:ring-primary/30 text-foreground"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Kata Sandi Baru
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type={showNew ? "text" : "password"}
                                placeholder="Minimal 6 karakter"
                                required
                                minLength={6}
                                className="h-11 pl-10 pr-10 bg-background border-input focus:border-primary focus:ring-primary/30 text-foreground"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Konfirmasi Kata Sandi Baru
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Ulangi kata sandi baru"
                                required
                                className="h-11 pl-10 pr-10 bg-background border-input focus:border-primary focus:ring-primary/30 text-foreground"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-primary hover:bg-terracotta-hover text-primary-foreground font-bold rounded-xl h-10 px-5 gap-2 shadow-xs cursor-pointer"
                        >
                            {isPending ? (
                                <Loader2 className="size-4 animate-spin shrink-0" />
                            ) : (
                                <Lock className="size-4 shrink-0" />
                            )}
                            <span>{isPending ? "Mengubah..." : "Ubah Kata Sandi"}</span>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
