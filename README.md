# 🏫 SMKS PGRI 2 KEDONDONG - Digital Hub Enterprise v7.5

Selamat datang di ekosistem digital terpadu SMKS PGRI 2 Kedondong. Website ini dirancang sebagai portal **Modern Ultra-Minimalis** dengan arsitektur **Next.js App Router** dan integrasi **Firebase Real-time Data Sync**.

## 🎯 Filosofi Desain & Standar Estetika
Aplikasi ini menerapkan standar disiplin visual tinggi untuk menjaga kewibawaan institusi:
- **Absolute Zero Italics**: Tidak ada teks miring di seluruh antarmuka. Semua font dipaksa tegak (`normal`) untuk kejelasan informasi.
- **Standard Case Navigation**: Menghindari penggunaan huruf kapital semua (*ALL-CAPS*) pada menu. Teks menggunakan format kalimat normal agar nyaman dibaca.
- **Premium Typography**: Menggunakan **Poppins** untuk judul (Headline) yang tegas dan **Open Sans** untuk isi teks (Body) yang jernih.
- **Android Native Look**: Dashboard Siswa dan Guru didesain khusus agar memberikan pengalaman pengguna layaknya aplikasi Android asli (PWA).

---

## 🚀 Panduan Fitur & Penggunaan

### 1. Modul Administrator (hPanel)
Pusat kendali seluruh data dan tampilan website.
- **Visual Page Builder**: Atur urutan section di beranda secara visual tanpa menyentuh kode.
- **Manajemen Pengguna (CRUD)**: Kontrol penuh atas akun Admin, Guru, dan Siswa.
- **Manajemen Ujian**: Buat jadwal ujian online, input tautan soal, dan atur token keamanan.
- **Live Proctoring**: Pantau sesi ujian yang sedang berjalan, termasuk cuplikan kamera siswa secara real-time.
- **Sinkronisasi CSV**: Hubungkan profil siswa secara otomatis menggunakan link CSV dari Google Sheets.

### 2. Modul Guru (Portal Pengajar)
Fokus pada pengawasan akademik dan administrasi kelas.
- **Exam Management**: Mengelola jadwal ujian dan memantau integritas siswa melalui Proctoring Center.
- **E-Rapor Digital**: Input nilai mata pelajaran secara kolektif untuk akses mandiri siswa.
- **Manajemen Presensi**: Mencatat kehadiran harian atau memantau hasil absensi biometrik siswa.

### 3. Modul Siswa (Self-Service PWA)
Dioptimalkan untuk pengalaman aplikasi seluler yang responsif.
- **Absensi Biometrik GPS**: Validasi kehadiran berbasis lokasi (Radius 30m) dengan pemindaian wajah.
- **ExamBro Secure Session**: Lingkungan ujian terkunci yang mendeteksi multitasking dan navigasi terlarang.
- **E-Rapor & Portofolio**: Akses hasil belajar digital dan unggah karya terbaik untuk dipamerkan di halaman *Showcase*.

---

## 📂 Arsitektur Proyek

```text
├── src/
│   ├── app/                  # Routing & Layout (Next.js App Router)
│   ├── components/
│   │   ├── admin/            # Modul manajemen sistem hPanel
│   │   ├── guru/             # Modul akademik & proctoring ujian
│   │   ├── siswa/            # Modul mandiri & exambro session (Android Look)
│   │   ├── layout/           # Header, Footer, & Bottom Nav (Mobile Optimized)
│   │   └── ui/               # Base components (ShadCN UI)
│   ├── firebase/
│   │   ├── firestore/        # Custom hooks (useCollection, useDoc)
│   │   ├── mutations.ts      # Fungsi tulis data non-blocking (Optimistic UI)
│   │   └── provider.tsx      # Central Auth & Robust CSV Sync logic
│   └── lib/
│       ├── data.ts           # Definisi tipe TypeScript & konstanta global
│       └── utils.ts          # Helper (Distance calculation, Link converters)
```

---

## 🛠️ Panduan Operasional Teknis

### Pengembangan Lokal
1. Pastikan Node.js v18+ terpasang.
2. Jalankan server pengembangan:
```bash
npm run dev
```

### Proses Build & Deployment
Aplikasi ini menggunakan mode **Static Export** untuk kecepatan akses maksimal:
1. Build aplikasi: `npm run build`
2. Hasil build akan berada di folder `out/`.
3. Publikasikan ke hosting: `firebase deploy`

---

## 🛡️ Kebijakan Keamanan & Privasi
- **Data Encryption**: Seluruh komunikasi data dengan Firebase dienkripsi melalui protokol SSL/TLS.
- **Secure Exam**: Sesi ExamBro menggunakan enkripsi token unik dan deteksi multitasking proaktif.
- **Biometric Privacy**: Data biometrik diekstraksi menjadi hash unik dan tidak menyimpan foto asli secara permanen.

---
**© 2025 SMKS PGRI 2 KEDONDONG - Membangun Masa Depan Ahli & Kompeten.**
*Official Digital Hub Enterprise Powered by Next.js & Firebase Cloud Technology*
