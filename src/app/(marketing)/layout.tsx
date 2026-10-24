import { Manrope } from "next/font/google";
import "@/styles/landing.css";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { GradualBlur } from "@/components/motion/gradual-blur";
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
        {/* Konten memudar halus di tepi atas dan bawah layar; tiap blur hilang sendiri saat halaman sudah di
            ujungnya (atas: belum digulir). Di bawah navbar (z 40). */}
        <GradualBlur
          target="page"
          position="top"
          height="6rem"
          strength={1.5}
          layers={6}
          tint="color-mix(in srgb, var(--color-landing-canvas) 60%, transparent)"
          autoHide
          zIndex={30}
        />
        <GradualBlur
          target="page"
          position="bottom"
          height="5rem"
          strength={1.5}
          layers={6}
          tint="color-mix(in srgb, var(--color-landing-surface) 55%, transparent)"
          autoHide
          zIndex={30}
        />
      </SmoothScroll>
    </div>
  );
}
