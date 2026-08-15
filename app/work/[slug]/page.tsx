import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { Footer } from "@/components/layout/Footer";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.filter((p) => p.caseStudy).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.caseStudy) return {};
  const title = `${project.title} — case study`;
  return {
    title,
    description: project.tagline,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${title} — ${profile.name}`, description: project.tagline, type: "article", url: `${profile.siteUrl}/work/${project.slug}` },
    twitter: { card: "summary_large_image", title, description: project.tagline },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.caseStudy) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${project.title} — case study`,
    description: project.tagline,
    author: { "@type": "Person", name: profile.name, url: profile.siteUrl },
    url: `${profile.siteUrl}/work/${project.slug}`,
    about: project.technologies,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main id="main">
        <CaseStudy project={project} />
      </main>
      <Footer />
    </>
  );
}
