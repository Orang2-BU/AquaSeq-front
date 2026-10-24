---
version: alpha
name: "AquaSeq"
description: "Tenang, presisi, padat data untuk aplikasi; foto tambak, kartu putih membulat, dan biru air untuk landing"
colors:
  canvas: "#F4F4F3"
  surface: "#FFFFFF"
  surface-muted: "#ECECEA"
  on-surface: "#141414"
  on-surface-muted: "#6B6B68"
  on-inverse: "#FFFFFF"
  border: "#E2E2DF"
  on-primary: "#FFFFFF"
  status-ok: "#146C34"
  status-ok-soft: "#E8F5EC"
  status-warn: "#94580A"
  status-warn-soft: "#FDF4DC"
  status-crit: "#B91C1C"
  status-crit-soft: "#FCE9E9"
  focus: "#1D4ED8"
  primary: "#1764C0"
  primary-hover: "#12519E"
  accent-fill: "#2B8AE2"
  accent-soft: "#E7F1FC"
  surface-inverse: "#0E2135"
  on-inverse-muted: "#A7BCD2"
  neutral-fill: "#DCE3EA"
  risk-aman: "#146C34"
  risk-aman-soft: "#E8F5EC"
  risk-ringan: "#5E5300"
  risk-ringan-soft: "#F6F0C4"
  risk-tinggi: "#9A3F08"
  risk-tinggi-soft: "#FDE8D8"
  risk-bahaya: "#B91C1C"
  risk-bahaya-soft: "#FCE9E9"
  landing-canvas: "#EEF3F8"
  landing-surface: "#FFFFFF"
  landing-ink: "#0F1B2A"
  landing-ink-muted: "#4F5D6C"
  landing-line: "#D8E1EA"
  landing-dark: "#13212F"
  landing-on-dark: "#F2F6FA"
  landing-on-dark-muted: "#A9B8C7"
  landing-accent: "#5AA6EE"
  landing-accent-soft: "#CFE2F6"
  landing-accent-on-dark: "#8CC6FF"
  landing-on-photo: "#FFFFFF"
typography:
  display:
    fontFamily: Onest
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.02em
  title:
    fontFamily: Onest
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  metric:
    fontFamily: Onest
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.1
    fontFeature: '"tnum"'
  body:
    fontFamily: Onest
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Onest
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
  landing-display-xl:
    fontFamily: Manrope
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  landing-display-light:
    fontFamily: Manrope
    fontSize: 56px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: -0.02em
  landing-display-lg:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.015em
  landing-title:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
  landing-body:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  landing-body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 10px
  md: 16px
  lg: 24px
  xl: 32px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  landing-section-y: 96px
  landing-section-y-mobile: 64px
  landing-gutter: 24px
components:
  app-page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
  app-page-muted:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 20px
  card-muted-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label}"
  panel:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 20px
  panel-muted-text:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label}"
  accent-text-on-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    height: 44px
  highlight-card:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse}"
    rounded: "{rounded.lg}"
    padding: 24px
  highlight-card-muted:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse-muted}"
    typography: "{typography.label}"
  chip-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  chart-bar-current:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.on-surface}"
  chart-bar-compare:
    backgroundColor: "{colors.neutral-fill}"
    textColor: "{colors.on-surface}"
  divider:
    backgroundColor: "{colors.border}"
    textColor: "{colors.on-surface}"
  badge-ok:
    backgroundColor: "{colors.status-ok-soft}"
    textColor: "{colors.status-ok}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-warn:
    backgroundColor: "{colors.status-warn-soft}"
    textColor: "{colors.status-warn}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-crit:
    backgroundColor: "{colors.status-crit-soft}"
    textColor: "{colors.status-crit}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  risk-badge-aman:
    backgroundColor: "{colors.risk-aman-soft}"
    textColor: "{colors.risk-aman}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  risk-badge-pantau:
    backgroundColor: "{colors.risk-ringan-soft}"
    textColor: "{colors.risk-ringan}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  risk-badge-waspada:
    backgroundColor: "{colors.risk-tinggi-soft}"
    textColor: "{colors.risk-tinggi}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  risk-badge-kritis:
    backgroundColor: "{colors.risk-bahaya-soft}"
    textColor: "{colors.risk-bahaya}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  risk-text-aman:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.risk-aman}"
  risk-text-pantau:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.risk-ringan}"
  risk-text-waspada:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.risk-tinggi}"
  risk-text-kritis:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.risk-bahaya}"
  focus-ring:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.on-inverse}"
  landing-page:
    backgroundColor: "{colors.landing-canvas}"
    textColor: "{colors.landing-ink}"
    typography: "{typography.landing-body}"
  landing-page-muted:
    backgroundColor: "{colors.landing-canvas}"
    textColor: "{colors.landing-ink-muted}"
    typography: "{typography.landing-body-sm}"
  landing-hero:
    backgroundColor: "{colors.landing-accent-soft}"
    textColor: "{colors.landing-ink}"
    typography: "{typography.landing-display-xl}"
    rounded: "{rounded.lg}"
  landing-statement:
    backgroundColor: "{colors.landing-canvas}"
    textColor: "{colors.landing-ink}"
    typography: "{typography.landing-display-lg}"
  landing-card:
    backgroundColor: "{colors.landing-surface}"
    textColor: "{colors.landing-ink}"
    typography: "{typography.landing-title}"
    rounded: "{rounded.lg}"
  landing-card-muted:
    backgroundColor: "{colors.landing-surface}"
    textColor: "{colors.landing-ink-muted}"
    typography: "{typography.landing-body-sm}"
  landing-card-accent:
    backgroundColor: "{colors.landing-accent-soft}"
    textColor: "{colors.landing-ink}"
    typography: "{typography.landing-title}"
    rounded: "{rounded.lg}"
  landing-dark-block:
    backgroundColor: "{colors.landing-dark}"
    textColor: "{colors.landing-on-dark}"
    typography: "{typography.landing-display-lg}"
    rounded: "{rounded.lg}"
  landing-dark-muted:
    backgroundColor: "{colors.landing-dark}"
    textColor: "{colors.landing-on-dark-muted}"
    typography: "{typography.landing-body-sm}"
  landing-dark-highlight:
    backgroundColor: "{colors.landing-dark}"
    textColor: "{colors.landing-accent-on-dark}"
    typography: "{typography.landing-body-sm}"
  landing-cta:
    backgroundColor: "{colors.landing-ink}"
    textColor: "{colors.landing-surface}"
    typography: "{typography.landing-body-sm}"
    rounded: "{rounded.full}"
    height: 48px
  landing-cta-icon:
    backgroundColor: "{colors.landing-surface}"
    textColor: "{colors.landing-ink}"
    rounded: "{rounded.full}"
    size: 36px
  landing-arrow:
    backgroundColor: "{colors.landing-accent}"
    textColor: "{colors.landing-ink}"
    rounded: "{rounded.full}"
    size: 36px
  landing-chip:
    backgroundColor: "{colors.landing-surface}"
    textColor: "{colors.landing-ink}"
    typography: "{typography.landing-body-sm}"
    rounded: "{rounded.full}"
  landing-line:
    backgroundColor: "{colors.landing-line}"
    textColor: "{colors.landing-ink}"
  landing-photo-caption:
    backgroundColor: "{colors.landing-dark}"
    textColor: "{colors.landing-on-photo}"
    typography: "{typography.landing-body-sm}"
