import { Manrope } from "next/font/google";
import "@/styles/landing.css";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

// Font hanya untuk area landing (08-DESIGN Typography, Area Landing).
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`landing ${manrope.variable}`}>
      <SmoothScroll>
        <Navbar />
        <main id="konten">{children}</main>
        <Footer />
      </SmoothScroll>
    </div>
  );
}
