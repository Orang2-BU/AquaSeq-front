// Semua teks landing (LANDING-PAGE §3). Isi mengikuti proposal GenoHack 2026: DNA air kolam jadi peringatan dini.
// Angka hanya dari proposal dan rujukannya. Tanpa em-dash di teks yang terlihat (08-DESIGN A9).
// Foto di public/landing/ dari Pexels (lisensi Pexels, bebas dipakai).

/**
 * Nomor WhatsApp tim untuk tombol "Hubungi tim", format internasional tanpa + (mis. 6281234567890).
 * Kosong = tombol diarahkan ke halaman Kontak. Isi sebelum rilis.
 */
const WHATSAPP_NUMBER = "";
const WHATSAPP_MESSAGE =
  "Halo tim AquaSeq, saya ingin tahu lebih lanjut soal pemantauan DNA air kolam untuk tambak saya.";

export const CONTACT_HREF = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
  : "/kontak";
export const CONTACT_EXTERNAL = Boolean(WHATSAPP_NUMBER);
export const CONTACT_LABEL = "Hubungi tim";

export const NAV_LINKS = [
  { href: "/#cara-kerja", label: "Cara kerja" },
  { href: "/#teknologi", label: "Teknologi" },
  { href: "/#kenapa", label: "Kenapa AquaSeq" },
  { href: "/#riset", label: "Dasar ilmiah" },
] as const;

export const HERO = {
  strong: "AquaSeq membaca DNA air kolam",
  light: " untuk peringatan dini penyakit udang",
  quote:
    "Hasil lab diolah otomatis jadi peringatan per kolam dalam bahasa Indonesia, lengkap dengan saran tindakan dan buktinya.",
  image: { src: "/landing/hero-kincir.jpg", alt: "Kincir air berputar di kolam tambak udang di bawah langit cerah" },
  card: {
    text: "Dari sampel air kolam sampai peringatan di WhatsApp tim tambak",
    image: { src: "/landing/sampel-air.jpg", alt: "Tangan bersarung memegang tabung berisi air kolam" },
    href: "/#cara-kerja",
    label: "Lihat cara kerja",
  },
};

export const STATEMENT = {
  strong: "AquaSeq menambahkan lapisan biologis ke pemantauan tambak:",
  light: " bakteri dan patogen di air kolam, yang selama ini jarang diukur di samping DO, pH, dan pakan.",
  left: { src: "/landing/udang-tangan.jpg", alt: "Udang vaname hidup di tangan petambak" },
  right: { src: "/landing/tambak-udara.jpg", alt: "Kolam tambak dari udara dengan kincir yang menyala" },
};

export const IMPACT = {
  title: "Penyakit masih jadi ancaman terbesar budidaya udang",
  // Potongan teks; `hl` disorot warna terang di blok gelap.
  text: [
    { text: "AHPND saja menimbulkan kerugian lebih dari " },
    { text: "USD 7 miliar per tahun", hl: true },
    { text: " di dunia dan bisa memusnahkan satu kolam dalam " },
    { text: "10-35 hari", hl: true },
    { text: " setelah tebar." },
  ],
  source: "Wang dkk. 2022; Sen dkk. 2026",
  mission: {
    title: "Misi kami",
    text: "Memberi peringatan sebelum kematian massal, dari air kolam, tanpa harus mengorbankan udang untuk diperiksa.",
  },
  image: { src: "/landing/petambak.jpg", alt: "Petambak memegang udang hasil panen di tepi kolam" },
};

export const STEPS = {
  title: "Empat langkah dari air kolam ke keputusan",
  items: [
    {
      title: "Ambil sampel air",
      text: "Air disaring saat tebar, lalu tiap 2-4 minggu",
      image: { src: "/landing/sampel-air.jpg", alt: "Tabung sampel air diangkat di tepi kolam" },
    },
    {
      title: "Sekuensing di lab mitra",
      text: "16S dan amplikon patogen dengan Nanopore",
      image: { src: "/landing/pipet-lab.jpg", alt: "Pipet multikanal mengisi plate di laboratorium" },
    },
    {
      title: "Diolah AquaSeq",
      text: "Kontrol mutu, taksonomi, penanda virulensi, skor risiko",
      image: { src: "/landing/tabung-sampel.jpg", alt: "Deretan tabung sampel berlabel di rak laboratorium" },
    },
    {
      title: "qPCR mingguan",
      text: "Hanya 3-5 penanda yang dipilih untuk tambak itu",
      image: { src: "/landing/mesin-qpcr.jpg", alt: "Ruang sampel mesin qPCR dengan tabung tersusun melingkar" },
    },
  ],
};

