# Catatan Lanjutan (serah terima antar sesi)

> Ditulis 24 Okt 2026 saat sesi dipindah ke akun lain. Baca ini setelah `CLAUDE.md`, lalu `docs/04-TODO.md` dan `docs/09-API-KONTRAK.md`.

## 1. Posisi sekarang
- Branch kerja: `feat/web-setup`. **Commit/push hanya ke branch ini, jangan ke `main`** (permintaan user 24 Okt).
- Selesai: T1, T2, T5, T6, T7, T8, T9 (P14 daftar kolam), T10 (P25 Tim + P11 terima undangan).
- Berjalan: T3 (lapisan API) dan T4 (mock), bertambah sesuai halaman.
- Berikutnya: task ⬜ berikutnya di `docs/04-TODO.md` sesuai urutan.
- Semua cek terakhir hijau: lihat laporan sesi 24 Okt (tes, typecheck, lint, format, knip, build).

## 2. Cara menjalankan
```bash
npm install
npm run dev          # http://localhost:3000, API_MODE=mock (bawaan)
npm test             # vitest
npm run typecheck && npm run lint && npm run format:check && npx knip
npm run build        # JANGAN saat dev server hidup (lihat §4)
```
Akun demo: tombol "Masuk sebagai demo pemilik/teknisi" di `/masuk` (Hendra Kusuma pemilik 2 lokasi; Rizky Pratama teknisi). Undangan demo: `/undangan/undangan-demo-sumber-rejeki` (bayu@demo.aquaseq.id, kolam C3). Tautan undangan baru dicetak ke log dev server (`[mock] Undangan ...`). Data mock hilang saat server restart.

## 3. Yang sudah dibangun di T9/T10 (rujukan)
- Skor hanya dipetakan di `src/lib/risk.ts` (label, nada `risk-*`, format peluang koma, label tren, urutan). Badge: `components/app/risk-badge.tsx`.
- Form bersama: `components/app/ponds-form.tsx` (onboarding + Tambah kolam), `components/app/invite-form.tsx` (onboarding + Undang teknisi), `components/app/empty-state.tsx`, hook `components/ui/use-close-on-success.ts`.
- Tabel daftar: kelas `.data-table` + `data-label` per sel (jadi kartu < 768px), `.filter-pills`, `.table-toolbar` di `globals.css`.
- Mock: angka skor dari tabel seed (bukan rumus), teks rekomendasi dari backend `engine.go`; `open_tasks` masih 0 sampai tugas dibangun (T21).

## 4. Jebakan yang sudah ditemukan
- **Jangan `npm run build` saat dev server hidup**: keduanya memakai `.next` dan memicu reload berantai. Hentikan dev server dulu, setelah build hapus `.next`.
- `cacheComponents` aktif: baca cookie/searchParams/params hanya di dalam `<Suspense>`; `usePathname`/`useSearchParams` di klien juga butuh Suspense.
- `withSession()` (`src/lib/auth/session.ts`) adalah satu-satunya jalan memanggil backend dari server: menandai `connection()`, membaca token, dan bila 401 mengarahkan ke `/api/sesi/berakhir` (menghapus cookie; tanpa itu terjadi siklus redirect).
- Di Server Action selalu `return { ...messageOf(error) }` di `catch`: `messageOf` memanggil `unstable_rethrow` supaya `redirect()` tidak tertelan.
- `Icon`/`Badge` (`components/ui/index.tsx`) aman untuk Server Component; `Modal` ada di `ui/modal.tsx` (klien). Jangan gabungkan lagi.
- **Dev server kadang tidak menangkap file yang ditulis skrip (Python/sed)**; CSS lama tetap tersaji. Edit lewat tool Edit atau simpan ulang filenya, lalu muat ulang.
- Flex kolom dengan `flex-wrap: wrap` melebar mengikuti anak terlebar (mis. baris pill yang bergulir); pakai `nowrap`.
- Hindari `setState` di dalam effect (aturan lint React); pakai reducer `useActionState` atau `useEffectEvent`. Jangan pakai `eslint-disable` (07-RULES).
- Alat browser bisa menutup modal/menu di antara dua panggilan; untuk menguji dialog, klik lewat satu skrip JavaScript.
- Badge "Data simulasi" dan notifikasi contoh hanya untuk lokasi `provenance = simulasi`.
- Go belum terpasang di laptop; mode live ke backend lokal belum pernah diuji.

## 5. Menunggu keputusan user
- Izin dependency `server-only` (diusulkan dipasang di modul `src/lib/api` dan `src/lib/auth`).
- Kontrak 09 perlu disetujui tim backend (pertanyaan K1-K6), terutama rentang PPC.
