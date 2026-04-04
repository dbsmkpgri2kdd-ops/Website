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

## � Checklist Fitur Dashboard

### ✅ Dashboard Admin (hPanel)
Modul manajemen sistem dengan 35+ manager untuk kontrol penuh:

**Manajemen Konten & Layout:**
- [ ] **Overview Manager**: Statistik dan ringkasan data
- [ ] **Layout Builder Manager**: Visual page builder untuk beranda
- [ ] **Design Template Manager**: Template desain pre-built
- [ ] **Navigation Manager**: Kelola menu navigasi

**Akademik & Jaringan:**
- [ ] **News Manager**: Publikasi berita dan pengumuman
- [ ] **Agenda Manager**: Jadwal acara & kegiatan sekolah
- [ ] **Schedule Manager**: Jadwal pelajaran dan ujian
- [ ] **Majors Manager**: Daftar jurusan/program studi
- [ ] **Extracurriculars Manager**: Kelola kegiatan ekstrakurikuler
- [ ] **Extracurricular Applications Manager**: Proses pendaftaran ekstrakurikuler

**Manajemen Pengguna & Akses:**
- [ ] **Users Manager**: CRUD akun Admin, Guru, Siswa
- [ ] **Teachers Manager**: Profil guru & staf (CRUD manual)
- [ ] **Profile Manager**: Profil sekolah & kontak

**Ujian & Akademik Lanjut:**
- [ ] **Exam Manager**: Buat & kelola ujian online
- [ ] **Biometric Manager**: Konfigurasi scanner biometrik
- [ ] **Comment Manager**: Kelola komentar & diskusi

**Fasilitas & Aset:**
- [ ] **Facilities Manager**: Daftar fasilitas sekolah
- [ ] **Gallery Manager**: Unggah foto & media
- [ ] **Library Manager**: Katalog perpustakaan digital
- [ ] **Teaching Factory Manager**: Data unit produksi & praktik
- [ ] **LSP Manager**: Manajemen LSP (Lembaga Sertifikasi Profesi)

**Program & Kerjasama:**
- [ ] **Job Vacancies Manager**: Lowongan kerja dari industri
- [ ] **Industry Partners Manager**: Mitra industri & dunia usaha
- [ ] **Applications Manager**: Formulir aplikasi umum
- [ ] **Alumni Manager**: Data alumni & tracer study
- [ ] **Tracer Study Manager**: Penelusuran karir alumni

**Penghargaan & Testimonial:**
- [ ] **Achievements Manager**: Prestasi siswa & guru
- [ ] **Testimonials Manager**: Testimoni dari alumni/siswa
- [ ] **OSIS Manager**: Data kepengurusan OSIS
- [ ] **Guestbook Manager**: Buku tamu digital

**Sistem & Konfigurasi:**
- [ ] **System Settings Manager**: Konfigurasi umum sistem
- [ ] **Contact Messages Manager**: Kelola pesan dari formulir kontak
- [ ] **Quick Links Manager**: Navigasi cepat di beranda
- [ ] **Literacy Manager**: Data literasi & program literasi
- [ ] **Graduation Status Manager**: Status kelulusan siswa

---

### ✅ Dashboard Guru (Portal Pengajar)
Fokus akademik & administrasi kelas:

**Menu Utama:**
- [ ] **Home**: Ringkasan informasi guru
- [ ] **Manajemen Presensi**: 
  - Input nilai kehadiran harian
  - Kelola data absensi kelas
  - Export laporan presensi
- [ ] **Manajemen Ujian**:
  - Lihat jadwal ujian
  - Akses proctoring center untuk monitoring siswa
  - Input nilai ujian
- [ ] **E-Rapor Digital**:
  - Input nilai per siswa & mapel
  - Verifikasi nilai akhir
  - Export rapor cetak
- [ ] **Pembinaan Ekstrakurikuler** (opsional):
  - Kelola anggota ekstrakurikuler
  - Input nilai/prestasi peserta
  - Laporan kegiatan

**Fitur Tambahan:**
- [ ] **Jadwal Pelajaran**: Lihat jadwal mengajar mingguan
- [ ] **Download Manager**: Akses dokumen & materi pelajaran
- [ ] **Notifikasi Real-time**: Alert ujian baru, pesan siswa, dll
- [ ] **Profil Guru**: Edit informasi pribadi & foto

