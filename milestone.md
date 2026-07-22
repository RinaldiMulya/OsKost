# Project Milestone: OsKost (Smartkost Pulo Jahe System)

Dokumen ini memantau progres pengembangan fitur dan modul di aplikasi OsKost dari awal hingga selesai.

## 📌 Panduan Status
- `[x]` = Selesai
- `[/]` = Sedang Dikerjakan
- `[ ]` = Belum Dimulai
- `[-]` = Ditunda (On Hold)

---

## FASE 1: ADMIN DASHBOARD (WEB) — Prioritas Utama

### 1. Inisiasi & Setup
- [x] Inisiasi proyek Next.js 16 (App Router)
- [x] Konfigurasi UI (Tailwind CSS v4, Shadcn/ui, Lucide Icons)
- [x] Setup arsitektur folder Feature-Sliced Design (`src/app`, `src/features`)
- [x] Konfigurasi Database (PostgreSQL + Prisma v7)
- [x] Konfigurasi Supabase (Storage Private & Public Bucket)
- [x] Setup Autentikasi NextAuth.js v5 (Login/Logout Admin)
- [x] Middleware proteksi route `/admin/*`

### 2. Dashboard Admin Overview
- [x] Halaman Overview Dashboard Admin (`/admin`)
- [x] Tampilan stat-card (Total Kamar, Terisi, Tersedia, Maintenance, Penghuni, Tunggakan, Laporan)
- [x] Integrasi Database real untuk `getDashboardStats()` via Prisma
- [x] Widget "Aktivitas Terbaru" yang dinamis (check-in/check-out/pembayaran terbaru)
- [x] Widget "Kamar Akan Habis Kontrak" (< 30 hari)
- [x] Statistik Occupancy Rate (%) visual progress bar
- [ ] Export data penghuni ke CSV/Excel

### 3. Manajemen Kamar (Room Management)
- [x] Schema database Kamar (`Room`, `RoomType`, `RoomImage`, `Property`)
- [x] Halaman Daftar Kamar dengan Filter & Search
- [x] Sistem Pagination (Server-side) & Aggregasi Statistik
- [x] Form Tambah/Edit Kamar
- [x] Halaman Detail Kamar
- [x] Upload Foto Kamar ke Supabase Storage
- [x] Integrasi 360° Photo Sphere Viewer
- [ ] Bulk update status kamar (AVAILABLE / OCCUPIED / MAINTENANCE)

### 4. Manajemen Penghuni (Tenant Management)
- [x] Schema database (`User`, `TenantProfile`, `Lease`, `Invoice`)
- [x] Halaman Daftar Penghuni dengan Search (debounced) & Filter Status
- [x] Expandable Row: Detail kontak darurat, kontrak, dan tagihan aktif
- [x] Proses Check-in (Form Tambah Penghuni + Buat Lease)
- [x] Edit Data Penghuni (Form Edit)
- [x] Aksi Tandai Lunas Tagihan dari dashboard tenant
- [x] Aksi Reset Password Penghuni
- [x] Aksi Kirim Reminder Tagihan (via notifikasi/WhatsApp — placeholder)
- [x] Tampilkan status terpisah: Kolom Sewa & Kontrak (Aktif/Hampir Habis/Habis/Checked-out) + Kolom Pembayaran dinamis bulanan (Paid/Unpaid + nama bulan)
- [x] Tampilkan Foto KTP penghuni (via Signed URL Supabase)
- [x] Riwayat semua tagihan/pembayaran per penghuni
- [x] Proses Checkout formal (Ubah status Lease ke nonaktif)
- [-] Sorting tabel (ditunda — jumlah penyewa aktif masih sedikit ~11)
- [-] Pagination tabel penghuni (ditunda — jumlah penyewa aktif masih sedikit ~11)


### 5. Keuangan & Tagihan
- [-] Halaman Daftar Tagihan (Filter: Lunas, Belum Lunas, Tunggakan) — ditunda sampai MVP selesai
- [-] Pembuatan Tagihan Bulanan Otomatis (Cron Job / Scheduled Action) — ditunda
- [-] Cetak/Download Bukti Pembayaran (Receipt PDF) — ditunda
- [-] Laporan Keuangan Bulanan & Tahunan (Ringkasan Pemasukan) — ditunda
- [-] Grafik Revenue Trend per bulan/tahun — ditunda

