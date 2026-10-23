# SDRI v1: Shrimp Disease Risk Index

> **Status: DIKUNCI v1, 23 Okt 2026.** SDRI adalah rumus skor yang menjadi "otak" software AquaSeq. v1 memakai kerangka hitung dari dokumen lab GSI (`laporan_spreadsheet_analisis_air_tambak_udang_kimia_air_qpcr.md`) dan memperbaiki cara penggabungannya berdasarkan literatur. Audit dokumen GSI: `docs/sdri-audit-gsi.md`. Hitungan di dokumen ini direproduksi oleh `scripts/sdri_v1_check.py`.
>
> Parameter bertanda **[kalibrasi]** adalah nilai awal yang akan disesuaikan dengan data pilot. Semua arketipe di sini **simulasi** sampai GSI mengonfirmasi bahwa datanya hasil uji nyata.

## 1. Prinsip

1. **Gerbang dulu, skor kemudian.** Data yang gagal kontrol ditolak, bukan dipaksakan jadi skor.
2. **Indeks, bukan probabilitas.** SDRI adalah indeks 0-100 dengan 4 kelas. Angka "% peluang wabah" baru boleh ditampilkan setelah model dilatih pada data kolam dengan hasil akhir yang diketahui (roadmap fase 2). Model prediksi penyakit udang di literatur selalu dilatih seperti itu, mis. Wang dkk. (2024), 100 kelompok data, akurasi 89%.
3. **Patogen tidak boleh "diencerkan".** Komponen patogen memakai nilai **maksimum** dari ketiga patogen.
4. **Lingkungan memperberat, bukan menggantikan.** Tanpa patogen terdeteksi, SDRI maksimum 69 (tidak pernah Kritis).
5. **Deterministik dan bisa ditelusur.** Setiap angka punya jejak: well → Ct → salinan/mL → komponen → skor. LLM hanya menyusun kalimat.
6. **Skor dan keyakinan dipisah.** Skor menjawab "seberapa berisiko", meter keyakinan menjawab "seberapa yakin hasil negatifnya".
7. **Decision support, bukan sertifikat.** Kritis berarti "segera konfirmasi pada sampel udang", bukan diagnosis resmi (wewenang Karantina/KKP).

## 2. Input

| Jalur | Data | Asal |
|---|---|---|
| qPCR (panel inti) | Ct triplikat `pirA` (AHPND), `vp28` (WSSV), `swp1` (EHP), `amoA`, `16S`; kontrol `PPC`, `NTC`, `GDC`; kurva standar STD-1..5 | Lab mitra (GSI) atau lab internal tambak; format ekspor setara RT² |
| Nanopore (16S panjang penuh) | Kelimpahan relatif genus, jumlah read, indeks Shannon | Run MinION/Flongle |
| Kimia air | Suhu, pH, DO, TAN, nitrit, H2S, TOM, alkalinitas (+ salinitas, fosfat sebagai info) | Lab/pengukuran lapangan (kelak IoT) |
| Konteks | Kolam, tanggal, DOC, sampel acuan (CTRL) kolam | Aplikasi |

## 3. Tahap 0: Gerbang validitas

Status sampel: **LULUS**, **TINJAU** (skor dihitung, diberi tanda), atau **DITOLAK** (tanpa skor).

| Cek | Aturan | Hasil bila gagal | Dasar |
|---|---|---|---|
| PPC | Ct 18,0-22,0 | > 22: **DITOLAK, uji ulang** setelah purifikasi (PVPP) atau pengenceran 1:10 | Kerangka GSI (X1); kontrol PPC RT² |
| Kurva standar | Efisiensi 90-110%, R² ≥ 0,98 | Seluruh run DITOLAK | MIQE; kerangka GSI Bagian 3 |
| NTC | Tidak teramplifikasi | Target terkait DITOLAK (kontaminasi) | MIQE 2.0 |
| 16S | Terdeteksi | DITOLAK (DNA tidak terekstrak) | Fungsi gen referensi RT² |
| Replikat | SD Ct ≤ 0,20 | Well pencilan boleh dikeluarkan dengan catatan, sampel TINJAU | Kerangka GSI (QC lab SD < 0,20) |
| Nanopore | ≥ 5.000 read lolos filter, kontrol mock sesuai | S_Micro dikosongkan, sampel TINJAU | Chen dkk. (2017) memakai 14.000 read/sampel **[kalibrasi]** |
| Kimia air | Parameter wajib terisi (suhu, pH, DO, TAN, nitrit) | S_Chem dikosongkan, sampel TINJAU | — |

