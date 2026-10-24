# 07 — RULES: Aturan Wajib

> Aturan tertinggi projek. Berlaku untuk setiap AI dan setiap perubahan kode, tanpa pengecualian.

## 1. Tuntaskan Permintaan
- Kerjakan setiap permintaan sampai benar-benar selesai, mengikuti aturan di docs/.
- Jangan berhenti di tengah jalan atau menyerahkan pekerjaan setengah jadi sebagai "selesai".

## 2. Verifikasi Wajib Setiap Perubahan Kode
Jalankan semua pemeriksaan yang tersedia di projek ini:

| Cek | Perintah |
|---|---|
| Test | `npm test` |
| Build | `npm run build` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` dan `npm run format:check` |
| Dead code | `npx knip` |
| Tes kontrak (bila `src/lib/api` atau 09-API-KONTRAK berubah) | `npm test -- contract` (dan dengan `API_MODE=live` bila backend tersedia) |
| Cek fungsi terkait | buka halaman yang berubah di browser dengan akun demo yang sesuai perannya (pemilik/teknisi), minimal di mode mock |
| Cek alur inti | 6 langkah di 01-PRD §4 masih jalan (minimal langkah yang tersentuh perubahan) |

## 3. Siklus Perbaikan Error
Jika ada pemeriksaan yang gagal:
1. Cari **akar penyebabnya** (baca pesan error, reproduksi).
2. Perbaiki penyebabnya, bukan gejalanya.
3. Jalankan ulang **semua** pemeriksaan wajib.
4. Ulangi sampai semuanya berhasil.

## 4. Dilarang
- Melewati pemeriksaan wajib.
- Melemahkan test: menghapus/men-skip test, melonggarkan assertion, menambah `@ts-ignore`, `eslint-disable`, `any`, atau sejenisnya hanya agar lolos.
- Memanggil backend dari browser, menaruh token di luar cookie httpOnly, atau mencetak token ke log.
- Menghitung skor, kelas, atau rekomendasi di web, atau menyimpan salinan rumus backend.
- Menjalankan AI/LLM langsung dari web atau membuat chatbot bebas. Backend menjalankan Lapis A (SDRI deterministik), B (belajar pola, prakiraan, kalibrasi), C (bahasa Jev/TypeSafe). LLM hanya menstrukturkan input dan menjelaskan hasil mesin, tidak menghitung atau mengarang angka.
- Mengubah bobot aktif diam-diam. V1 beku; hasil belajar berupa kandidat versi baru, promosi pemilik dengan catatan wajib dan audit nama/waktu.
- Meng-cast respons backend (`as`) tanpa validasi Zod.
- Mengubah bentuk API di mock/live tanpa memperbarui `docs/09-API-KONTRAK.md`.
- Menyamarkan data simulasi sebagai data nyata, atau menghilangkan badge "Data simulasi".
- Menyatakan pekerjaan selesai tanpa bukti verifikasi (output perintah).
- Mengarang hasil pemeriksaan.

## 5. Kejujuran
Jika ada pemeriksaan yang tidak bisa dijalankan (tool belum terpasang, backend belum punya endpoint atau tidak berjalan, butuh layanan eksternal, dsb.), jelaskan dengan jujur: pemeriksaan apa, kenapa tidak bisa, dan risikonya.

## 6. Nol Dead Code
Projek harus bersih dari kode tak terpakai setiap saat:
- Tidak ada import, variabel, fungsi, export, komponen, file, atau dependency yang tidak dipakai.
- Tidak ada kode yang di-comment-out, `console.log` debug, atau feature flag mati.
- Saat mengubah/menghapus kode, telusuri dan hapus juga semua yang jadi tak terpakai karenanya.
- Jalankan cek dead code sebagai bagian dari verifikasi wajib.

## 7. Solusi Paling Sederhana (Ponytail)
Berlaku untuk setiap tugas koding: menulis, memperbaiki, refactor, review, memilih dependency.
- Kalau skill `ponytail` tersedia (Claude Code), panggil otomatis. Kalau tidak, prinsip di bawah tetap wajib.
- Tanya dulu: apakah ini perlu dibuat sama sekali? (YAGNI.)
- Urutan pilihan: fitur bawaan bahasa/standard library → fitur bawaan framework/platform (Next.js, React, browser) → dependency yang sudah ada di projek → dependency baru (harus minta izin, sertakan alasan).
- Kode sesedikit mungkin yang tetap benar, terbaca, dan teruji. Tidak ada abstraksi, konfigurasi, atau lapisan "untuk jaga-jaga".
- Sederhana bukan berarti asal: tidak boleh mengorbankan kebenaran, keamanan, test, atau aturan lain di dokumen ini.

## 8. UI/UX
Berlaku untuk setiap kerja tampilan: halaman, komponen, layout, warna, tipografi, aksesibilitas, responsif.
- Kalau skill `impeccable` tersedia (Claude Code), panggil otomatis: `impeccable` menentukan tampilan (kualitas visual penuh), `ponytail` menentukan cara membangunnya (tanpa dependency tambahan). Jangan menurunkan kualitas visual demi menghemat kode. Kalau skill tidak tersedia, checklist di bawah tetap wajib.
- `docs/08-DESIGN.md` wajib dipakai: hanya token di dokumen itu (warna, font, spacing, radius), tidak ada nilai hardcode di luar token. Baca "Peta area" dulu: file landing → Bersama + Area Landing; file aplikasi → Bersama + Area Aplikasi.
- Sumber komponen: Area Aplikasi = starter template Soft Op (kelas CSS + komponen starter), tanpa shadcn dan tanpa sidebar-21st (03-ARCHITECTURE Q2). Area Landing = komponen sendiri + Motion Primitives + `pill-link`. Library UI lain butuh izin.
- Checklist wajib sebelum UI dinyatakan selesai:
  - Responsif di 375px, 768px, dan 1440px tanpa scroll horizontal.
  - Kontras teks ≥ 4.5:1 (teks besar & elemen UI ≥ 3:1).
  - Semua aksi bisa lewat keyboard, focus terlihat jelas.
  - Target sentuh ≥ 44×44px di bawah 1200px (≥ 36px di desktop); body text ≥ 16px di mobile.
  - State lengkap: hover, active, focus, disabled, loading, empty, error.
  - Input punya label; ikon tanpa teks punya `aria-label`.
  - Konsisten dengan komponen lain yang sudah ada.
  - Teks yang terlihat user tanpa em-dash (`—`/`–` sebagai pemisah); konten contoh realistis (bukan John Doe/Acme, bukan angka terlalu rapi, tanpa kata klise pemasaran).
  - Bagian setinggi layar memakai `min-h-[100dvh]`, bukan `h-screen`; font lewat `next/font`, bukan `<link>` Google Fonts.
  - Lulus Standar UI A1-A11 + A13 di bagian Do's and Don'ts 08-DESIGN (tanpa emoji, tanpa warna bawaan AI, satu layar satu tugas, tanpa elemen tanpa fungsi, tanpa em-dash, konten realistis, `100dvh` + font self-host, semua elemen klik punya hover/tekan/fokus beranimasi).
  - Kelas risiko selalu teks + warna (lewat `src/lib/risk.ts`); sampel ditolak tanpa angka peluang; data simulasi berbadge.
  - Area Aplikasi: shell lolos verifikasi berdampingan dengan preview starter Soft Op (1440/768/375).
  - Section landing lulus larangan AI slop (LANDING-PAGE §7, tercatat di 08-DESIGN) dan audit `impeccable`; Lenis dan animasi mati saat reduced-motion; Lenis tidak dimuat di `(app)`.
  - Setelah token diubah: `npx -p @google/design.md designmd lint docs/08-DESIGN.md` wajib 0 error dan tanpa warning `contrast-ratio`, lalu `export` ulang theme-nya.
  - Lulus Prinsip UX di bagian "Do's and Don'ts" `docs/08-DESIGN.md`.
- Verifikasi visual: buka halaman yang berubah di browser (desktop + mobile) dan cek checklist di atas. Masukkan hasilnya ke laporan.

## 9. Output Perintah Hemat (RTK)
- Kalau `rtk` terpasang, jalankan perintah yang outputnya panjang (git, npm, test runner, build, lint) lewat `rtk` agar output ringkas tanpa kehilangan sinyal penting.
- Kalau tidak terpasang, pakai flag ringkas bawaan tool dan batasi output dengan filter, tanpa menyembunyikan error.
- Gabungkan perintah yang saling terkait dalam satu kali jalan.
- Kalau output ringkas tidak bisa dipakai (kosong padahal seharusnya ada isi, bertentangan dengan exit code, atau rusak), jalankan ulang tanpa peringkas (`rtk proxy <cmd>`). Jangan menebak hasil dari output yang terpotong.

## 10. Laporan Akhir (wajib setelah setiap pekerjaan)
```
### Perubahan
- {{file}}: {{apa yang diubah dan kenapa}}

### Pemeriksaan
| Cek | Perintah | Hasil |
|---|---|---|
| Test | npm test | ✅ 42 passed |
| Build | npm run build | ✅ |
| Typecheck | npm run typecheck | ✅ |
| Lint | npm run lint && npm run format:check | ✅ |
| Dead code | npx knip | ✅ tidak ada temuan |
| Fungsi terkait | ... | ✅ {{apa yang dicek}} |
| Alur inti | ... | ✅ {{langkah yang dicek}} |
| UI (jika ada perubahan tampilan) | browser 375 / 768 / 1440 | ✅ {{checklist §8}} |
| UI: Standar UI A1-A11 | 08-DESIGN Do's and Don'ts | ✅ |

### Tidak bisa dijalankan / catatan
- {{... atau "Tidak ada"}}
```
