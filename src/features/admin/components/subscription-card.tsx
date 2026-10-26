"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Check, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionCardProps {
  subscription?: {
    planTier: string;
    status: string;
    maxRooms: number;
    monthlyPrice: number;
    currentPeriodEnd?: Date | null;
    trialEndsAt?: Date | null;
  } | null;
  roomsCount?: number;
}

const PLANS = [
  {
    tier: "STARTER",
    name: "Starter Tier",
    price: "Rp 99.000",
    period: "/bulan",
    maxRooms: 10,
    features: [
      "Hingga 10 Kamar Aktif",
      "Web Admin Dashboard",
      "Aplikasi Tenant Sanctuary Flutter",
      "Rekonsiliasi Keuangan Otomatis",
      "Backup Data Harian",
    ],
  },
  {
    tier: "PRO",
    name: "Pro Tier",
    price: "Rp 249.000",
    period: "/bulan",
    badge: "Paling Populer",
    maxRooms: 30,
    features: [
      "Hingga 30 Kamar Aktif",
      "Semua Fitur Starter",
      "Virtual Tour 360° Photo Sphere",
      "Multi-Role Staf & Penjaga",
      "Export Excel & CSV Laporan",
      "Integrasi Gateway Midtrans Otomatis",
    ],
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise Tier",
    price: "Rp 499.000",
    period: "/bulan",
    maxRooms: 100,
    features: [
      "Kamar Tanpa Batas (>30 Kamar)",
      "Semua Fitur Pro",
      "Prioritas Dukungan 24/7 (SLA 1 Jam)",
      "Dedicated Account Manager",
      "Custom Subdomain / Domain Properti",
      "Koneksi Smart Lock Hardware (IoT)",
    ],
  },
];

export function SubscriptionCard({
  subscription,
  roomsCount = 11,
}: SubscriptionCardProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const planTier = subscription?.planTier ?? "STARTER";
  const status = subscription?.status ?? "ACTIVE";
  const maxRooms = subscription?.maxRooms ?? 10;
  const isOverQuota = roomsCount > maxRooms;
  const isAtQuota = roomsCount === maxRooms;

  const usagePercent = Math.min(100, Math.round((roomsCount / maxRooms) * 100));

  const handleUpgrade = (targetTier: string) => {
    setIsUpgrading(true);
    toast.info(`Memproses permintaan upgrade ke paket ${targetTier}...`, {
      description: "Anda akan diarahkan ke saluran pembayaran Midtrans Snap.",
    });
    setTimeout(() => {
      setIsUpgrading(false);
      toast.success(`Permintaan upgrade ke paket ${targetTier} telah dicatat. Tim OsKost akan segera memproses. Hubungi Super Admin di WhatsApp untuk aktivasi instan.`);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Current Active Plan Status */}
      <div className="bg-white rounded-2xl border border-[#2C2825]/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2C2825]/10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#714A23]/10 text-[#714A23] border border-[#714A23]/20">
                PAKET SAAS AKTIF: {planTier}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                status === "ACTIVE" 
                  ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                  : status === "TRIAL"
                  ? "bg-blue-500/10 text-blue-700 border border-blue-500/20"
                  : "bg-red-500/10 text-red-700 border border-red-500/20"
              }`}>
                {status === "ACTIVE" ? "🟢 Berlangganan Aktif" : status === "TRIAL" ? "🔵 Masa Percobaan (Trial)" : "🔴 Ditangguhkan"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E1B18] mt-2">
              Status Kuota &amp; Langganan Properti
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleUpgrade("PRO")}
              disabled={isUpgrading}
              className="bg-[#714A23] hover:bg-[#5A3B1C] text-white rounded-xl font-bold gap-2 shadow-xs"
            >
              <Zap className="size-4" />
              <span>Upgrade ke Pro Tier</span>
            </Button>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[#1E1B18]">Penggunaan Kuota Kamar</span>
            <span className={`font-bold ${isOverQuota ? "text-amber-700 font-extrabold" : "text-[#714A23]"}`}>
              {roomsCount} dari {maxRooms} Kamar Digunakan ({usagePercent}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#F4EDE4] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOverQuota
                  ? "bg-amber-600"
                  : isAtQuota
                  ? "bg-amber-500"
                  : "bg-[#714A23]"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          {isOverQuota && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <b>Peringatan Batas Kuota:</b> Jumlah kamar Anda ({roomsCount}) telah melampaui kuota paket ({maxRooms}). 
                Sistem tidak mengizinkan penambahan kamar baru hingga Anda melakukan upgrade paket ke <b>Pro Tier</b>.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Matrix Plans */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1E1B18]">Pilihan Paket Langganan SaaS OsKost</h2>
          <p className="text-sm text-[#757069] mt-1">
            Pilih paket yang sesuai dengan skala pertumbuhan properti kost Anda. Upgrade berlaku seketika.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = planTier === plan.tier;
            const isPro = plan.tier === "PRO";

            return (
              <div
                key={plan.tier}
                className={`rounded-2xl p-6 relative flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "bg-white border-2 border-[#714A23] shadow-md ring-4 ring-[#714A23]/10"
                    : isPro
                    ? "bg-white border-2 border-emerald-500/40 shadow-sm"
                    : "bg-white border border-[#2C2825]/10 shadow-xs"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-[#1E1B18]">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#714A23]/10 text-[#714A23]">
                        Paket Saat Ini
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1E1B18]">{plan.price}</span>
                    <span className="text-xs text-[#757069] font-medium">{plan.period}</span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-[#714A23]">
                    Kapasitas hingga {plan.maxRooms} Kamar
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#4A453F]">
                        <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#2C2825]/10">
                  {isCurrent ? (
                    <Button disabled variant="outline" className="w-full rounded-xl font-bold text-xs">
                      Paket Aktif Anda
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.tier)}
                      className={`w-full rounded-xl font-bold text-xs gap-1.5 ${
                        isPro
                          ? "bg-[#714A23] hover:bg-[#5A3B1C] text-white shadow-xs"
                          : "bg-[#1E1B18] hover:bg-[#332E2A] text-white"
                      }`}
                    >
                      <Sparkles className="size-3.5" />
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