export const SCALE = {
  strong: "Temukan lewat sekuensing.",
  light: " Pantau tiap minggu.",
  note: "Sekuensing untuk menemukan, qPCR untuk memantau, bahasa Indonesia untuk bertindak.",
  watermark: "AQUASEQ",
  image: { src: "/landing/tambak-luas.jpg", alt: "Hamparan kolam tambak di bawah langit biru" },
  highlight: {
    value: "3-5",
    text: "penanda qPCR per tambak, dipilih dari hasil sekuensing",
    href: "/#riset",
    label: "Lihat dasar ilmiahnya",
  },
  stats: [
    { value: "2-4", text: "minggu sekali sekuensing air" },
    { value: "75", text: "sampel per run Nanopore" },
    { value: "10-35", text: "hari AHPND bisa memusnahkan kolam" },
  ],
};

export const REASONS = {
  chips: ["Petambak", "Teknisi", "Lab mitra"],
  title: "Hasil lab dijelaskan dengan bahasa tambak",
  text: "Skor dihitung oleh pipeline yang hasilnya selalu sama untuk data yang sama. AI hanya menulis ulang hasil itu ke bahasa sehari-hari dan tidak pernah membuat angka.",
  cards: [
    {
      title: "Peringatan dalam bahasa Indonesia",
      text: "Lewat dasbor dan WhatsApp, dengan saran tindakan dan bukti di baliknya.",
      accent: true,
    },
    {
      title: "Bukan diagnosis resmi",
      text: "Setiap saran ditandai sebagai pendukung keputusan. Kondisi berbahaya tetap dikonfirmasi ke lab rujukan.",
    },
    {
      title: "Lab mitra unggah langsung",
      text: "File sekuensing masuk dan pipeline berjalan otomatis, tanpa perlu ahli bioinformatika di tambak.",
    },
  ],
  image: { src: "/landing/kincir-dekat.jpg", alt: "Kincir tambak memercikkan air di kolam" },
};

export const RESEARCH = {
  title: "Dasar ilmiah",
  items: [
    {
      source: "Applied Microbiology and Biotechnology, 2023",
      title: "Mikrobiota berubah seiring perkembangan AHPND",
      text: "Model berbasis mikrobiota usus membedakan tahap awal, lanjut, dan sekarat dengan akurasi 86,5%. Komunitas bakteri usus makin mirip dengan air kolam. Validasi pada eDNA air adalah target pengembangan kami.",
      href: "https://doi.org/10.1007/s00253-023-12810-y",
      image: { src: "/landing/udang-dekat.jpg", alt: "Udang vaname dari dekat" },
    },
    {
      source: "Zoological Research, 2024",
      title: "Banyak penyakit udang melibatkan lebih dari satu patogen",
      text: "Uji PCR hanya menemukan yang dicari. Sekuensing membantu memilih penanda yang perlu dipantau.",
      href: "https://doi.org/10.24272/j.issn.2095-8137.2024.158",
      image: { src: "/landing/sampel-lab.jpg", alt: "Tabung sampel di wadah laboratorium" },
    },
    {
      source: "Microbiology Spectrum, 2022",
      title: "Gen toksin pirAB di balik AHPND",
      text: "Penanda virulensi seperti pirAB dicari langsung di data sekuensing air.",
      href: "https://doi.org/10.1128/spectrum.01702-22",
      image: { src: "/landing/udang-galah.jpg", alt: "Udang galah dipegang di tepi kolam" },
    },
  ],
};

export const FOOTER = {
  tagline: "DNA air kolam jadi peringatan dini penyakit udang.",
  team: "Tim AquaSeq, Politeknik Negeri Jember",
  links: [
    { href: "/kontak", label: "Kontak" },
    { href: "/privasi", label: "Kebijakan privasi" },
    { href: "/masuk", label: "Masuk" },
  ],
  note: "Foto dari Pexels. Angka berasal dari proposal GenoHack 2026 dan rujukannya.",
};
