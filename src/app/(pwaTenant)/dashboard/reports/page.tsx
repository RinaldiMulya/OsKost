import { auth } from "@/auth";
import { getTenantReports, getTenantDashboardData } from "@/features/tenant-pwa/tenant-pwa-service";
import { Card, CardContent } from "@/components/ui/card";
import { ReportDialogForm } from "@/features/tenant-pwa/components/report-dialog-form";
import { Wrench, CheckCircle2, Clock, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function TenantReportsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [reports, dashboardData] = await Promise.all([
    getTenantReports(session.user.id),
    getTenantDashboardData(session.user.id),
  ]);

  const hasActiveLease = !!dashboardData?.activeLease;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight">Lapor Kerusakan</h1>
        <p className="text-xs text-zinc-400">Ajukan keluhan kerusakan fasilitas kamar atau area kost.</p>
      </div>

      {/* Button to open Dialog Form or Inactive Notice */}
      {hasActiveLease ? (
        <ReportDialogForm userId={session.user.id} />
      ) : (
        <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
          <CardContent className="p-4 text-center space-y-1">
            <p className="text-xs font-semibold text-amber-400">Kontrak Sewa Tidak Aktif</p>
            <p className="text-xs text-zinc-400">
              Anda tidak dapat mengajukan laporan baru karena tidak sedang menyewa kamar aktif.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wide text-zinc-400 uppercase">Daftar Laporan Saya</h2>

        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((rep) => (
              <Card key={rep.id} className="border-zinc-900 bg-zinc-900/10 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-white leading-tight">{rep.title}</h3>
                    <div>
                      {rep.status === "OPEN" && (
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> Terbuka
                        </span>
                      )}
                      {rep.status === "IN_PROGRESS" && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                          <Wrench className="h-2.5 w-2.5" /> Diproses
                        </span>
                      )}
                      {rep.status === "RESOLVED" && (
                        <span className="text-[9px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Selesai
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-450 leading-relaxed whitespace-pre-line">
                    {rep.description}
                  </p>

                  {/* Photo attachment preview if any */}
                  {rep.photoUrl && (
                    <div className="relative aspect-video w-full max-h-36 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rep.photoUrl}
                        alt={rep.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2 flex items-center justify-between">
                    <span>Laporan ID: #{rep.id.slice(-6).toUpperCase()}</span>
                    <span>{formatDate(rep.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-zinc-900 bg-zinc-900/10 py-10 text-center shadow-inner">
            <CardContent className="p-4 space-y-2">
              <Wrench className="mx-auto h-10 w-10 text-zinc-650" />
              <h3 className="text-sm font-bold text-zinc-400">Belum ada laporan</h3>
              <p className="text-xs text-zinc-550 max-w-xs mx-auto">
                Fasilitas kamar Anda dalam kondisi prima. Klik tombol di atas jika ada kerusakan.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
