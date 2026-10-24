import { Hero } from "@/components/marketing/sections/hero";
import { Impact } from "@/components/marketing/sections/impact";
import { Reasons } from "@/components/marketing/sections/reasons";
import { Research } from "@/components/marketing/sections/research";
import { Scale } from "@/components/marketing/sections/scale";
import { Statement } from "@/components/marketing/sections/statement";
import { Steps } from "@/components/marketing/sections/steps";

export default function Page() {
  return (
    <>
      <Hero />
      <Statement />
      <Impact />
      <Steps />
      <Scale />
      <Reasons />
      <Research />
    </>
  );
}
