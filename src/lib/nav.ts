import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Droplet,
  Droplets,
  FileSpreadsheet,
  FileText,
  History,
  House,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LogIn,
  Mail,
  MailCheck,
  MapPin,
  RefreshCcw,
  Rocket,
  ScanSearch,
  Settings,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Ticket,
  TriangleAlert,
  Upload,
  UserPlus,
  UserRound,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";

// Peta halaman dari docs/01-PRD.md §5a-5b (Must + Should).

export interface PageInfo {
  /** ID halaman di 01-PRD §5a. */
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  /** Satu kalimat tugas halaman. */
  description: string;
  /** Halaman yang sudah dibangun (tanpa titik placeholder di sidebar). */
  core?: boolean;
  /** Halaman induk untuk tombol kembali di placeholder. */
  parent?: string;
}

const PAGE_MAP = {
  "/": {
    id: "P1",
    label: "Landing",
    group: "Publik",
    icon: House,
    parent: "/masuk",
    description: "Meyakinkan pengunjung bahwa AquaSeq mengubah hasil lab jadi tindakan.",
  },
  "/metode": {
    id: "P2",
    label: "Metode",
    group: "Publik",
    icon: BookOpen,
    parent: "/",
    description: "Cara skor dihitung backend, gerbang PPC, dan batasannya.",
  },
  "/kontak": {
    id: "P3",
    label: "Kontak",
    group: "Publik",
    icon: Mail,
    parent: "/",
    description: "Menghubungi tim AquaSeq.",
  },
  "/privasi": {
    id: "P4",
    label: "Kebijakan privasi",
    group: "Publik",
    icon: Shield,
    parent: "/",
    description: "Data apa yang disimpan dan siapa yang bisa melihatnya.",
  },
  "/masuk": {
    id: "P6",
    label: "Masuk",
    group: "Akun",
    icon: LogIn,
    parent: "/",
    description: "Masuk dengan email dan sandi, atau coba akun demo.",
  },
  "/daftar": {
    id: "P7",
    label: "Daftar pemilik",
    group: "Akun",
    icon: UserPlus,
    parent: "/masuk",
    description: "Membuat akun pemilik tambak.",
  },
  "/verifikasi": {
    id: "P8",
    label: "Verifikasi email",
    group: "Akun",
    icon: MailCheck,
    parent: "/masuk",
    description: "Memeriksa email untuk tautan verifikasi.",
  },
  "/lupa-sandi": {
    id: "P9",
    label: "Lupa sandi",
    group: "Akun",
    icon: KeyRound,
    parent: "/masuk",
    description: "Meminta tautan untuk mengatur ulang sandi.",
  },
  "/atur-sandi": {
    id: "P10",
    label: "Atur sandi baru",
    group: "Akun",
    icon: KeyRound,
    parent: "/masuk",
    description: "Membuat sandi baru dari tautan email.",
  },
  "/undangan/[token]": {
    id: "P11",
    label: "Terima undangan",
    group: "Akun",
    icon: Ticket,
    parent: "/masuk",
    description: "Teknisi bergabung ke lokasi tambak pemilik.",
  },
  "/akses-ditolak": {
    id: "P42",
    label: "Akses ditolak",
    group: "Sistem",
    icon: ShieldAlert,
    parent: "/app",
    description: "Halaman ini butuh peran atau lokasi lain.",
  },
  "/mulai": {
    id: "P12",
    label: "Mulai",
    group: "Tambak",
    icon: Rocket,
    description: "Membuat lokasi pertama, kolam, dan mengundang teknisi.",
  },
  "/dasbor": {
    id: "P13",
    label: "Dasbor",
    group: "Pantau",
    icon: LayoutDashboard,
    description: "Melihat kolam mana yang harus ditangani hari ini.",
  },
  "/peringatan": {
    id: "P22",
    label: "Peringatan",
    group: "Pantau",
    icon: TriangleAlert,
    description: "Menindaklanjuti kolam berisiko, sampel ditolak, dan tren naik.",
  },
  "/kolam": {
    id: "P14",
    label: "Kolam",
    group: "Pantau",
    icon: Waves,
    description: "Mencari dan membandingkan kolam.",
  },
  "/kolam/[pondId]": {
    id: "P15",
    label: "Detail kolam",
    group: "Pantau",
    icon: Waves,
    parent: "/kolam",
    description: "Memahami risiko satu kolam dan menugaskan teknisi.",
  },
  "/kolam/[pondId]/siklus": {
    id: "P21",
    label: "Hasil siklus",
    group: "Pantau",
    icon: RefreshCcw,
    parent: "/kolam",
    description: "Mencatat akhir siklus (panen atau wabah) untuk kalibrasi model.",
  },
  "/sampel/[sampleId]": {
    id: "P16",
    label: "Rincian skor",
    group: "Pantau",
    icon: ScanSearch,
    parent: "/kolam",
    description: "Melihat dari mana angka peluang berasal, sampai ke well.",
  },
  "/lab/unggah": {
    id: "P17",
    label: "Unggah hasil lab",
    group: "Lab",
    icon: Upload,
    description: "Mengunggah CSV qPCR, memeriksa QC, lalu mengirim ke analisis.",
  },
  "/lab": {
    id: "P19",
    label: "Riwayat unggahan",
    group: "Lab",
    icon: History,
    description: "Membuka batch hasil lab yang pernah diunggah.",
  },
  "/lab/unggahan/[batchId]": {
    id: "P18",
    label: "Detail unggahan",
    group: "Lab",
    icon: FileSpreadsheet,
    parent: "/lab",
    description: "Melihat hasil analisis per sampel dalam satu batch.",
  },
  "/lab/format": {
    id: "P20",
    label: "Format CSV",
    group: "Lab",
    icon: FileText,
    parent: "/lab/unggah",
    description: "Format kolom yang diterima dan template untuk diunduh.",
  },
  "/tugas": {
    id: "P23",
    label: "Tugas",
    group: "Tim",
    icon: ClipboardList,
    description: "Memantau semua tugas teknisi.",
  },
  "/tugas/[taskId]": {
    id: "P24",
    label: "Detail tugas",
    group: "Tim",
    icon: ClipboardCheck,
    parent: "/tugas",
    description: "Menilai laporan teknisi, lalu menutup atau meminta ulang.",
  },
  "/tim": {
    id: "P25",
    label: "Tim",
    group: "Tim",
    icon: Users,
    description: "Mengelola teknisi, undangan, dan pembagian kolam.",
  },
  "/tim/[userId]": {
    id: "P26",
    label: "Detail teknisi",
    group: "Tim",
    icon: UserRound,
    parent: "/tim",
    description: "Melihat beban kerja dan riwayat satu teknisi.",
  },
  "/lokasi": { id: "P27", label: "Lokasi", group: "Tambak", icon: MapPin, description: "Mengelola lokasi tambak." },
  "/laporan": {
    id: "P29",
    label: "Laporan",
    group: "Tambak",
    icon: BarChart3,
    description: "Ringkasan risiko dan tugas per periode.",
  },
  "/kimia-air": {
    id: "P28",
    label: "Riwayat kimia air",
    group: "Tambak",
    icon: Droplets,
    parent: "/kolam",
    description: "Membandingkan catatan kimia air antar kolam.",
  },
  "/aktivitas": {
    id: "P31",
    label: "Log aktivitas",
    group: "Akun",
    icon: Activity,
    description: "Melihat siapa melakukan apa.",
  },
  "/notifikasi": {
    id: "P32",
    label: "Notifikasi",
    group: "Akun",
    icon: Bell,
    description: "Tugas baru, laporan masuk, dan peringatan baru.",
  },
  "/pengaturan": {
    id: "P33",
    label: "Pengaturan akun",
    group: "Akun",
    icon: Settings,
    description: "Mengubah profil dan sandi.",
  },
  "/pengaturan/tambak": {
    id: "P34",
    label: "Pengaturan tambak",
    group: "Akun",
    icon: SlidersHorizontal,
    parent: "/pengaturan",
    description: "Nomor WhatsApp tujuan peringatan per kolam.",
  },
  "/teknisi": {
    id: "P36",
    label: "Tugas saya",
    group: "Teknisi",
    icon: ListChecks,
    description: "Tugas hari ini, urut jatuh tempo.",
  },
  "/teknisi/tugas/[taskId]": {
    id: "P37",
    label: "Kerjakan tugas",
    group: "Teknisi",
    icon: ClipboardCheck,
    parent: "/teknisi",
    description: "Menjalankan tugas dan melapor dengan foto.",
  },
  "/teknisi/catat-air": {
    id: "P38",
    label: "Catat kimia air",
    group: "Teknisi",
    icon: Droplet,
    parent: "/teknisi",
    description: "Mencatat ukuran kimia air harian satu kolam.",
  },
  "/teknisi/kolam": {
    id: "P39",
    label: "Kolam saya",
    group: "Teknisi",
    icon: Waves,
    parent: "/teknisi",
    description: "Melihat kondisi kolam yang dipegang.",
  },
} satisfies Record<string, PageInfo>;

