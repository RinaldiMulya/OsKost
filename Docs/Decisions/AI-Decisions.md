# AI Decisions Log

Log seluruh keputusan yang dibuat oleh AI Agent terkait project ini.

---

## 2026-05-24: Cache Invalidation API — `updateTag` vs `revalidateTag`

### Konteks
Project ini menggunakan **Next.js 16.1.6** (Turbopack). Di Server Actions (`rooms/actions.ts`, `tenants/actions.ts`), setelah melakukan mutasi data (create/update/delete) ke database, kita perlu menginvalidasi cache agar halaman publik menampilkan data terbaru.

### Masalah
Kode awal menggunakan `updateTag("rooms-landing")` dari `next/cache`. Agent (saya) salah mengira ini adalah typo dari `revalidateTag` dan mengubahnya. Ini menyebabkan error berantai:

1. **Perubahan pertama (SALAH):** `updateTag(...)` → `revalidateTag(...)` dengan 1 argumen → **Error TS2554**: `Expected 2 arguments, but got 1`
2. **Perubahan kedua oleh user (SALAH):** Menambah argumen `"/"` → `revalidateTag("rooms-landing", "/")` → **Runtime Error**: `Invalid profile provided "/" must be configured under cacheLife in next.config or be "max"`

### Penjelasan: Perbedaan API di Next.js 16

| Fungsi | Signature | Penggunaan |
|--------|-----------|------------|
| `updateTag(tag)` | `(tag: string) => void` | **Untuk Server Actions.** Menandai tag cache sebagai stale sehingga request berikutnya mendapat data fresh. Mendukung semantik *read-your-own-writes*. |
| `revalidateTag(tag, profile)` | `(tag: string, profile: string \| CacheLifeConfig) => void` | **Untuk purging data** dari cache berdasarkan tag + cache life profile. Profile harus salah satu dari: `"default"`, `"seconds"`, `"minutes"`, `"hours"`, `"days"`, `"weeks"`, `"max"`, atau custom profile dari `next.config`. |

> **Catatan:** Di Next.js versi sebelumnya (13-14), `revalidateTag` hanya butuh 1 argumen. Di Next.js 15+, API berubah. `updateTag` adalah pengganti `revalidateTag(tag)` lama untuk use case Server Actions.

### Keputusan
**Kembalikan ke `updateTag`** — ini adalah API yang benar untuk Server Actions di Next.js 16:

```typescript
// ✅ BENAR — untuk Server Actions di Next.js 16
import { revalidatePath, updateTag } from "next/cache";
updateTag("rooms-landing");

// ❌ SALAH — revalidateTag butuh cache life profile sebagai argumen kedua
import { revalidateTag } from "next/cache";
revalidateTag("rooms-landing"); // Error: butuh 2 argumen
revalidateTag("rooms-landing", "/"); // Error: "/" bukan profile yang valid
```

### File yang Terpengaruh
- `src/features/rooms/actions.ts` — Semua `revalidateTag(...)` dikembalikan ke `updateTag(...)`
- `src/features/tenants/actions.ts` — Semua `revalidateTag(...)` dikembalikan ke `updateTag(...)`

### Pelajaran
- **Jangan asumsikan API naming tanpa verifikasi type definitions.** Selalu cek `node_modules/next/dist/.../revalidate.d.ts` untuk API terkini.
- Next.js 16 memisahkan konsep "update" (soft invalidation dari Server Actions) dan "revalidate" (hard purge dengan cache profile).

---

## 2026-05-23: Panorama 360° Gallery — Support Multiple Images

### Konteks
Komponen `RoomImageGallery` hanya menampilkan gambar 360° pertama (`panoramaImages?.[0]`) meski database menyimpan beberapa. Tidak ada UI untuk memilih gambar 360° lainnya.

### Keputusan
Mengacu pada desain di `designdetailroom.md`, ditambahkan:
1. State `activePanoramaIndex` untuk melacak gambar 360° yang aktif
2. Thumbnail panorama di gallery "Jelajah Lingkungan" ditampilkan **sebelum** foto biasa, dengan badge `360°`
3. Klik thumbnail panorama → ganti hero viewer ke `Room360Viewer` dengan gambar yang dipilih
4. Gallery condition diubah dari `images.length > 1` ke `totalItems > 1` (total = images + panoramas)

