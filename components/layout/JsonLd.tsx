import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export function JsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: profile.siteUrl,
    email: `mailto:${profile.email}`,
    jobTitle: profile.role,
    worksFor: { "@type": "Organization", name: profile.company, url: profile.companyUrl },
    address: { "@type": "PostalAddress", addressRegion: "Andhra Pradesh", addressCountry: "IN" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Aditya Engineering College" },
    sameAs: profile.socials.map((s) => s.href),
    knowsAbout: ["Software engineering", "Distributed systems", "Node.js", "PostgreSQL", "Redis", "RabbitMQ", "React", "Next.js", "TypeScript", "Docker"],
  };
  const site = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: profile.name,
    url: profile.siteUrl,
    description: "Portfolio of Vinod Kumar Peddi, software engineer.",
    author: { "@type": "Person", name: profile.name },
  };
  const works = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: p.title,
        description: p.tagline,
        codeRepository: p.github,
        url: `${profile.siteUrl}/work/${p.slug}`,
        programmingLanguage: p.technologies.slice(0, 4).join(", "),
      },
    })),
  };
  return (
    <>
      {[person, site, works].map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
    </>
  );
}