export type PageRoute = keyof typeof PAGE_MAP;
export const PAGES: Record<PageRoute, PageInfo> = PAGE_MAP;

/** Menu sidebar pemilik (01-PRD §5b). Menu teknisi menyusul di T11. */
export const NAVIGATION: { group: string; routes: PageRoute[] }[] = [
  { group: "Pantau", routes: ["/dasbor", "/peringatan", "/kolam"] },
  { group: "Lab", routes: ["/lab/unggah", "/lab"] },
  { group: "Tim", routes: ["/tugas", "/tim"] },
  { group: "Tambak", routes: ["/lokasi", "/laporan"] },
];

/** Link menu aktif untuk halaman itu sendiri dan semua sub-halamannya. */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Cocokkan URL nyata (mis. /kolam/9b1d.../siklus) ke rute di PAGES. */
export function matchPage(pathname: string): PageInfo | undefined {
  const parts = pathname.split("/").filter(Boolean);
  const dynamicCount = (key: string) => (key.match(/\[/g) ?? []).length;
  const matches = (Object.keys(PAGES) as PageRoute[]).filter((key) => {
    const pattern = key.split("/").filter(Boolean);
    return pattern.length === parts.length && pattern.every((seg, i) => seg.startsWith("[") || seg === parts[i]);
  });
  // Segmen statis menang atas param dinamis (/lab/unggah bukan /lab/[x]).
  matches.sort((a, b) => dynamicCount(a) - dynamicCount(b));
  return matches[0] ? PAGES[matches[0]] : undefined;
}