### File yang Terpengaruh
- `src/features/rooms/components/room-image-gallery.tsx`

---

## 2026-07-15: Analisis & Pemetaan Sistem Notifikasi

### Konteks
Memulai pengerjaan fitur Notifikasi (Milestone poin 13). Sebelum implementasi teknis, dilakukan pemetaan *event* apa saja yang membutuhkan notifikasi untuk Tenant dan Admin berdasarkan `PWA_ARCHITECTURE_INSTRUCTIONS.md`, `Panduan_Implementasi_Payment_Gateway_OsKost.md`, dan `wa-gateway-otp-plan.md`.

### Keputusan / Pemetaan Event
Notifikasi dibagi menjadi 3 saluran utama: **Web Push API (PWA)** untuk notifikasi operasional cepat, **WhatsApp (Baileys)** untuk transaksi penting & record, serta **In-App/Real-time (SSE)** untuk update status sinkron di dashboard UI.

**Event Tenant:**
- **Siklus Tagihan:** Tagihan baru terbit (WA), H-3/H-1 reminder (WA), Pembayaran lunas (WA & Push), Tagihan expired (WA).
- **Laporan/Maintenance:** Update status proses perbaikan (Push).
- **Pengumuman:** Broadcast info kost dari Admin (Push).
- **Akun:** Kode OTP & info reset password (WA).

**Event Admin:**
- **Laporan/Maintenance:** Ada laporan keluhan baru (Push/In-App).
- **Tagihan:** Pembayaran masuk via webhook/payment gateway (Real-time SSE & Push).
- **Manajemen:** Masa sewa tenant hampir habis (In-App/Push).
- **Sistem:** Koneksi WA Gateway terputus, butuh scan QR (In-App/Push), Laporan Rekonsiliasi Gateway (In-App).

### Pelajaran / Catatan Penting
- Karena sistem *multi-channel*, setiap pengiriman notifikasi harus di-*route* berdasarkan tingkat urgensinya agar tidak terjadi spam. WA hanya untuk *high-priority transactional event*.

---

## 2026-07-15: Pemisahan Status Kontrak & Pembayaran Dinamis Bulanan

### Konteks
User menemukan anomali di tabel penghuni admin:
1. Kolom "Status" mencampurkan logika **status sewa/kontrak** (Checked-out, Hampir Habis) dengan **status keuangan** (Paid, Unpaid) dalam satu badge.
2. Penyewa yang kontraknya sudah habis tetap berstatus **Paid** selama tagihannya lunas, padahal seharusnya terlihat bahwa kontraknya sudah habis.
3. Penyewa baru diberikan status **Checked-out** setelah admin menghapus akun, bukan saat kontrak habis.

### Keputusan
- **Pemisahan menjadi dua kolom**:
  - **Sewa & Kontrak**: Menampilkan status masa sewa (`Aktif X Bulan`, `Hampir Habis X Hari`, `Lewat X Hari`, `Checked-out`).
  - **Pembayaran**: Menampilkan status keuangan bulan berjalan secara dinamis (`Paid (Jul)`, `Unpaid (Jul)`), atau `—` jika sudah checkout.
- **Default filter diubah** dari "Semua Status" (ALL) menjadi "Penghuni Aktif" (ACTIVE).

### Alasan
- Admin bisa membedakan tindakan: kontrak habis → tanya perpanjangan; tagihan belum bayar → kirim reminder.
- Menampilkan nama bulan memberikan informasi instan tanpa harus expand baris.

### File yang Terpengaruh
- `src/features/tenants/components/TenantRow.tsx`
- `src/features/tenants/components/TenantTable.tsx`

---

## 2026-07-15: Penghapusan Sistem Deposit

### Konteks
User menginformasikan bahwa kost saat ini **tidak menerapkan sistem deposit**.

