import type { Metadata } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const onest = Onest({ subsets: ["latin"], display: "swap", variable: "--font-onest" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-jetbrains" });

const description = "Data eDNA air tambak jadi skor risiko per kolam dan tugas untuk teknisi.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "AquaSeq | Pemantau risiko kolam udang", template: "%s · AquaSeq" },
  description,
  openGraph: { type: "website", locale: "id_ID", siteName: "AquaSeq", title: "AquaSeq", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className={`${onest.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
