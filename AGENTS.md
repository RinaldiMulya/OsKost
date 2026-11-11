# OsKost — Master AI Agent Instructions (Web & Backend SaaS)

> **OsKost** adalah Platform **Multi-Tenant B2B SaaS** untuk Manajemen Properti Kost modern di Indonesia (dengan Pilot Property: Smartkost Pulo Jahe).
> Platform ini mencakup:
> - **Web Marketing Publik** (`oskost.id`)
> - **Web Admin Dashboard Pemilik Kost** (`app.oskost.id`)
> - **Super Admin Platform** (`oskost.id/super-admin`)
> - **Centralized Standalone REST API v1** (`api.oskost.id` / `/api/v1/*`) untuk Flutter Mobile Tenant App
>
> ⚠️ **CATATAN KRUSIAL**: Rute `(pwaTenant)` di web telah di-**SUNSET (DIPENSIUNKAN)**. Seluruh interaksi penghuni (tenant) dialihkan 100% ke aplikasi **Flutter Mobile Native Sanctuary**. Dilarang mengembangkan atau memperbaiki fitur PWA Tenant di repositori web!

---

## 1. Tech Stack & Versi

| Layer | Teknologi | Versi | Catatan |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `16.0` | React Server Components, Server Actions, Route Handlers |
| **UI Library** | React | `19.0` | Actions primitives, `useActionState`, `useOptimistic` |
| **Styling** | Tailwind CSS + tw-animate-css | `v4` | Oxide engine, class-based utility |
| **Components** | Shadcn UI (new-york style) + Radix UI | Latest | Headless, accessible primitives |
| **Icons** | Lucide React | Latest | Import via `@lucide/react` (treeshakeable) |
| **Animation** | Framer Motion | `12` | Subtle micro-interactions |
| **Database** | PostgreSQL via Prisma | `Prisma 7` | Driver `@prisma/adapter-pg` |
| **Auth Web** | NextAuth.js v5 (Auth.js) | `5.0.0-beta` | Session cookie HTTP-Only untuk Web Dashboard |
| **Auth Mobile API**| Custom JWT Bearer Token | — | Access Token (15m) + Refresh Token Rotation (30d) |
| **Storage** | Supabase Storage | Latest | Bucket `Oskost-Data-Private` (KTP) & Public |
| **Media Cloud** | Cloudinary | `^2.5.0` | Kompresi WebP & signature upload bukti kerusakan |
| **Payment Gateway**| Midtrans Snap & Webhook | Latest | Pembayaran Langganan SaaS & Uang Sewa Kamar |
| **State Web** | Jotai (client) + nuqs (URL search params) | Latest | URL-synchronized state management |
| **Validation** | Zod v4 | Latest | Runtime validation untuk Zod schema |
| **Package Manager**| pnpm | Latest | Workspace manager |

---

## 2. Arsitektur & Konvensi Folder (Multi-Tenant SaaS)