### 6. Laporan Keluhan & Maintenance
- [x] Schema database Laporan (`Report`, `ReportImage`) — Model `Report` sudah ada di Prisma schema
- [x] Halaman Manajemen Tiket Keluhan (Open, In Progress, Resolved)
- [x] Form Admin Catat Keluhan/Kerusakan baru (dengan pilih tenant aktif)
- [x] Upload Foto Kerusakan ke Supabase Storage (bucket `Oskost-Data-Public/reports/admin`)
- [x] Sinkronisasi cache antara Admin Dashboard dan PWA Tenant (dua arah)

### 7. Pengaturan (Settings)
- [-] Halaman Pengaturan Profil Admin — ditunda sampai OTP terverifikasi
- [-] Pengaturan Data Properti/Kost (Nama, Alamat, Lokasi) — ditunda
- [-] Pengaturan Notifikasi (WhatsApp API / Email) — ditunda sampai OTP terverifikasi

### 8. Synchronize Data
- [x] Data Overview/home harus sudah realtime dan sesuai dari data yg memang sudah ada dan sudah akurat
- [x] Data Manajement Room harus sudah realtime saat di tambahkan atau di hapus, diubah status.
- [x] Data Manajement Tenant sudah realtime saat di tambahkan atau di hapus, diubah status.
- [-] Data Keuangan harus sudah benar benar akurat dan realtime — ditunda (modul keuangan di-skip)
- [x] Data Laporan harus sudah benar benar akurat dan realtime.

---

## FASE 2: PWA TENANT (Mobile-First) — Prioritas Berikutnya

> **Konteks:** Target pengguna adalah pekerja pabrik usia 20–30 tahun yang mengakses dari HP Android entry-level. Desain harus **mobile-first**, simpel, dan cepat (FCP < 1.5s).

### 8. Setup PWA & Infrastruktur Tenant
- [x] Konfigurasi `manifest.json` (PWA: App Name, Icon, Theme Color via dynamic `manifest.ts`)
- [x] Setup `next-pwa` atau konfigurasi Service Worker untuk offline support (via manual `sw.js` & offline fallback page)
- [x] Route Group Tenant `/tenant/*` dengan layout terpisah dari admin (via group `(pwaTenant)` & `/dashboard`)
- [x] Middleware autentikasi untuk role `TENANT` (berbeda dari ADMIN)
- [x] Halaman Login khusus Tenant (email/password atau phone number login di `/login`)

### 9. Halaman Utama Tenant (Home / Dashboard Tenant)
- [x] Tampilan selamat datang dengan nama penghuni & nomor kamar
- [x] Status tagihan bulan berjalan (Lunas / Belum Lunas) yang menonjol
- [x] Informasi singkat kontrak (Sisa hari/bulan)
- [x] Shortcut menu: Tagihan, Laporan, Profil

### 10. Modul Tagihan Tenant (Billing — Tenant View)
- [x] Halaman Cek Tagihan bulan berjalan
- [x] Riwayat Tagihan (histori bulan-bulan lalu: Lunas / Tunggak)
- [x] Upload Bukti Pembayaran (Foto transfer dari kamera/galeri HP via Supabase Storage)
- [x] Status upload: Menunggu Konfirmasi Admin / Dikonfirmasi (status PENDING/PAID)
- [] Export history data Pembayaran ke CSV/Excel untuk tenant

### 11. Modul Laporan Kerusakan (Report — Tenant View)
- [x] Form Lapor Kerusakan (deskripsi teks + foto dari kamera/galeri via Supabase)
- [x] Halaman Daftar Laporan Saya (status: Open / In Progress / Resolved)
- [ ] Notifikasi ketika laporan direspon Admin

### 12. Profil & Akun Tenant
- [x] Halaman Profil Penghuni (tampilkan data diri, nomor kamar, kontak darurat)
- [x] Fitur Ganti Password sendiri
- [x] Inactive Dashboard PWA (dukungan login untuk mantan penyewa yang sudah checkout untuk akses riwayat)
- [x] Flow Returning Tenant pada Check-In Admin (re-use akun lama penyewa tanpa error duplikasi)
- [ ] Halaman Bantuan / FAQ singkat

