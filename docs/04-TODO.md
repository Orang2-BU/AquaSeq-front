# 04 — TODO: Progres Build

> AI wajib memperbarui file ini setiap status task berubah. ID sama dengan 03-ARCHITECTURE.

**Legenda:** ⬜ Todo · 🟦 In Progress · ✅ Done · ⛔ Blocked · ✂️ Dipotong (scope cut)

**Target:** tanpa deadline · **Update terakhir:** 24 Okt 2026

## Task
| ID | Task | Pemilik | Prioritas | Status | Bukti verifikasi / Catatan |
|---|---|---|---|---|---|
| T1 | Scaffold Next.js + tooling + `.env.example` | Krisna | Must | ✅ | 24 Okt: Next 16.4.3; typecheck, lint, format:check, test (10), knip, build (42 rute) hijau |
| T2 | Token 08-DESIGN + starter Soft Op + nav PRD + placeholder halaman | Krisna | Must | ✅ | 24 Okt: 38 halaman placeholder + not-found + error; shell dibandingkan dengan preview starter di 1440/768 (Chrome headless) dan 375 (emulasi): drawer, Esc, fokus kembali, tanpa scroll horizontal, target ≥ 44px, console bersih. `Modal` dipisah ke `ui/modal.tsx` supaya `Icon` bisa dipakai Server Component |
| T3 | `src/lib/api`: skema Zod, klien live, pemilih `API_MODE`, tes kontrak | Krisna | Must | 🟦 | Semua endpoint halaman pemilik di kontrak 09 (lokasi, kolam, anggota, undangan, sampel, batch, kimia air, peringatan, tugas, siklus, notifikasi, aktivitas, WA, foto); live + mock. Endpoint teknisi (water-logs POST, laporan tugas) menyusul. `server-only` belum dipasang (perlu izin dependency) |
| T4 | Mock API + data SIMULASI + akun demo | Krisna | Must | 🟦 | `src/lib/api/mock/`: 18 kolam dengan riwayat sampel mingguan (6 titik, sesuai tren), 12 batch + well, kimia air 7 hari, 6 tugas (1 dilaporkan dengan foto, 1 terlambat, 1 diminta ulang), notifikasi, aktivitas, siklus, undangan demo. Skor dari tabel seed/arketipe, bukan rumus |
| T5 | Sesi cookie httpOnly + `proxy.ts` | Krisna | Must | ✅ | 24 Okt: cookie httpOnly/SameSite=Lax/Secure(prod), refresh otomatis di proxy, pelindung rute + peran, `next` anti open redirect; 6 tes proxy + 5 tes mock auth + 6 tes cookie; `document.cookie` kosong di browser |
| T6 | Masuk, daftar, keluar, akun demo, redirect peran, akses ditolak | Krisna | Must | ✅ | 24 Okt: diuji di browser: validasi per field, sandi salah (pesan generik), demo pemilik → /dasbor, demo teknisi → /teknisi (menu teknisi), silang peran → /akses-ditolak, keluar → /masuk, daftar → /mulai. Header keamanan dasar aktif; CSP menyusul di T26 |
| T7 | Onboarding `/mulai` | Krisna | Must | ✅ | 24 Okt: diuji di browser dengan akun baru: lokasi → 4 kolam (pratinjau jumlah, huruf besar otomatis) → undang teknisi dengan 2 kolam (form dikosongkan, bisa undang lagi) → dasbor. Lokasi baru langsung jadi lokasi aktif |
| T8 | Lokasi P27 + pemilih lokasi | Krisna | Must | ✅ | 24 Okt: kartu lokasi (kolam, teknisi, berisiko), tambah/ubah (modal), arsipkan (konfirmasi + konsekuensi), menu ⋯ (fokus, Esc), ganti lokasi aktif dari kartu dan top bar (cookie `aq_farm`). Badge simulasi dan notifikasi contoh hanya untuk lokasi simulasi |
| T9 | Daftar kolam P14 + modal | Krisna | Must | ✅ | 24 Okt: tabel urut risiko tertinggi, filter kelas (`?kelas=`, dengan jumlah) + teknisi (`?teknisi=`), kartu di < 768px, tambah kolam (form onboarding dipakai ulang), ubah, arsipkan. `src/lib/risk.ts` + `RiskBadge` |
| T10 | Tim P25 + undangan P11 + bagi kolam | Krisna | Must | ✅ | 24 Okt: tabel teknisi + undangan tertunda (badge Kedaluwarsa), undang (form onboarding dipakai ulang), bagi kolam (PUT atomik), nonaktifkan/aktifkan, batalkan undangan. P11: token tidak berlaku/kedaluwarsa/valid → akun teknisi → `/teknisi` |
| T11 | Shell teknisi + Tugas saya P36 | Krisna | Must | ✅ | 24 Okt (mock): beranda teknisi + Tugas saya (urut jatuh tempo, terlambat ditandai); diuji di browser dengan akun teknisi |
| T12 | Catat kimia air P38 | Krisna | Must | ✅ | 24 Okt (mock): form per kolam, desimal koma diterima, galat per field; 7 tes mock teknisi |
| T13 | `src/lib/csv`: parser + ringkas Ct + tes | Krisna | Must | ✅ | 24 Okt (mock): `src/lib/csv/qpcr.ts` tanpa dependency: koma/titik koma, deteksi kolom alat (CFX96, QuantStudio), galat per baris, ringkas Ct, kontrol, kurva standar; 8 tes |
| T14 | Unggah P17 langkah 1-2 + Format CSV P20 + template | Krisna | Must | ✅ | 24 Okt (mock): langkah pilih file (seret/pilih, maks 2 MB) + cocokkan kolom manual; P20 + template dan contoh terisi di `public/templates` |
| T15 | Unggah P17 langkah 3-4: pratinjau QC, cocokkan kolam, kimia air, kirim batch | Krisna | Must | ✅ | 24 Okt (mock): pratinjau QC (pipeline kontrol, plate, keluarkan well + alasan), cocokkan kolam otomatis dari kode, kimia air dari catatan terakhir (bisa diubah), CSV diparse ulang di server lalu `POST /samples/batch` |
| T16 | Detail unggahan P18 | Krisna | Must | ✅ | 24 Okt (mock): hasil per sampel urut risiko, plate dari `meta.wells`, metrik, state semua ditolak |
| T17 | Rincian skor P16 | Krisna | Must | ✅ | 24 Okt (mock): rantai peluang → Z → subskor → fitur (Ct, kopi/mL, kimia) → well + plate; versi model, alasan ditolak, tombol tugaskan uji ulang |
| T18 | Detail kolam P15 + catat hasil siklus | Krisna | Must | ✅ | 24 Okt (mock): skor 48px + badge, sorotan rekomendasi + pesan tren, grafik riwayat SVG (ambang kelas, sampel ditolak), tab Sampel/Kimia air/Tugas, modal ubah/catat siklus/WA/arsip |
| T19 | Dasbor P13 | Krisna | Must | ✅ | 24 Okt (mock): 4 metrik, kartu sorotan navy kolam paling berisiko (buat tugas/lihat tugas), kolam dipantau, tugas jatuh tempo, rata-rata peluang per lokasi |
| T20 | Peringatan P22 | Krisna | Must | ✅ | 24 Okt (mock): filter jenis, urut paling mendesak, buat tugas (terisi), pratinjau WA, tandai ditangani |
| T21 | Modal buat tugas + Daftar tugas P23 | Krisna | Must | ✅ | 24 Okt (mock): modal bersama (kolam + teknisi pemegang terisi, instruksi dari `recommendation`, jatuh tempo wajib); P23 filter status/teknisi, terlambat ditandai |
| T22 | Kerjakan tugas P37 + foto | Krisna | Must | ✅ | 24 Okt (mock): laporan catatan + angka ukur + foto, status berubah jadi dilaporkan; diuji di browser |
| T23 | Detail tugas P24 + proxy foto | Krisna | Must | ✅ | 24 Okt (mock): instruksi, laporan (catatan, angka ukur, foto lewat `/api/files/[id]` dengan CSP), riwayat status, tutup/minta ulang (catatan wajib)/ubah/batalkan |
| T24 | Halaman galat + penanganan 401/403/skema | Krisna | Must | 🟦 | 24 Okt: 404 dalam shell (`(app)/not-found.tsx`), 403 → `/akses-ditolak` (P42 dibangun) lewat `loadEntity`; 401 lewat `withSession`. Uji skema rusak di mode live belum |
| T25 | Uji alur inti end-to-end di mock (1440 + 375) | Krisna | Must | ⬜ | — |
| T26 | Landing: token + SmoothScroll + Motion Primitives + reduced-motion | Krisna | Must | ✅ | 24 Okt: token landing gaya referensi user (Agroton, versi biru) di 08-DESIGN, lint 0/0, theme diekspor; Lenis + `Reveal` mati saat reduced-motion |
| T27 | Landing: Section, navbar, footer, `pill-link` | Krisna | Must | ✅ | 24 Okt: navbar (tautan Masuk + Hubungi tim) + drawer, footer, `pill-link` pill gelap dengan lingkaran panah |
| T28 | Landing: Hero + kalkulator kolom air | Krisna | Must | ✅ | 24 Okt: hero kartu foto tambak + kartu kecil alur sampel. Kalkulator ✂️ (keputusan user) |
| T29 | Landing: Masalah | Krisna | Must | ✂️ | Diganti kalimat pernyataan + blok gelap (kerugian AHPND, misi) sesuai layout referensi |
| T30 | Landing: Cara kerja | Krisna | Must | ✅ | 24 Okt: 4 kartu bergambar (sampel air, sekuensing lab mitra, olah AquaSeq, qPCR mingguan) |
| T31 | Landing: Kemampuan | Krisna | Must | ✅ | 24 Okt: kartu foto lebar (sekuensing untuk menemukan, qPCR untuk memantau) + grid alasan (bahasa Indonesia, bukan diagnosis, lab mitra) |
| T32 | Landing: Metode & batasan | Krisna | Must | ✂️ | Diganti section Dasar ilmiah (3 rujukan DOI dari proposal) + kartu Bukan diagnosis resmi; halaman Metode P2 tetap di T45 |
| T33 | Landing: FAQ + CTA penutup | Krisna | Must | ✅ | FAQ dan CTA penutup ✂️ mengikuti layout referensi; CTA Hubungi tim ada di navbar, hero, kartu langkah, dan alasan. Nomor WA belum ada (sementara ke /kontak) |
| T34 | Landing: `content/landing.ts`, SEO, OG, sitemap, robots | Krisna | Must | ✅ | 24 Okt: semua teks di `content/landing.ts`; metadataBase + OG, `sitemap.ts`, `robots.ts` |
| T35 | Landing: audit performa + a11y + impeccable | Krisna | Must | 🟦 | 24 Okt: dicek di browser 1440 dan 375 (tanpa scroll horizontal, kontras dari lint token). Lighthouse belum. Foto dari Pexels di public/landing/ |
| T36 | Sambung ke backend live per kelompok endpoint + uji alur inti | Krisna | Must | ⬜ | Menunggu endpoint backend (09-API-KONTRAK) |
| T37 | Verifikasi email, lupa sandi, atur sandi | Krisna | Should | ⬜ | — |
| T38 | Riwayat unggahan P19 + riwayat kimia air P28 + ekspor | Krisna | Should | ✅ | 24 Okt (mock): P19 filter bulan; P28 filter kolam, penanda di luar rentang acuan; ekspor CSV kolam dan kimia air (aman injeksi rumus) |
| T39 | Pratinjau peringatan WA | Krisna | Should | ✅ | 24 Okt (mock): modal WA di P15 dan P22: teks dari `/reports/whatsapp`, salin, buka `wa.me` ke nomor kolam |
| T40 | Notifikasi P32 | Krisna | Should | ✅ | 24 Okt (mock): P32 + lonceng top bar memakai data notifikasi (belum dibaca, buka = tandai dibaca) |
| T41 | Detail teknisi P26 + Kolam saya P39 | Krisna | Should | ✅ | 24 Okt: P26 detail teknisi (kolam, tugas terbuka, terlambat, catatan kimia air, beri tugas, bagi kolam); P39 Kolam saya (mock) |
| T42 | Laporan periode P29 | Krisna | Should | ✅ | 24 Okt (mock): periode 7/30/90 hari, sebaran kelas, kolam perlu perhatian, unggahan, tugas selesai/terlambat, cetak |
| T43 | Log aktivitas P31 | Krisna | Should | ✅ | 24 Okt (mock): kronologi per hari, filter pelaku/jenis, tautan ke entitas |
| T44 | Pengaturan akun P33 + tambak P34 | Krisna | Should | ✅ | 24 Okt (mock): P33 profil + ganti sandi (usulan endpoint baru di kontrak), P34 nomor WA per kolam |
| T45 | Publik: Metode P2, Kontak P3, Privasi P4 + Hasil siklus P21 | Krisna | Should | 🟦 | 24 Okt: P21 hasil siklus ✅. P2, P3, P4 (publik) belum |
| T46 | Tugas terlambat ditandai + notifikasi | Krisna | Could | ⬜ | Fitur kecil bernilai besar |
| T47 | "Pakai nilai kemarin" di catat air | Krisna | Could | ⬜ | Fitur kecil bernilai besar |
| T48 | Banding kolam P30 | Krisna | Could | ⬜ | Fitur kecil bernilai besar |
| T49 | Tautan kolam di teks WA + P5, P35, P43 | Krisna | Could | ⬜ | Fitur kecil bernilai besar |
| T50 | Deploy Vercel + cek alur inti di produksi | Krisna | Must | ⬜ | Butuh backend produksi |

