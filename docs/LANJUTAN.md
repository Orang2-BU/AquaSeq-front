# Catatan Lanjutan (serah terima antar sesi)

> Ditulis 24 Okt 2026 saat sesi dipindah ke akun lain. Baca ini setelah `CLAUDE.md`, lalu `docs/04-TODO.md` dan `docs/09-API-KONTRAK.md`.

## 1. Posisi sekarang
- Branch kerja: `push-deployment`. Dilarang commit/push tanpa izin user.
- Selesai: semua halaman **pemilik** di mode mock (P12-P29, P31-P34, P42, 404 dalam shell). Detail per task di `docs/04-TODO.md`. Integrasi kecerdasan backend 3 lapis (T51-T55): skema Zod + API klien + mock seed + tes kontrak selesai; desain visual UI di-freeze 100% mengikuti buatan teman user (tanpa kartu/chart/panel baru); teks antarmuka disesuaikan kamus istilah baru (eDNA air tambak, kadar jejak patogen, kontrol kualitas, panel jejak penyakit).
- Belum: halaman **teknisi** (T11 Tugas saya, T12 Catat air, T22 Kerjakan tugas + foto, P39), publik (P2-P4, T37), landing (T26-T35), P30 banding dan P35 bantuan (Could), uji live dengan backend online di port 18080 (saat ini RED jujur: ECONNREFUSED).
- Pemeriksaan terakhir frontend: 83 tes, typecheck, lint, format, knip hijau. Build 45 rute hijau sebelum penyelarasan terakhir skema. Live RED: ECONNREFUSED port 18080. UI fitur AI baru menunggu izin; hanya teks dan wiring input lama berubah.

## 2. Cara menjalankan
```bash
npm install
npm run dev          # http://localhost:3000, API_MODE=mock (bawaan)
npm test             # vitest
npm run typecheck && npm run lint && npm run format:check && npx knip
npm run build        # JANGAN saat dev server hidup (lihat §4)
```
Akun demo: tombol "Masuk sebagai demo pemilik/teknisi" di `/masuk` (Hendra Kusuma pemilik 2 lokasi; Rizky Pratama teknisi). Undangan demo: `/undangan/undangan-demo-sumber-rejeki` (bayu@demo.aquaseq.id, kolam C3). Tautan undangan baru dicetak ke log dev server (`[mock] Undangan ...`). Data mock hilang saat server restart.

## 3. Peta kode halaman pemilik (rujukan)
- Data: `src/lib/api/index.ts` (skema Zod + klien live), `src/lib/api/mock/store.ts` (seed) dan `mock/index.ts` (perilaku). Store mock memakai kunci `globalThis.__aquaseqMockV3`; ganti versi kunci bila bentuk seed berubah supaya dev server tidak memakai store lama.
- Skor hanya dipetakan di `src/lib/risk.ts` (label, nada, format peluang, tren, alasan ditolak, pemicu utama WA). Badge `components/app/risk-badge.tsx`, tren `components/app/trend.tsx`.
- Komponen bersama `components/app/`: `task-dialog` (buat/ubah tugas), `whatsapp-dialog` (hook `useWhatsAppPreview`, dimuat dari klik), `cycle-dialog`, `risk-chart` (SVG), `plate` (96-well), `select-filter`, `page-parts` (`PageSkeleton`, `Metric`), `empty-state` (`NoFarmState`).
- Baca entitas dari URL lewat `loadEntity()` (`lib/auth/session.ts`): `NOT_FOUND` → 404 dalam shell, `FORBIDDEN` → `/akses-ditolak`.
- CSV: `src/lib/csv/qpcr.ts` (parser + QC, dipakai klien dan server), `src/lib/csv/export.ts` (ekspor aman injeksi rumus). Template di `public/templates/`.
- CSS halaman pemilik di `src/styles/app-pages.css` (diimpor `globals.css`).

## 4. Jebakan yang sudah ditemukan
- **Jangan `npm run build` saat dev server hidup**: keduanya memakai `.next` dan memicu reload berantai. Hentikan dev server dulu, setelah build hapus `.next`.
- `cacheComponents` aktif: baca cookie/searchParams/params hanya di dalam `<Suspense>`; `usePathname`/`useSearchParams` di klien juga butuh Suspense.
- `withSession()` (`src/lib/auth/session.ts`) adalah satu-satunya jalan memanggil backend dari server: menandai `connection()`, membaca token, dan bila 401 mengarahkan ke `/api/sesi/berakhir` (menghapus cookie; tanpa itu terjadi siklus redirect).
- Di Server Action selalu `return { ...messageOf(error) }` di `catch`: `messageOf` memanggil `unstable_rethrow` supaya `redirect()` tidak tertelan.
- `Icon`/`Badge` (`components/ui/index.tsx`) aman untuk Server Component; `Modal` ada di `ui/modal.tsx` (klien). Jangan gabungkan lagi.
- **Dev server kadang tidak menangkap file yang ditulis skrip (Python/sed) atau berkas CSS baru yang diimpor**: CSS atau kode lama tetap tersaji. Simpan ulang berkasnya lewat editor, atau restart dev server, lalu muat ulang.
- Flex kolom dengan `flex-wrap: wrap` melebar mengikuti anak terlebar (mis. baris pill yang bergulir); pakai `nowrap`.
- Hindari `setState` di dalam effect (aturan lint React); pakai reducer `useActionState` atau `useEffectEvent`. Jangan pakai `eslint-disable` (07-RULES).
- Alat browser bisa menutup modal/menu di antara dua panggilan; untuk menguji dialog, klik lewat satu skrip JavaScript.
- Badge "Data simulasi" dan notifikasi contoh hanya untuk lokasi `provenance = simulasi`.
- Go belum terpasang di laptop; mode live ke backend lokal belum pernah diuji.

## 5. Menunggu keputusan user
- Izin dependency `server-only` (diusulkan dipasang di modul `src/lib/api` dan `src/lib/auth`).
- Kontrak 09 perlu disetujui tim backend (pertanyaan K1-K6), terutama rentang PPC.
