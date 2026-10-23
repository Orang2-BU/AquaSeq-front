# 04 — TODO: Pelacak Progres

> "Memori" projek. AI wajib memperbarui file ini setiap kali status task berubah.
> ID task sama dengan 03-ARCHITECTURE.

**Legenda status:** ⬜ Todo · 🟦 In Progress · 🟨 Review · ✅ Done · ⛔ Blocked

## Ringkasan
| Milestone | Total | ✅ Done | Progres |
|---|---|---|---|
| M1 — Fondasi | 3 | 3 | 100% |
| M2 — Mesin SDRI v1 | 5 | 5 | 100% |
| M3 — Data | 3 | 3 | 100% |
| M4 — UI dasar | 4 | 4 | 100% |
| M5 — Alur analis | 7 | 7 | 100% |
| M6 — Alur manajer | 4 | 4 | 100% |
| M7 — Rilis demo | 4 | 1 | 25% |
| M8 — Should / Could | 4 | 3 | 75% |

## Task
| ID | Task | Status | Bukti verifikasi / Catatan | Update |
|---|---|---|---|---|
| T1.1 | Proyek Expo SDK 58 + TS strict, Router, ESLint, Prettier, jest-expo, knip, skrip verify | ✅ Done | expo 58.0.17, RN 0.88, TS 6; tsc/lint/prettier/knip/test hijau; `expo export -p web` OK; dev server web jalan. Expo Go belum diuji (butuh HP) | 24 Okt 2026 |
| T1.2 | Kerangka semua rute PRD + layout per peran | ✅ Done | 24 rute + `+not-found`; dicek di web: `/`, `/lab/run/RUN-23OKT/well/C6`, `/tambak/kolam/B-03/patogen/pirA`, rute salah → "Halaman tidak ditemukan" | 24 Okt 2026 |
| T1.3 | Pasang dependensi stack | ✅ Done | Query, AsyncStorage, papaparse, svg, blur, glass-effect, linear-gradient, lucide, expo-font + @expo-google-fonts/figtree, expo-clipboard. Zustand tidak dipakai (state UI cukup di komponen) | 24 Okt 2026 |
| T2.1 | `params/sdri-v1.ts` + tipe hasil dan trace | ✅ Done | `src/engine/params/sdri-v1.ts`, `types.ts` (`Traced`) | 24 Okt 2026 |
| T2.2 | Konversi: kurva standar, copies/mL, NH3, fold regulation | ✅ Done | Tes: efisiensi 98,84%, pirA POND-TOX 1,60e4/mL, NH3 4 arketipe cocok 4 desimal | 24 Okt 2026 |
| T2.3 | Gerbang QC | ✅ Done | Tes: UNK-HUMIC DITOLAK "PPC 24,46 > 22", 16S, NTC, SD replikat, Nanopore, kimia kosong, run gagal kurva | 24 Okt 2026 |
| T2.4 | Komponen SDRI + gabungan + kelas (tes emas) | ✅ Done | Tes emas 5/5 cocok `sdri_v1_check.py` (0 / 42,8 / 100 / 80 / DITOLAK); S_Micro + normalisasi bobot teruji | 24 Okt 2026 |
| T2.5 | Keyakinan negatif + EWMA + trace | ✅ Done | Tes 45/70/91/97%, saran 6 sampel; EWMA sinyal pada deret naik; trace per komponen. Trace sampai well dirakit di T5.6 | 24 Okt 2026 |
| T3.1 | Tipe + Repository + hook Query | ✅ Done | `src/data/types.ts`, `repository.ts` (kontrak), `queries.ts` (hook + mutasi); dipakai semua layar | 24 Okt 2026 |
| T3.2 | Seed SIMULASI + MockRepository (AsyncStorage) | ✅ Done | Seed 1 tambak, 5 kolam, 8 run mingguan; run terbaru = 5 arketipe persis (SDRI 100/80/42,8/0/DITOLAK di aplikasi); reset di Pengaturan; 11 tes repository | 24 Okt 2026 |
| T3.3 | Parser CSV qPCR + Nanopore + file contoh | ✅ Done | Parser qPCR (2 bagian) + Nanopore, galat per baris; contoh CSV via tombol "Pakai contoh" dan halaman Format; 7 tes | 24 Okt 2026 |
| T4.1 | Token tema + primitif (Figtree lokal, ekspor dtcg) | ✅ Done | `src/ui/theme/tokens.ts` dari export dtcg; primitif di `src/ui/primitives.tsx`; badge SIMULASI tidak bisa disembunyikan | 24 Okt 2026 |
| T4.2 | GlassSurface (web + native) | ✅ Done | Komponen `Glass`: web backdrop-filter, iOS 26 GlassView, iOS lama BlurView, Android/reduce-transparency panel pekat. Blur Android dimezis belum (fallback pekat sesuai dokumen) | 24 Okt 2026 |
| T4.3 | Nav pil kaca + FAB teal solid | ✅ Done | `src/ui/BottomNav.tsx`, FAB teal solid + badge peringatan, label aksesibilitas. Rail desktop ≥ 1200 belum: bar tetap di tengah lebar maks 520 | 24 Okt 2026 |
| T4.4 | Grafik SVG (WaterColumnCard, AreaTrend, SegmentBar, PlateHeatmap, StandardCurve, TraceFlow) | ✅ Done | `src/ui/charts.tsx` (TrendChart + EWMA, PlateHeatmap, StandardCurveChart) + WaterColumnCard di `features/shared.tsx`; semua punya ringkasan teks | 24 Okt 2026 |
| T5.1 | P1 pilih peran + P2 antrian run | ✅ Done | P1 pilih peran, P2 hub analis (alur sampel, pintasan, kartu Lanjutkan) | 24 Okt 2026 |
| T5.2 | P3 unggah run | ✅ Done | P3 tempel CSV / pakai contoh, galat per baris, pemetaan sampel → kolam + acuan | 24 Okt 2026 |
| T5.3 | P4 ruang QC + P5 kurva standar | ✅ Done | P4 heatmap plate + status NTC/kurva, P5 grafik kurva standar; dicek di web | 24 Okt 2026 |
| T5.4 | P6 detail well + keluarkan well | ✅ Done | P6 alasan wajib (pilihan cepat + isian), pratinjau SDRI sebelum → sesudah, tercatat di jejak | 24 Okt 2026 |
| T5.5 | P7 sampel + P8 kimia + P9 Nanopore | ✅ Done | P7 daftar sampel, P8 kimia (validasi rentang, NH3 langsung), P9 Nanopore (< 5.000 read → Tinjau) | 24 Okt 2026 |
| T5.6 | P10 hasil SDRI + P11 jejak bukti | ✅ Done | P10 kartu kolom air + tindakan + per target; P11 jejak SDRI → komponen → target → well (ketuk ke P6) | 24 Okt 2026 |
| T5.7 | P12 tinjau & terbitkan | ✅ Done | P12 Draf → Terbit; DITOLAK tidak bisa terbit (tes repository) | 24 Okt 2026 |
| T6.1 | P15 beranda kolam | ✅ Done | P15 peta kolam urut risiko, pintasan, kartu tindakan; dicek di web 400 px | 24 Okt 2026 |
| T6.2 | P16 detail kolam + P17 detail patogen | ✅ Done | P16 tren SDRI + EWMA "sinyal tren", keyakinan negatif per patogen ND; P17 riwayat copies/mL | 24 Okt 2026 |
| T6.3 | P18 pusat peringatan | ✅ Done | P18 peringatan Waspada/Kritis, tandai ditangani | 24 Okt 2026 |
| T6.4 | P19 laporan + P20 pratinjau WA | ✅ Done | P19 laporan, P20 pesan ≤ 600 karakter (tes), tombol salin (expo-clipboard) | 24 Okt 2026 |
| T7.1 | P23 tentang & disclaimer + error/offline | ✅ Done | P23 tentang & batas klaim, +not-found. Banner offline belum (data lokal, tidak butuh jaringan) | 24 Okt 2026 |
| T7.2 | Audit a11y + kontras + reduced motion | ⬜ Todo | — | 23 Okt 2026 |
| T7.3 | Ekspor web + EAS Hosting + uji Expo Go | ⬜ Todo | — | 23 Okt 2026 |
| T7.4 | Naskah demo 6 menit | ⬜ Todo | — | 23 Okt 2026 |
| T8.1 | P13 riwayat run + P14 panduan format | ✅ Done | P13 riwayat dengan filter, P14 format + salin CSV contoh | 24 Okt 2026 |
| T8.2 | P21 banding kolam + P22 pengaturan | ✅ Done | P21 banding 2-4 kolam, P22 peran + reset demo | 24 Okt 2026 |
| T8.3 | P24 simulator skenario | ✅ Done | P24 simulator stepper, SDRI dihitung engine langsung, label SIMULASI | 24 Okt 2026 |
| T8.4 | Ekspor PDF laporan | ⬜ Todo | — | 23 Okt 2026 |

