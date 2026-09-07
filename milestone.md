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
- [x] Export data penghuni ke CSV/Excel

### 3. Manajemen Kamar (Room Management)
- [x] Schema database Kamar (`Room`, `RoomType`, `RoomImage`, `Property`)
- [x] Halaman Daftar Kamar dengan Filter & Search
- [x] Sistem Pagination (Server-side) & Aggregasi Statistik
- [x] Form Tambah/Edit Kamar
- [x] Halaman Detail Kamar
- [x] Upload Foto Kamar ke Supabase Storage
- [x] Integrasi 360° Photo Sphere Viewer
- [x] Bulk update status kamar (AVAILABLE / OCCUPIED / MAINTENANCE)

### 4. Manajemen Penghuni (Tenant Management)
- [x] Schema database (`User`, `TenantProfile`, `Lease`, `Invoice`)
- [x] Halaman Daftar Penghuni dengan Search (debounced) & Filter Status
- [x] Expandable Row: Detail kontak darurat, kontrak, dan tagihan aktif
- [x] Proses Check-in (Form Tambah Penghuni + Buat Lease)
- [x] Edit Data Penghuni (Form Edit)
- [x] Aksi Tandai Lunas Tagihan dari dashboard tenant
- [x] Aksi Reset Password Penghuni
- [x] Aksi Kirim Reminder Tagihan (via In-App Notification & Web Push ke Tenant)
- [x] Tampilkan status terpisah: Kolom Sewa & Kontrak (Aktif/Hampir Habis/Habis/Checked-out) + Kolom Pembayaran dinamis bulanan (Paid/Unpaid + nama bulan)
- [x] Tampilkan Foto KTP penghuni (via Signed URL Supabase)
- [x] Riwayat semua tagihan/pembayaran per penghuni
- [x] Proses Checkout formal (Ubah status Lease ke nonaktif)
- [-] Sorting tabel (ditunda — jumlah penyewa aktif masih sedikit ~11)
- [-] Pagination tabel penghuni (ditunda — jumlah penyewa aktif masih sedikit ~11)


### 5. Keuangan & Tagihan
- [x] Halaman Daftar Tagihan Admin (`/admin/billing`) dengan filter status (PAID, UNPAID, PENDING, OVERDUE)
- [x] Integration Midtrans Snap Payment Gateway & Webhook SHA-512 Verification
- [x] Nightly Cron Reconciliation Job (`/api/cron/reconcile-invoices`) untuk auto-update status tagihan
- [x] Fitur Klaim Promo Diskon Google Review Bintang 5 di PWA Tenant & Admin Approval
- [x] Ekspor data histori Pembayaran ke CSV/Excel untuk Admin & Tenant

### 6. Laporan Keluhan & Maintenance
- [x] Schema database Laporan (`Report`, `ReportImage`) — Model `Report` sudah ada di Prisma schema
- [x] Halaman Manajemen Tiket Keluhan (Open, In Progress, Resolved)
- [x] Form Admin Catat Keluhan/Kerusakan baru (dengan pilih tenant aktif)
- [x] Upload Foto Kerusakan ke Supabase Storage (bucket `Oskost-Data-Public/reports/admin`)
- [x] Sinkronisasi cache antara Admin Dashboard dan PWA Tenant (dua arah)

### 7. Pengaturan (Settings)
- [x] Halaman Pengaturan Profil Admin
- [x] Pengaturan Data Properti/Kost (Nama, Alamat, Lokasi)
- [x] Pengaturan Notifikasi (Email)


### 8. Synchronize Data
- [x] Data Overview/home harus sudah realtime dan sesuai dari data yg memang sudah ada dan sudah akurat
- [x] Data Manajement Room harus sudah realtime saat di tambahkan atau di hapus, diubah status.
- [x] Data Manajement Tenant sudah realtime saat di tambahkan atau di hapus, diubah status.
- [x] Data Keuangan & Billing sudah akurat dan realtime (Supabase Realtime + Focus Listener pada status PENDING)
- [x] Data Laporan harus sudah benar benar akurat dan realtime.

