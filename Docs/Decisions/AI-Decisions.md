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
