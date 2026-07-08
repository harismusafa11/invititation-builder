# Premium Digital Invitation Builder (Studio Undangan Online)

Platform Canva-like untuk mendesain, mengelola, dan mempublikasikan undangan pernikahan digital secara online dengan antarmuka modern, luxury glassmorphism, dan responsif.

## 🚀 Fitur Utama

- **Drag-and-Drop Editor**: Pindahkan, ubah ukuran, putar, dan atur elemen (Teks, Ornamen, Bingkai, Gambar) langsung di kanvas.
- **Sistem Multi-Halaman**: Tambahkan beberapa halaman untuk struktur undangan yang rapi (Cover, Detail Acara, Galeri, RSVP, dll.).
- **Live Preview & Animasi**: Efek transisi *Scroll Reveal* dan looping animation (seperti melayang/float) yang sinkron antara editor dan link publik.
- **Penyelarasan Bentuk Bulat (Circle & Oval Crop)**: Menjamin foto mempelai ter-crop bulat sempurna secara presisi.
- **Widget Interaktif**:
  - Peta Google Maps terintegrasi
  - Countdown timer acara
  - Formulir RSVP & Konfirmasi kehadiran
  - Amplop Digital (Hadiah Kado/Transfer Bank)
  - Galeri Foto dengan efek Lightbox Fullscreen
- **Keamanan Tingkat Tinggi**: Fitur anti-right click, block DevTools, dan anti-copy paste pada link publik untuk melindungi aset foto dan data privasi mempelai dari scraping/cloning.
- **Siap Deploy ke Vercel**: Dilengkapi dengan routing serverless dan security headers yang teroptimasi di `vercel.json`.

---

## 🛠️ Panduan Menjalankan Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- Database [PostgreSQL](https://www.postgresql.org/) (atau gunakan integrasi [Supabase](https://supabase.com/))

### Langkah Inisialisasi

1. **Clone Repositori**:
   ```bash
   git clone <URL_REPOSITORI_ANDA>
   cd u-generator
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin berkas `.env.example` menjadi `.env` di direktori root:
   ```bash
   cp .env.example .env
   ```
   Lalu buka berkas `.env` dan lengkapi detail database serta Supabase Anda:
   - `DATABASE_URL`: URL PostgreSQL (dari panel Supabase atau DB lokal).
   - `VITE_SUPABASE_URL`: Endpoint proyek Supabase Anda.
   - `VITE_SUPABASE_ANON_KEY`: Kunci anonim proyek Supabase Anda.
   - `ADMIN_SECRET_KEY`: Kunci rahasia/password untuk masuk ke `/sys-admin`.

4. **Jalankan Aplikasi Mode Development**:
   ```bash
   npm run dev
   ```
   Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

5. **Kompilasi Produksi (Build)**:
   ```bash
   npm run build
   ```

---

## 📦 Panduan Deploy ke Vercel

1. Hubungkan repositori GitHub Anda dengan Vercel.
2. Tambahkan variabel lingkungan berikut pada menu **Settings → Environment Variables** di Dashboard Vercel:
   - `DATABASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `ADMIN_SECRET_KEY`
3. Vercel akan otomatis mendeteksi konfigurasi `vercel.json` dan melakukan build frontend statis bersama dengan API Serverless Function (`api/index.ts`).
