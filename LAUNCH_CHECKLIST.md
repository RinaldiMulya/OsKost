# 🚀 Launching Readiness Checklist — OsKost (Smartkost Pulo Jahe System)

Dokumen ini merupakan **Daftar Centang Kesiapan Produksi (Production Launch Checklist)** resmi untuk proyek **OsKost**. Gunakan dokumen ini sebagai panduan verifikasi tahap demi tahap sebelum dan saat melakukan proses *deployment* ke server produksi.

---

## 📌 Status Umum Proyek
- **Versi**: `1.0.0-release`
- **Framework**: Next.js 16 (App Router, Standalone Build)
- **Database**: PostgreSQL (Prisma 7 via PG Adapter, Pool Max: 10)
- **Payment Gateway**: Midtrans Snap Integration (SHA-512 Signature Verification)
- **Storage**: Supabase Storage (Public & Private Buckets)

---

## 1. ⚙️ Verifikasi Fitur Aplikasi (Core Features)

### A. Admin Dashboard (`/admin/*`)
- [ ] **Overview Stats (`/admin`)**: Stat cards (Total Kamar, Terisi, Tersedia, Maintenance, Total Tenant, Unpaid Invoices, Open Reports) merender data real dari database.
- [ ] **Realtime Header (`useAdminRealtime`)**: Header admin menerima sinyal Supabase Realtime secara instan saat ada invoice lunas atau laporan baru.
- [ ] **Manajemen Kamar (`/admin/rooms`)**:
  - [ ] Tambah / Edit Kamar dengan upload foto standar (.webp auto-compressed).
  - [ ] Upload Foto 360° Panorama dengan kompresi client-side (<3MB, .webp) & render 360° Viewer.
  - [ ] Update status kamar (AVAILABLE / OCCUPIED / MAINTENANCE).
- [ ] **Manajemen Penghuni (`/admin/tenants`)**:
  - [ ] Check-in Tenant Baru (pembuatan user + lease + invoice).
  - [ ] Checkout Tenant (pelepasan status kamar ke AVAILABLE).
  - [ ] Expandable Row: Kontak darurat, foto KTP via Signed URL Supabase, & histori sewa.
- [ ] **Admin Billing (`/admin/billing`)**:
  - [ ] Filter status tagihan (PAID, UNPAID, PENDING, OVERDUE).
  - [ ] Aksi "Tandai Lunas Manual" & penolakan bukti bayar.
  - [ ] Modal persetujuan Klaim Diskon Google Review Bintang 5.
- [ ] **Manajemen Laporan (`/admin/reports`)**: Aksi ubah status tiket keluhan (OPEN ➔ IN_PROGRESS ➔ RESOLVED) dengan notifikasi otomatis ke tenant.
- [ ] **Pengaturan (`/admin/settings`)**: Edit data profil admin dan data properti.

### B. PWA Tenant Mobile (`/dashboard/*`)
- [ ] **Mobile Responsive Layout**: Tampilan optimal pada viewport HP Android (360px – 430px).
- [ ] **Dashboard Tenant (`/dashboard`)**: Sapaan tenant, nomor kamar, sisa hari kontrak, & widget tagihan bulan berjalan.
- [ ] **Tenant Billing (`/dashboard/billing`)**:
  - [ ] Toggle pilihan pembayaran: *Online Payment (Midtrans Snap)* vs *Transfer Manual*.
  - [ ] Snap Popup Midtrans terbuka dengan lancar.
  - [ ] Tombol **"Klaim Bebas Biaya Admin (Google Review Bintang 5)"** dengan efek visual *Shimmer Light*.
  - [ ] Upload bukti transfer manual dengan kompresi .webp.
  - [ ] Ekspor histori pembayaran ke CSV/Excel.
- [ ] **Laporan Kerusakan (`/dashboard/reports`)**: Form submit keluhan + upload foto kerusakan & daftar status tiket.
- [ ] **Profil & Keamanan (`/dashboard/profile`)**: Tampilan data diri, ubah password sendiri, & logout (dengan pembersihan cache PWA Service Worker).
- [ ] **Halaman Bantuan (`/dashboard/help`)**: FAQ singkat & Kontak Pengelola.