## Issue / Bug
| ID | Deskripsi | Status | Terkait task | Catatan |
|---|---|---|---|---|
| B1 | Tabel SDRI dokumen GSI salah hitung (POND-REM, POND-TOX) | ⬜ Todo | T2.4 | Dilaporkan ke tim lewat `docs/catatan-tim-sdri-v1.md`; v1 tidak bergantung pada angka itu |

## Log Perubahan
| Tanggal | Task | Ringkasan perubahan |
|---|---|---|
| 24 Okt 2026 | T1.3, T3, T4, T5, T6, T7.1, T8.1-T8.3 | Data layer + seed + parser, UI kaca v2.1, 25 layar; 57 tes; dicek di web
| 24 Okt 2026 | T1.1, T1.2, T2.1-T2.5 | Proyek Expo SDK 58 dibuat, 24 rute placeholder, mesin SDRI v1 (34 tes, cakupan engine 99%, tes emas 5/5) |
| 24 Okt 2026 | T4.1-T4.4 | 08-DESIGN v2.1 (Iconly Pro, kaca terang) di-ACC; blokir T4.x dicabut; Gauge diganti WaterColumnCard; 6 file desain v1 dihapus |
| 23 Okt 2026 | — | TODO dibuat dari 03-ARCHITECTURE |