### Keputusan
- Hapus field input "Uang Jaminan (Deposit)" dari form check-in (`tenant-form.tsx`).
- Hapus tampilan deposit dari panel detail kontrak di expandable row (`TenantRow.tsx`).
- Schema Zod tetap memiliki field `deposit` dengan default `0` untuk backward compatibility.

### File yang Terpengaruh
- `src/features/tenants/components/tenant-form.tsx`
- `src/features/tenants/components/TenantRow.tsx`

---

## 2026-07-15: Statistik Dashboard Dinamis (Total Penghuni & Trend Bulanan)

### Konteks
- Stat card "Total Penghuni" menghitung semua `TenantProfile` termasuk yang sudah checkout.
- Teks trend `+3 bulan ini` di-hardcode di `DashboardStats.tsx`.

### Keputusan
- **Total Penghuni** hanya menghitung user yang memiliki lease aktif.
- **Trend bulanan** dihitung dinamis: jumlah penyewa check-in dalam 30 hari terakhir.

### File yang Terpengaruh
- `src/app/(dashboard)/admin/tenants/page.tsx`
- `src/features/tenants/components/DashboardStats.tsx`
- `src/features/dashboard/dashboard-service.ts`

---

## 2026-07-15: Penundaan Sorting, Pagination, Keuangan & Settings

### Konteks
User menjelaskan kost hanya memiliki ~11 kamar/penyewa aktif. Modul keuangan di-skip sampai MVP selesai. Settings ditunda sampai OTP terverifikasi.

### Keputusan
- Sorting & pagination tabel penghuni: **Ditunda** (skala saat ini terlalu kecil).
- Modul Keuangan & Tagihan: **Ditunda** sampai seluruh MVP selesai.
- Modul Pengaturan (Settings): **Ditunda** sampai verifikasi OTP via `wa-gateway-otp-plan.md` terlaksana.

### File yang Terpengaruh
- `milestone.md` — Status item terkait diubah menjadi `[-]` (ditunda).



---

## 2026-07-16: Pengalihan Fitur Hapus Penghuni Menjadi Check-out & Penambahan Informasi Kontak

### Konteks
Tabel penghuni admin sebelumnya memiliki tombol "Hapus" yang memicu peringatan destruktif: *"Tindakan ini akan menghapus akun penghuni dan seluruh data profilnya secara permanen"*. Namun, secara backend (database & service), fungsi ini memicu `checkoutTenant` (soft check-out), yang menonaktifkan kontrak sewa aktif dan mengosongkan kamar, tetapi tetap mempertahankan profil penyewa dan riwayat tagihan/pembayaran untuk kebutuhan laporan keuangan. Selain itu, nomor HP utama dan email penyewa tidak ditampilkan pada tabel atau panel expanded.

### Keputusan
1. **Mengubah Tombol Hapus menjadi Check-out**: Mengganti `DeleteTenantButton` dengan `CheckoutTenantButton` dan mengubah istilah konfirmasi menjadi "Proses Check-out". Tombol ini hanya dirender jika penyewa memiliki kontrak sewa aktif (`hasActiveLease`).
2. **Menambahkan Kontak Utama di Tabel**: Menampilkan nomor HP utama (`phoneNumber`) di baris utama tabel penyewa (di bawah nama, bersandingan dengan ID penyewa) serta melengkapinya dengan email utama di panel expanded (Kontak & Asal).
3. **Tombol Check-out Cepat di Expanded Row**: Menambahkan `CheckoutTenantButton` secara langsung di Panel 2 expanded row, agar admin tidak harus masuk ke halaman detail tenant untuk memproses checkout.

### File yang Terpengaruh
- `src/features/tenants/components/checkout-tenant-button.tsx` [NEW]
- `src/features/tenants/components/delete-tenant-button.tsx` [DELETE]
- `src/features/tenants/actions.ts`
- `src/features/tenants/components/tenant-detail/tenant-header.tsx`
- `src/features/tenants/components/TenantRow.tsx`

---

## 2026-07-16: Masking Sebagian Nomor KTP (NIK) pada Detail Penghuni

