# 🏫 SMKS PGRI 2 KEDONDONG - Digital Hub Enterprise v7.5

Selamat datang di ekosistem digital terpadu SMKS PGRI 2 Kedondong. Website ini dirancang sebagai portal **Modern Ultra-Minimalis** dengan arsitektur **Next.js App Router** dan integrasi **Firebase Real-time Data Sync**.

## 🎯 Filosofi Desain: Zero Italics & Standard Case
Aplikasi ini menerapkan standar estetika disiplin tinggi:
- **Absolute Zero Italics**: Tidak ada teks miring di seluruh antarmuka untuk menjaga kewibawaan dan kebersihan visual.
- **Standard Case Navigation**: Penggunaan teks normal (bukan ALL-CAPS) pada menu untuk kenyamanan membaca maksimal.
- **Brand Identity**: Dominasi **Royal Blue** (#3b82f6) sebagai simbol profesionalisme dan **Vibrant Yellow** (#eab308) sebagai aksen energi inovasi.

---

## 🚀 Fitur Unggulan Sistem

### 1. Portal Akademik & Layanan Mandiri
- **PPDB Online v4.0**: Formulir pendaftaran cerdas dengan sistem lacak status seleksi real-time menggunakan nomor WhatsApp.
- **E-Rapor Digital**: Laporan hasil belajar yang dapat diakses siswa kapan saja dan dioptimalkan untuk cetak (Print-Ready).
- **ExamBro Secure Session**: Sistem ujian online yang mengunci browser, mendeteksi multitasking, dan mencegah screenshot untuk integritas ujian tinggi.

### 2. Teknologi Biometrik & Keamanan
- **Absensi Biometrik GPS**: Validasi kehadiran siswa berbasis radius (Geofencing 30m) dan ekstraksi tanda tangan wajah digital.
- **Proctoring Center**: Dashboard khusus guru untuk memantau status kamera dan pelanggaran siswa selama ujian berlangsung secara live.

### 3. Ekosistem Konten (CMS)
- **Visual Page Builder**: Admin dapat mengatur urutan section beranda tanpa menyentuh kode.
- **Portfolio Showcase**: Pameran karya inovasi siswa terbaik yang dikurasi langsung oleh admin.
- **Smart AI Assistant**: Asisten pintar berbasis Genkit AI untuk membantu menjawab informasi seputar sekolah.

---

## 📂 Struktur Arsitektur Proyek

```text
├── docs/
│   └── backend.json          # Blueprint IR untuk struktur data Firestore
├── src/
│   ├── app/                  # Routing & Layout utama (Server Components)
│   ├── components/
│   │   ├── admin/            # Modul manajemen data & sistem
│   │   ├── guru/             # Modul akademik & proctoring ujian
│   │   ├── siswa/            # Modul mandiri & exambro session
│   │   ├── sections/         # Komponen landing page publik
│   │   └── ui/               # Base components (ShadCN UI)
│   ├── firebase/
│   │   ├── firestore/        # Custom hooks (useCollection, useDoc)
│   │   ├── mutations.ts      # Fungsi tulis data non-blocking (Optimistic UI)
│   │   └── provider.tsx      # Central State & Auth management
│   └── lib/
│       ├── data.ts           # Definisi tipe TypeScript & konstanta menu
│       └── utils.ts          # Helper (Geofencing, Drive Link Converter)
├── next.config.js            # Konfigurasi Static Export & Image Optimization
└── tailwind.config.ts        # Konfigurasi tema warna & tipografi standar
```

---

## 🛠️ Panduan Operasional

### Pengembangan Lokal
1. Pastikan Node.js v18+ terpasang.
2. Jalankan server pengembangan:
```bash
npm run dev
```

### Proses Build & Export
Aplikasi ini dioptimalkan untuk **Static Site Generation (SSG)** untuk kecepatan akses maksimal:
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

## 🛡️ Kebijakan Teknis & Keamanan
- **Hydration Guard**: Semua fungsi berbasis waktu atau browser API (GPS/Kamera) diproteksi untuk mencegah error hidrasi Next.js.
- **PWA Experience**: Aplikasi dapat diinstal di Android/iOS/Windows dengan notifikasi promosi otomatis dan splash screen branding sekolah.
- **Database Logic**: Menggunakan Firebase Client SDK secara eksklusif untuk performa real-time tanpa beban server-side yang berat.

---
**© 2025 SMKS PGRI 2 KEDONDONG - Membangun Masa Depan Ahli & Kompeten.**
*Powered by Next.js & Firebase Cloud Technology*