```
src/
├── app/                               # Next.js App Router
│   ├── (dashboard)/                   # Dashboard Admin Pemilik Kost (app.oskost.id)
│   │   ├── dashboard/page.tsx         # Overview: Pendapatan, Okupansi, Tunggakan
│   │   ├── rooms/                     # Manajemen Kamar (CRUD 11+ pintu, 360° viewer)
│   │   ├── tenants/                   # Manajemen Penghuni & Riwayat Sewa
│   │   ├── billing/                   # Manajemen Tagihan & Rekonsiliasi Kas
│   │   ├── reports/                   # Disposisi Tiket Kerusakan Fasilitas
│   │   └── settings/                  # Profil Kost & Paket Langganan SaaS
│   ├── (marketing)/                   # Landing Page Publik (oskost.id)
│   │   ├── page.tsx                   # Beranda pemasaran, benefit, booking steps
│   │   └── rooms/                     # Katalog kamar publik & 360° tour
│   ├── (superadmin)/                  # [SaaS Pivot] Dashboard HQ OsKost (oskost.id/super-admin)
│   ├── api/
│   │   ├── v1/                        # Centralized Standalone REST API untuk Flutter Mobile
│   │   │   ├── auth/                  # /token, /refresh, /logout
│   │   │   ├── me/                    # Profil tenant, status lease aktif, & dynamic theme
│   │   │   ├── invoices/              # List tagihan, detail, & Snap token request
│   │   │   ├── reports/               # Submit komplain, upload signature, tracking
│   │   │   ├── media/                 # Cloudinary signing & direct upload helper
│   │   │   ├── notifications/         # Pengumuman & notifikasi
│   │   │   └── push/                  # Registrasi token FCM / Web Push
│   │   ├── webhooks/
│   │   │   ├── midtrans/              # Webhook pembayaran sewa kamar tenant
│   │   │   └── saas-subscription/     # Webhook pembayaran langganan SaaS owner
│   │   └── cron/                      # Otomasi denda sewa & jatuh tempo langganan
│   ├── login/page.tsx                 # Portal Login Web Admin & Owner
│   └── layout.tsx                     # Root Layout
├── features/                          # Feature-Sliced Design (Domain Services)
│   ├── admin/                         # Aksi administratif & manajemen akun
│   ├── auth/                          # Layanan autentikasi NextAuth & password reset
│   ├── dashboard/                     # Statistik okupansi, grafik pendapatan, export CSV
│   ├── landing/                       # Komponen Hero, Booking Steps, Map, FAQ
│   ├── notifications/                 # Layanan broadcast pengumuman
│   ├── payment/                       # Layanan integrasi Midtrans & promo discount
│   ├── reports/                       # Layanan penanganan tiket kerusakan staf
│   ├── rooms/                         # Layanan katalog kamar & konfigurasi panorama 360°
│   ├── saas/                          # [SaaS Pivot] Layanan kuota tier & billing langganan
│   └── tenants/                       # Layanan kontrak sewa, enkripsi KTP, penagihan
├── components/
│   ├── ui/                            # Shadcn UI primitives (Button, Card, Dialog, Table)
│   └── shared/                        # Shared reusable cross-domain components
├── lib/
│   ├── db.ts                          # Prisma Client singleton (`@prisma/adapter-pg`)
│   ├── jwt.ts                         # Enkripsi & verifikasi JWT Bearer Token Mobile
│   ├── api-response.ts                # Standar Envelope response JSON builder
│   ├── api-auth.ts                    # Middleware verifikasi Bearer JWT untuk route handlers
│   ├── cache-tags.ts                  # Sentralisasi definisi CACHE_TAGS Next.js
│   ├── utils.ts                       # Helper `cn()` (clsx + tailwind-merge)
│   ├── security/ktp-crypto.ts         # Enkripsi simetris AES-256 dokumen sensitif KTP
│   └── supabase/                      # Client Supabase Private/Public storage
├── middleware.ts                      # Subdomain routing (app.*, oskost.*) & auth guard
```

---

## 3. Aturan Kode yang WAJIB Diikuti (Engineering Rules)

### 🔒 Rule #1: Isolasi Data Multi-Tenant yang Ketat (Mandatory `propertyId` Scoping)
* **DILARANG KERAS** melakukan query Prisma secara global tanpa filter tenant.
* Setiap query di Service Layer (`src/features/*/*-service.ts`) **WAJIB menyertakan `where: { propertyId }`** (atau `{ ownerId }`).
  ```typescript
  // ❌ SALAH (Potensi Bocor Data Antar Kost):
  const rooms = await prisma.room.findMany();

  // ✅ BENAR (Terisolasi per Properti):
  const rooms = await prisma.room.findMany({
    where: { propertyId: currentPropertyId },
  });
  ```

### 👥 Rule #2: Hierarki 5 Role Pengguna
Sesuai skema `SCHEMA_DRAFT_V2_SAAS_MOBILE.prisma`, dukung 5 jenjang akses:
1. `SUPER_ADMIN`: Akses penuh ke seluruh platform, statistik MRR, dan manajemen tenant B2B.
2. `PROPERTY_OWNER`: Pemilik kost yang berlangganan SaaS (mengelola kamar, keuangan, staff kost miliknya).
3. `ADMIN`: Administrator kost lokal (operasional harian cabang).
4. `MANAGER`: Pengawas lapangan / penanggung jawab operasional kost.
5. `TENANT`: Penghuni kamar (akses via Aplikasi Mobile Flutter).

