import type { Metadata } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({ subsets: ["latin"], display: "swap", variable: "--font-onest" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "AquaSeq | Pemantau risiko kolam udang", template: "%s · AquaSeq" },
  description: "Hasil qPCR air tambak jadi skor risiko per kolam dan tugas untuk teknisi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className={`${onest.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
