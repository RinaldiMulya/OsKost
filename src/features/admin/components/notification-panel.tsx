"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, KeyRound, MailCheck, ShieldCheck } from "lucide-react";

interface NotificationPanelProps {
  stats: {
    totalSent: number;
    totalUnread: number;
    totalPushSubscriptions: number;
  };
}

export function NotificationPanel({ stats }: NotificationPanelProps) {
  const isVapidConfigured =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY !== "";

  return (
    <Card className="bg-card rounded-2xl border border-border shadow-xs">
      <CardHeader className="space-y-1 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Bell className="size-5" />
          </div>
          <CardTitle className="text-lg font-bold font-editorial text-foreground">
            Status Notifikasi &amp; Web Push Telemetri
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Statistik pengiriman notifikasi pengingat sewa, laporan kerusakan, dan status langganan push device.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* VAPID API Key Status */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border text-primary shadow-2xs">
              <KeyRound className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Kunci Kriptografi VAPID</h4>
              <p className="text-[11px] text-muted-foreground">Protokol Web Push API standar W3C</p>
            </div>
          </div>
          <div>
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[10px] font-bold rounded-lg px-2.5 py-1">
              🟢 AKTIF &amp; TERHUBUNG
            </Badge>
          </div>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1">
              TOTAL TERKIRIM
            </span>
            <b className="text-2xl font-extrabold text-foreground">{stats.totalSent}</b>
            <span className="text-[11px] text-muted-foreground block mt-1">Notifikasi Berhasil</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-center shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1">
              BELUM DIBACA
            </span>
            <b className="text-2xl font-extrabold text-amber-ochre">{stats.totalUnread}</b>
            <span className="text-[11px] text-muted-foreground block mt-1">Menunggu Dibuka</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-center shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1">
              PERANGKAT TERHUBUNG
            </span>
            <b className="text-2xl font-extrabold text-primary">{stats.totalPushSubscriptions}</b>
            <span className="text-[11px] text-muted-foreground block mt-1">Push Subscriptions</span>
          </div>
        </div>

        {/* Notif Rules Info */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <MailCheck className="size-4 text-secondary" />
            <span>Pemicu Notifikasi Otomatis Terintegrasi:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-[11px] text-muted-foreground leading-relaxed pl-1">
            <li>Saat admin menyetujui / menolak bukti bayar sewa ➔ notifikasi real-time terkirim ke HP tenant.</li>
            <li>Saat tenant mengajukan tiket kerusakan baru ➔ notifikasi masuk ke panel web pengelola.</li>
            <li>Saat status pengerjaan tiket diubah (Open / In Progress / Resolved) ➔ update otomatis ke aplikasi tenant.</li>
            <li>Saat H-7 sebelum jatuh tempo sewa bulanan ➔ pengingat otomatis disalurkan ke sistem.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
