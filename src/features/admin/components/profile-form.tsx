"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, CheckCircle2, AlertCircle, Mail, User } from "lucide-react";
import { updateProfileAction } from "../actions";
import type { ActionResult } from "../actions";

interface ProfileFormProps {
    currentEmail: string;
}

export function ProfileForm({ currentEmail }: ProfileFormProps) {
    const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
        updateProfileAction,
        null
    );

    return (
        <Card className="bg-card rounded-2xl border border-border shadow-xs">
            <CardHeader className="space-y-1 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <User className="size-4" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground font-editorial">Profil Admin</CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                    Perbarui alamat email resmi untuk login dan notifikasi sistem pengelola.
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

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Alamat Email Admin
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={currentEmail}
                                placeholder="admin@oskost.id"
                                required
                                className="h-11 pl-10 bg-background border-input focus:border-primary focus:ring-primary/30 text-foreground"
                            />
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
                                <Save className="size-4 shrink-0" />
                            )}
                            <span>{isPending ? "Menyimpan..." : "Simpan Email"}</span>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
