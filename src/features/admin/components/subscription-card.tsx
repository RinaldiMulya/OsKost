"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Check, AlertTriangle, ShieldCheck, Sparkles, Building2, Gift } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionCardProps {
  subscription?: {
    planTier: string;
    status: string;
    maxRooms: number;
    monthlyPrice: number;
    currentPeriodEnd?: Date | null;
    trialEndsAt?: Date | null;
    notes?: string | null;
  } | null;
  roomsCount?: number;
  features?: Record<string, unknown> | null;
}

const PLANS = [
  {
    tier: "FREE",
    name: "Free Forever",
    price: "Rp 0",
    period: "/bulan",
    badge: null,
    maxRooms: 5,
    description: "Cocok untuk pemilik kost rintisan dengan kuota hingga 5 kamar.",
    features: [
      "Kapasitas 1 – 5 Unit Kamar",
      "1 Lokasi Properti Kost",
      "Web Admin Dashboard & Flutter Tenant",
      "Pembayaran Manual: Transfer Bank / Tunai",
      "Bebas Biaya Selamanya (Tanpa Kartu Kredit)",
    ],
  },
  {
    tier: "STARTER",
    name: "Starter Juragan",
    price: "Rp 69.000",
    period: "/bulan",
    badge: null,
    maxRooms: 15,
    description: "Solusi hemat untuk pengelolaan kost mikro 6 hingga 15 kamar.",
    features: [
      "Kapasitas 6 – 15 Unit Kamar",
      "Bebas Tambah Lokasi Kost Tanpa Batas",
      "Semua Fitur Paket Free Forever",
      "Dukungan QRIS Statis Bawaan Owner",
      "Download Laporan Keuangan (Excel/CSV)",
      "Pengingat Jatuh Tempo ke HP Penghuni",
    ],
  },
  {
    tier: "GROWTH",
    name: "Growth Scaler",
    price: "Rp 179.000",
    period: "/bulan",
    badge: "Paling Populer",
    maxRooms: 40,
    description: "Paling populer untuk bisnis kost berkembang dengan kuota 16 hingga 40 kamar.",
    features: [
      "Kapasitas 16 – 40 Unit Kamar",
      "Bebas Tambah Lokasi Kost Tanpa Batas",
      "Semua Fitur Paket Starter",
      "Pembayaran Otomatis Midtrans (QRIS Dinamis & VA)",
      "Virtual Tour Kamar 360° Interaktif",
      "Akun Akses Terpisah: Pemilik & Penjaga Kost",
      "Rekap Pajak Usaha Kost (PPh Final 0.5%)",
    ],
  },
  {
    tier: "PRO",
    name: "Pro Residence",
    price: "Rp 349.000",
    period: "/bulan",
    badge: "Skala Profesional",
    maxRooms: 100,
    description: "Fitur lengkap otomatisasi penuh untuk kost menengah hingga 100 kamar.",
    features: [
      "Kapasitas 41 – 100 Unit Kamar",
      "Semua Fitur Paket Growth",
      "Tampilkan Nama & Logo Sendiri di App Mobile",
      "Dukungan Kunci Pintu Pintar (Smart Lock IoT)",
      "Bantuan Layanan Cepat Prioritas",
      "Format Surat Perjanjian Sewa Digital",
    ],
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise Multi-Branch",
    price: "Rp 1.000.000",
    period: "/bulan",
    badge: null,
    maxRooms: 250,
    description: "Skala korporasi properti besar di atas 100 kamar dengan dedicated account manager.",
    features: [
      "Kapasitas Kamar > 100 Kamar (hingga 250+)",
      "Semua Fitur Paket Pro Residence",
      "Dedicated Super Admin & Account Manager",
      "Custom Domain / Subdomain Properti",
      "SLA Respon Bantuan 1 Jam",
    ],
  },
];

