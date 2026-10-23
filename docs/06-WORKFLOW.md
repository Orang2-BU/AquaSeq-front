# 06 — WORKFLOW: Aturan Main

> Tingkat otonomi: **Seimbang**

## 1. Alur Kerja per Task
1. Ambil task berikutnya dari 04-TODO (atau yang diminta user). Ubah status → 🟦 In Progress.
2. Baca bagian terkait di 03-ARCHITECTURE (dan `sdri-v1.md` untuk task engine, 08-DESIGN untuk task UI). Kalau ada yang ambigu → tanya dulu, jangan menebak.
3. Implementasi sesuai 02-AGENT.
4. Verifikasi sesuai 07-RULES sampai semua hijau.
5. Update 04-TODO (status, bukti verifikasi, log).
6. Commit task itu (format 02-AGENT §7, atas akun user, tanpa trailer AI).
7. Laporkan ke user dengan format laporan di 07-RULES, lalu tawarkan push.

## 2. Boleh Jalan Sendiri (tanpa izin)
- Membaca file, menjalankan test/build/lint/typecheck/knip
- Mengerjakan satu task yang sudah ada di 04-TODO sesuai rencana, sampai verifikasi hijau
- Memperbaiki galat yang muncul dari perubahan sendiri
- Menghapus dead code yang dihasilkan perubahan sendiri
- Commit lokal setelah task selesai dan verifikasi hijau
- Menambah/merapikan data seed SIMULASI yang dibutuhkan task

## 3. Wajib Minta Izin Dulu
- Menambah/menghapus/upgrade dependensi
- Mengubah rumus, parameter, atau ambang SDRI (`src/engine/params`, `docs/sdri-v1.md`)
- Mengubah tech stack, arsitektur, kontrak Repository/API, atau PRD
- Menghapus file/fitur yang bukan bagian task
- Menyimpang dari PRD atau menambah fitur di luar scope
- **Git push**, deploy (EAS Hosting), atau aksi ke layanan eksternal
- Mengubah file konfigurasi CI / env / secret
- Menulis ulang riwayat git (rebase, amend commit yang sudah di-push, force push)
- Mengubah teks yang menyangkut klaim ilmiah atau label SIMULASI

## 4. Definisi Selesai (Definition of Done)
Sebuah fitur/task dianggap **selesai** hanya jika:
- [ ] Kriteria selesai di 03-ARCHITECTURE terpenuhi
- [ ] Semua pemeriksaan wajib di 07-RULES hijau, dengan bukti
- [ ] Ada tes untuk perilaku baru / bug yang diperbaiki (tes emas tetap hijau)
- [ ] Tidak ada dead code, debug log, atau TODO liar tersisa
- [ ] Data simulasi tetap berlabel SIMULASI
- [ ] 04-TODO sudah diupdate
- [ ] Laporan sudah diberikan ke user

## 5. Git
- Commit: setiap task selesai (satu task = satu commit), format Conventional Commits Bahasa Indonesia, identitas `krizzn65 <krisnadewa6565@gmail.com>`, **tanpa** trailer `Co-Authored-By` AI.
- Push: ke `origin` (`https://github.com/Orang2-BU/AquaSeq-front.git`) **hanya setelah user setuju**.

## 6. Saat Ragu atau Buntu
- Ambiguitas requirement → tanya user, catat jawabannya di 03-ARCHITECTURE (Q&A).
- Gagal memperbaiki galat setelah beberapa pendekatan berbeda → berhenti, jelaskan apa yang sudah dicoba dan dugaan penyebabnya, minta arahan.
- Waktu mepet (deadline final Minggu 25 Okt 10:00) → prioritaskan alur demo (unggah → QC → SDRI → jejak → laporan → WA); usulkan memangkas Should/Could, jangan memangkas verifikasi.
- Konflik antar dokumen → urutan prioritas: 07-RULES > instruksi user > 01-PRD > `sdri-v1.md` (untuk rumus) > 08-DESIGN (untuk UI) > 06-WORKFLOW > 03-ARCHITECTURE > 02-AGENT.