---

# AquaSeq — Design System

> Sumber kebenaran untuk semua kerja UI. Format: [Google DESIGN.md spec](https://github.com/google-labs-code/design.md) (alpha). Token di YAML di atas adalah nilai resmi; jangan pakai warna, ukuran, radius, atau shadow di luar token.
> Status: ✅ ACC 24 Okt 2026 · Kemiripan referensi: belum diukur (tanpa preview) · Lint: 0 error, 0 warning
> Template: Soft Op Dashboard (asal K-DASP) untuk Area Aplikasi, warna merek: biru AquaSeq (dipilih AI dari domain air, selaras dengan mockup mobile tim). Area Landing: referensi dari user (desain landing "Agroton", produsen agrikultur): layout, konsep, dan gaya diikuti persis, warna kuning diganti biru AquaSeq dan foto gandum diganti foto tambak udang dan lab (Pexels), 24 Okt 2026.

## Overview

### Peta area (baca dulu sebelum mengerjakan UI)
| Area | Berlaku untuk file | Mode | Pakai bagian |
|---|---|---|---|
| Bersama | semua | - | `### Bersama` di tiap bagian + token tanpa awalan |
| Aplikasi | `src/app/(app)/**`, `src/app/(auth)/**`, `src/components/app/**`, `src/components/shell/**`, `src/components/solo/**` | Operate | `### Area Aplikasi` + token tanpa awalan |
| Landing | `src/app/(marketing)/**`, `src/components/marketing/**`, `src/components/motion/**` | Persuade | `### Area Landing` + token `landing-*` |

Aturan: kerjakan file Landing → baca Bersama + Area Landing saja, abaikan Area Aplikasi (dan sebaliknya). Komponen `src/components/ui/` memakai token Bersama.

### Bersama
- **Merek:** satu biru (`primary` #1764C0 untuk teks/tombol, `accent-fill` #2B8AE2 untuk grafik/isian besar). Biru tidak pernah berarti status: risiko memakai skala `risk-*`.
- **Font:** Onest untuk semua teks, JetBrains Mono hanya untuk ID, kode sampel, posisi well, dan rumus. Landing memakai Manrope untuk semua teksnya.
- **Ikon:** Lucide, stroke 1.75, satu gaya.
- **Mode:** Aplikasi light. Landing light (kanvas biru pucat + kartu putih) dengan satu blok gelap.
- **Kejujuran data:** setiap angka contoh berlabel "Data simulasi". Skor dari backend ditulis "peluang wabah (model V1-GSI)" dan versi model selalu bisa dilihat; tidak ada klaim akurasi.
- **Dihindari:** gradien ungu-biru bawaan AI, glassmorphism dekoratif, emoji, em-dash di teks UI, warna merek untuk menyatakan bahaya.

### Area Aplikasi
Tenang, lembut, padat data. Untuk pemilik tambak yang membuka dasbor tiap pagi di laptop, dan teknisi yang membuka tugas di HP di pematang kolam saat terik. Kanvas abu terang, panel abu berisi kartu putih membulat besar, navigasi pill, satu warna merek sebagai aksen, satu kartu sorotan navy per layar untuk kolam paling berisiko. Kedalaman dari lapisan warna, bukan bayangan. Mode light dipilih karena teknisi membaca di bawah matahari.

### Area Landing
"Foto tambak, kartu membulat, biru air." Mengikuti referensi Agroton dari user: kanvas pucat, hero berupa kartu foto besar membulat dengan judul setengah tebal setengah tipis, kalimat pernyataan besar dengan gambar kecil, satu blok gelap berisi angka dan misi, deretan kartu putih bergambar dengan tombol bulat, kartu foto lebar dengan teks raksasa samar, grid alasan, dan kartu bacaan. Isi mengikuti proposal GenoHack: sampel air kolam (eDNA) diurutkan di lab mitra, diolah AquaSeq, lalu jadi peringatan dalam bahasa Indonesia; qPCR mingguan memantau penanda terpilih. Pembaca: petambak (bagian atas) dan juri (dasar ilmiah, batasan).

## Colors

### Bersama
- **Primary (#1764C0):** tombol utama (maks satu per layar), link, teks aksen kecil. Kontras dengan putih 5,9:1.
- **Primary-hover (#12519E):** hover tombol utama.
- **Accent-fill (#2B8AE2):** batang periode ini, garis tren, ikon besar. Tidak untuk teks < 18px.
- **Accent-soft (#E7F1FC):** baris terpilih, chip aksen.
- **Focus (#1D4ED8):** ring fokus 2px offset 2px di semua area.
- **Skala risiko** (hanya untuk kelas skor dari backend, dipetakan di `src/lib/risk.ts`; selalu teks + warna, tidak pernah warna saja):

| Kelas (`risk_class`) | Peluang | Teks | Latar lembut | Pakai |
|---|---|---|---|---|
| Aman (1) | < 5% | `risk-aman` #146C34 | `risk-aman-soft` | badge, angka kelas |
| Waspada ringan (2) | 5-25% | `risk-ringan` #5E5300 | `risk-ringan-soft` | badge, angka kelas |
| Waspada tinggi (3) | 25-60% | `risk-tinggi` #9A3F08 | `risk-tinggi-soft` | badge, angka kelas |
| Bahaya (4) | ≥ 60% | `risk-bahaya` #B91C1C | `risk-bahaya-soft` | badge, angka kelas |
| Ditolak (`REJECTED_*`) | - | `on-surface-muted` | `surface-muted` + ikon `ban` | tanpa angka peluang |

- **Status umum** (`status-ok/warn/crit` + `-soft`): status non-skor, mis. unggahan terkirim, tugas terlambat, undangan kedaluwarsa.

### Area Aplikasi
- **Canvas (#F4F4F3) / Surface (#FFFFFF) / Surface-muted (#ECECEA):** latar halaman / kartu / panel pengelompok.
- **On-surface (#141414) / On-surface-muted (#6B6B68):** teks utama / pendukung.
- **Border (#E2E2DF):** garis baris tabel dan pemisah, halus.
- **Surface-inverse (#0E2135) + On-inverse-muted (#A7BCD2):** satu kartu sorotan navy per layar.
- **Neutral-fill (#DCE3EA):** batang pembanding (minggu lalu), arsir kolam diarsipkan.
- Warna masuk lewat data (kelas risiko, tren, status tugas), bukan lewat tombol atau ikon dekoratif.

### Area Landing
- **Canvas (#EEF3F8) / Surface (#FFFFFF) / Line (#D8E1EA):** latar halaman (pengganti krem referensi) / kartu / garis.
- **Ink (#0F1B2A) / Ink-muted (#4F5D6C):** teks utama dan tombol pill gelap / teks pendukung serta bagian judul bertipe tipis.
- **Accent (#5AA6EE):** isian tombol bulat panah (pengganti kuning referensi), panah ink di atasnya. **Accent-soft (#CFE2F6):** kartu misi, kartu sorotan, latar hero sebelum foto termuat.
- **Dark (#13212F) / On-dark (#F2F6FA) / On-dark-muted (#A9B8C7) / Accent-on-dark (#8CC6FF):** blok gelap dan kartu kecil gelap di atas foto; kata yang disorot di blok gelap memakai accent-on-dark.
- **On-photo (#FFFFFF):** teks raksasa samar di kartu foto (opasitas 0.35, dekoratif, `aria-hidden`).

## Typography

### Bersama
Onest (Google Fonts, OFL) lewat `next/font/google` dengan `display: swap`, variabel `--font-onest`; JetBrains Mono `--font-jetbrains`. Angka di tabel dan metrik memakai `font-variant-numeric: tabular-nums`. Desimal memakai koma (format Indonesia): `0,041 mg/L`, `2.380 kopi/mL`.

### Area Aplikasi
| Token | Ukuran | Pakai |
|---|---|---|
| `display` | 32/1.15 600 | judul halaman (h1) |
| `title` | 18/1.3 600 | judul kartu/panel |
| `metric` | 28/1.1 600 tnum | angka kartu metrik, peluang di kartu kolam |
| `body` | 14/1.5 | isi, tabel (16px di < 768px) |
| `label` | 12/1.4 500 | label, badge, caption |
| `mono` | 12/1.4 500 | kode sampel `B3-0923`, well `C7`, ID run |

Peluang besar di detail kolam dan kartu sorotan memakai `metric` diperbesar 48px (satu-satunya pengecualian), tetap Onest 600.

### Area Landing
| Token | Ukuran | Pakai |
|---|---|---|
| `landing-display-xl` + `landing-display-light` | `clamp(34px, 4.2vw, 56px)` / 1.1, Manrope 600 lalu 300 | judul hero: bagian awal tebal, sisanya tipis |
| `landing-display-lg` | `clamp(24px, 2.8vw, 36px)` / 1.2, 500 (sisa kalimat 300 warna ink-muted) | kalimat pernyataan dan judul section |
| `landing-title` | 18/1.35 600 | judul kartu |
| `landing-body` | 16/1.6 | paragraf |
| `landing-body-sm` | 14/1.5 | label section bertitik, caption, isi kartu, tombol |

Label section kecil (titik biru + "AquaSeq") ditaruh di kolom kiri sejajar judul, bukan di atas judul (bukan eyebrow).

## Layout

### Bersama
Standar responsif:

| Nama | Lebar | Grid | Navigasi |
|---|---|---|---|
| Mobile | < 768px | 1 kolom, gutter 16px | Burger 44×44 + drawer `<dialog>` |
| Tablet | 768-1199px | 2 kolom | Aplikasi: sidebar ciut 76px otomatis. Landing: burger + drawer |
| Desktop | ≥ 1200px | 12 kolom, gap 16px | Aplikasi: sidebar 264px. Landing: navbar penuh, konten maks 1200px |

- **Drawer:** dari kiri (aplikasi) / kanan (landing), lebar ≤ 85vw, scrim 40% + blur; tutup lewat scrim, tombol close, Esc, atau memilih item; `aria-expanded` + `aria-controls`; fokus masuk, terkunci, dan kembali ke burger; scroll halaman terkunci; menutup sendiri saat layar melebar ke desktop.
- **Target sentuh:** ≥ 44px di bawah 1200px, ≥ 36px di desktop. Body ≥ 16px di mobile. Tanpa scroll horizontal di 360px.
- Bagian setinggi layar memakai `min-h-[100dvh]`.

### Area Aplikasi
Spesifikasi shell persis template (sumber: `starter/`):
- **Frame:** kanvas `canvas` penuh layar, tanpa margin dan tanpa sudut membulat; padding konten 32px desktop, 16px mobile.
- **Sidebar** (`app-shell.tsx` starter): 264px, padding 28/20/20, garis kanan `border`, `position: sticky; top: 0; height: 100dvh; overflow-y: auto`. Baris brand: simbol + "AquaSeq" + caption 10px muted "Pemantau risiko kolam". Grup dari PRD §5b (judul 11px muted, maks 4 item): *Pantau* (Dasbor, Peringatan, Kolam) · *Lab* (Unggah hasil lab, Riwayat unggahan) · *Tim* (Tugas, Tim) · *Tambak* (Lokasi, Laporan). Item pill 44px, 13px, ikon 19px; aktif = latar `surface`, teks 600, ikon `primary`; halaman yang belum dibangun diberi titik 4px. Bawah: "Bantuan" + kartu akun `surface` radius 16px (avatar `neutral-fill` 36px, nama, peran "Pemilik" / "Teknisi", chevron → menu akun). Ciut 76px otomatis di 768-1199px atau lewat tombol. Teknisi: grup tunggal (Tugas saya, Catat air, Kolam saya).
- **Top bar:** 85px (76 tablet, 72 mobile), garis bawah. Kiri: tombol ciut + breadcrumb "Nama lokasi / Halaman" 12px. Kanan: badge "Data simulasi" (bila lokasi seed), pill pemilih lokasi (dialog), notifikasi bulat dengan angka `primary`, avatar 40px. Mobile: burger + "AquaSeq".
- **Judul halaman:** h1 `display` + subjudul 13px muted, aksi pill di kanan (secondary + maks satu primary).
- **Footer:** "AquaSeq / Pemantau risiko kolam" kiri; "Model V1-GSI · bukan diagnosis resmi" + titik status kanan; 10px muted.
- **Grid:** 12 kolom gap 16px; panel `surface-muted` (radius `lg`, padding 20px) mengelompokkan 2-4 kartu putih.
- **Responsif:** 768 grid 2 kolom; 375 satu kolom, tabel jadi daftar kartu, panel dua kolom jadi tab. Komponen lebar (heatmap plate 96-well, tabel run) scroll di dalam kartunya sendiri.

**Pola per jenis halaman:**

| Jenis halaman | Contoh | Pola layout | Info utama (besar) | Info pendukung (kecil) |
|---|---|---|---|---|
| Monitor | Dasbor P13 | Baris 4 kartu metrik → kartu sorotan navy (kolam paling berisiko: peluang 48px, kelas, rekomendasi, aksi "Buat tugas") + panel kolam berisiko → panel tugas jatuh tempo → rata-rata peluang per lokasi (batang minggu ini `accent-fill` vs minggu lalu `neutral-fill`) | Kolam Bahaya/Waspada tinggi, alasan | Sampling terakhir, jumlah kolam |
| Daftar | Kolam P14, Tugas P23, Tim P25, Riwayat unggahan P19 | Filter pill di atas → tabel (header `label` muted, tanpa garis vertikal, angka rata kanan, kode `mono`) → mobile: kartu | Nama/kode, peluang + badge kelas, status | Teknisi, tanggal, tren |
| Detail | Kolam P15 | Judul (kode kolam besar + nama + DOC) + peluang 48px + badge kelas di kanan → kartu sorotan rekomendasi + pesan tren → grafik riwayat peluang (garis `accent-fill`, garis ambang kelas putus-putus, tanda tren dari `trajectory`) → tab Sampel / Kimia air / Tugas | Peluang, kelas, rekomendasi | Subskor, versi model |
| Telusuri | Rincian skor P16 | Kiri 5 kolom: rantai bertingkat (peluang → Z → S_qPCR / S_Bio / S_Chem → fitur: Ct, kopi/mL, NH₃ → well) dengan chip versi model `mono` "V1-GSI"; kanan 7 kolom: gerbang PPC + plate dari `meta.wells` + catatan kalibrasi | Peluang dan subskor terbesar | Z, Ct mentah |
| Form/unggah | Unggah hasil lab P17 | Stepper `.toggle`: Pilih file → Cocokkan kolom → Pratinjau QC → Kolam & kimia air → Kirim; galat per baris dalam tabel `status-crit-soft` | Langkah aktif, galat | Metadata run |
| QC | Pratinjau QC (langkah P17) + Detail unggahan P18 | Baris status kontrol (pipeline node pill: Kurva standar → PPC → NTC → 16S → Replikat) → heatmap plate 8×12 (sel 36px, Ct sebagai warna `neutral-fill`→`accent-fill`, Undetermined berarsir) → tabel sampel + status gerbang | Status kontrol, hasil backend per sampel | Slope, efisiensi, R² |
| Tugas teknisi | Tugas saya P36, Kerjakan P37 | Satu kolom bahkan di desktop (maks 640px): progres x dari y → daftar tugas (pill waktu kanan, terlambat `status-crit`) → detail: instruksi besar, kotak alasan `risk-*-soft` (rekomendasi backend), foto 3 kolom, tombol utama menempel di bawah | Instruksi, batas waktu | Pemberi tugas |
| Form isian cepat | Catat kimia air P38 | Grid 2 kolom isian besar (nilai 24px, satuan kecil), keyboard angka (`inputmode="decimal"`), hasil NH₃ bebas dari backend + badge zona, tombol Simpan menempel di bawah | Nilai yang diisi | Zona, rentang aman |
| Pengaturan | P33, P34 | Panel kiri kategori, kanan form; mobile: daftar → halaman | Isian | Penjelasan |
| Auth | Masuk P6, Undangan P11 | `SoloFrame` starter: kartu tengah maks 440px di kanvas, brand di atas; tombol akun demo sebagai secondary penuh | Form | Tautan |
| Kosong/galat | semua daftar, P40-P42 | Placeholder starter: ikon dalam lingkaran 64px, judul, satu kalimat, satu aksi | Apa yang terjadi | Langkah berikutnya |

### Area Landing
- Lebar konten maks 1280px, gutter 24px (16px mobile). Kartu besar (hero, blok gelap, kartu foto) memakai sudut `rounded.lg` 24px.
- Ritme section: 96px desktop, 64px mobile.
- **Urutan section (sama dengan referensi):**

| # | Section | Pola referensi | Isi AquaSeq |
|---|---|---|---|
| 1 | Hero | Kartu foto besar penuh lebar; kiri atas judul (tebal + tipis), kutipan kecil, tombol pill gelap dengan lingkaran panah; kanan bawah kartu gelap kecil berisi teks + foto + tombol bulat | Foto kincir tambak. "AquaSeq membaca DNA air kolam untuk peringatan dini penyakit udang". Kartu kecil: alur sampel ke peringatan, ke #cara-kerja |
| 2 | Pernyataan | Label kiri + gambar kecil, kalimat besar tengah (awal gelap, sisa abu), gambar persegi kanan | Lapisan biologis yang hilang dari pemantauan tambak |
| 3 | Blok gelap | Kiri judul + teks dengan kata disorot; tengah kartu biru pucat "Misi kami"; kanan foto | Kerugian AHPND dunia [riset], misi, foto petambak |
| 4 | Kartu bergambar | Label kiri + judul tengah, 4 kartu putih (foto, judul, keterangan, tombol bulat), tombol pill tengah | 4 langkah: ambil sampel air, urutkan di lab mitra, pantau qPCR mingguan, peringatan ke tambak |
| 5 | Kartu foto lebar | Foto lebar, judul di atas, teks raksasa samar, kartu gelap kecil kiri, 3 kartu angka kanan bawah | "Temukan lewat sekuensing. Pantau tiap minggu." Angka dari proposal (2-4 minggu, 3-5 penanda, 10-35 hari) |
| 6 | Alasan | Kiri: chip, judul, teks, tombol pill; kanan grid 2x2 kartu (satu biru pucat, satu foto) | Kenapa AquaSeq: bahasa Indonesia, berbasis bukti, lab mitra unggah langsung, bukan diagnosis |
| 7 | Dasar ilmiah | Judul tengah + tombol panah; kiri satu kartu besar bergambar, kanan dua kartu kecil bergambar | 3 rujukan nyata dari proposal (tautan DOI) |

- **Navbar:** logo kiri, tautan di tengah, kanan tautan "Masuk" + tombol pill gelap "Hubungi tim". Putih 92% + garis setelah scroll 24px. Mobile: burger + drawer.
- **Footer:** kanvas, logo + kalimat, tautan, tim, catatan foto Pexels.

## Elevation & Depth

### Area Aplikasi
Kedalaman dari lapisan warna (canvas → panel → kartu), bukan bayangan. Satu-satunya bayangan: dialog `0 24px 48px -12px rgba(20,20,20,.25)` dan drawer.

### Area Landing
Tanpa bayangan. Kedalaman dari kartu putih di atas kanvas pucat dan kartu gelap di atas foto.

## Shapes

### Bersama
- **Radius:** `sm` 10px chip kecil/sel heatmap · `md` 16px input, kartu akun · `lg` 24px kartu & panel · `xl` 32px kartu landing · `full` tombol, badge, pill.
- **Ikon:** Lucide, outline, stroke 1.75, 19px di navigasi, 16px inline, 20px di tombol bulat 44px. Tanpa emoji.
- **Logo:** lencana kolam (konsep C, 24 Okt 2026): lingkaran `primary` #1764C0 dengan udang vaname melingkar sebagai ruang negatif (perut bersegmen, dua antena, kipas ekor), dibangun dari grid lingkaran. Wordmark "AquaSeq" Onest 600 (outline path). File di `docs/brand/`: `aquaseq-symbol.svg` (utama), `aquaseq-symbol-small.svg` (di bawah 48px: segmen lebih sedikit, satu antena, tanpa mata), `-black`/`-white`, `aquaseq-horizontal(-white|-black).svg`, set ikon web di `docs/brand/web/`. Ruang bebas minimal setengah diameter lencana; ukuran minimal 16px memakai versi kecil.
- **Foto:** foto laporan tugas radius `md`, rasio 1:1 di grid, buka penuh di dialog.

## Components

### Bersama
- **Sumber komponen:** Area Aplikasi = kelas CSS + komponen `starter/` template Soft Op (`AppShell`, `SoloFrame`, `Placeholder`, `Icon`, `Badge`, `Modal` dialog native) dan pola dari `starter/reference/kdasp-globals.css`; **tanpa shadcn dan tanpa sidebar-21st** (03-ARCHITECTURE Q2). Area Landing = komponen sendiri per section + Motion Primitives di `components/motion/` + `pill-link` (gaya tombol rekomendasi AI).
- **Badge kelas risiko:** pill bertitik, `risk-*-soft` + teks `risk-*`, selalu memuat kata kelas.
- **Badge "Data simulasi":** pill `status-warn-soft` + ikon `flask-conical`, tidak bisa ditutup.
- **Focus:** ring 2px `focus` offset 2px di semua elemen interaktif.
- **Motion:** warna/tekan 150-250ms `cubic-bezier(0.22,1,0.36,1)`; hormati `prefers-reduced-motion`.

### Area Aplikasi
- **Tombol:** pill 44px; primary `primary` (hover `primary-hover`, tekan `scale-[0.97]`), secondary `surface`, ikon bulat 44px. Loading: spinner + label tetap. Label menyebut konsekuensi: "Tugaskan ke Rizky", "Tolak run (12 sampel)".
- **Kartu metrik:** ikon dalam lingkaran 36px + label; angka `metric`; delta dengan arti (naik risiko = `risk-tinggi`, turun = `risk-aman`).
- **Kartu sorotan (navy):** satu per layar; dasbor = kolam paling berisiko; detail kolam = alasan skor; berisi judul, konteks waktu, 2-4 poin, satu aksi pill putih.
- **Kartu kolam:** kode kolam (mono kecil) + nama, peluang `metric`, badge kelas, teknisi, panah tren. Seluruh kartu adalah link ke P15.
- **Grafik riwayat peluang:** SVG dari `trajectory.history`, garis `accent-fill` 2px, titik sampel, garis ambang kelas (5/25/60%) putus-putus halus, sampel ditolak = titik berongga abu dengan tooltip alasan; label tren ("Naik cepat", "Stabil", "Turun", "Data belum cukup") dari `trend`; sumbu `label` muted.
- **Heatmap plate:** grid 8×12, sel 36px radius `sm`, isi warna dari Ct, teks posisi `mono` 10px saat hover/fokus, well dikeluarkan dicoret, klik → dialog detail well.
- **Dialog keputusan** (keluarkan well, tolak run, minta ulang tugas): `Modal` native, focus trap, Esc; catatan wajib; hasil tercatat dengan nama + waktu.
- **Modal buat tugas:** kolom: jenis, kolam (terisi), teknisi (terisi pemegang kolam), instruksi (terisi dari `recommendation` backend, bisa diubah), jatuh tempo; ringkasan "Rizky akan menerima tugas ini di HP".
- **Tabel:** header `label` muted, tanpa garis vertikal, garis baris `border`, angka rata kanan, aksi sekunder di menu ⋯; mobile jadi kartu.
- **Empty state:** placeholder starter dengan kalimat langkah berikutnya ("Belum ada hasil lab. Unggah CSV pertama untuk melihat skor kolam.").
- **Skeleton:** blok `surface-muted` radius sama dengan isi, tanpa shimmer saat reduced-motion.
- **Toast:** kecil di kanan bawah, `surface-inverse`, 4 detik, untuk konfirmasi simpan.

### Area Landing
- **Tombol pill:** `landing-cta` (ink) 48px, teks lalu lingkaran putih 36px berisi panah serong; hover: lingkaran berputar 45deg dan latar sedikit terang, tekan `scale-[0.97]`, ring fokus. Satu gaya untuk semua CTA.
- **Tombol bulat panah:** `landing-arrow` 36px (44px area sentuh) di pojok kartu; hanya pada kartu yang benar-benar tautan.
- **Kartu bergambar:** foto di atas (rasio 4:3), judul + keterangan, tombol bulat; hover: kartu naik 2px, foto zoom 1.04.
- **Teks raksasa samar:** satu kali di kartu foto lebar, `aria-hidden`.
- **Token gerak:**
  - Lenis: `lerp 0.1`, `anchors: true`; tidak diinisialisasi saat reduced-motion.
  - `Reveal`: naik 24px + opacity, 500ms ease-out, hanya judul dan blok utama.
  - Reduced-motion: semua gerak mati; transisi warna tetap.

## Do's and Don'ts

**Prinsip UX (wajib, semua layar)**

| # | Prinsip | Penerapan di projek ini |
|---|---|---|
| 1 | Desain untuk sistem: tahan variasi konten | Kartu kolam tetap rapi untuk nama kolam panjang ("Kolam Bioflok Utara 12"), peluang 0,0% sampai 99,9%, sampel Ditolak (tanpa angka), dan kolam tanpa teknisi; daftar diuji dengan 0, 1, dan 40 kolam |
| 2 | Konsisten | Satu grid 12 kolom, Onest saja, Lucide stroke 1.75, satu skala risiko di semua layar (dasbor, detail, peringatan, landing) |
| 3 | Hierarki | Peluang dan kelas paling besar; kode sampel dan posisi well kecil `mono`; biru hanya untuk aksi |
| 4 | Info di titik keputusan | Rekomendasi dan pesan tren tepat di bawah angka peluang; teknisi pemegang kolam terlihat di sebelah tombol "Tugaskan" |
| 5 | Konsekuensi terlihat sebelum aksi | "Kirim 12 sampel ke analisis"; "Rizky akan menerima tugas ini di HP"; "Keluarkan well C7: Ct sampel B3-1023 dihitung dari 2 replikat" |
| 6 | Kurangi hambatan | Tombol Simpan/Laporkan menempel di bawah layar teknisi; instruksi tugas terisi dari rekomendasi backend; "Pakai nilai kemarin" di catat air |
| 7 | Hapus yang berlebihan | Tidak ada label "Peluang:" di kartu kolam bila angka + badge sudah jelas; tidak ada sapaan "Selamat datang" kosong di dasbor |
| 8 | Detail premium | Garis baris `border` halus, angka tabular rata kanan, jarak menyatakan kelompok (kartu metrik rapat, panel berjarak) |
| 9 | Aksi utama jelas tapi tidak agresif | Satu primary pill per layar, tanpa huruf kapital semua |

**Anti tampilan AI (A1-A11, A13)**
- **A1** Ikon Lucide saja, tidak ada emoji di UI, data, atau seed.
- **A2** Warna hanya dari token; biru untuk aksi, `risk-*` untuk kelas, sisanya netral.
- **A3** Satu layar satu tugas: dasbor memantau, detail kolam memahami, rincian skor menelusur, pratinjau QC memvalidasi. Data well tidak diulang di dasbor.
- **A4** Sidebar hanya berisi halaman yang sering dipakai (9 item pemilik, 3 teknisi); pengaturan, log, bantuan di menu akun; kartu akun sederhana, bukan avatar gradien.
- **A5** Aksi sekunder (ekspor, arsipkan, pratinjau WA) di menu ⋯; angka rata kanan; ID dan posisi well kecil.
- **A6** Tidak ada kartu promosi, ilustrasi dekoratif, atau badge tanpa fungsi.
- **A7** Isian sedikit (tambah kolam, buat tugas, undang) = modal; QC yang padat = halaman; opsi lanjutan unggah (volume elusi) dilipat; riwayat kolam di tab.
- **A8** Data bisa dibandingkan: riwayat peluang, batang minggu ini vs lalu, heatmap plate, tabel yang bisa diurutkan, banding kolam berdampingan.
- **A9** Tanpa em-dash/en-dash di teks UI; rentang memakai tanda hubung (`20-39`).
- **A10** Konten realistis lokal: Tambak Sumber Rejeki (Puger, Jember), Tambak Mina Lestari (Situbondo), teknisi Rizky Pratama, Agus Setiawan, Dwi Lestari; angka seperti Ct 31,5, peluang 34,8%; tanpa kata klise pemasaran.
- **A11** `min-h-[100dvh]` untuk hero dan auth; font lewat `next/font`.
- **A13** Setiap elemen klik punya hover, tekan, dan fokus beranimasi 150-250ms; elemen yang tidak bisa diklik tidak memakai panah/chevron/kursor pointer. Aplikasi: warna + tekan saja. Landing: sesuai LANDING-PAGE §5.

**Aturan template (Area Aplikasi)**
- Satu primary per layar; satu kartu sorotan navy per layar.
- Tidak ada hex di komponen.
- `accent-fill` tidak untuk teks < 18px.
- Setiap klaim sistem punya sumber yang bisa diklik (peluang → rincian skor, versi model tampil).
- Data simulasi diberi badge.

**Larangan AI slop (Area Landing)**
- Gradient text, blob blur, glow, glassmorphism.
- Ikon dalam lingkaran sebagai pengganti foto; kartu langkah selalu memakai foto nyata.
- Eyebrow label di atas judul (label section ada di kolom kiri).
- Animasi di semua elemen; efek teks per kata.
- Testimoni, logo klien, atau angka karangan. Angka hanya dari proposal dan rujukannya.
- Kata klise dan em-dash.

**Aksesibilitas**
- Do: kontras ≥ 4.5:1 (teks besar/elemen UI ≥ 3:1, dicek `lint`); fokus selalu terlihat; semua aksi bisa lewat keyboard (heatmap: panah untuk berpindah sel); target ≥ 44px di bawah 1200px; label untuk setiap input; `aria-label` untuk ikon tanpa teks; grafik punya ringkasan teks.
- Don't: menyampaikan kelas risiko hanya lewat warna.

**Checklist review UI**
- [ ] Hanya memakai token dari file ini
- [ ] Semua state ada (hover, focus, disabled, loading, empty, error)
- [ ] Responsif di 375px, 768px, 1440px tanpa scroll horizontal
- [ ] Lulus Prinsip UX 1-9 dan Anti tampilan AI
- [ ] Shell aplikasi lolos verifikasi berdampingan dengan `starter/` preview
- [ ] `lint` 0 error dan tanpa warning `contrast-ratio`

## Deviations from Reference

| Aspek | Referensi | Di sini | Alasan |
|---|---|---|---|
| Warna merek | K-DASP oranye #C2410C | Biru #1764C0 / #2B8AE2 | Slot merek per projek (TEMPLATE §3b); domain air, selaras mockup mobile tim |
| Skala status | 3 tingkat (`status-ok/warn/crit`) | Tambah skala 4 kelas `risk-*` khusus skor | Kebutuhan PRD: kelas Aman/Waspada ringan/Waspada tinggi/Bahaya dari backend harus bisa dibedakan |
| Bingkai | Preview K-DASP membulat 12px | Penuh layar tanpa sudut | Revisi template (PANTARA, Okt 2026) |
| Font | Onest saja | Landing memakai Manrope | Mendekati huruf referensi Agroton (geometris, berat tipis dan tebal); aplikasi tetap Onest |

## Implementation

Token tidak ditulis ulang di kode; hasilkan dari file ini (Windows: pakai alias `designmd`):

```bash
npx -p @google/design.md designmd lint docs/08-DESIGN.md
npx -p @google/design.md designmd export --format css-tailwind docs/08-DESIGN.md > src/styles/theme.css
```

- Setelah `@import` theme di `globals.css`, lepas bentrok spacing Tailwind v4: `@theme inline { --spacing-xs: initial; --spacing-sm: initial; --spacing-md: initial; --spacing-lg: initial; --spacing-xl: initial; --spacing-2xl: initial; }`.
- **Implementasi acuan Area Aplikasi:** `~/.claude/skills/setup-project-00/design-templates/soft-ops-dashboard/starter/` (salin, jangan tafsir ulang); shell, ukuran, perilaku sesuai Layout di atas. Verifikasi berdampingan 1440/768/375 sesuai `starter/README.md`.
- Komponen landing: `pill-link.tsx` dan `action-row.tsx` dari `~/.claude/skills/setup-project-00/components/buttons/` ke `src/components/ui/`.
- Setelah mengubah token: `lint` + `export` ulang, lalu `diff` theme lama dan baru.

## Changelog

| Tanggal | Perubahan |
|---|---|
| 24 Okt 2026 | Dokumen awal: Soft Op Dashboard + merek biru + skala risiko + Area Landing. Kemiripan belum diukur (tanpa preview); preview dan penyamaan ≥95% bisa dijalankan nanti lewat skill `project-design` |
| 24 Okt 2026 | Skala risiko mengikuti kelas backend (Aman, Waspada ringan, Waspada tinggi, Bahaya); meter keyakinan dan EWMA dihapus; kalkulator memakai `sdri/preview` |
| 24 Okt 2026 | Area Landing mengikuti referensi user (Agroton) persis dengan warna biru dan foto tambak; isi mengikuti proposal GenoHack (DNA air kolam, bukan kimia air). Token deep/paper lama dihapus |
| 24 Okt 2026 | Logo AquaSeq: lencana kolam dengan udang melingkar (`docs/brand/`) |
