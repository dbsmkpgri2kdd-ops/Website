# 🏫 SMKS PGRI 2 KEDONDONG - Digital Hub Enterprise v7.5

Selamat datang di ekosistem digital terpadu SMKS PGRI 2 Kedondong. Website ini dirancang sebagai portal **Modern Ultra-Minimalis** dengan arsitektur **Next.js App Router** dan integrasi **Firebase Real-time Data Sync**.

## 🎯 Filosofi Desain & Standar Estetika
Aplikasi ini menerapkan standar disiplin visual tinggi untuk menjaga kewibawaan institusi:
- **Absolute Zero Italics**: Tidak ada teks miring di seluruh antarmuka. Semua font dipaksa tegak (`normal`) untuk kejelasan informasi.
- **Standard Case Navigation**: Menghindari penggunaan huruf kapital semua (*ALL-CAPS*) pada menu. Teks menggunakan format kalimat normal agar nyaman dibaca.
- **Premium Typography**: Menggunakan **Poppins** untuk judul (Headline) yang tegas dan **Open Sans** untuk isi teks (Body) yang jernih.
- **Brand Identity**: Dominasi **Royal Blue** (#3b82f6) sebagai simbol profesionalisme dan **Vibrant Yellow** (#eab308) sebagai aksen energi inovasi.

---

## 🚀 Panduan Fitur & Penggunaan

### 1. Modul Administrator (hPanel)
Pusat kendali seluruh data dan tampilan website.
- **Visual Page Builder**: Admin dapat mengubah urutan section di beranda hanya dengan tombol panah tanpa menyentuh kode.
- **Sinkronisasi Database CSV**: Menghubungkan profil siswa secara otomatis menggunakan link CSV dari Google Sheets. Pastikan mapping kolom (NIS, Nama, Kelas) sudah sesuai di menu *System Settings*.
- **Manajemen Pengguna**: Mengatur hak akses (Admin, Guru, Siswa) dan pembagian sesi (Pagi/Siang) untuk absensi.
- **Live Proctoring**: Memantau seluruh sesi ujian yang sedang berjalan, termasuk melihat cuplikan kamera siswa secara real-time.

### 2. Modul Guru (Portal Pengajar)
Fokus pada pengawasan akademik dan administrasi kelas.
- **ExamBro Management**: Membuat jadwal ujian, mengatur token keamanan, dan mewajibkan penggunaan kamera peserta.
- **Proctoring Center**: Dashboard khusus untuk melihat status integritas siswa (deteksi multitasking, jumlah pelanggaran, dan feed kamera).
- **E-Rapor Digital**: Input nilai mata pelajaran secara kolektif yang akan langsung tampil di akun siswa masing-masing.
- **Manajemen Presensi**: Mencatat kehadiran manual atau memantau hasil absensi biometrik siswa.

### 3. Modul Siswa (Self-Service)
Dioptimalkan untuk pengalaman aplikasi seluler (PWA).
- **Absensi Biometrik GPS**: Validasi kehadiran berbasis lokasi (Geofencing radius 30m). Siswa wajib berada di area sekolah dan melakukan pemindaian wajah biometrik.
- **ExamBro Secure Session**: Lingkungan ujian yang terkunci. Sistem akan mendeteksi jika siswa mencoba keluar browser, melakukan screenshot, atau membuka aplikasi lain.
- **E-Rapor & Portofolio**: Mengunduh laporan hasil belajar dalam format PDF dan mengunggah karya digital terbaik untuk dipamerkan di halaman *Showcase*.

---

## 📂 Arsitektur Proyek

```text
├── src/
│   ├── app/                  # Routing & Layout (Next.js App Router)
│   ├── components/
│   │   ├── admin/            # Modul manajemen sistem & hPanel
│   │   ├── guru/             # Modul akademik & proctoring ujian
│   │   ├── siswa/            # Modul mandiri & exambro session (Android Look)
│   │   ├── layout/           # Header, Footer, & Bottom Nav (Mobile Optimized)
│   │   └── ui/               # Base components (ShadCN UI)
│   ├── firebase/
│   │   ├── firestore/        # Custom hooks (useCollection, useDoc)
│   │   ├── mutations.ts      # Fungsi tulis data non-blocking (Optimistic UI)
│   │   └── provider.tsx      # Central Auth & CSV Profile Sync logic
│   └── lib/
│       ├── data.ts           # Definisi tipe TypeScript & konstanta menu
│       └── utils.ts          # Helper (Haversine Distance, Drive Converter)
├── next.config.js            # Konfigurasi Static Export
└── tailwind.config.ts        # Konfigurasi Tema & Tipografi (Poppins/Open Sans)
```

---

## 🛠️ Panduan Operasional Teknis

### Pengembangan Lokal
1. Pastikan Node.js v18+ terpasang.
2. Jalankan server pengembangan:
```bash
npm run dev
```

### Proses Build & Export (Produksi)
Aplikasi ini menggunakan mode **Static Export** untuk kecepatan akses maksimal:
```bash
npm run build
```
Hasil build akan berada di folder `out/`.

### Deployment ke Firebase
Setelah proses build selesai, publikasikan ke hosting:
```bash
firebase deploy
```

---

## 🛡️ Kebijakan Keamanan & Privasi
- **Data Encryption**: Seluruh komunikasi data dengan Firebase dienkripsi melalui protokol SSL/TLS.
- **Secure Exam**: Sesi ExamBro menggunakan enkripsi token unik per sesi untuk mencegah akses tidak sah.
- **Biometric Privacy**: Data tanda tangan wajah diekstraksi menjadi hash kode unik dan tidak menyimpan foto asli secara permanen untuk menjaga privasi siswa.

---
**© 2025 SMKS PGRI 2 KEDONDONG - Membangun Masa Depan Ahli & Kompeten.**
*Official Digital Hub Enterprise Powered by Next.js & Firebase Cloud Technology*
