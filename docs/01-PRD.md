# 01 — PRD: AquaSeq Web

> Apa yang dibangun, untuk siapa, dan kenapa. Turunan dari 00-BRIEF. Status: ✅ ACC 24 Okt 2026 · Versi 1.2
> Saklar bisnis: Tidak. Bagian bisnis (§3, §3b) sengaja tidak ada.
> Arsitektur kecerdasan 3 lapis: Lapis A deterministik (SDRI V1 logit + gerbang kontrol kualitas), Lapis B belajar (anomali trajektori & kalibrasi versi model), Lapis C bahasa (ingesti dokumen multi-format & narasi tindakan WhatsApp). Seluruhnya berjalan di backend Go tim; web tidak menghitung skor, tidak memanggil LLM langsung, dan tidak ada chatbot bebas. Kontrak: `docs/09-API-KONTRAK.md`.

## 1. Pitch Satu Kalimat
Untuk pemilik tambak udang vaname yang sudah menguji air tapi kebingungan membaca kadar jejak patogen dan memastikan teknisinya bertindak, AquaSeq adalah web pemantau kolam yang mengubah data eDNA air tambak menjadi skor risiko SDRI, potensi penyakit yang berpotensi muncul beserta tindakan secepatnya untuk teknisi, tidak seperti aplikasi pencatat tambak biasa karena skor deterministik transparan hingga well dan AI backend belajar dari riwayat siklus tambak.

## 2. Masalah, Pengguna, dan Nilai
- **Pengguna utama & pekerjaannya:**
  - **Pemilik tambak (bos).** Memiliki 1 atau lebih lokasi tambak intensif, masing-masing 6-20 kolam. Pekerjaannya: tahu kolam mana yang harus ditangani hari ini, menyuruh orang yang tepat, dan memastikan perintahnya dikerjakan. Kendala: data eDNA dari sampel air datang sebagai format lab yang rumit, perintah ke teknisi lewat telepon atau chat WA yang tenggelam, dan tidak ada catatan apakah tindakan berhasil.
  - **Teknisi tambak (karyawan).** Memegang beberapa kolam. Pekerjaannya: mengukur kimia air harian, mengambil sampel air untuk lab, dan menjalankan tindakan (ganti air, aerasi, kurangi pakan, siphon). Kendala: instruksi lisan mudah lupa, catatan di kertas, tidak tahu kenapa harus melakukan sesuatu.
- **Stakeholder lain:**
  - **Tamu landing:** calon pemilik tambak, dan juri GENOHACK yang mencari metode serta bukti.
  - **Lab mitra (GSI):** mengirim file data eDNA air tambak ke pemilik. Tidak login di versi ini.
  - **Tim backend:** menyediakan API sesuai `docs/09-API-KONTRAK.md`.
- **Value proposition:**
  - **Sebelum:** Pemilik menerima laporan dari lab, membaca sendiri atau mengabaikannya. Perintah ke teknisi lewat telepon, tanpa jejak.
  - **Bagaimana:** Pemilik mengunggah data eDNA air tambak (CSV/PDF/DOCX/XLSX). Web menampilkan pratinjau QC, backend menolak sampel yang gagal kontrol kualitas dan menghitung peluang wabah per kolam serta potensi penyakit + mitigasi. Kolam Waspada tinggi/Bahaya jadi peringatan, lalu pemilik mengubahnya jadi tugas untuk teknisi. Teknisi melapor dengan foto dan angka ukur.
  - **Sesudah:** Dalam satu layar pemilik melihat kolam yang berisiko beserta alasannya, siapa yang menangani, dan apakah sudah selesai. Waktu dari data lab masuk sampai tugas diberikan ditargetkan < 30 menit `[asumsi]`.
- **Alternatif saat ini & kelemahannya:**
  - Membaca kadar mentah atau laporan PDF lab: angka tanpa interpretasi.
  - JALA, FarmMOJO (manajemen tambak): mencatat parameter fisik-kimia dan budidaya, tidak mengolah jejak patogen molekuler.
  - Forte Biotech RAPID, Kytos: hasil uji per kolam atau indikator mikrobioma, tanpa alur tugas ke teknisi.
  - Grup WhatsApp tambak: perintah tenggelam, tidak ada status selesai.
