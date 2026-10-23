# Riset Lomba: GENOHACK 2026

Sumber: GENOHACK 2026 Hackathon Participant Guide (15 hlm). Konteks proyek: lihat memori AquaSeq (Track 2, qPCR-only, data sintetis berlabel, Expo).

## Ringkasan guidebook
- **Inti**: hackathon 3 hari di ITB Bandung (hybrid), bukan lomba ide saja. Wajib ada **PoC berbukti** yang didemokan.
- **Track**: (1) Precision Genomic Diagnostic, (2) Genomics for Food Security & Biodiversity, (3) Biomanufacturing & Synthetic Biology for Pharmaceuticals. Tidak boleh pindah track tanpa izin panitia. **AquaSeq = Track 2.** (Guide tidak memuat subtema per track.)
- **Format PoC yang diterima**: pipeline, model prediktif, decision-support, software/dashboard, simulasi, dll. Riset/kode/dataset lama boleh dipakai, tapi **harus jelas dibedakan mana yang ada sebelum vs dibuat selama hackathon**.
- **Dilarang**: memalsukan bukti/hasil/wawancara/traksi; data rahasia tanpa izin; melanggar etika/biosafety/privasi/IP.

## Kriteria juri (guide tidak memberi bobot, semua 7 kriteria)
1. Urgensi masalah: nyata, signifikan, siapa terdampak, akibat jika dibiarkan.
2. Inovasi & kelayakan teknis: lebih baik/murah/cepat dari yang ada, sains berbasis literatur, risiko teknis diakui.
3. Kekuatan prototipe & bukti: bukti ide bisa jalan dan dibutuhkan; makin maju prototipe makin baik; asumsi diuji selama hackathon.
4. Nilai bagi pelanggan & adopsi: manfaat vs cara kerja sekarang, masuk ke alur kerja, siapa pemutus pakai/beli.
5. Komersialisasi: siapa bayar dan berapa, pasar awal realistis, unit cost, regulasi & IP.
6. Roadmap eksekusi: rencana 12 bulan, milestone, mitra & pendanaan.
7. Tim & pitch: peran jelas, mau belajar, jawaban Q&A jelas.

## Deliverable & timeline
| Kapan | Apa |
|---|---|
| Jum 23 Okt 16:00 | Checklist: konfirmasi tim/track, unggah proposal + integrity pact (proposal tidak dinilai, untuk matching mentor) |
| Jum 23 Okt 18:00-20:30 | Registrasi, opening, industry challenges & clinic, kickoff |
| Sab 24 Okt 08:00-23:00 | Slot mentoring |
| **Sab 24 Okt 16:00** | **Draf pitch deck** (untuk Pitch Clinic 16:00-17:30, boleh direvisi) |
| **Min 25 Okt 10:00** | **Submit final**: deck, prototipe/PoC, bukti teknis/ilmiah, link Colab/GitHub/dashboard |
| Min 25 Okt 10:00-12:00 | Track pitch: 6 mnt pitch+demo, 4 mnt Q&A. **Top 3 per track lanjut** |
| Min 25 Okt 13:15-17:00 | Grand Final: 7 mnt + 4 mnt Q&A, 9 finalis diumumkan di tempat |

Hadiah: Grand Winner 40 jt, Runner Up 30 jt, 3 Track Winner 20 jt, Best Impact 10 jt, Best Prototype 10 jt, Audience Choice 5 jt. Reimburse tools/komputasi/API sampai Rp3,75 jt per tim (simpan bukti bayar + penjelasan pemakaian).

## Panduan demo (penting)
Demo bagian dari pitch. Tunjukkan pengalaman inti, **jelas mana yang nyata vs simulasi/rencana**, pakai output nyata bila bisa, mudah dipahami juri non-teknis, sudah direhearsal.

