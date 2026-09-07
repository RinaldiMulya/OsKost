# OsKost — Smartkost Pulo Jahe System

OsKost adalah aplikasi manajemen kost berbasis web dengan Admin Dashboard dan PWA Tenant mobile-first. Aplikasi ini dibangun untuk mempermudah pengelolaan kost mulai dari manajemen penghuni (tenant), tagihan sewa, laporan keluhan, hingga statistik pendapatan dan pengeluaran.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 + tw-animate-css
- **Components**: Shadcn UI + Radix UI + Lucide React
- **Database**: PostgreSQL via Prisma (`@prisma/adapter-pg`)
- **Auth**: NextAuth.js v5 (Credentials - Email & Phone)
- **Storage**: Supabase Storage
- **Package Manager**: pnpm

## 📦 Getting Started

1. **Clone repository ini**
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Konfigurasi Environment Variables**
   Buat file `.env` berdasarkan `.env.example` dan isi nilai yang diperlukan (Database URL, Supabase config, NextAuth secret, dll).
4. **Jalankan Prisma Migrations**
   ```bash
   pnpm dlx prisma db push
   ```
5. **Jalankan Development Server**
   ```bash
   pnpm run dev
   ```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

## 🤖 Panduan Penggunaan AI Agent

Proyek ini sangat disarankan untuk dikembangkan (diteruskan) menggunakan bantuan AI Agent (seperti **Gemini** atau AI Agent lain yang mendukung sistem Rules/Skills).

**AI Agent yang Disarankan:**
- Agent yang mendukung pembacaan dan kepatuhan terhadap file Markdown lokal (`AGENTS.md` / `GEMINI.md`).
- Agent yang memiliki kapabilitas *Feature-Sliced Design* dan *Next.js App Router patterns*.

### Rules & Skills yang Berlaku

Untuk menjaga konsistensi arsitektur dan standar kualitas kode, semua AI Agent yang bekerja pada repositori ini **WAJIB** membaca dan mematuhi file-file aturan (Rules) berikut sebelum mulai menulis atau mengedit kode:

- **`AGENTS.md`** / **`GEMINI.md`**: Berisi aturan spesifik untuk arsitektur, konvensi penamaan, dan pembagian *Feature-Sliced Design* dari proyek ini. (File ini tidak di-commit ke repositori utama, harap konfigurasikan Agent Anda agar menyertakan file rules tersebut secara lokal).
- **`milestone.md`**: Digunakan untuk memonitor progres kerja. Setiap Agent **wajib** memperbarui file ini setelah menyelesaikan sebuah task.
- **`Docs/Decisions/AI-Decisions.md`**: Digunakan sebagai log/catatan semua keputusan teknis dan arsitektural yang diambil oleh AI selama proses *development*.

Dengan mematuhi rules di atas, AI Agent dapat menghasilkan kode yang rapi, terstruktur, dan terintegrasi baik dengan keseluruhan sistem OsKost.
