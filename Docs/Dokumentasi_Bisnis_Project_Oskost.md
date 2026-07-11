# Dokumentasi System OsKost - Draft

> **Catatan:**
> 
> 
> Dokumen ini merupakan
> 
> *living document*
> 
> yang akan terus diperbarui seiring dengan pengembangan sistem OSkost. Informasi di dalamnya dapat berubah tanpa pemberitahuan sebelumnya.
> 

# Business Requirement Document (BRD)

**Nama Project:** OsKost (Smartkost Pulo Jahe System)
**Versi:** 1.0
**Pemilik Product:** Programmer handal
**Target Lokasi:** Pulo Jahe, Cakung (Dekat Pabrik Yamaha & Stasiun Buaran).

### 1.1 Latar Belakang Masalah

- Pengelolaan 11 pintu kost di 3 lokasi masih dilakukan secara manual menggunakan buku tulis.
- Risiko *human error* tinggi dalam pencatatan pembayaran dan tunggakan.
- Pemasaran masih konvensional (mulut ke mulut dan spanduk), sehingga sulit menjangkau pekerja pabrik milenial yang mencari kost melalui ponsel.
- Transparansi rendah dalam penggunaan listrik dan penanganan keluhan kerusakan.

### 1.2 Tujuan Bisnis (Business Goals)

1. **Sentralisasi Data:** Mengalihkan 100% pencatatan ke database digital yang aman dan terstruktur.
2. **Marketing Modern:** Meningkatkan tingkat hunian melalui Landing Page dengan fitur *Virtual Tour* 360°.
3. **Efisiensi Operasional:** Mempercepat proses penagihan dan mempermudah pelaporan kerusakan oleh penghuni.

### 1.3 Ruang Lingkup (Scope)

- **Web Public (Landing Page):** Katalog kamar, filter harga, dan tampilan 360°.
- **Web Admin (Dashboard):** Pengelolaan kamar, penghuni, keuangan, dan laporan.
- **PWA Tenant (Member Area):** Pengecekan tagihan, unggah bukti bayar, dan laporan kerusakan.

# Product Requirement Document (PRD)

### 2.1 User Personas

1. **Owner (Admin):** Usia 50+, kurang familiar dengan teknologi. Membutuhkan tampilan yang besar dan jelas, angka keuangan yang mudah terlihat, serta notifikasi otomatis untuk tunggakan.
2. **Pencari Kost (Visitor):** Pekerja pabrik atau mahasiswa, usia 20–30 tahun. Membutuhkan informasi ketersediaan kamar dan kondisi real tanpa harus survei langsung ke lokasi.
3. **Penghuni (Tenant):** Pekerja dengan jadwal padat. Membutuhkan cara pembayaran yang mudah, pengingat tagihan otomatis, dan respons cepat untuk kerusakan fasilitas (seperti air mati atau listrik putus).

### 2.2 Fitur Utama (MVP)

| **Modul** | **Fitur** | **Prioritas** | **Deskripsi Singkat** |
| --- | --- | --- | --- |
| Landing Page | Katalog Kamar | High | List kamar dengan label "Tersedia"/"Penuh". |
|  | 360° Viewer | High | Integrasi foto panorama untuk melihat kamar/lingkungan. |
| Dashboard | Overview | High | Total Revenue, Occupancy Rate, Pending Issues. |
|  | Manajemen Penghuni | High | CRUD data penghuni (KTP, No HP, Status Nikah). |
|  | Pencatatan Bayar | High | Input manual pembayaran tunai/transfer. |
| Tenant PWA | Cek Tagihan | Medium | Melihat histori tagihan bulan berjalan & lalu. |
|  | Lapor Kerusakan | Medium | Form input keluhan + Upload Foto Kerusakan |

# Functional Requirement Document (FRD) & User Stories

### 3.1 Modul: Admin Dashboard

**User Story:** *"Sebagai Owner, saya ingin melihat siapa yang belum bayar bulan ini agar saya bisa menagihnya."*

- **Acceptance Criteria:**
    - Dashboard menampilkan widget "Belum Lunas".
    - Daftar penghuni dapat disortir berdasarkan status pembayaran.
    - Indikator warna: Hijau (Lunas), Merah (Tunggak).

**User Story:** *"Sebagai Owner, saya ingin mencatat pemasukan agar pembukuan tidak hilang."*

- **Acceptance Criteria:**
    - Admin dapat klik tombol "Catat Pembayaran" pada detail penghuni.
    - Sistem menyimpan: Tanggal, Jumlah, Metode (Tunai/Transfer), dan Bukti (opsional).
    - Status tagihan penghuni otomatis berubah menjadi "Lunas".

### 3.2 Modul: Landing Page (Marketing)

**User Story:** *"Sebagai Calon Penghuni, saya ingin melihat kondisi kamar secara nyata agar tidak kecewa saat datang."*

- **Acceptance Criteria:**
    - Halaman detail kamar memuat plugin 360 viewer.
    - User dapat menggeser gambar (pan/tilt) dengan lancar.
    - Gambar tidak pecah (resolusi memadai) dengan waktu loading < 3 detik.

### 3.3 Modul: Tenant PWA

**User Story:** *"Sebagai Penghuni, saya ingin melapor kran bocor dengan bukti foto agar segera diperbaiki."*

- **Acceptance Criteria:**
    - Menu "Lapor" membuka kamera/galeri HP.
    - User dapat menulis deskripsi masalah.
    - Laporan masuk ke Dashboard Admin sebagai "Pending Issue".

# Non-Functional Requirements (NFR)

Berikut adalah standar kualitas teknis yang harus dipenuhi:

1. **Performance:**
    - *First Contentful Paint (FCP)* landing page harus di bawah 1,5 detik. Ini penting untuk SEO dan pengguna dengan sinyal lemah.
    - Gunakan format WebP untuk optimasi gambar.
2. **Scalability:**
    - Skema database harus mendukung *multi-location*. Meskipun saat ini baru 3 lokasi, desain tabel harus menyertakan `property_id` atau `location_id`.
3. **Security:**
    - Admin Dashboard dilindungi dengan autentikasi NextAuth.
    - Foto KTP penghuni tidak boleh diakses publik. Gunakan *Signed URL* atau *Private Bucket*.
4. **Compatibility:**
    - PWA harus responsif di semua ukuran layar, dari Android entry-level hingga iPhone.
5. **Reliability:**
    - Sistem harus tetap dapat diakses dalam mode *read-only* saat database sedang maintenance, dengan penanganan error yang baik.