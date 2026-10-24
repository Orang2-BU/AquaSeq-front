# 04 — TODO: Progres Build

> AI wajib memperbarui file ini setiap status task berubah. ID sama dengan 03-ARCHITECTURE.

**Legenda:** ⬜ Todo · 🟦 In Progress · ✅ Done · ⛔ Blocked · ✂️ Dipotong (scope cut)

**Target:** tanpa deadline · **Update terakhir:** 24 Okt 2026

## Task
| ID | Task | Pemilik | Prioritas | Status | Bukti verifikasi / Catatan |
|---|---|---|---|---|---|
| T1 | Scaffold Next.js + tooling + `.env.example` | Krisna | Must | ✅ | 24 Okt: Next 16.4.3; typecheck, lint, format:check, test (10), knip, build (42 rute) hijau |
| T2 | Token 08-DESIGN + starter Soft Op + nav PRD + placeholder halaman | Krisna | Must | ✅ | 24 Okt: 38 halaman placeholder + not-found + error; shell dibandingkan dengan preview starter di 1440/768 (Chrome headless) dan 375 (emulasi): drawer, Esc, fokus kembali, tanpa scroll horizontal, target ≥ 44px, console bersih. `Modal` dipisah ke `ui/modal.tsx` supaya `Icon` bisa dipakai Server Component |
| T3 | `src/lib/api`: skema Zod, klien live, pemilih `API_MODE`, tes kontrak | Krisna | Must | 🟦 | Amplop, `ApiError` (`errors.ts`), health + auth (login, register, demo, refresh, logout, me) live/mock. Endpoint lain ditambah per task. `server-only` belum dipasang (perlu izin dependency) |
| T4 | Mock API + data SIMULASI + akun demo | Krisna | Must | 🟦 | Mock auth + 2 akun demo (Hendra Kusuma pemilik 2 lokasi, Rizky Pratama teknisi), sandi di-hash scrypt, rotasi refresh token. Data kolam/sampel/tugas ditambah saat halamannya dibangun (T8+) |
| T5 | Sesi cookie httpOnly + `proxy.ts` | Krisna | Must | ✅ | 24 Okt: cookie httpOnly/SameSite=Lax/Secure(prod), refresh otomatis di proxy, pelindung rute + peran, `next` anti open redirect; 6 tes proxy + 5 tes mock auth + 6 tes cookie; `document.cookie` kosong di browser |
| T6 | Masuk, daftar, keluar, akun demo, redirect peran, akses ditolak | Krisna | Must | ✅ | 24 Okt: diuji di browser: validasi per field, sandi salah (pesan generik), demo pemilik → /dasbor, demo teknisi → /teknisi (menu teknisi), silang peran → /akses-ditolak, keluar → /masuk, daftar → /mulai. Header keamanan dasar aktif; CSP menyusul di T26 |
| T7 | Onboarding `/mulai` | Krisna | Must | ⬜ | — |
| T8 | Lokasi P27 + pemilih lokasi | Krisna | Must | ⬜ | — |
| T9 | Daftar kolam P14 + modal | Krisna | Must | ⬜ | — |
| T10 | Tim P25 + undangan P11 + bagi kolam | Krisna | Must | ⬜ | — |
| T11 | Shell teknisi + Tugas saya P36 | Krisna | Must | 🟦 | Shell + menu teknisi sudah ada (T6); halaman Tugas saya belum |
| T12 | Catat kimia air P38 | Krisna | Must | ⬜ | — |
| T13 | `src/lib/csv`: parser + ringkas Ct + tes | Krisna | Must | ⬜ | — |
| T14 | Unggah P17 langkah 1-2 + Format CSV P20 + template | Krisna | Must | ⬜ | — |
| T15 | Unggah P17 langkah 3-4: pratinjau QC, cocokkan kolam, kimia air, kirim batch | Krisna | Must | ⬜ | — |
| T16 | Detail unggahan P18 | Krisna | Must | ⬜ | — |
| T17 | Rincian skor P16 | Krisna | Must | ⬜ | — |
| T18 | Detail kolam P15 + catat hasil siklus | Krisna | Must | ⬜ | — |
| T19 | Dasbor P13 | Krisna | Must | ⬜ | — |
| T20 | Peringatan P22 | Krisna | Must | ⬜ | — |
| T21 | Modal buat tugas + Daftar tugas P23 | Krisna | Must | ⬜ | — |
| T22 | Kerjakan tugas P37 + foto | Krisna | Must | ⬜ | — |
| T23 | Detail tugas P24 + proxy foto | Krisna | Must | ⬜ | — |
| T24 | Halaman galat + penanganan 401/403/skema | Krisna | Must | ⬜ | — |
| T25 | Uji alur inti end-to-end di mock (1440 + 375) | Krisna | Must | ⬜ | — |
| T26 | Landing: token + SmoothScroll + Motion Primitives + reduced-motion | Krisna | Must | ⬜ | — |
| T27 | Landing: Section, navbar, footer, `pill-link` | Krisna | Must | ⬜ | — |
| T28 | Landing: Hero + kalkulator kolom air | Krisna | Must | ⬜ | Butuh `sdri/preview` (ada cadangan statis) |
| T29 | Landing: Masalah | Krisna | Must | ⬜ | — |
| T30 | Landing: Cara kerja | Krisna | Must | ⬜ | — |
| T31 | Landing: Kemampuan | Krisna | Must | ⬜ | — |
| T32 | Landing: Metode & batasan | Krisna | Must | ⬜ | — |
| T33 | Landing: FAQ + CTA penutup | Krisna | Must | ⬜ | — |
| T34 | Landing: `content/landing.ts`, SEO, OG, sitemap, robots | Krisna | Must | ⬜ | — |
| T35 | Landing: audit performa + a11y + impeccable | Krisna | Must | ⬜ | — |
| T36 | Sambung ke backend live per kelompok endpoint + uji alur inti | Krisna | Must | ⬜ | Menunggu endpoint backend (09-API-KONTRAK) |
| T37 | Verifikasi email, lupa sandi, atur sandi | Krisna | Should | ⬜ | — |
| T38 | Riwayat unggahan P19 + riwayat kimia air P28 + ekspor | Krisna | Should | ⬜ | — |
| T39 | Pratinjau peringatan WA | Krisna | Should | ⬜ | Endpoint sudah ada |
| T40 | Notifikasi P32 | Krisna | Should | ⬜ | — |
| T41 | Detail teknisi P26 + Kolam saya P39 | Krisna | Should | ⬜ | — |
| T42 | Laporan periode P29 | Krisna | Should | ⬜ | — |
| T43 | Log aktivitas P31 | Krisna | Should | ⬜ | — |
| T44 | Pengaturan akun P33 + tambak P34 | Krisna | Should | ⬜ | — |
| T45 | Publik: Metode P2, Kontak P3, Privasi P4 + Hasil siklus P21 | Krisna | Should | ⬜ | — |
| T46 | Tugas terlambat ditandai + notifikasi | Krisna | Could | ⬜ | Fitur kecil bernilai besar |
| T47 | "Pakai nilai kemarin" di catat air | Krisna | Could | ⬜ | Fitur kecil bernilai besar |
| T48 | Banding kolam P30 | Krisna | Could | ⬜ | Fitur kecil bernilai besar |
| T49 | Tautan kolam di teks WA + P5, P35, P43 | Krisna | Could | ⬜ | Fitur kecil bernilai besar |
| T50 | Deploy Vercel + cek alur inti di produksi | Krisna | Must | ⬜ | Butuh backend produksi |

