"use client";

import { useActionState, useEffect } from "react";
import { updatePropertyProfileAction, ActionResult } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Home, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface PropertyFormProps {
  property: {
    id: string;
    name: string;
    address: string;
    features?: Record<string, unknown> | null;
  };
}

export function PropertyForm({ property }: PropertyFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePropertyProfileAction,
    null
  );

  const initialHasTechnician =
    property.features?.hasTechnician !== false;
  const [hasTechnician, setHasTechnician] = useState<boolean>(initialHasTechnician);

  useEffect(() => {
    if (state?.success && state?.message) {
      toast.success(state.message);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card className="border-zinc-850 bg-zinc-950/40 backdrop-blur-md shadow-xl rounded-2xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2 text-primary">
          <Home className="h-5 w-5 text-secondary" />
          <CardTitle className="text-lg font-bold text-white">Profil & Fitur Properti</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Ubah nama, alamat, serta aktifkan/nonaktifkan fitur operasional kost Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={property.id} />
          <input type="hidden" name="hasTechnician" value={hasTechnician ? "true" : "false"} />

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">
              Nama Properti / Kost
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={property.name}
              placeholder="Contoh: OSkost Pulo Jahe"
              required
              className="bg-zinc-900/40 border-zinc-800 text-white placeholder:text-zinc-650 focus-visible:ring-secondary rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-semibold text-zinc-300">
              Alamat Lengkap
            </Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={property.address}
              placeholder="Masukkan alamat lengkap kost..."
              required
              rows={4}
              className="bg-zinc-900/40 border-zinc-800 text-white placeholder:text-zinc-650 focus-visible:ring-secondary rounded-xl resize-none"
            />
          </div>

          {/* Toggle Switch Fitur Tukang / Teknisi */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-secondary" />
                <span className="text-xs font-semibold text-zinc-200">
                  Layanan Teknisi / Tukang Lapangan
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Aktifkan jika kost memiliki staf teknisi internal untuk penanganan keluhan dan pelacakan kamar.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hasTechnician}
              onClick={() => setHasTechnician(!hasTechnician)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                hasTechnician ? "bg-secondary" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  hasTechnician ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {state && !state.success && state.error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{state.error}</p>
            </div>
          )}

          {state?.success && state.message && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>{state.message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-xl transition-all h-10 text-xs"
          >
            {isPending ? "MEMPROSES..." : "SIMPAN PERUBAHAN"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
