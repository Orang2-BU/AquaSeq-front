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
| Build | `npx expo export -p web` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx expo lint` |
| Format | `npx prettier --check .` |
| Dead code | `npx knip` |
| Uji emas SDRI (bila menyentuh engine/params) | `python scripts/sdri_v1_check.py` + `npm test -- golden` |
| Cek fungsi terkait | Buka layar yang berubah di web (`npx expo start --web`) dan, untuk perubahan native/kaca, di Expo Go |

Pintasan: `npm run verify` (typecheck + lint + test). Build web tetap dijalankan sebelum menyatakan selesai.

> Status saat dokumen ini dibuat: proyek Expo belum dibuat, jadi perintah di atas adalah rencana. Berlaku penuh setelah T1.1.

## 3. Siklus Perbaikan Error
Jika ada pemeriksaan yang gagal:
1. Cari **akar penyebabnya** (baca pesan galat, reproduksi).
2. Perbaiki penyebabnya, bukan gejalanya.
3. Jalankan ulang **semua** pemeriksaan wajib.
4. Ulangi sampai semuanya berhasil.

## 4. Dilarang
- Melewati pemeriksaan wajib.
- Melemahkan tes: menghapus/men-skip tes, melonggarkan assertion, menambah `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `any`, atau sejenisnya hanya agar lolos.
- Mengubah angka acuan tes emas agar tes lolos tanpa keputusan tim yang tercatat.
- Menyatakan pekerjaan selesai tanpa bukti verifikasi (output perintah).
- Mengarang hasil pemeriksaan.
- Menyajikan data simulasi sebagai hasil lab nyata, atau menghapus badge SIMULASI (aturan GENOHACK melarang memalsukan bukti).

## 5. Kejujuran
Jika ada pemeriksaan yang tidak bisa dijalankan (tool belum terpasang, butuh perangkat iOS/Android fisik, butuh kredensial EAS, dsb.), jelaskan dengan jujur: pemeriksaan apa, kenapa tidak bisa, dan risikonya.

## 6. Nol Dead Code
Projek harus bersih dari kode tak terpakai setiap saat:
- Tidak ada impor, variabel, fungsi, ekspor, komponen, file, atau dependensi yang tidak dipakai.
- Tidak ada kode yang di-comment-out, `console.log` debug, atau feature flag mati.
- Saat mengubah/menghapus kode, telusuri dan hapus juga semua yang jadi tak terpakai karenanya.
- Jalankan `npx knip` sebagai bagian dari verifikasi wajib.

## 7. Solusi Paling Sederhana (Ponytail)
Berlaku untuk setiap tugas koding: menulis, memperbaiki, refactor, review, memilih dependensi.
- Kalau skill `ponytail` tersedia (Claude Code), panggil otomatis. Kalau tidak, prinsip di bawah tetap wajib.
- Tanya dulu: apakah ini perlu dibuat sama sekali? (YAGNI)
- Urutan pilihan: fitur bawaan bahasa → fitur bawaan React Native/Expo → dependensi yang sudah ada di projek → dependensi baru (harus minta izin, sertakan alasan).
- Kode sesedikit mungkin yang tetap benar, terbaca, dan teruji. Tidak ada abstraksi, konfigurasi, atau lapisan "untuk jaga-jaga".
- Sederhana bukan berarti asal: tidak boleh mengorbankan kebenaran, keamanan, tes, atau aturan lain di dokumen ini.

