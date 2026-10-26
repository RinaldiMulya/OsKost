"use client";

import Image from "next/image";
import { useState } from "react";
import type { TenantDetailForAdmin } from "../../tenant-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IdCard,
  PhoneCall,
  FileText,
  Calendar,
  Coins,
  Eye,
  EyeOff,
  MapPin,
  Building,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface TenantInfoTabProps {
  tenant: TenantDetailForAdmin;
  signedKtpUrl: string | null;
}

export function TenantInfoTab({ tenant, signedKtpUrl }: TenantInfoTabProps) {
  const [isKtpBlurred, setIsKtpBlurred] = useState(true);
  const [copiedNik, setCopiedNik] = useState(false);

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
    if (!endDateStr) return "Tidak terbatas";
    const endDate = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return "Kontrak Berakhir";
    if (daysLeft === 0) return "Hari Ini Terakhir";
    if (daysLeft <= 30) return `${daysLeft} Hari Lagi`;
    return `${Math.round(daysLeft / 30)} Bulan (${daysLeft} Hari)`;
  }

  const handleCopyNik = (nik: string | null | undefined) => {
    if (!nik) return;
    navigator.clipboard.writeText(nik);
    setCopiedNik(true);
    toast.success("NIK disalin ke papan klip");
    setTimeout(() => setCopiedNik(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* ────────────────────────────────────────────────────────── */}
      {/* Card 1: Data Identitas & KTP */}
      {/* ────────────────────────────────────────────────────────── */}
      <Card className="bg-white border-2 border-[#2C2825]/30 rounded-2xl shadow-xs overflow-hidden flex flex-col gap-0 py-0">
        <CardHeader className="px-5 py-4 border-b border-[#2C2825]/30 bg-[#FAF2EA]/40">
          <CardTitle className="text-base font-bold text-[#1E1B18] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[#FAF2EA] border border-[#A45A3D]/20 flex items-center justify-center text-[#A45A3D]">
                <IdCard className="size-4" />
              </div>
              <span>Data KTP & Identitas</span>
            </div>
            {tenant.tenantProfile?.ktpNumber ? (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]"
              >
                Terdata
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]"
              >
                Belum Lengkap
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider">
                Nomor KTP (NIK)
              </span>
              {tenant.tenantProfile?.ktpNumber && (
                <button
                  type="button"
                  onClick={() => handleCopyNik(tenant.tenantProfile?.ktpNumber)}
                  className="text-xs text-[#A45A3D] hover:text-[#864327] inline-flex items-center gap-1 font-medium transition-colors"
                >
                  {copiedNik ? (
                    <>
                      <Check className="size-3" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" /> Salin
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="font-mono text-sm text-[#1E1B18] bg-[#F8F6F1] border border-[#2C2825]/30 px-3 py-2 rounded-xl">
              {tenant.tenantProfile?.ktpNumber
                ? maskKtpNumber(tenant.tenantProfile.ktpNumber)
                : "—"}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider mb-1.5 block">
              Alamat Sesuai KTP
            </span>
            <div className="flex items-start gap-2 bg-[#F8F6F1] border border-[#2C2825]/30 p-3 rounded-xl text-xs text-[#1E1B18] leading-relaxed">
              <MapPin className="size-3.5 text-[#7A7269] mt-0.5 shrink-0" />
              <span>
                {tenant.tenantProfile?.address || "Belum dicantumkan"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider mb-2 block">
              Foto Dokumen KTP
            </span>
            {signedKtpUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-[#2C2825]/30 w-full aspect-[1.6] bg-[#F4EDE4]">
                <Image
                  src={signedKtpUrl}
                  alt="Dokumen KTP Penghuni"
                  fill
                  className={`object-cover transition-all duration-300 ${
                    isKtpBlurred ? "blur-md scale-105" : "blur-0 scale-100"
                  }`}
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center transition-opacity opacity-90 hover:opacity-100">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsKtpBlurred(!isKtpBlurred)}
                    className="bg-white/95 text-[#1E1B18] hover:bg-white shadow-md text-xs font-semibold gap-1.5 rounded-xl h-8 px-3"
                  >
                    {isKtpBlurred ? (
                      <>
                        <Eye className="size-3.5 text-[#A45A3D]" />
                        <span>Lihat Dokumen</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="size-3.5 text-[#7A7269]" />
                        <span>Samarkan</span>
                      </>
                    )}
                  </Button>
                  <span className="text-[11px] text-white/90 mt-1.5 font-medium drop-shadow-sm">
                    {isKtpBlurred
                      ? "Data Pribadi Dilindungi"
                      : "Klik untuk menyembunyikan"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#F8F6F1] rounded-xl w-full aspect-[1.6] flex flex-col items-center justify-center border border-[#2C2825]/30 border-dashed text-[#7A7269] p-4 text-center">
                <IdCard className="size-8 mb-2 opacity-30 text-[#7A7269]" />
                <span className="text-xs font-medium text-[#4A453F]">
                  Foto KTP Belum Diunggah
                </span>
                <span className="text-[11px] text-[#7A7269] mt-0.5">
                  Tenant belum melengkapi berkas verifikasi identitas
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Card 2: Kontak Darurat */}
      {/* ────────────────────────────────────────────────────────── */}
      <Card className="bg-white border-2 border-[#2C2825]/30 rounded-2xl shadow-xs overflow-hidden flex flex-col gap-0 py-0">
        <CardHeader className="px-5 py-4 border-b border-[#2C2825]/30 bg-[#FAF2EA]/40">
          <CardTitle className="text-base font-bold text-[#1E1B18] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <PhoneCall className="size-4" />
              </div>
              <span>Kontak Darurat</span>
            </div>
            <Badge
              variant="outline"
              className="bg-[#F4EDE4] text-[#4A453F] border-[#2C2825]/30 text-[11px]"
            >
              Keluarga / Kerabat
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider block mb-1.5">
                Nama Kontak Darurat
              </span>
              <p className="text-sm font-semibold text-[#1E1B18] bg-[#F8F6F1] border border-[#2C2825]/30 px-3 py-2 rounded-xl">
                {tenant.tenantProfile?.emergencyContactName || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider mb-1.5 block">
                Nomor Telepon Darurat
              </span>
              <div className="flex items-center justify-between bg-[#F8F6F1] border border-[#2C2825]/30 px-3 py-2 rounded-xl">
                <span className="font-mono text-sm text-[#1E1B18]">
                  {tenant.tenantProfile?.emergencyContactNumber || "—"}
                </span>
                {tenant.tenantProfile?.emergencyContactNumber && (
                  <a
                    href={`tel:${tenant.tenantProfile.emergencyContactNumber}`}
                    className="text-xs font-semibold text-[#714A23] hover:underline"
                  >
                    Hubungi
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-100 mt-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-6 text-red-700 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 leading-relaxed">
                Kontak darurat digunakan jika terjadi musibah, kondisi medis
                mendesak, atau jika penghuni tidak dapat dihubungi terkait
                tunggakan sewa yang berkepanjangan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Card 3: Detail Sewa & Hunian */}
      {/* ────────────────────────────────────────────────────────── */}
      <Card className="bg-white border-2 border-[#2C2825]/30 rounded-2xl shadow-xs overflow-hidden flex flex-col gap-0 py-0">
        <CardHeader className="px-5 py-4 border-b border-[#2C2825]/30 bg-[#FAF2EA]/40">
          <CardTitle className="text-base font-bold text-[#1E1B18] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <FileText className="size-4" />
              </div>
              <span>Detail Sewa & Hunian</span>
            </div>
            {activeLease ? (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]"
              >
                Aktif
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-[#F4EDE4] text-[#4A453F] border-[#2C2825]/30 text-[11px]"
              >
                Selesai
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4 flex-1">
          {activeLease ? (
            <>
              <div>
                <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider mb-1.5 block">
                  Kamar yang Dihuni
                </span>
                <div className="flex items-center justify-between bg-[#F8F6F1] border border-[#2C2825]/30 p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Building className="size-4 text-[#A45A3D]" />
                    <span className="font-bold text-[#1E1B18] text-base">
                      Kamar {activeLease.room.number}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-white text-xs border-[#2C2825]/30"
                  >
                    {activeLease.room.type || "Deluxe Room"}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider mb-1.5 block">
                  Periode Sewa
                </span>
                <div className="flex items-center gap-2 text-xs text-[#1E1B18] bg-[#F8F6F1] border border-[#2C2825]/30 p-3 rounded-xl">
                  <Calendar className="size-3.5 text-[#7A7269] shrink-0" />
                  <span className="font-medium">
                    {formatDate(activeLease.startDate)} —{" "}
                    {activeLease.endDate
                      ? formatDate(activeLease.endDate)
                      : "Tidak terbatas"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider mb-1.5 block">
                  Sisa Durasi Kontrak
                </span>
                <div className="bg-[#FAF2EA]/70 border border-[#A45A3D]/20 px-3 py-2 rounded-xl text-xs font-bold text-[#714A23]">
                  {getRemainingContract(activeLease.endDate)}
                </div>
              </div>

              <div className="pt-3 border-t border-[#2C2825]/30">
                <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider mb-2 block">
                  Rincian Biaya Sewa
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-[#F8F6F1] px-3 py-2 rounded-lg border border-[#2C2825]/30">
                    <span className="text-[#4A453F]">Tarif Pokok Sewa</span>
                    <span className="font-bold text-[#1E1B18]">
                      {formatRupiah(activeLease.room.price)} / bulan
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[#7A7269] text-center">
              <FileText className="size-10 mb-2 opacity-30 text-[#7A7269]" />
              <p className="text-sm font-semibold text-[#4A453F]">
                Tidak Ada Kontrak Aktif
              </p>
              <p className="text-xs text-[#7A7269] mt-1 max-w-[200px]">
                Penyewa ini belum memiliki kontrak sewa aktif atau sudah
                checkout.
              </p>
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
    return (
      trimmed.slice(0, 4) + "*".repeat(trimmed.length - 8) + trimmed.slice(-4)
    );
  }
  return trimmed.slice(0, 6) + "******" + trimmed.slice(12);
}
