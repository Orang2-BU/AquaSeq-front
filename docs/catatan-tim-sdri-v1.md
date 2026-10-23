# Catatan untuk Tim: SDRI v1 dikunci (23 Okt 2026)

*Siap ditempel ke grup WhatsApp.*

---

Halo tim, update soal rumus SDRI (Shrimp Disease Risk Index).

Dokumen kerangka GSI sudah dihitung ulang baris per baris. Perhitungan kimia dan qPCR-nya benar: NH3 bebas, kurva standar (efisiensi 98,84%), copies/mL, fold regulation amoA, dan gerbang PPC. Tapi tabel SDRI-nya (Bagian 7.3) punya beberapa kesalahan, jadi rumus aplikasi dikunci sebagai **SDRI v1**: kerangka GSI tetap dipakai, cara penggabungannya disesuaikan dengan literatur.

**Kesalahan di tabel GSI**
1. POND-REM tertulis 34,80%, padahal Z = −5,24 di tabel yang sama menghasilkan 0,53%.
2. POND-TOX tertulis Z = 10,80, padahal jumlah sub-skornya 15,04.
3. Satuan amoA di S_Bio tidak konsisten antarsampel.
4. Hanya pirA yang masuk rumus. WSSV dan EHP diukur tapi tidak dihitung.
5. Batas kelas 0-4 tidak didefinisikan.

**Yang berubah di v1**
- Keluaran berupa **indeks 0-100 dengan 4 kelas** (Aman, Pantau, Waspada, Kritis), bukan "% peluang wabah". Bobot logistik GSI (β0 −6,5 dst.) belum punya data latih. Model prediksi penyakit udang di jurnal selalu dilatih pada data kolam berlabel. Regresi logistik GSI masuk roadmap: dilatih setelah pilot.
- Patogen dihitung dari copies/mL, diambil yang terburuk dari pirA, vp28, dan swp1. Positif di bawah batas kuantifikasi tetap dilaporkan (MIQE 2.0).
- Rasio log10(pirA/amoA) diganti: amoA dinilai sebagai kapasitas nitrifikasi (fold regulation, ambang −2 dari GSI). Disbiosis komunitas diukur dari data Nanopore.
- Kimia air memakai ambang GSI X7-X12, tiap parameter dibatasi supaya H2S tidak mendominasi.
- Sampel inhibisi (PPC > 22) **ditolak dan diuji ulang**, tidak "dikoreksi" dengan selisih Ct PPC.

**Hasil uji emas 5 arketipe**
| Sampel | Tabel GSI | SDRI v1 |
|---|---|---|
| CTRL | Normal | Aman (0) |
| POND-BIO | Aman | **Waspada (42,8)**: TOM 78 masuk zona peringatan GSI sendiri, plus jejak pirA |
| POND-TOX | Kritis | Kritis (100) |
| POND-REM | Waspada | **Kritis (80)**: pirA 31,8 copies/mL ≈ level awal wabah AHPND di Chen dkk. 2017 |
| UNK-HUMIC | Ditolak | Ditolak, uji ulang |

**Perlu jawaban tim**
1. Data 5 arketipe ini hasil uji lab GSI yang nyata atau simulasi? Kalau simulasi, wajib dilabeli "arketipe simulasi" di deck dan aplikasi (aturan GENOHACK melarang memalsukan bukti).
2. POND-BIO: setuju Waspada, atau ambang TOM untuk sistem bioflok mau dilonggarkan?
3. POND-REM: setuju Kritis, atau mau kebijakan "tren turun pascaremediasi = turun satu kelas"?
4. Klaim "eDNA terdeteksi 3-7 hari sebelum gejala" tolong **jangan dipakai di pitch** dulu. Tidak ada sumbernya, dan Chen dkk. 2017 justru menemukan toksin AHPND muncul di air setelah muncul di udang.

Detail rumus: `docs/sdri-v1.md`. Audit dokumen GSI: `docs/sdri-audit-gsi.md`. Skrip uji: `scripts/sdri_v1_check.py`.