**Tidak ada "koreksi inhibitor".** Dokumen GSI mengoreksi Ct patogen dengan menambahkan selisih Ct PPC. v1 tidak melakukannya, karena inhibisi tidak menunda semua target sama rata. MIQE menganjurkan pengenceran/purifikasi lalu uji ulang. UI boleh menampilkan estimasi terkoreksi hanya sebagai catatan "indikasi, perlu uji ulang", tanpa skor.

## 4. Tahap 1: Konversi

```
N_rxn      = 10^((b − Ct) / |m|)                 # dari kurva standar run (contoh GSI: m = −3,35, b = 36,6)
copies/mL  = N_rxn × (V_elusi / V_template) / V_air    # contoh GSI: × 100/5 / 250 = × 0,08
NH3-N      = TAN / (10^(pKa − pH) + 1),  pKa = 0,09018 + 2729,92 / (T°C + 273,15)    # Emerson dkk. 1975
Fold regulation amoA (konvensi RT²):
    ΔCt = Ct_amoA − Ct_16S ;  ΔΔCt = ΔCt_sampel − ΔCt_CTRL ;  FC = 2^(−ΔΔCt)
    FR = FC bila FC ≥ 1, selain itu −1/FC
```

Ct ≥ 35 atau tidak teramplifikasi dibaca **tidak terdeteksi (ND)**.

## 5. Tahap 2: Empat komponen (0-100, makin tinggi makin berisiko)

### 5.1 S_Patho (qPCR patogen)

```
per patogen p:
    ND                         → s_p = 0
    N_rxn < 10 (di bawah LLOQ) → s_p = 25      "terdeteksi, di bawah batas kuantifikasi, ulangi sampling"
    selain itu                 → s_p = interpolasi log10(copies/mL) dari [0, 3] ke [lantai_p, 100]
S_Patho = maks(s_pirA, s_vp28, s_swp1)
```

| Patogen | Lantai | Alasan |
|---|---|---|
| `vp28` WSSV | 75 (Kritis) | Satu deteksi kuantitatif WSSV di air menuntut konfirmasi segera **[kalibrasi]** |
| `pirA` AHPND | 60 (Waspada) | Gen toksin penentu AHPND |
| `swp1` EHP | 40 (Waspada) | Menekan pertumbuhan, jarang kematian massal mendadak **[kalibrasi]** |

Dasar:
- MIQE 2.0 (Bustin dkk., 2025): positif pada assay valid wajib dilaporkan positif. LOD tidak bisa di bawah 3 salinan per reaksi, dan LLOQ assay yang baik sekitar 10 salinan.
- Jangkar skala: Chen dkk. (2017) mencatat gen toksin di air tambak **10^1,6 salinan/mL saat AHPND mulai**, naik ke 10^2,9 dalam 4 hari, disertai udang mati. Di v1, 10^1,6 ≈ 40 copies/mL memberi s_pirA ≈ 81 (Kritis).
- Sinyal ini adalah penanda wabah **sedang berjalan**, bukan peringatan berhari-hari sebelumnya. Pada studi yang sama, toksin terdeteksi di lambung udang ≥ 11 hari sebelum di air.

### 5.2 S_Chem (kimia air)

Tiap parameter dinilai dengan tiga zona dari kerangka GSI (tabel X7-X12): **aman → 0**, **peringatan → 40-69**, **kritis → 70-100** (naik linear sampai titik "100"). `S_Chem = maks(nilai parameter)`, sehingga satu parameter tidak bisa mendominasi tanpa batas.