---

### ✅ Dashboard Siswa (Self-Service PWA)
Aplikasi mobile-friendly untuk siswa:

**Menu Utama:**
- [ ] **Home**: Ringkasan akademik & pengumuman
- [ ] **Ujian (ExamBro Secure Portal)**:
  - Lihat jadwal ujian yg akan datang
  - Akses ujian dengan deteksi multitasking
  - Lihat hasil ujian setelah selesai
  - Validasi wajah & GPS sebelum mulai ujian
- [ ] **Akademik**:
  - **E-Rapor**: Lihat nilai per mapel & rapor berkala
  - **Absensi**: Status kehadiran & riwayat absensi
  - **Portofolio Digital**: Upload karya terbaik untuk showcase
  - **Jadwal Pelajaran**: Jadwal mingguan & guru pengajar
- [ ] **Profil**: Edit data pribadi & foto profil

**Fitur Spesial:**
- [ ] **Biometric Attendance**: 
  - Validasi kehadiran dengan face recognition
  - Geofencing GPS (Radius 30m dari sekolah)
  - Automatic sync waktu masuk/pulang
- [ ] **PWA Installation**: 
  - Prompt install aplikasi ke home screen
  - Offline mode untuk fitur dasar
  - Auto-update notifikasi

---

## 🛠️ Panduan Operasional Teknis

### Pengembangan Lokal
1. Pastikan Node.js v18+ terpasang.
2. Install dependencies:
```bash
npm install
```
3. Jalankan server pengembangan:
```bash
npm run dev
```
4. Akses di: `http://localhost:3000`

### Validasi Lokal
Sebelum deploy, pastikan semua berjalan normal:
```bash
# Type checking
npm run typecheck

# Build test
npm run build
```

---

## ✅ Pre-Deployment Checklist

Pastikan semua poin berikut terpenuhi sebelum melakukan deploy ke Firebase:

### 🔐 Konfigurasi Firebase
- [ ] **Firebase Config Valid**: Pastikan `src/firebase/config.ts` terisi dengan kredensial Firebase yang benar
  ```ts
  export const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  };
  ```
- [ ] **Firestore Rules Updated**: Firestore security rules sudah di-deploy (`firestore deploy --only firestore:rules`)
- [ ] **Firebase Authentication**: Enable sign-in methods:
  - [ ] Email/Password
  - [ ] Google Sign-in (untuk login dengan akun sekolah)
  - [ ] Custom Claims untuk role distinction (admin, guru, siswa)
- [ ] **Firebase Storage**: Configured untuk upload foto & dokumen
- [ ] **Realtime Database**: Disabled (hanya menggunakan Firestore)

### 📦 Build & Code Quality
- [ ] **TypeScript Errors**: `npm run typecheck` tidak ada error
- [ ] **Build Success**: `npm run build` berhasil (lihat status di terminal)
- [ ] **No Console Errors**: Pastikan tidak ada error di browser console saat dev
- [ ] **Page Load Performance**: Semua halaman load < 3 detik
- [ ] **Mobile Responsiveness**: Test di mobile browser (Chrome DevTools)

### 🎨 Dashboard & UI
**Admin Dashboard:**
- [ ] Semua 35+ manager module berfungsi
- [ ] Form inputs tervalidasi dengan Zod schema
- [ ] Data CRUD berfungsi (Create, Read, Update, Delete)
- [ ] Sorting & filtering bekerja
- [ ] Export CSV berfungsi (untuk Guestbook, Absensi, dll)
- [ ] Dark/Light mode toggle berfungsi

**Guru Dashboard:**
- [ ] Tab navigation (Home, Presensi, Ujian, E-Rapor) berfungsi
- [ ] Input nilai ke Firestore berhasil
- [ ] Presensi biometrik terbaca & terekam
- [ ] E-Rapor menampilkan data siswa dengan benar

