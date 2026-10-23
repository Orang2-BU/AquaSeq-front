# 01 — PRD: AquaSeq (Frontend)

> North Star projek. Semua dokumen lain harus konsisten dengan dokumen ini.
> Status: ✅ ACC oleh user pada 23 Okt 2026 · Versi 1.0
> Rumus skor: `docs/sdri-v1.md` (dikunci). Konteks lomba: `riset-lomba-genohack-2026.md`.

## 1. Ringkasan

AquaSeq adalah software interpretasi hasil lab air tambak udang vaname. Software menerima data qPCR panel patogen, profil mikroba Nanopore, dan kimia air, lalu menghitung **SDRI (Shrimp Disease Risk Index)**. Hasilnya berupa kelas risiko dan rekomendasi tindakan per kolam yang bisa ditindaklanjuti. Pembeli utamanya lab (GSI) dan tambak perusahaan yang punya lab sendiri. Petambak kecil menerimanya lewat jasa pendampingan. Lingkup dokumen ini adalah **frontend** (aplikasi Expo mobile + web) untuk demo GENOHACK 2026 Track 2.

## 2. Masalah

- **Masalah utama:** Lab dan tambak berlab sudah bisa menghasilkan Ct qPCR dan angka kimia air, tetapi tidak punya lapisan yang mengubah angka itu menjadi keputusan. Software bawaan alat (mis. RT²) berhenti di fold change. Hasil negatif tunggal sering dibaca "kolam aman", padahal deteksi eDNA tidak sempurna.
- **Dampak kalau tidak diselesaikan:** Wabah AHPND, WSSV, dan EHP baru dikenali setelah kematian dimulai. AHPND bisa membunuh hingga 100% populasi kolam (proposal tim, ref. [2]).
- **Kenapa sekarang:** Uji qPCR air sudah terjangkau (Rp240 rb per run lab mitra, ≤ 40 sampel). Nanopore membuat profil komunitas mikroba bisa dilakukan rutin. Yang belum ada adalah interpretasinya.
- **Alternatif saat ini:** Membaca Ct mentah atau laporan lab dengan sendirinya. Aplikasi manajemen tambak (JALA, FarmMOJO) hanya mencatat parameter fisik-kimia. Forte Biotech RAPID/Aotomatic memberi hasil LAMP per kolam, dan Kytos memberi indikator mikrobioma. Tidak satu pun menggabungkan qPCR kuantitatif, mikrobioma, dan kimia air dengan QC yang terbuka.

## 3. Target Pengguna & Pasar

| Persona | Deskripsi | Kebutuhan utama | Pain point |
|---|---|---|---|
| **Analis lab** (pengguna utama, pembeli lisensi) | Analis di lab mitra (GSI) atau lab internal tambak perusahaan | Mengolah run cepat, yakin data valid, menerbitkan laporan bernilai tambah | Mengolah di spreadsheet, QC manual, laporan berupa angka yang tidak dipahami pelanggan |
| **Manajer tambak / pendamping** | Manajer teknis tambak berlab, pendamping jasa AquaSeq | Tahu kolam mana yang harus ditangani hari ini dan apa tindakannya | Laporan lab datang terlambat dan teknis, tidak ada tren per kolam |
| **Petambak** (tanpa login) | Petambak kecil di klaster Jember-Banyuwangi-Situbondo | Pesan singkat: kolam aman atau tidak, harus berbuat apa | Tidak punya lab, tidak paham Ct |

- **Target pasar:** Lab molekuler akuakultur dan tambak udang intensif di sabuk Banyuwangi-Situbondo-Jember (pasar awal). Petambak kecil dijangkau lewat jasa pendampingan (lapis 2).
- **Pembeda:** Tidak terikat kit atau lab tertentu. QC terbuka (gerbang PPC menolak data jelek). Setiap skor bisa ditelusur sampai ke well. Ada meter keyakinan hasil negatif. Menggabungkan qPCR, Nanopore, dan kimia air.

## 4. Solusi & Value Proposition

Analis mengunggah run qPCR dan profil Nanopore, lalu mengisi kimia air. AquaSeq memeriksa kualitas data dulu: run atau sampel yang gagal kontrol ditolak dengan alasan yang jelas. Untuk sampel yang lolos, AquaSeq menghitung jumlah salinan patogen per mL, amonia bebas, dan kapasitas nitrifikasi, lalu menggabungkannya menjadi SDRI 0-100 dengan kelas Aman, Pantau, Waspada, atau Kritis. Analis meninjau dan menerbitkan laporan. Manajer tambak melihat semua kolam, trennya, dan tindakan yang disarankan. Petambak menerima ringkasan lewat WhatsApp.