| Parameter | Aman | Peringatan | Kritis mulai | Nilai 100 pada | Dasar |
|---|---|---|---|---|---|
| NH3-N bebas (mg/L) | ≤ 0,05 | 0,05-0,10 | > 0,10 | 0,30 | GSI X7; SNI 8008:2014 maks 0,1; Phan dkk. (2022) aman 0,03 pada 20 ppt |
| Nitrit NO2-N (mg/L) | ≤ 0,5 | 0,5-1,0 | > 1,0 | 3,0 | GSI X8; SNI 8008:2014 maks 1 |
| H2S (mg/L) | ≤ 0,005 | 0,005-0,010 | > 0,010 | 0,05 | GSI X9; SNI 8008:2014 maks 0,01 |
| DO (mg/L) | ≥ 5,0 | 4,0-5,0 | < 4,0 | 2,0 | GSI X10; SNI 8008:2014 min 4 |
| TOM (mg/L) | ≤ 70 | 70-90 | > 90 | 150 | GSI X11; SNI 8008:2014 maks 90 |
| Alkalinitas (mg/L CaCO3) | ≥ 120 | 100-120 | < 100 | 60 | GSI X12 |

pH tidak dinilai terpisah karena efeknya sudah masuk lewat NH3 bebas. Ambang pH 7,5-8,5 (SNI) tetap ditampilkan di UI sebagai informasi. Alfiansah dkk. (2020) mencatat white faeces disease muncul saat pH turun ke 7,71-7,84.

### 5.3 S_Nitri (kapasitas nitrifikasi, `amoA`)

| Fold regulation `amoA` terhadap CTRL kolam | S_Nitri |
|---|---|
| ≥ +1,0 | 0 |
| −2,0 sampai < +1,0 | 40 |
| < −2,0 | 70 → 100 (linear sampai −8) |

Dasar: ambang −2,0 dari kerangka GSI (X2). `amoA` dikuantifikasi dengan qPCR di tambak udang (Wei dkk., 2020). Ambang absolutnya belum ada di literatur **[kalibrasi]**. Rasio `log10(pirA/amoA)` dari dokumen GSI **tidak dipakai**, karena membandingkan dua organisme yang tidak berhubungan dan tidak punya dasar di literatur.

### 5.4 S_Micro (komunitas mikroba, Nanopore)

```
a = interpolasi proporsi oportunis (Vibrio + Photobacterium + Alteromonas + Pseudoalteromonas, % read) dari [10%, 60%] ke [0, 100]
b = batasi(100 × (Shannon_CTRL − Shannon_sekarang) / Shannon_CTRL / 0,5, 0, 100)
S_Micro = 0,6a + 0,4b
```

Dasar:
- Alfiansah dkk. (2020): saat wabah, komunitas air didominasi Alteromonas, Pseudoalteromonas, dan Vibrio. Bakteri oportunis mencapai 60% read di feses udang pada tahap awal dan 80% pada tahap lanjut.
- Bakterioplankton vaname (*Chinese Journal of Ecology*, 2019): Shannon kolam yang kemudian sakit sudah lebih rendah **sebelum** wabah. Ini satu-satunya sinyal "sebelum gejala" yang ditemukan di literatur.
- Nanopore dan qPCR saling melengkapi. 16S panjang penuh bisa sampai spesies (Rajonhson dkk., 2024), tapi tidak bisa membaca plasmid toksin. Hanya qPCR `pirA` yang membedakan *V. parahaemolyticus* biasa dari penyebab AHPND.

## 6. Tahap 3: Gabungan dan kelas

```
E    = (0,50 × S_Chem + 0,25 × S_Nitri + 0,25 × S_Micro) / 100      # stres lingkungan 0-1
       (komponen kosong: bobotnya dikeluarkan dan sisa bobot dinormalkan ulang)
SDRI = S_Patho + (100 − S_Patho) × 0,69 × E
```

| Kelas | SDRI | Tindakan dasar (LLM boleh memperhalus kalimat, tidak boleh mengubah isi) |
|---|---|---|
| Aman | 0-19 | Lanjutkan jadwal sampling |
| Pantau | 20-39 | Periksa ulang parameter yang menyimpang dalam 2-3 hari |
| Waspada | 40-69 | Perbaiki kualitas air (aerasi, pakan, pergantian air), percepat sampling berikutnya |
| Kritis | 70-100 | Ambil sampel udang untuk konfirmasi lab, siapkan biosekuriti, hubungi pendamping |
| Ditolak | — | Uji ulang sampel; jangan tampilkan skor |

