---
version: alpha
name: "AquaSeq"
description: "Kaca terang gaya Iconly Pro: kanvas abu netral bercahaya pastel, panel kaca putih bertepi tebal, UI hitam-abu monokrom, satu aksen teal solid dengan glow"
colors:
  primary: "#0A6B78"
  on-primary: "#FFFFFF"
  fab: "#0B7D8A"
  on-fab: "#FFFFFF"
  accent-glow: "#3CC6D2"
  primary-soft: "#DDF1F3"
  on-primary-soft: "#0A6B78"
  canvas: "#EEEEEF"
  canvas-low: "#E4E6E8"
  bloom-aqua: "#BDEBF0"
  bloom-sky: "#CFE3FB"
  bloom-lilac: "#E3DCF7"
  glass: "#F4F5F6"
  glass-strong: "#FAFAFB"
  surface: "#F7F7F8"
  surface-raised: "#FFFFFF"
  water-top: "#EEF1F2"
  water-mid: "#D6ECEF"
  water-bottom: "#9FD3DA"
  track: "#E4E6E8"
  on-surface: "#0D0E10"
  on-surface-muted: "#5E6168"
  ink-soft: "#4B5058"
  outline: "#E3E4E7"
  outline-strong: "#C9CCD1"
  rim: "#FFFFFF"
  success: "#1C7A4E"
  success-soft: "#E2F3EA"
  warning: "#8A5A00"
  warning-soft: "#FBF1D6"
  alert: "#B04A06"
  alert-soft: "#FDE8D7"
  danger: "#C0262D"
  danger-soft: "#FBE3E3"
  on-danger: "#FFFFFF"
  simulation: "#5B3FC4"
  simulation-soft: "#ECE8FB"
  focus-ring: "#0A6B78"
typography:
  display-xl:
    fontFamily: "Figtree"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display-lg:
    fontFamily: "Figtree"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  display-md:
    fontFamily: "Figtree"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Figtree"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Figtree"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: "Figtree"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Figtree"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label-md:
    fontFamily: "Figtree"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.2
  label-sm:
    fontFamily: "Figtree"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
  caption:
    fontFamily: "Figtree"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.35
  label-caps:
    fontFamily: "Figtree"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  frame: 44px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  gutter: 12px
  margin: 20px
components:
  page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface}"
  page-caption:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-sm}"
  page-low:
    backgroundColor: "{colors.canvas-low}"
    textColor: "{colors.on-surface-muted}"
  glass-panel:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  glass-caption:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-sm}"
  glass-strong:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-sm}"
  card-raised:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  raised-caption:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.caption}"
  water-card-top:
    backgroundColor: "{colors.water-top}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
  water-card-mid:
    backgroundColor: "{colors.water-mid}"
    textColor: "{colors.on-surface-muted}"
  water-card-bottom:
    backgroundColor: "{colors.water-bottom}"
    textColor: "{colors.on-surface}"
  bloom-aqua:
    backgroundColor: "{colors.bloom-aqua}"
    textColor: "{colors.on-surface}"
  bloom-sky:
    backgroundColor: "{colors.bloom-sky}"
    textColor: "{colors.on-surface}"
  bloom-lilac:
    backgroundColor: "{colors.bloom-lilac}"
    textColor: "{colors.on-surface}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "52px"
  button-glass:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "52px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: "52px"
  button-link:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
  fab:
    backgroundColor: "{colors.fab}"
    textColor: "{colors.on-fab}"
    rounded: "{rounded.full}"
    size: "56px"
  action-pill:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    height: "56px"
  icon-button:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    size: "44px"
  input:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: "52px"
  input-placeholder:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface-muted}"
  segment-track:
    backgroundColor: "{colors.track}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
  segment-active:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.xs}"
  chip:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: "36px"
  chip-selected:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.on-primary-soft}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: "36px"
  nav-bar:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    height: "72px"
  nav-item-active:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
  nav-item-inactive:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-sm}"
  value-pill:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface-raised}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  risk-aman:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  risk-pantau:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  risk-waspada:
    backgroundColor: "{colors.alert-soft}"
    textColor: "{colors.alert}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  risk-kritis:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  risk-aman-on-glass:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.success}"
  risk-pantau-on-glass:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.warning}"
  risk-waspada-on-glass:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.alert}"
  risk-kritis-on-glass:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.danger}"
  badge-simulasi:
    backgroundColor: "{colors.simulation-soft}"
    textColor: "{colors.simulation}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
  shortcut:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    size: "60px"
  glow:
    backgroundColor: "{colors.accent-glow}"
    textColor: "{colors.on-surface}"
  rim:
    backgroundColor: "{colors.rim}"
    textColor: "{colors.on-surface}"
  divider:
    backgroundColor: "{colors.outline}"
  divider-strong:
    backgroundColor: "{colors.outline-strong}"
  focus-ring:
    backgroundColor: "{colors.focus-ring}"