## Alur Inti Check
| Langkah | Status | Dicek |
|---|---|---|
| 1. Siapkan tambak (daftar, lokasi, kolam, undang teknisi) | ⬜ | — |
| 2. Teknisi catat kimia air dari HP | ⬜ | — |
| 3. Unggah hasil lab, pratinjau QC, kirim batch | ⬜ | — |
| 4. Baca risiko (dasbor, peringatan, rincian skor) | ⬜ | — |
| 5. Tugaskan teknisi dari peringatan | ⬜ | — |
| 6. Teknisi lapor foto, pemilik tutup tugas | ⬜ | — |

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
| P11 | Terima undangan | Must | ⬜ | — |
| P12 | Mulai (onboarding) | Must | ⬜ | — |
| P13 | Dasbor | Must | ⬜ | — |
| P14 | Daftar kolam | Must | ⬜ | — |
| P15 | Detail kolam | Must | ⬜ | — |
| P16 | Rincian skor | Must | ⬜ | — |
| P17 | Unggah hasil lab | Must | ⬜ | — |
| P18 | Detail unggahan | Must | ⬜ | — |
| P19 | Riwayat unggahan | Should | ⬜ | — |
| P20 | Format CSV | Must | ⬜ | — |
| P21 | Hasil siklus | Should | ⬜ | — |
| P22 | Peringatan | Must | ⬜ | — |
| P23 | Daftar tugas | Must | ⬜ | — |
| P24 | Detail tugas | Must | ⬜ | — |
| P25 | Tim | Must | ⬜ | — |
| P26 | Detail teknisi | Should | ⬜ | — |
| P27 | Lokasi | Must | ⬜ | — |
| P28 | Riwayat kimia air | Should | ⬜ | — |
| P29 | Laporan | Should | ⬜ | — |
| P30 | Banding kolam | Could | ⬜ | — |
| P31 | Log aktivitas | Should | ⬜ | — |
| P32 | Notifikasi | Should | ⬜ | — |
| P33 | Pengaturan akun | Should | ⬜ | — |
| P34 | Pengaturan tambak | Should | ⬜ | — |
| P35 | Bantuan | Could | ⬜ | — |
| P36 | Tugas saya (teknisi) | Must | ⬜ | — |
| P37 | Kerjakan tugas (teknisi) | Must | ⬜ | — |
| P38 | Catat kimia air (teknisi) | Must | ⬜ | — |
| P39 | Kolam saya (teknisi) | Should | ⬜ | — |
| P40 | Tidak ditemukan | Must | ⬜ | — |
| P41 | Terjadi galat | Must | ⬜ | — |
| P42 | Akses ditolak | Must | ⬜ | — |
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