## 7. Meter keyakinan hasil negatif (terpisah dari skor)

Untuk patogen yang tidak terdeteksi:

```
P(terdeteksi | ada) = 1 − (1 − θ × (1 − (1 − p)^n))^k
θ = peluang eDNA tertangkap per sampel air, p = peluang deteksi per reaksi qPCR,
n = replikat qPCR per sampel, k = jumlah sampel air
```

Nilai awal θ = 0,45 dan p = 0,85 diambil dari studi okupansi eDNA jamur chytrid (Schmidt dkk., 2013) **[kalibrasi: belum ada angka untuk patogen udang]**. Dengan triplikat: 1 sampel ≈ 45%, 2 ≈ 70%, 4 ≈ 91%, 6 ≈ 97%. Pesan UI: "tidak terdeteksi pada 1 sampel ≠ kolam bebas". Tingley dkk. (2020) dan Schuster dkk. (2022) juga mendukung pentingnya replikasi sampel.

## 8. Sinyal tren (EWMA)

Per kolam, pada SDRI dan log10 copies/mL tiap patogen:

```
z_t = λ x_t + (1 − λ) z_{t−1},  λ = 0,3
UCL_t = μ0 + 3σ √( λ/(2−λ) × (1 − (1−λ)^{2t}) )
μ0, σ = rata-rata dan simpangan baku 3 sampel pertama siklus
```

z_t > UCL_t berarti "tren naik". Dasar: di biosurveilans, EWMA paling cepat dan paling sedikit alarm palsu dibanding CUSUM dan Hotelling (Dassanayake & French, 2019). Belum divalidasi untuk udang, jadi ditampilkan sebagai sinyal, bukan peringatan.

## 9. Uji emas: 5 arketipe GSI

Hasil `scripts/sdri_v1_check.py` (tanpa Nanopore, karena arketipe GSI tidak memuatnya):

| Sampel | Tabel GSI | S_Patho | S_Chem | S_Nitri | SDRI v1 | Kelas v1 | Sama? |
|---|---|---|---|---|---|---|---|
| CTRL (DOC 15) | Kelas 0 Normal | 0 | 0 | 0 | 0,0 | Aman | Ya |
| POND-BIO (DOC 60) | Kelas 0 Protektif | 25 (pirA 5 salinan/rxn, < LLOQ) | 52 (TOM 78) | 0 | 42,8 | Waspada | **Tidak** |
| POND-TOX (DOC 85) | Kelas 4 Kritis | 100 (pirA 1,6 × 10⁴/mL; EHP 208/mL) | 100 | 80 | 100,0 | Kritis | Ya |
| POND-REM (DOC 90) | Kelas 2 Waspada (34,80%) | 80 (pirA 31,8/mL; EHP 20,1/mL) | 0 | 0 | 80,0 | Kritis | **Tidak** |
| UNK-HUMIC | Kelas 9 Ditolak | — | — | — | — | Ditolak, uji ulang | Ya |

Perbedaan dan alasannya:
- **POND-BIO.** Ambang TOM 70-90 = "peringatan" adalah ambang GSI sendiri (X11), dan `pirA` positif di bawah batas kuantifikasi wajib dilaporkan (MIQE 2.0). Kalau tim menilai Waspada terlalu galak untuk bioflok, ubah ambang TOM untuk sistem bioflok, jangan abaikan deteksi `pirA`.
- **POND-REM.** Angka 34,80% di tabel GSI salah hitung (Z = −5,24 → 0,53%). `pirA` 31,8 copies/mL hampir sama dengan level saat wabah AHPND mulai di Chen dkk. (2017). Kritis bisa dipertanggungjawabkan. Kalau tim ingin Waspada karena tren sedang turun, itu kebijakan tren (EWMA), bukan perubahan skor.

## 10. Parameter yang dikalibrasi

