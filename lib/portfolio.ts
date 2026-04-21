// Shared, single-source-of-truth content used across all three themes
// (Minimalist, Sticker/Neubrutalist, Server/Discord). Keep copy and facts here
// so theme fallbacks cannot drift from the Minimalist voice.

export const STATS = {
    BOT_COUNT: 4,
    MODERATED_MEMBERS: "170,000+",
    SERVER_COUNT: 6,
} as const;

export const BRANDING = {
    name: "Aedwon",
    studio: "A STUDIO OF ONE",
    colophon: "Independent designer & developer building sites that convert and systems that stay.",
} as const;

export const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Web Solutions", href: "/web-solutions" },
    { label: "Community Solutions", href: "/community-solutions" },
    { label: "The Process", href: "/process" },
    { label: "Book a call", href: "/contact", isCTA: true },
] as const;

export const FOOTER = {
    copyright: `© ${new Date().getFullYear()} Aedwon`,
    tagline: "Independent builder · Digital artisan",
    credits: "Built in Next 16 · Source available",
    allRightsReserved: "All rights reserved.",
} as const;

export const HERO = {
    kicker: "A STUDIO OF ONE",
    title: "A brand sells twice: once to the stranger, once to the regular.",
    titleItalic: "I build for both sales.",
    subtitle:
        "Web solutions that make strangers pick you. Community systems that make regulars stay. Both together, if that's what the work needs.",
    webPanel: {
        label: "The stranger sale",
        headline: "High-performance sites that turn traffic into trust.",
        bullets: ["Lighthouse 90+", "Accessibility AA", "SEO Optimized"],
        cta: "The stranger sale →",
    },
    communityPanel: {
        label: "The regular sale",
        headline: "Bots, moderation, and rituals that make members come back in month eight.",
        bullets: [
            `${STATS.BOT_COUNT} bots in production`,
            `${STATS.MODERATED_MEMBERS} members moderated`,
        ],
        cta: "The regular sale →",
    },
} as const;

export const CTA = {
    kicker: "START",
    title: "Still here?",
    subtitle:
        "Then we should probably talk. Fifteen minutes. I'll tell you honestly if I can help — and if I can't, who might.",
    button: "Book a discovery call",
} as const;

export const SECTION_HEADINGS = {
    howItWorks: {
        title: "Five rooms. I leave the doors open.",
        subtitle: "Same five steps for web and community work.",
    },
    whoThisIsFor: {
        title: "Short list. Pick yourself off of it, or don't.",
        rightFitLabel: "Right fit",
        probablyNotLabel: "Probably not",
    },
    faq: {
        title: "A few things people ask.",
        subtitle: "If yours isn't here, the form at /contact is open.",
    },
    featuredProjects: {
        title: "Selected work.",
        subtitle: "A sampler. Deeper cuts live on the dedicated pages.",
    },
} as const;

export const STEPS = [
    {
        id: 1,
        step: "01",
        title: "Diagnostic",
        subtitle: "Figure out what's actually broken",
        description:
            "Two weeks. I look at what you have — site, server, tools, data. I write up what's working, what isn't, and what I'd build next.",
        short: "Two weeks. I look at what you have and write up what I'd build next.",
        outcome: "You get a plan you can give to anyone — me, a hire, or nobody.",
        footnote: "Sold on its own, this step is what /web-solutions calls the Audit tier.",
    },
    {
        id: 2,
        step: "02",
        title: "Blueprint",
        subtitle: "Agree on the shape before I touch it",
        description:
            "One document. Scope, deliverables, timeline, price. Signed off before the first commit. No surprise line items later.",
        short: "One document. Scope, price, timeline — signed before the first commit.",
        outcome: "You know exactly what you're paying for and when it arrives.",
    },
    {
        id: 3,
        step: "03",
        title: "Build",
        subtitle: "I work in staging. You watch in public",
        description:
            "I work in staging. You watch in public. Weekly demos, screen recordings, live links. Nothing goes live without you pressing the button.",
        short: "I work in staging. You watch in public. Weekly demos, every step of the way.",
        outcome: "No \"big reveal.\" No launch-day surprises. You've already seen it.",
    },
    {
        id: 4,
        step: "04",
        title: "Launch",
        subtitle: "We go live, and I stick around",
        description:
            "Deploy. Write the docs. Train whoever runs it after me. 30 days of post-launch support — bugs, questions, tweaks — included.",
        short: "Deploy, document, train. Thirty days of post-launch support, included.",
        outcome: "The thing works, and the people who need to use it know how.",
    },
    {
        id: 5,
        step: "05",
        title: "Operate",
        subtitle: "I keep running it, or I hand it off clean",
        description:
            "Month-to-month retainer, or a clean handoff. Both are real options. The right one depends on who's doing the work in month three.",
        short: "Month-to-month retainer, or a clean handoff. Both are real options.",
        outcome: "No vendor lock-in. You stay in control of the decision, always.",
    },
] as const;