Satu kalimat jualan: **"Kami mengubah hasil lab menjadi skor risiko dan rekomendasi tindakan."**

## 5. Fitur Inti (MVP)

| # | Fitur | Prioritas | User story | Kriteria terima |
|---|---|---|---|---|
| F1 | Unggah run qPCR + plate map | Must | Sebagai analis, saya ingin mengunggah CSV ekspor alat agar tidak menyalin manual | CSV contoh terbaca; kolom tidak dikenal/hilang memberi pesan galat per baris; plate 96-well tampil sesuai posisi |
| F2 | Ruang QC run | Must | Sebagai analis, saya ingin melihat kualitas run sebelum skor dihitung agar tidak menerbitkan hasil salah | Kurva standar (slope, efisiensi, R²), status PPC/NTC/GDC, SD replikat, heatmap Ct; run gagal kurva standar ditolak |
| F3 | Keluarkan well pencilan | Must | Sebagai analis, saya ingin mengeluarkan well pencilan dengan alasan agar replikat valid | Well ditandai, alasan wajib diisi, tercatat di jejak bukti, skor dihitung ulang |
| F4 | Input kimia air + NH3 otomatis | Must | Sebagai analis, saya ingin mengisi kimia air dan langsung melihat NH3 bebas | Validasi rentang input; NH3-N cocok dengan rumus Emerson sampai 4 desimal |
| F5 | Unggah profil Nanopore | Must | Sebagai analis, saya ingin memasukkan tabel kelimpahan agar komponen mikroba ikut dihitung | Tabel genus + read terbaca; read < 5.000 menandai sampel TINJAU |
| F6 | Mesin SDRI v1 | Must | Sebagai analis, saya ingin skor dihitung otomatis sesuai rumus terkunci | Hasil 5 arketipe GSI sama dengan `scripts/sdri_v1_check.py` (selisih ≤ 0,1) |
| F7 | Jejak bukti per skor | Must | Sebagai analis atau juri, saya ingin menelusur skor sampai ke well | Dari skor bisa diketuk ke komponen → target → copies/mL → Ct → well, beserta aturan yang dipakai |
| F8 | Meter keyakinan hasil negatif | Must | Sebagai manajer, saya ingin tahu seberapa yakin "tidak terdeteksi" | Tampil per patogen ND; menyarankan jumlah sampel untuk ≥ 95% |
| F9 | Tinjau & terbitkan laporan | Must | Sebagai analis, saya ingin menyetujui hasil sebelum sampai ke pelanggan | Laporan berstatus Draf → Diterbitkan; sampel DITOLAK tidak bisa diterbitkan |
| F10 | Dasbor kolam + tren EWMA | Must | Sebagai manajer, saya ingin melihat semua kolam dan trennya | Kartu kolam diurutkan dari risiko tertinggi; grafik SDRI dengan batas kontrol; label "sinyal tren" |
| F11 | Pratinjau peringatan WhatsApp | Must | Sebagai manajer, saya ingin meneruskan ringkasan ke petambak | Teks Bahasa Indonesia ≤ 600 karakter dengan kelas, alasan, tindakan; tombol salin |
| F12 | Label simulasi | Must | Sebagai tim, kami wajib jujur soal data contoh | Semua data seed menampilkan badge "SIMULASI"; tidak bisa disembunyikan |
| F13 | Banding antarkolam | Should | Sebagai manajer, saya ingin membandingkan kolam | Tabel/grafik 2-4 kolam berdampingan |
| F14 | Riwayat run | Should | Sebagai analis, saya ingin membuka run lama | Daftar run dengan filter status |
| F15 | Panduan format CSV | Should | Sebagai analis, saya ingin tahu format yang diterima | Halaman format + unduh contoh |
| F16 | Ekspor laporan PDF | Could | Sebagai analis, saya ingin mengirim PDF | PDF berisi skor, komponen, jejak ringkas |
| F17 | Simulator skenario | Could | Sebagai presenter, saya ingin menggeser input untuk demo | Geser parameter, skor berubah langsung, berlabel SIMULASI |