- **Ukuran keberhasilan (non-uang):**
  - Alur inti berjalan end-to-end dengan akun demo tanpa bantuan (diuji 3 orang di luar tim) `[asumsi]`.
  - 100% skor yang tampil bisa dirinci: peluang → Z → subskor (S_qPCR, S_Bio, S_Chem) → fitur → well.
  - 100% sampel `REJECTED_*` dari backend tampil sebagai "Ditolak" dengan alasan, tanpa angka peluang.
  - Galat parsing CSV ditunjukkan per baris; file dokumen lain diperiksa oleh endpoint ingesti dokumen multi-format.
  - Tidak ada data pemilik lain yang bisa dibuka lewat web (backend mengembalikan 403, web menampilkan "Akses ditolak").
- **Catatan risiko & tata kelola model:** web menampilkan skor versi backend (Lapis A: SDRI V1 deterministik dengan koefisien awal GSI). Lapis B belajar menghasilkan versi model baru terverifikasi (kandidat V2) yang diaudit, bukan model yang mengubah diri diam-diam. Data simulasi/sintetik selalu diberi label "Data simulasi" atau "Data sintetik". Landing tidak mengklaim akurasi lapangan sebelum tervalidasi pada data hasil siklus.

## 4. Alur Inti
> Perjalanan dari awal sampai nilai utama tercapai. Hanya fitur di jalur ini yang Must.

1. **Siapkan tambak.** Pemilik mendaftar, membuat lokasi dan kolam, lalu mengundang teknisi lewat email dan membagi kolam.
2. **Ukur dan ambil sampel.** Teknisi mencatat kimia air kolam dari HP dan mengambil sampel air untuk lab.
3. **Unggah hasil lab.** Pemilik mengunggah CSV qPCR. Web menampilkan pratinjau QC (plate, kontrol, galat per baris), pemilik mencocokkan sampel ke kolam, kimia air terisi dari catatan teknisi terakhir, lalu batch dikirim ke backend.
4. **Baca risiko.** Backend mengembalikan peluang wabah dan kelas per sampel. Dasbor mengurutkan kolam dari risiko tertinggi, dan peringatan menunjukkan alasan serta tren.
5. **Tugaskan.** Dari peringatan atau detail kolam, pemilik membuat tugas untuk teknisi pemegang kolam. Instruksi terisi dari rekomendasi backend.
6. **Lapor dan tutup.** Teknisi mengerjakan tugas, melapor dengan foto dan catatan, lalu pemilik menutup tugas atau meminta ulang. Sampling berikutnya memperlihatkan apakah risiko turun.

## 5. Peta Halaman
> Disusun dari: peran, entitas data, alur inti + pendukung, halaman standar, dan back-office pemilik. Satu halaman, satu tugas.

**Peran:** tamu · pemilik · teknisi · **Total:** 44 halaman — Must 24 · Should 16 · Could 4
(Modal dihitung sebagai bagian halaman induknya dan dicatat di kolom Aksi.)

### 5a. Daftar halaman

**Publik (area landing)**

| # | Halaman | Rute | Peran | Tugas | Info utama (besar) | Info pendukung (kecil) | Aksi utama | Aksi sekunder | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 | Landing | `/` | tamu | Meyakinkan pengunjung bahwa AquaSeq mengubah hasil lab jadi tindakan | Lihat section di bawah tabel | — | Coba demo | Masuk, Hubungi tim | reduced-motion: tanpa animasi; backend mati: kalkulator pakai contoh tersimpan | Must |
| P2 | Metode | `/metode` | tamu | Menjelaskan cara skor dihitung dan batasannya (untuk juri) | Gerbang PPC, subskor, model logit, kelas | Versi model, kalibrasi dari hasil siklus | Coba demo | — | — | Should |
| P3 | Kontak | `/kontak` | tamu | Menghubungi tim | Email + WhatsApp tim | Politeknik Negeri Jember | Kirim email (mailto) | Salin nomor | — | Should |
| P4 | Kebijakan privasi | `/privasi` | tamu | Data apa yang disimpan dan siapa yang bisa melihat | Ringkasan poin | Isi lengkap | — | — | — | Should |
| P5 | Syarat layanan | `/syarat` | tamu | Batas tanggung jawab: skor bukan diagnosis resmi | Ringkasan poin | Isi lengkap | — | — | — | Could |

Section landing P1 (urutan, satu file per section, detail visual di 08-DESIGN Area Landing):

