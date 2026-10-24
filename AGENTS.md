# AquaSeq Web

> Instruksi untuk semua AI coding assistant. Onboarding terakhir: 24 Okt 2026 (setup-project-00).
> Sumber kebenaran ada di `docs/`. File ini ringkasannya.

## WAJIB sebelum ngoding pertama kali

Jika kamu AI yang belum pernah bekerja di projek ini, baca **seluruh** file di `docs/` (00 sampai 09 yang ada; `docs/arsip/` tidak berlaku) secara berurutan satu kali, lalu ikuti aturannya. Setelah itu cukup rujuk file ini.

## Aplikasi

Web AquaSeq: landing publik + aplikasi berlogin untuk tambak udang vaname, di atas backend Go tim (`Orang2-BU/AquaSeq-back`). Pemilik tambak mengunggah CSV hasil qPCR; web menampilkan pratinjau QC lalu mengirim ringkasan ke backend, yang menghitung peluang wabah dan kelas risiko. Web menampilkan dasbor, peringatan, rincian skor, dan alur tugas pemilik → teknisi (catat kimia air, lapor foto dari HP). Di luar scope: backend, aplikasi mobile, bisnis/harga, LLM, menghitung skor di web. Ide asli: `docs/00-BRIEF.md`.

## Stack & Perintah Verifikasi

- **Stack:** Next.js 16 App Router + TS strict (frontend + BFF tipis), backend Go via `src/lib/api` (mode `mock`/`live`), JWT di cookie httpOnly, Tailwind v4, Zod, Vitest, starter Soft Op (aplikasi), Lenis + Motion Primitives (landing).
- **Test:** `npm test` · **Build:** `npm run build` · **Typecheck:** `npm run typecheck` · **Lint:** `npm run lint && npm run format:check` · **Dead code:** `npx knip`

## Aturan Wajib (ringkas — lengkapnya di docs/07-RULES.md)

- Tuntaskan setiap permintaan sesuai aturan projek.
- Setiap perubahan kode: jalankan test, build, typecheck, lint, cek dead code, dan cek fungsi terkait.
- Error → cari akar penyebab, perbaiki, ulangi semua pemeriksaan sampai hijau.
- Dilarang skip pemeriksaan, melemahkan test, memanggil backend dari browser, menghitung skor di web, meng-cast respons backend tanpa Zod, atau klaim selesai tanpa bukti.
- Pemeriksaan yang tidak bisa dijalankan → jelaskan dengan jujur.
- Projek harus bersih dari dead code.
- Solusi paling sederhana yang benar (YAGNI, fitur bawaan dulu, dependency baru harus izin). Pakai skill `ponytail` jika tersedia.
- Kerja UI: ikuti docs/08-DESIGN.md + checklist UI/UX (responsif, kontras AA, keyboard, semua state, Standar UI anti tampilan AI). Pakai skill `impeccable` jika tersedia.
- Output perintah panjang lewat `rtk` jika terpasang; jangan menebak dari output terpotong.
- Selesai kerja → laporkan perubahan, pemeriksaan, dan hasilnya.

## Aturan Main (ringkas — lengkapnya di docs/06-WORKFLOW.md)

- **Otonomi:** kerjakan task 04-TODO, jalankan pemeriksaan, perbaiki error sendiri, tambah data SIMULASI dan endpoint mock yang sudah ada di kontrak.
- **Wajib minta izin:** dependency baru, ubah kontrak API, ubah cara skor ditampilkan, fitur di luar PRD, commit/push/deploy, menulis ke backend produksi, hapus data, potong scope.
- **Selesai =** kriteria di 03 terpenuhi + semua cek hijau + ada test + 04-TODO diupdate + laporan.

## Konvensi (ringkas — lengkapnya di docs/02-AGENT.md)

- Backend hanya dipanggil dari server lewat `src/lib/api` (`server-only`); token hanya di cookie httpOnly.
- Respons backend di-parse Zod sesuai `docs/09-API-KONTRAK.md`.
- Kelas risiko dipetakan di satu tempat: `src/lib/risk.ts`.
- Server Component bawaan; mutasi lewat Server Actions + Zod.
- Rute Bahasa Indonesia kebab-case, terdaftar di `src/lib/nav.ts` dengan ID PRD.
- Data simulasi berbadge "Data simulasi"; versi model tampil di rincian skor.
- Sebelum mengerjakan UI, baca "Peta area" di 08-DESIGN. File landing → Bersama + Area Landing; file aplikasi → Bersama + Area Aplikasi. Jangan campur gaya kedua area. Lenis, efek Motion Primitives, dan GSAP hanya di area landing.

## Kapan baca docs

- Ide asli, tujuan, batasan → `docs/00-BRIEF.md`
- Mulai task baru → bagian terkait di `docs/03-ARCHITECTURE.md`
- Status task berubah → update `docs/04-TODO.md` (wajib)
- Endpoint, bentuk data, otorisasi → `docs/09-API-KONTRAK.md`
- Ragu scope → `docs/01-PRD.md`
- Membuat/mengubah halaman → bagian "Peta Halaman" di `docs/01-PRD.md` + `docs/08-DESIGN.md`
- Kerja UI → `docs/08-DESIGN.md` (wajib, jangan pakai nilai di luar token)
- Aturan kerja always-on → `docs/ALWAYS-ON.md` (jika ada) — wajib diikuti setiap respons
- Konflik aturan → prioritas: 07-RULES > instruksi user > 00-BRIEF > 01-PRD > 08-DESIGN (untuk UI) > 06-WORKFLOW > 03-ARCHITECTURE / 09-API-KONTRAK > 02-AGENT

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
