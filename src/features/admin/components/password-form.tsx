"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { changePasswordAction } from "../actions";
import type { ActionResult } from "../actions";

export function PasswordForm() {
    const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
        changePasswordAction,
        null
    );

    return (
        <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
                <CardTitle className="text-base text-white">Ubah Password</CardTitle>
                <CardDescription>
                    Pastikan password baru mudah diingat.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    {state?.error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            {state.message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Password Saat Ini</Label>
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Password Baru</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="Minimal 6 karakter"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                            Konfirmasi Password Baru
                        </Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Ulangi password baru"
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Lock className="h-4 w-4" />
                            )}
                            {isPending ? "Mengubah..." : "Ubah Password"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
