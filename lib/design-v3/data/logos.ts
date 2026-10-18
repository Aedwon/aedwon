// Which file to show for each logo in public/logos, so the page never asks for a file that is not there.
// `light` is for light backgrounds (the dark-ink file when there is one); `dark` is the white version, where one exists.
// A test checks this list against the folder, so adding a logo means adding a line here.

export const LOGOS: Record<string, { light: string; dark?: string }> = {
  'ayala-malls': { light: '/logos/ayala-malls.svg' },
  'chronos': { light: '/logos/chronos.webp' },
  'converge': { light: '/logos/converge.svg' },
  'dls': { light: '/logos/dls-light.svg', dark: '/logos/dls-dark.svg' },
  'dost': { light: '/logos/dost.svg' },
  'ee': { light: '/logos/ee-light.svg', dark: '/logos/ee-dark.svg' },
  'estudyante-esports': { light: '/logos/estudyante-esports-light.svg', dark: '/logos/estudyante-esports-dark.svg' },
  'hotel101': { light: '/logos/hotel101.webp' },
  'hoyoverse': { light: '/logos/hoyoverse.svg' },
  'ilocos-sur': { light: '/logos/ilocos-sur.webp' },
  'lgu-norala': { light: '/logos/lgu-norala.webp' },
  'mihoyo': { light: '/logos/mihoyo.svg' },
  'moonton': { light: '/logos/moonton-light.svg', dark: '/logos/moonton-dark.svg' },
  'msi': { light: '/logos/msi.svg' },
  'oppo': { light: '/logos/oppo.svg' },
  'pshs': { light: '/logos/pshs.svg' },
  'psysc': { light: '/logos/psysc.svg' },
  'riot-games': { light: '/logos/riot-games.svg' },
  'riot-games-alt': { light: '/logos/riot-games-alt.svg' },
  'sm-supermalls': { light: '/logos/sm-supermalls.svg' },
  'smart': { light: '/logos/smart.svg' },
  'up-diliman': { light: '/logos/up-diliman.svg' },
  'up-fair': { light: '/logos/up-fair.webp' },
  'up-kugihan': { light: '/logos/up-kugihan.webp' },
  'up-maroons': { light: '/logos/up-maroons.svg' },
  'zowie': { light: '/logos/zowie.svg' },
};

export const logoUrl = (name: string, onDark = false): string => {
  const l = LOGOS[name];
  return l ? (onDark && l.dark ? l.dark : l.light) : `/logos/${name}.svg`;
};

// Load the logos ahead of time, so a page turn shows them at once instead of drawing them in.
const warmed = new Set<string>();
export function preloadLogos(names: string[]) {
  if (typeof window === 'undefined') return;
  for (const n of names) {
    const url = logoUrl(n);
    if (!n || warmed.has(url)) continue;
    warmed.add(url);
    const img = new Image();
    img.decoding = 'sync';
    img.src = url;
  }
}
