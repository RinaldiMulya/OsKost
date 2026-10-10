"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Receipt,
  CheckCircle2,
  CircleX,
  Clock,
  AlertTriangle,
  Search,
  Bell,
  Eye,
  Gift,
  Loader2,
  Tag,
  DollarSign,
  TrendingUp,
  FileWarning,
  RotateCcw,
} from "lucide-react";
import { AdminDiscountDialog } from "@/features/payment";
import {
  markInvoicePaidAction,
  rejectInvoicePaymentAction,
  sendBillingReminderAction,
} from "../actions";
import {
  approvePromoClaimAction,
  rejectPromoClaimAction,
  cancelPaymentAction,
} from "@/features/payment";

interface AdminBillingViewProps {
  data: {
    stats: {
      totalBilledThisMonth: number;
      totalPaidThisMonth: number;
      totalUnpaidAmount: number;
      pendingTransfersCount: number;
      pendingPromoClaimsCount: number;
    };
    invoices: any[];
    pendingPromoClaims: any[];
  };
}

export function AdminBillingView({ data }: AdminBillingViewProps) {
  const [activeTab, setActiveTab] = useState<"INVOICES" | "PROMOS">("INVOICES");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);
  const [loadingClaimId, setLoadingClaimId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const { stats, invoices, pendingPromoClaims } = data;

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateStr: Date | string | null) {
    if (!dateStr) return "—";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  }

  function formatPeriod(dateStr: Date | string) {
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  }

  // Filter invoices locally
  const filteredInvoices = invoices.filter((inv) => {
    const tenantName =
      inv.lease?.user?.tenantProfile?.fullName?.toLowerCase() || "";
    const roomNumber = inv.lease?.room?.number?.toLowerCase() || "";

    const matchesQuery =
      tenantName.includes(searchQuery.toLowerCase()) ||
      roomNumber.includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || inv.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  async function handleMarkPaid(invoiceId: string) {
    setLoadingInvoiceId(invoiceId);
    const result = await markInvoicePaidAction(invoiceId);
    setLoadingInvoiceId(null);
    if (result.success) {
      toast.success("Pembayaran berhasil ditandai lunas!");
      setPreviewImage(null);
    } else {
      toast.error(result.error ?? "Gagal menandai lunas.");
    }
  }

  async function handleRejectPaid(invoiceId: string) {
    if (!rejectReason) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    setLoadingInvoiceId(invoiceId);
    const result = await rejectInvoicePaymentAction(invoiceId, rejectReason);
    setLoadingInvoiceId(null);
    if (result.success) {
      toast.success("Pembayaran berhasil ditolak!");
      setPreviewImage(null);
      setShowRejectForm(false);
      setRejectReason("");
    } else {
      toast.error(result.error ?? "Gagal menolak pembayaran.");
    }
  }

  async function handleCancelPayment(invoiceId: string) {
    const confirmReset = window.confirm(
      "Apakah Anda yakin ingin membatalkan status PENDING tagihan ini dan mengembalikannya ke UNPAID?"
    );
    if (!confirmReset) return;

    setLoadingInvoiceId(invoiceId);
    const result = await cancelPaymentAction(invoiceId);
    setLoadingInvoiceId(null);

    if (result.success) {
      toast.success(result.message || "Status tagihan berhasil di-reset ke UNPAID.");
    } else {
      toast.error(result.error || "Gagal me-reset tagihan.");
    }
  }

  async function handleSendReminder(userId: string) {
    setSendingReminderId(userId);
    const result = await sendBillingReminderAction(userId);
    setSendingReminderId(null);
    if (result.success) {
      toast.success(
        `Reminder tagihan berhasil dikirim ke ${result.tenantName ?? "penghuni"}!`
      );
    } else {
      toast.error(result.error ?? "Gagal mengirim reminder tagihan.");
    }
  }

  async function handleApprovePromo(claimId: string) {
    setLoadingClaimId(claimId);
    const result = await approvePromoClaimAction(claimId);
    setLoadingClaimId(null);
    if (result.success) {
      toast.success(result.message || "Promo berhasil disetujui!");
    } else {
      toast.error(result.error || "Gagal menyetujui promo.");
    }
  }

  async function handleRejectPromo(claimId: string) {
    if (!rejectReason) {
      toast.error("Masukan alasan penolakan promo.");
      return;
    }
    setLoadingClaimId(claimId);
    const result = await rejectPromoClaimAction(claimId, rejectReason);
    setLoadingClaimId(null);
    if (result.success) {
      toast.success(result.message || "Pengajuan promo ditolak.");
      setShowRejectForm(false);
      setRejectReason("");
    } else {
      toast.error(result.error || "Gagal menolak promo.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-6 border-b border-[#2C2825]/10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">
          Manajemen Tagihan & Keuangan
        </h1>
        <p className="text-sm sm:text-base text-[#4A453F] font-medium mt-1">
          Kelola tagihan sewa bulanan, verifikasi bukti transfer manual, dan
          konfirmasi klaim promo Google Review.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#2C2825]/10 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#4A453F]">
                Total Tagihan Bulan Ini
              </p>
              <p className="text-2xl font-extrabold text-[#1E1B18] mt-1">
                {formatRupiah(stats.totalBilledThisMonth)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#2C2825]/10 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#4A453F]">Sudah Lunas</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {formatRupiah(stats.totalPaidThisMonth)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#2C2825]/10 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#4A453F]">Tunggakan Belum Lunas</p>
              <p className="text-2xl font-extrabold text-amber-800 mt-1">
                {formatRupiah(stats.totalUnpaidAmount)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <FileWarning className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#2C2825]/10 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#4A453F]">Verifikasi Masuk</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-extrabold text-[#1E1B18]">
                  {stats.pendingTransfersCount} Transfer
                </span>
                <span className="text-[#82756A]">·</span>
                <span className="text-lg font-extrabold text-amber-800">
                  {stats.pendingPromoClaimsCount} Promo
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <Gift className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#2C2825]/10 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("INVOICES")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "INVOICES"
                  ? "bg-[#714A23] text-white shadow-sm"
                  : "bg-white text-[#4A453F] hover:text-[#1E1B18] border border-[#2C2825]/15"
              }`}
            >
              Daftar Semua Tagihan
            </button>

            <button
              onClick={() => setActiveTab("PROMOS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === "PROMOS"
                  ? "bg-[#8C6239] text-white shadow-sm"
                  : "bg-white text-[#4A453F] hover:text-[#1E1B18] border border-[#2C2825]/15"
              }`}
            >
              Verifikasi Klaim Promo
              {stats.pendingPromoClaimsCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {stats.pendingPromoClaimsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: DAFTAR TAGIHAN */}
        {activeTab === "INVOICES" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#4A453F]" />
                <Input
                  placeholder="Cari nama penghuni / nomor kamar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white border-[#2C2825]/15 text-sm text-[#1E1B18] placeholder:text-[#82756A] font-medium h-10 rounded-xl"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                {["ALL", "UNPAID", "PENDING", "PAID", "OVERDUE"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === status
                          ? "bg-[#714A23] text-white shadow-sm"
                          : "bg-white text-[#4A453F] hover:text-[#1E1B18] border border-[#2C2825]/15"
                      }`}
                    >
                      {status === "ALL" && "Semua Status"}
                      {status === "UNPAID" && "Belum Bayar"}
                      {status === "PENDING" && "Menunggu Konfirmasi"}
                      {status === "PAID" && "Lunas"}
                      {status === "OVERDUE" && "Terlambat"}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Invoices Table */}
            <Card className="bg-white border-[#2C2825]/10 rounded-2xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-[#F8F6F1]/80 border-b border-[#2C2825]/10">
                    <TableRow className="border-b border-[#2C2825]/10">
                      <TableHead className="text-[#1E1B18] font-bold text-sm h-12">Penghuni & Kamar</TableHead>
                      <TableHead className="text-[#1E1B18] font-bold text-sm h-12">Periode</TableHead>
                      <TableHead className="text-[#1E1B18] font-bold text-sm h-12">Rincian Nominal</TableHead>
                      <TableHead className="text-[#1E1B18] font-bold text-sm h-12">Metode</TableHead>
                      <TableHead className="text-[#1E1B18] font-bold text-sm h-12">Status</TableHead>
                      <TableHead className="text-right text-[#1E1B18] font-bold text-sm h-12">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((inv) => {
                        const tenantName =
                          inv.lease?.user?.tenantProfile?.fullName ||
                          "Penghuni Kost";
                        const roomNumber = inv.lease?.room?.number || "-";
                        const userId = inv.lease?.user?.id;

                        return (
                          <TableRow
                            key={inv.id}
                            className="border-b border-[#2C2825]/8 hover:bg-[#F8F6F1]/70 transition-colors"
                          >
                            <TableCell className="py-4">
                              <div>
                                <p className="font-bold text-[#1E1B18] text-sm">
                                  {tenantName}
                                </p>
                                <p className="text-xs font-semibold text-[#5C564E] mt-0.5">
                                  Kamar {roomNumber}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs sm:text-sm font-semibold text-[#4A453F] py-4">
                              {formatPeriod(inv.dueDate)}
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="space-y-0.5 text-xs">
                                <p className="font-bold text-emerald-700 text-sm">
                                  {formatRupiah(inv.amount)}
                                </p>
                                <p className="text-xs text-[#5C564E] font-medium">
                                  Sewa: {formatRupiah(inv.rentAmount)}
                                  {inv.tenantAdminFee > 0 &&
                                    ` + Admin: ${formatRupiah(inv.tenantAdminFee)}`}
                                  {inv.discountAmount > 0 && (
                                    <span className="text-purple-700 font-bold ml-1">
                                      (-{formatRupiah(inv.discountAmount)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs font-semibold text-[#4A453F] py-4">
                              {inv.provider === "MIDTRANS" ? (
                                <Badge
                                  variant="outline"
                                  className="border-blue-300 text-blue-800 bg-blue-50 text-xs font-bold rounded-lg px-2 py-0.5"
                                >
                                  Midtrans
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-[#2C2825]/15 text-[#4A453F] bg-[#F2EDE9] text-xs font-semibold rounded-lg px-2 py-0.5"
                                >
                                  Manual / Onsite
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="py-4">
                              <Badge
                                variant="outline"
                                className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${
                                  inv.status === "PAID"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : inv.status === "PENDING"
                                    ? "bg-blue-50 text-blue-800 border-blue-300"
                                    : "bg-red-50 text-red-800 border-red-300"
                                }`}
                              >
                                {inv.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5 items-center">
                                {/* Tandai Lunas */}
                                {inv.status !== "PAID" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkPaid(inv.id)}
                                    disabled={loadingInvoiceId === inv.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 gap-1"
                                  >
                                    {loadingInvoiceId === inv.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    Lunas
                                  </Button>
                                )}

                                {/* Reset Pending */}
                                {inv.status === "PENDING" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelPayment(inv.id)}
                                    disabled={loadingInvoiceId === inv.id}
                                    title="Reset Status ke UNPAID"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 px-2 gap-1"
                                  >
                                    {loadingInvoiceId === inv.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-3 w-3" />
                                    )}
                                    Batal Pending
                                  </Button>
                                )}

                                {/* Admin Discount Dialog */}
                                {(inv.status === "UNPAID" || inv.status === "OVERDUE") && (
                                  <AdminDiscountDialog
                                    invoiceId={inv.id}
                                    currentDiscountAmount={inv.discountAmount}
                                    currentDiscountReason={inv.discountReason}
                                  />
                                )}

                                {/* Lihat SS Transfer Manual */}
                                {inv.proofUrl && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs h-8 px-2"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="border-zinc-800 bg-zinc-950 p-0 overflow-hidden sm:max-w-md">
                                      <DialogHeader className="p-4 pb-0 bg-zinc-900 border-b border-zinc-800">
                                        <DialogTitle className="text-zinc-100 flex items-center gap-2 text-sm">
                                          Bukti Transfer Manual
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="relative w-full aspect-[9/16] max-h-[70vh]">
                                        <Image
                                          src={inv.proofUrl}
                                          alt="Bukti Transfer"
                                          fill
                                          className="object-contain bg-black/50"
                                        />
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}

                                {/* Kirim Reminder */}
                                {inv.status !== "PAID" && userId && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendReminder(userId)}
                                    disabled={sendingReminderId === userId}
                                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs h-8 px-2"
                                  >
                                    {sendingReminderId === userId ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Bell className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-zinc-500"
                        >
                          Tidak ada data tagihan yang sesuai.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: VERIFIKASI PROMO */}
        {activeTab === "PROMOS" && (
          <div className="space-y-4">
            <Card className="bg-white border-[#2C2825]/10 rounded-2xl shadow-sm">
              <CardHeader className="border-b border-[#2C2825]/10">
                <CardTitle className="text-lg font-bold text-[#1E1B18] flex items-center gap-2">
                  <Gift className="h-5 w-5 text-[#8C6239]" />
                  Pengajuan Klaim Promo Menunggu Verifikasi
                </CardTitle>
                <CardDescription className="text-sm font-medium text-[#4A453F]">
                  Review bukti ulasan Google Maps Bintang 5 dari tenant sebelum menyetujui pembebasan biaya admin.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {pendingPromoClaims.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingPromoClaims.map((claim) => {
                      const tenantName =
                        claim.user?.tenantProfile?.fullName || "Penghuni";
                      const roomNumber =
                        claim.invoice?.lease?.room?.number || "-";

                      return (
                        <div
                          key={claim.id}
                          className="bg-[#FAF2EA]/40 rounded-2xl p-4 border border-[#2C2825]/10 shadow-xs space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-[#1E1B18] text-sm">
                                {tenantName}
                              </p>
                              <p className="text-xs font-semibold text-[#5C564E] mt-0.5">
                                Kamar {roomNumber} · Periode{" "}
                                {formatPeriod(claim.invoice?.dueDate)}
                              </p>
                            </div>
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-bold rounded-lg px-2.5 py-0.5">
                              {claim.discountCode}
                            </Badge>
                          </div>

                          {claim.googleName && (
                            <p className="text-xs text-[#4A453F]">
                              <span className="text-[#5C564E] font-medium">Nama Akun Google: </span>
                              <span className="font-bold text-[#1E1B18]">
                                {claim.googleName}
                              </span>
                            </p>
                          )}

                          {/* Screenshot Preview */}
                          {claim.proofUrl && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-[#2C2825]/15 bg-white text-[#1E1B18] hover:bg-[#F2EDE9] text-xs font-semibold rounded-xl gap-2"
                                >
                                  <Eye className="h-3.5 w-3.5 text-[#8C6239]" />
                                  Lihat Screenshot Ulasan Google Maps
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="border-[#2C2825]/15 bg-white p-0 overflow-hidden sm:max-w-md rounded-2xl shadow-2xl">
                                <DialogTitle className="sr-only">Screenshot Ulasan Google</DialogTitle>
                                <div className="relative w-full aspect-[9/16] max-h-[70vh]">
                                  <Image
                                    src={claim.proofUrl}
                                    alt="Screenshot Ulasan Google"
                                    fill
                                    className="object-contain bg-black/50"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 border-t border-[#2C2825]/10">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = prompt("Alasan penolakan promo:");
                                if (reason) handleRejectPromo(claim.id);
                              }}
                              disabled={loadingClaimId === claim.id}
                              className="flex-1 border-red-300 text-red-700 hover:bg-red-50 bg-white font-bold text-xs rounded-xl gap-1.5"
                            >
                              <CircleX className="h-3.5 w-3.5" />
                              Tolak
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleApprovePromo(claim.id)}
                              disabled={loadingClaimId === claim.id}
                              className="flex-1 bg-[#714A23] hover:bg-[#5C3B1A] text-white font-bold text-xs rounded-xl shadow-sm gap-1.5"
                            >
                              {loadingClaimId === claim.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Setujui Promo
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[#4A453F] space-y-2">
                    <Gift className="h-10 w-10 mx-auto opacity-30 text-[#8C6239]" />
                    <p className="text-sm font-medium">
                      Tidak ada pengajuan klaim promo yang membutuhkan verifikasi saat ini.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