| Section | Tugas | Isi | CTA |
|---|---|---|---|
| Hero | Membuktikan nilai sebelum scroll | Judul nilai + **kalkulator kolom air**: geser Ct pirAB, TAN, dan DO; backend (`sdri/preview`) mengembalikan peluang, kelas, dan rekomendasi; berlabel "Data simulasi" | Coba demo |
| Masalah | Rasa sakit pemilik dengan kalimatnya sendiri | Angka Ct tidak terbaca; sampel jelek tetap dibaca; perintah ke teknisi hilang di chat | — |
| Cara kerja | 3 langkah | Unggah hasil lab → risiko dan alasan per kolam → tugas ke teknisi sampai dilaporkan | — |
| Kemampuan | Hasil, bukan nama fitur | Sampel terhambat inhibitor ditolak · skor bisa dirinci sampai well · tren kolam memberi tanda sebelum kelas tertinggi · tugas dan laporan foto · peringatan siap kirim WA | — |
| Metode & batasan | Kejujuran untuk juri | Model logit V1-GSI dengan koefisien awal; akan dikalibrasi dari data hasil siklus; bukan diagnosis resmi | Baca metode (P2) |
| FAQ | Keberatan umum | Perlu lab sendiri? Alat qPCR apa yang didukung? Data saya aman? Apakah menggantikan diagnosis? | — |
| CTA penutup | CTA utama diulang | Akun demo pemilik + teknisi | Coba demo |

**Akun**

| # | Halaman | Rute | Peran | Tugas | Info utama | Info pendukung | Aksi utama | Aksi sekunder | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P6 | Masuk | `/masuk` | tamu | Masuk dengan email + sandi; tombol akun demo | Form | Tautan daftar, lupa sandi | Masuk | Masuk sebagai demo pemilik / teknisi | kredensial salah, `RATE_LIMITED` | Must |
| P7 | Daftar pemilik | `/daftar` | tamu | Membuat akun pemilik | Form nama, email, sandi | Syarat layanan | Buat akun | — | email sudah terdaftar, sandi lemah | Must |
| P8 | Verifikasi email | `/verifikasi` | tamu | Memberi tahu cek email | Pesan + email tujuan | — | Kirim ulang | Ganti email | tautan kedaluwarsa | Should |
| P9 | Lupa sandi | `/lupa-sandi` | tamu | Minta tautan reset | Form email | — | Kirim tautan | — | pesan netral selalu | Should |
| P10 | Atur sandi baru | `/atur-sandi` | tamu | Membuat sandi baru dari tautan | Form sandi | Syarat sandi | Simpan sandi | — | tautan kedaluwarsa | Should |
| P11 | Terima undangan | `/undangan/[token]` | tamu (diundang) | Teknisi bergabung ke lokasi pemilik | Nama pemilik + lokasi | Kolam yang akan dipegang | Buat sandi dan gabung | — | token kedaluwarsa, sudah dipakai | Must |
| P12 | Mulai (onboarding) | `/mulai` | pemilik baru | Membuat lokasi pertama dan kolam | Stepper: lokasi → kolam → undang teknisi | Lewati langkah 3 | Simpan dan lanjut | Lewati | validasi | Must |

**Pemilik (area aplikasi)**