## Konsep AI backend (izin user)
| ID | Task | Status | Bukti / catatan |
|---|---|---|---|
| T51 | Ingesti CSV/PDF/DOCX/XLSX + QC terstruktur | ⛔ | API multipart `api.documents.ingest` + validasi 4MB + tes kontrak; tampilan UI ditahan menunggu persetujuan desain (freeze) |
| T52 | Potensi penyakit + bukti + mitigasi SOP | ⛔ | API/skema/tes siap; UI baru tidak ditampilkan, menunggu izin desain |
| T53 | Insight anomali + prakiraan + kasus mirip | ⛔ | API `api.ponds.insights` + skema Zod + mock Lapis B + tes; chart visual ditahan menunggu izin (freeze) |
| T54 | Belajar/kalibrasi versi model teraudit | ⛔ | API `api.models.list` dan `promote` + mock V1 beku & V2 kandidat; UI promosi ditahan menunggu izin (freeze) |
| T55 | Uji integrasi live opt-in | ⛔ | `vitest.live.config.ts` + `tests/live/core.live.test.ts` via `npm run test:live`; bukti RED jujur ECONNREFUSED saat backend mati |

## Alur Inti Check
| Langkah | Status | Dicek |
|---|---|---|
| 1. Siapkan tambak (daftar, lokasi, kolam, undang teknisi) | ✅ | 24 Okt mock (T7-T10) |
| 2. Teknisi catat kimia air dari HP | ⬜ | — |
| 3. Unggah hasil lab, pratinjau QC, kirim batch | ✅ | 24 Okt mock: contoh terisi 7 sampel, 1 well dikeluarkan, batch terkirim |
| 4. Baca risiko (dasbor, peringatan, rincian skor) | ✅ | 24 Okt mock |
| 5. Tugaskan teknisi dari peringatan | ✅ | 24 Okt mock: tugas A2 dari peringatan, notifikasi ke teknisi |
| 6. Teknisi lapor foto, pemilik tutup tugas | 🟦 | 24 Okt mock: sisi pemilik (nilai laporan B3, tutup, minta ulang) ✅; sisi teknisi (P37) belum |

