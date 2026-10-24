# AquaSeq Web

> Dibuat oleh skill setup-project-00 (24 Okt 2026). File ini dimuat otomatis setiap sesi,
> jadi tidak perlu membaca ulang docs/ kecuali dibutuhkan (lihat bagian "Kapan baca docs").

## Aplikasi Ini

Web AquaSeq: landing publik + aplikasi berlogin untuk tambak udang vaname, di atas backend Go tim (`Orang2-BU/AquaSeq-back`). Pemilik tambak (bisa beberapa lokasi) mengunggah CSV hasil qPCR; web menampilkan pratinjau QC lalu mengirim ringkasan ke backend, yang menghitung peluang wabah dan kelas risiko (model V1-GSI). Web menampilkan dasbor, peringatan, rincian skor sampai well, dan alur tugas: pemilik memberi tugas, teknisi mencatat kimia air dan melapor dengan foto dari HP. Di luar scope: backend, aplikasi mobile, bisnis/harga, LLM, menghitung skor di web. Ide asli user: `docs/00-BRIEF.md`.

## Stack & Perintah

- **Stack:** Next.js 16 App Router + TS strict (frontend + BFF tipis), backend Go tim via `src/lib/api` (mode `mock`/`live`), JWT di cookie httpOnly, Tailwind v4 (token dari 08-DESIGN), Zod, Vitest, starter Soft Op (aplikasi), Lenis + Motion Primitives (landing).
- **Test:** `npm test` · **Build:** `npm run build` · **Typecheck:** `npm run typecheck` · **Lint:** `npm run lint && npm run format:check` · **Dead code:** `npx knip`

## Konvensi Singkat (dari docs/02-AGENT.md)

- Backend hanya dipanggil dari server lewat `src/lib/api` (`server-only`); browser tidak pernah memegang token atau memanggil backend.
- Respons backend selalu di-parse Zod (`src/lib/api/schemas.ts`, sesuai `docs/09-API-KONTRAK.md`); kebutuhan API baru ditulis dulu di kontrak.
- Web tidak menghitung skor; kelas risiko dipetakan di satu tempat: `src/lib/risk.ts`.
- Server Component bawaan; mutasi lewat Server Actions + Zod; galat `VALIDATION_ERROR.fields` dipetakan ke form.
- Rute Bahasa Indonesia kebab-case, terdaftar di `src/lib/nav.ts` dengan ID PRD.
- Data simulasi berbadge "Data simulasi"; versi model tampil di rincian skor.
- Commit Conventional Commits berbahasa Indonesia, hanya bila user setuju.
- UI wajib ikut `docs/08-DESIGN.md`, termasuk Standar UI anti tampilan AI. Sebelum mengerjakan UI, baca "Peta area" di 08-DESIGN. File landing → Bersama + Area Landing; file aplikasi → Bersama + Area Aplikasi. Jangan campur gaya kedua area. Lenis, efek Motion Primitives, dan GSAP hanya di area landing.

## Aturan Wajib

@docs/07-RULES.md

## Aturan Main

@docs/06-WORKFLOW.md

## Kapan baca docs

- Ide asli, tujuan, batasan → `docs/00-BRIEF.md`
- Mulai task baru → bagian task terkait di `docs/03-ARCHITECTURE.md`
- Status task berubah → update `docs/04-TODO.md` (wajib)
- Endpoint, bentuk data, otorisasi → `docs/09-API-KONTRAK.md`
- Ragu soal scope fitur → `docs/01-PRD.md`
- Membuat/mengubah halaman → bagian "Peta Halaman" di `docs/01-PRD.md` + `docs/08-DESIGN.md`
- Kerja UI (halaman, komponen, warna, font) → `docs/08-DESIGN.md` (wajib, jangan pakai nilai di luar token)
- Detail konvensi koding → `docs/02-AGENT.md`
- Latar belakang rumus lama (arsip, tidak berlaku) → `docs/arsip/`
- Aturan kerja always-on → `docs/ALWAYS-ON.md` (jika ada)