---

## FASE 2: PWA TENANT (Mobile-First) — Prioritas Berikutnya

> **Konteks:** Target pengguna adalah pekerja pabrik usia 20–30 tahun yang mengakses dari HP Android entry-level. Desain harus **mobile-first**, simpel, dan cepat (FCP < 1.5s).

### 8. Setup PWA & Infrastruktur Tenant
- [x] Konfigurasi `manifest.json` (PWA: App Name, Icon, Theme Color — statis terisolasi di route Tenant)
- [x] Setup `@ducanh2912/next-pwa` dengan Workbox caching strategies (NetworkFirst billing/reports, StaleWhileRevalidate assets, CacheFirst images)
- [x] Isolasi manifest dari Root Layout (ring-fencing SEO Landing Page)
- [x] Route Group Tenant `/tenant/*` dengan layout terpisah dari admin (via group `(pwaTenant)` & `/dashboard`)
- [x] Middleware autentikasi untuk role `TENANT` (berbeda dari ADMIN)
- [x] Halaman Login khusus Tenant (email/password atau phone number login di `/login`)
- [x] Cache clearing otomatis saat logout (Service Worker unregister + Workbox cache purge)

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
- [x] Export history data Pembayaran ke CSV/Excel untuk tenant

### 11. Modul Laporan Kerusakan (Report — Tenant View)
- [x] Form Lapor Kerusakan (deskripsi teks + foto dari kamera/galeri via Supabase)
- [x] Halaman Daftar Laporan Saya (status: Open / In Progress / Resolved)
- [x] Notifikasi ketika laporan direspon Admin (via In-App & Web Push API)

### 12. Profil & Akun Tenant
- [x] Halaman Profil Penghuni (tampilkan data diri, nomor kamar, kontak darurat)
- [x] Fitur Ganti Password sendiri
- [x] Fitur Lupa Password via Resend (Magic link email, token expiry 5 menit, rate limit 2x/hari)
- [x] Inactive Dashboard PWA (dukungan login untuk mantan penyewa yang sudah checkout untuk akses riwayat)
- [x] Flow Returning Tenant pada Check-In Admin (re-use akun lama penyewa tanpa error duplikasi)
- [x] Halaman Bantuan / FAQ singkat

### 13. Notifikasi & Sinkronisasi
- [x] Push Notification untuk pengingat seluruh kegiatan & tagihan tenant (via PWA Web Push API)
- [x] In-App Notification Bell & Centralized Notification Service (`sendNotification`)
- [x] Notifikasi otomatis ke Tenant saat pembayaran dikonfirmasi Lunas / Ditolak oleh Admin
- [x] Notifikasi otomatis ke Admin saat ada laporan kerusakan baru dari Tenant (dengan info Nama & Nomor Kamar)
- [x] Notifikasi otomatis ke Tenant saat status laporan kerusakan diperbarui oleh Admin (Sedang Diproses / Selesai)
- [x] Notifikasi manual "Kirim Tagihan" dari Admin → In-App + Web Push ke Tenant (dengan detail jumlah & periode)
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
- [x] Implementasi OnboardingTour (Framer Motion + LocalStorage persistence) saat pertama kali website/app OsKost ini dibuka
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
- [x] Konfigurasi `@ducanh2912/next-pwa` di `next.config.ts` (Disable di Dev mode / Turbopack)
- [x] Pembuatan `manifest.json` (scope: `/`, start_url: `/dashboard`)
- [x] Registrasi metadata PWA eksklusif di `src/app/(pwaTenant)/layout.tsx` (Ring-Fencing)
- [x] Setup Workbox Strategies (Network First untuk Billing, StaleWhileRevalidate untuk UI, CacheFirst untuk Images)
- [x] Implementasi script pembersihan cache PWA saat aksi Logout pengguna
- [x] Implementasi **Banner Pengumuman & Informasi (Broadcast / Per Tenant)** dari Admin dengan slider/carousel di PWA Tenant (pemisahan logika penutupan banner dari lonceng notifikasi via `localStorage` persistence)
- [x] Implementasi **Real-Time Auto-Refresh Mulus (Tanpa Refresh Manual)** berbasis momen: Supabase Realtime instan milidetik di layar Pembayaran Pending (`SnapPendingHandler`) & Admin Dashboard (`useAdminRealtime`), dipadukan dengan Window Focus Listener dan Service Worker Push Broadcast.

