"use client";

import { Card } from "@/components/ui/card";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";

interface DashboardStatsProps {
  totalCount: number;
  paidCount: number;
  unpaidCount: number;
  warningCount: number;
  newTenantsThisMonth?: number;
}

export function DashboardStats({
  totalCount,
  paidCount,
  unpaidCount,
  warningCount,
  newTenantsThisMonth = 0,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
      {/* Stat 1: Total Tenants */}
      <Card className="bg-white border-[#2C2825]/10 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <Users className="size-5" />
          </div>
          <h3 className="text-base font-bold text-[#4A453F]">Total Penghuni</h3>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#1E1B18] tracking-tight">
            {totalCount}
          </span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <TrendingUp className="size-3.5" />
            {newTenantsThisMonth > 0 ? `+${newTenantsThisMonth}` : "0"} bulan ini
          </span>
        </div>
      </Card>

      {/* Stat 2: Sudah Bayar */}
      <Card className="bg-white border-[#2C2825]/10 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="size-5" />
          </div>
          <h3 className="text-base font-bold text-[#4A453F]">Sudah Bayar</h3>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#1E1B18] tracking-tight">
            {paidCount}
          </span>
          <span className="text-sm font-semibold text-[#4A453F]">
            {totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0}% dari total
          </span>
        </div>
      </Card>

      {/* Stat 3: Belum Bayar */}
      <Card className="bg-white border-[#2C2825]/10 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-red-700">
            <AlertTriangle className="size-5" />
          </div>
          <h3 className="text-base font-bold text-[#4A453F]">Belum Bayar</h3>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="text-3xl sm:text-4xl font-extrabold text-red-700 tracking-tight">
            {unpaidCount}
          </span>
          <span className="text-xs font-bold text-red-800 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
            Perlu tindak lanjut
          </span>
        </div>
      </Card>

      {/* Stat 4: Kontrak < 30 Hari */}
      <Card className="bg-white border-[#2C2825]/10 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Clock className="size-5" />
          </div>
          <h3 className="text-base font-bold text-[#4A453F]">
            Kontrak &lt;30hr
          </h3>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="text-3xl sm:text-4xl font-extrabold text-amber-800 tracking-tight">
            {warningCount}
          </span>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            Masa sewa habis
          </span>
        </div>
      </Card>
    </div>
  );
}
