# Log Keputusan AI (AI Decisions Log)

Dokumen ini mencatat keputusan arsitektural dan teknis yang diambil oleh AI Agent selama proses pengembangan proyek **OsKost**.

---

### [2026-08-05] Perbaikan Transaksi PENDING Tersangkut & Error Duplikasi `order_id` Midtrans

#### Latar Belakang & Masalah
1. Ketika tenant menutup popup Midtrans Snap secara sepihak atau transaksinya dibatalkan di dashboard Midtrans, status tagihan lokal terkunci di status `PENDING`. Ini mencegah tenant memilih metode pembayaran lain atau mencoba ulang pembayaran.
2. Saat ditambahkan fitur tombol **"Batalkan & Ganti Metode"** untuk mereset status lokal ke `UNPAID`, tenant dapat melakukan checkout ulang untuk invoice yang sama. Namun, hal ini memicu error Midtrans API `transaction_details.order_id sudah digunakan (400)` karena Midtrans melarang penggunaan ulang `order_id` yang sama persis secara global.

#### Keputusan Teknis yang Diambil
1. **Penerapan Suffix Unik Per Checkout**:
   * *Keputusan*: Daripada mengubah skema database (yang bisa memicu kegagalan migrasi/data loss), kita memutuskan untuk menambahkan suffix timestamp unik pada `order_id` yang dikirim ke Midtrans:
     `order_id: ${externalId}-${Date.now()}`
   * *Rasional*: Menjamin keunikan global untuk setiap request Snap API yang dikirim ke Midtrans, sehingga meniadakan error 400.
2. **Penyimpanan Transaksi Asli di `providerRef`**:
   * *Keputusan*: Menyimpan ID transaksi unik tersebut ke kolom `providerRef` pada tabel `Invoice`.
   * *Rasional*: Memudahkan pencarian data audit transaksi asli dari dashboard Midtrans.
3. **Pencocokan Webhook Menggunakan Regex/Split Parser**:
   * *Keputusan*: Memotong suffix timestamp di webhook handler (`/api/webhooks/midtrans`) sebelum query database dijalankan:
     `const baseExternalId = payload.order_id.split("-").slice(0, 4).join("-")`
   * *Rasional*: Mengembalikan `order_id` unik Midtrans ke format `externalId` asli (`INV-{leaseId}-{periode}`) secara dinamis dan aman, sehingga pencarian invoice di database tetap akurat.

---

### [2026-08-05] Pembersihan Database Tenant Pengujian (Testing)

#### Latar Belakang & Masalah
* Database lokal memiliki terlalu banyak data uji (mock data) yang membingungkan selama pengujian pembayaran online Midtrans.
* Diperlukan database yang bersih dengan mempertahankan hanya satu akun tenant uji asli yang benar-benar valid, yaitu **AduduKOTAK** (`luvianuraini04@gmail.com` / `088712368127`).

#### Keputusan Teknis yang Diambil
1. **Penghapusan Transaksional Bertahap via Script**:
   * *Keputusan*: Membuat script pembersih database yang aman di `prisma/cleanup-tenants.ts` untuk menghapus seluruh relasi data tenant lain secara bertahap dan teratur (WebhookLog -> DiscountClaim -> Invoice -> Report -> Lease -> TenantProfile -> User).
   * *Rasional*: Menghindari kegagalan eksekusi akibat *Foreign Key Constraints* di PostgreSQL DB.
2. **Pemberlakuan Safety Check**:
   * *Keputusan*: Menambahkan filter pencarian `AduduKOTAK` terlebih dahulu sebelum menghapus data lain. Jika tidak ditemukan, script otomatis membatalkan operasi.
   * *Rasional*: Mencegah hilangnya data tak sengaja.

---

### [2026-08-06] Perbaikan Error Midtrans `transaction_details.order_id is too long` (Limit 50 Chars)

#### Latar Belakang & Masalah
* Saat tenant melakukan checkout Midtrans, API Midtrans merespon `400 Bad Request` dengan error message: `transaction_details.order_id is too long`.
* Penyebabnya: Kombinasi `INV-${invoice.leaseId}-${billingPeriod}-${Date.now()}` memiliki panjang **51 karakter** (misal: `INV-cmsfcursv0002qgzflib4g9kz-2026-08-1785990482657`), sedangkan Midtrans API menetapkan batas maksimal 50 karakter untuk `order_id`.

#### Keputusan Teknis yang Diambil
1. **Konversi Timestamp ke Base 36 (`Date.now().toString(36)`)**:
   * *Keputusan*: Mengubah suffix timestamp dari desimal 13 karakter (`Date.now()`) menjadi string Base-36 (8 karakter).
   * *Rasional*: Memotong panjang string `midtransOrderId` dari 51 karakter menjadi **46 karakter** (selalu di bawah batas 50 karakter Midtrans API) tanpa mengurangi keunikan suffix per transaksi.
