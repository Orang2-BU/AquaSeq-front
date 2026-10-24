# 02 — AGENT: Instruksi untuk AI

> Konvensi yang harus diikuti AI (dan developer manusia) di projek ini.
> Uji kualitas: developer lain harus bisa memahami isi file ini tanpa penjelasan tambahan.

## 1. Konteks Singkat
- **Aplikasi:** AquaSeq Web. Landing publik + aplikasi berlogin tempat pemilik tambak mengunggah hasil qPCR, membaca skor risiko per kolam dari backend, dan memberi tugas ke teknisi yang melapor dari HP.
- **Stack:** Next.js 16 App Router + TypeScript strict sebagai frontend + BFF tipis di atas backend Go tim (`docs/09-API-KONTRAK.md`). Tailwind v4 (token 08-DESIGN), Zod, Vitest. Area aplikasi memakai starter template Soft Op; landing memakai Lenis + Motion Primitives.

## 2. Struktur Folder
Tree lengkap: `docs/03-ARCHITECTURE.md` §4 "Struktur folder". Ringkasnya:
```
src/app/(marketing)   landing + halaman publik (Area Landing)
src/app/(auth)        masuk, daftar, undangan (SoloFrame)
src/app/(app)         aplikasi pemilik + teknisi (AppShell Soft Op)
src/app/api           kalkulator (publik) + proxy foto
src/lib/api           klien backend: schemas.ts (Zod), live/, mock/, errors.ts
src/lib/auth          cookie sesi, refresh, getSession()
src/lib/csv           parser CSV qPCR + ringkasan Ct per sampel
src/lib/risk.ts       pemetaan kelas backend → label + token warna
src/components        shell/ solo/ ui/ (starter) · app/ · marketing/sections/ · motion/
src/content           teks landing
```
- **Rute halaman:** mengikuti 01-PRD §5a. Nama folder rute Bahasa Indonesia, kebab-case (`/catat-air`, `/lab/unggah`). Setiap rute baru wajib terdaftar di `src/lib/nav.ts` dengan ID PRD (`P15`).
- **Server Actions** di `actions.ts` di samping `page.tsx` yang memakainya.

## 3. Gaya Koding
- **Penamaan:** variabel/fungsi camelCase, komponen PascalCase, file kebab-case, konstanta UPPER_SNAKE. Field dari backend tetap snake_case di skema Zod (`probability_pct`) dan tidak diubah namanya di sepanjang aplikasi. Teks UI Bahasa Indonesia.
- **Prinsip:** fungsi kecil satu tanggung jawab; solusi paling sederhana yang benar; fitur bawaan Next/React sebelum dependency baru.
- **Panggilan backend hanya dari server**, lewat `src/lib/api`. Komponen klien tidak pernah `fetch` ke backend dan tidak pernah memegang token. Modul `src/lib/api` dan `src/lib/auth` diberi `import 'server-only'`.
- **Respons backend selalu di-parse Zod** (`schema.parse`), tidak di-cast (`as`). Skema hanya ditulis sekali di `schemas.ts`, mengikuti 09-API-KONTRAK.
- **Web tidak menghitung skor.** Peluang, kelas, rekomendasi, NH₃, dan kopi/mL ditampilkan dari respons backend. Satu-satunya olahan angka di web: ringkasan Ct per sampel dari CSV (rata-rata replikat) sebelum dikirim.
- **Kelas risiko** selalu lewat `src/lib/risk.ts` (label + token); tidak ada `if (risk_class === 3)` di komponen.
- **Mock dan live** mengimplementasikan antarmuka yang sama; halaman tidak tahu mode mana yang aktif.
- **Server vs klien:** Server Component bawaan; `'use client'` hanya untuk interaksi (slider, form dengan state, dialog, kompres foto).
- **Typing:** `strict: true`, tanpa `any`, tanpa non-null assertion `!` kecuali dengan komentar alasan.
- **Error handling:** Server Action mengembalikan `{ ok: true, data } | { ok: false, error: string, fieldErrors? }`; `VALIDATION_ERROR.fields` dari backend dipetakan ke field form; 401/403 ditangani terpusat di `src/lib/api/errors.ts`. Pesan galat Bahasa Indonesia. Tidak ada `catch` kosong.
- **Formatter / linter:** Prettier + ESLint (config Next). Config di repo adalah sumber kebenaran.

## 4. Gaya Komentar
- Komentar menjelaskan **kenapa**, bukan **apa**. Perilaku yang mengikuti kontrak dirujuk dengan bagiannya (`// 09-API-KONTRAK §9: 403, bukan 404`).
- Bahasa komentar: Indonesia.
- JSDoc singkat untuk fungsi publik di `src/lib/api`, `src/lib/csv`, `src/lib/auth`.
- Tidak ada kode yang di-comment-out; hapus saja (ada git).

## 5. Testing
- **Framework:** Vitest.
- **Lokasi & penamaan:** `__tests__/*.test.ts` di samping modul (`src/lib/csv/__tests__/`).
- **Format:** Arrange-Act-Assert; satu perilaku per tes; nama tes menjelaskan perilaku ("menandai baris tanpa kolom Ct sebagai galat").
- **Wajib ditest:** parser CSV + ringkasan Ct, skema Zod terhadap contoh di 09-API-KONTRAK (tes kontrak), pemetaan galat backend → form, `src/lib/risk.ts`, refresh sesi, bug yang pernah terjadi.
- Komponen UI tidak wajib unit test; diverifikasi di browser (07-RULES §8).

## 6. Dependency
- Tambah dependency hanya jika jelas lebih sederhana dari menulis sendiri; minta izin dan sebutkan alasan.
- Package manager: npm.
- Dependency runtime yang disetujui: `next`, `react`, `zod`, `lucide-react`, `lenis`, `motion`.

## 7. Git
- **Format commit:** Conventional Commits berbahasa Indonesia (`feat(kolam): detail kolam dan riwayat peluang`).
- **Branch:** `main`; fitur besar di `feat/<nama>`.
- Commit hanya bila user setuju. Push memakai akun user (krizzn65).

## 8. Lain-lain
- Bahasa UI: Indonesia; angka format Indonesia lewat `Intl.NumberFormat('id-ID')` (peluang 1 desimal: `34,8%`); waktu WIB.
- Data `provenance = simulasi` selalu tampil dengan badge "Data simulasi".
- Versi model (`model_version`) tampil di setiap tampilan skor yang rinci.
- Perubahan kebutuhan API ditulis dulu di `docs/09-API-KONTRAK.md`, baru diimplementasikan di mock/live.
- Aksesibilitas, responsif, dan token: `docs/08-DESIGN.md` + 07-RULES §8.
