"use client";

import Image from "next/image";
import { useState } from "react";
import type { TenantDetailForAdmin } from "../../tenant-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IdCard,
  PhoneCall,
  FileText,
  Calendar,
  Coins,
  Eye,
  EyeOff,
} from "lucide-react";

interface TenantInfoTabProps {
  tenant: TenantDetailForAdmin;
  signedKtpUrl: string | null;
}

export function TenantInfoTab({ tenant, signedKtpUrl }: TenantInfoTabProps) {
  const [isKtpBlurred, setIsKtpBlurred] = useState(true);

  const activeLease = tenant.leases.find((l) => l.isActive);

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateStr: Date | string) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function getRemainingContract(endDateStr: Date | string | null | undefined) {
    if (!endDateStr) return "—";
    const endDate = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return "Selesai";
    if (daysLeft === 0) return "Hari Ini";
    if (daysLeft <= 30) return `${daysLeft} Hari`;
    return `${Math.round(daysLeft / 30)} Bulan`;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Card 1: Data Pribadi */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <CardTitle className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <IdCard className="size-5 text-primary" />
            Data KTP & Pribadi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Nomor KTP (NIK)</p>
            <p className="font-mono text-zinc-200">
              {maskKtpNumber(tenant.tenantProfile?.ktpNumber)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-1">Alamat Sesuai KTP</p>
            <p className="text-zinc-200">
              {tenant.tenantProfile?.address || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-2">Foto KTP</p>
            {signedKtpUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-zinc-800 w-full max-w-sm aspect-[1.6]">
                <Image
                  src={signedKtpUrl}
                  alt="Foto KTP"
                  fill
                  className={`object-cover transition-all duration-300 ${isKtpBlurred ? "blur-md scale-105" : "blur-0 scale-100"}`}
                />
                <button
                  onClick={() => setIsKtpBlurred(!isKtpBlurred)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="bg-zinc-900/80 p-2 rounded-full mb-1">
                    {isKtpBlurred ? (
                      <Eye className="size-5 text-white" />
                    ) : (
                      <EyeOff className="size-5 text-white" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-white">
                    {isKtpBlurred ? "Lihat KTP" : "Sembunyikan"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="bg-zinc-800/50 rounded-xl w-full max-w-sm aspect-[1.6] flex flex-col items-center justify-center border border-zinc-800 border-dashed text-zinc-500">
                <IdCard className="size-8 mb-2 opacity-20" />
                <span className="text-xs">Foto KTP Belum Diunggah</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Kontak Darurat */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <CardTitle className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <PhoneCall className="size-5 text-rose-400" />
            Kontak Darurat
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Nama Kontak Darurat</p>
            <p className="text-zinc-200 font-medium">
              {tenant.tenantProfile?.emergencyContactName || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-1">Nomor Kontak</p>
            <p className="font-mono text-zinc-200">
              {tenant.tenantProfile?.emergencyContactNumber || "—"}
            </p>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <p className="text-xs text-rose-300 leading-relaxed">
              Pastikan kontak ini valid dan dapat dihubungi dalam keadaan
              darurat atau jika penghuni tidak merespon tagihan tunggakan yang
              berkepanjangan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Detail Kontrak Aktif */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <CardTitle className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <FileText className="size-5 text-emerald-400" />
            Detail Sewa Aktif
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {activeLease ? (
            <>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Kamar yang Disewa</p>
                <p className="text-zinc-200 font-medium text-lg">
                  Room {activeLease.room.number}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Periode Sewa</p>
                <div className="flex items-center gap-2 text-zinc-200">
                  <Calendar className="size-4 text-zinc-400" />
                  <span>
                    {formatDate(activeLease.startDate)} —{" "}
                    {activeLease.endDate
                      ? formatDate(activeLease.endDate)
                      : "Tidak terbatas"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Sisa Kontrak</p>
                <p className="text-zinc-200">
                  {getRemainingContract(activeLease.endDate)}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-zinc-800/80">
                <p className="text-sm text-zinc-500 mb-2">Rincian Biaya</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Harga Sewa Kamar</span>
                    <span className="text-zinc-200 font-medium">
                      {formatRupiah(activeLease.room.price)}/bln
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
              <FileText className="size-12 mb-3 opacity-20" />
              <p className="text-sm">Tidak ada sewa yang sedang aktif.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function maskKtpNumber(ktpNumber: string | null | undefined) {
  if (!ktpNumber) return "—";
  const trimmed = ktpNumber.trim();
  if (trimmed.length !== 16) {
    if (trimmed.length <= 6) return trimmed;
    return trimmed.slice(0, 4) + "*".repeat(trimmed.length - 8) + trimmed.slice(-4);
  }
  return trimmed.slice(0, 6) + "******" + trimmed.slice(12);
}