| # | Halaman | Rute | Peran | Tugas | Info utama | Info pendukung | Aksi utama | Aksi sekunder | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P13 | Dasbor | `/dasbor` | pemilik | Melihat kolam mana yang harus ditangani hari ini (pola Monitor) | Kartu sorotan navy: kolam paling berisiko + peluang + alasan; 4 kartu metrik (kolam Bahaya/Waspada tinggi, tugas terbuka, sampel ditolak, sampling terakhir) | Tren rata-rata per lokasi, tugas jatuh tempo | Buat tugas (dari kartu sorotan) | Ganti lokasi, Unggah hasil lab | kosong (belum ada hasil lab), loading, error | Must |
| P14 | Daftar kolam | `/kolam` | pemilik | Mencari dan membandingkan kolam | Tabel: kolam, peluang, kelas, tren, teknisi, sampling terakhir | Filter kelas/teknisi, urut | Tambah kolam (modal) | Ekspor CSV | kosong, loading, error | Must |
| P15 | Detail kolam | `/kolam/[pondId]` | pemilik | Memahami risiko satu kolam | Peluang + kelas + rekomendasi; grafik riwayat peluang dari `trajectory.history` + tanda tren | Tab: Sampel, Kimia air, Tugas | Tugaskan teknisi (modal) | Ubah kolam (modal), Catat hasil siklus (modal), Pratinjau WA, Arsipkan | belum ada sampel, sampel terakhir ditolak, data tren kurang | Must |
| P16 | Rincian skor | `/sampel/[sampleId]` | pemilik | Melihat dari mana angka peluang berasal | Rantai: peluang → Z → subskor S_qPCR/S_Bio/S_Chem → fitur (Ct, kopi/mL, NH₃) → well | Versi model, gerbang PPC, catatan kalibrasi | Buka unggahan (P18) | — | Ditolak (alasan + "uji ulang") | Must |
| P17 | Unggah hasil lab | `/lab/unggah` | pemilik | Mengunggah CSV qPCR sampai terkirim | Stepper: pilih file → cocokkan kolom → pratinjau QC (plate 96-well, kontrol, keluarkan well) → cocokkan sampel ke kolam + kimia air → kirim | Metadata batch (lab, alat, tanggal) | Kirim ke analisis | Unduh template | galat parsing per baris, sampel tak cocok kolam, backend menolak sampel | Must |
| P18 | Detail unggahan | `/lab/unggahan/[batchId]` | pemilik | Melihat hasil satu batch | Hasil per sampel (kolam, status, peluang, kelas) | Plate dari `meta.wells`, metadata batch | Buka rincian skor | — | semua ditolak | Must |
| P19 | Riwayat unggahan | `/lab` | pemilik | Membuka batch lama | Tabel batch: tanggal, lab, jumlah sampel, ditolak | Filter tanggal | Unggah hasil lab | — | kosong, loading, error | Should |
| P20 | Format CSV | `/lab/format` | pemilik | Mengetahui format yang diterima | Tabel kolom wajib + contoh | Alat yang sudah diuji | Unduh template CSV | Unduh contoh terisi (SIMULASI) | — | Must |
| P21 | Hasil siklus | `/kolam/[pondId]/siklus` | pemilik | Mencatat dan melihat akhir siklus (panen/wabah) untuk kalibrasi model | Daftar siklus: hasil, panen kg, tanggal wabah, patogen dugaan | Penjelasan kegunaan data | Catat hasil siklus | — | belum ada siklus selesai | Should |
| P22 | Peringatan | `/peringatan` | pemilik | Menindaklanjuti kolam berisiko, sampel ditolak, dan tren naik | Daftar: kolam, jenis, kelas/peluang, pesan, sejak kapan, tugas terkait | Filter jenis | Buat tugas (modal) | Pratinjau WA (modal), Tandai sudah ditangani | kosong ("tidak ada peringatan"), loading, error | Must |
| P23 | Daftar tugas | `/tugas` | pemilik | Memantau semua tugas | Tabel: tugas, kolam, teknisi, jatuh tempo, status | Filter status/teknisi/kolam | Buat tugas (modal) | — | kosong, loading, error | Must |
| P24 | Detail tugas | `/tugas/[taskId]` | pemilik | Menilai laporan teknisi | Instruksi + alasan; laporan: foto, catatan, angka ukur | Riwayat status | Tutup tugas | Minta ulang (catatan wajib), Ubah, Batalkan | belum dilaporkan, terlambat | Must |
| P25 | Tim | `/tim` | pemilik | Mengelola teknisi per lokasi | Tabel teknisi: nama, kolam dipegang, tugas terbuka | Undangan tertunda | Undang teknisi (modal) | Batalkan undangan, Bagi kolam (modal), Nonaktifkan | kosong, undangan kedaluwarsa | Must |
| P26 | Detail teknisi | `/tim/[userId]` | pemilik | Melihat beban dan riwayat satu teknisi | Kolam dipegang, tugas terbuka, ketepatan waktu | Catatan kimia air terakhir | Beri tugas | Bagi kolam, Nonaktifkan | — | Should |
| P27 | Lokasi | `/lokasi` | pemilik | Mengelola lokasi tambak | Kartu lokasi: nama, kabupaten, jumlah kolam, teknisi, kolam berisiko | — | Tambah lokasi (modal) | Ubah, Arsipkan | kosong | Must |
| P28 | Riwayat kimia air | `/kimia-air` | pemilik | Membandingkan catatan kimia air antar kolam | Tabel catatan: kolam, waktu, parameter, pencatat | Penanda di luar rentang aman | — | Ekspor CSV | kosong | Should |
| P29 | Laporan | `/laporan` | pemilik | Ringkasan periode per lokasi | Distribusi kelas, kolam berisiko, tugas selesai/terlambat | Pilihan periode | Cetak | — | kosong | Should |
| P30 | Banding kolam | `/banding` | pemilik | Membandingkan 2-4 kolam berdampingan | Riwayat peluang berdampingan | Pilihan kolam | — | — | kurang dari 2 kolam | Could |
| P31 | Log aktivitas | `/aktivitas` | pemilik | Siapa melakukan apa | Daftar kejadian | Filter pelaku/jenis | — | — | kosong | Should |
| P32 | Notifikasi | `/notifikasi` | pemilik, teknisi | Melihat semua notifikasi | Daftar: tugas baru, laporan masuk, peringatan baru | Tandai dibaca | Buka item | Tandai semua dibaca | kosong | Should |
| P33 | Pengaturan akun | `/pengaturan` | pemilik, teknisi | Profil dan sandi | Nama, email, nomor WA | — | Simpan | Ganti sandi | — | Should |
| P34 | Pengaturan tambak | `/pengaturan/tambak` | pemilik | Nomor WA dan versi model | Form per lokasi; V1 beku, kandidat V2, metrik, jumlah label, status | Audit nama/waktu | Simpan | Promosi kandidat dengan dialog konsekuensi + catatan wajib | kosong/loading/error | Should |
| P35 | Bantuan | `/bantuan` | pemilik, teknisi | Panduan alur dan arti kelas | Langkah alur inti, tabel kelas | Tautan metode | — | — | — | Could |

