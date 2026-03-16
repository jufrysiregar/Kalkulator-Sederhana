# 🧮 Kalkulator Jufry Siregar

Aplikasi kalkulator web modern dengan desain dark premium, dibangun menggunakan HTML, CSS, dan JavaScript murni tanpa framework.

---

## 📋 Deskripsi

Kalkulator ini dirancang untuk semua kalangan — dari anak muda hingga orang tua. Menggunakan font **Fira Code** yang memiliki angka `0` dengan titik di tengah sehingga mudah dibedakan dari huruf `O`. Tampilan dark navy dengan aksen biru-ungu memberikan kesan premium dan nyaman di mata.

---

## ✨ Fitur Utama

### 🔢 Kalkulator Standar
- Operasi dasar: penjumlahan, pengurangan, perkalian, pembagian
- Input angka negatif langsung (contoh: `-3 × 2`)
- Ekspresi lengkap tampil di layar saat mengetik (contoh: `8−(−3)`)
- Preview hasil **real-time** sebelum menekan `=`
- Format angka ribuan otomatis dengan titik (contoh: `10.000`, `1.000.000`)
- Riwayat perhitungan tersimpan di `localStorage`
- Hapus riwayat dengan satu klik

### 🔬 Mode Saintifik
- Beralih ke mode saintifik dengan tombol ↻ (switch)
- Fungsi: `sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹`
- Fungsi: `lg` (log10), `ln`, `√x`, `xʸ`, `x!`, `¹/x`
- Konstanta: `π`, `e`
- Kurung `(` dan `)` untuk ekspresi kompleks
- Toggle satuan sudut: **deg** / **rad**
- Tombol **2nd** untuk fungsi invers trigonometri

### 🔄 Konverter (14 Kategori)

| Kategori | Keterangan |
|----------|------------|
| 💱 Mata Uang | 11 mata uang (USD, IDR, EUR, SGD, MYR, JPY, GBP, AUD, CNY, SAR, KRW) |
| 📏 Panjang | mm, cm, m, km, inch, feet, yard, mile |
| ⚖️ Massa | mg, g, kg, ton, lb, oz |
| 📐 Area | mm², cm², m², km², inch², feet², acre, hectare |
| 🕐 Waktu | ms, detik, menit, jam, hari, minggu, bulan, tahun |
| 💵 Keuangan | Kalkulator bunga sederhana |
| 💾 Data | bit, byte, KB, MB, GB, TB |
| 📅 Tanggal | Selisih hari, minggu, bulan, tahun antar dua tanggal |
| 🏷️ Diskon | Hitung harga setelah diskon dan nominal hemat |
| 📦 Volume | ml, liter, m³, cm³, gal, fl oz, cup |
| 🔢 Sistem Angka | Desimal ↔ Biner ↔ Oktal ↔ Heksadesimal |
| ⚡ Kecepatan | m/s, km/h, mph, knot, ft/s |
| 🌡️ Suhu | °C ↔ °F ↔ Kelvin |
| 🏋️ IMT | Kalkulator Indeks Massa Tubuh + kategori + gauge visual |

### 💡 Easter Egg (Tips)
Klik tombol 💡 untuk mendapatkan tantangan hitung rahasia. Setiap klik menampilkan soal **random** dari 6 jokes tersembunyi:

| Input | Hasil |
|-------|-------|
| `1 + 1 =` | I L0v3 {} |
| `2 + 2 =` | Kamu Milik Saya |
| `1 × 1 =` | 128√e980 |
| `1 − 1 =` | Hello World.! |
| `100 × 100 =` | Kebanyakan nanya :) |
| `0 ÷ 0 =` | PRANK ~LOL |

---

## 🗂️ Struktur File

```
kalkulator/
├── index.html      # Struktur utama aplikasi
├── style.css       # Semua styling dan animasi
├── script.js       # Logika kalkulator, konverter, dan easter egg
└── README.md       # Dokumentasi ini
```

---

## 🚀 Cara Menjalankan

Tidak perlu instalasi apapun. Cukup:

1. Download atau clone semua file
2. Buka `index.html` di browser
3. Aplikasi langsung berjalan

> Tidak memerlukan server, framework, atau koneksi internet (kecuali untuk load font Google Fonts)

---

## ⌨️ Shortcut Keyboard

| Tombol | Fungsi |
|--------|--------|
| `0–9` | Input angka |
| `+` `-` `*` `/` | Operator |
| `.` atau `,` | Desimal |
| `Enter` atau `=` | Hitung |
| `Backspace` | Hapus karakter |
| `Escape` | Clear semua |
| `(` `)` | Kurung |

---

## 🎨 Teknologi

- **HTML5** — Struktur aplikasi
- **CSS3** — Dark theme, animasi, grid layout, glassmorphism
- **JavaScript (Vanilla)** — Logika kalkulator dan konverter
- **Google Fonts** — DM Sans + Fira Code
- **localStorage** — Penyimpanan riwayat perhitungan

---

## 👤 Developer

**Jufry Siregar**
© 2026. All Rights Reserved.