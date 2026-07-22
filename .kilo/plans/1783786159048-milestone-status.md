# Plan: Aktivasi Modul Keuangan & Tagihan serta Laporan Keluhan

Rencana ini disiapkan untuk mengaktifkan kembali modul Keuangan & Tagihan (Fase 1.5) serta Laporan Keluhan & Maintenance (Fase 1.6) di dalam `milestone.md` sesuai dengan instruksi terbaru Anda.

## 📝 Perubahan pada `milestone.md`
Sebagai AI Agent dalam *Native Plan Mode*, saya hanya bertindak sebagai perencana teknis/pimpinan arsitektur dan tidak diperkenankan mengubah file sumber (termasuk `milestone.md` karena pembatasan izin tool `edit` pada file selain `/plans/`). 

Oleh karena itu, implementor berikutnya harus mengubah status dari ditunda (`[-]`) menjadi belum dimulai (`[ ]`) serta menghapus label penundaan menunggu PWA pada file `milestone.md`:

### Modul 5: Keuangan & Tagihan
- Mengubah status penundaan agar siap dikerjakan.
- [ ] Halaman Daftar Tagihan (Filter: Lunas, Belum Lunas, Tunggakan)
- [ ] Pembuatan Tagihan Bulanan Otomatis (Cron Job / Scheduled Action)
- [ ] Cetak/Download Bukti Pembayaran (Receipt PDF)
- [ ] Laporan Keuangan Bulanan & Tahunan (Ringkasan Pemasukan)
- [ ] Grafik Revenue Trend per bulan/tahun

### Modul 6: Laporan Keluhan & Maintenance
- Mengubah status penundaan agar siap dikerjakan.
- [ ] Schema database Laporan (`Report`, `ReportImage`)
- [ ] Halaman Manajemen Tiket Keluhan (Open, In Progress, Resolved)
- [ ] Form Admin Catat Keluhan/Kerusakan baru
- [ ] Upload Foto Kerusakan ke Supabase Storage

---

## 🧠 Konteks Proyek OsKost (Untuk Referensi Implementasi)

### Ringkasan Proyek
**OsKost** (Smartkost Pulo Jahe System) adalah aplikasi manajemen kost berbasis web dengan Admin Dashboard dan PWA Tenant mobile-first.

### Teknologi Utama
- **Framework**: Next.js 16 (App Router) + React 19
- **Database**: PostgreSQL via Prisma ORM v7 (connection pool max: 10)
- **Auth**: NextAuth.js v5.0.0-beta.30 (Credentials - email/phone)
- **Storage**: Supabase Storage (Public: panorama/KTP previews, Private: sensitive docs)
- **UI**: Shadcn UI (New York style) + Radix UI + Tailwind CSS v4
- **Caching**: React.cache() + unstable_cache() dengan tag terpusat di `src/lib/cache-tags.ts`

### Arsitektur Folder (Feature-Sliced Design)
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/admin/  # Admin routes (protected: ADMIN role)
│   ├── (pwaTenant)/        # Tenant PWA routes (protected: TENANT role)
│   └── ...                 # marketing, login, rooms
├── features/               # Feature-sliced modules
│   ├── rooms/              # Room management
│   ├── tenants/            # Tenant management
│   ├── tenant-pwa/         # PWA tenant features (sudah ada laporan)
│   ├── dashboard/          # Admin dashboard widgets
│   └── ...                 # landing, auth
├── lib/                    # Shared libraries
│   ├── db.ts               # Prisma client singleton
│   ├── cache-tags.ts       # Centralized cache tag definitions
│   └── supabase/           # Supabase client helpers
└── components/             # Shared UI components
    ├── ui/                 # Shadcn UI primitives
    ├── admin/              # Admin-specific components
    ├── tenant/             # Tenant-specific components
    └── shared/             # Cross-role components