**Teknisi (area aplikasi, responsif HP)**

| # | Halaman | Rute | Peran | Tugas | Info utama | Info pendukung | Aksi utama | Aksi sekunder | State khusus | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| P36 | Tugas saya | `/teknisi` | teknisi | Tahu apa yang dikerjakan hari ini | Daftar tugas hari ini urut jatuh tempo, progres x dari y | Tugas besok, terlambat | Buka tugas | Catat air | kosong, loading, error | Must |
| P37 | Kerjakan tugas | `/teknisi/tugas/[taskId]` | teknisi | Menjalankan dan melapor | Instruksi + alasan | Batas waktu, pemberi tugas | Laporkan selesai (foto + catatan + angka ukur) | Mulai kerjakan | diminta ulang (catatan pemilik), unggah foto gagal | Must |
| P38 | Catat kimia air | `/teknisi/catat-air` | teknisi | Mencatat ukuran harian satu kolam | Isian suhu, pH, DO, TAN (+ NO₂, H₂S, TOM, alkalinitas, salinitas, kecerahan) | NH₃ bebas dari backend + zona | Simpan catatan | Pilih kolam | di luar rentang valid, kolam bukan miliknya | Must |
| P39 | Kolam saya | `/teknisi/kolam` | teknisi | Melihat kondisi kolam yang dipegang | Kartu kolam: kelas, peluang, catatan terakhir | — | Catat air | — | kosong | Should |

**Sistem**

| # | Halaman | Rute | Peran | Tugas | Info utama | Aksi utama | Prioritas |
|---|---|---|---|---|---|---|---|
| P40 | Tidak ditemukan | `not-found` | semua | Halaman tidak ada | Pesan + tautan kembali | Ke beranda | Must |
| P41 | Terjadi galat | `error` | semua | Galat tak terduga atau backend tidak terjangkau | Pesan + coba lagi | Coba lagi | Must |
| P42 | Akses ditolak | `/akses-ditolak` | semua | Backend menjawab 403 atau peran salah | Pesan + ke beranda peran | Ke beranda | Must |
| P43 | Pemeliharaan | `/pemeliharaan` | semua | Layanan sedang dirawat | Pesan | — | Could |
| P44 | Beranda peran | `/app` | pemilik, teknisi | Mengarahkan setelah masuk: pemilik → `/dasbor` (atau `/mulai` bila belum punya lokasi), teknisi → `/teknisi` | — (redirect) | — | Must |

### 5b. Struktur navigasi
- **Landing (navbar):** Cara kerja, Kemampuan, Metode (P2), Masuk · CTA "Coba demo". Footer: Kontak, Privasi, Syarat.
- **Pemilik, sidebar** (grup maks 4 item):
  - *Pantau:* Dasbor, Peringatan, Kolam
  - *Lab:* Unggah hasil lab, Riwayat unggahan
  - *Tim:* Tugas, Tim
  - *Tambak:* Lokasi, Laporan
