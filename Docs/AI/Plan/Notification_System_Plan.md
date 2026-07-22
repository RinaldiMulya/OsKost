# Rencana Implementasi Sistem Notifikasi Terpusat (OsKost)

## Deskripsi Singkat
Berdasarkan analisis dokumen panduan dan arsitektur, OsKost membutuhkan sistem notifikasi *omnichannel* (WhatsApp, PWA Web Push, dan In-App/Real-time) untuk menangani poin 13 di milestone. Rencana ini menguraikan arsitektur dan tahapan eksekusinya. 

**Catatan:** Pengerjaan plan ini akan dilakukan SETELAH core MVP (Keuangan, Payment Gateway, Checkout, dll) selesai.

## Arsitektur Terpusat (Notification Service)
Sistem akan dirancang dengan pendekatan **Notification Service** yang terpusat. Artinya, ketika suatu aksi terjadi (misal: webhook tagihan sukses dipanggil), kode tersebut cukup memanggil `sendNotification({ type: 'PAYMENT_SUCCESS', userId })`. Service ini kemudian akan otomatis menentukan *channel* apa yang aktif dan sesuai (WA, Push, atau In-App) berdasarkan jenis notifikasi.

## Proposed Changes

### 1. Pembaruan Database (Prisma Schema)
- **`Notification` Model**: Menyimpan data histori notifikasi (In-App bell notifications) dengan flag `isRead`.
- **`PushSubscription` Model**: Menyimpan endpoint VAPID dan p256dh keys milik masing-masing *device* user agar server bisa mengirim Push Notif ke PWA mereka.
### 2. PWA Web Push Infrastructure
- **`src/app/api/web-push/route.ts`**: Endpoint untuk VAPID key exchange, men-save *subscription* dari device, dan endpoint percobaan kirim *push*.
- **`public/sw.js`** (atau konfigurasi `next-pwa`): Menambahkan listener `self.addEventListener('push')` dan `self.addEventListener('notificationclick')` agar PWA bisa memunculkan popup OS di HP/Desktop.
- **`src/hooks/use-push-notification.ts`**: Hook standar untuk me-request *permission* ke user (`Notification.requestPermission()`).

### 3. UI In-App & Event Sync
- **`src/components/shared/notification-bell.tsx`**: Dropdown notifikasi di navigasi atas.
- **Server-Sent Events (SSE) Route**: (Opsional/Jika Diperlukan) Agar status bayar di dashboard real-time tanpa refresh saat webhook dipanggil, kita bisa membuat route SSE ringan.

## Tahapan Implementasi (Phases)

Eksekusi dibagi menjadi **3 Fase**:

1. **Fase 1: Infrastruktur Database & PWA Web Push API**
   - Setup skema DB (Notif In-app & Web Push).
   - Konfigurasi VAPID keys.
   - Modifikasi Service Worker untuk listen Push.
   - UI Request Permission di Dashboard Tenant PWA.
   - *Goal/Testing:* Kirim popup push notif ke HP Tenant.

2. **Fase 2: Sentralisasi Event & Event Binding (Integration)**
   - Membuat `notification-service.ts`.
   - Mengaitkan trigger notifikasi ke fitur nyata:
     - Webhook Payment -> Kirim Push Notif & In-app ke Tenant.
     - Laporan Keluhan Baru -> Kirim In-App ke Admin.
     - Buat Tagihan -> Kirim Push Notif ke Tenant.

> **Catatan Penting:** Untuk Fase 1 nanti, kita perlu meng-generate pasangan kunci kriptografi (VAPID) `NEXT_PUBLIC_VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY` untuk ditaruh di `.env`.
