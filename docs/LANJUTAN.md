# Catatan Lanjutan (serah terima antar sesi)

> Ditulis 24 Okt 2026, diperbarui 25 Okt 2026 saat sesi dipindah ke akun lain. Baca ini setelah `CLAUDE.md`, lalu `docs/04-TODO.md` dan `docs/09-API-KONTRAK.md`.

## 1. Posisi sekarang
- Branch kerja: `push-deployment`. Dilarang commit/push tanpa izin user.
- Selesai: semua halaman **pemilik** di mode mock (P12-P29, P31-P34, P42, 404 dalam shell). Detail per task di `docs/04-TODO.md`.
- Selesai dari branch rekan (`feat/web-setup`): halaman **teknisi** (T11, T12, T22, P39) dan **landing** baru dengan logo AquaSeq, Motion Primitives, dan GradualBlur.
- Selesai dari branch deploy (`push-deployment`): integrasi Dokploy packaging, skema live API, kamus istilah baru eDNA, dan unit test lengkap.
- Selesai 25 Okt: FE menampilkan temuan eDNA mikroba dari backend (`sdri.Assess`) dan insight kolam (T52, T53); istilah UI "hasil lab" diganti "data eDNA". Menunggu backend: K9 `engineered_features` di detail sampel.
- Belum: publik (P2-P4, T37), nomor WhatsApp tim (`WHATSAPP_NUMBER` di `src/content/landing.ts`), P30 banding dan P35 bantuan (Could), uji live saat backend online.

## 1b. Sesi 25 Okt: FE disesuaikan dengan BE eDNA (BELUM DI-COMMIT)
Konteks: Hadi menyambungkan FE ke BE `Orang2-BU/AquaSeq-back` (deploy di https://aquaseq.hadooyy.my.id). User minta FE menampilkan analisis eDNA mikroba bakteri dari BE dan menyesuaikan nama/kartu. Base kerja: branch `push-deployment` (pilihan user). Semua perubahan masih **belum di-commit**; commit/push hanya bila user minta (akun krizzn65, tanpa trailer Co-Authored-By, Conventional Commits Bahasa Indonesia).

Status verifikasi terakhir: `npm test` 119 lulus, typecheck, lint, format, knip, build ✅; dicek di browser mode mock (pemilik: dasbor, detail kolam C4, rincian skor C4-1023 di 1440 dan 375; teknisi: Kolam saya, tugas `t-b3-pakan`). Mode live ke BE belum diuji.

Fakta BE yang dipakai (jangan baca ulang repo BE kecuali perlu):
- `sdri.Assess` mengisi `predicted_disease` (kode, mis. `NO_TARGET_WARNING`, `AHPND_RISK`, `AHPND_NH3_RISK`), `disease_name`, `evidence` = hanya fitur yang tidak aman `[{feature, value, threshold (teks), status}]`, `mitigation_actions` = array teks. Status: `aman`, `peringatan`, `kritis`, `belum_cukup`, `di_luar_acuan`. Kolom DB bisa null, jadi skema Zod pakai `.nullish()`.
- Kode fitur (X1-X12): `kontrol_kualitas`, `fold_regulation_amoa`, `indeks_disbiosis`, `jejak_ahpnd|wssv|ehp`, `nh3_mg_l`, `no2_mg_l`, `h2s_mg_l`, `do_mg_l`, `tom_mg_l`, `alkalinity`.
- Parameter kurang → `REJECTED_INVALID_QC` ("DATA_BELUM_CUKUP"). Ct target harus angka (40 = negatif).
- `GET /ponds/{id}/insights`: anomaly, forecast_7d/14d, similar_cases, explanation.

Peta perubahan:
- `src/lib/edna.ts` (baru): label kode fitur → teks + satuan + kelompok, nada badge status, `mitigationList` (teks/objek disamakan). Test `src/lib/__tests__/edna.test.ts`.
- `src/components/app/edna-findings.tsx` (baru): `DiseaseLine` (dugaan penyakit, varian `inverse` untuk kartu navy) dan `EdnaFindings` (kartu "Temuan eDNA mikroba": bukti per kelompok + mitigasi).
- `src/components/app/insights-panel.tsx` (baru): panel "Pola & prakiraan".
- Dipasang di: rincian skor (`sampel/[sampleId]`), detail kolam (DiseaseLine + 3 mitigasi + InsightsPanel; insights di-`.catch(() => null)`), dasbor (spotlight), teknisi Kolam saya, tugas teknisi (kotak "Alasan dari data eDNA").
- CSS: `src/styles/app-pages.css` blok "Temuan eDNA mikroba" dan "Insight kolam" (sebelum `@media print`) + aturan mobile.
- Istilah: "hasil lab" → "data eDNA" di semua halaman `(app)`, `nav.ts`, `app-shell.tsx`, mock, dan test; kolom CSV "Ct" → "Kadar jejak (Ct)". Landing sengaja tidak diubah.
- `src/lib/risk.ts`: alasan `REJECTED_INVALID_QC` jadi "Data eDNA atau kimia air belum lengkap atau tidak valid".
- Mock `src/lib/api/mock/index.ts`: `EDNA_FINDINGS` per kelas risiko memakai kode BE; sampel ditolak → `NO_FINDINGS` (null).
- Docs: 09-API-KONTRAK (bentuk `evidence`/`mitigation_actions` + usulan **K9**), 04-TODO (T52, T53 ✅).

Langkah berikut:
1. Tanya user: commit + push ke `push-deployment`.
2. Sampaikan K9 ke Hadi: `GET /samples/{id}` perlu `engineered_features` (semua fitur, termasuk yang aman).
3. Uji mode live (`API_MODE=live`) terhadap BE Hadi bila user minta; cek kode penyakit lain yang belum dipetakan (fallback teks sudah ada).
4. Cek 768px belum dilakukan untuk kartu eDNA (375 dan 1440 sudah).

Jebakan sesi ini: dev server port 3000 sering milik akun lain di folder yang sama (`preview_start` gagal "Another next dev server"); pakai `http://localhost:3000` langsung, jangan kill. Build tetap lolos walau dev server hidup di Next 16.4 (dev memakai `.next/dev`). Untuk logout di browser: tombol "Lihat profil" di topbar → "Keluar" (badge Next devtools di kiri bawah menutupi kartu akun sidebar).

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