## 8. UI/UX
Berlaku untuk setiap kerja tampilan: halaman, komponen, layout, warna, tipografi, aksesibilitas, responsif.
- Kalau skill `impeccable` tersedia (Claude Code), panggil otomatis: `impeccable` menentukan tampilan (kualitas visual penuh), `ponytail` menentukan cara membangunnya (tanpa dependensi tambahan). Jangan menurunkan kualitas visual demi menghemat kode.
- `docs/08-DESIGN.md` wajib dipakai: hanya token di dokumen itu (warna, font, spacing, radius, shadow, kaca), lewat `src/ui/theme/tokens.ts`; tidak ada nilai hardcode di luar token.
- Sumber komponen, berurutan: komponen yang sudah ada di projek → primitif React Native/Expo → komponen pilihan user yang tercatat di 08-DESIGN (GlassSurface React Bits, bottom bar referensi) → tulis sendiri. shadcn/ui tidak dipakai (web/Tailwind, bukan React Native). Library UI lain (NativeBase, Tamagui, Gluestack, React Native Paper, dll.) butuh izin.
- Checklist wajib sebelum UI dinyatakan selesai:
  - Web: tampil benar di 375px, 768px, dan 1440px tanpa scroll horizontal. Native: tampil benar di HP kecil (≈ 360 pt lebar) dan besar, aman dari notch/home indicator (`SafeAreaView`).
  - Kontras teks ≥ 4,5:1 (teks besar & elemen UI ≥ 3:1), **termasuk di atas kaca** pada kondisi latar terburuk.
  - Web: semua aksi bisa lewat keyboard, fokus terlihat jelas. Native: semua elemen interaktif punya `accessibilityRole` dan `accessibilityLabel`.
  - Target sentuh ≥ 44×44 pt; teks isi ≥ 16 di HP.
  - State lengkap: tekan (pressed), fokus, nonaktif, loading, kosong, galat.
  - Input punya label; ikon tanpa teks punya label aksesibilitas.
  - Kelas risiko selalu warna + ikon + teks; grafik punya ringkasan teks.
  - Reduce motion dan reduce transparency dihormati (kaca → panel pekat, animasi → statis).
  - Konsisten dengan komponen lain yang sudah ada.
  - Teks yang terlihat user tanpa em-dash/en-dash sebagai pemisah; konten contoh realistis (nama kolam/lokasi lokal, angka tidak terlalu rapi, tanpa kata klise pemasaran).
  - Layar penuh memakai `flex: 1` + safe area, bukan tinggi tetap; di web pakai `100dvh`, bukan `100vh`. Font dimuat lokal lewat `expo-font`, bukan `<link>` Google Fonts.
  - Bila 08-DESIGN memakai format Google DESIGN.md: setelah token diubah, `npx -p @google/design.md designmd lint docs/08-DESIGN.md` wajib 0 error dan tanpa warning `contrast-ratio`, lalu ekspor ulang token.
  - Lulus Prinsip UX di bagian "Do's and Don'ts" 08-DESIGN: tahan variasi konten, info penting di titik keputusan, konsekuensi terlihat sebelum aksi (mis. "Terbitkan" menunjukkan siapa yang menerima), aksi utama jelas tapi tidak agresif, tanpa elemen berlebihan.
- Verifikasi visual: buka layar yang berubah di web (desktop + mobile) dan, bila menyentuh kaca/native, di Expo Go. Masukkan hasilnya ke laporan.

## 9. Output Perintah Hemat (RTK)
- Kalau `rtk` terpasang, jalankan perintah yang outputnya panjang (git, npm, jest, expo export, lint, ls/grep di folder besar) lewat `rtk` agar output ringkas tanpa kehilangan sinyal penting.
- Kalau tidak terpasang, pakai flag ringkas bawaan tool (mis. `--silent`, reporter ringkas) dan batasi output dengan filter, tanpa menyembunyikan galat.
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
| Build | npx expo export -p web | ✅ |
| Typecheck | npx tsc --noEmit | ✅ |
| Lint | npx expo lint | ✅ |
| Dead code | npx knip | ✅ tidak ada temuan |
| Uji emas (jika engine berubah) | sdri_v1_check.py + golden | ✅ 5/5 cocok |
| Fungsi terkait | ... | ✅ {{apa yang dicek}} |
| UI (jika ada perubahan tampilan) | web 375 / 768 / 1440 (+ Expo Go) | ✅ {{checklist §8}} |

### Tidak bisa dijalankan / catatan
- {{... atau "Tidak ada"}}
```
