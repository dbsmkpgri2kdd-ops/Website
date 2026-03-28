# 🏫 SMKS PGRI 2 KEDONDONG - Digital Hub Enterprise v7.5

Selamat datang di ekosistem digital terpadu SMKS PGRI 2 Kedondong. Dokumentasi ini berfungsi sebagai panduan operasional bagi Administrator dan Tim IT Sekolah.

## 🚀 Panduan Publikasi (Deployment)

Aplikasi ini dioptimalkan untuk berjalan di **Firebase App Hosting**. Ikuti langkah berikut untuk mempublikasikan website ke domain `https://studio-128676595-62275.web.app/`:

1. **Hubungkan GitHub**: Pastikan repositori lokal terhubung ke `https://github.com/dbsmkpgri2kdd-ops/Website.git`.
   ```bash
   git remote remove origin
   git remote add origin https://github.com/dbsmkpgri2kdd-ops/Website.git
   git push -u origin main
   ```
2. **Firebase Console**: Buka [Firebase Console](https://console.firebase.google.com/).
3. **App Hosting**: Pilih menu "App Hosting" di sidebar dan klik "Get Started".
4. **Setup**: Hubungkan repositori GitHub `dbsmkpgri2kdd-ops/Website`, pilih cabang (`main`), dan biarkan Firebase melakukan proses *Build* otomatis menggunakan Next.js.
5. **Live**: Website akan aktif secara otomatis setiap kali Anda melakukan *push* ke GitHub.

---

## 🔐 Aktivasi Hak Akses Administrator

Sistem ini menggunakan algoritma **"First-In Admin"** untuk keamanan tingkat tinggi:

1. **Registrasi**: Admin utama harus menjadi orang pertama yang melakukan registrasi di halaman `/login`.
2. **Promosi**: Masuk ke halaman `/admin`. Sistem akan mendeteksi jika Anda adalah pengguna pertama dan memberikan tombol "AKTIFKAN HAK AKSES ADMIN".
3. **Lockdown**: Setelah tombol diklik, sistem akan terkunci. Pengguna berikutnya yang mendaftar secara otomatis akan memiliki peran sebagai `siswa` dan harus dikelola manual oleh Admin utama.

---

## 🛠️ Fitur Unggulan Panel Kendali (hPANEL)

### 1. Visual Layout Builder
Gunakan menu **BUILDER BERANDA** untuk mengatur urutan modul di halaman depan. Anda dapat memindahkan "Pameran Karya" ke atas atau menyembunyikan "Berita" dengan satu klik.

### 2. Branding Engine
Di menu **TAMPILAN**, Anda dapat mengubah tema sekolah (Cyber Neon, Emerald Nature, Obsidian Minimal, dll). Ini akan mengubah warna primer, aksen, dan radius sudut seluruh website secara instan.

### 3. AI Strategic Analytics
Tekan tombol "Mulai Analisis Sistem" di Ringkasan Admin. Gemini AI akan memproses data pendaftaran (PPDB) dan interaksi pengunjung untuk memberikan saran strategis bagi kemajuan sekolah.

### 4. Pameran Karya (Showcase)
Siswa dapat mengunggah portofolio mereka. Admin cukup mencentang opsi "Showcase" pada karya terpilih agar tampil secara eksklusif di halaman depan dengan gaya majalah premium.

---

## 📊 Manajemen Data Operasional

*   **PPDB Online**: Kelola calon siswa, unduh laporan CSV, dan perbarui status (Diterima/Cadangan).
*   **E-Rapor**: Input nilai siswa per semester. Siswa dapat melihat dan mencetak rapor digital mereka sendiri.
*   **Agenda & Berita**: Pastikan informasi sekolah selalu diperbarui agar AI Assistant dapat memberikan jawaban yang akurat kepada pengunjung.
*   **Digital App Hub**: Tambahkan tautan aplikasi eksternal (E-Learning, Perpus, dll) agar muncul di dashboard Guru dan Siswa.

---

## 🛡️ Dukungan & Keamanan
Sistem ini dilengkapi dengan:
*   **Firebase Security Rules**: Melindungi data sensitif dari akses tidak sah.
*   **PWA Ready**: Website dapat dipasang sebagai aplikasi di HP Android/iOS.
*   **Auto-SEO**: Optimasi metadata otomatis untuk visibilitas maksimal di Google.

**Digital Hub v7.5 - Membangun Masa Depan Vokasi.**