## 5b. Peta Halaman

**Peran:** Analis lab · Manajer tambak · (Petambak: hanya menerima pesan, tanpa halaman) · **Total:** 24 halaman — Must 18 · Should 4 · Could 2

| # | Halaman | Rute | Peran | Tugas | Aksi utama | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|
| P1 | Pilih peran (demo) | `/` | Semua | Masuk sebagai analis atau manajer | Pilih peran | — | Must |
| P2 | Antrian run | `/lab` | Analis | Lihat run yang menunggu QC/terbit | Buka run, unggah baru | kosong, loading | Must |
| P3 | Unggah run qPCR | `/lab/run/baru` | Analis | Unggah CSV + metadata run | Unggah, validasi | galat parsing per baris | Must |
| P4 | Ruang QC run | `/lab/run/[runId]` | Analis | Ringkasan QC + heatmap plate | Lanjut ke sampel, tolak run | run ditolak | Must |
| P5 | Kurva standar | `/lab/run/[runId]/kurva` | Analis | Slope, efisiensi, R² | — | gagal efisiensi | Must |
| P6 | Detail well | `/lab/run/[runId]/well/[wellId]` | Analis | Ct replikat, Tm, status | Keluarkan well (dengan alasan) | well dikeluarkan | Must |
| P7 | Daftar sampel run | `/lab/run/[runId]/sampel` | Analis | Status gerbang tiap sampel | Buka sampel | DITOLAK, TINJAU | Must |
| P8 | Input kimia air | `/lab/sampel/[sampleId]/kimia` | Analis | Isi parameter kimia | Simpan | nilai di luar rentang | Must |
| P9 | Unggah Nanopore | `/lab/sampel/[sampleId]/nanopore` | Analis | Unggah tabel kelimpahan | Unggah | read kurang | Must |
| P10 | Hasil SDRI sampel | `/lab/sampel/[sampleId]` | Analis | Skor, komponen, kelas, rekomendasi | Buka jejak, ke laporan | DITOLAK (tanpa skor) | Must |
| P11 | Jejak bukti | `/lab/sampel/[sampleId]/jejak` | Analis, Manajer | Telusur skor → well | — | — | Must |
| P12 | Tinjau & terbitkan laporan | `/lab/sampel/[sampleId]/laporan` | Analis | Periksa lalu terbitkan | Terbitkan | sudah terbit | Must |
| P13 | Riwayat run | `/lab/riwayat` | Analis | Run lama | Filter | kosong | Should |
| P14 | Panduan format | `/lab/format` | Analis | Format CSV & contoh | Unduh contoh | — | Should |
| P15 | Beranda tambak | `/tambak` | Manajer | Semua kolam, urut risiko | Buka kolam | kosong | Must |
| P16 | Detail kolam | `/tambak/kolam/[pondId]` | Manajer | SDRI terkini, tren EWMA, keyakinan | Buka patogen, laporan | belum ada sampel | Must |
| P17 | Detail patogen | `/tambak/kolam/[pondId]/patogen/[target]` | Manajer | Riwayat copies/mL + keyakinan negatif | — | ND semua | Must |
| P18 | Pusat peringatan | `/tambak/peringatan` | Manajer | Peringatan aktif semua kolam | Buka, tandai ditangani | kosong | Must |
| P19 | Laporan sampel (baca) | `/tambak/laporan/[reportId]` | Manajer | Laporan terbit | Pratinjau WA | — | Must |
| P20 | Pratinjau WhatsApp | `/tambak/laporan/[reportId]/wa` | Manajer | Teks siap kirim | Salin teks | — | Must |
| P21 | Banding kolam | `/tambak/banding` | Manajer | 2-4 kolam berdampingan | Pilih kolam | kurang dari 2 kolam | Should |
| P22 | Pengaturan | `/pengaturan` | Semua | Peran, tampilan, tentang data | Ganti peran | — | Should |
| P23 | Tentang & disclaimer | `/tentang` | Semua | Status data simulasi, batas klaim, decision support | — | — | Must |
| P24 | Simulator skenario | `/simulator` | Semua | Geser input, lihat SDRI | Reset | — | Could |
| — | Ekspor PDF | (aksi di P12/P19) | Analis, Manajer | — | Unduh | — | Could |
| — | Tidak ditemukan / offline | `+not-found`, banner | Semua | Pesan galat | Kembali | — | Must |

