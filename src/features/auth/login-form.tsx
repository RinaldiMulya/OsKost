"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, LockKeyhole, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
    // useActionState per React 19 / Next.js 15
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined
    );
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Card className="border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-6 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                    <LockKeyhole className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    Masuk ke Sistem
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Gunakan kredensial Anda untuk mengakses panel manajemen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="identifier" className="text-zinc-300 mb-3">Email atau No. HP</Label>
                        <Input
                            id="identifier"
                            name="identifier"
                            type="text"
                            placeholder="admin@oskost.com / 081234..."
                            required
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-secondary"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-300 mb-3">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-secondary"
                        />
                        <Button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-10 bottom-20.5 -translate-y-1/2"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>

                    {errorMessage && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-secondary text-black hover:bg-secondary/90 font-bold transition-all mt-4"
                    >
                        {isPending ? "MEMPROSES..." : "MASUK"}
                        {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