### 13. Notifikasi & Sinkronisasi
- [x] Push Notification untuk pengingat seluruh kegiatan & tagihan tenant (via PWA Web Push API)
- [x] In-App Notification Bell & Centralized Notification Service (`sendNotification`)
- [x] Notifikasi otomatis ke Tenant saat pembayaran dikonfirmasi Lunas / Ditolak oleh Admin
- [-] Sync real-time status tagihan via SSE (ditunda)

---

## FASE 3: LANDING PAGE (Marketing) — Paralel / Opsional

### 14. Landing Page Publik
- [x] Halaman utama Landing Page (`/`)
- [x] Katalog Kamar dengan label "Tersedia" / "Penuh" (real-time dari DB)
- [x] Integrasi 360° Viewer di halaman detail kamar publik
- [x] Halaman Kontak / WhatsApp CTA untuk calon penghuni
- [x] SEO Optimization (Metadata, sitemap, robots.txt, JSON-LD)
- [x] `robots.ts` & `sitemap.ts` dasar
- [-] impelemtasi ReactTour saat pertama kali di buka website Oskost ini
- [x] Buat Section sebelum footer untuk "tata cara memesan kamar dari website",
- [x] dibawah section "Tata cara Memesan" ada section Maps yg cukup besar untuk memberitahu lokasi kost kostan nya beserta 11 lokasi kost tersebut(kalau memungkinkan) 
- [x] Nanti kedepan nya saat sudah lounching dan benar benar ada penghuni saya akan tambahkan section review & testimoni dari pengunjung realtime langsung dari PWA para tenant nya.
- [x] dibawah section maps akan ada section Bantuan/faq standar

---

## FASE 4: OPTIMIZATION & PERFORMANCE

### 15. Data Fetching Optimization
- [x] Centralized Cache Tags (`src/lib/cache-tags.ts`) — single source of truth untuk semua cache tag
- [x] React `cache()` untuk request deduplication (layout + page share query = 1 DB hit)
- [x] `unstable_cache` untuk server-side caching antar requests (PWA Tenant, Admin Tenants, Admin Rooms)
- [x] On-demand revalidation konsisten via `updateTag()` di semua Server Actions
- [x] Landing Page full cache (TTL: 24 jam, invalidasi on-demand saat ada perubahan kamar)
- [x] Hapus `force-dynamic` yang kontra-produktif di Admin Dashboard
- [x] Connection pool `max: 10` untuk membatasi koneksi dari sisi app
- [x] Fix deprecated `appIsrStatus` di `next.config.ts` (Next.js 16 compatibility)

---

## FASE 5: PWA IMPLEMENTATION & CONFIGURATION (Tahap Akhir)

### 16. Setup & Registrasi PWA
- [ ] Konfigurasi `@ducanh2912/next-pwa` di `next.config.ts` (Disable di Dev mode / Turbopack)
- [ ] Pembuatan `manifest.json` (scope: `/`, start_url: `/dashboard`)
- [ ] Registrasi metadata PWA eksklusif di `src/app/(pwaTenant)/layout.tsx` (Ring-Fencing)
- [ ] Setup Workbox Strategies (Network First untuk Billing, Background Sync untuk Reports)
- [ ] Implementasi script pembersihan cache PWA saat aksi Logout pengguna
- [ ] untuk Lebih detail mengenai PWA implementasi terbarunya bisa di lihat di @/D:\Local-Project\oskost\PWA_ARCHITECTURE_INSTRUCTIONS.md

---

## 📊 Ringkasan Progress

| Fase | Deskripsi | Status |
|------|-----------|--------|
| Fase 1 | Admin Dashboard (Web) | [/] In Progress |
| Fase 2 | PWA Tenant (Mobile) | [/] In Progress |
| Fase 3 | Landing Page (Marketing) | [/] Sebagian |
| Fase 4 | Optimization & Performance | [x] Data Fetching Selesai |
| Fase 5 | PWA Implementation | [ ] Menunggu Fase 1-4 |

---

*Diperbarui: 2026-07-17 — Pengalihan tombol hapus menjadi Check-out formal, penambahan info kontak utama di tabel penyewa & panel expanded, penambahan tombol check-out cepat, dan update CV Rinaldi Mulya Pratama dengan entri proyek OsKost beserta pembaruan bagian Skills.*
