# 02 — AGENT: Instruksi untuk AI

> Konvensi yang harus diikuti AI (dan developer manusia) di projek ini.
> Uji kualitas: developer lain harus bisa memahami isi file ini tanpa penjelasan tambahan.

## 1. Konteks Singkat

- **Aplikasi:** AquaSeq: software interpretasi hasil lab air tambak udang (qPCR + Nanopore + kimia air) menjadi skor SDRI, kelas risiko, dan rekomendasi tindakan.
- **Stack:** Expo SDK 58 + React Native + TypeScript strict, Expo Router, TanStack Query + Zustand, react-native-svg, expo-blur/expo-glass-effect/expo-linear-gradient, jest-expo. Frontend saja, data lewat Repository mock.
- **Dokumen acuan:** PRD `docs/01-PRD.md`, arsitektur `docs/03-ARCHITECTURE.md`, rumus `docs/sdri-v1.md`, kaca `docs/glass-surface-port.md`, desain `docs/08-DESIGN.md`.

## 2. Struktur Folder

```
app/                 # rute Expo Router saja: tipis, memanggil komponen dari src/features
src/engine/          # mesin SDRI murni TS (parse, qc, convert, sdri, confidence, ewma, trace); TANPA React/Expo
src/engine/params/   # semua ambang/bobot berversi (sdri-v1.ts) — satu-satunya tempat angka kalibrasi
src/data/            # tipe, Repository, MockRepository, seed SIMULASI, hook TanStack Query
src/features/<fitur>/# layar & komponen per fitur (run-upload, qc, chemistry, nanopore, sample, report, ponds, alerts)
src/ui/              # UI umum: glass/, charts/, primitives/, nav/, theme/
src/store/           # Zustand (state UI)
scripts/             # skrip Python acuan (sdri_v1_check.py dll.) — nilai uji emas
docs/                # dokumen projek
```

- **Rute halaman:** mengikuti tabel "Peta Halaman" di 01-PRD §5b (rute, peran). File rute pakai nama rute (`app/lab/run/[runId]/index.tsx`), parameter dinamis `[camelCase]`. Layout per peran di `app/lab/_layout.tsx` dan `app/tambak/_layout.tsx`.

## 3. Gaya Koding

- **Bahasa:** nama variabel, fungsi, tipe, dan file dalam **Inggris**. Istilah domain dipertahankan apa adanya: `pirA`, `vp28`, `swp1`, `amoA`, `sdri`, `ppc`, `ntc`, `ewma`, `copiesMl`.
- **Penamaan:** variabel/fungsi `camelCase`, komponen dan tipe `PascalCase`, file komponen `PascalCase.tsx`, file non-komponen `kebab-case.ts`, konstanta `UPPER_SNAKE_CASE`, hook `useXxx`.
- **Prinsip:** fungsi kecil dan satu tanggung jawab; solusi paling sederhana yang benar; pakai bawaan RN/Expo sebelum menambah dependensi. Jangan membuat abstraksi untuk satu pemakaian.
- **Mesin SDRI:** fungsi murni, deterministik, tanpa efek samping. Setiap fungsi yang menghasilkan angka untuk pengguna mengembalikan `{ value, trace }`. Angka ambang **tidak boleh** ditulis langsung di logika; ambil dari `params/sdri-v1.ts`.
- **Typing:** `strict: true`, tanpa `any` (pakai `unknown` lalu persempit). Union literal untuk status/kelas (`'Aman' | 'Pantau' | 'Waspada' | 'Kritis'`). Data dari luar (CSV, AsyncStorage) divalidasi di batas sebelum dipakai.
- **Error handling:** parser mengembalikan `{ ok: true, data } | { ok: false, errors: { row, message }[] }`, bukan melempar. Galat tak terduga ditangkap error boundary per rute dengan pesan Bahasa Indonesia + tombol coba lagi. Jangan menelan galat diam-diam.
- **Angka:** simpan nilai mentah; pembulatan hanya saat ditampilkan (`formatNumber`, format Indonesia: koma desimal).
- **Formatter / linter:** Prettier + ESLint (`expo lint`). Config di repo adalah sumber kebenaran.

## 4. Gaya Komentar