---

# AquaSeq — Design System

> Sumber kebenaran untuk semua kerja UI. Format: [Google DESIGN.md spec](https://github.com/google-labs-code/design.md) (alpha). Token di YAML di atas adalah nilai resmi; jangan pakai warna, ukuran, radius, atau bayangan di luar token dan resep di bawah. Di React Native, token masuk ke kode lewat `src/ui/theme/tokens.ts` (lihat Implementation).
> Status: ✅ ACC oleh user 24 Okt 2026 · v2.1 · Lint 0 error, 0 warning. Desain v1 (R1-R4, pita biru) dibuang total atas permintaan user. Analisis referensi: `docs/design/refs/iconly-pro-analysis.md`.

## Overview

Kaca terang yang tenang, dipelajari dari seluruh 378 shot publik Iconly Pro di Dribbble. Kanvas abu netral dengan cahaya pastel samar di belakang, panel kaca putih bertepi tebal yang seolah timbul dari kanvas, UI hampir monokrom (hitam dan abu), dan **satu** aksen jenuh: tombol aksi utama teal solid dengan glow. Untuk analis lab dan manajer tambak yang membaca risiko kolam dari HP, sering di luar ruangan, jadi mode terang dan kontras teks dijaga ketat.

- **Referensi:** Iconly Pro (dribbble.com/iconlypro), 378 shot ditinjau satu per satu lewat lembar kontak, ±40 shot UI/kaca dipelajari pada resolusi penuh, warna diambil dari piksel. Shot acuan utama: "iOS Navigation Menu", "Navigation Menu" (Home/Search/Library), "iOS input Design", "Financial App!", "Financial Widget", "UI Card Design", "UI Widgets", "UI Components!", "Weather App!", "Health App!", "Dashboard App". Situs iconly.pro dicek untuk font (Gellix).
- **Ciri yang diambil:** kanvas abu `#EEEEEF` → `#E4E6E8`; bloom pastel buram; panel kaca bertepi putih 2px dengan bayangan dalam bawah dan bayangan luar lebar; nav pil kaca dengan item aktif ikon terisi hitam; FAB bulat beraksen dengan glow; tombol aksi berupa pil kaca; kartu "kolom air" bergradasi vertikal; angka besar bertipe tipis; grafik garis hitam dengan pil nilai hitam; kontrol segmen track abu.
- **Signature AquaSeq: kartu kolom air.** Kartu hero SDRI memakai gradasi vertikal abu jernih → aqua (pola "Financial Widget"), seperti sampel air dalam tabung. Warnanya selalu aqua (merek), bukan warna kelas risiko; kelas dinyatakan oleh pil warna + ikon + teks.
- **Dihindari:** label abu muda bergaya Iconly yang gagal kontras, aksen lebih dari satu per layar, kaca di atas tabel padat, mode gelap (di luar MVP: tidak terbaca di bawah terik).
- **Mode:** terang saja.

## Colors

UI monokrom, warna masuk lewat aksi (aksen) dan data (status risiko). Pastel hanya sebagai cahaya latar.

- **On-surface (#0D0E10):** teks, ikon aktif, garis grafik, pil nilai. Hampir hitam seperti Iconly.
- **On-surface-muted (#5E6168):** teks pendukung dan item nav nonaktif. Lebih gelap dari abu Iconly (#9E9E9E, 2,5:1) supaya lolos AA di kaca (5,35:1 di `canvas`, 5,68:1 di `glass`).
- **Ink-soft (#4B5058):** teks segmen nonaktif di atas `track`.
- **Primary (#0A6B78):** teks tombol utama berlatar, tautan, cincin fokus. Teal dalam, teks putih 6,2:1.
- **Fab (#0B7D8A):** isi solid satu warna tombol aksi utama (FAB, tombol kirim), tanpa gradasi. Ikon putih 4,87:1. **Satu per layar.**
- **Accent-glow (#3CC6D2):** hanya untuk glow di bawah FAB dan titik data terpilih. Tidak untuk teks.
- **Primary-soft (#DDF1F3):** chip terpilih, sorotan baris.
- **Canvas (#EEEEEF) / canvas-low (#E4E6E8):** kanvas bergradasi atas → bawah (diukur dari shot: `#EFEFEF` → `#DEDEDE`).
- **Bloom-aqua / sky / lilac:** cahaya pastel buram di kanvas (lingkaran blur 120, opasitas 55-70%), maksimal dua per layar, tidak pernah di belakang teks kecil tanpa panel.
- **Glass (#F4F5F6) / glass-strong (#FAFAFB):** warna jadi panel kaca dan tombol kaca untuk menghitung kontras; render ada di Elevation & Depth.
- **Surface (#F7F7F8) / surface-raised (#FFFFFF):** kartu solid untuk data padat (tabel, heatmap) dan elemen di dalam kaca.
- **Water-top / mid / bottom (#EEF1F2 / #D6ECEF / #9FD3DA):** gradasi kartu kolom air. Teks di bagian bawah tetap `on-surface` (11,8:1), bukan putih.
- **Risiko (selalu warna + ikon + teks):** Aman `success`, Pantau `warning`, Waspada `alert`, Kritis `danger`, masing-masing dengan `-soft` untuk latar pil.
- **Simulation (#5B3FC4):** khusus badge SIMULASI.

## Typography

**Figtree** (Google Fonts, SIL OFL), pengganti bebas lisensi untuk **Gellix**, font yang dipakai Iconly (diverifikasi dari computed style iconly.pro). Dipilih dari 8 kandidat yang dirender berdampingan dengan crop teks asli: paling dekat dalam bentuk 'a' dua lantai, ekor 'y' lurus, 'S' geometris, dan lebar huruf. Dimuat lokal lewat `expo-font` (`assets/fonts/Figtree-*.ttf`), web `font-display: swap`. Fallback: `System`, `-apple-system`, `Segoe UI`, `Roboto`.

- **Display (48 / 36 / 28):** angka utama (SDRI, copies/mL, jumlah kolom). Tipis (400) dan besar seperti "$ 12 651" Iconly; 28 memakai 500.
- **Headline (22) / title (17), semibold:** sapaan, judul layar, judul kartu.
- **Body (16 / 14):** penjelasan dan rekomendasi, line-height 1,5.
- **Label (15 semibold / 12 medium):** tombol, chip, label nav (12).
- **Caption (12):** tanggal, satuan, keterangan grafik.
- **Label caps (11, bold, +0,06em):** "SIMULASI", "PPC", kepala kolom tabel.
- Angka desimal pakai koma. Satuan lebih kecil dan muted di samping angka ("1,6 × 10⁴ copies/mL").

## Layout

- **Grid & margin:** margin layar 20, jarak antarkartu 12, padding panel kaca 24, padding kartu 16. Basis spacing 4.
- **Container web:** max-width 1200, di tengah.
- **Breakpoint & navigasi.** Referensi (dan PRD) memakai **bar navigasi pil melayang**, jadi burger + drawer tidak dipakai untuk navigasi utama:

| Nama | Lebar | Grid | Navigasi |
|---|---|---|---|
| Mobile | < 768 | 1 kolom, margin 20 (16 di lebar ≤ 360) | Nav pil kaca melayang, 16 dari bawah + safe area |
| Tablet | 768-1199 | 2 kolom kartu | Nav pil kaca, lebar maks 520, di tengah |
| Desktop (web) | ≥ 1200 | 12 kolom, max 1200 | Rail kaca vertikal melayang di kiri (ikon + label), FAB di atas rail |

- **Kanvas:** gradasi `canvas` → `canvas-low` (atas → bawah) + 1-2 bloom pastel di pojok (aqua kanan atas, lilac/sky kiri bawah). Bloom diam, tidak beranimasi.
- **Header layar (pola Iconly):** kiri: tanggal/konteks (`caption` muted) di atas judul atau sapaan (`headline`); kanan: tombol ikon kaca bulat 44 dan/atau avatar 44. Menempel saat scroll dengan latar kaca.
- **Sheet bawah:** panel kaca radius atas 32, scrim redup, tutup lewat scrim, tombol tutup, gesek turun, atau `Esc`; fokus masuk dan kembali ke pemicu.
- **Urutan konten mobile:** angka utama (kartu kolom air) → alasan (komponen) → tindakan → detail/riwayat.
- **Target sentuh:** ≥ 44 di bawah 1200, ≥ 36 di desktop. Body ≥ 16 di HP. Tanpa scroll horizontal di 360 (tabel lebar digulir di dalam kartunya).
- **Konten lewat di bawah nav:** padding bawah daftar = 72 + 16 + 12 + safe area.

| Jenis layar | Tugas | Pola layout | Info utama | Info pendukung |
|---|---|---|---|---|
| **Beranda / hub** (P2, P15) | Melihat keadaan lalu pergi ke tugas | Header sapaan → kartu status kaca (peta kolam / alur sampel) → baris 4 pintasan squircle → kartu tindakan teratas | Jumlah Kritis/Waspada, SDRI tertinggi; run menunggu QC | "dari 5 kolam aktif", waktu pembaruan |
| Daftar (run, kolam, peringatan) | Memilih yang ditangani | Baris `card-raised` di dalam satu panel kaca, filter chip di atas | Nama + kelas + SDRI | Tanggal, DOC |
| Ringkasan risiko (P10, P16) | Memahami dan bertindak | Kartu kolom air (SDRI besar + pil kelas + pil aksi kaca) → kartu komponen → kartu tindakan | SDRI + kelas | Komponen, versi rumus |
| QC run (P4, P5) | Menilai validitas | Ringkasan status di kaca, heatmap plate di kartu solid, kurva standar | Status run + efisiensi | SD replikat, Tm |
| Detail data (P6, P17) | Memeriksa angka | Kartu grafik garis + kontrol segmen + tabel ringkas | Nilai terakhir | Riwayat, aturan |
| Jejak bukti (P11) | Menelusur skor | Diagram node vertikal di kartu solid, node bisa diketuk | Skor → komponen | Ct, copies/mL, aturan |
| Form (P3, P8, P9) | Memasukkan data | Satu kolom input kaca, label di atas, hasil turunan (NH3) langsung di bawah | Field | Rentang aman, satuan |
| Laporan & WA (P12, P19, P20) | Menerbitkan/meneruskan | Kartu laporan + gelembung pesan; tombol utama menempel di bawah | Kelas + tindakan | Penerima, waktu |
| Kosong / galat / offline | Menjelaskan keadaan | Panel kaca: ikon dalam lingkaran kaca 64 + judul + 1 kalimat + 1 tombol (pola "Empty State UI") | Apa yang terjadi | Langkah berikutnya |

## Elevation & Depth

Kedalaman dari kaca bertepi dan bayangan lebar yang lembut, bukan border gelap.

- **Kanvas:** gradasi + bloom (lihat Layout).
- **Panel kaca (`glass-panel`, header, sheet, nav, kartu status):**
  - Isi: putih 62% (`rgba(255,255,255,0.62)`) + blur 24 + saturasi 1,4 (web `backdrop-filter`; iOS 26 `GlassView` `regular`; iOS lama `BlurView` `systemThinMaterialLight`; Android `BlurView` dimezis intensitas 50).
  - Kilau atas: gradien vertikal putih 55% → 0% di 40% tinggi teratas.
  - Rim: 2,5 px, gradien 160° putih 100% → 80% → 35% → 90% (paling terang di atas-kiri, seperti shot "iOS Navigation menu").
  - Bayangan dalam bawah: `inset 0 -6px 14px rgba(13,14,16,0.04)`.
  - Bayangan luar: `0 2px 6px rgba(13,14,16,0.04), 0 18px 40px rgba(13,14,16,0.10)`.
  - Reduce transparency: `surface-raised` pekat + rim 1 `outline` + bayangan yang sama.
- **Tombol kaca / pil aksi (`button-glass`, `action-pill`, `icon-button`):** isi gradien vertikal putih 95% → 70%, rim 1,5 putih, bayangan dalam bawah `inset 0 -3px 6px rgba(13,14,16,0.06)`, bayangan luar `0 6px 14px rgba(13,14,16,0.08)`. Tekan: bayangan luar hilang, skala 0,97.
- **Kartu solid (`card`, `card-raised`):** `0 1px 2px rgba(13,14,16,0.04), 0 8px 24px rgba(13,14,16,0.06)`, tanpa border.
- **Kartu kolom air:** gradien 180° `water-top` 0% → `water-mid` 55% → `water-bottom` 100%, rim 2 putih, glow dalam bawah `inset 0 -18px 36px rgba(60,198,210,0.30)`, bayangan luar seperti panel kaca.
- **FAB:** isi solid `fab`, rim 2 putih 70%, glow `0 10px 24px rgba(60,198,210,0.45)`. Tanpa gradasi dan tanpa kilau.

## Shapes

- **Radius:** `frame` 44 untuk bingkai layar penuh/desktop panel besar; `xl` 32 untuk panel kaca dan kartu kolom air; `lg` 24 untuk kartu, input, ubin pintasan; `md` 16 untuk elemen dalam kartu; `sm` 12 untuk track segmen; `xs` 8 untuk segmen aktif dan sel heatmap; `full` untuk nav, tombol, chip, pil, FAB, avatar. Dasar: bingkai Iconly ≈ 14% lebar (setara sudut layar iPhone), kartu dalam ≈ 6%.
- **Ikon:** Lucide (`lucide-react-native`), stroke 1,75, ukuran 22 (default), 24 (nav), 16 (dalam teks). Gaya Iconly "outline nonaktif / bold aktif" ditiru: ikon aktif nav diisi `on-surface` dengan detail `surface-raised` (lihat Deviations). Tanpa emoji sebagai ikon.
- **Ikon kelas risiko:** Aman `ShieldCheck`, Pantau `Eye`, Waspada `TriangleAlert`, Kritis `Siren`, Ditolak `Ban`.
- **Gambar:** tanpa foto dan tanpa avatar foto (tanpa login); avatar = inisial di lingkaran kaca. Visual datang dari data.

## Components

- **Sumber komponen:** komponen yang sudah ada di projek → primitif React Native/Expo → komponen pilihan user: **GlassSurface** (`docs/glass-surface-port.md`) → tulis sendiri. shadcn/ui tidak dipakai (web/Tailwind).
- **Nav pil kaca (`nav-bar`):** inset kiri/kanan 20, bawah 16 + safe area, tinggi 72, radius penuh, resep panel kaca. Lima slot: dua item, FAB, dua item. Item: ikon 24 + label 12; aktif ikon terisi + label `on-surface` semibold, nonaktif ikon garis + label `on-surface-muted`. Area sentuh ≥ 56 × 56. **FAB:** 56, di tengah bar sejajar garis tengah (seperti "Health App!"), ikon putih 24, label aksesibilitas wajib ("Unggah run" / "Peringatan, 2 aktif"), badge jumlah 20 `danger`. Tekan: skala 0,96 + haptik ringan.
- **Header sapaan:** `caption` muted ("Jumat, 24 Okt · diperbarui 3 menit lalu") di atas `headline` ("Selamat pagi, Krisna"); kanan tombol kaca bulat 44 (Cari, Ganti peran) + avatar inisial 44. Badge SIMULASI di judul kartu status.
- **Kartu status (hub):** panel kaca radius 32.
  - **Manajer, "Status 5 kolam":** ubin kolam di dalam kaca berupa `card-raised` radius 16: kode kolam, SDRI `display-md`, pil kelas. Kolam paling berisiko jadi ubin lebar penuh; sisanya grid 2×2. Lebih dari 5: tampil 5 teratas + "Semua".
  - **Analis, "Alur sampel":** lima tahap (Diunggah → QC → Ditolak → Draf → Terbit) sebagai lingkaran kaca 40 dengan ikon + angka `title` + label `caption`, dihubungkan garis putus-putus `outline-strong`.
  - **Baris fakta** di kaki: 2-3 fakta dipisah titik, angka tebal.
- **Pintasan:** 4 kolom; ubin squircle kaca transparan 60 radius 24 (`shortcut`, resep tombol kaca: isi putih 95% → 70%, rim putih 1,5, bayangan dalam bawah), ikon `on-surface` 26 stroke 1,75, label `label-sm` di bawah. Monokrom seperti lingkaran kaca ikon Iconly, jadi aksen tetap hanya di FAB (keputusan user, 24 Okt). Hanya halaman yang tidak ada di nav.
- **Kartu kolom air (hero risiko):** radius 32, gradasi `water-*`. Atas: `caption` konteks ("Kolam B-03 · DOC 85 · 23 Okt") + badge SIMULASI. Tengah: SDRI `display-xl` + "/100" `body-sm` muted + pil kelas. Bawah: baris 3-4 pil aksi kaca bulat dengan label di bawahnya ("Jejak", "Laporan", "Bagikan WA", "Tren"), seperti tombol Deposit/Withdraw di "Financial Widget". Di bawahnya dua angka pendukung ("Patogen 80 · Lingkungan 0").
- **Kartu tindakan:** panel kaca; baris atas kode kolam · pil kelas; judul `title` (kata kerja di depan); satu kalimat alasan `body-sm` muted; tombol primary + tombol kaca. Kritis: rim dalam `danger` 25%.
- **Tombol:** `button-primary` (satu per layar, teal, huruf biasa, tinggi 52), `button-glass` (sekunder), `button-danger`. Fokus web: cincin 2 `focus-ring` offset 2. Nonaktif: opacity 0,45. Loading: spinner + label tetap. Label menyebut konsekuensi: "Terbitkan ke Tambak Sumberejo", "Salin pesan untuk 3 petambak".
- **Pil aksi / tombol ikon kaca:** lingkaran atau pil 44-56 dengan resep tombol kaca; ikon `on-surface` 22.
- **Input kaca (pola "iOS input Design"):** `input` radius 24, label `label-sm` di atas, placeholder `on-surface-muted`, ikon kiri 20; satuan di kanan, muted. Fokus: rim berubah 2 `primary`. Galat: rim `danger` + pesan `body-sm` `danger` di bawah.
- **Kontrol segmen:** track `track` radius 12 padding 4; segmen 32 tinggi, lebar ≥ 44, aktif `surface-raised` radius 8 + bayangan halus; nonaktif teks `ink-soft`. Area sentuh diperluas ke 44 lewat `hitSlop` (RN) / pseudo-elemen (web), bentuk tetap ringkas seperti Iconly. Untuk Patogen / Kimia / Mikroba dan 7h / 30h / Siklus. Chip 36 memakai cara yang sama.
- **Grafik tren (pola "Health App!" / "Dashboard App"):** garis `on-surface` 2 dengan halo abu 6 px di bawahnya, titik terpilih = pil nilai hitam (`value-pill`) + garis vertikal tipis; area di atas batas kontrol EWMA diarsir aqua 12% berlabel "sinyal tren"; garis batas kontrol `danger` putus-putus; sumbu `caption` muted.
- **Meter keyakinan:** 10 kapsul (radius penuh), isi `on-surface`, sisa `track`; persen `display-md` di kanan + "keyakinan".
- **Tabel ringkas:** baris `card-raised` radius 16, label kiri `body-sm` muted, nilai kanan `label-md`.
- **Heatmap plate 8×12:** kartu solid, sel radius 8, skala `primary-soft` → `primary` menurut Ct; sel gagal QC pola garis `danger` + ikon; sel dikeluarkan bergaris abu. Selalu dengan legenda dan ringkasan teks.
- **Diagram jejak bukti:** node lingkaran kaca 44 dengan cincin aqua sebagian, konektor garis `outline-strong` 1,5, node dapat diketuk membuka sheet.
- **Pil kelas risiko:** `risk-*`, ikon 14 + teks, tinggi 28. Di atas kaca boleh teks berwarna `risk-*-on-glass` + ikon tanpa latar.
- **Badge SIMULASI:** `badge-simulasi`, ikon `FlaskConical` 12 + "SIMULASI", selalu terlihat, tidak bisa disembunyikan.
- **Chip filter:** `chip` kaca; terpilih `chip-selected` + ikon centang.
- **Sheet / toast:** panel kaca; toast di atas nav, 3 detik, aksi "Batalkan" bila relevan.
- **Kosong / galat / offline:** pola "Empty State UI": ikon Lucide 28 di lingkaran kaca 64, judul `title`, satu kalimat, satu tombol.
- **Skeleton:** blok `track` dengan kilau halus; diam bila reduce motion.
- **Motion:** 200-260 ms, easing `cubic-bezier(0.2, 0.8, 0.2, 1)`. Satu momen khusus: kartu kolom air "mengisi" (gradasi naik dari bawah) dan angka SDRI menghitung naik sekali saat muncul (700 ms). Reduce motion: langsung tampil.

## Do's and Don'ts

**Prinsip UX (wajib, semua layar)**

| # | Prinsip | Penerapan di projek ini |
|---|---|---|
| 1 | Desain untuk sistem | Diuji dengan nama kolam panjang ("Kolam Intensif Blok C-07 Sumberejo"), data kosong, SDRI 100, copies/mL 1,6×10⁴; teks di atas kaca dicek di atas bloom terang dan kartu kolom air bagian bawah. |
| 2 | Konsisten | Satu grid (margin 20, jarak 12), satu font (Figtree), satu keluarga ikon (Lucide), satu resep kaca, satu aksen. |
| 3 | Hierarki | Monokrom untuk UI; aksen hanya FAB/tombol utama; warna lain hanya status. Angka utama tipis dan besar, judul semibold, paragraf muted. |
| 4 | Info di titik keputusan | SDRI + pil kelas di kartu kolom air paling atas; status QC di samping nama run; rentang aman tepat di bawah input kimia. |
| 5 | Konsekuensi sebelum aksi | Tombol menyebut tujuan dan jumlah ("Terbitkan ke Tambak Sumberejo", "Keluarkan well C6 dari perhitungan"); keluarkan well menampilkan perubahan SDRI sebelum disimpan. |
| 6 | Kurangi hambatan | Aksi utama di FAB dan tombol menempel di bawah; header menempel; contoh CSV siap pakai; alasan keluarkan well berupa pilihan cepat + isian bebas. |
| 7 | Hapus yang berlebihan | Tanpa label "Nama:"; badge satu kata; tanpa eyebrow di atas judul; judul tidak memuat periode yang diatur segmen. |
| 8 | Detail premium | Rim putih tipis, bayangan lebar lembut, label caps diberi tracking, satuan lebih kecil di samping angka, angka tabel `tabular-nums`. |
| 9 | Aksi utama jelas tapi tidak agresif | Satu FAB/tombol primary per layar, huruf biasa, tinggi 52; aksi lain kaca. |

**Aksesibilitas**
- Do: kontras teks ≥ 4,5:1, teks besar/UI ≥ 3:1 (dicek `lint`, termasuk di atas kaca lewat warna `glass`); fokus selalu terlihat di web; target ≥ 44; `accessibilityLabel` untuk ikon tanpa teks, FAB, dan setiap grafik ("SDRI 80, kelas Kritis, naik dari 46 minggu lalu"); hormati reduce motion dan reduce transparency.
- Don't: kelas risiko hanya lewat warna; tabel atau heatmap di atas kaca; teks putih di atas `water-bottom`; label abu muda bergaya Iconly.

**Checklist review UI**
- [ ] Hanya token file ini (lewat `src/ui/theme/tokens.ts`)
- [ ] Semua state ada (tekan, fokus, nonaktif, loading, kosong, galat)
- [ ] Web 375 / 768 / 1440 tanpa scroll horizontal; Expo Go HP kecil dan besar, aman dari notch
- [ ] Lulus Prinsip UX 1-9 dengan konten ekstrem
- [ ] Badge SIMULASI tampil di semua data simulasi
- [ ] `lint` 0 error dan tanpa warning `contrast-ratio`

## Deviations from Reference

| Aspek | Referensi (Iconly) | Di sini | Alasan |
|---|---|---|---|
| Teks/ikon nonaktif | Abu `#9E9E9E`-an di `#ECECEC` (±2,5:1) | `on-surface-muted` `#5E6168` (5,35:1) | Kontras AA; dipakai di luar ruangan |
| Font | Gellix (berbayar) | Figtree (OFL) | Lisensi; bentuk paling mirip dari 8 kandidat |
| Ikon | Iconly Pro outline + bold berpasangan | Lucide outline; aktif diisi `on-surface` | Satu keluarga ikon, tanpa dependensi berbayar (keputusan user) |
| Aksen | Berganti per aplikasi, sering bergradasi | Teal solid satu warna, tetap | Identitas AquaSeq (air) dan konsistensi (keputusan user) |
| Teks di kartu bergradasi | Putih di atas teal `#48AEBC` (±2,4:1) | Hitam di atas `water-bottom` (11,8:1) | Kontras AA |
| Warna kelas risiko | Tidak ada di referensi | Hijau/kuning tua/oranye/merah + ikon + teks | Kebutuhan PRD; warna tidak jadi satu-satunya penanda |
| Avatar | Foto orang | Inisial di lingkaran kaca | Tanpa login, tanpa foto (PRD) |
| FAB | Kadang hitam, kadang di luar bar | Di tengah bar, aqua-teal | PRD: tombol tengah = aksi utama per peran |
| Ubin pintasan | Squircle bergradien jenuh ("Delivery app") | Kaca transparan, ikon hitam | Keputusan user; satu aksen per layar |
| Navigasi desktop | Tidak ada (mobile saja) | Rail kaca kiri ≥ 1200 | Diturunkan untuk web |
| Tabel padat, heatmap, diagram jejak | Tidak ada | Kartu solid dengan resep bayangan Iconly | Kebutuhan PRD ("diturunkan") |

## Implementation

Token tidak ditulis ulang di kode. Sumber kebenaran: YAML di atas.

```bash
npx -p @google/design.md designmd lint docs/08-DESIGN.md
npx -p @google/design.md designmd export --format dtcg docs/08-DESIGN.md > src/ui/theme/tokens.dtcg.json
```

- React Native tidak memakai Tailwind, jadi format yang dipakai `dtcg`. `src/ui/theme/tokens.ts` mengimpor JSON itu dan memetakannya ke objek bertipe (`colors`, `typography`, `rounded`, `spacing`), plus konstanta yang belum didukung spec (bayangan, resep kaca, gradien, motion) yang disalin dari Elevation & Depth dan Components.
- Font: `assets/fonts/Figtree-Regular.ttf`, `-Medium`, `-SemiBold`, `-Bold` (unduh dari Google Fonts, OFL; simpan lisensinya di `assets/fonts/OFL.txt`).
- Pratinjau web: `docs/design/preview.html` memakai CSS variables dari `export --format css-tailwind` (`docs/design/theme.css`).
- Setelah token diubah: jalankan ulang `lint` dan `export`, lalu `designmd diff` terhadap versi sebelumnya.

## Changelog

| Tanggal | Perubahan |
|---|---|
| 24 Okt 2026 | v2.1 di-ACC user. 6 file desain v1 dihapus (motif pita, R1-R3, analisis R4 lama, skrip motif). |
| 24 Okt 2026 | v2.1: ubin pintasan jadi kaca transparan dengan ikon hitam (token `tile-1..4`, `on-tile` dihapus); FAB satu warna solid (token `fab-end` dihapus). Keputusan user. |
| 24 Okt 2026 | v2: desain v1 (R1-R4, pita biru, Outfit) dibuang total. Dibangun ulang dari 378 shot Iconly Pro: kaca terang, kanvas abu + bloom pastel, UI monokrom, aksen aqua-teal gradasi (keputusan user), font Figtree, ikon Lucide (keputusan user), kartu kolom air sebagai signature. |
