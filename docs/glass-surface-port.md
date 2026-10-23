# Port GlassSurface (React Bits) ke Expo

Sumber: komponen `GlassSurface` varian JS + CSS dari React Bits, ditempel user 23 Okt 2026. Rujukan Expo: dokumentasi SDK 58 `expo-blur` dan `expo-glass-effect` (dibuka 23 Okt 2026).

## 1. Cara kerja aslinya (hasil bedah sumber)

GlassSurface punya 3 jalur render. Pemilihannya otomatis:

| Jalur | Kapan | Cara kerja |
|---|---|---|
| **SVG refraksi** | Chromium, `refraction` aktif | Membuat **peta displacement** berupa SVG: gradien merah horizontal (geser X) + gradien biru vertikal (geser Y) digabung `mix-blend-mode: difference`, lalu persegi abu 50% yang diblur di tengah (tengah = "tenang", tepi = membelok). Peta dipasang lewat `backdrop-filter: url(#filter)` → `feDisplacementMap` tiga kali, satu per kanal R/G/B dengan skala berbeda (`distortionScale + redOffset/greenOffset/blueOffset`). Hasilnya latar di tepi kaca membelok dan pecah warna halus (aberasi kromatik). |
| **WebGL** | Safari/Firefox **dan** prop `backdrop` (gambar/video/canvas) diberikan | Shader fragmen membaca tekstur latar + peta displacement yang sama, menggeser sampel per kanal warna, opsional blur Gaussian 5×5 (`displace`) dan saturasi. Hanya bisa membelokkan gambar yang diberikan, bukan DOM. |
| **Frosted fallback** | Selain dua di atas | `backdrop-filter: blur(12px) saturate(1.4) brightness(1.04)` + latar putih 12% + 3 lapisan dekorasi: **sheen** (gradien diagonal putih 42% → transparan → 18%), **rim** (bingkai 3px bergradien putih 70% → 10% → 8% → 42%, dibuat dengan mask XOR), dan bayangan inset/luar berlapis. |

Kesan "kaca iPhone" pada bottom bar terang sebenarnya datang dari **blur + sheen + rim + bayangan berlapis**. Refraksi tepi baru terlihat jelas bila di belakangnya ada gambar berwarna kontras. Di atas UI yang dominan putih, efeknya nyaris tak terlihat.

## 2. Kenapa tidak bisa dipakai langsung di Expo native

React Native tidak punya DOM, `backdrop-filter`, filter SVG, ataupun cara membaca piksel view lain secara langsung. Jalur SVG dan WebGL hanya hidup di web.

## 3. Rencana port: satu API, tiga implementasi

```
components/glass/
  GlassSurface.tsx          # tipe props bersama + re-export
  GlassSurface.web.tsx      # port TypeScript dari sumber React Bits (ketiga jalur utuh)
  GlassSurface.native.tsx   # rekonstruksi untuk iOS/Android
```

Props bersama yang dipakai aplikasi (subset): `borderRadius`, `intensity` (0-100), `tint` (warna sapuan), `children`, `style`. Prop khusus web (`distortionScale`, offset RGB, dll.) tetap diterima di web dan diabaikan di native.

**`GlassSurface.native.tsx`, susunan lapisan (bawah → atas):**

1. **Material kaca**
   - iOS 26+: `GlassView` dari `expo-glass-effect` (`glassEffectStyle="regular"`, `tintColor` biru tipis). Ini **Liquid Glass asli Apple, sudah termasuk refraksi**, jadi lapisan 3-4 dikurangi.
   - iOS < 26: `BlurView` `expo-blur`, `tint="systemChromeMaterialLight"` (fallback `"light"`), `intensity` ≈ 60.
   - Android: `BlurView` dengan `blurMethod="dimezisBlurView"` + `blurTarget` yang menunjuk ke `BlurTargetView` pembungkus konten layar. Stabil sejak SDK 55, dan **wajib** dipasang begini, karena tanpa itu Android hanya mendapat latar semi-transparan.
2. **Tint**: `View` putih `rgba(255,255,255,0.12-0.35)` (meniru `--glass-frost`).
3. **Sheen**: `LinearGradient` (`expo-linear-gradient`) 135° dengan stop yang sama seperti CSS asli.
4. **Rim**: bingkai 1-1,5px dari `LinearGradient` 150° di belakang + `View` dalam dengan radius dikurangi (pengganti mask XOR).
5. **Bayangan**: `boxShadow` (didukung RN New Architecture) berlapis seperti CSS asli: 3 bayangan luar 5-6% + highlight inset atas putih 85%.
6. **Konten** (ikon, label, tombol).

**Refraksi tepi di native (opsional, tidak masuk MVP):** bisa direka dengan `@shopify/react-native-skia` memakai `BackdropFilter` + `RuntimeShader` yang memakai rumus peta displacement yang sama. Batasannya, Skia hanya bisa membelokkan apa yang digambar **di kanvas Skia yang sama**, bukan view RN di bawahnya. Cocok untuk kartu hero di atas latar gradien yang digambar Skia, tidak cocok untuk bottom bar di atas daftar yang bergulir. Menambah ±3-4 MB. Ditunda.

## 4. Perilaku per platform

| Platform | Material | Refraksi | Catatan |
|---|---|---|---|
| Web Chromium | SVG `backdrop-filter` | Ya | Sumber React Bits utuh |
| Web Safari/Firefox | Frosted fallback | Tidak | Tanpa prop `backdrop` |
| iOS 26+ | Liquid Glass (`GlassView`) | Ya (native) | Terbaik |
| iOS < 26 | `BlurView` + lapisan | Tidak | |
| Android | `BlurView` dimezis + `BlurTargetView` | Tidak | Perlu pembungkus `BlurTargetView` di root layar |

## 5. Aturan pemakaian di AquaSeq

- Kaca hanya untuk: bottom bar, header melayang, sheet bawah, dan kartu hero gauge SDRI. Tabel data, heatmap plate, dan teks panjang di kartu **solid**.
- Satu efek berat per layar (aturan React Bits di CLAUDE.md). `prefers-reduced-motion`/`reduceTransparency` → pakai panel putih pekat tanpa blur.
- Teks di atas kaca lolos kontras WCAG AA terhadap kondisi latar terburuk; label nonaktif tidak sepucat referensi.
- Known issue Expo: `BlurView` harus dirender **setelah** konten dinamis (mis. `FlatList`) agar blur ikut diperbarui.
- Lisensi React Bits dicek ulang saat menyalin sumber (simpan header lisensi di `GlassSurface.web.tsx`).
