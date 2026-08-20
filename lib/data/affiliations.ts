export interface AffiliationBadge {
  name: string;
  tooltip: string;
  logo: string;
  adaptive?: boolean;
  width?: number;
}

export interface AffiliationGroup {
  category: string;
  items: AffiliationBadge[];
}

export const AFFILIATION_GROUPS: AffiliationGroup[] = [
  {
    category: "Organizations & LGUs",
    items: [
      { name: "PSYSC", tooltip: "Philippine Society of Youth Science Clubs (PSYSC)", logo: "/logos/psysc.svg", width: 82 },
      { name: "MOONTON", tooltip: "MOONTON Games (Moonton Student Leaders)", logo: "/logos/moonton.svg", width: 200 },
      { name: "Dark League Studios", tooltip: "Dark League Studios", logo: "/logos/dls.svg", width: 82 },
      { name: "Estudyante Esports", tooltip: "Estudyante Esports (Dark League Studios)", logo: "/logos/estudyante-esports.svg", width: 190 },
      { name: "miHoYo", tooltip: "miHoYo (HoYoverse)", logo: "/logos/hoyoverse.svg", adaptive: true, width: 198 },
      { name: "UP Diliman", tooltip: "University of the Philippines Diliman", logo: "/logos/up-diliman.svg", width: 82 },
      { name: "UP Fighting Maroons", tooltip: "UP Fighting Maroons (UP Esports Varsity Team)", logo: "/logos/up-maroons.svg", width: 82 },
      { name: "UP Fair", tooltip: "UP Fair", logo: "/logos/up-fair.webp", width: 82 },
      { name: "UP Kugihan", tooltip: "UP Kugihan", logo: "/logos/up-kugihan.webp", width: 82 },
      { name: "DOST-SEI", tooltip: "Department of Science and Technology (DOST-SEI)", logo: "/logos/dost.svg", width: 82 },
      { name: "PSHS (Pisay)", tooltip: "Philippine Science High School (PSHS)", logo: "/logos/pshs.svg", width: 82 },
      { name: "Ilocos Sur", tooltip: "Provincial Government of Ilocos Sur", logo: "/logos/ilocos-sur.webp", width: 182 },
      { name: "LGU Norala", tooltip: "Municipality of Norala, South Cotabato", logo: "/logos/lgu-norala.webp", width: 150 },
    ],
  },
  {
    category: "Event & Brand Partners",
    items: [
      { name: "Riot Games", tooltip: "Riot Games", logo: "/logos/riot-games.svg", width: 160 },
      { name: "Ayala Malls", tooltip: "Ayala Malls (Circuit Makati)", logo: "/logos/ayala-malls.svg", adaptive: true, width: 200 },
      { name: "SM Supermalls", tooltip: "SM Supermalls (SM City Manila & SM City Butuan)", logo: "/logos/sm-supermalls.svg", width: 200 },
      { name: "Smart", tooltip: "Smart Communications (Smart Giga Arena)", logo: "/logos/smart.svg", width: 200 },
      { name: "Converge", tooltip: "Converge ICT Solutions", logo: "/logos/converge.svg", adaptive: true, width: 186 },
      { name: "MSI", tooltip: "MSI (Micro-Star International)", logo: "/logos/msi.svg", adaptive: true, width: 164 },
      { name: "Hotel101", tooltip: "Hotel101 Group", logo: "/logos/hotel101.webp", width: 82 },
      { name: "OPPO", tooltip: "OPPO", logo: "/logos/oppo.svg", width: 200 },
      { name: "BenQ ZOWIE", tooltip: "BenQ ZOWIE", logo: "/logos/zowie.svg", width: 82 },
      { name: "Chronos Athletics", tooltip: "Chronos Athletics", logo: "/logos/chronos.webp", width: 82 },
    ],
  },
];