// ============================================================================
// Projects — real portfolio, not fabrications
// ============================================================================

export type FeaturedProject = {
    title: string;
    labels: string[];
    description: string;
    href: string;
    url?: string;
};

export const FEATURED_PROJECTS: FeaturedProject[] = [
    {
        title: "MSL 2026",
        labels: ["LIVE", "WEB · REDESIGN", "Next"],
        description:
            "Site redesign for Moonton Student Leaders PH. Faster, cleaner, and easier to maintain than the template it replaced.",
        href: "/web-solutions",
        url: "https://msl2026.vercel.app",
    },
    {
        title: "The MSL Network Discord",
        labels: ["LIVE", "COMMUNITY · OPERATOR", "5,000+"],
        description:
            "The Philippines hub for Mobile Legends: Bang Bang players. Currently running it — structure, rituals, growth.",
        href: "/community-solutions",
    },
    {
        title: "QR Studio",
        labels: ["LIVE TOOL", "CLIENT-SIDE", "Next"],
        description:
            "Customizable QR generator with gradients, logo embedding, and SVG/PNG/JPEG export. All processing stays in the browser.",
        href: "/web-solutions",
        url: "https://qr-code.aedwon.com",
    },
];

export type WebProject = {
    id: number;
    title: string;
    description: string;
    metric: string;
    tags: string[];
    category: "E-Commerce" | "Corporate" | "SaaS" | "Redesign" | "Tool";
    url?: string;
};

export const WEB_PROJECTS: WebProject[] = [
    {
        id: 1,
        title: "MSL 2026",
        description:
            "Site redesign for Moonton Student Leaders PH. Faster load, cleaner typography, and a CMS-light structure a small team can maintain without me.",
        metric: "Live",
        tags: ["Next.js", "Tailwind", "Redesign"],
        category: "Redesign",
        url: "https://msl2026.vercel.app",
    },
    {
        id: 2,
        title: "Lakambini Events",
        description:
            "Site redesign for an events studio. Simpler navigation, fewer clicks to book, and copy rewritten so the offer reads in ten seconds.",
        metric: "Live",
        tags: ["Next.js", "Tailwind", "Redesign"],
        category: "Redesign",
        url: "https://lakambini-redesign.vercel.app",
    },
    {
        id: 3,
        title: "QR Studio",
        description:
            "Customizable QR code generator with gradients, logo embedding, and SVG/PNG/JPEG export. All processing stays in the browser — nothing uploaded.",
        metric: "Client-side",
        tags: ["Next.js", "Canvas", "Tool"],
        category: "Tool",
        url: "https://qr-code.aedwon.com",
    },
    {
        id: 4,
        title: "Kiosk survey (offline-first)",
        description:
            "Tablet app for a live event. PWA that works without signal, syncs later, and stays up through a full day in a room full of real people.",
        metric: "Field-tested",
        tags: ["Next.js", "PWA", "Offline"],
        category: "Tool",
        url: "https://kiosk-survey-three.vercel.app",
    },
];

export const WEB_CATEGORIES = ["All", "Redesign", "Tool"] as const;

// ============================================================================
// Community — bots, tooling, ops
// ============================================================================

export type CommunityBot = {
    title: string;
    labels: string[];
    description: string;
    url?: string;
};

export const COMMUNITY_BOTS: CommunityBot[] = [
    {
        title: "MSL Network Bot",
        labels: ["LIVE", "5,000+ members", "Discord.py/MySQL"],
        description:
            "Community management bot running in The MSL Network Discord. Verifies membership via Google Sheets, tracks seasonal Event Points, and runs daily interactive quests.",
    },
    {
        title: "MSL Collegiate Cup Bot",
        labels: ["LIVE", "3,271 members", "Discord.py/Sheets"],
        description:
            "Tournament bot for the MSL Collegiate Cup. Automates MLBB match sessions, student verification, and multi-category support ticketing with HTML transcripts.",
    },
    {
        title: "Ilocos Sur Festival Esports Bot",
        labels: ["ARCHIVED", "253 players", "Discord.py/MySQL"],
        description:
            "Tournament and community bot for the Ilocos Sur Provincial Government. Synced Discord registrations with Challonge brackets for MLBB and CODM, with integrated support ticketing.",
    },
    {
        title: "OPPO Hyper Legend Cup Bot",
        labels: ["ARCHIVED", "32 teams", "Discord.py/MySQL"],
        description:
            "Tournament-grade community bot for OPPO Philippines. Streamlined player verification, team management, and automated support workflows.",
    },
    {
        title: "Commands reference site",
        labels: ["LIVE TOOL", "INTERNAL", "Next"],
        description:
            "Public command docs for one of my bot stacks. Built so moderators stop DMing me.",
    },
    {
        title: "Kiosk survey (offline-first)",
        labels: ["LIVE", "FIELD-TESTED", "Next/PWA"],
        description:
            "Tablet app for a live event. Same shape of problem as community software — systems for rooms full of real people.",
        url: "https://kiosk-survey-three.vercel.app",
    },
];

