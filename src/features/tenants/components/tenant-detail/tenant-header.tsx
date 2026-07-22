"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResetPasswordDialog } from "../reset-password-dialog";
import { CheckoutTenantButton } from "../checkout-tenant-button";
import { User, Phone, Mail, ArrowLeft, Building } from "lucide-react";
import type { TenantDetailForAdmin } from "../../tenant-service";

interface TenantHeaderProps {
  tenant: TenantDetailForAdmin;
}

export function TenantHeader({ tenant }: TenantHeaderProps) {
  const name = tenant.tenantProfile?.fullName ?? "—";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Active Lease calculations
  const activeLease = tenant.leases.find((l) => l.isActive);
  const hasActiveLease = !!activeLease;
  const roomNumber = activeLease?.room?.number
    ? `Room ${activeLease.room.number}`
    : "—";

  // Invoices calculations
  const activeInvoices = activeLease?.invoices ?? [];
  const unpaidInvoices = activeInvoices.filter(
    (inv) => inv.status === "UNPAID" || inv.status === "OVERDUE",
  );
  const hasUnpaid = unpaidInvoices.length > 0;

  // Status Calculations
  let statusText = "No Lease";
  let statusColor = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  let dotColor = "bg-zinc-500";

  if (hasActiveLease) {
    if (hasUnpaid) {
      statusText = "Unpaid";
      statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
      dotColor = "bg-red-400";
    } else {
      // Check if expiring in < 30 days
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
          statusText = "Hampir Habis";
          statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
          dotColor = "bg-amber-400";
        } else {
          statusText = "Paid";
          statusColor =
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          dotColor = "bg-emerald-400";
        }
      } else {
        statusText = "Paid";
        statusColor =
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        dotColor = "bg-emerald-400";
      }
    }
  } else if (tenant.leases.length > 0) {
    statusText = "Checked-out";
    statusColor = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    dotColor = "bg-zinc-400";
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-5">
          {/* Back Button (Mobile) */}
          {/* <Button
            variant="ghost"
            size="icon"
            asChild
            className="sm:hidden -ml-4 text-zinc-400 hover:text-white"
          >
            <Link href="/admin/tenants">
              <ArrowLeft className="size-5" />
            </Link>
          </Button> */}

          <div className="size-16 w-full md:size-14 rounded-md bg-zinc-800 border border-zinc-700/60 flex flex-col md:flex-row items-center justify-center text-zinc-300 font-bold text-2xl shadow-inner">
            {initials || <User className="size-8 text-zinc-500" />}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {name}
              </h2>
              <Badge
                variant="outline"
                className={`gap-1.5 px-2.5 py-1 text-xs font-semibold ${statusColor}`}
              >
                <span className={`size-1.5 rounded-full ${dotColor}`} />
                {statusText}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-400">
              <span className="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-300">
                T-{tenant.id.slice(-6).toUpperCase()}
              </span>
              <div className="flex items-center gap-1.5">
                <Building className="size-4" />
                <span className="font-medium text-zinc-200">{roomNumber}</span>
              </div>
              {tenant.phoneNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-4" />
                  <span>{tenant.phoneNumber}</span>
                </div>
              )}
              {tenant.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="size-4" />
                  <span>{tenant.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            asChild
            className="flex-1 sm:flex-none border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Link href={`/admin/tenants/${tenant.id}/edit`}>Edit Data</Link>
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
  );
}
