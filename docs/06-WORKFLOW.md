# 06 — WORKFLOW: Aturan Main

> Prinsip: alur inti selalu bisa jalan. Lebih baik sedikit fitur yang stabil daripada banyak fitur setengah jadi.

## 1. Alur per Task
1. Ambil task dari 04-TODO sesuai prioritas → 🟦.
2. Baca bagian terkait di 03-ARCHITECTURE (dan 01-PRD §5 untuk halaman, 08-DESIGN untuk UI); ambigu → tanya, jangan menebak.
3. Implementasi minimal yang memenuhi kriteria selesai.
4. Verifikasi sesuai 07-RULES, termasuk cek alur inti.
5. Update 04-TODO; laporkan. Commit hanya bila user mengizinkan.

## 2. Boleh Jalan Sendiri
- Mengerjakan task di 04-TODO, menjalankan semua pemeriksaan, memperbaiki error dari perubahan sendiri
- Menambah/memperbaiki data SIMULASI di mock API untuk pengujian
- Menambah endpoint ke mock yang sudah tercantum di 09-API-KONTRAK

## 3. Wajib Minta Izin
- Menambah dependency baru atau mengganti stack/database
- Mengubah kontrak API (`docs/09-API-KONTRAK.md`) yang sudah disepakati dengan tim backend
- Menampilkan skor dengan cara yang mengubah artinya (label kelas, ambang, satuan) di luar `src/lib/risk.ts`
- Fitur atau halaman di luar 01-PRD (peta halaman §5), atau mengubah alur inti
- Commit, push, deploy, memanggil backend produksi untuk menulis data, aksi ke layanan eksternal, menghapus data
- Memotong scope (✂️): usulkan dengan alasan, user memutuskan

## 4. Prioritas
- Kerjakan task sesuai urutan 04-TODO; alur inti dulu (T1-T25), landing (T26-T35), lalu pelengkap.
- Kalau task jauh lebih rumit dari perkiraan, usulkan versi lebih sederhana yang tetap memenuhi alur inti.

## 5. Definition of Done
- [ ] Kriteria selesai di 03-ARCHITECTURE terpenuhi
- [ ] Semua pemeriksaan di 07-RULES hijau dengan bukti
- [ ] Alur inti masih jalan end-to-end
- [ ] Tidak ada dead code / debug log tersisa
- [ ] 04-TODO diupdate, laporan diberikan

## 6. Prioritas Saat Konflik
07-RULES > instruksi user > 00-BRIEF > 01-PRD > 08-DESIGN (untuk UI) > 06-WORKFLOW > 03-ARCHITECTURE > 02-AGENT
(Kontrak API: `docs/09-API-KONTRAK.md` setara 03-ARCHITECTURE; perubahan kontrak disepakati dengan tim backend.)
