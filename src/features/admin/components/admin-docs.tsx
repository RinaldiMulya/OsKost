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
  icon: any;
  content: React.ReactNode;
}

const docSections: DocSection[] = [
  {
    id: "overview",
    title: "1. Overview & Dashboard",
    icon: LayoutDashboard,
    content: (
      <div className="space-y-4 text-xs text-zinc-300">
        <p className="leading-relaxed">
          Halaman <span className="text-white font-semibold">Overview</span> adalah pusat pemantauan operasional kost Anda secara real-time. Di sini Anda dapat melihat ringkasan status dalam satu kedipan mata.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">1</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Stat-Cards Ringkasan</h5>
              <p className="text-zinc-450 leading-relaxed">
                Menampilkan total kamar, kamar terisi, kamar tersedia, kamar dalam perbaikan, jumlah penghuni aktif, total tunggakan, dan keluhan aktif. Data ini dinamis dan langsung terhubung dengan database.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">2</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Okupansi Kost</h5>
              <p className="text-zinc-450 leading-relaxed">
                Terdapat visual occupancy rate (%) dalam bentuk progress bar untuk mengukur seberapa penuh kost-kostan Anda secara komparatif.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">3</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Aktivitas 3 Hari Terakhir</h5>
              <p className="text-zinc-450 leading-relaxed">
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
      <div className="space-y-4 text-xs text-zinc-300">
        <p className="leading-relaxed">
          Menu <span className="text-white font-semibold">Kamar</span> memfasilitasi Anda untuk mengontrol unit, tipe, fasilitas, harga sewa, dan media 360° untuk virtual tour.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">1</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Bulk Update Status Kamar</h5>
              <p className="text-zinc-450 leading-relaxed">
                Pilih satu atau beberapa kamar lewat checkbox sebelah kiri nomor kamar. Gunakan Floating Action Bar di bawah layar untuk mengubah status massal menjadi <span className="text-emerald-400 font-medium">Tersedia</span>, <span className="text-blue-400 font-medium">Terisi</span>, atau <span className="text-amber-400 font-medium">Perbaikan</span> sekaligus.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">2</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Virtual Tour 360°</h5>
              <p className="text-zinc-450 leading-relaxed">
                Di halaman edit kamar, Anda dapat mengunggah panorama 360° ke folder publik Supabase. Ini akan mengaktifkan interaksi Photo Sphere Viewer di halaman detail kamar publik untuk calon penyewa.
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
      <div className="space-y-4 text-xs text-zinc-300">
        <p className="leading-relaxed">
          Menu <span className="text-white font-semibold">Penghuni</span> digunakan untuk mengatur proses sewa, check-in, penyesuaian kamar (pindah kamar), dan check-out formal.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">1</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Check-In Baru</h5>
              <p className="text-zinc-450 leading-relaxed">
                Saat mendaftarkan penyewa baru, sistem otomatis membuat akun dengan username = No. HP utama dan password default = <code className="text-secondary bg-secondary/5 px-1 py-0.5 rounded font-mono">oskost + 4 digit terakhir No. HP</code> (contoh: <code className="text-secondary bg-secondary/5 px-1 py-0.5 rounded font-mono">oskost7890</code>). Sistem otomatis menerbitkan tagihan/invoice perdana dan masa kontrak sewa (`Lease`).
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">2</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Pindah Kamar (Room Reassignment)</h5>
              <p className="text-zinc-450 leading-relaxed">
                Anda bisa memindahkan kamar penghuni melalui form Edit Penghuni. Sistem secara cerdas akan: (1) Menyesuaikan nominal kontrak aktif dengan harga kamar baru, (2) Membebaskan status kamar lama menjadi `AVAILABLE`, dan (3) Mengunci status kamar baru menjadi `OCCUPIED`.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">3</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Safe Check-Out (Batal Kontrak)</h5>
              <p className="text-zinc-455 leading-relaxed">
                Tombol check-out akan menonaktifkan kontrak sewa, membebaskan kamar, tetapi tetap mempertahankan data profil & riwayat transaksi penyewa di sistem untuk kebutuhan pelaporan keuangan masa depan.
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
      <div className="space-y-4 text-xs text-zinc-300">
        <p className="leading-relaxed">
          Menu <span className="text-white font-semibold">Laporan</span> membantu Anda menanggapi keluhan fasilitas dari tenant yang dikirimkan via PWA.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">1</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Status Tiket Keluhan</h5>
              <p className="text-zinc-450 leading-relaxed">
                Tiket keluhan terbagi menjadi tiga status utama: <span className="text-red-400 font-medium">Terbuka (OPEN)</span>, <span className="text-amber-400 font-medium">Diproses (IN_PROGRESS)</span>, dan <span className="text-emerald-400 font-medium">Selesai (RESOLVED)</span>.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">2</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Notifikasi Otomatis</h5>
              <p className="text-zinc-450 leading-relaxed">
                Setiap kali status keluhan diperbarui oleh admin, tenant akan secara otomatis menerima notifikasi Web Push & In-App di handphone mereka secara real-time.
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
      <div className="space-y-4 text-xs text-zinc-300">
        <p className="leading-relaxed">
          OSkost mendukung ekspor berkas data dalam format CSV yang kompatibel penuh dengan Microsoft Excel dan Google Sheets (menggunakan standar encoding UTF-8 BOM).
        </p>
        <div className="space-y-3">
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">•</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Ekspor Overview Dashboard</h5>
              <p className="text-zinc-450 leading-relaxed">
                Mengekspor seluruh ringkasan statistik kost saat ini beserta daftar check-in, keluhan, dan pembayaran 3 hari terakhir dalam satu file CSV terkompresi.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">•</span>
            <div>
              <h5 className="font-bold text-white mb-0.5">Ekspor Data Penghuni</h5>
              <p className="text-zinc-450 leading-relaxed">
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
    <Card className="border-zinc-850 bg-zinc-950/40 backdrop-blur-md shadow-xl rounded-2xl h-full flex flex-col">
      <CardHeader className="space-y-1 pb-4 border-b border-zinc-900">
        <div className="flex items-center gap-2 text-secondary">
          <BookOpen className="h-5 w-5" />
          <CardTitle className="text-lg font-bold text-white">Panduan &amp; Aturan Sistem</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Pelajari tata cara pengoperasian dashboard dan alur kerja aplikasi OSkost.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 flex-1">
        {/* Left Nav */}
        <div className="flex flex-col gap-1 border-r border-zinc-900/60 pr-4 pb-2 md:pb-0 md:border-b-0 border-b">
          {docSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all group ${
                  isActive
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{sec.title}</span>
                </div>
                <ArrowRight className={`h-3 w-3 transition-transform ${
                  isActive ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                }`} />
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 min-h-[220px]">
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
                  <h4 className="text-xs font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-2">
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
      <div className="p-3 bg-zinc-900/20 border-t border-zinc-900 flex gap-2 text-[10px] text-zinc-450 rounded-b-2xl">
        <Info className="h-4 w-4 text-zinc-550 shrink-0" />
        <p>
          Butuh bantuan teknis server atau konfigurasi database? Silakan hubungi tim IT Developer melalui kanal privat yang disediakan pengelola.
        </p>
      </div>
    </Card>
  );
}
