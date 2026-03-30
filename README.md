
# 🏫 SMKS PGRI 2 KEDONDONG - Digital Hub Enterprise v7.5

Selamat datang di ekosistem digital terpadu SMKS PGRI 2 Kedondong. 

## 🚀 Panduan Publikasi (Deployment)

Aplikasi ini menggunakan fitur dinamis (Next.js Server Actions & AI Genkit), sehingga **tidak menghasilkan folder `out`**. Publikasi harus dilakukan melalui **Firebase App Hosting**:

1. **Hubungkan GitHub**: Pastikan repositori lokal terhubung ke GitHub.
   ```bash
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```
2. **Firebase Console**: Buka [Firebase Console](https://console.firebase.google.com/).
3. **App Hosting**: Pilih menu "App Hosting" di sidebar.
4. **Setup**: Hubungkan repositori GitHub Anda, pilih cabang `main`.
5. **Auto-Deploy**: Firebase akan mendeteksi Next.js secara otomatis, melakukan build, dan merilisnya ke domain Anda.

---

## 🛠️ Fitur Unggulan Panel Kendali (hPANEL)

*   **Visual Layout Builder**: Atur urutan modul beranda secara *real-time*.
*   **Branding Engine**: Ganti tema warna dan tipografi seluruh website dalam satu klik.
*   **AI Strategic Analytics**: Analisis data pendaftaran otomatis menggunakan Gemini 1.5 Flash.
*   **E-Rapor & Absensi**: Sistem internal terintegrasi untuk Guru dan Siswa.

---

## 🔐 Keamanan & Peran
Sistem menggunakan algoritma **"First-In Admin"**. Pengguna pertama yang mendaftar di halaman `/login` akan otomatis mendapatkan akses Administrator penuh untuk mengunci sistem.

**Digital Hub v7.5 - Membangun Masa Depan Vokasi.**