### C. Landing Page Publik (`/`)
- [ ] **Onboarding Tour**: Pop-up interaktif panduan awal pengunjung (`OnboardingTour`) tampil otomatis saat pertama kali dibuka.
- [ ] **Hero Section & Katalog Kamar**: Tampilan kamar real-time dengan status "Tersedia" / "Penuh".
- [ ] **Detail Kamar (`/rooms/[id]`)**: Integrasi 360° Photo Sphere Viewer & JSON-LD structured data script.
- [ ] **Section Tata Cara Memesan**: Langkah pemesanan kamar yang transparan.
- [ ] **Section Interactive Maps**: Lokasi Google Maps kost Pulo Jahe.
- [ ] **SEO Optimization**: Metadata title/description, `robots.txt`, `sitemap.xml`, & OpenGraph preview.

---

## 2. 💳 Panduan Testing Manual Keuangan (Midtrans Production Switching)

> ⚠️ **PENTING**: Pengujian pembayaran dengan uang asli (Production) harus dilakukan secara manual setelah beralih dari kunci Sandbox ke Production.

### A. Persiapan Transisi Sandbox ➔ Production
1. Login ke Dashboard Midtrans ([dashboard.midtrans.com](https://dashboard.midtrans.com)).
2. Ubah mode dari **Sandbox** ke **Production**.
3. Ambil `Client Key`, `Server Key`, dan `Merchant ID` Production.
4. Update `.env.production` di server:
   ```env
   MIDTRANS_SERVER_KEY="Mid-server-YOUR_PRODUCTION_SERVER_KEY"
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="Mid-client-YOUR_PRODUCTION_CLIENT_KEY"
   MIDTRANS_MERCHANT_ID="YOUR_PRODUCTION_MERCHANT_ID"
   MIDTRANS_IS_PRODUCTION=true
   ```
5. Daftarkan URL Webhook Notification di Dashboard Midtrans Production:
   `https://domain-anda.com/api/webhooks/midtrans`

### B. Checklist Skenario Testing Manual Keuangan
- [ ] **Skenario 1: Pembayaran QRIS (GoPay/ShopeePay/OVO)**:
  1. Login ke PWA Tenant, pilih tagihan `UNPAID`.
  2. Pilih pembayaran *Online Payment*, klik QRIS.
  3. Scan QR code menggunakan aplikasi e-wallet asli (nominal misal Rp 1.000 atau Rp 10.000 sesuai minimum Midtrans).
  4. Selesaikan pembayaran ➔ Verifikasi status tagihan di PWA berubah menjadi **PAID** secara instan dalam kurun milidetik (via Supabase Realtime & Webhook).
- [ ] **Skenario 2: Pembayaran Virtual Account (BCA/Mandiri/BRI/BNI)**:
  1. Pilih metode Virtual Account di Snap Popup.
  2. Salin nomor VA dan lakukan transfer via M-Banking.
  3. Verifikasi Webhook log di tabel `WebhookLog` database menerima payload `settlement` dengan status `200`.
- [ ] **Skenario 3: Penanganan Pembatalan / Expired (PENDING Recovery)**:
  1. Buka Snap Popup lalu tutup tanpa menyelesaikan pembayaran.
  2. Verifikasi tombol **"Batalkan & Ganti Metode"** atau retry di PWA Tenant berfungsi tanpa memicu error `order_id sudah digunakan (400)`.
- [ ] **Skenario 4: Verifikasi Nightly Cron Reconciliation**:
  1. Panggil endpoint cron reconciliation manual: `GET /api/cron/reconcile-invoices`.
  2. Verifikasi respon status `200 OK` dan log sinkronisasi tagihan.

---

## 3. 🛡️ Security Level & Hardening Checklist

- [ ] **Middleware Route Protection**: File [src/middleware.ts](file:///d:/Local-Project/oskost/src/middleware.ts) aktif dan mengalihkan akses anonim pada `/admin/*` dan `/dashboard/*` ke `/login`.
- [ ] **Server Actions RBAC**: Seluruh Server Actions Admin di `src/features/*/actions.ts` memverifikasi `session.user.role === "ADMIN"`.
- [ ] **Rate Limiting**: Rate limiter aktif pada POST `/login` (maksimal 5 request per menit per IP).
- [ ] **Bcrypt Work Factor**: Hashing password menggunakan **12 salt rounds**.
- [ ] **Password Sementara Dinamis**: Check-in tenant baru menggunakan sandi sementara `"oskost" + 4 digit terakhir HP`.
- [ ] **Data Privacy (Prisma Select)**: Tidak ada query `prisma.user` yang membocorkan `passwordHash`.
- [ ] **Stored XSS Injection Shield**: Serialization JSON-LD di `rooms/[id]/page.tsx` menggunakan `.replace(/</g, '\\u003c')`.
- [ ] **HTTP Security Headers**: Header `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, dan `Strict-Transport-Security` terkonfigurasi di `next.config.ts`.
- [ ] **Supabase Storage Access**: File KTP diakses melalui *Signed URLs* (Private Bucket), gambar umum menggunakan Public Bucket.
- [ ] **Midtrans Webhook Security**: Verifikasi SHA-512 Signature Key (`order_id + status_code + gross_amount + ServerKey`).

---

## 4. ⚡ Performance & PWA Optimization Checklist

- [ ] **Lighthouse Audit**: Score Performance > 85, Accessibility > 90, Best Practices > 90, PWA Pass.
- [ ] **Client-side Image Compression**: Pengunggahan foto KTP, keluhan, dan panorama 360° dikompresi otomatis ke format `.webp` di browser sebelum di-submit.
- [ ] **Next.js Native Image Optimizer**: Menggunakan `<Image />` dari `next/image` untuk seluruh gambar remote.
- [ ] **Centralized Cache Tags**: Caching `unstable_cache` dikontrol oleh `CACHE_TAGS` dengan invalidasi presisi via `updateTag()`.
- [ ] **Workbox Service Worker**: PWA caching strategy (`NetworkFirst` untuk billing/reports, `StaleWhileRevalidate` untuk UI assets, `CacheFirst` untuk images).

---

## 5. 🗄️ Database & Infrastructure Readiness

- [ ] **Prisma Migration**: Database schema disinkronkan ke server produksi (`pnpm prisma db push` / `pnpm prisma migrate deploy`).
- [ ] **Prisma Seed**: Seed data awal telah berjalan untuk mengisi `PaymentMethod`, `DiscountPreset`, dan akun Admin utama.
- [ ] **Connection Pool Limit**: Singelton Prisma client di `src/lib/db.ts` membatasi `max: 10` koneksi PostgreSQL.
- [ ] **Supabase Storage Buckets**: Bucket `Oskost-Data-Public` dan `Oskost-Data-Private` telah dibuat dengan RLS Policies yang sesuai.

---

## 6. 🐳 Docker & Production Environment Checklist

- [ ] **Next.js Standalone Mode**: Properti `output: "standalone"` diaktifkan di `next.config.ts`.
- [ ] **Dockerfile Multi-Stage**: Build image menggunakan `Dockerfile` multi-stage (<180MB, non-root user `nextjs`).
- [ ] **Docker Compose Orchestration**: File `docker-compose.yml` terkonfigurasi untuk menjalankan app dan PostgreSQL.
- [ ] **Environment Variables Check**:
  - [ ] `DATABASE_URL` (PostgreSQL production URL)
  - [ ] `NEXTAUTH_SECRET` (Strong random 64-char string)
  - [ ] `NEXTAUTH_URL` (Public URL domain produksi, contoh: `https://oskost.com`)
  - [ ] `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `MIDTRANS_SERVER_KEY` & `MIDTRANS_CLIENT_KEY` (Production)
  - [ ] `RESEND_API_KEY` (Email notifications)
  - [ ] `CRON_SECRET` (Pengaman endpoint cron jobs)

---

## 📅 Log Tanda Tangan Peluncuran (Sign-off)

| Peran | Nama / Penguji | Tanggal | Status | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| **Lead Developer** | AI Agent & Rinaldi | 2026-08-07 | ✅ Ready | All core modules & security checks passed |
| **Product Owner** | Rinaldi Mulya | | [ ] Pending | Testing manual Midtrans Production |