export type CommunityOp = {
    title: string;
    labels: string[];
    description: string;
};

export const COMMUNITY_OPS: CommunityOp[] = [
    {
        title: "The MSL Network Discord",
        labels: ["LIVE", "5,000+ members", "OPERATOR"],
        description:
            "The Philippines hub for Mobile Legends: Bang Bang players. Currently running it — structure, rituals, growth. Headcount climbing daily.",
    },
    {
        title: "Genshin Impact SEA",
        labels: ["OFFICIAL SERVER", "100,000+ members", "MODERATOR"],
        description:
            "Staff moderation on the official Southeast Asia Discord for Genshin Impact. Keeping conversations warm at six-figure scale — where triage matters more than rulebooks.",
    },
    {
        title: "Blue Protocol: Star Resonance",
        labels: ["OFFICIAL SERVER", "60,000+ members", "COMMUNITY MGR"],
        description:
            "Community Manager on the official Discord for Blue Protocol: Star Resonance. Announcements, ritual cadences, and incident mediation across a global audience.",
    },
];

// ============================================================================
// Pricing — must match what Minimalist shows. One source, three themes.
// ============================================================================

export type Tier = {
    name: string;
    tagline: string;
    price: string;
    priceSuffix?: string;
    pricePrefix?: string;
    description: string;
    features: string[];
    cta: string;
    popular?: boolean;
};

export const WEB_TIERS: Tier[] = [
    {
        name: "Audit",
        tagline: "Start with a plan",
        price: "$800",
        priceSuffix: "USD",
        description:
            "Two weeks. I look at what you have. I write up what's broken, what's working, and what I'd build next. You get a plan you can give to anyone — me, a hire, or nobody.",
        features: [
            "Two-week diagnostic",
            "Written plan with scope and priorities",
            "Actionable even if we don't work together",
        ],
        cta: "Start an audit",
    },
    {
        name: "Build",
        tagline: "Fixed-scope build",
        price: "$4,500",
        pricePrefix: "From",
        priceSuffix: "USD",
        description:
            "One site, one funnel, one product. Discovery, spec, weekly staging demos, deploy, 30 days of post-launch support.",
        features: [
            "Spec signed before first commit",
            "Weekly staging demos",
            "30 days of post-launch support",
        ],
        cta: "Build my site",
        popular: true,
    },
    {
        name: "Care Plan",
        tagline: "Monthly maintenance",
        price: "$450",
        pricePrefix: "From",
        priceSuffix: "/ mo",
        description:
            "Updates, monitoring, small features. Month-to-month. If it's not earning its keep, cancel it.",
        features: [
            "Managed hosting & updates",
            "Monitoring & monthly health report",
            "Month-to-month — no lock-in",
        ],
        cta: "Get Care Plan",
    },
];

export const COMMUNITY_TIERS: Tier[] = [
    {
        name: "Audit",
        tagline: "Start with a plan",
        price: "$800",
        priceSuffix: "USD",
        description:
            "Two weeks. I join, I watch, I write up what's broken and what to build. You get a plan you can give to anyone — me, a hire, or nobody.",
        features: [
            "Two-week community diagnostic",
            "Written plan with scope and priorities",
            "Actionable even if we don't work together",
        ],
        cta: "Start an audit",
    },
    {
        name: "Automaton",
        tagline: "Bespoke bot dev",
        price: "$3,500",
        pricePrefix: "From",
        priceSuffix: "USD",
        description:
            "Fixed-scope bot build. One specific job, done well. Onboarding flows, leveling systems, moderation stacks, reporting dashboards.",
        features: [
            "Scope signed before first commit",
            "Secure database persistence",
            "30 days of post-launch support",
        ],
        cta: "Develop Automaton",
        popular: true,
    },
    {
        name: "Operator",
        tagline: "Fractional management",
        price: "$1,500",
        pricePrefix: "From",
        priceSuffix: "/ mo",
        description:
            "I run the community with you. Bots, moderation, rituals, reports. Month-to-month, no lock-in — retention earns retention.",
        features: [
            "Strategy, events, and moderation",
            "Bot hosting & incident response",
            "Monthly health reports",
        ],
        cta: "Hire Operator",
    },
];

