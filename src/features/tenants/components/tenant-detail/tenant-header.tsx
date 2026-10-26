"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResetPasswordDialog } from "../reset-password-dialog";
import { CheckoutTenantButton } from "../checkout-tenant-button";
import {
  User,
  Phone,
  Mail,
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  Edit,
  ExternalLink,
} from "lucide-react";
import type { TenantDetailForAdmin } from "../../tenant-service";

interface TenantHeaderProps {
  tenant: TenantDetailForAdmin;
}

export function TenantHeader({ tenant }: TenantHeaderProps) {
  const name = tenant.tenantProfile?.fullName ?? "—";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "TN";

  // Active Lease calculations
  const activeLease = tenant.leases.find((l) => l.isActive);
  const hasActiveLease = !!activeLease;
  const roomNumber = activeLease?.room?.number
    ? `Kamar ${activeLease.room.number}`
    : "Belum Ditugaskan";
  const roomType = activeLease?.room?.type || activeLease?.room?.name || "Standard";

  // Invoices calculations
  const activeInvoices = activeLease?.invoices ?? [];
  const unpaidInvoices = activeInvoices.filter(
    (inv) => inv.status === "UNPAID" || inv.status === "OVERDUE",
  );
  const hasUnpaid = unpaidInvoices.length > 0;

  // Status Calculations
  let statusText = "Tidak Ada Sewa Aktif";
  let statusColor = "bg-[#F4EDE4] text-[#4A453F] border-[#2C2825]/15";
  let dotColor = "bg-[#7A7269]";

  if (hasActiveLease) {
    if (hasUnpaid) {
      statusText = `Tunggakan (${unpaidInvoices.length} Tagihan)`;
      statusColor = "bg-rose-50 text-rose-700 border-rose-200/80";
      dotColor = "bg-rose-600";
    } else {
      const endDate = activeLease.endDate
        ? new Date(activeLease.endDate)
        : null;
      if (endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        const diffTime = endDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysLeft >= 0 && daysLeft <= 30) {
          statusText = `Kontrak Hampir Habis (${daysLeft} Hari)`;
          statusColor = "bg-amber-50 text-amber-700 border-amber-200/80";
          dotColor = "bg-amber-600";
        } else {
          statusText = "Sewa Aktif & Lunas";
          statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
          dotColor = "bg-emerald-600";
        }
      } else {
        statusText = "Sewa Aktif & Lunas";
        statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
        dotColor = "bg-emerald-600";
      }
    }
  } else if (tenant.leases.length > 0) {
    statusText = "Sudah Checkout";
    statusColor = "bg-[#F4EDE4] text-[#4A453F] border-[#2C2825]/15";
    dotColor = "bg-[#7A7269]";
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Nav */}
      <div className="flex items-center gap-2 text-sm text-[#4A453F]">
        <Link
          href="/admin/tenants"
          className="inline-flex items-center gap-1.5 font-medium hover:text-[#1E1B18] transition-colors py-1 group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5 text-[#7A7269] group-hover:text-[#1E1B18]" />
          <span>Manajemen Penghuni</span>
        </Link>
        <span className="text-[#2C2825]/20">/</span>
        <span className="text-[#1E1B18] font-semibold truncate max-w-xs sm:max-w-md">
          {name}
        </span>
      </div>

      {/* Main Hero Card */}
      <div className="bg-white border border-[#2C2825]/10 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle Warm Gradient Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FAF2EA] via-[#FFF8F2]/60 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Tenant Avatar & Essential Bio */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="size-16 sm:size-20 rounded-2xl bg-[#FAF2EA] border border-[#A45A3D]/20 flex items-center justify-center text-[#A45A3D] font-bold text-2xl font-serif shadow-xs shrink-0">
              {initials}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">
                  {name}
                </h1>
                <Badge
                  variant="outline"
                  className={`gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                >
                  <span className={`size-1.5 rounded-full ${dotColor}`} />
                  {statusText}
                </Badge>
              </div>

              {/* Quick Info Tags */}
              <div className="flex flex-wrap items-center gap-2.5 text-sm text-[#4A453F]">
                <span className="font-mono bg-[#F8F6F1] border border-[#2C2825]/10 px-2.5 py-0.5 rounded-md text-xs font-semibold text-[#1E1B18]">
                  ID: {tenant.id.slice(-6).toUpperCase()}
                </span>

                <div className="flex items-center gap-1.5 bg-[#FAF2EA]/70 border border-[#A45A3D]/15 px-2.5 py-0.5 rounded-md text-xs font-medium text-[#714A23]">
                  <Building className="size-3.5" />
                  <span>
                    {roomNumber} {hasActiveLease && `(${roomType})`}
                  </span>
                </div>

                {tenant.phoneNumber && (
                  <a
                    href={`tel:${tenant.phoneNumber}`}
                    className="flex items-center gap-1.5 bg-[#F8F6F1] border border-[#2C2825]/10 hover:border-[#2C2825]/20 hover:text-[#1E1B18] transition-colors px-2.5 py-0.5 rounded-md text-xs"
                    title="Panggil Nomor"
                  >
                    <Phone className="size-3.5 text-[#7A7269]" />
                    <span>{tenant.phoneNumber}</span>
                  </a>
                )}

                {tenant.email && (
                  <a
                    href={`mailto:${tenant.email}`}
                    className="flex items-center gap-1.5 bg-[#F8F6F1] border border-[#2C2825]/10 hover:border-[#2C2825]/20 hover:text-[#1E1B18] transition-colors px-2.5 py-0.5 rounded-md text-xs"
                    title="Kirim Email"
                  >
                    <Mail className="size-3.5 text-[#7A7269]" />
                    <span>{tenant.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap pt-4 lg:pt-0 border-t lg:border-t-0 border-[#2C2825]/10">
            <Button
              variant="outline"
              asChild
              className="border-[#2C2825]/15 text-[#1E1B18] hover:bg-[#FAF2EA] hover:border-[#2C2825]/30 rounded-xl font-medium text-sm h-10 px-4 transition-all"
            >
              <Link href={`/admin/tenants/${tenant.id}/edit`}>
                <Edit className="size-4 mr-2 text-[#7A7269]" />
                Edit Profil
              </Link>
            </Button>

            <ResetPasswordDialog userId={tenant.id} tenantName={name} />

            {hasActiveLease && (
              <CheckoutTenantButton
                userId={tenant.id}
                tenantName={name}
                variant="icon"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
