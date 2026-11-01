"use client";

import type { HomeSectionKey } from "@/lib/types";
import { useDB } from "@/store/db";
import { SectionNo } from "@/components/motion/Kit";
import { Events } from "@/components/site/home/Events";
import { Experience } from "@/components/site/home/Experience";
import { Gallery } from "@/components/site/home/Gallery";
import { Hero } from "@/components/site/home/Hero";
import { Journal } from "@/components/site/home/Journal";
import { Loyalty } from "@/components/site/home/Loyalty";
import { Marquee } from "@/components/site/home/Marquee";
import { MenuPreview } from "@/components/site/home/MenuPreview";
import { ReserveCTA } from "@/components/site/home/ReserveCTA";
import { ShopHighlight } from "@/components/site/home/ShopHighlight";
import { Signature } from "@/components/site/home/Signature";
import { Story } from "@/components/site/home/Story";
import { Testimonials } from "@/components/site/home/Testimonials";

const SECTIONS: Record<HomeSectionKey, () => React.ReactNode> = {
  marquee: Marquee,
  story: Story,
  signature: Signature,
  menuPreview: MenuPreview,
  experience: Experience,
  shop: ShopHighlight,
  events: Events,
  testimonials: Testimonials,
  gallery: Gallery,
  journal: Journal,
  reserve: ReserveCTA,
  newsletter: Loyalty,
};

export default function Home() {
  const sections = useDB((s) => s.settings.sections);
  const UNNUMBERED = ["marquee", "shop", "reserve", "newsletter"];
  let n = 0;
  return (
    <>
      <Hero />
      {sections
        .filter((s) => s.enabled)
        .map((s) => {
          const C = SECTIONS[s.key];
          if (!C) return null;
          if (!UNNUMBERED.includes(s.key)) n += 1;
          return (
            <SectionNo.Provider key={s.key} value={n}>
              <C />
            </SectionNo.Provider>
          );
        })}
      <div className="h-20 sm:h-28" />
    </>
  );
}