| Parameter | Nilai v1 | Dikalibrasi dengan |
|---|---|---|
| Rentang PPC | 18-22 | GSI |
| Batas ND, LLOQ | Ct 35, 10 salinan/rxn | Kurva standar/LOD per assay GSI |
| Lantai patogen | 75 / 60 / 40 | Penasihat akuakultur, GSI |
| Skala log copies/mL | [0, 3] | Data pilot |
| Ambang kimia | tabel 5.2 | GSI, SNI 8008:2014 |
| Bobot E | 0,50 / 0,25 / 0,25 | Data pilot |
| Plafon lingkungan | 0,69 | Kebijakan tim |
| θ, p keyakinan | 0,45 / 0,85 | Pilot lapangan |
| Ambang kelas | 20 / 40 / 70 | Uji emas, wawancara pengguna |

Roadmap: setelah pilot menghasilkan data kolam berlabel (sakit/sehat), latih regresi logistik (struktur dari dokumen GSI) pada data itu. Saat itulah SDRI boleh menampilkan probabilitas.

## 11. Pustaka

- Alfiansah, Y. R., dkk. (2020). Structure and co-occurrence patterns of bacterial communities associated with white faeces disease outbreaks in Pacific white-leg shrimp *Penaeus vannamei* aquaculture. *Scientific Reports, 10*. https://www.nature.com/articles/s41598-020-68891-6
- Badan Standardisasi Nasional. (2014). *SNI 8008:2014 Produksi udang vaname intensif di tambak lining*. **[cek salinan resmi BSN]**
- Bustin, S. A., dkk. (2025). MIQE 2.0. *Clinical Chemistry*. http://www.gmo-qpcr-analysis.com/bustin-et-al-miqe-2.0-clinical-chemistry-2025.pdf
- Chen, W.-Y., Ng, T. H., Wu, J.-H., Chen, J.-W., & Wang, H.-C. (2017). Microbiome dynamics in a shrimp grow-out pond with possible outbreak of acute hepatopancreatic necrosis disease. *Scientific Reports, 7*. https://www.nature.com/articles/s41598-017-09923-6
- Dassanayake, S. K., & French, J. P. (2019). An algorithm for early outbreak detection in multiple data streams. *Online Journal of Public Health Informatics, 11*(1). https://doi.org/10.5210/ojphi.v11i1.9942
- GSI. (2026). *Laporan pemeriksaan laboratorium & spreadsheet analisis kualitas air tambak udang* (dokumen internal tim).
- Khiem, N. M., dkk. (2022). Use of GIS and machine learning to predict disease in shrimp farmed on the east coast of the Mekong Delta, Vietnam. *Fisheries Science*. https://link.springer.com/article/10.1007/s12562-021-01577-8
- Phan, T. C. T., dkk. (2022). Evaluation of short-term toxicity of ammonia and nitrite on the survival of whiteleg shrimp juveniles. https://doi.org/10.46989/001c.36831
- QIAGEN. (2018). *RT² qPCR Assay Data Analysis template, v5.0*.
- Rajonhson, D. M., dkk. (2024). Integrating short- and full-length 16S rRNA gene sequencing to elucidate microbiome profiles in Pacific white shrimp ponds. *Microbiology Spectrum*. https://doi.org/10.1128/spectrum.00965-24
- Schmidt, B. R., dkk. (2013). Site occupancy models in the analysis of environmental DNA presence/absence surveys. *Methods in Ecology and Evolution*. https://doi.org/10.1111/2041-210X.12052 **[cek penulis]**
- Schuster, C. J., dkk. (2022). Multi-state occupancy model estimates probability of detection of an aquatic parasite using environmental DNA. *Journal of Parasitology*. https://doi.org/10.1645/22-21
- Tingley, R., dkk. (2020). Accounting for false positive detections in occupancy studies based on environmental DNA. *Environmental DNA*. https://doi.org/10.1002/edn3.124
- Wang, Y., dkk. (2024). Construction of an early warning mathematical model for *Penaeus vannamei* AHPND based on the Deep Forest algorithm. https://doi.org/10.19663/j.issn2095-9869.20221124002
- Wei, D., dkk. (2020). Community diversity and abundance of ammonia-oxidizing archaea and bacteria in shrimp pond sediment at different culture stages. *Journal of Applied Microbiology*. https://doi.org/10.1111/jam.14846
- (2019). The bacterioplankton variation of *Litopenaeus vannamei* culture before and after the disease emergence. *Chinese Journal of Ecology*. https://www.cje.net.cn/EN/abstract/abstract20200.shtml **[cek penulis]**