**Siswa Dashboard:**
- [ ] Tab navigation (Home, Ujian, Akademik, Profil) berfungsi
- [ ] ExamBro exam session berfungsi (face detection, multitasking alert)
- [ ] Biometric attendance submit lokasi GPS & foto wajah
- [ ] Portfolio upload & display bekerja
- [ ] E-Rapor menampilkan nilai pribadi dengan benar

### 🔗 Integrasi API & External Services
- [ ] **Google Drive Integration**: Link Google Drive untuk file sharing berfungsi
- [ ] **Google Sheets CSV**: Jika menggunakan sinkronisasi, link CSV valid & accessible
- [ ] **Face API / ML Kit**: Face detection library ter-load dengan benar
- [ ] **Geolocation API**: Browser permissions untuk GPS diminta dengan proper
- [ ] **Service Worker**: PWA registration berfungsi di production

### 🌐 Hosting & Domain
- [ ] **Firebase Hosting**: Project sudah connected ke Firebase Hosting
- [ ] **Custom Domain**: Domain sudah terikat (jika menggunakan custom domain)
- [ ] **SSL Certificate**: HTTPS aktif (Firebase Hosting otomatis)
- [ ] **firebase.json Config**: Correct output directory (`"public": "out"`)
- [ ] **apphosting.yaml**: Max instances sudah dikonfigurasi

### 📊 Database & Data Integrity
- [ ] **Firestore Collections**: Semua collection sudah ada:
  - `schools/{SCHOOL_DATA_ID}` (metadata sekolah)
  - `schools/{SCHOOL_DATA_ID}/news` (berita)
  - `schools/{SCHOOL_DATA_ID}/teachers` (guru & staf)
  - `schools/{SCHOOL_DATA_ID}/exams` (ujian online)
  - `users/{userId}` (profil pengguna)
  - Dan koleksi lainnya sesuai diagram data
- [ ] **Index Creation**: Firestore indexes sudah ter-create untuk query yang memerlukan
- [ ] **Backup Enabled**: Firestore backup schedule sudah dikonfigurasi
- [ ] **Data Migration**: Jika ada data lama, sudah di-migrate ke struktur baru

### 🔑 User Access & Roles
- [ ] **Admin Account**: Setidaknya 1 admin account sudah dibuat & verified
- [ ] **Guru Accounts**: Guru-guru sudah terdaftar dengan role `guru`
- [ ] **Siswa Accounts**: Siswa-siswa sudah terdaftar dengan role `siswa`
- [ ] **First Time Login**: Flow untuk first-time login user berfungsi (setup profile, etc)
- [ ] **Role-Based Access Control**: Permissions sesuai role berfungsi dengan benar

### 📱 PWA & Mobile Experience
- [ ] **manifest.json**: Web manifest sudah ter-configure dengan app name, icons, theme colors
- [ ] **Service Worker (sw.js)**: Service worker register & cache strategy berfungsi
- [ ] **Install Prompt**: PWA install prompt muncul di browser yang support
- [ ] **Offline Mode**: Halaman offline (`_offline.html`) atau error boundary sudah ready
- [ ] **Device Orientation**: Dashboard mobile optimized untuk portrait & landscape

### 📝 Documentation & Logging
- [ ] **Console Logs**: Debug logs sudah diminimalisir (hanya errors & important info)
- [ ] **Error Handling**: Global error boundary & error messages user-friendly
- [ ] **User Feedback**: Toast notifikasi sudah implemented untuk aksi user
- [ ] **Analytics**: (Opsional) Google Analytics atau custom analytics sudah setup

### 🚀 Performance & Optimization
- [ ] **Bundle Size**: Cek bundle size dengan `npm run build` summary
- [ ] **Image Optimization**: Semua image sudah compressed & lazy loaded
- [ ] **CSS Minified**: Tailwind CSS production build berfungsi
- [ ] **Code Splitting**: Route-based code splitting berfungsi di Next.js
- [ ] **Database Queries**: Firestore queries sudah optimal (tidak ada N+1 query)

---

## 🚀 Langkah-Langkah Deploy ke Firebase Hosting

### 1. Pre-deployment Setup
```bash
# Pastikan sudah login Firebase
firebase login

# Install Firebase CLI jika belum
npm install -g firebase-tools

# Verify project ID
firebase projects:list
```

