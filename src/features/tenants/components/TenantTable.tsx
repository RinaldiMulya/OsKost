"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TenantRow } from "./TenantRow";
import { Search } from "lucide-react";

interface TenantTableProps {
  tenants: any[];
}

export function TenantTable({ tenants }: TenantTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Client-side filtering logic
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const name = tenant.tenantProfile?.fullName?.toLowerCase() ?? "";

      // Active Lease info
      const activeLease = tenant.leases.find((l: any) => l.isActive);
      const roomNumber = activeLease?.room?.number?.toLowerCase() ?? "";
      const hasActiveLease = !!activeLease;

      // Invoices info
      const activeInvoices = activeLease?.invoices ?? [];
      const unpaidInvoices = activeInvoices.filter(
        (inv: any) => inv.status === "UNPAID" || inv.status === "OVERDUE",
      );
      const hasUnpaid = unpaidInvoices.length > 0;

      // Sisa kontrak
      const daysLeft = activeLease?.endDate
        ? getDaysRemaining(activeLease.endDate)
        : 999;

      // Search query matches name or room number
      const matchesSearch =
        name.includes(debouncedSearchQuery.toLowerCase()) ||
        roomNumber.includes(debouncedSearchQuery.toLowerCase());

      // Status Filter Logic
      let matchesStatus = true;
      if (statusFilter === "ACTIVE") {
        // Semua penyewa yang saat ini masih tinggal (lease aktif)
        matchesStatus = hasActiveLease;
      } else if (statusFilter === "PAID") {
        // Lease aktif, lunas, dan kontrak belum habis
        matchesStatus = hasActiveLease && !hasUnpaid && daysLeft >= 0;
      } else if (statusFilter === "UNPAID") {
        matchesStatus = hasActiveLease && hasUnpaid;
      } else if (statusFilter === "WARNING") {
        // Kontrak hampir habis (<= 30 hari) atau sudah habis (< 0)
        matchesStatus = hasActiveLease && daysLeft <= 30;
      } else if (statusFilter === "CHECKED_OUT") {
        matchesStatus = !hasActiveLease && tenant.leases.length > 0;
      }
      // "ALL" => matchesStatus tetap true

      return matchesSearch && matchesStatus;
    });
  }, [tenants, debouncedSearchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Action Bar (Search & Filter) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900 py-6 px-8 rounded-xl border border-zinc-800/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-6 text-zinc-500" />
          <Input
            type="text"
            placeholder="Cari penghuni atau kamar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border-zinc-800 pl-10 pr-4 py-6 text-zinc-100 text-lg focus:ring-secondary focus:border-secondary transition-colors"
          />
        </div>

        <div className="flex items-center gap-30 lg:gap-3">
          <span className="text-xs font-semibold text-zinc-400 shrink-0">
            Filter Status:
          </span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-zinc-950/40 border-zinc-800 text-white text-sm rounded-xl">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white rounded-xl">
              <SelectItem value="ACTIVE" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Penghuni Aktif</SelectItem>
              <SelectItem value="ALL" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Semua Status</SelectItem>
              <SelectItem value="PAID" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Paid</SelectItem>
              <SelectItem value="UNPAID" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Unpaid</SelectItem>
              <SelectItem value="WARNING" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Hampir / Habis Kontrak</SelectItem>
              <SelectItem value="CHECKED_OUT" className="focus:bg-zinc-900 focus:text-white cursor-pointer">Checked-out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-zinc-950/40 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-b border-zinc-800">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-zinc-400 font-semibold text-lg py-4 uppercase tracking-wider">
                Tenant
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold text-lg py-4 uppercase tracking-wider">
                Kamar
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold text-lg py-4 uppercase tracking-wider">
                Check-in
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold text-lg py-4 uppercase tracking-wider">
                Sewa & Kontrak
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold text-lg py-4 uppercase tracking-wider">
                Pembayaran
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold text-lg py-4 pr-15 uppercase tracking-wider text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-800">
            {filteredTenants.length === 0 ? (
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-zinc-500 text-md"
                >
                  Tidak ada data penghuni yang cocok dengan kriteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TenantRow key={tenant.id} tenant={tenant} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Helpers
function getDaysRemaining(endDateStr: Date | string) {
  const endDate = new Date(endDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