- Komentar menjelaskan **kenapa**, bukan **apa**.
- Bahasa komentar: **Indonesia**.
- Fungsi publik di `src/engine` diberi JSDoc singkat: apa yang dihitung, satuan, dan rujukan bagian `sdri-v1.md` (mis. `// sdri-v1 §5.1`). Sumber ilmiah cukup dirujuk ke dokumen, tidak disalin.
- Tidak ada kode yang di-comment-out; hapus saja (ada git).

## 5. Testing

- **Framework:** jest-expo + @testing-library/react-native.
- **Lokasi & penamaan:** `src/**/__tests__/*.test.ts(x)`.
- **Format:** Arrange–Act–Assert; satu perilaku per tes; nama tes mendeskripsikan perilaku dalam Bahasa Indonesia (`'menolak sampel bila Ct PPC > 22'`).
- **Wajib dites:** seluruh `src/engine` (target cakupan ≥ 90%), parser CSV, Repository mock. **Tes emas** 5 arketipe GSI di `src/engine/__tests__/golden.test.ts` harus sama dengan keluaran `scripts/sdri_v1_check.py` (selisih ≤ 0,1). Bug yang pernah terjadi wajib dapat tes regresi.
- UI cukup dites untuk alur kritis (unggah → hasil SDRI) dan aksesibilitas label.

## 6. Dependency

- Package manager: **npm**. Paket Expo dipasang dengan `npx expo install <paket>` agar versinya cocok dengan SDK.
- Tambah dependensi hanya jika jelas lebih sederhana dari menulis sendiri; sebutkan alasannya di laporan.
- Library UI lain (MUI, NativeBase, Tamagui, dll.) butuh izin user.

## 7. Git

- **Repo:** `https://github.com/Orang2-BU/AquaSeq-front.git` (remote `origin`).
- **Identitas:** commit dan push **atas akun user** (`krizzn65` / `krisnadewa6565@gmail.com`). **Jangan** menambahkan trailer `Co-Authored-By` AI atau atribusi AI lain di commit/PR.
- **Format commit:** Conventional Commits, pesan Bahasa Indonesia. Contoh: `feat(engine): hitung S_Patho dari copies/mL`, `fix(qc): tolak run bila efisiensi di luar 90-110%`, `docs: tambah 03-ARCHITECTURE`.
- **Kapan commit/push:** hanya setelah user setuju (lihat 06-WORKFLOW).
- **Branch:** `main` + branch fitur pendek `feat/<id-task>-<ringkas>` bila perlu; merge setelah `npm run verify` hijau.
- **Jejak hackathon:** aturan GENOHACK mewajibkan pembedaan "sudah ada sebelum" vs "dibuat selama" hackathon. Commit pertama kode dibuat setelah kickoff 23 Okt 2026; jangan menulis ulang riwayat (force push/rebase) di `main`.

## 8. Lain-lain

- **Bahasa UI:** Bahasa Indonesia. Tanpa em-dash/en-dash sebagai pemisah di teks UI; rentang pakai `-`.
- **Kejujuran data:** setiap data dengan `provenance: 'simulasi'` wajib menampilkan badge SIMULASI. Jangan pernah menyajikan data simulasi sebagai hasil lab nyata. UI tidak menampilkan "probabilitas wabah %".
- **Klaim:** posisi decision support. Teks UI tidak boleh menyatakan diagnosis resmi atau "bebas penyakit". Hindari klaim lead time (mis. "terdeteksi 3-7 hari sebelum gejala").
- **LLM:** bila dipakai, hanya menyusun kalimat penjelasan dari hasil engine; tidak pernah menghasilkan angka.
- **Aksesibilitas:** kontras teks WCAG AA (juga di atas kaca), area sentuh ≥ 44 pt, setiap grafik punya ringkasan teks (`accessibilityLabel`), kelas risiko selalu warna + ikon + label, dukung reduce motion/reduce transparency.
- **Desain:** semua warna/ukuran dari token `src/ui/theme/tokens.ts` (turunan 08-DESIGN); tanpa nilai hex lepas di komponen. Satu efek berat (kaca refraksi/animasi) per layar.
- **Keamanan:** tidak ada rahasia/API key di repo. Input CSV diperlakukan sebagai data tak tepercaya (batasi ukuran, validasi kolom).
