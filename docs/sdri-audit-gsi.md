# Audit Dokumen Kerangka GSI (SDRI)

Sumber: `laporan_spreadsheet_analisis_air_tambak_udang_kimia_air_qpcr (1).md` (versi PDF isinya sama), diterima 23 Okt 2026.
Dihitung ulang dengan `scripts/sdri_gsi_check.py`.

## Yang benar (lolos hitung ulang)

- NH3 bebas (Emerson, pKa 9,10 pada 30 °C): kelima sampel cocok sampai 4 desimal.
- Kurva standar: slope −3,35 → efisiensi 98,84%; konversi `copies/mL = 10^((36,6 − Ct)/3,35) × 20 / 250`. Cocok (mis. pirA POND-TOX = 1,60 × 10⁴ copies/mL).
- ΔCt, ΔΔCt, fold change, dan fold regulation amoA cocok dengan konvensi RT².
- Gerbang PPC (Ct 18-22, tolak bila > 22) konsisten: UNK-HUMIC (24,46) ditolak.

## Yang tidak konsisten (tabel 7.3)

| # | Masalah | Bukti |
|---|---|---|
| 1 | **POND-REM: P(Outbreak) 34,80% tidak cocok dengan Z = −5,24 di tabel yang sama.** Sigmoid(−5,24) = 0,53%. Kelas "Early Warning" sampel ini bergantung pada angka yang salah. | 1/(1+e^5,24) = 0,0053 |
| 2 | **POND-TOX: Z tertulis 10,80**, padahal jumlah sub-skor di baris yang sama −6,5 + 5,04 + 2,38 + 14,12 = **15,04**. Hitung ulang dari data mentah: w3·S_Chem = 14,56 (bukan 14,12), Z = 15,47. Kelas tetap Kritis. | |
| 3 | **Satuan amoA di S_Bio tidak konsisten.** CTRL dan POND-BIO cocok bila amoA dalam copies/mL; POND-TOX dan POND-REM tidak cocok dengan satuan mana pun. | lihat keluaran skrip |
| 4 | **Hanya pirA yang masuk rumus.** WSSV (vp28) dan EHP (swp1) diukur tapi tidak ikut Z. EHP 208 copies/mL di POND-TOX tidak memengaruhi skor. | S_qPCR = log10(pirA + 1) |
| 5 | **Batas kelas 0-4 tidak didefinisikan** dalam P(Outbreak). Hanya contoh Kelas 0, 2, 4, dan 9 (ditolak). | |
| 6 | **S_Chem tidak dibatasi.** H2S/0,01 mendominasi: H2S 0,092 mg/L saja menyumbang 6,4 poin logit. | |

## Klaim yang perlu sumber sebelum dipakai di pitch

- "Bobot standar empiris" β0 = −6,50, w1 = 1,20, w2 = 0,85, w3 = 0,70: **tidak ada sumber atau data latih**. Juri bisa bertanya "empiris dari data apa?".
- "eDNA patogen di air terdeteksi 3-7 hari sebelum gejala klinis": **tanpa sumber**, dan bertentangan dengan Chen dkk. (2017), yang menemukan toksin AHPND terdeteksi di udang ≥ 11 hari *sebelum* di air.
- Ambang copies/mL (pirA > 10³ = wabah, dst.) dan ambang fold regulation amoA < −2: tanpa sumber.

## Status data

Seluruh data bertanggal 23 Okt 2026, replikat SD 0,02-0,05, dan R² kurva standar 1,0000. Pola ini khas data simulasi. **Perlu dipastikan apakah ini hasil uji lab GSI yang nyata atau arketipe simulasi.** Aturan GENOHACK melarang memalsukan bukti atau hasil, jadi kalau ini simulasi, di deck dan aplikasi wajib dilabeli "arketipe simulasi berbasis kerangka GSI".
