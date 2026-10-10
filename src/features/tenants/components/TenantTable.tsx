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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white py-4 px-6 rounded-2xl border border-[#2C2825]/10 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#4A453F]" />
          <Input
            type="text"
            placeholder="Cari penghuni atau kamar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-[#2C2825]/15 pl-10 pr-4 h-11 text-[#1E1B18] placeholder:text-[#82756A] text-sm rounded-xl focus:ring-[#8C6239] transition-colors font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#4A453F] shrink-0">
            Filter Status:
          </span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[190px] bg-white border-[#2C2825]/15 text-[#1E1B18] text-sm font-semibold rounded-xl h-11">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#2C2825]/15 text-[#1E1B18] rounded-xl shadow-lg">
              <SelectItem value="ACTIVE" className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer">Penghuni Aktif</SelectItem>
              <SelectItem value="ALL" className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer">Semua Status</SelectItem>
              <SelectItem value="PAID" className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer">Paid</SelectItem>
              <SelectItem value="UNPAID" className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer">Unpaid</SelectItem>
              <SelectItem value="WARNING" className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer">Hampir / Habis Kontrak</SelectItem>
              <SelectItem value="CHECKED_OUT" className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer">Checked-out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-[#2C2825]/10 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#F8F6F1]/80 border-b border-[#2C2825]/10">
            <TableRow className="hover:bg-transparent border-b border-[#2C2825]/10">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-[#1E1B18] font-bold text-sm py-3.5 uppercase tracking-wider">
                Tenant
              </TableHead>
              <TableHead className="text-[#1E1B18] font-bold text-sm py-3.5 uppercase tracking-wider">
                Kamar
              </TableHead>
              <TableHead className="text-[#1E1B18] font-bold text-sm py-3.5 uppercase tracking-wider">
                Check-in
              </TableHead>
              <TableHead className="text-[#1E1B18] font-bold text-sm py-3.5 uppercase tracking-wider">
                Sewa & Kontrak
              </TableHead>
              <TableHead className="text-[#1E1B18] font-bold text-sm py-3.5 uppercase tracking-wider">
                Pembayaran
              </TableHead>
              <TableHead className="text-[#1E1B18] font-bold text-sm py-3.5 pr-6 uppercase tracking-wider text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#2C2825]/8">
            {filteredTenants.length === 0 ? (
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-[#4A453F] text-base font-medium"
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