2. **Peningkatan Pencocokan Webhook (`findFirst` dengan `OR`)**:
   * *Keputusan*: Memperkuat pencarian invoice di Webhook Handler Midtrans agar dapat mencocokkan via `providerRef` ATAU `baseExternalId`.
   * *Rasional*: Menjamin pencarian invoice di webhook handler 100% aman dan kompatibel dengan berbagai format transaksi.

---

### [2026-08-06] Pemisahan Logika Penutupan Banner Pengumuman dengan Status Dibaca Lonceng Notifikasi

#### Latar Belakang & Masalah
* Sebelumnya, `AnnouncementBanner` di PWA Tenant memfilter pengumuman berdasarkan `!isRead`. Akibatnya, ketika tenant menekan tombol "Tandai Dibaca" pada dropdown Lonceng Notifikasi, Banner Pengumuman di layar PWA otomatis menghilang.
* Hal ini membingungkan tenant karena penandaan dibaca pada lonceng notifikasi seharusnya tidak secara otomatis membuang banner pengumuman yang ada di layar utama. Banner seharusnya hanya hilang jika tenant secara eksplisit menekan tombol **[X]** pada banner tersebut.

#### Keputusan Teknis yang Diambil
1. **Pemisahan Kriteria Tampilan Banner dari `isRead`**:
   * *Keputusan*: Menghapus `!n.isRead` dari filter `AnnouncementBanner`. Banner kini menampilkan semua pengumuman bertipe `ANNOUNCEMENT`.
   * *Rasional*: Memastikan status tandai dibaca di lonceng notifikasi tidak memengaruhi keberadaan banner pengumuman di layar PWA.
2. **Penutupan Eksplisit via `localStorage` Persistence**:
   * *Keputusan*: Banner hanya ditutup saat tombol **[X]** pada banner diklik. ID pengumuman yang ditutup disimpan di `localStorage` (`oskost_dismissed_announcements`).
   * *Rasional*: Penutupan banner bertahan antar navigasi dan refresh halaman khusus pada perangkat tenant tersebut, sambil tetap menjalankan `markNotificationAsReadAction` di latar belakang.

---

### [2026-08-06] Arsitektur Real-Time Auto-Refresh Mulus tanpa Refresh Manual

#### Latar Belakang & Masalah
* Pengguna (Tenant PWA & Admin) sebelumnya harus me-refresh browser secara manual untuk melihat update status terbaru (misal: saat pembayaran Midtrans lunas, pengumuman baru terbit, atau status laporan diperbarui).
* Diperlukan mekanisme pembaruan data real-time yang seamless, hemat baterai untuk HP Android entry-level, dan tidak menyebabkan layar berkedip (*flicker*).

#### Keputusan Teknis yang Diambil
1. **Custom Hook `useAutoRefresh` (Tab Focus & Background Active Polling)**:
   * *Keputusan*: Membuat hook `useAutoRefresh` yang mendengarkan event `visibilitychange` & `focus`. Begitu tenant/admin kembali ke layar app, data otomatis diperbarui via `router.refresh()`. Selain itu, saat tab aktif (`!document.hidden`), interval halus (20 detik) akan berjalan di latar belakang.
   * *Rasional*: Hemat daya baterai (karena interval otomatis mati saat tab di-background) dan menjamin data selalu segar saat pengguna melihat layar.
2. **Immediate Post-Payment Fast-Polling (Midtrans)**:
   * *Keputusan*: Menghapus `window.location.reload()` pada `PaymentSelector` dan `SnapPendingHandler`. Digantikan dengan loop `pollRefresh()` yang memicu `router.refresh()` 3-4 kali secara halus pasca transaksi Snap ditutup/diselesaikan.
   * *Rasional*: Begitu webhook Midtrans memverifikasi status pembayaran di server, status tagihan di HP tenant berubah menjadi **PAID** secara instan tanpa reload halaman full.
3. **PWA Service Worker Push Broadcast**:
   * *Keputusan*: Menambahkan `postMessage` (`PUSH_NOTIFICATION_RECEIVED` & `NOTIFICATION_CLICKED`) di `public/sw.js` yang didengarkan oleh `useAutoRefresh`.
   * *Rasional*: Begitu push notification sampai atau diklik, tampilan layar PWA langsung ter-update secara otomatis.

---

### [2026-08-06] Arsitektur Ideal Real-Time (Supabase Realtime & Focus Listener)

#### Latar Belakang & Masalah
* Penggunaan `setInterval(..., 20000)` global pada seluruh aplikasi PWA Tenant berisiko menguras baterai & paket data HP Android entry-level penyewa secara berlebihan saat tidak ada transaksi.
* Diperlukan pendekatan berbasis momen (*Moment-Based Architecture*) yang mengaktifkan koneksi real-time murni (instan milidetik) hanya pada layar kritis (pembayaran pending & admin dashboard).

#### Keputusan Teknis yang Diambil
1. **Pembersihan Polling Global (`useAutoRefresh`)**:
   * *Keputusan*: Menghapus `setInterval` 20 detik global dari `useAutoRefresh`. Menggantikannya murni dengan *Window Focus / Visibility Listener* dan Service Worker broadcast event.
   * *Rasional*: Penghematan baterai 100% saat HP/tab penyewa dibiarkan terbuka.
