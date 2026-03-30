
# 🏫 SMKS PGRI 2 KEDONDONG - Digital Hub Enterprise v7.5

Selamat datang di ekosistem digital terpadu SMKS PGRI 2 Kedondong. 

## 🚀 Panduan Publikasi (Deployment)

Aplikasi ini menggunakan fitur dinamis (Next.js Server Actions & AI Genkit), sehingga publikasi paling optimal dilakukan melalui **Firebase Hosting dengan integrasi Web Frameworks**:

1. **Persiapan CLI**: Pastikan Anda menggunakan Firebase CLI terbaru.
2. **Login & Inisialisasi**:
   ```bash
   firebase login
   firebase init hosting
   ```
   *Pilih "Next.js" saat ditanya framework apa yang digunakan.*
3. **Deploy Langsung**:
   ```bash
   firebase deploy
   ```
   *Firebase akan otomatis mendeteksi konfigurasi di `firebase.json` dan membangun aplikasi untuk Anda.*

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
