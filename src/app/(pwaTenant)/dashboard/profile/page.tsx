import { auth } from "@/auth";
import { getTenantDashboardData } from "@/features/tenant-pwa/tenant-pwa-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/features/tenant-pwa/components/change-password-form";
import { LogoutButton } from "@/components/tenant/logout-button";
import { User, Phone, Mail, MapPin, ShieldAlert, FileText, HelpCircle } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TenantProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const data = await getTenantDashboardData(session.user.id);
  if (!data) {
    return <p className="text-zinc-500 text-center py-10">Data tidak ditemukan.</p>;
  }

  const { user } = data;

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight">Profil Saya</h1>
        <p className="text-xs text-zinc-400">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      {/* Profile Info Card */}
      <Card className="border-zinc-900 bg-zinc-900/10 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-900 pb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">{user.fullName}</h2>
              <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">Penghuni Kost</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-500">Nomor HP</p>
                <p className="font-semibold text-zinc-300">{user.phoneNumber || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-500">Email</p>
                <p className="font-semibold text-zinc-300">{user.email || "-"}</p>
              </div>
            </div>

            {user.ktpNumber && (
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500">Nomor KTP</p>
                  <p className="font-semibold text-zinc-300">{user.ktpNumber}</p>
                </div>
              </div>
            )}

            {user.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500">Alamat KTP</p>
                  <p className="font-semibold text-zinc-300 leading-normal">{user.address}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {(user.emergencyContactName || user.emergencyContactNumber) && (
        <Card className="border-zinc-900 bg-zinc-900/10 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldAlert className="h-4 w-4 text-zinc-450" />
              <span>Kontak Darurat</span>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-3 text-xs space-y-2">
              <div>
                <span className="text-[10px] text-zinc-500 block">Hubungan / Nama</span>
                <span className="font-bold text-zinc-300">{user.emergencyContactName || "-"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Nomor HP Darurat</span>
                <span className="font-bold text-zinc-300">{user.emergencyContactNumber || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help & FAQ Section */}
      <Card className="border-zinc-900 bg-zinc-900/10 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HelpCircle className="h-4 w-4 text-secondary" />
            <span>Butuh Bantuan?</span>
          </div>
          <p className="text-xs text-zinc-400">
            Lihat panduan pembayaran, laporan keluhan, dan aturan umum kost.
          </p>
          <Button
            asChild
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-900/20 hover:text-white py-2.5 font-semibold text-xs transition-all rounded-xl"
          >
            <Link href="/dashboard/help">
              Buka Panduan & FAQ
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <ChangePasswordForm />

      {/* Logout Action — membersihkan cache PWA sebelum sign out */}
      <LogoutButton />
    </div>
  );
}