export function SubscriptionCard({
  subscription,
  roomsCount = 11,
  features,
}: SubscriptionCardProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const planTier = subscription?.planTier ?? "STARTER";
  const status = subscription?.status ?? "ACTIVE";
  const maxRooms = subscription?.maxRooms ?? 15;
  const isOverQuota = roomsCount > maxRooms;
  const isAtQuota = roomsCount === maxRooms;

  const usagePercent = Math.min(100, Math.round((roomsCount / maxRooms) * 100));

  const handleUpgrade = (targetTier: string) => {
    setIsUpgrading(true);
    toast.info(`Memproses permintaan paket ${targetTier}...`, {
      description: "Menghubungkan ke layanan langganan SaaS OsKost.",
    });
    setTimeout(() => {
      setIsUpgrading(false);
      toast.success(
        `Permintaan upgrade ke paket ${targetTier} telah dicatat. Tim OsKost akan segera memproses. Anda juga dapat menghubungi Super Admin via WhatsApp untuk aktivasi instan.`
      );
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Current Active Plan Status */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                PAKET SAAS AKTIF: {planTier}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  status === "ACTIVE"
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : status === "TRIAL"
                    ? "bg-amber-ochre/10 text-amber-ochre border border-amber-ochre/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {status === "ACTIVE"
                  ? "🟢 Berlangganan Aktif"
                  : status === "TRIAL"
                  ? "🟡 Masa Percobaan (Trial)"
                  : "🔴 Ditangguhkan"}
              </span>
              {(features?.whiteLabelEnabled || subscription?.notes?.includes("White-Labeling")) && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1 shadow-2xs">
                  ✨ White-Labeling Mobile Aktif (Khusus Pilot)
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-editorial text-foreground mt-2">
              Status Kuota &amp; Langganan Properti
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Pantau penggunaan kuota kamar dan fasilitas aktif pada properti kost Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {planTier !== "ENTERPRISE" && (
              <Button
                onClick={() =>
                  handleUpgrade(
                    planTier === "FREE"
                      ? "STARTER"
                      : planTier === "STARTER"
                      ? "GROWTH"
                      : "PRO"
                  )
                }
                disabled={isUpgrading}
                className="bg-primary hover:bg-terracotta-hover text-primary-foreground rounded-xl font-bold gap-2 shadow-xs"
              >
                <Zap className="size-4 shrink-0" />
                <span>
                  Upgrade ke {planTier === "FREE" ? "Starter" : planTier === "STARTER" ? "Growth" : "Pro"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Penggunaan Kuota Kamar</span>
            <span
              className={`font-bold ${
                isOverQuota ? "text-destructive font-extrabold" : "text-primary"
              }`}
            >
              {roomsCount} dari {maxRooms} Kamar Digunakan ({usagePercent}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOverQuota
                  ? "bg-destructive"
                  : isAtQuota
                  ? "bg-amber-ochre"
                  : "bg-primary"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          {isOverQuota && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <b>Peringatan Batas Kuota:</b> Jumlah kamar Anda ({roomsCount}) telah melampaui kuota paket ({maxRooms}). 
                Sistem tidak mengizinkan penambahan kamar baru hingga Anda melakukan upgrade paket langganan.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Matrix Plans */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold font-editorial text-foreground">
            Pilihan Paket Langganan SaaS OsKost
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pilih paket yang sesuai dengan kapasitas dan skala pertumbuhan bisnis kost Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = planTier === plan.tier;
            const isGrowth = plan.tier === "GROWTH";

            return (
              <div
                key={plan.tier}
                className={`rounded-2xl p-6 relative flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "bg-card border-2 border-primary shadow-md ring-4 ring-primary/10"
                    : isGrowth
                    ? "bg-card border-2 border-secondary/50 shadow-sm"
                    : "bg-card border border-border shadow-xs hover:border-border/80"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-foreground truncate">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                        Paket Aktif
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-1 min-h-[32px] line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground font-medium">{plan.period}</span>
                  </div>

                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-semibold text-primary">
                    <Building2 className="size-3.5 shrink-0" />
                    <span>Kapasitas {plan.maxRooms === 5 ? "1 – 5" : plan.maxRooms === 15 ? "6 – 15" : plan.maxRooms === 40 ? "16 – 40" : plan.maxRooms === 100 ? "41 – 100" : "> 100"} Kamar</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                        <Check className="size-4 text-secondary shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  {isCurrent ? (
                    <Button disabled variant="outline" className="w-full rounded-xl font-bold text-xs bg-muted/50 border-border text-foreground">
                      Paket Aktif Anda
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.tier)}
                      className={`w-full rounded-xl font-bold text-xs gap-1.5 ${
                        isGrowth
                          ? "bg-primary hover:bg-terracotta-hover text-primary-foreground shadow-xs"
                          : "bg-foreground hover:bg-foreground/90 text-background"
                      }`}
                    >
                      <Sparkles className="size-3.5 shrink-0" />
                      <span>Pilih {plan.name}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
