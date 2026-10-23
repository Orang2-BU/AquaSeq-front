# AquaSeq (Frontend)

> Instruksi untuk semua AI coding assistant. Onboarding terakhir: 23 Okt 2026.
> Sumber kebenaran ada di `docs/`. File ini ringkasannya.

## WAJIB sebelum ngoding pertama kali
Jika kamu AI yang belum pernah bekerja di projek ini, baca **seluruh** file di `docs/` (01 sampai 08, yang ada, ditambah `sdri-v1.md` dan `glass-surface-port.md`) secara berurutan satu kali, lalu ikuti aturannya. Setelah itu cukup rujuk file ini.

## Aplikasi
AquaSeq mengubah hasil lab air tambak udang (qPCR panel patogen, profil Nanopore 16S, kimia air) menjadi **SDRI** (Shrimp Disease Risk Index 0-100) dengan kelas Aman/Pantau/Waspada/Kritis, rekomendasi tindakan, jejak bukti, keyakinan hasil negatif, dan tren EWMA. Pengguna: analis lab dan manajer tambak; petambak menerima ringkasan WhatsApp. Di luar scope: backend/login/WA asli, probabilitas wabah %, target RNA, IoT, sertifikat.

## Stack & Perintah Verifikasi
- **Stack:** Expo SDK 58 + React Native + TypeScript strict, Expo Router, TanStack Query + Zustand, react-native-svg, expo-blur/expo-glass-effect/expo-linear-gradient, papaparse, lucide-react-native, jest-expo.
- **Test:** `npm test` · **Build:** `npx expo export -p web` · **Typecheck:** `npx tsc --noEmit` · **Lint:** `npx expo lint` · **Dead code:** `npx knip` · **Uji emas:** `python scripts/sdri_v1_check.py`

## Aturan Wajib (ringkas — lengkapnya di docs/07-RULES.md)
- Tuntaskan setiap permintaan sesuai aturan projek.
- Setiap perubahan kode: jalankan test, build, typecheck, lint, cek dead code, dan cek fungsi terkait.
- Error → cari akar penyebab, perbaiki, ulangi semua pemeriksaan sampai hijau.
- Dilarang skip pemeriksaan, melemahkan test, mengubah angka uji emas tanpa keputusan tim, atau klaim selesai tanpa bukti.
- Dilarang menyajikan data simulasi sebagai nyata atau menghapus badge SIMULASI.
- Pemeriksaan yang tidak bisa dijalankan → jelaskan dengan jujur.
- Projek harus bersih dari dead code.
- Solusi paling sederhana yang benar (YAGNI, bawaan RN/Expo dulu, dependensi baru harus izin). Pakai skill `ponytail` jika tersedia.
- Kerja UI: ikuti docs/08-DESIGN.md + checklist UI/UX (kontras AA termasuk di atas kaca, aksesibilitas, semua state). Pakai skill `impeccable` jika tersedia.
- Output perintah panjang lewat `rtk` jika terpasang; jangan menebak dari output terpotong.
- Selesai kerja → laporkan perubahan, pemeriksaan, dan hasilnya.

## Aturan Main (ringkas — lengkapnya di docs/06-WORKFLOW.md)
- **Otonomi:** Seimbang (satu task sampai hijau, commit lokal, lalu lapor).
- **Wajib minta izin:** dependensi baru, ubah rumus/parameter SDRI, ubah stack/arsitektur/PRD, push, deploy, tulis ulang riwayat git, ubah klaim ilmiah/label SIMULASI.
- **Selesai =** kriteria di 03 terpenuhi + semua cek hijau + ada test + 04-TODO diupdate + laporan.

## Konvensi (ringkas — lengkapnya di docs/02-AGENT.md)
- Kode Inggris; komentar dan UI Bahasa Indonesia; istilah domain apa adanya.
- `src/engine` TS murni; angka ke pengguna = `{ value, trace }`; ambang hanya di `src/engine/params/sdri-v1.ts`.
- `app/` rute tipis; logika di `src/features`; UI umum di `src/ui`; hanya token desain.
- Entitas punya `provenance`; data simulasi selalu berbadge SIMULASI.
- Tes di `src/**/__tests__`; tes emas 5 arketipe GSI wajib cocok dengan skrip Python.
- Commit Conventional Commits Bahasa Indonesia atas akun `krizzn65 <krisnadewa6565@gmail.com>`, tanpa trailer AI; repo `Orang2-BU/AquaSeq-front`.

## Kapan baca docs
- Mulai task baru → bagian terkait di `docs/03-ARCHITECTURE.md`
- Status task berubah → update `docs/04-TODO.md` (wajib)
- Task engine/skor → `docs/sdri-v1.md`
- Komponen kaca → `docs/glass-surface-port.md`
- Pola testing/review/refactor → `docs/05-SKILL.md`
- Ragu scope → `docs/01-PRD.md`
- Membuat/mengubah halaman → bagian "Peta Halaman" di `docs/01-PRD.md` + `docs/08-DESIGN.md`
- Konflik aturan → prioritas: 07-RULES > instruksi user > 01-PRD > sdri-v1 (rumus) > 08-DESIGN (UI) > 06-WORKFLOW > 03-ARCHITECTURE > 02-AGENT