### Konteks
Untuk mematuhi kebijakan privasi data pribadi (PII), nomor KTP (NIK) penyewa tidak boleh ditampilkan secara utuh dalam bentuk teks polos pada halaman detail admin (`TenantInfoTab`). NIK asli memiliki 16 digit yang berisi kode regional sensitif dan tanggal lahir.

### Keputusan
Mengimplementasikan masking sebagian pada tampilan nomor KTP (NIK) di tab Informasi Tenant. 
Logika masking yang dipilih:
- Jika NIK bernilai 16 digit (standar NIK Indonesia), tampilkan 6 digit pertama (kode wilayah), 6 digit tengah dimask menggunakan asterisk (`******`), dan tampilkan 4 digit terakhir (nomor urut registrasi). Contoh: `320112******1234`.
- Jika panjang NIK tidak standar, mask bagian tengahnya dengan menyisakan 4 digit pertama dan 4 digit terakhir.

### File yang Terpengaruh
- `src/features/tenants/components/tenant-detail/tenant-info-tab.tsx`

---

## 2026-07-17: Update CV — Penambahan Proyek OsKost & Pembaruan Skills

### Konteks
User meminta penambahan project OsKost ke dalam CV (`CV Rinaldi Mulya Pratama.md`). Project ini masih dalam tahap In Development dan belum dipublikasikan. User bertanya apakah sebaiknya project ini ditampilkan atau tidak di CV.

### Pertimbangan: Tampil vs Tidak Tampil
- **Alasan tampil:** Project real (bukan tutorial), dibangun dari 0 dengan arsitektur production-grade. Stack modern (Next.js 16, React 19, Prisma v7, NextAuth v5) sangat relevan untuk recruiter saat ini. Menunjukkan kemampuan end-to-end (DB schema, auth, caching, PWA, SEO, image upload). Inisiatif pribadi serius yang justru disukai recruiter.
- **Alasan tidak tampil:** Belum ada URL live untuk dibuktikan.
- **Risiko tidak tampil:** Kehilangan bukti kemampuan teknis substantial + gap aktivitas portofolio.

### Keputusan
1. **Tampilkan dengan label eksplisit `(In Development — Target Publish: 2026)`** — user memilih opsi ini. Label ini jujur dan profesional; recruiter menghargai transparansi daripada menyembunyikan project yang belum selesai.
2. **Tambahkan entri project OsKost** ke bagian Proyek CV sebagai item ke-3 (setelah Halmall dan Microsite Chatbot) dengan poin-poin: Arsitektur & Setup, Database Schema Design, Admin Dashboard (Fase 1), PWA Tenant Mobile-First (Fase 2), Landing Page & SEO (Fase 3), Optimasi Performa & Caching (Fase 4), Image Upload & Compression, Feature-Sliced Design Architecture.
3. **Perbarui bagian Technical Skills** dengan teknologi baru dari OsKost: Shadcn UI, Framer Motion, Jotai, nuqs, Prisma ORM (v7), NextAuth.js v5, bcryptjs, Server Actions, Feature-Sliced Design, Next.js App Router Caching pattern, PWA (Manifest, Service Worker), Husky (Git Hooks), ESLint, Prettier — semua diverifikasi dari `package.json` project.
4. **Sumber data untuk deskripsi:** Analisis lengkap dari `git log --all`, `milestone.md`, `package.json`, dan `Docs/Business/BRD.md`.

### File yang Terpengaruh
- `CV Rinaldi Mulya Pratama.md` — Penambahan project OsKost + update Skills section
- `milestone.md` — Update timestamp

---

## 2026-07-22: Arsitektur Inactive Dashboard Tenant & Returning Tenant Check-in Flow

### Konteks
Terdapat pertanyaan arsitektur terkait akun tenant yang sudah *checkout*:
1. Mengapa mantan penyewa yang sudah checkout masih bisa login di PWA (`budi.santoso@gmail.com`).
2. Bagaimana perlakuan sistem saat penyewa lama kembali ngekost lagi setelah beberapa bulan (misal checkout bulan ke-6, lalu check-in lagi bulan ke-9).

