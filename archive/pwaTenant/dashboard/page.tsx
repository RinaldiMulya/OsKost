import { auth } from "@/auth";
import { getTenantDashboardData } from "@/features/tenant-pwa/tenant-pwa-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  CreditCard,
  AlertTriangle,
  User,
  Calendar,
  Home,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingTour } from "@/components/shared/onboarding-tour";

export default async function TenantDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const data = await getTenantDashboardData(session.user.id);
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-zinc-400">Data tidak ditemukan.</p>
      </div>
    );
  }

  const { user, activeLease, currentInvoice } = data;

  // Formatting currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Determine Greeting based on time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return "Selamat Pagi";
    if (hours < 15) return "Selamat Siang";
    if (hours < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Remaining days calculation
  const getRemainingLeaseDays = () => {
    if (!activeLease || !activeLease.endDate) return null;
    const diffTime =
      new Date(activeLease.endDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const remainingDays = getRemainingLeaseDays();

  return (
    <div className="space-y-5 pb-6">
      <OnboardingTour
        storageKey="oskost_pwa_tenant_tour_completed"
        steps={[
          {
            title: "Selamat Datang di PWA Tenant OsKost!",
            description: "Aplikasi khusus penghuni untuk kemudahan mengecek status sewa, tagihan bulanan, dan laporan keluhan langsung dari HP Anda.",
            badge: "Panduan Tenant (1/4)"
          },
          {
            title: "Informasi Sewa & Sisa Kontrak",
            description: "Pantau nomor kamar aktif dan sisa hari masa sewa Anda yang diperbarui secara otomatis.",
            badge: "Panduan Tenant (2/4)"
          },
          {
            title: "Pembayaran Online Midtrans & Promo Google Review",
            description: "Bayar sewa via Transfer VA / QRIS otomatis, serta klaim promo bebas biaya admin dengan mengulas Google Review Bintang 5.",
            badge: "Panduan Tenant (3/4)"
          },
          {
            title: "Laporan Kerusakan & Profil",
            description: "Ajukan laporan jika ada fasilitas kamar yang rusak dan pantau status perbaikannya secara real-time.",
            badge: "Panduan Tenant (4/4)"
          }
        ]}
      />
      {/* Welcome Message */}
      <div className="space-y-1">
        <p className="text-sm text-zinc-400 font-medium">{getGreeting()},</p>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {user.fullName}
        </h1>
      </div>

      {/* Room Details Card */}
      {activeLease ? (
        <Card className="border-zinc-800 bg-zinc-900/40 shadow-lg backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Kamar Anda</p>

                <p className="text-sm font-semibold text-white">
                  Kamar {activeLease.room.number} — {activeLease.room.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {activeLease.room.propertyName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-500/20 bg-red-500/5 shadow-lg backdrop-blur-md">
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-sm font-medium text-red-400">
              Kontrak Sewa Tidak Aktif
            </p>
            <p className="text-xs text-zinc-400">
              Anda belum memiliki kamar aktif. Silakan hubungi Admin untuk
              proses Check-in.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bill Status Section */}
      {activeLease && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold tracking-wide text-zinc-400 uppercase">
            Tagihan Anda
          </h2>
          {currentInvoice ? (
            <Card
              className={`border-zinc-800 backdrop-blur-md shadow-lg ${
                currentInvoice.status === "UNPAID" ||
                currentInvoice.status === "OVERDUE"
                  ? "bg-amber-500/5 border-amber-500/10"
                  : currentInvoice.status === "PENDING"
                    ? "bg-blue-500/5 border-blue-500/10"
                    : "bg-emerald-500/5 border-emerald-500/10"
              }`}
            >
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-400">
                      Tagihan Bulan{" "}
                      {new Date(currentInvoice.dueDate).toLocaleDateString(
                        "id-ID",
                        { month: "long", year: "numeric" },
                      )}
                    </p>
                    <p className="text-xl font-extrabold text-white mt-1">
                      {formatCurrency(currentInvoice.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {currentInvoice.status === "UNPAID" && (
                      <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Clock className="h-3 w-3" /> Belum Bayar
                      </span>
                    )}
                    {currentInvoice.status === "OVERDUE" && (
                      <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="h-3 w-3" /> Jatuh Tempo
                      </span>
                    )}
                    {currentInvoice.status === "PENDING" && (
                      <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        <Clock className="h-3 w-3" /> Menunggu Konfirmasi
                      </span>
                    )}
                    {currentInvoice.status === "PAID" && (
                      <span className="flex items-center gap-1 text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Lunas
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-3">
                  <p>
                    Jatuh Tempo:{" "}
                    {new Date(currentInvoice.dueDate).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                  {currentInvoice.status !== "PAID" &&
                    currentInvoice.status !== "PENDING" && (
                      <Link
                        href="/dashboard/billing"
                        className="text-secondary font-semibold flex items-center gap-0.5 hover:underline"
                      >
                        Bayar Sekarang <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-zinc-800 bg-zinc-900/40 shadow-lg backdrop-blur-md">
              <CardContent className="p-4 text-center py-6">
                <CheckCircle2 className="mx-auto h-8 w-8 text-secondary mb-2" />
                <p className="text-sm font-medium text-white">
                  Semua Tagihan Lunas
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Anda tidak memiliki tagihan aktif saat ini.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Contract Duration Card */}
      {activeLease && activeLease.endDate && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold tracking-wide text-zinc-400 uppercase">
            Durasi Sewa
          </h2>
          <Card className="border-zinc-800 bg-zinc-900/40 shadow-lg backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Masa Kontrak Habis</p>
                  <p className="text-sm font-semibold text-white">
                    {new Date(activeLease.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {remainingDays !== null && (
                <div className="text-right">
                  <p className="text-lg font-extrabold text-secondary">
                    {remainingDays}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    Hari Tersisa
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shortcut Menu Grid */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold tracking-wide text-zinc-400 uppercase">
          Menu Utama
        </h2>
        <div
          className={`grid ${activeLease ? "grid-cols-3" : "grid-cols-2"} gap-3`}
        >
          <Link href="/dashboard/billing" className="block">
            <Card className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors shadow-md text-center py-4 cursor-pointer">
              <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-zinc-200">
                  Tagihan
                </span>
              </CardContent>
            </Card>
          </Link>

          {activeLease && (
            <Link href="/dashboard/reports" className="block">
              <Card className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors shadow-md text-center py-4 cursor-pointer">
                <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-zinc-200">
                    Lapor
                  </span>
                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/dashboard/profile" className="block">
            <Card className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors shadow-md text-center py-4 cursor-pointer">
              <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-zinc-200">
                  Profil
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