## Hal yang perlu diwaspadai
- Pitch hanya 6 menit di babak track: demo harus ringkas.
- Data sintetis boleh asal dilabeli jelas; klaim lead time 1-2 minggu masih hipotesis (lihat docs/riset-bukti.md).
- Kriteria 5 (komersialisasi) dan 6 (roadmap 12 bulan) dinilai: pastikan rekan tim yang pegang bisnis menyiapkannya.
- Mentor relevan: Farania Rangkuti (pathogen genomics, Genepica/Oxford), Sabhrina Gita Aninta (biodiversity genomics), Bugi Ratno Budiantoro (BRIN, diagnostik molekuler PCR), Aditya Aryandi S (PCR/genomik), Rizki Afrizal Supriyanto (tech product), Agustina Ciptarahayu & Haikal Azhari (bisnis).

## Posisi saat ini
Langkah 3 selesai. Kategori sudah terpilih (Track 2). Masuk Langkah 4 (profil tim) / 5 (riset masalah) menyesuaikan proyek yang sudah berjalan.

---

## Update 23 Okt 2026: build ulang frontend (proposal Hackathon Deeptech)
Keputusan user: scope **frontend saja**, harus lebih **advance**, docs **detail dan telaten** (alur `project-setup`). Folder lama kosong, tidak ada kode sebelumnya yang selamat. Proposal sumber: proposal-aquaseq-format-deeptech-2026.pdf.

Perbaikan proposal yang disarankan: ref [9] Lu 2023 = diagnosis tahap AHPND dari mikrobiota USUS (86,5%), bukan dari air. Lead time 1-2 minggu = hipotesis (Chen 2017: pirAB muncul di air 11 hari SETELAH di udang).

### Riset ide fitur advance (sumber dari hasil pencarian, abstrak/halaman; belum semua dibuka penuh, tandai [cek] sebelum masuk deck)
1. **QC bertingkat ala MIQE 2.0** (Bustin et al., 2025, Clin Chem, gmo-qpcr-analysis.com/bustin-et-al-miqe-2.0-clinical-chemistry-2025.pdf): Cq dikonversi ke kuantitas terkoreksi efisiensi dengan prediction interval; LOD & LLOQ per target; kurva amplifikasi/leleh diperiksa; positif di assay valid dilaporkan sebagai ada walau Cq tinggi; LOD tidak bisa di bawah 3 salinan (Poisson), LLOQ baik ~10 salinan. Pembanding: qPCR Guru (plate heatmap, CV replikat, MAD outlier, NTC, checklist MIQE), Ampliova (jejak dari tiap bar ke well asal).
2. **Keyakinan hasil negatif (deteksi eDNA tidak sempurna)**: Tingley 2020, Environmental DNA, doi:10.1002/edn3.124 (2 sampel air x 2 qPCR cukup untuk deteksi kumulatif >0,95 pada ikan; false positive 0,0080 level sampel, 0,0039 level qPCR); Guillera-Arroita 2017, MEE, doi:10.1111/2041-210x.12743 (kesalahan di beberapa tahap, butuh data kontrol); Schuster 2022, doi:10.1645/22-21 (parasit zebrafish: deteksi 80% air statis vs 47% air mengalir). UI: meter "seberapa yakin kolam ini bebas patogen" + saran tambah replikat.
3. **Tren & peringatan dini kontrol-chart**: EWMA terbaik dibanding CUSUM/Hotelling (Dassanayake & French 2019, OJPHI, doi:10.5210/ojphi.v11i1.9942). Belum divalidasi untuk udang, jadi label "metode terpakai di biosurveilans, validasi udang = tahap berikutnya".
4. **Benchmark regional**: Kytos membandingkan tren EHP dengan basis data per negara; angka EHP outbreak aktif 10^1-10^3 salinan/mL air (aquaasiapac.com/2026/03/02, sumber sekunder [cek]).
5. **Jejak bukti**: setiap skor bisa ditelusur ke well, kontrol, dan aturan yang dipakai (mirip Ampliova).

### Peta pesaing (hasil pencarian)
- Kytos (kytos.com.vn): mikrobioma single-cell, app, indikator EHP, benchmark negara.
- Forte Biotech RAPID + Aotomatic (fortebio.tech): LAMP di lokasi, Ct semi-kuantitatif, app gratis per kolam, ada Bahasa Indonesia, "flag pola".
- Pond Care Vet (pondcarevet.com): Disease Triangle skor 0-100, dokter hewan menyetujui saran, WhatsApp.
- Celvera (celverabiosystems.com): sensor + panel 5 patogen (roadmap) + Nexus.
- Shrimply, JALA, FarmMOJO: manajemen tambak, bukan interpretasi qPCR.
Celah AquaSeq: agnostik lab/kit, interpretasi qPCR kuantitatif dengan QC transparan, keyakinan hasil, jejak bukti.