```

### Skema Database Relevan (Prisma)
```prisma
model Report {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  photoUrl    String?  // URL ke foto di Supabase Storage
  status      ReportStatus @default(OPEN) // OPEN, IN_PROGRESS, RESOLVED
  leaseId     String
  lease       Lease    @relation(fields: [leaseId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ReportStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}
```

### Implementasi Laporan Keluhan yang Sudah Ada (PWA Tenant)
**Lokasi**: `src/features/tenant-pwa/`
- **Komponen**: `report-dialog-form.tsx` - Form pelaporan kerusakan untuk tenant
- **Service**: `tenant-pwa-service.ts` - Fungsi `createMaintenanceReport()` dan `getTenantReports()`
- **Server Action**: `actions.ts` - `submitMaintenanceReportAction`

**Alur Kerja Tenant**:
1. Tenant buka dialog "Lapor Kerusakan Baru" di PWA tenant
2. Mengisi judul, deskripsi, dan foto opsional (diunggah ke Supabase Storage bucket `Oskost-Data-Public` di path `reports/{userId}/`)
3. Saat submit:
   - Validasi input dengan Zod schema (`reportSubmitSchema`)
   - Memanggil `createMaintenanceReport()` service function
   - Membuat record Report yang terkait dengan lease aktif tenant, status "OPEN"
   - Invalidate cache tags yang relevan (`tenantReports`, `DASHBOARD_STATS`)
   - Tampilkan notifikasi sukses/gagal

### Apa yang Perlu Dibangun (Admin-side Laporan Keluhan & Maintenance)
Berdasarkan item-item yang diaktifkan dalam milestone.md, berikut yang perlu dibuat:

#### 1. Service Layer (`src/features/reports/report-service.ts`)
- Fungsi query: `getAllReports()`, `getReportsByStatus()`, `getReportById()`
- Fungsi mutation: `updateReportStatus()`, `addReportNote()`, `uploadReportPhoto()`
- Semua query harus menggunakan `React.cache()` + `unstable_cache()` dengan tag dari `CACHE_TAGS`

#### 2. Server Actions (`src/features/reports/actions.ts`)
- `getReportsAction()` - untuk mengambil laporan dengan filter/status
- `updateReportStatusAction()` - untuk mengubah status laporan
- `createAdminReportAction()` - untuk membuat laporan oleh admin (nama anders)
- `uploadReportPhotoAction()` - untuk mengunggah/memperbarui foto laporan
- Setiap action harus memanggil `updateTag()` untuk cache yang relevan

#### 3. Komponen UI (`src/features/reports/components/`)
- `ReportTable.tsx` - Tabel laporan dengan sorting, filtering, pagination
- `ReportFilter.tsx` - Komponen filter status (OPEN/IN_PROGRESS/RESOLVED)
- `ReportForm.tsx` - Form untuk membuat/mengedit laporan oleh admin
- `ReportDetail.tsx` - Panel detail untuk melihat laporan lengkap dengan foto

#### 4. Halaman Admin (`src/app/(dashboard)/admin/reports/page.tsx`)
- Halaman utama manajemen laporan keluhan
- Integrasi dengan komponen di atas
- Proteksi route via middleware (hanya akses untuk role ADMIN)

#### 5. Cache Tags (`src/lib/cache-tags.ts`)
- Tambahkan tag seperti:
  ```typescript
  export const REPORTS = 'reports'
  export const REPORT_BY_ID = (id: string) => [`report-${id}`] as const
  export const REPORTS_BY_STATUS = (status: string) => [`reports-${status}`] as const
  ```

#### 6. Validasi
- Gunakan Zod untuk validasi input di server actions
- Contoh schema: `updateReportStatusSchema = z.object({ id: z.string(), status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']) })`

### Pola Implementasi yang Harus Diikuti
1. **Data Fetching & Caching** (lihat AGENTS.md bagian 3.74-3.79)
   - Server Components sebagai default
   - Query di service layer Wajib pakai `React.cache()` + `unstable_cache()`
   - Setelah mutation di Server Action, SELALU panggil `updateTag(CACHE_TAGS.XXX)`
   - JANGAN gunakan `force-dynamic` kecuali benar-benar diperlukan

2. **Validasi** (AGENTS.md bagian 3.81-3.83)
   - Semua input validation menggunakan Zod
   - Gunakan `z.coerce` untuk form data yang perlu konversi tipe

3. **Komponen UI** (AGENTS.md bagian 3.85-3.90)
   - Gunakan komponen Shadcn UI dari `@/components/ui/` sebagai building block
   - Style menggunakan Tailwind CSS v4 (class-based)
   - Animasi menggunakan Framer Motion atau tw-animate-css class
   - Icons dari Lucide React

4. **Database** (AGENTS.md bagian 3.91-3.96)
   - Prisma client diakses via `import { prisma } from "@/lib/db"`
   - Gunakan `select` (bukan `include`) untuk query agar hanya ambil field yang dibutuhkan
   - Validasi ID/input dengan Zod sebelum query ke database

5. **Auth & Roles** (AGENTS.md bagian 3.97-3.101)
   - Dua role: `ADMIN` dan `TENANT`
   - Admin routes di `(dashboard)/admin/*` — dilindungi middleware
   - Pastikan hanya ADMIN yang dapat mengakses fitur manajemen laporan ini

6. **File Upload** (AGENTS.md bagian 3.103-3.105)
   - Upload ke Supabase Storage (bucket public untuk panorama, private untuk KTP)
   - Untuk foto laporan, gunakan bucket yang sesuai dengan sensitivitas data
   - Kompres gambar di client sebelum upload menggunakan `browser-image-compression` (sudah terpasang)

### Dependencies yang Mungkin Diperlukan
```bash
# Jika belum terinstall (seharusnya sudah ada berdasarkan lock file)
pnpm add @prisma/client
pnpm add -D prisma
pnpm add zod
pnpm add @tanstack/react-query  # Jika diperlukan untuk state management tambahan
# Shadcn UI, Tailwind, dll seharusnya sudah terinstall
```

### Hubungan dengan Fitur yang Sudah Ada
- Akan menggunakan mekanisme upload Supabase Storage yang sama seperti di `tenant-pwa-service.ts`
- Akan mengikuti pola cache tags yang sama seperti yang digunakan di `tenant-pwa-service.ts`
- Akan mengikuti struktur server action yang sama seperti yang ada di `features/*/actions.ts`
- Akan menggunakan komponen UI yang konsisten dengan rest of application (Shadcn UI dari `@/components/ui/`)

---

## 🎯 Langkah Validasi & Verifikasi
Setelah file `milestone.md` diperbarui oleh agen implementasi:
1. Pastikan tidak ada konflik teks atau pemformatan markdown yang rusak.
2. Komit perubahan `milestone.md` dengan pesan yang sesuai seperti `docs: activate financial and maintenance report milestones`.

### Selanjutnya untuk Implementor Laporan Keluhan & Maintenance:
1. Buat folder `src/features/reports/` dengan struktur yang sesuai FSD
2. Implemen service layer, server actions, komponen UI, dan halaman admin
3. Ikuti semua aturan kode yang tercantum di AGENTS.md
4. Pastikan melakukan validasi dengan Zod dan menggunakan komponen Shadcn UI
5. Terapkan caching yang konsisten dengan pola yang sudah ada
6. Setelah implementasi selesai, update `milestone.md` untuk mencantumkan progres
7. Jalani kode review menggunakan MCP tools sebelum pull request
