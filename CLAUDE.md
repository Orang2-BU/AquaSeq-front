# AquaSeq (Frontend)

> Dibuat oleh skill project-setup saat onboarding (23 Okt 2026). File ini dimuat otomatis setiap sesi,
> jadi tidak perlu membaca ulang docs/ kecuali dibutuhkan (lihat bagian "Kapan baca docs").

## Aplikasi Ini
AquaSeq adalah software interpretasi hasil lab air tambak udang vaname untuk GENOHACK 2026 (Track 2). Masukannya qPCR (`pirA`, `vp28`, `swp1`, `amoA`, `16S`, PPC), profil Nanopore 16S, dan kimia air. Keluarannya **SDRI** (Shrimp Disease Risk Index, 0-100) dengan kelas Aman/Pantau/Waspada/Kritis, rekomendasi tindakan, jejak bukti sampai ke well, meter keyakinan hasil negatif, dan tren EWMA. Pengguna: analis lab (utama) dan manajer tambak; petambak menerima ringkasan WhatsApp. Di luar scope: backend/login/WA asli, probabilitas wabah %, target RNA, IoT, sertifikat. Rumus dikunci di `docs/sdri-v1.md`.

## Stack & Perintah
- **Stack:** Expo SDK 58 + React Native + TypeScript strict, Expo Router, TanStack Query + Zustand, react-native-svg, expo-blur + expo-glass-effect + expo-linear-gradient (GlassSurface), papaparse, lucide-react-native, jest-expo. Frontend saja; data lewat Repository mock (AsyncStorage).
- **Test:** `npm test` · **Build:** `npx expo export -p web` · **Typecheck:** `npx tsc --noEmit` · **Lint:** `npx expo lint` · **Dead code:** `npx knip` · **Uji emas:** `python scripts/sdri_v1_check.py`

## Konvensi Singkat (dari docs/02-AGENT.md)
- Kode/nama Inggris; komentar dan teks UI Bahasa Indonesia; istilah domain apa adanya (`pirA`, `sdri`, `copiesMl`).
- `src/engine` = TS murni tanpa React; setiap angka untuk pengguna mengembalikan `{ value, trace }`; ambang hanya di `src/engine/params/sdri-v1.ts`.
- `app/` rute tipis; logika di `src/features/<fitur>`; UI umum di `src/ui`; warna/ukuran hanya dari token.
- Setiap entitas punya `provenance`; data `simulasi` wajib badge SIMULASI. Tidak ada "probabilitas wabah %" dan tidak ada klaim diagnosis/lead time.
- Parser mengembalikan `{ ok, data | errors[{row, message}] }`, tidak melempar.
- Tes di `src/**/__tests__`, nama tes Bahasa Indonesia; tes emas 5 arketipe GSI wajib sama dengan skrip Python (selisih ≤ 0,1).
- Commit Conventional Commits Bahasa Indonesia, atas akun `krizzn65 <krisnadewa6565@gmail.com>`, **tanpa trailer Co-Authored-By AI**. Repo: `https://github.com/Orang2-BU/AquaSeq-front.git`. Push hanya setelah user setuju.
- Paket Expo dipasang dengan `npx expo install`; dependensi baru wajib izin.

## Aturan Wajib
@docs/07-RULES.md

## Aturan Main
@docs/06-WORKFLOW.md

## Kapan baca docs
- Mulai task baru → bagian task terkait di `docs/03-ARCHITECTURE.md`
- Status task berubah → update `docs/04-TODO.md` (wajib)
- Task engine/skor → `docs/sdri-v1.md` (audit GSI: `docs/sdri-audit-gsi.md`)
- Komponen kaca → `docs/glass-surface-port.md`
- Butuh pola testing/review/refactor → `docs/05-SKILL.md`
- Ragu soal scope fitur → `docs/01-PRD.md`
- Membuat/mengubah halaman → bagian "Peta Halaman" di `docs/01-PRD.md` + `docs/08-DESIGN.md`
- Detail konvensi koding → `docs/02-AGENT.md`
- Konteks lomba & riset → `riset-lomba-genohack-2026.md`
