# OsKost — PWA & Service Worker Architectural Instructions

Dokumen ini berisi instruksi khusus untuk pengembangan, modifikasi, dan tata kelola Progressive Web App (PWA) pada proyek OsKost. Seluruh agen AI (Antigravity/Claude) WAJIB mematuhi aturan isolasi dan optimasi performa ini demi menjaga SEO Landing Page dan kompatibilitas perangkat Android entry-level.

## 1. Strategi Ring-Fencing & Isolasi Manifest

Aplikasi OsKost adalah monolitik berbasis Next.js 16 yang menggabungkan Landing Page, Admin Dashboard, dan PWA Tenant. PWA harus diisolasi secara ketat agar TIDAK memengaruhi performa atau memicu prompt instalasi di halaman publik (Landing Page).

### Aturan Manifest & Layout Boundaries:

* **ROOT LAYOUT (`src/app/layout.tsx`):** DILARANG KERAS memanggil atau mendaftarkan file `manifest.json` atau `manifest.ts` di dalam objek Metadata utama. Google Bot harus merayapi Landing Page murni sebagai situs web statis/SSR biasa demi mengoptimalkan Core Web Vitals dan LCP/FCP < 1.5s.
* **TENANT ROUTE GROUP (`src/app/(pwaTenant)/layout.tsx`):** Registrasi manifest dan meta tags PWA WAJIB diletakkan eksklusif di dalam layout ini.

```typescript
// src/app/(pwaTenant)/layout.tsx
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Dashboard Penghuni | OsKost",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OsKost",
  },
};
```

## 2. Resolusi Konflik Turbopack vs Webpack (Dev vs Prod)

Next.js 16 menggunakan Turbopack (berbasis Rust) sebagai standar baru untuk proses development (`next dev --turbo`), sedangkan bundler PWA utama `@ducanh2912/next-pwa` masih memiliki ketergantungan pada ekosistem Webpack (`workbox-webpack-plugin`).

### Konvensi Pengaturan Lingkungan:

* **Mode Pengembangan (Development):** PWA harus dimatikan secara total melalui variabel lingkungan. Hal ini mencegah kegagalan kompilasi pada Turbopack dan mengeliminasi masalah "stale cache trap" saat developer sedang memodifikasi kode UI harian.
* **Mode Produksi (Production):** Saat menjalankan perintah `next build`, Next.js akan secara otomatis beralih menggunakan kompiler Webpack standar untuk menyuntikkan manifes enkapsulasi dan men-generate berkas `sw.js` ke dalam folder `/public`.

### Snippet Konfigurasi `next.config.ts`:

```typescript
import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = withPWAInit({
  dest: "public",
  disable: isDev, // Menonaktifkan PWA di mode lokal/dev agar kompatibel dengan Turbopack
  register: true,
  skipWaiting: true,
  workboxOptions: {
    disableDevLogs: true,
    exclude: [
      /^\/admin\/.*$/i,       // Eksklusi Admin Dashboard dari service worker
      /^\/api\/.*$/i,         // Eksklusi endpoint REST API internal Next.js
      /\.map$/,               // Eksklusi file sourcemap
    ],
  },
});

const nextConfig = {
  reactStrictMode: true,
  // Konfigurasi internal Next.js 16 lainnya
};

export default withPWA(nextConfig);
```

## 3. Konfigurasi Manifest & Strategi Login Terisolasi

Untuk menghindari hilangnya cangkang PWA (address bar browser muncul kembali) saat sesi pengguna habis, manajemen rute dan parameter cakupan (scope) pada manifest harus dikunci pada level root `/` dengan parameter `start_url` yang spesifik.

### Berkas Manifes (`public/manifest.json`):

