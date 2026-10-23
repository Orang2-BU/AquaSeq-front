# 05 — SKILL: Pola Prompt yang Dipakai Ulang

> Panggil dengan menyebut nama pola, contoh: "jalankan pola Security Review untuk src/engine/parse".

## Testing
Tulis/lengkapi tes untuk {{target}}:
1. Daftar perilaku yang harus benar, termasuk edge case dan jalur galat (Ct undetermined, replikat hilang, CSV rusak, nilai di luar rentang).
2. Tulis tes (format 02-AGENT §5), jalankan, pastikan gagal dulu kalau fitur belum ada.
3. Implementasi/perbaiki sampai hijau. Dilarang melemahkan assertion atau men-skip tes.
4. Laporkan cakupan perilaku yang dites.

## Security Review
Periksa {{target}} untuk: validasi input (CSV, form kimia, AsyncStorage), ukuran berkas, injeksi lewat konten CSV yang dirender, rahasia di kode, data sensitif di log, dependensi rentan (`npm audit`). Tiap temuan: lokasi, risiko (tinggi/sedang/rendah), skenario serangan, perbaikan.

## Refactor
Refactor {{target}} tanpa mengubah perilaku:
1. Pastikan ada tes yang mengunci perilaku; kalau belum, tulis dulu.
2. Sederhanakan: hapus duplikasi, pecah fungsi panjang, perjelas nama.
3. Jalankan seluruh pemeriksaan di 07-RULES. Perilaku harus identik (tes emas SDRI tetap sama persis).

## Debugging
Bug: {{gejala}}.
1. Reproduksi dulu (tes yang gagal kalau memungkinkan).
2. Cari akar masalah, bukan gejalanya. Jelaskan penyebabnya.
3. Perbaiki, tambah tes regresi, jalankan semua pemeriksaan.

## Code Review
Review {{diff/file}}: kebenaran logika, edge case, konsistensi dengan 02-AGENT, keterbacaan, performa, keamanan, tes yang kurang. Urutkan temuan dari paling parah.

## Dead-Code Sweep
Cari dan hapus kode tak terpakai di seluruh projek: ekspor/fungsi/variabel/komponen/file yang tidak direferensikan, impor tak terpakai, dependensi di `package.json` yang tidak dipakai, kode yang di-comment-out. Pakai `npx knip`. Jalankan semua pemeriksaan setelahnya.

## Tambah Layar dari Peta PRD
Bangun halaman {{P#}} dari tabel Peta Halaman 01-PRD §5b:
1. Baca baris P# (rute, peran, tugas, aksi utama, state khusus) dan task terkait di 03-ARCHITECTURE.
2. Rute tipis di `app/`, isi di `src/features/<fitur>/`, data lewat hook Query, warna/ukuran dari token.
3. Lengkapi semua state: loading, kosong, galat, dan state khusus di tabel. Data simulasi menampilkan badge SIMULASI.
4. Cek checklist UI 07-RULES §8 di web (375/768/1440) dan Expo Go.

## Cek Uji Emas SDRI
1. Jalankan `python scripts/sdri_v1_check.py` dan `npm test -- golden`.
2. Bandingkan SDRI dan kelas kelima arketipe GSI. Selisih > 0,1 = gagal.
3. Kalau parameter memang diubah (keputusan tim), naikkan versi di `params/` dan `docs/sdri-v1.md` (riwayat), lalu perbarui skrip Python dan tes bersamaan.

## Audit Kontras Kaca
Untuk setiap layar yang memakai GlassSurface:
1. Ambil warna latar terburuk di belakang kaca (paling terang dan paling gelap yang mungkin lewat).
2. Hitung kontras teks dan ikon di atas kaca untuk kedua kondisi; wajib ≥ 4,5:1 (teks) dan ≥ 3:1 (ikon/teks besar).
3. Cek mode reduce transparency/reduced motion: kaca diganti panel pekat.
4. Laporkan per layar: lolos/gagal + perbaikan token.