## Halaman
> Dari 01-PRD §5. Selesai = halaman jalan dengan data (mock lalu live) + semua state (kosong, loading, error) + responsif.

| # | Halaman | Prioritas | Status | Catatan |
|---|---|---|---|---|
| P1 | Landing | Must | ⬜ | 7 section |
| P2 | Metode | Should | ⬜ | — |
| P3 | Kontak | Should | ⬜ | — |
| P4 | Kebijakan privasi | Should | ⬜ | — |
| P5 | Syarat layanan | Could | ⬜ | — |
| P6 | Masuk | Must | ✅ | — |
| P7 | Daftar pemilik | Must | ✅ | — |
| P8 | Verifikasi email | Should | ⬜ | — |
| P9 | Lupa sandi | Should | ⬜ | — |
| P10 | Atur sandi baru | Should | ⬜ | — |
| P11 | Terima undangan | Must | ✅ | — |
| P12 | Mulai (onboarding) | Must | ✅ | — |
| P13 | Dasbor | Must | ✅ | — |
| P14 | Daftar kolam | Must | ✅ | — |
| P15 | Detail kolam | Must | ✅ | — |
| P16 | Rincian skor | Must | ✅ | — |
| P17 | Unggah hasil lab | Must | ✅ | — |
| P18 | Detail unggahan | Must | ✅ | — |
| P19 | Riwayat unggahan | Should | ✅ | — |
| P20 | Format CSV | Must | ✅ | — |
| P21 | Hasil siklus | Should | ✅ | — |
| P22 | Peringatan | Must | ✅ | — |
| P23 | Daftar tugas | Must | ✅ | — |
| P24 | Detail tugas | Must | ✅ | — |
| P25 | Tim | Must | ✅ | — |
| P26 | Detail teknisi | Should | ✅ | — |
| P27 | Lokasi | Must | ✅ | — |
| P28 | Riwayat kimia air | Should | ✅ | — |
| P29 | Laporan | Should | ✅ | — |
| P30 | Banding kolam | Could | ⬜ | — |
| P31 | Log aktivitas | Should | ✅ | — |
| P32 | Notifikasi | Should | ✅ | — |
| P33 | Pengaturan akun | Should | ✅ | — |
| P34 | Pengaturan tambak | Should | ✅ | — |
| P35 | Bantuan | Could | ⬜ | — |
| P36 | Tugas saya (teknisi) | Must | ✅ | — |
| P37 | Kerjakan tugas (teknisi) | Must | ✅ | — |
| P38 | Catat kimia air (teknisi) | Must | ✅ | — |
| P39 | Kolam saya (teknisi) | Should | ✅ | — |
| P40 | Tidak ditemukan | Must | ⬜ | — |
| P41 | Terjadi galat | Must | ⬜ | — |
| P42 | Akses ditolak | Must | ✅ | — |
| P43 | Pemeliharaan | Could | ⬜ | — |
| P44 | Beranda peran (redirect) | Must | ✅ | Di proxy.ts |