- **Pemilik, top bar:** pemilih lokasi (pill, dialog), badge "Data simulasi" bila lokasi seed, notifikasi (P32), avatar.
- **Menu akun (kartu akun di sidebar):** Pengaturan akun, Pengaturan tambak, Log aktivitas, Bantuan, Keluar.
- **Teknisi, sidebar** (drawer di HP): Tugas saya, Catat air, Kolam saya. Menu akun: Pengaturan akun, Bantuan, Keluar.
- **Hanya lewat tautan/aksi:** P16, P18, P20, P21, P24, P26, P28 (dari detail kolam), P30 (dari daftar kolam), P37.

### 5c. Matriks entitas
| Entitas | Daftar | Detail | Buat | Ubah | Hapus | Catatan |
|---|---|---|---|---|---|---|
| Lokasi | P27 | P27 (kartu) | P12, modal P27 | modal P27 | Arsipkan (konfirmasi) | Tidak dihapus permanen karena memegang riwayat |
| Kolam | P14 | P15 | P12, modal P14 | modal P15 | Arsipkan (konfirmasi) | Satu teknisi per kolam |
| Anggota (teknisi) | P25 | P26 | Undangan modal P25 → P11 | Bagi kolam (modal) | Nonaktifkan (konfirmasi) | Akun tetap ada, akses ke lokasi dicabut |
| Undangan | P25 | — | modal P25 | — | Batalkan | Kedaluwarsa 7 hari |
| Batch unggahan | P19 | P18 | P17 | Tidak | Tidak | Data lab tidak diubah setelah dikirim |
| Sampel | P18, tab P15 | P16 | dari P17 | Tidak | Tidak | Skor dari backend |
| Catatan kimia air | P28, tab P15 | baris tabel | P38 | Pencatat dalam 1 jam | Tidak | Koreksi setelah 1 jam lewat catatan baru |
| Tugas | P23, P36 | P24, P37 | modal (P13, P15, P22, P23, P26) | modal P24 (sebelum dilaporkan) | Batalkan (konfirmasi) | Status: baru → dikerjakan → dilaporkan → selesai / diminta ulang / batal |
| Laporan tugas | di P24 | P24 | P37 | Tidak | Tidak | Foto disimpan backend |
| Hasil siklus | P21 | P21 | modal P15 / P21 | Tidak | Tidak | Untuk kalibrasi model backend |
| Peringatan | P22 | → P15 | otomatis dari backend | Tandai ditangani | Tidak | Aturan di 09-API-KONTRAK §6 |
| Notifikasi | P32 | → item | otomatis | Tandai dibaca | Tidak | — |
| Log aktivitas | P31 | — | otomatis | Tidak | Tidak | Hanya baca |

