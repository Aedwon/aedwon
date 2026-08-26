export const SITE_URL = "https://www.aedwon.com";
export const SITE_NAME = "Aedwon";
export const PERSON_NAME = "Aerol Balayon";
export const SITE_LAST_MODIFIED = new Date("2026-08-27T00:00:00.000Z");
export const SITE_DESCRIPTION =
  "Personal software portfolio for Aerol Balayon (Aedwon), covering mobile and offline systems, Discord automation, civic technology, web tools, and technical writing.";

export const CONTACT = {
  email: "aerol.balayon@gmail.com",
  github: "https://github.com/Aedwon",
  linkedin: "https://linkedin.com/in/aedwon",
  discord: "@aedwon",
} as const;

export interface TrustLink {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
}

export interface TrustSection {
  heading: string;
  paragraphs: string[];
  links?: TrustLink[];
}

export interface TrustPageContent {
  title: string;
  description: string;
  intro: string;
  sections: TrustSection[];
}

export const ABOUT_CONTENT: TrustPageContent = {
  title: "About",
  description:
    "Background, engineering approach, and current areas of work for Aerol Balayon (Aedwon).",
  intro:
    "I'm Aerol Balayon, also known online as Aedwon. I studied Computer Science at UP Diliman on a DOST Merit Scholarship after attending Philippine Science High School. This site is my working portfolio: it documents software I have built, the constraints behind those systems, and technical notes from projects that are far enough along to describe accurately.",
  sections: [
    {
      heading: "What I build",
      paragraphs: [
        "My recent work spans offline-first mobile software, Discord automation, civic and public-service interfaces, browser tools, and event systems. Pantas is an Android-first exam reviewer with encrypted local study state and on-device FSRS-6 scheduling. The MSL Network Bot is a Discord system connecting account verification with XP, Event Points, events, quests, moderation, and reporting. Other projects on this site include QR Studio, an offline Android TV survey kiosk, scoring and tournament automation, and static client-side utilities.",
        "I also contribute to BetterGov PH, a civic-tech initiative focused on modernizing Philippine government web services and open public data. The portfolio separates current, implemented behavior from planned work; unfinished runtime paths are called out rather than presented as shipped features.",
      ],
    },
    {
      heading: "How I work",
      paragraphs: [
        "I spend a large share of project time on research and planning before writing code. I care about choosing architecture that fits the actual operating constraints, whether that means an encrypted local database, a persistent offline queue, a small static web application, or a single-server Discord service. My daily agentic engineering stack includes Claude Code, Codex, the using-superpowers skill framework, Matt Pocock's engineering skills, and Gemini's Deep Research.",
        "Outside software, my experience includes science-competition operations, collegiate esports, partnerships, event logistics, and community management. Those environments are why many of the projects here emphasize reliability, administrative workflows, offline behavior, and reducing repetitive operator work.",
      ],
    },
    {
      heading: "Where to look next",
      paragraphs: [
        "The project directory is the best source for implementation details and current project status. The blog contains longer technical notes. For a concise machine-readable map of the site, agents can use llms.txt or sitemap.xml.",
      ],
      links: [
        { label: "Projects", href: "/projects", description: "Canonical project directory and case studies." },
        { label: "Blogs", href: "/blogs", description: "Technical notes and architecture writeups." },
        { label: "Contact", href: "/contact", description: "Public ways to reach me." },
      ],
    },
  ],
};

export const CONTACT_CONTENT: TrustPageContent = {
  title: "Contact",
  description: "Public contact channels for Aerol Balayon (Aedwon).",
  intro:
    "This is a personal portfolio, not a company support desk. The most reliable way to reach me about software projects, open-source work, community infrastructure, or a technical question related to something published here is email. I also keep public profiles on GitHub and LinkedIn, and I use the Discord handle @aedwon.",
  sections: [
    {
      heading: "Contact channels",
      paragraphs: [
        "Email is best when the message needs context or a reply outside a platform. GitHub is appropriate for repository-specific discussion, issues, or code. LinkedIn works for professional introductions. Discord is useful when we already share a community or project context. I do not publish a phone number or physical business address because this site represents me as an individual, not a registered organization or storefront.",
      ],
      links: [
        { label: "Email", href: `mailto:${CONTACT.email}`, description: CONTACT.email, external: true },
        { label: "GitHub", href: CONTACT.github, description: "github.com/Aedwon", external: true },
        { label: "LinkedIn", href: CONTACT.linkedin, description: "linkedin.com/in/aedwon", external: true },
      ],
    },
    {
      heading: "What to include",
      paragraphs: [
        "For a project inquiry, include the problem you are trying to solve, the expected users, any hard platform or deadline constraints, and links to material I should review. For a question about a portfolio project, name the project and the specific implementation detail you are asking about. I do not use a contact form on this site, so sending an email or using one of the linked platforms is the only information you intentionally submit to me through these contact paths.",
        "Messages are handled personally. I cannot promise a response to every unsolicited request, and this page should not be interpreted as a service-level agreement or commercial support commitment.",
      ],
    },
  ],
};

export const PRIVACY_CONTENT: TrustPageContent = {
  title: "Privacy",
  description: "Privacy notes for the Aedwon personal portfolio.",
  intro:
    "Aedwon.com is a personal portfolio and does not currently provide accounts, a contact form, purchases, or other features that ask you to submit personal information directly on the site. Vercel Speed Insights is enabled to measure site performance. This version of the portfolio does not deliberately initialize PostHog, Microsoft Clarity, or Vercel Web Analytics in the application interface.",
  sections: [
    {
      heading: "What the site handles",
      paragraphs: [
        "The site is hosted through web infrastructure that may process ordinary request information needed to deliver pages, such as an IP address, user agent, requested URL, timestamp, and network diagnostics. Performance telemetry may also be processed by Vercel Speed Insights. That infrastructure-level processing is separate from a portfolio feature collecting information from you. This site does not currently set up a user database, newsletter list, advertising profile, or first-party contact-form submission store.",
        "If you choose an email link, GitHub link, LinkedIn link, Discord handle, or another external project link, your interaction leaves this site and is governed by the policies and account settings of that service. Email messages you send are processed by the mail providers used by the sender and recipient.",
      ],
    },
    {
      heading: "Changes and questions",
      paragraphs: [
        "If tracking, forms, accounts, or another data-collection feature is enabled later, this page should be updated before that feature is treated as part of the public portfolio. Questions about this page can be sent to the public email address on the contact page. The goal is to keep the statement aligned with what the deployed site actually does instead of publish a generic business privacy template that claims systems this portfolio does not have.",
      ],
      links: [
        { label: "Contact", href: "/contact", description: "Public contact channels." },
      ],
    },
  ],
};

export const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: PERSON_NAME,
  alternateName: SITE_NAME,
  url: SITE_URL,
  email: `mailto:${CONTACT.email}`,
  sameAs: [CONTACT.github, CONTACT.linkedin],
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of the Philippines Diliman" },
    { "@type": "EducationalOrganization", name: "Philippine Science High School" },
  ],
  knowsAbout: [
    "Software engineering",
    "Offline-first applications",
    "Discord automation",
    "Civic technology",
    "Web development",
  ],
  description: SITE_DESCRIPTION,
} as const;

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  author: { "@id": `${SITE_URL}/#person` },
  inLanguage: "en",
} as const;
