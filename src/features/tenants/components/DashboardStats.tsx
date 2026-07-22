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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stat 1: Total Tenants */}
      <Card className="bg-zinc-900 border-zinc-800/80 p-6 hover:scale-[1.02] hover:border-blue-700/80 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Users className="size-5" />
          </div>
          <h3 className="text-xl font-medium text-zinc-400">Total Penghuni</h3>
        </div>
        <div className="flex items-baseline gap-5">
          <span className="text-3xl pl-2 font-bold text-white tracking-tight">
            {totalCount}
          </span>
          <span className="text-2xl text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-md flex items-center gap-1">
            <TrendingUp className="size-6" />
            {newTenantsThisMonth > 0 ? `+${newTenantsThisMonth}` : "0"} bulan ini
          </span>
        </div>
      </Card>

      {/* Stat 2: Sudah Bayar */}
      <Card className="bg-zinc-900 border-zinc-800/80 p-6 hover:scale-[1.02] hover:border-green-700/80 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <h3 className="text-xl font-medium text-zinc-400">Sudah Bayar</h3>
        </div>
        <div className="flex items-baseline gap-5 ">
          <span className="text-3xl pl-2 font-bold text-white tracking-tight">
            {paidCount}
          </span>
          <span className="text-2xl text-zinc-400">
            {totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0}%
            dari total
          </span>
        </div>
      </Card>

      {/* Stat 3: Belum Bayar */}
      <Card className="bg-zinc-900 border-zinc-800/80 p-6 hover:scale-[1.02] hover:border-red-700/80 transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <h3 className="text-xl font-medium text-zinc-400">Belum Bayar</h3>
        </div>
        <div className="flex items-baseline gap-5 relative z-10">
          <span className="text-3xl pl-2 font-bold text-red-400 tracking-tight">
            {unpaidCount}
          </span>
          <span className="text-2xl text-red-400 bg-red-500/10 px-2 py-1 rounded-md flex items-center gap-1">
            Perlu tindak lanjut
          </span>
        </div>
      </Card>

      {/* Stat 4: Kontrak < 30 Hari */}
      <Card className="bg-zinc-900 border-zinc-800/80 p-6 hover:scale-[1.02] hover:border-yellow-700 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="size-5" />
          </div>
          <h3 className="text-xl font-medium text-zinc-400">
            Kontrak &lt;30hr
          </h3>
        </div>
        <div className="flex items-baseline gap-5">
          <span className="text-3xl pl-2 font-bold text-amber-400 tracking-tight">
            {warningCount}
          </span>
          <span className="text-2xl text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
            Masa sewa habis
          </span>
        </div>
      </Card>
    </div>
  );
}
