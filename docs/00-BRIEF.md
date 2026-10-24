# 00 — BRIEF: AquaSeq Web

> Sumber kebenaran untuk ide asli, tujuan, dan batasan. Prioritas: 07-RULES > instruksi user > dokumen ini > dokumen lain.

## 1. Ide Asli
> Kutipan langsung dari percakapan dengan user, 24 Okt 2026:
>
> "kamu tau aquaseq kan? ada perubahan plan, jadi bakal ada web dan mobile, web bagian landing page dan admin, paham?"
>
> "memang tak hapus, aku mau fokus bikin web, temanku yang mobile"
>
> (Siapa admin-nya) "yang punya tambak bisa ngelola teknisi tambak dll, jadi kayak bos dan karyawan"
>
> (Jawaban pilihan) login sungguhan; landing untuk calon pengguna dan juri; yang login ke web: pemilik + teknisi; hasil lab qPCR: pemilik unggah CSV; satu pemilik bisa punya beberapa lokasi tambak; tanpa alur bisnis; Next.js + shadcn; area admin pakai template Soft Op Dashboard; animasi landing pakai Lenis + Motion Primitives.
>
> "g usah mikir yang mobile karena udha di kerjain temenku, fokus web hanya web"
>
> "pokok bikin ajaa jangan terlalu berlalu mikir deadlibe, anggap santay g ada deadline"
>
> "untuk aouth itu base on BE"
>
> (Jawaban pilihan) backend dari teman tim, "BE dari sini https://github.com/Orang2-BU/AquaSeq-back.git"; backend memegang semua data, bukan hanya auth; rumus skor ikut BE (probabilitas %); endpoint yang belum ada ditulis sebagai kontrak API; web parse CSV lalu kirim ringkas; sesi JWT + cookie httpOnly.

## 2. Ringkasan
- **Masalah inti:** Pemilik tambak udang vaname yang memakai uji qPCR air mendapat angka Ct dari lab, tapi tidak punya cara mengubahnya jadi keputusan per kolam, lalu memastikan tindakannya benar-benar dikerjakan teknisi di lapangan. Web adalah antarmuka untuk backend Go tim yang menghitung skornya.
- **Untuk siapa:** Pemilik tambak intensif (bisa punya beberapa lokasi) dan teknisi tambak yang bekerja untuknya. Tamu (calon pengguna, juri) melihat landing.
- **Hasil yang diharapkan:** Web dengan landing publik dan aplikasi berlogin. Pemilik mengunggah hasil lab, melihat skor risiko SDRI per kolam, lalu memberi tugas ke teknisi. Teknisi mencatat kimia air dan melapor tugas dari HP.

## 3. Projek
| Item | Isi |
|---|---|
| Jenis | Produk (konteks GENOHACK 2026 Track 2), saklar bisnis: **Tidak** |
| Target waktu | Tanpa deadline (keputusan user 24 Okt 2026). Task dipecah ≤ ½ hari |
| Dipresentasikan | Ke juri GENOHACK `[asumsi]`. 05-PITCH tidak dibuat (deck dipegang tim) |
| Platform | Web (desktop untuk pemilik, responsif HP untuk teknisi). Aplikasi mobile native dikerjakan rekan tim, di luar dokumen ini |
| Budget & hosting | Web: Vercel Hobby `[asumsi]`. Backend Go: dikelola tim backend |
| Backend | `https://github.com/Orang2-BU/AquaSeq-back` (Go + PostgreSQL), dicek pada commit `767f56c`: 6 endpoint, belum ada auth. Kebutuhan web: `docs/09-API-KONTRAK.md` |

## 4. Tim
| Nama | Skill | Peran |
|---|---|---|
| Krisna Panca Dewa | Frontend, UI/UX | Membangun seluruh web (landing + aplikasi) |
| Rekan tim | Mobile | Aplikasi mobile (di luar scope dokumen ini) |
| Hadi (rekan tim) | Backend Go | Backend AquaSeq: auth, data, skor (di luar scope web, kontrak di 09) |
| Rekan tim | Bisnis, lab | Model bisnis, deck, data lab GSI (di luar scope web) |

## 5. Batasan & Asumsi
- **Batasan:**
  - Auth, semua data, dan skor ada di backend Go tim. Web tidak menghitung skor dan tidak memegang database sendiri.
  - Skor mengikuti backend: model logit V1-GSI, "peluang wabah %", kelas 1-4 (Aman, Waspada ringan, Waspada tinggi, Bahaya). `docs/sdri-v1.md` diarsipkan ke `docs/arsip/` (keputusan user 24 Okt 2026; risikonya di 01-PRD §2).
  - Skor bukan diagnosis resmi (wewenang Karantina/KKP).
  - Data contoh wajib berlabel SIMULASI dan tidak boleh disamarkan sebagai data nyata (aturan lomba melarang bukti palsu).
  - Data antar pemilik terpisah total. Teknisi hanya melihat kolam yang ditugaskan kepadanya (ditegakkan backend).
  - UI berbahasa Indonesia.
- **Asumsi:**
  - `[asumsi]` Teknisi bergabung lewat undangan email dari pemilik (dikirim backend), lalu membuat kata sandi sendiri.
  - `[asumsi]` Satu kolam dipegang satu teknisi. Alasan: cukup untuk alur tugas; bisa dilonggarkan nanti.
  - `[asumsi]` Peringatan WhatsApp berupa teks dari endpoint `reports/whatsapp` backend + tombol salin dan tautan `wa.me`, tanpa WhatsApp Business API.
  - `[asumsi]` Parser CSV qPCR diadaptasi dari commit `2aad8c8` ke `src/lib/csv` (web membaca CSV, backend menerima ringkasan).
  - `[asumsi]` Web dibangun dengan mock API sesuai 09-API-KONTRAK sampai endpoint backend siap.
  - `[asumsi]` Landing tanpa situs inspirasi dari user: arah visual dipilih AI (impeccable, mode Persuade). Gaya tombol: rekomendasi AI (pill tenang).
  - `[asumsi]` Akun demo pemilik dan teknisi berisi data SIMULASI supaya juri bisa langsung mencoba.

## 6. Pertanyaan Terbuka
| # | Pertanyaan | Asumsi sementara | Status |
|---|---|---|---|
| P1 | Kapan endpoint di 09-API-KONTRAK siap, dan apakah tim backend setuju bentuknya? | Web jalan dengan mock dulu | terbuka |
| P2 | Format CSV ekspor alat qPCR lab mitra (GSI) yang sebenarnya seperti apa? | Template CSV AquaSeq + langkah cocokkan kolom saat unggah | terbuka |
| P3 | Nomor WhatsApp tujuan peringatan: petambak mitra, teknisi, atau pemilik sendiri? | Diisi bebas per kolam di pengaturan tambak | terbuka |
| P4 | Rentang PPC yang benar (README backend 18-22, prd backend 25-31,5)? | Web menampilkan alasan penolakan dari backend apa adanya | terbuka (K1 di 09) |
| P5 | Apakah aplikasi mobile rekan tim memakai backend yang sama? | Ya `[asumsi]`; kontrak 09 bisa dipakai bersama | terbuka |
| P6 | Domain untuk deploy | `aquaseq.vercel.app` sementara | terbuka |
