---
version: alpha
name: "AquaSeq"
description: "Tenang, presisi, padat data untuk aplikasi; air dalam yang jernih dan meyakinkan untuk landing"
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
  landing-deep: "#06131F"
  landing-deep-raised: "#0D2234"
  landing-on-deep: "#EAF2FA"
  landing-on-deep-muted: "#9DB3C8"
  landing-line-deep: "#1E3448"
  landing-accent: "#5CB8FF"
  landing-on-accent: "#04121E"
  landing-paper: "#F3F6F5"
  landing-ink: "#0C1620"
  landing-ink-muted: "#4B5863"
  landing-line: "#D6DEDB"
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
    fontFamily: Bricolage Grotesque
    fontSize: 88px
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: -0.035em
  landing-display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.03em
  landing-title:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.015em
  landing-body:
    fontFamily: Onest
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  landing-body-sm:
    fontFamily: Onest
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
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
  landing-section-y: 128px
  landing-section-y-mobile: 80px
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
  landing-hero:
    backgroundColor: "{colors.landing-deep}"
    textColor: "{colors.landing-on-deep}"
    typography: "{typography.landing-display-xl}"
  landing-hero-sub:
    backgroundColor: "{colors.landing-deep}"
    textColor: "{colors.landing-on-deep-muted}"
    typography: "{typography.landing-body}"
  landing-deep-card:
    backgroundColor: "{colors.landing-deep-raised}"
    textColor: "{colors.landing-on-deep}"
    rounded: "{rounded.xl}"
  landing-deep-card-muted:
    backgroundColor: "{colors.landing-deep-raised}"
    textColor: "{colors.landing-on-deep-muted}"
    typography: "{typography.landing-body-sm}"
  landing-deep-line:
    backgroundColor: "{colors.landing-line-deep}"
    textColor: "{colors.landing-on-deep}"
  landing-accent-on-deep:
    backgroundColor: "{colors.landing-deep}"
    textColor: "{colors.landing-accent}"
    typography: "{typography.landing-title}"
  landing-cta:
    backgroundColor: "{colors.landing-accent}"
    textColor: "{colors.landing-on-accent}"
    typography: "{typography.landing-body-sm}"
    rounded: "{rounded.full}"
    height: 52px
  landing-cta-secondary:
    backgroundColor: "{colors.landing-on-deep}"
    textColor: "{colors.landing-deep}"
    typography: "{typography.landing-body-sm}"
    rounded: "{rounded.full}"
    height: 52px
  landing-paper-section:
    backgroundColor: "{colors.landing-paper}"
    textColor: "{colors.landing-ink}"
    typography: "{typography.landing-display-lg}"
  landing-paper-body:
    backgroundColor: "{colors.landing-paper}"
    textColor: "{colors.landing-ink-muted}"
    typography: "{typography.landing-body}"
  landing-paper-line:
    backgroundColor: "{colors.landing-line}"
    textColor: "{colors.landing-ink}"
  landing-paper-cta:
    backgroundColor: "{colors.landing-ink}"
    textColor: "{colors.landing-paper}"
    typography: "{typography.landing-body-sm}"
    rounded: "{rounded.full}"
    height: 52px
---

# AquaSeq — Design System

