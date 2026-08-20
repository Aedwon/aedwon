export interface RoleItem {
  title: string;
  period: string;
  description: string;
}

export interface ExperienceEntity {
  id: string;
  name: string;
  shortName: string;
  roles: RoleItem[];
}

export const EXPERIENCES: ExperienceEntity[] = [
  {
    id: "psysc",
    name: "Philippine Society of Youth Science Clubs (PSYSC)",
    shortName: "PSYSC",
    roles: [
      {
        title: "Marketing Associate",
        period: "Feb 2024 to Present",
        description:
          "Secured corporate sponsorships generating over ₱800,000 in funding for a national science competition.",
      },
      {
        title: "Regional Head, Region I/II/NCR",
        period: "May 2024 to Sep 2024",
        description:
          "Directed regional elimination rounds and MathSciAKa workshops, coordinating 30+ volunteers.",
      },
      {
        title: "Science Olympiad Core, National Science Club Month 2024",
        period: "May 2024 to Sep 2024",
        description:
          "Co-authored 500+ questions and built the automated scoring model evaluating 4,000+ competitors across regional and national elimination rounds.",
      },
      {
        title: "Competitions Core, STEM Expo 2024",
        period: "Mar 2024 to Jun 2024",
        description:
          "Managed logistical schedules and bracket workflows across 5 STEM contest categories.",
      },
    ],
  },
  {
    id: "moonton",
    name: "Moonton Student Leaders Philippines",
    shortName: "MOONTON Games",
    roles: [
      {
        title: "Tournament Director & Head of League Operations, MSL Collegiate Cup",
        period: "Nov 2023 to Jul 2025",
        description:
          "Directed tournament operations for 3,000+ collegiate competitors across 180+ universities, writing a custom Discord bot that automated match check-ins and cut admin overhead by 90%.",
      },
      {
        title: "National Admin for Partnerships & Network Head",
        period: "Jan 2024 to May 2026",
        description:
          "Founded The MSL Network (10,000+ members) across 80+ partner student esports orgs, managing a portfolio of 70+ ongoing collaborations.",
      },
      {
        title: "Administrative Assistant & Database Manager",
        period: "Feb 2022 to Nov 2023",
        description:
          "Maintained centralized records for 10,000+ student members nationwide and automated reporting workflows to cut manual processing time by 70%.",
      },
      {
        title: "UP Diliman Community Manager",
        period: "Sep 2020 to Feb 2022",
        description:
          "Organized 30+ campus tournaments and community events for 400+ student players.",
      },
    ],
  },
  {
    id: "up-fighting-maroons",
    name: "UP Fighting Maroons",
    shortName: "UP Fighting Maroons",
    roles: [
      {
        title: "Vice Chairman",
        period: "Oct 2024 to May 2025",
        description:
          "Directed organizational operations and represented the varsity team in official university and external partner engagements.",
      },
      {
        title: "Co-Founder & Head of Marketing",
        period: "Aug 2024 to May 2025",
        description:
          "Secured varsity sponsorships with Converge, MSI, Hotel101, and Chronos Athletics, while directing jersey merchandising that generated ₱150,000+ in profit from 200+ units. Managed team social media channels to reach 2,000+ followers in season 1.",
      },
    ],
  },
  {
    id: "up-oblation-esports",
    name: "UP Oblation Esports",
    shortName: "UP Oblation Esports",
    roles: [
      {
        title: "Team Manager, Mobile Legends: Bang Bang",
        period: "Oct 2024 to May 2025",
        description:
          "Coordinated player scrimmage schedules and official tournament participation.",
      },
      {
        title: "Head Analyst",
        period: "Nov 2022 to Jul 2024",
        description:
          "Built analytical player performance tracking tools and led opponent video review.",
      },
    ],
  },
  {
    id: "dark-league-studios",
    name: "Dark League Studios",
    shortName: "Dark League Studios",
    roles: [
      {
        title: "Project Manager",
        period: "Oct 2024 to Jun 2025",
        description:
          "Directed tournament operations for Estudyante Esports: The National Championships (₱1.5M+ funding across 4 game titles), managing publisher relations, venue vendors, and sponsor commitments. Managed PBA Esports Bakbakan (Dota 2 & Tekken 8), OPPO Smooth Legend Cup, and ZOWIE Perfect Play Night.",
      },
    ],
  },
  {
    id: "up-fair",
    name: "UP Fair 2024",
    shortName: "UP Fair 2024",
    roles: [
      {
        title: "Co-Head for Logistics & Security",
        period: "Nov 2023 to Feb 2024",
        description:
          "Co-led venue logistics and safety for a week-long music festival with 90,000+ attendees, managing 50+ on-site logistics and security personnel across entry control and stage zones.",
      },
    ],
  },
  {
    id: "hoyoverse",
    name: "miHoYo (HoYoverse)",
    shortName: "miHoYo (HoYoverse)",
    roles: [
      {
        title: "Discord Moderator, Genshin Impact SEA",
        period: "Oct 2023 to Dec 2024",
        description:
          "Moderated the official 100,000+ member Southeast Asia server for Genshin Impact.",
      },
    ],
  },
];
