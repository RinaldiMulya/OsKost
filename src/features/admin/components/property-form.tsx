"use client";

import { useActionState, useEffect, useState } from "react";
import { updatePropertyProfileAction } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Home, Wrench, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

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
    <Card className="bg-card rounded-2xl border border-border shadow-xs">
      <CardHeader className="space-y-1 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Home className="size-5" />
          </div>
          <CardTitle className="text-lg font-bold font-editorial text-foreground">
            Profil &amp; Fitur Operasional Properti
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Kelola identitas publik properti kost dan aktifkan opsi penugasan staf teknisi lapangan.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={property.id} />
          <input type="hidden" name="hasTechnician" value={hasTechnician ? "true" : "false"} />

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-foreground uppercase tracking-wider">
              Nama Properti / Usaha Kost
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={property.name}
              placeholder="Contoh: OSkost Pulo Jahe"
              required
              className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-bold text-foreground uppercase tracking-wider">
              Alamat Lengkap Properti
            </Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={property.address}
              placeholder="Masukkan alamat lengkap kost beserta patokan..."
              required
              rows={4}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30 rounded-xl resize-none text-sm"
            />
          </div>

          {/* Toggle Switch Fitur Tukang / Teknisi */}
          <div className="p-4 rounded-xl border border-border bg-muted/40 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Wrench className="size-4 text-secondary" />
                <span className="text-xs font-bold text-foreground">
                  Layanan Teknisi / Staf Perbaikan Kamar
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-md">
                Aktifkan jika properti memiliki tukang/teknisi internal untuk disposisi tiket laporan kerusakan dari aplikasi mobile penyewa.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hasTechnician}
              onClick={() => setHasTechnician(!hasTechnician)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                hasTechnician ? "bg-secondary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  hasTechnician ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {state && !state.success && state.error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <p>{state.error}</p>
            </div>
          )}

          {state?.success && state.message && (
            <div className="flex items-center gap-2 rounded-xl bg-secondary/10 p-3 text-xs text-secondary border border-secondary/20">
              <CheckCircle2 className="size-4 shrink-0" />
              <p>{state.message}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-terracotta-hover text-primary-foreground font-bold rounded-xl h-11 px-8 text-xs tracking-wider gap-2 shadow-xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <>
                  <Save className="size-4 shrink-0" />
                  <span>SIMPAN PROFIL PROPERTI</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
