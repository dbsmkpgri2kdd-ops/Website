
# 🏫 SMKS PGRI 2 KEDONDONG - Digital Hub Enterprise v7.5

Selamat datang di ekosistem digital terpadu SMKS PGRI 2 Kedondong. 

## 🚀 Panduan Publikasi (Deployment)

Aplikasi ini telah dioptimalkan untuk **Static Export** agar dapat berjalan sangat cepat melalui CDN Firebase Hosting.

1. **Build Statis**:
   ```bash
   npm run build
   ```
   *Perintah ini akan menghasilkan folder `out` yang berisi file HTML/JS murni.*

2. **Deploy Langsung**:
   ```bash
   firebase deploy
   ```
   *Konfigurasi di `firebase.json` telah diatur untuk mengunggah isi folder `out` ke Hosting.*

---

## 🛠️ Catatan Teknis (Static Export)

Karena menggunakan `output: 'export'`, fitur berikut berjalan di sisi klien:
*   **Database**: Semua penyimpanan data (PPDB, Kontak) menggunakan Firebase Client SDK.
*   **AI (Genkit)**: Fitur asisten AI berbasis server dinonaktifkan dalam mode statis untuk menjamin keberhasilan pembangunan (*build*). Untuk mengaktifkan kembali, gunakan **Firebase App Hosting** dan hapus baris `output: 'export'` di `next.config.js`.

---

**Digital Hub v7.5 - Membangun Masa Depan Vokasi.**