### Keputusan
1. **Dukungan Inactive Dashboard (Data Retention & Best Practice Enterprise)**:
   - Mantan penyewa **tetap diizinkan login** ke PWA.
   - PWA Dashboard mengenali jika `activeLease` bernilai `null` dan menampilkan *Inactive Dashboard State* ("Kontrak Sewa Tidak Aktif").
   - Fitur **Lapor Kerusakan** disembunyikan/dinonaktifkan bagi tenant inaktif, namun riwayat laporan lama dan riwayat pembayaran (*invoices*) tetap bisa diakses.
2. **Alur Returning Tenant pada Check-In Admin**:
   - Fungsi `createTenant` pada `tenant-service.ts` diubah menggunakan logika *check-and-reuse* (upsert-like):
     - Memeriksa apakah `phoneNumber` atau `email` sudah ada di database `User`.
     - Jika pengguna sudah ada dan **memiliki kontrak aktif**, sistem akan menolak registrasi: `"Penyewa ini masih berstatus aktif di kamar lain"`.
     - Jika pengguna sudah ada tetapi **tidak memiliki kontrak aktif** (kasus *returning tenant*), sistem tidak membuat akun `User` baru. ID `User` lama digunakan kembali, data `TenantProfile` diperbarui, dan `Lease` baru serta `Invoice` baru langsung dibuatkan.
3. **Penyederhanaan Rencana Notifikasi**:
   - Membatalkan integrasi *WhatsApp Gateway (Baileys)* dari `Notification_System_Plan.md` untuk menghindari kompleksitas arsitektur microservice dan risiko *session disconnect*. Fokus dialihkan 100% pada *PWA Web Push API* dan *In-App Notifications*.

### File yang Terpengaruh
- `src/features/tenants/tenant-service.ts`
- `src/app/(pwaTenant)/dashboard/page.tsx`
- `src/app/(pwaTenant)/dashboard/reports/page.tsx`
- `Docs/AI/Plan/Notification_System_Plan.md`
- `milestone.md`

---

## 2026-07-22: Implementasi Sistem Notifikasi Terpusat (PWA Web Push API & In-App Bell)

### Konteks
Merealisasikan Sistem Notifikasi Omnichannel (Poin 13 di milestone) tanpa ketergantungan pada WhatsApp Gateway (Baileys) untuk menjaga arsitektur tetap *Serverless-ready*, ramping, dan stabil.

### Keputusan
1. **Model Database & Prisma Client**:
   - Ditambahkan `Notification` (In-App notification history & status `isRead`).
   - Ditambahkan `PushSubscription` (menyimpan VAPID endpoint, p256dh, & auth keys perangkat user).
2. **Infrastruktur PWA Web Push**:
   - Library `web-push` dikonfigurasi dengan kunci kriptografi VAPID (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY`).
   - Service Worker (`public/sw.js`) disesuaikan dengan listener `push` dan `notificationclick`.
   - Client Hook `usePushNotification` dibuat untuk menangani izin notifikasi browser (`Notification.requestPermission()`) dan otomatis mendaftarkan *subscription* ke endpoint `/api/web-push/subscription`.
3. **Centralized Service & UI Component**:
   - Utility `sendNotification()` dibuat di `src/features/notifications/notification-service.ts` untuk memicu penyimpanan In-App DB dan dispatch Web Push sekaligus.
   - Komponen UI `NotificationBell` dipasang di header `TenantLayout` (`/dashboard`), menampilkan jumlah unread, dropdown list, serta prompt mengaktifkan Web Push.
   - Pemicu otomatis diintegrasikan saat Admin mengonfirmasi pembayaran lunas (`markInvoicePaid`) atau menolak bukti bayar (`rejectInvoicePayment`).

### File yang Terpengaruh
- `prisma/schema.prisma`
- `.env`
- `public/sw.js`
- `src/app/api/web-push/subscription/route.ts`
- `src/features/notifications/notification-service.ts`
- `src/features/notifications/actions.ts`
- `src/hooks/use-push-notification.ts`
- `src/components/shared/notification-bell.tsx`
- `src/components/ui/popover.tsx`
- `src/app/(pwaTenant)/layout.tsx`
- `src/features/tenants/tenant-service.ts`
- `milestone.md`