**Navigasi:** menu utama analis: Antrian · Riwayat · Format · Pengaturan. Menu utama manajer: Beranda · Peringatan · Banding · Pengaturan. Hanya lewat tautan: detail run/well/sampel/jejak/laporan/WA.

## 6. Di Luar Scope (MVP)

- Backend, database, dan login asli (hanya kontrak JSON + mock; backend dikerjakan Hadi, lihat dokumen backend tim).
- Pengiriman WhatsApp sungguhan (hanya pratinjau + salin).
- Angka "probabilitas wabah %" (menunggu model dilatih pada data pilot).
- Target RNA (IMNV, TSV, YHV, CMNV) dan modul RT-qPCR.
- Membaca file mentah alat (RDML, FASTQ). Input berupa tabel CSV hasil ekspor.
- IoT kit (cukup satu slide roadmap).
- Sertifikat bebas penyakit (wewenang Karantina/KKP).
- Pembayaran, multi-organisasi, peran admin.

## 7. Batasan & Keputusan Awal

- **Platform:** Mobile (Android/iOS via Expo Go) + web (ekspor statis) dari satu kode.
- **Tech stack:** Expo (React Native) + TypeScript. Detail final di 03-ARCHITECTURE.
- **Waktu pengembangan:** 23 Okt 2026 malam s.d. Minggu 25 Okt 2026 10:00 (final). Draf deck Sabtu 24 Okt 16:00. Prioritas alur demo: unggah → QC → SDRI → jejak → laporan → WA.
- **Tim:** frontend 1 orang (Krisna). AI/skor Aditya, backend Hadi, data Yassir, bisnis Lucky, ketua Pak Aji.
- **Budget / hosting:** Rp0 (hosting web statis gratis). Reimburse tools GENOHACK s.d. Rp3,75 jt per tim.
- **Model bisnis:** Lisensi software ke lab dan tambak berlab (bentuk lisensi diputuskan tim); jasa pendampingan petambak kecil (lapis 2).
- **Bahasa UI:** Bahasa Indonesia.
- **Desain:** Mengikuti referensi dari user (menyusul, ditulis di `docs/08-DESIGN.md`).

## 8. Metrik Sukses

- Demo 6 menit berjalan tanpa galat: unggah run → QC → SDRI → jejak → laporan → WA, di HP dan web.
- Uji emas: 5 arketipe GSI menghasilkan SDRI yang sama dengan `scripts/sdri_v1_check.py`.
- Semua tes mesin SDRI lulus; typecheck dan lint hijau.
- Juri non-teknis bisa menyebut kelas risiko dan tindakan dari layar detail kolam dalam < 10 detik.
- 100% data contoh berlabel SIMULASI.

## 9. Risiko & Asumsi

| Risiko / Asumsi | Dampak | Mitigasi |
|---|---|---|
| Data 5 arketipe GSI mungkin simulasi | Melanggar aturan "dilarang memalsukan bukti" bila diklaim nyata | Label SIMULASI wajib; konfirmasi ke tim |
| Ambang SDRI belum tervalidasi | Juri mempertanyakan dasar angka | Setiap ambang punya sumber atau tanda [kalibrasi]; roadmap pilot |
| Format ekspor alat lab berbeda-beda | Unggahan gagal | Format CSV AquaSeq sendiri + panduan + pesan galat jelas |
| Waktu ±36 jam untuk 24 halaman | Fitur tidak selesai | Kerjakan Must alur demo dulu; Should/Could hanya jika sempat |
| Desain belum ada | Pengerjaan UI tertunda | Bangun mesin, data, dan struktur halaman dulu; tema dipasang begitu 08-DESIGN siap |
| Kurva amplifikasi mentah tidak tersedia di data GSI (hanya Ct) | Ruang QC kurang visual | Tampilkan kurva standar + heatmap Ct; kurva amplifikasi hanya bila data fluoresensi ada |
| Hasil v1 berbeda dengan tabel GSI di 2 sampel | Perdebatan di tim | Dicatat di `docs/catatan-tim-sdri-v1.md`; keputusan tim dicatat sebagai versi parameter |

## 10. Riwayat Perubahan

| Tanggal | Versi | Perubahan |
|---|---|---|
| 23 Okt 2026 | 1.0 | Dokumen awal: frontend, analis lab sebagai pengguna utama, qPCR + Nanopore + kimia air, SDRI v1 |