> Sumber kebenaran untuk semua kerja UI. Format: [Google DESIGN.md spec](https://github.com/google-labs-code/design.md) (alpha). Token di YAML di atas adalah nilai resmi; jangan pakai warna, ukuran, radius, atau shadow di luar token.
> Status: ✅ ACC 24 Okt 2026 · Kemiripan referensi: belum diukur (tanpa preview) · Lint: 0 error, 0 warning
> Template: Soft Op Dashboard (asal K-DASP) untuk Area Aplikasi, warna merek: biru AquaSeq (dipilih AI dari domain air, selaras dengan mockup mobile tim). Area Landing: arah dipilih AI (impeccable mode Persuade), tanpa situs inspirasi dari user.

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
- **Font:** Onest untuk semua teks, JetBrains Mono hanya untuk ID, kode sampel, posisi well, dan rumus. Landing menambah Bricolage Grotesque khusus judul display.
- **Ikon:** Lucide, stroke 1.75, satu gaya.
- **Mode:** Aplikasi light. Landing berselang-seling deep (gelap) dan paper (terang); token deep tetap berawalan `landing-` karena itu area, bukan tema alternatif.
- **Kejujuran data:** setiap angka contoh berlabel "Data simulasi". Skor dari backend ditulis "peluang wabah (model V1-GSI)" dan versi model selalu bisa dilihat; tidak ada klaim akurasi.
- **Dihindari:** gradien ungu-biru bawaan AI, glassmorphism dekoratif, emoji, em-dash di teks UI, warna merek untuk menyatakan bahaya.

### Area Aplikasi
Tenang, lembut, padat data. Untuk pemilik tambak yang membuka dasbor tiap pagi di laptop, dan teknisi yang membuka tugas di HP di pematang kolam saat terik. Kanvas abu terang, panel abu berisi kartu putih membulat besar, navigasi pill, satu warna merek sebagai aksen, satu kartu sorotan navy per layar untuk kolam paling berisiko. Kedalaman dari lapisan warna, bukan bayangan. Mode light dipilih karena teknisi membaca di bawah matahari.

### Area Landing
"Air dalam yang jernih." Pengunjung adalah calon pemilik tambak dan juri: mereka perlu yakin dalam 10 detik bahwa AquaSeq mengubah angka lab jadi tindakan, lalu cukup jujur soal batasnya. Hero gelap seperti kolom air dalam dengan satu alat yang bisa dicoba (kalkulator kolom air). Section berselang-seling deep dan paper supaya ritmenya berganti padat-lega. Satu ide visual khas: **kolom air**, batang vertikal berlapis (S_qPCR, S_Bio, S_Chem) yang terisi sesuai subskor dari backend.

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
- **Deep (#06131F) / Deep-raised (#0D2234) / Line-deep (#1E3448):** latar section gelap / kartu di atasnya / garis.
- **On-deep (#EAF2FA) / On-deep-muted (#9DB3C8):** teks di section gelap.
- **Accent (#5CB8FF) + On-accent (#04121E):** CTA utama di section gelap, isian kolom air, angka hasil kalkulator. Biru terang yang sama dengan mockup mobile tim.
- **Paper (#F3F6F5) / Ink (#0C1620) / Ink-muted (#4B5863) / Line (#D6DEDB):** section terang.
- Skala `risk-*` dipakai juga di kalkulator hero (di atas kartu `landing-on-deep` sebagai chip terang supaya kontrasnya tetap AA).

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
| `landing-display-xl` | `clamp(44px, 7vw, 88px)` / 0.98, Bricolage Grotesque 700, -0.035em | judul hero saja |
| `landing-display-lg` | `clamp(34px, 4.6vw, 56px)` / 1.04 | judul section |
| `landing-title` | 28/1.2 600 | judul kartu, langkah cara kerja |
| `landing-body` | 18/1.6 | paragraf (maks 62ch) |
| `landing-body-sm` | 15/1.55 | caption, FAQ jawaban, tombol |

Rumus di section Metode memakai JetBrains Mono (rumus adalah kode, bukan kostum). Tanpa eyebrow label di atas judul.

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
- Konten maks 1200px, gutter `landing-gutter` 24px (16px mobile); paragraf maks 62ch.
- Ritme section: padding vertikal `landing-section-y` 128px desktop, `landing-section-y-mobile` 80px; section padat diikuti section lega.
- **Urutan section dan pola:**

| # | Section | Latar | Pola | Isi |
|---|---|---|---|---|
| 1 | Hero | deep | Kiri 6 kolom: judul `landing-display-xl` "Hasil lab masuk. Kolam mana yang ditangani hari ini?" + satu paragraf + CTA "Coba demo" (accent) + "Masuk" (secondary). Kanan 6 kolom: **kalkulator kolom air** di kartu `landing-deep-raised`: kolom air vertikal (3 lapis: S_qPCR, S_Bio, S_Chem) + 3 slider (Ct pirAB, TAN mg/L, DO mg/L) + peluang besar + chip kelas + rekomendasi + label "Data simulasi". Hasil dari `sdri/preview`; bila backend mati, slider berganti jadi pilihan 5 contoh tersimpan. Mobile: judul dulu, kalkulator di bawah | `min-h-[100dvh]` |
| 2 | Masalah | paper | Satu kalimat besar `landing-display-lg` di kiri + tiga baris masalah bernomor tidak (baris berpemisah garis, kalimat pengguna dalam tanda kutip) | Angka Ct tidak terbaca; "tidak terdeteksi" dikira aman; perintah ke teknisi hilang di chat |
| 3 | Cara kerja | deep | Pipeline horizontal 3 node dihubungkan garis `landing-line-deep` (mengulang pola pipeline aplikasi); mobile vertikal | Unggah hasil lab → skor + alasan per kolam → tugas ke teknisi sampai dilaporkan |
| 4 | Kemampuan | paper | Asimetris: satu blok besar 7 kolom "Skor bisa dirinci sampai well" dengan cuplikan rantai rincian; 5 kolom berisi 4 baris pendek (sampel terhambat ditolak, tanda tren, tugas + foto, peringatan WA) | Hasil, bukan nama fitur |
| 5 | Metode & batasan | deep | Kiri: rumus logit V1-GSI dalam `mono` di kartu raised; kanan: 3 batasan jujur (koefisien awal GSI, dikalibrasi ulang dari data hasil siklus, bukan diagnosis resmi) + link "Baca metode" | Untuk juri |
| 6 | FAQ | paper | Akordeon `<details>` satu kolom maks 760px | 4-6 pertanyaan |
| 7 | CTA penutup | deep | Judul pendek + dua kartu akun demo (Pemilik, Teknisi) yang masing-masing tombol | "Coba sebagai pemilik" / "Coba sebagai teknisi" |

- **Navbar:** transparan di atas hero, jadi `landing-deep` 92% + garis bawah setelah scroll 24px; kiri logo, tengah tautan anchor, kanan "Masuk" + CTA. Mobile: burger + drawer kanan.
- **Footer:** deep, 3 kolom (AquaSeq + kalimat, tautan, kontak) + baris "Data di situs ini adalah simulasi".

## Elevation & Depth

### Area Aplikasi
Kedalaman dari lapisan warna (canvas → panel → kartu), bukan bayangan. Satu-satunya bayangan: dialog `0 24px 48px -12px rgba(20,20,20,.25)` dan drawer.

### Area Landing
Kartu raised di atas deep tanpa bayangan, dibedakan warna + garis `landing-line-deep`. Kalkulator hero boleh satu cahaya lembut biru di belakang kolom air (efek khas satu-satunya di halaman).

## Shapes

### Bersama
- **Radius:** `sm` 10px chip kecil/sel heatmap · `md` 16px input, kartu akun · `lg` 24px kartu & panel · `xl` 32px kartu landing · `full` tombol, badge, pill.
- **Ikon:** Lucide, outline, stroke 1.75, 19px di navigasi, 16px inline, 20px di tombol bulat 44px. Tanpa emoji.
- **Logo:** belum ada; sementara simbol tetes air bergaris + wordmark "AquaSeq" Onest 600 (konsep logo bisa dibuat lewat `logo-design`).
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
- **Tombol (gaya rekomendasi AI):** `pill-link` 52px, panah geser 3px saat hover, tekan `scale-[0.97]`, ring fokus. CTA utama `landing-cta` (accent) maks satu per section; secondary `landing-cta-secondary`; di paper `landing-paper-cta`.
- **Kalkulator kolom air:** slider native `<input type="range">` bergaya token (track `landing-line-deep`, thumb `landing-accent` 24px), label dan nilai terbaca screen reader (`aria-valuetext` "Ct pirAB 31,5"); hasil dari backend `sdri/preview` lewat `/api/kalkulator` (debounce 250ms); perubahan kelas diumumkan lewat `aria-live="polite"`.
- **Kolom air:** 4 lapis vertikal, tinggi tiap lapis = kontribusi komponen; isian `landing-accent` dengan opasitas bertingkat; transisi `scaleY` 400ms.
- **Baris berpanah** (`action-row` dari skill): hanya pada baris yang benar-benar link.
- **Token gerak** (`src/lib/motion.ts`):
  - Lenis: `lerp 0.1`, `anchors: true`; tidak diinisialisasi saat reduced-motion.
  - Hero: `text-effect` fade per kata sekali, 600ms total (satu-satunya efek teks di halaman); kolom air terisi dari 0 saat pertama tampil.
  - Section: `in-view` naik 24px + opacity, 500ms ease-out, stagger anak 80ms; hanya judul dan blok utama, bukan setiap elemen.
  - Angka peluang kalkulator: `animated-number` 400ms.
  - Reduced-motion: semua animasi scroll mati, konten langsung tampil; transisi warna tetap.

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
- Hero generik (judul tengah + dua tombol + gradien + mockup miring). Hero AquaSeq = kalkulator kolom air yang bisa dicoba.
- Grid fitur 3 kolom ikon-dalam-lingkaran. Kemampuan memakai blok asimetris.
- Eyebrow label di atas judul.
- Gradient text, blob blur, glow di mana-mana (hanya satu cahaya di kolom air).
- Animasi di semua elemen; lebih dari satu efek teks.
- Testimoni atau logo klien karangan. Belum ada pengguna nyata, jadi section testimoni tidak dibuat.
- Kata klise dan em-dash.
- Ritme section seragam.

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
| Font | Onest saja | Landing menambah Bricolage Grotesque untuk display | Landing butuh suara sendiri (mode Persuade); aplikasi tetap Onest |

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
