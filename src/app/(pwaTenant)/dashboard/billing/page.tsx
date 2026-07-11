import { auth } from "@/auth";
import {
  getTenantDashboardData,
  getTenantInvoices,
} from "@/features/tenant-pwa/tenant-pwa-service";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentUploadForm } from "@/features/tenant-pwa/components/payment-upload-form";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Landmark,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function TenantBillingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const dashboardData = await getTenantDashboardData(session.user.id);
  const invoices = await getTenantInvoices(session.user.id);

  if (!dashboardData) {
    return (
      <p className="text-zinc-500 text-center py-10">Data tidak ditemukan.</p>
    );
  }

  const { activeLease, currentInvoice } = dashboardData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Tagihan & Pembayaran
        </h1>
        <p className="text-xs text-zinc-400">
          Bayar tagihan kost bulanan Anda secara online & praktis.
        </p>
      </div>

      {/* 1. Active Unpaid/Pending Bill */}
      {currentInvoice && currentInvoice.status !== "PAID" ? (
        <div className="space-y-4">
          <Card
            className={`border shadow-md backdrop-blur-md ${
              currentInvoice.status === "UNPAID" ||
              currentInvoice.status === "OVERDUE"
                ? "bg-amber-500/5 border-amber-500/10"
                : "bg-blue-500/5 border-blue-500/10"
            }`}
          >
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-zinc-400">
                    Total Tagihan Bulan Ini
                  </p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">
                    {formatCurrency(currentInvoice.amount)}
                  </p>
                </div>
                <div className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {currentInvoice.status === "UNPAID" && (
                    <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <Clock className="h-3 w-3" /> Belum Bayar
                    </span>
                  )}
                  {currentInvoice.status === "OVERDUE" && (
                    <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="h-3 w-3" /> Jatuh Tempo
                    </span>
                  )}
                  {currentInvoice.status === "PENDING" && (
                    <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
                      <Clock className="h-3 w-3" /> Menunggu Konfirmasi
                    </span>
                  )}
                </div>
              </div>

              {/* Rincian Tagihan */}
              <div className="space-y-2 border-t border-zinc-800 pt-3 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Sewa Kamar</span>
                  <span className="text-zinc-200">
                    {formatCurrency(currentInvoice.rentAmount)}
                  </span>
                </div>
                {currentInvoice.utilityAmount > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Tagihan Listrik / Air</span>
                    <span className="text-zinc-200">
                      {formatCurrency(currentInvoice.utilityAmount)}
                    </span>
                  </div>
                )}
                {currentInvoice.otherAmount > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Lain-lain (Sampah & Keamanan)</span>
                    <span className="text-zinc-200">
                      {formatCurrency(currentInvoice.otherAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white border-t border-zinc-850 pt-2 text-sm">
                  <span>Total Bayar</span>
                  <span className="text-secondary">
                    {formatCurrency(currentInvoice.amount)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-zinc-500 border-t border-zinc-800/80 pt-3 flex items-center justify-between">
                <span>Batas Jatuh Tempo</span>
                <span className="font-semibold text-zinc-300">
                  {formatDate(currentInvoice.dueDate)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Instruksi Transfer Bank */}
          {currentInvoice.status !== "PENDING" && (
            <Card className="border-zinc-800 bg-zinc-900/30 shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Landmark className="h-4 w-4 text-secondary" />
                  <span>Petunjuk Transfer Bank</span>
                </div>
                <div className="rounded-xl bg-zinc-950/60 p-3 text-xs space-y-1.5 border border-zinc-900">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Nama Bank</span>
                    <span className="font-bold text-zinc-350">Mandiri</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Nomor Rekening</span>
                    <span className="font-bold text-white font-mono">
                      8690-1234-5678
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Atas Nama</span>
                    <span className="font-bold text-zinc-350">Rinaldi</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Upload Bukti */}
          {currentInvoice.status !== "PENDING" ? (
            <div className="space-y-4">
              {currentInvoice.adminNote && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                  <div className="flex items-center gap-1.5 mb-1 font-bold text-red-400">
                    <AlertTriangle className="size-4" />
                    Pembayaran Ditolak
                  </div>
                  {currentInvoice.adminNote}
                </div>
              )}
              <PaymentUploadForm
                invoiceId={currentInvoice.id}
                userId={session.user.id}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center text-xs text-zinc-400">
              Bukti pembayaran Anda sudah diterima. Kami sedang melakukan
              verifikasi data secepatnya.
            </div>
          )}
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/40 shadow-lg py-6 text-center">
          <CardContent className="p-4 space-y-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-secondary" />
            <h2 className="font-bold text-white text-base">
              Semua Tagihan Lunas
            </h2>
            <p className="text-xs text-zinc-400">
              Hebat! Anda tidak memiliki tunggakan pembayaran. Tagihan
              berikutnya akan terbit bulan depan.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 2. Invoice History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wide text-zinc-400 uppercase">
          Riwayat Pembayaran
        </h2>
        {invoices.length > 0 ? (
          <div className="space-y-2">
            {invoices.map((inv) => {
              const formattedMonth = new Date(inv.dueDate).toLocaleDateString(
                "id-ID",
                {
                  month: "long",
                  year: "numeric",
                },
              );
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 border border-zinc-900 bg-zinc-900/10 rounded-xl"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">
                      Bulan {formattedMonth}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Jatuh Tempo:{" "}
                      {new Date(inv.dueDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-bold text-zinc-350">
                      {formatCurrency(inv.amount)}
                    </p>
                    <div>
                      {inv.status === "PAID" && (
                        <span className="text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-semibold">
                          Lunas
                        </span>
                      )}
                      {inv.status === "PENDING" && (
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                          Diproses
                        </span>
                      )}
                      {inv.status === "UNPAID" && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-semibold">
                          Belum Lunas
                        </span>
                      )}
                      {inv.status === "OVERDUE" && (
                        <span className="text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-semibold">
                          Terlambat
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-center py-4">
            Belum ada histori pembayaran.
          </p>
        )}
      </div>
    </div>
  );
}