### 2. Build Production
```bash
# Full build dengan type checking
npm run typecheck
npm run build

# Hasil build ada di folder: ./out
```

### 3. Deploy ke Firebase
```bash
# Deploy Firestore Rules (PENTING!)
firebase deploy --only firestore:rules

# Deploy Hosting (Next.js static build)
firebase deploy --only hosting

# Atau deploy semuanya sekaligus
firebase deploy
```

### 4. Verify Deployment
```bash
# Check live site
firebase hosting:channel:list

# View logs
firebase functions:log

# Cek status deployment
firebase deploy:log
```

### 5. Post-Deployment Checks
- [ ] Akses situs di domain: `https://your-domain.web.app`
- [ ] Test login dengan akun admin, guru, siswa
- [ ] Refresh page untuk memastikan cache berfungsi
- [ ] Cek Network tab di DevTools bahwa file cached dengan benar
- [ ] Test PWA install (Chrome: Menu > Install App)
- [ ] Verify dark/light mode berfungsi
- [ ] Test form submissions & data saves ke Firestore

---

## 🛡️ Hal-Hal Penting yang Perlu Diperhatikan

### 🔒 Security Best Practices
1. **API Key Protection**: Firebase config tidak boleh commit dengan secret key. Saat ini sudah public (intentional untuk web app)
2. **Firestore Rules**: Tinjau `firestore.rules` - pastikan rules tidak terlalu permissive
3. **Authentication**: Jangan share admin account - assign role properly di Firestore custom claims
4. **Data Validation**: Semua input divalidasi Zod schema sebelum Firestore
5. **Rate Limiting**: Implement rate limiting di Firestore rules jika perlu (untuk prevent abuse)

### 📈 Performance Considerations
1. **Static Export Mode**: Aplikasi dioptimasi untuk static export (SEO-friendly)
2. **Image Remoting**: Images dari Google Drive/Unsplash - ensure CDN cache headers correct
3. **Realtime Listeners**: Firebase listeners di `useCollection`/`useDoc` harus di-cleanup (useEffect cleanup)
4. **Bundle Size**: Current bundle sudah optimized (~330KB first load untuk guru/siswa)

### 🐛 Common Issues & Troubleshooting
| Issue | Solution |
|-------|----------|
| Build error "Cannot find module" | Jalankan `npm install` ulang |
| Firestore permission denied | Cek firestore.rules & user custom claims |
| Image not loading | Verify domain di `remotePatterns` di next.config.js |
| PWA not installing | Ensure manifest.json valid & service worker registered |
| Login loop | Cek custom claims di Firebase Console > Users |
| Slow load time | Run `npm run build` & check bundle size analysis |

### 📊 Monitoring & Maintenance
1. **Firebase Console**: Monitor Firestore usage & quota limits setiap minggu
2. **Error Logs**: Setup Firebase Cloud Logging untuk track errors di production
3. **User Activity**: Monitor authentication logs untuk detect suspicious activity
4. **Backups**: Firestore backups otomatis berjalan - verify di Firebase Console
5. **Updates**: Regular check Next.js & dependency updates untuk security patches

### 📞 Emergency Contacts & Support
- **Firebase Support**: https://firebase.google.com/support
- **Next.js Docs**: https://nextjs.org/docs
- **ShadCN UI Issues**: https://github.com/shadcn-ui/ui/issues
- **Project Repository**: https://github.com/dbsmkpgri2kdd-ops/Website

---

## 🛡️ Kebijakan Keamanan & Privasi
- **Data Encryption**: Seluruh komunikasi data dengan Firebase dienkripsi melalui protokol SSL/TLS.
- **Secure Exam**: Sesi ExamBro menggunakan enkripsi token unik dan deteksi multitasking proaktif.
- **Biometric Privacy**: Data biometrik diekstraksi menjadi hash unik dan tidak menyimpan foto asli secara permanen.
- **User Consent**: Setiap akses geolokasi & kamera meminta user permission terlebih dahulu.

---
**© 2025 SMKS PGRI 2 KEDONDONG - Membangun Masa Depan Ahli & Kompeten.**
*Official Digital Hub Enterprise Powered by Next.js & Firebase Cloud Technology*