---

## FASE 6: INTEGRASI PAYMENT GATEWAY (Automated Billing & Midtrans)

### 17. Midtrans Snap & Automated Payment System
- [x] Konfigurasi environment key Midtrans Sandbox (`MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_MERCHANT_ID`)
- [x] Perluasan skema database Prisma (`PaymentStatus` expanded, `PaymentProvider`, `PaymentMethod`, `WebhookLog`, `DiscountPreset`, `Invoice` extended)
- [x] Seed data otomatis untuk metode pembayaran (BCA VA, Mandiri VA, BNI VA, BRI VA, QRIS) dan preset diskon (Google Review, Early Bird)
- [x] Service Layer `payment-service.ts` (penghitungan biaya admin split fee server-side, kalkulasi gross amount presisi, request Snap token)
- [x] Komponen `PaymentSelector` di PWA Tenant dengan validasi Radio Group (1 metode aktif) dan estimasi biaya tembus
- [x] Script Midtrans Snap SDK client-side loader di `billing/page.tsx`
- [x] Route Webhook Handler (`/api/webhooks/midtrans`) dengan verifikasi signature SHA-512 & log audit forensik `WebhookLog`
- [x] Integrasi In-App & Web Push Notification otomatis saat pembayaran sukses (`PAID`) atau kedaluwarsa (`EXPIRED`)
- [x] Nightly Cron Reconciliation Job (`/api/cron/reconcile-invoices`) sebagai jaring pengaman webhook
- [x] Komponen `AdminDiscountDialog` di Dashboard Admin untuk penerapan promo bebas biaya admin (Google Review Bintang 5)
- [x] Halaman **Admin Billing** (`/admin/billing`) fungsional dengan Stat Cards, Filter Status, Tabel Tagihan, Tandai Lunas, & Modal Verifikasi
- [x] Refactoring **PWA Tenant Billing UX** dengan Toggle Switch antara *Pembayaran Online (Midtrans)* vs *Transfer Manual / Onsite*
- [x] Model `DiscountClaim` & Alur **Klaim Promo Google Review** (Upload screenshot ulasan di PWA ➔ Review & Approve di Admin Dashboard)
- [x] Penanganan Transaksi PENDING Tersangkut & Error `order_id sudah digunakan` via Unique Midtrans Order ID (suffix timestamp) & Auto-Parsing Webhook.

---

## 📊 Ringkasan Progress

| Fase | Deskripsi | Status |
|------|-----------|--------|
| Fase 1 | Admin Dashboard (Web) | [x] Selesai |
| Fase 2 | PWA Tenant (Mobile) | [x] Selesai |
| Fase 3 | Landing Page (Marketing) | [x] Selesai (Katalog, Maps, Detail Kamar, & Optimasi SEO) |
| Fase 4 | Optimization & Performance | [x] Data Fetching Selesai |
| Fase 5 | PWA Implementation | [x] Selesai (Arsitektur PWA + Banner Broadcast + Supabase Realtime) |
| Fase 6 | Payment Gateway Integration | [x] Selesai (Midtrans Snap, Webhook SHA-512, Promo Google Review, Recovery PENDING & Unique Order ID) |

---

*Diperbarui: 2026-08-06 — Arsitektur Ideal Supabase Realtime: Menghapus polling global 20s (hemat baterai), mengintegrasikan Supabase Realtime subscription instan milidetik pada SnapPendingHandler (Invoice) & Admin Dashboard (useAdminRealtime), dipadukan dengan Window Focus Listener.*