## 7. Fitur
| # | Fitur | Prioritas | Alur / halaman | Kriteria terima |
|---|---|---|---|---|
| F1 | Landing + kalkulator kolom air | Must | P1 | Semua section tampil di 375/768/1440; kalkulator memakai `sdri/preview` backend dengan cadangan contoh tersimpan; label "Data simulasi"; Lighthouse mobile Performance ≥ 90; animasi mati saat reduced-motion |
| F2 | Auth pemilik | Must | Alur 1 · P6, P7, P44 | Daftar, masuk, keluar lewat backend; token di cookie httpOnly; refresh otomatis; pesan galat jelas |
| F3 | Akun demo | Must | P6 | Tombol "Masuk sebagai demo pemilik / teknisi" membuka akun SIMULASI (mock atau `auth/demo`) |
| F4 | Lokasi & kolam | Must | Alur 1 · P12, P14, P15, P27 | Buat/ubah/arsipkan; `CONFLICT` kode kolam tampil di field |
| F5 | Undang teknisi & bagi kolam | Must | Alur 1 · P11, P25 | Undangan terkirim; teknisi hanya melihat kolam yang dibagikan |
| F6 | Penanganan akses | Must | semua | 401 → refresh lalu `/masuk`; 403 → `/akses-ditolak`; menu disesuaikan peran |
| F7 | Catat kimia air | Must | Alur 2 · P38 | Validasi rentang (sama dengan backend); NH₃ bebas dan zona tampil dari respons |
| F8 | Unggah CSV qPCR | Must | Alur 3 · P17, P20 | Template terbaca; kolom tak dikenal dipetakan manual; galat per baris; sampel dicocokkan ke kolam; kimia air terisi dari catatan terakhir dan bisa diubah; batch terkirim atomik |
| F9 | Pratinjau QC + detail unggahan | Must | Alur 3 · P17, P18 | Plate 96-well, PPC/NTC/16S per sampel, SD replikat; keluarkan well wajib alasan (ikut di `meta`); hasil backend per sampel tampil termasuk yang ditolak |
| F10 | Tampilan skor backend | Must | Alur 4 | Satu pemetaan kelas di `src/lib/risk.ts`; peluang dengan 1 desimal; versi model tampil; `REJECTED_*` tanpa angka |
| F11 | Rincian skor | Must | Alur 4 · P16 | Peluang → Z → subskor → fitur → well; catatan kalibrasi |
| F12 | Dasbor & daftar kolam | Must | Alur 4 · P13, P14, P15 | Urut dari risiko tertinggi; satu kartu sorotan; riwayat peluang + tanda tren dari `trajectory` |
| F13 | Peringatan | Must | Alur 4 · P22 | Muncul untuk kelas 3-4, sampel ditolak, dan `trajectory_alert`; hilang setelah ditandai ditangani |
| F14 | Tugas dari rekomendasi | Must | Alur 5 · P23, modal | Instruksi terisi dari `recommendation` backend dan bisa diubah; teknisi terisi dari pemegang kolam; jatuh tempo wajib |
| F15 | Lapor tugas dengan foto | Must | Alur 6 · P36, P37, P24 | Maks 4 foto, dikompres di klien ≤ 1 MB; status berubah; pemilik bisa tutup atau minta ulang dengan catatan |
| F16 | Label simulasi | Must | semua | Data `provenance = simulasi` menampilkan badge "Data simulasi" di top bar dan di setiap skor |
| F17 | Pratinjau peringatan WA | Should | P15, P22 | Teks dari `reports/whatsapp`; tombol salin + buka `wa.me` |
| F18 | Riwayat unggahan & kimia air | Should | P19, P28 | Daftar dengan filter, ekspor CSV |
| F19 | Hasil siklus | Should | P15, P21 | Catat panen/wabah ke `cycles/outcome`; daftar siklus per kolam |
| F20 | Notifikasi dalam aplikasi | Should | P32 | Tugas baru, laporan masuk, peringatan baru; penanda belum dibaca |
| F21 | Laporan periode | Should | P29 | Ringkasan per lokasi per periode; bisa dicetak rapi |
| F22 | Log aktivitas | Should | P31 | Setiap aksi penting tercatat dengan pelaku + waktu |
| F23 | Banding kolam | Could | P30 | 2-4 kolam berdampingan |
| F24 | Tugas terlambat | Could | P36, P23 | Tugas lewat jatuh tempo ditandai dan muncul di notifikasi |
| F25 | Isi ulang dari catatan kemarin | Could | P38 | Tombol "Pakai nilai kemarin" untuk parameter yang jarang berubah |
| F26 | Tautan langsung dari WA | Could | P15 | Teks WA memuat tautan ke detail kolam (butuh masuk) |

## 8. Di Luar Scope
- Aplikasi mobile native (rekan tim).
- Backend (rekan tim; web hanya menulis kontrak kebutuhan).
- Menghitung skor di web, atau salinan rumus di web.
- Model bisnis, harga, langganan, tagihan (saklar bisnis: Tidak).
- Akun lab mitra; peran analis lab terpisah.
- Profil Nanopore, meter keyakinan hasil negatif, sinyal EWMA (tidak didukung backend).
- WhatsApp Business API / pengiriman otomatis.
- LLM langsung di web dan chatbot bebas. AI hanya berjalan di backend.
- IoT sensor kimia air.
- Multi-bahasa (hanya Bahasa Indonesia).

## 9. Riwayat Perubahan
| Tanggal | Perubahan |
|---|---|
| 24 Okt 2026 | Dokumen awal web (landing + aplikasi pemilik dan teknisi), menggantikan PRD Expo lama di commit `2aad8c8` |
| 24 Okt 2026 | v1.1: auth dan data lewat backend Go tim; skor ikut backend (peluang %, kelas 1-4); Supabase, mesin skor web, Nanopore, meter keyakinan, EWMA dikeluarkan; P16 jadi Rincian skor, P18 Detail unggahan, P19 Riwayat unggahan, P21 Hasil siklus |
