"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  LayoutDashboard,
  Home as HomeIcon,
  Users,
  AlertTriangle,
  Download,
  Info,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const docSections: DocSection[] = [
  {
    id: "overview",
    title: "1. Overview & Dashboard",
    icon: LayoutDashboard,
    content: (
      <div className="space-y-4 text-xs text-foreground">
        <p className="leading-relaxed text-muted-foreground">
          Halaman <strong className="text-foreground font-semibold">Overview</strong> adalah pusat pemantauan operasional kost Anda secara real-time. Di sini Anda dapat melihat ringkasan status dalam satu kedipan mata.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Stat-Cards Ringkasan</h5>
              <p className="text-muted-foreground leading-relaxed">
                Menampilkan total kamar, kamar terisi, kamar tersedia, kamar dalam perbaikan, jumlah penghuni aktif, total tunggakan, dan keluhan aktif. Data ini dinamis dan langsung terhubung dengan database.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Okupansi Kost</h5>
              <p className="text-muted-foreground leading-relaxed">
                Terdapat visual occupancy rate (%) dalam bentuk progress bar untuk mengukur seberapa penuh kost-kostan Anda secara komparatif.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Aktivitas 3 Hari Terakhir</h5>
              <p className="text-muted-foreground leading-relaxed">
                Widget aktivitas terbaru memfilter peristiwa check-in, check-out, pengajuan keluhan, dan bukti bayar yang masuk dalam 3 hari terakhir secara kronologis.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "rooms",
    title: "2. Manajemen Kamar",
    icon: HomeIcon,
    content: (
      <div className="space-y-4 text-xs text-foreground">
        <p className="leading-relaxed text-muted-foreground">
          Menu <strong className="text-foreground font-semibold">Kamar</strong> memfasilitasi Anda untuk mengontrol unit, tipe, fasilitas, harga sewa, dan media 360° untuk virtual tour.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Bulk Update Status Kamar</h5>
              <p className="text-muted-foreground leading-relaxed">
                Pilih satu atau beberapa kamar lewat checkbox sebelah kiri nomor kamar. Gunakan Floating Action Bar di bawah layar untuk mengubah status massal menjadi <span className="text-secondary font-semibold">Tersedia</span>, <span className="text-primary font-semibold">Terisi</span>, atau <span className="text-amber-ochre font-semibold">Perbaikan</span> sekaligus.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Virtual Tour 360°</h5>
              <p className="text-muted-foreground leading-relaxed">
                Di halaman edit kamar, Anda dapat mengunggah panorama 360° ke CDN Cloudinary. Ini akan mengaktifkan interaksi Photo Sphere Viewer di halaman detail kamar publik untuk calon penyewa.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tenants",
    title: "3. Manajemen Penghuni",
    icon: Users,
    content: (
      <div className="space-y-4 text-xs text-foreground">
        <p className="leading-relaxed text-muted-foreground">
          Menu <strong className="text-foreground font-semibold">Penghuni</strong> digunakan untuk mengatur proses sewa, check-in, penyesuaian kamar (pindah kamar), dan check-out formal.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Check-In Baru</h5>
              <p className="text-muted-foreground leading-relaxed">
                Saat mendaftarkan penyewa baru, sistem otomatis membuat akun dengan username = No. HP utama dan password default = <code className="text-primary bg-primary/10 px-1 py-0.5 rounded font-mono">oskost + 4 digit terakhir No. HP</code> (contoh: <code className="text-primary bg-primary/10 px-1 py-0.5 rounded font-mono">oskost7890</code>). Sistem otomatis menerbitkan tagihan perdana dan masa kontrak sewa (`Lease`).
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Pindah Kamar (Room Reassignment)</h5>
              <p className="text-muted-foreground leading-relaxed">
                Anda bisa memindahkan kamar penghuni melalui form Edit Penghuni. Sistem secara cerdas akan: (1) Menyesuaikan nominal kontrak aktif dengan harga kamar baru, (2) Membebaskan status kamar lama menjadi `AVAILABLE`, dan (3) Mengunci status kamar baru menjadi `OCCUPIED`.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Safe Check-Out (Batal Kontrak)</h5>
              <p className="text-muted-foreground leading-relaxed">
                Tombol check-out akan menonaktifkan kontrak sewa, membebaskan kamar, tetapi tetap mempertahankan data profil &amp; riwayat transaksi penyewa di sistem untuk kebutuhan pelaporan keuangan masa depan.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "reports",
    title: "4. Laporan & Keluhan",
    icon: AlertTriangle,
    content: (
      <div className="space-y-4 text-xs text-foreground">
        <p className="leading-relaxed text-muted-foreground">
          Menu <strong className="text-foreground font-semibold">Laporan</strong> membantu Anda menanggapi keluhan fasilitas dari tenant yang dikirimkan via Flutter Mobile Sanctuary.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Status Tiket Keluhan</h5>
              <p className="text-muted-foreground leading-relaxed">
                Tiket keluhan terbagi menjadi tiga status utama: <span className="text-destructive font-semibold">Terbuka (OPEN)</span>, <span className="text-amber-ochre font-semibold">Diproses (IN_PROGRESS)</span>, dan <span className="text-secondary font-semibold">Selesai (RESOLVED)</span>.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Disposisi Staf &amp; Notifikasi Otomatis</h5>
              <p className="text-muted-foreground leading-relaxed">
                Setiap kali status keluhan diperbarui oleh admin atau ditugaskan ke teknisi, tenant akan secara otomatis menerima notifikasi di aplikasi mobile mereka.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "csv",
    title: "5. Ekspor Data (CSV)",
    icon: Download,
    content: (
      <div className="space-y-4 text-xs text-foreground">
        <p className="leading-relaxed text-muted-foreground">
          OSkost mendukung ekspor berkas data dalam format CSV yang kompatibel penuh dengan Microsoft Excel dan Google Sheets (menggunakan standar encoding UTF-8 BOM).
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">•</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Ekspor Overview Dashboard</h5>
              <p className="text-muted-foreground leading-relaxed">
                Mengekspor seluruh ringkasan statistik kost saat ini beserta daftar check-in, keluhan, dan pembayaran 3 hari terakhir dalam satu file CSV.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">•</span>
            <div>
              <h5 className="font-bold text-foreground mb-0.5">Ekspor Data Penghuni</h5>
              <p className="text-muted-foreground leading-relaxed">
                Mengekspor daftar seluruh penghuni (baik yang aktif maupun yang sudah checkout) lengkap dengan nama, nomor HP, email, status kamar, dan total tunggakan.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function AdminDocs() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <Card className="bg-card rounded-2xl border border-border shadow-xs h-full flex flex-col">
      <CardHeader className="space-y-1 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
          <CardTitle className="text-lg font-bold font-editorial text-foreground">
            Panduan &amp; Aturan Operasional Sistem
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Pelajari tata cara pengoperasian dashboard dan alur kerja aplikasi OsKost.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 flex-1">
        {/* Left Nav */}
        <div className="flex flex-col gap-1.5 border-r border-border pr-4 pb-4 md:pb-0 md:border-b-0 border-b">
          {docSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{sec.title}</span>
                </div>
                <ArrowRight
                  className={`size-3.5 transition-transform ${
                    isActive
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 min-h-[260px]">
          <AnimatePresence mode="wait">
            {docSections.map((sec) => {
              if (sec.id !== activeSection) return null;
              return (
                <motion.div
                  key={sec.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <h4 className="text-sm font-bold font-editorial text-foreground flex items-center gap-2 border-b border-border pb-3">
                    {sec.title}
                  </h4>
                  {sec.content}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>

      {/* Info Warning Tip */}
      <div className="p-4 bg-muted/30 border-t border-border flex items-center gap-2.5 text-xs text-muted-foreground rounded-b-2xl">
        <Info className="size-4 text-primary shrink-0" />
        <p>
          Butuh bantuan operasional atau peningkatan kapasitas kuota? Hubungi tim Customer Success OsKost melalui kontak resmi pengelola.
        </p>
      </div>
    </Card>
  );
}
