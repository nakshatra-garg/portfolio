import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Flagship } from "@/components/Flagship";
import { WorkRail } from "@/components/WorkRail";
import { SectionTitle } from "@/components/Reveal";
import { Overview, Experience, SkillsEducation, Writing } from "@/components/Sections";
import { Story } from "@/components/Story";
import { Closing } from "@/components/Closing";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Overview />
      <section id="work" aria-labelledby="work-title" className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8">
        <SectionTitle eyebrow="Case study" id="work-title" title={<>Systems that ship,<br /><span className="grad-text">measured in production.</span></>} />
        <Flagship />
      </section>
      <WorkRail />
      <Story />
      <Experience />
      <SkillsEducation />
      <Writing />
      <Closing />
    </>
  );
}
