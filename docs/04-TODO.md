# 04 — TODO: Pelacak Progres

> "Memori" projek. AI wajib memperbarui file ini setiap kali status task berubah.
> ID task sama dengan 03-ARCHITECTURE.

**Legenda status:** ⬜ Todo · 🟦 In Progress · 🟨 Review · ✅ Done · ⛔ Blocked

## Ringkasan
| Milestone | Total | ✅ Done | Progres |
|---|---|---|---|
| M1 — Fondasi | 3 | 2 | 67% |
| M2 — Mesin SDRI v1 | 5 | 5 | 100% |
| M3 — Data | 3 | 0 | 0% |
| M4 — UI dasar | 4 | 0 | 0% |
| M5 — Alur analis | 7 | 0 | 0% |
| M6 — Alur manajer | 4 | 0 | 0% |
| M7 — Rilis demo | 4 | 0 | 0% |
| M8 — Should / Could | 4 | 0 | 0% |

## Task
| ID | Task | Status | Bukti verifikasi / Catatan | Update |
|---|---|---|---|---|
| T1.1 | Proyek Expo SDK 58 + TS strict, Router, ESLint, Prettier, jest-expo, knip, skrip verify | ✅ Done | expo 58.0.17, RN 0.88, TS 6; tsc/lint/prettier/knip/test hijau; `expo export -p web` OK; dev server web jalan. Expo Go belum diuji (butuh HP) | 24 Okt 2026 |
| T1.2 | Kerangka semua rute PRD + layout per peran | ✅ Done | 24 rute + `+not-found`; dicek di web: `/`, `/lab/run/RUN-23OKT/well/C6`, `/tambak/kolam/B-03/patogen/pirA`, rute salah → "Halaman tidak ditemukan" | 24 Okt 2026 |
| T1.3 | Pasang dependensi stack | 🟦 In Progress | Expo Router + web sudah. Sisanya (Query, Zustand, papaparse, svg, blur, glass-effect, linear-gradient, lucide, AsyncStorage, expo-font) dipasang saat pertama dipakai, karena knip menolak dependensi tak terpakai | 24 Okt 2026 |
| T2.1 | `params/sdri-v1.ts` + tipe hasil dan trace | ✅ Done | `src/engine/params/sdri-v1.ts`, `types.ts` (`Traced`) | 24 Okt 2026 |
| T2.2 | Konversi: kurva standar, copies/mL, NH3, fold regulation | ✅ Done | Tes: efisiensi 98,84%, pirA POND-TOX 1,60e4/mL, NH3 4 arketipe cocok 4 desimal | 24 Okt 2026 |
| T2.3 | Gerbang QC | ✅ Done | Tes: UNK-HUMIC DITOLAK "PPC 24,46 > 22", 16S, NTC, SD replikat, Nanopore, kimia kosong, run gagal kurva | 24 Okt 2026 |
| T2.4 | Komponen SDRI + gabungan + kelas (tes emas) | ✅ Done | Tes emas 5/5 cocok `sdri_v1_check.py` (0 / 42,8 / 100 / 80 / DITOLAK); S_Micro + normalisasi bobot teruji | 24 Okt 2026 |
| T2.5 | Keyakinan negatif + EWMA + trace | ✅ Done | Tes 45/70/91/97%, saran 6 sampel; EWMA sinyal pada deret naik; trace per komponen. Trace sampai well dirakit di T5.6 | 24 Okt 2026 |
| T3.1 | Tipe + Repository + hook Query | ⬜ Todo | — | 23 Okt 2026 |
| T3.2 | Seed SIMULASI + MockRepository (AsyncStorage) | ⬜ Todo | — | 23 Okt 2026 |
| T3.3 | Parser CSV qPCR + Nanopore + file contoh | ⬜ Todo | — | 23 Okt 2026 |
| T4.1 | Token tema + primitif (Figtree lokal, ekspor dtcg) | ⬜ Todo | 08-DESIGN v2.1 ACC; menunggu T1.1 | 24 Okt 2026 |
| T4.2 | GlassSurface (web + native) | ⬜ Todo | 08-DESIGN v2.1 ACC; cek lisensi React Bits | 24 Okt 2026 |
| T4.3 | Nav pil kaca + FAB teal solid | ⬜ Todo | 08-DESIGN v2.1 ACC | 24 Okt 2026 |
| T4.4 | Grafik SVG (WaterColumnCard, AreaTrend, SegmentBar, PlateHeatmap, StandardCurve, TraceFlow) | ⬜ Todo | 08-DESIGN v2.1 ACC | 24 Okt 2026 |
| T5.1 | P1 pilih peran + P2 antrian run | ⬜ Todo | — | 23 Okt 2026 |
| T5.2 | P3 unggah run | ⬜ Todo | — | 23 Okt 2026 |
| T5.3 | P4 ruang QC + P5 kurva standar | ⬜ Todo | — | 23 Okt 2026 |
| T5.4 | P6 detail well + keluarkan well | ⬜ Todo | — | 23 Okt 2026 |
| T5.5 | P7 sampel + P8 kimia + P9 Nanopore | ⬜ Todo | — | 23 Okt 2026 |
| T5.6 | P10 hasil SDRI + P11 jejak bukti | ⬜ Todo | — | 23 Okt 2026 |
| T5.7 | P12 tinjau & terbitkan | ⬜ Todo | — | 23 Okt 2026 |
| T6.1 | P15 beranda kolam | ⬜ Todo | — | 23 Okt 2026 |
| T6.2 | P16 detail kolam + P17 detail patogen | ⬜ Todo | — | 23 Okt 2026 |
| T6.3 | P18 pusat peringatan | ⬜ Todo | — | 23 Okt 2026 |
| T6.4 | P19 laporan + P20 pratinjau WA | ⬜ Todo | — | 23 Okt 2026 |
| T7.1 | P23 tentang & disclaimer + error/offline | ⬜ Todo | — | 23 Okt 2026 |
| T7.2 | Audit a11y + kontras + reduced motion | ⬜ Todo | — | 23 Okt 2026 |
| T7.3 | Ekspor web + EAS Hosting + uji Expo Go | ⬜ Todo | — | 23 Okt 2026 |
| T7.4 | Naskah demo 6 menit | ⬜ Todo | — | 23 Okt 2026 |
| T8.1 | P13 riwayat run + P14 panduan format | ⬜ Todo | — | 23 Okt 2026 |
| T8.2 | P21 banding kolam + P22 pengaturan | ⬜ Todo | — | 23 Okt 2026 |
| T8.3 | P24 simulator skenario | ⬜ Todo | — | 23 Okt 2026 |
| T8.4 | Ekspor PDF laporan | ⬜ Todo | — | 23 Okt 2026 |

## Issue / Bug
| ID | Deskripsi | Status | Terkait task | Catatan |
|---|---|---|---|---|
| B1 | Tabel SDRI dokumen GSI salah hitung (POND-REM, POND-TOX) | ⬜ Todo | T2.4 | Dilaporkan ke tim lewat `docs/catatan-tim-sdri-v1.md`; v1 tidak bergantung pada angka itu |

## Log Perubahan
| Tanggal | Task | Ringkasan perubahan |
|---|---|---|
| 24 Okt 2026 | T1.1, T1.2, T2.1-T2.5 | Proyek Expo SDK 58 dibuat, 24 rute placeholder, mesin SDRI v1 (34 tes, cakupan engine 99%, tes emas 5/5) |
| 24 Okt 2026 | T4.1-T4.4 | 08-DESIGN v2.1 (Iconly Pro, kaca terang) di-ACC; blokir T4.x dicabut; Gauge diganti WaterColumnCard; 6 file desain v1 dihapus |
| 23 Okt 2026 | — | TODO dibuat dari 03-ARCHITECTURE |
