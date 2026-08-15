import { IntroScene } from "@/components/hero/IntroScene";
import { WorkSection } from "@/components/work/WorkSection";
import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { SystemsSection } from "@/components/systems/TechnologyMap";
import { Principles } from "@/components/principles/Principles";
import { AboutSection } from "@/components/about/AboutSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/layout/JsonLd";

export const revalidate = 86400;

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <main id="main">
        <IntroScene />
        <WorkSection />
        <ExperienceTimeline />
        <SystemsSection />
        <Principles />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
