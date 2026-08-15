export const profile = {
  name: "Vinod Kumar Peddi",
  shortName: "Vinod Kumar",
  role: "Software Engineer",
  company: "EverUptime",
  companyUrl: "https://www.linkedin.com/company/everuptime",
  focus: "Full-stack · Backend · Distributed systems",
  location: "Andhra Pradesh, India",
  availability: "Software Engineer at EverUptime",
  email: "vinod783058@gmail.com",
  siteUrl: "https://vinodkumarpeddi.vercel.app",
  resumeUrl: "/Vinod_Resume.pdf",
  githubUser: "vinodkumarpeddi",
  statement:
    "I build systems that stay correct under load, failure and time — and products that make them feel effortless.",
  socials: [
    { label: "GitHub", href: "https://github.com/vinodkumarpeddi", handle: "@vinodkumarpeddi" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/vinod-kumar-peddi-4a34b7262/",
      handle: "vinod-kumar-peddi",
    },
    { label: "X", href: "https://x.com/vinod_kumar_200", handle: "@vinod_kumar_200" },
  ],
  codingProfiles: [
    { label: "LeetCode", href: "https://leetcode.com/vinod_kumar123/", note: "300+ problems" },
    { label: "GeeksforGeeks", href: "https://www.geeksforgeeks.org/", note: "100+ problems" },
    { label: "CodeChef", href: "https://www.codechef.com/users/vinod783058", note: "" },
    { label: "HackerRank", href: "https://www.hackerrank.com/22A91A12B3", note: "" },
  ] as { label: string; href: string; note: string }[],
};

export const navigation = [
  { id: "work", label: "Work", index: "02" },
  { id: "experience", label: "Experience", index: "03" },
  { id: "systems", label: "Systems", index: "04" },
  { id: "about", label: "About", index: "06" },
  { id: "contact", label: "Contact", index: "07" },
] as const;

export const sections = [
  { id: "intro", label: "Intro", index: "01" },
  { id: "work", label: "Selected work", index: "02" },
  { id: "experience", label: "Experience", index: "03" },
  { id: "systems", label: "Systems", index: "04" },
  { id: "mindset", label: "Mindset", index: "05" },
  { id: "about", label: "About", index: "06" },
  { id: "contact", label: "Connect", index: "07" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