## Update 23 Okt malam: briefing tim + SDRI v0
- Briefing tim (Lucky + dosen): produk inti = **software interpretasi/keputusan** (lisensi ke lab seperti GSI & tambak berlab); jasa pendampingan = lapis 2; IoT = roadmap. Panel inti: pirA, vp28, swp1, amoA, 16S, PPC.
- Keputusan user: **qPCR dan Nanopore dua-duanya input inti**.
- Folder Drive "rumus lab" isinya template QIAGEN RT² v5.0 (bukan SDRI). Dipakai untuk aturan gerbang (PPC, Ct 35, ΔCt vs referensi).
- User minta rumus disusun dari riset: **docs/sdri-v0.md** + scripts/sdri_v0_check.py (5 arketipe ilustrasi: Aman/Kritis/Kritis/Waspada/Ditolak).
- Fitur andalan terpilih: Ruang QC + jejak bukti, meter keyakinan negatif, tren EWMA + benchmark.
- Desain menunggu referensi dari user. PRD belum di-ACC (perlu revisi peran: analis lab jadi pengguna utama).
- SDRI = Shrimp Disease Risk Index (konfirmasi user). Kerangka dari dokumen lab GSI, dokumennya belum diterima.
- 23 Okt malam: dokumen kerangka GSI diterima, diaudit (docs/sdri-audit-gsi.md). **SDRI v1 dikunci** (docs/sdri-v1.md, scripts/sdri_v1_check.py): kerangka GSI + penggabungan berbasis literatur, indeks 0-100 bukan probabilitas. Beda dengan tabel GSI: POND-BIO Waspada, POND-REM Kritis. Catatan tim siap kirim: docs/catatan-tim-sdri-v1.md.
- 23 Okt: docs/01-PRD.md ditulis (ACC). Referensi desain dari user: dribbble-style "energy app" neumorfik lembut (latar putih hangat/abu muda, kartu timbul halus, sudut sangat bulat, tipografi tipis besar untuk angka, aksen oranye) -> **diganti biru**. Pola yang dipakai: gauge setengah lingkaran (SDRI 0-100), area chart dengan pil nilai + garis vertikal (tren), bar tersegmen (meter keyakinan), area arsir (proyeksi/sinyal EWMA), diagram alir node (jejak bukti), tab pil (segmented), tabel ringkas dalam kartu. Belum ditulis ke 08-DESIGN.
- Arah desain dipertegas user: **soft UI + glassmorphism ala iPhone (kaca buram terang, gaya iOS)**, aksen biru. Implementasi: expo-blur (BlurView) untuk panel kaca di atas latar gradasi biru-putih lembut; Android fallback putih tembus pandang (blur Android eksperimental); opsi expo-glass-effect (Liquid Glass iOS 26) hanya bila tersedia, dengan fallback. Kaca hanya untuk lapisan navigasi/overlay/kartu utama, bukan tabel data padat.
- Bottom bar (referensi user): pil kaca lembut melayang, 4 item ikon+label (aktif hitam tebal, nonaktif abu) + tombol tengah bulat biru menonjol dengan glow. Kaca: React Bits **GlassSurface** (JS+CSS, sumber ditempel user 23 Okt). Komponen ini DOM/CSS/WebGL = **web saja** -> rencana `GlassSurface.web.tsx` (port TS dari sumber React Bits, tanpa prop backdrop: SVG refraksi di Chromium, frosted di Safari/Firefox) + `GlassSurface.native.tsx` (expo-glass-effect Liquid Glass di iOS 26, expo-blur di iOS lama, panel putih semi-buram di Android). Tombol tengah = aksi utama per peran (analis: Unggah run; manajer: Peringatan) - final di 08-DESIGN.
