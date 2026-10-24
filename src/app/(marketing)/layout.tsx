import { SoloFrame } from "@/components/solo/solo-frame";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SoloFrame>
      <main className="public-main">{children}</main>
    </SoloFrame>
  );
}
