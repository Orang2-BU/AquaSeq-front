# Referensi: Iconly Pro (Dribbble)

Sumber: `https://dribbble.com/iconlypro`, diambil 24 Okt 2026. Semua 378 shot publik diunduh sebagai gambar cover, disusun jadi 19 lembar kontak, dan ditinjau satu per satu. Lampiran shot UI (51 gambar dari 17 shot) juga diambil; isinya salinan cover + gambar promosi, jadi tidak menambah gambar unik. Pengambilan sisa lampiran dihentikan karena Dribbble membatasi laju (verifikasi manusia dikerjakan user).

Gambar referensi **tidak** disimpan di repo (hak cipta Iconly/Piqo Studio). Analisis ini dan tautan shot cukup untuk menelusuri ulang.

## Komposisi isi (378 shot)
| Jenis | ± Jumlah | Catatan |
|---|---|---|
| Set ikon statis (flat, bulk, two-tone, light, bold) | 150 | Latar polos (putih, hitam, biru `#3846F5`, kuning, hijau) |
| Animasi ikon (video) | 140 | Cover berupa ikon tunggal di lingkaran kaca putih |
| Layar aplikasi satu layar (mockup kaca) | 50 | Finansial, kesehatan, fitness, cuaca, smart home, AI, travel, musik |
| Studi navigasi bawah | 35 | Ciri khas mereka |
| Ikon 3D, promosi, tutorial | 40 | Tidak relevan untuk UI |

## Ukuran yang diambil dari piksel
| Aspek | Nilai | Sumber | Keyakinan |
|---|---|---|---|
| Kanvas atas / bawah | `#EFEFEF` / `#DEDEDE` | piksel "Navigation Menu" | pasti |
| Isi pil kaca | `#EBEBEB`–`#F0F0F0` | piksel "iOS Navigation menu", "iOS input Design" | pasti |
| Rim kaca | `#FDFDFD`–`#FFFFFF`, ±2-3 px, terang di atas | piksel | pasti |
| Bayangan di bawah panel | turun ke `#CECECE`–`#D7D7D7`, sangat lebar | piksel | pasti |
| FAB monokrom | `#000000` | piksel | pasti |
| Placeholder | `#717171` | piksel "iOS input Design" | pasti |
| Label nonaktif | ±`#9E9E9E` (±2,5:1, gagal AA) | piksel | pasti |
| Kartu gradasi teal | `#F1F3F2` → `#B0CDD1` → `#48AEBC` | piksel "Financial Widget" | pasti |
| Radius bingkai layar | ≈ 14% lebar | ukur "Financial Widget", "Dashboard App" | perkiraan |
| Radius kartu dalam | ≈ 6% lebar | ukur "Dashboard App" | perkiraan |
| Tombol, chip, nav | pil penuh | visual | pasti |
| Font | Gellix 400/500/600 | computed style iconly.pro | pasti |

## Pola yang konsisten
1. Kanvas abu netral dengan cahaya pastel buram (cyan, lilac, pink) di belakang panel.
2. Panel kaca putih tembus dengan rim putih tebal, bayangan dalam di bawah, bayangan luar lebar.
3. UI monokrom: teks dan ikon aktif hitam, nonaktif abu; satu aksen jenuh per layar pada FAB dengan glow warna yang sama.
4. Nav = pil kaca; item aktif ikon terisi hitam (atau pil putih melebar berisi ikon + label); FAB bulat di tengah atau di luar bar.
5. Header: avatar + tanggal kecil + sapaan semibold; tombol ikon kaca bulat di kanan.
6. Tombol aksi berupa pil kaca berisi ikon dengan label di bawah.
7. Kartu bergradasi lembut: vertikal abu → teal, atau mesh pastel di pojok kartu putih.
8. Angka besar tipis ("$ 12 651"), satuan kecil abu.
9. Grafik: garis hitam dengan halo abu, pil nilai hitam pada titik terpilih, kontrol segmen track abu.
10. Empty state: ilustrasi/ikon di lingkaran kaca + judul + satu kalimat + nav.

## Kelemahan yang tidak ditiru
- Label abu muda gagal kontras AA.
- Teks putih di atas gradasi teal muda (±2,4:1).
- Aksen berganti-ganti antaraplikasi.
- Foto orang sebagai avatar dan konten.

## Shot acuan
iOS Navigation menu (27707413), iOS Navigation Menu (27707403), iOS input Design (27707398), Financial App! (27707046), AI App! (27707043), Navigation Menu (27206618), Financial Widget (26641420), UI Card Design (26613951), UI Widgets (26651496), UI Components! (26911633), Weather App! (27159152), Health App! (27476789), Dashboard App (26952558), Navigation Menu (26496283), Empty State UI (26779541), Delivery app (26749630), Liquid Glass! (27476827). URL: `https://dribbble.com/shots/<id>`.