### 💳 Rule #3: Penegakan Kuota Langganan SaaS (SaaS Quota Guard)
* Sebelum membuat kamar baru di `src/features/rooms/room-service.ts`, sistem wajib memeriksa:
  `activeRoomsCount < currentPlan.maxRooms`.
* Jika kuota terlampaui, kembalikan error `HTTP 402 Payment Required` untuk memicu dialog Upgrade Paket SaaS.

### ⚡ Rule #4: Single Service Layer Pattern & Caching
* **DILARANG** melakukan query Prisma langsung di Route Handlers (`/api/v1/*`) atau Server Actions (`actions.ts`).
* Logika bisnis murni wajib berada di `src/features/<feature>/<feature>-service.ts`.
* Gunakan `React.cache()` dan `unstable_cache()` dengan tag dari `CACHE_TAGS` pada service query.
* Setelah mutasi di Server Action, panggil `updateTag(CACHE_TAGS.XXX)`.

### 📦 Rule #5: Standar Respons JSON REST API v1 (Envelope Pattern)
Seluruh endpoint di `/api/v1/*` WAJIB mengembalikan format envelope seragam:
```json
// Berhasil
{
  "success": true,
  "data": { ... },
  "meta": { "total": 10, "page": 1, "limit": 20 }
}

// Gagal
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Sesi Anda telah kedaluwarsa.",
    "details": null
  }
}
```

### 📱 Rule #6: Dynamic White-Labeling Metadata untuk Mobile
Pada endpoint `GET /api/v1/me`, backend wajib merespons dengan metadata properti penyewa:
- `property.name`, `property.logoUrl`, `property.primaryColorHex`, `property.accentColorHex`.
Flutter akan membaca token ini untuk mengubah tema visual secara dinamis.

### 🛑 Rule #7: Reserved Slug Blacklist Validation
DILARANG mengizinkan pendaftaran atau pengubahan `slug` properti kost yang bentrok dengan nama sistem reserved (misal: `app`, `api`, `admin`, `super-admin`, `oskost`, `login`, `register`, `dashboard`, `mail`, `docs`, `billing`, `webhook`, `www`). Seluruh validasi slug WAJIB memeriksa daftar hitam di `src/lib/constants/reserved-slugs.ts`.

### 💰 Rule #8: Dual Cashflow & Direct Merchant Isolation
- **SaaS Subscription (Owner ➔ Platform)**: Diproses melalui webhook `/api/webhooks/saas-subscription` ke rekening OsKost pusat.
- **Uang Sewa Kamar (Tenant ➔ Owner)**: Diproses via Direct Merchant Midtrans atau transfer manual bank owner langsung ke rekening masing-masing pemilik kost tanpa penampungan/escrow pusat (`/api/webhooks/midtrans`).

---

## 4. Pelacakan Milestone & Kesiapan Rilis (Single Source of Truth)

Seluruh pelacakan milestone, roadmap, dan daftar centang kesiapan peluncuran (launch checklist) **TERPUSAT 100%** di:  
👉 [Docs/06_PRODUCTION_CHECKLIST_AND_ROADMAP.md](file:///d:/Local-Project/Docs/06_PRODUCTION_CHECKLIST_AND_ROADMAP.md)

*Dilarang membuat file checklist atau milestone lokal terpisah di folder `oskost/`!*

---

## 5. Panduan Verifikasi & Quality Check
Setelah mengubah atau membuat kode baru di repositori web:
1. Jalankan `pnpm exec tsc --noEmit` di folder `oskost/` untuk memastikan tidak ada kesalahan tipe TypeScript.
2. Pastikan relasi model baru di `prisma/schema.prisma` konsisten dengan `Docs/01_MASTER_ARCHITECTURE.md`.