2. **Supabase Realtime pada Layar Pembayaran Pending (`SnapPendingHandler`)**:
   * *Keputusan*: Menambahkan Supabase Realtime subscription (`postgres_changes` pada tabel `Invoice` filter `id=eq.${invoiceId}`).
   * *Rasional*: Begitu webhook Midtrans memperbarui status tagihan di DB, layar HP penyewa yang sedang menatap status `PENDING` langsung ber-update menjadi `PAID` dalam kurun milidetik secara instan.
3. **Supabase Realtime pada Admin Dashboard (`useAdminRealtime`)**:
   * *Keputusan*: Mengintegrasikan `useAdminRealtime` di `AdminHeader` untuk berlangganan perubahan tabel `Invoice` & `Report`.
   * *Rasional*: Admin di laptop/PC mendapatkan pembaruan tagihan lunas dan laporan keluhan secara instan tanpa perlu refresh manual.

---

### [2026-08-06] Efek Visual Shining / Shimmer Light pada Tombol Klaim Diskon Google Review

#### Latar Belakang & Masalah
* Tombol "Klaim Bebas Biaya Admin (Google Review Bintang 5)" di PWA Tenant sebelumnya terlihat seperti tombol statis biasa, kurang menonjol, dan kurang mengarahkan perhatian pengguna bahwa tombol tersebut interaktif dan bisa diklik untuk mendapatkan promo.

#### Keputusan Teknis yang Diambil
1. **Penerapan Shimmer Light Sweep Effect & Glowing Amber Shadow**:
   * *Keputusan*: Mengatur ulang styling tombol `PromoClaimDialog` dengan menambahkan efek kilauan cahaya bergerak (`@keyframes shimmer` CSS) melintasi permukaan tombol secara terus-menerus, dipadukan dengan *glowing amber shadow* `shadow-[0_0_15px_rgba(245,158,11,0.2)]` dan ikon `Sparkles` beranimasi saat hover.
   * *Rasional*: Memberikan tampilan visual *premium* dan *interaktif* yang menarik perhatian penyewa untuk memanfaatkan promo Google Review Bintang 5 secara intuitif.

---

### [2026-08-07] Tahap 1 & 2 Persiapan Launching: Pembaruan Milestone, Dokumen LAUNCH_CHECKLIST.md, & Suite E2E Playwright

#### Latar Belakang & Masalah
* Proyek telah menyelesaikan seluruh modul fitur utama (Fase 1–6) termasuk Payment Gateway Midtrans & Admin Billing, namun dokumen `milestone.md` belum memperbarui seksi Keuangan dari status `[-] Ditunda`.
* Diperlukan dokumen centang resmi pra-rilis (`LAUNCH_CHECKLIST.md`) untuk memandu pengujian manual transaksi keuangan produksi Midtrans dan verifikasi kesiapan sistem secara terstruktur.
* Diperlukan suite pengujian otomatis (E2E Playwright) yang mencakup Landing Page, Auth Flow, Proteksi Middleware, dan Responsivitas PWA Mobile.

#### Keputusan Teknis yang Diambil
1. **Pembaruan Milestone Proyek (`milestone.md`)**:
   * *Keputusan*: Mengubah status Seksi 5 (*Keuangan & Tagihan*) dan Seksi 8 (*Data Keuangan Realtime*) di `milestone.md` menjadi `[x] Selesai`.
   * *Rasional*: Menjamin keselarasan antara dokumentasi status proyek dan fitur yang sudah aktif 100% di codebase.
2. **Penerbitan Dokumen Checklist Peluncuran (`LAUNCH_CHECKLIST.md`)**:
   * *Keputusan*: Membuat file `LAUNCH_CHECKLIST.md` di root proyek yang memuat 6 kelompok pemeriksaan (Core Features, Panduan Testing Manual Keuangan Midtrans Sandbox/Production, Security Level, Performance & PWA, Database Readiness, dan Docker/Production Environment).
   * *Rasional*: Memudahkan tim pengembang dan owner proyek dalam melakukan sign-off resmi sebelum rilis ke server produksi.
3. **Penyusunan Suite Pengujian Otomatis Playwright (`tests/`)**:
   * *Keputusan*: Membuat 3 berkas spec Playwright terpisah:
     - `tests/landing-page.spec.ts`: Pengujian rendering landing page, katalog kamar, peta lokasi, FAQ, dan detail kamar.
     - `tests/auth-and-security.spec.ts`: Pengujian form login, invalid credentials error, dan pengalihan otomatis middleware anonim dari `/admin` & `/dashboard` ke `/login`.
     - `tests/pwa-tenant-mobile.spec.ts`: Pengujian tampilan antarmuka pada mobile viewport (390x844).
   * *Rasional*: Memastikan alur utama aplikasi terlindungi dari regresi kode dan berjalan mulus sebelum rilis.