// ============================================================================
// Pages — shared hero/section copy for non-minimalist fallbacks.
// ============================================================================

export const WEB_PAGE = {
    kicker: "Web Solutions",
    title: "The stranger sale.",
    subtitle:
        "A website has one job: make the right person pick you. I build sites that do that job honestly.",
    workHeading: "Selected web work.",
    workSubtitle:
        "A sampler. Every project on this list shipped and is either still running or a tool you can use right now.",
    standardsHeading: "Standards I hold.",
    standards: [
        "Core Web Vitals in the green. Lighthouse 90+ on launch. When a new marketing script would break that, I'll say so — and you decide.",
        "Accessible by default — WCAG 2.1 AA on every page I touch.",
        "Semantic HTML. Real headings. Alt text that says something.",
    ],
    pricingHeading: "Pricing.",
    pricingFootnote:
        "Priced in USD. Philippine peso equivalent on request. Final scope and number agreed on the discovery call before anything is signed.",
    ctaHeading: "Got a launch coming?",
    ctaSubtitle:
        "If you've got a launch coming and you want it to land, we should talk. Fifteen minutes, no pitch.",
    ctaButton: "Book a discovery call",
} as const;

export const CONTACT = {
    kicker: "Start a Project",
    title: "Start a Project.",
    subtitle:
        "Pick a time, fill in the form, or drop an email. All three get a reply within two business days.",
    calendarUrl: "https://calendar.app.google/n45XYFRHnmzTC5Fr6",
    email: "contact@aedwon.com",
    replyPromise: "Reply within two business days.",
    call: {
        label: "Book a call",
        headline:
            "Fifteen minutes. I'll tell you honestly if I can help. If I can't, I'll tell you who might.",
        button: "Pick a time",
    },
    form: {
        label: "Or write it out",
        helper: "Prefer to think on the page? Fill this out — I reply within two business days.",
        submit: "Send it",
        nameLabel: "Your name",
        emailLabel: "Email",
        projectLabel: "What's the project",
        projectOptions: [
            "A web project",
            "A community project",
            "Both, or I'm not sure yet",
        ],
        goalLabel: "What are you trying to get to",
        goalPlaceholder:
            "A sentence or a pitch deck — both work. Say it however comes easiest.",
    },
    emailSection: {
        label: "Or just email",
        prefix: "Email works too:",
        suffix: "Same two-day reply.",
    },
} as const;

export const COMMUNITY_PAGE = {
    kicker: "Community Solutions",
    title: "Keeping a crowd warm is a different job.",
    subtitle: `${STATS.BOT_COUNT} bots in production. ${STATS.MODERATED_MEMBERS} members moderated across ${STATS.SERVER_COUNT} servers. The ones that stick have structure — roles, rituals, rules that carry their own weight.`,
    botsHeading: "Bots & tooling.",
    botsSubtitle:
        "Software I've built for communities — bots, dashboards, companion tools.",
    trustStatement: "Trusted Experience With Global Gaming Communities",
    opsHeading: "Community ops.",
    opsSubtitle:
        "Communities I've helped run — as operator, moderator, or community manager.",
    whatIHandleHeading: "What I handle.",
    whatIHandle: [
        {
            title: "Structure",
            body: "Roles, permissions, onboarding flows, channel architecture, rituals that don't need me in the room.",
        },
        {
            title: "Software",
            body: "Custom bots (moderation, leveling, economy, reporting), dashboards, integrations with the tools you already use.",
        },
        {
            title: "Steward",
            body: "Day-to-day moderation, escalation playbooks, weekly health reports, event ops. I run it, or I train someone on your side to run it.",
        },
    ],
    whatIHandleFootnote:
        "Not every community needs all three. Most need two. We figure out which on the call.",
    pricingHeading: "Pricing.",
    pricingFootnote:
        "Priced in USD. Philippine peso equivalent on request. Final scope and number agreed on the discovery call before anything is signed.",
    ctaHeading: "Losing sleep over the community?",
    ctaSubtitle:
        "If your community is at the stage where keeping it alive is starting to cost you sleep, that's the right time.",
    ctaButton: "Book a discovery call",
} as const;