```json
{
  "name": "OsKost Tenant Area",
  "short_name": "OsKost",
  "description": "Sistem Smartkost Pulo Jahe untuk Penghuni",
  "start_url": "/dashboard",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Mekanisme Siklus Login (User Flow):

Jika masa aktif sesi token di HP pengguna habis, Middleware NextAuth akan mendeteksi status unauthorized dan mengarahkan rute secara otomatis dari `/dashboard` ke halaman `/login`.

Karena konfigurasi `"scope": "/"` mencakup seluruh pohon rute aplikasi, browser webview akan mempertahankan status standalone mode tanpa menampilkan bar navigasi URL Chrome/Safari biasa. Pengguna tetap merasa berada di dalam aplikasi mobile.

## 4. Manajemen Strategi Google Workbox (MVP Cache & Storage)

PWA OsKost menargetkan pekerja pabrik dengan spesifikasi perangkat keras kategori entry-level. Pemilihan strategi pemrosesan data (caching strategies) dipecah berdasarkan sensitivitas fungsionalitas modul pada domain fitur (FSD).

### A. Modul Keuangan / Cek Tagihan (`src/features/billing`)

**Strategi:** Network First

**Rasionalisasi:** Data transaksi finansial dan penagihan bersifat sensitif dan tidak toleran terhadap data usang (stale data). Sistem wajib meminta data teraktual langsung dari database PostgreSQL. File cache lokal hanya boleh digunakan sebagai jalur alternatif sekunder (fallback) ketika jaringan seluler terputus total.

### B. Modul Pelaporan Kerusakan / Maintenance (`src/features/reports`)

**Strategi:** Background Sync (Workbox Sync Plugin)

**Rasionalisasi:** Memungkinkan pelaporan dari area blank spot (misal: area kamar mandi kost yang minim sinyal). Input form teks dan unggahan media (Supabase Private Bucket) ditahan sementara di dalam antrean IndexedDB lokal. Ketika Service Worker mendeteksi pemulihan sinyal internet secara stabil, data laporan akan dilempar secara otomatis ke backend via Server Actions tanpa intervensi manual dari pengguna.

### C. Komponen App Shell & Desain UI (`src/components/ui`, `src/features/dashboard`)

**Strategi:** Stale-While-Revalidate

**Rasionalisasi:** Berkas CSS, Font internal Google, Ikon Lucide, dan pondasi komponen UI dari Shadcn UI wajib dimuat secara instan guna memenuhi indikator NFR dengan target First Contentful Paint (FCP) di bawah 1.5 detik.

### D. Manajemen Pembersihan Kapasitas Cache

**Aturan Batasan (`workbox-expiration`):** Berkas gambar kiriman keluhan atau foto bukti bayar yang disimpan pada runtime cache storage tidak boleh melebihi batas 50 entri berkas atau berumur lebih dari 30 hari untuk menjaga ruang penyimpanan internal gawai pengguna.

**Aksi Pasca-Logout:** Komponen tombol logout pada sisi klien wajib mengeksekusi metode penghapusan cache database instan guna mengamankan sisa data profil penghuni dari potensi kebocoran akses pihak ketiga pada gawai bersama.

```typescript
// Contoh fungsi pembersihan cache yang dipanggil saat logout di client
async function clearAllOskostCache() {
  if ('serviceWorker' in navigator) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
}
```

## 5. Protokol Pengembangan (Development Protocol) untuk Fitur & UI PWA

* **Modifikasi UI/UX (Warna, Layout, Komponen):** Agen AI WAJIB mengeksekusi perubahan ini langsung pada komponen di dalam `src/app/(pwaTenant)/` atau `src/features/` terkait menggunakan mode `pnpm dev --turbo`. DILARANG mengubah parameter `disable` pada `next.config.ts` menjadi `false` saat fase desain UI.
* **Pengujian Fitur Siklus PWA (Offline, SW, Sync):** Jika instruksi mengharuskan pengujian fungsionalitas Service Worker, instruksikan pengguna untuk menjalankan rangkaian perintah kompilasi produksi secara lokal (`pnpm build && pnpm start`), bukan melakukan modifikasi pada konfigurasi *environment* pengembangan.