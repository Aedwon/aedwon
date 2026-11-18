// A written post's own page does not draw its paper card: the left page already shows the date, title,
// description and reading time, so the essay starts at the top. A real hero picture is still shown.
// Lists and thumbnails keep the card.
export const hasHeroStage = (p: { post?: boolean; hero?: { src?: string } | null }) => !p.post || !!p.hero?.src;