## Scope Cut
| Fitur/task | Alasan dipotong | Tanggal |
|---|---|---|
| Profil Nanopore, meter keyakinan hasil negatif, sinyal EWMA, mesin skor di web | Backend tidak mendukung; skor ikut backend (keputusan user) | 24 Okt 2026 |

## Log
| Tanggal | Ringkasan |
|---|---|
| 24 Okt 2026 | TODO dibuat (setup-project-00, versi web) |
| 24 Okt 2026 | Disusun ulang: auth + data lewat backend Go, Supabase dihapus, mock API dulu |
| 24 Okt 2026 | Setup projek: T1 ✅, T2 ✅, T3 sebagian. Go belum terpasang di laptop (backend lokal belum bisa dijalankan) |
| 24 Okt 2026 | Milestone Akun: T5 ✅, T6 ✅, T3/T4 lanjut. Catatan: jangan jalankan `npm run build` saat dev server hidup (berbagi `.next`, memicu reload berantai) |
| 24 Okt 2026 | T7 ✅, T8 ✅. Diperbaiki: siklus redirect saat backend menolak token yang masih tersimpan (sekarang lewat `/api/sesi/berakhir`), notifikasi contoh tampil di akun nyata, peringatan validasi `Date.now()` di dev |
| 24 Okt 2026 | T9 ✅, T10 ✅ (P11, P14, P25). Kontrak 09: `Pond.trend`, `PUT /farms/{id}/members/{user_id}/ponds`, kode `EXPIRED`, pertanyaan K7 (penomoran `risk_class` backend 0/1/2/4/9) |
| 24 Okt 2026 | Semua halaman pemilik dibangun di mock: P13, P15-P24, P26, P28, P29, P31-P34, P42 + 404 dalam shell. Mock dipecah ke `src/lib/api/mock/` (riwayat sampel mingguan, batch + well, kimia air, tugas, peringatan, notifikasi, aktivitas, siklus). Kontrak 09: usulan `PATCH /auth/me`, `POST /auth/password`, tren `MODERATE_INCREASE`, K8. Belum: halaman teknisi (T11, T12, T22, P39), publik, landing, P30 banding, P35 bantuan |
| 24 Okt 2026 | Halaman teknisi di mock (T11, T12, T22, P39). Landing dibangun ulang dari nol mengikuti referensi user (Agroton) versi biru, isi sesuai proposal GenoHack (DNA air kolam): hero foto, pernyataan, blok dampak, 4 langkah, teknologi, alasan, dasar ilmiah; kalkulator, Masalah, FAQ dipotong |
