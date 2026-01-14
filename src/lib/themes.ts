export interface Theme {
  id: string;
  name: string;
  emoji: string;
  doodleSvg: string;
  isCustom?: boolean;
}

// Custom theme placeholder - will be populated with user's uploaded image
export const CUSTOM_THEME_ID = 'custom';

export const createCustomTheme = (imageUrl: string): Theme => ({
  id: CUSTOM_THEME_ID,
  name: 'My Photo',
  emoji: '🖼️',
  doodleSvg: `url("${imageUrl}")`,
  isCustom: true,
});

// Default theme - hearts, stars, squiggles (current design)
const defaultDoodle = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cfilter id='doodle-filter' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='4' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='5' /%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round' filter='url(%23doodle-filter)'%3E%3C!-- Heart --%3E%3Cpath d='M300 100 C 280 80, 260 120, 300 150 C 340 120, 320 80, 300 100' stroke='%23e65a5a' stroke-width='4' opacity='0.5' transform='rotate(10, 300, 100)'/%3E%3C!-- Star --%3E%3Cpath d='M100 300 L 110 330 L 140 335 L 115 350 L 125 380 L 100 360 L 75 380 L 85 350 L 60 335 L 90 330 Z' stroke='%23f39c12' stroke-width='4' opacity='0.5' transform='rotate(-15, 100, 350)'/%3E%3C!-- Squiggle --%3E%3Cpath d='M50 50 Q 70 20, 90 50 T 130 50' stroke='%232980b9' stroke-width='4' opacity='0.4'/%3E%3C/g%3E%3C/svg%3E")`;

// Christmas theme - snowflakes, trees, ornaments, candy canes
const christmasDoodle = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cfilter id='doodle-filter' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='4' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='5' /%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round' filter='url(%23doodle-filter)'%3E%3C!-- Snowflake 1 --%3E%3Cg stroke='%234a90d9' stroke-width='3' opacity='0.5' transform='translate(80, 80)'%3E%3Cline x1='0' y1='-20' x2='0' y2='20'/%3E%3Cline x1='-20' y1='0' x2='20' y2='0'/%3E%3Cline x1='-14' y1='-14' x2='14' y2='14'/%3E%3Cline x1='-14' y1='14' x2='14' y2='-14'/%3E%3Ccircle cx='0' cy='0' r='5'/%3E%3C/g%3E%3C!-- Christmas Tree --%3E%3Cg stroke='%23228b22' stroke-width='4' opacity='0.5' transform='translate(300, 100)'%3E%3Cpath d='M0 -30 L -25 10 L -15 10 L -30 40 L 30 40 L 15 10 L 25 10 Z'/%3E%3Crect x='-8' y='40' width='16' height='15' stroke='%238b4513'/%3E%3Ccircle cx='0' cy='-30' r='5' stroke='%23ffd700' fill='%23ffd700'/%3E%3C/g%3E%3C!-- Ornament --%3E%3Cg transform='translate(180, 300)'%3E%3Ccircle cx='0' cy='0' r='18' stroke='%23e63946' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M-5 -18 L5 -18 L3 -25 L-3 -25 Z' stroke='%23c0c0c0' stroke-width='2' opacity='0.5'/%3E%3C/g%3E%3C!-- Candy Cane --%3E%3Cpath d='M50 250 L50 310 Q50 330 70 330' stroke='%23e63946' stroke-width='6' opacity='0.4'/%3E%3Cpath d='M50 250 L50 260' stroke='%23ffffff' stroke-width='6' opacity='0.4'/%3E%3Cpath d='M50 270 L50 290' stroke='%23ffffff' stroke-width='6' opacity='0.4'/%3E%3Cpath d='M50 300 L50 310 Q50 320 60 325' stroke='%23ffffff' stroke-width='6' opacity='0.4'/%3E%3C!-- Snowflake 2 --%3E%3Cg stroke='%2387ceeb' stroke-width='2' opacity='0.4' transform='translate(320, 280) scale(0.7)'%3E%3Cline x1='0' y1='-20' x2='0' y2='20'/%3E%3Cline x1='-20' y1='0' x2='20' y2='0'/%3E%3Cline x1='-14' y1='-14' x2='14' y2='14'/%3E%3Cline x1='-14' y1='14' x2='14' y2='-14'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

// Valentine theme - hearts, cupid arrows, roses
const valentineDoodle = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cfilter id='doodle-filter' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='4' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='5' /%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round' filter='url(%23doodle-filter)'%3E%3C!-- Big Heart --%3E%3Cpath d='M200 120 C 170 80, 120 100, 120 150 C 120 200, 200 260, 200 260 C 200 260, 280 200, 280 150 C 280 100, 230 80, 200 120' stroke='%23e63946' stroke-width='4' opacity='0.5'/%3E%3C!-- Small Heart 1 --%3E%3Cpath d='M80 80 C 65 60, 40 70, 40 95 C 40 120, 80 150, 80 150 C 80 150, 120 120, 120 95 C 120 70, 95 60, 80 80' stroke='%23ff69b4' stroke-width='3' opacity='0.4' transform='scale(0.5) translate(60, 60)'/%3E%3C!-- Small Heart 2 --%3E%3Cpath d='M80 80 C 65 60, 40 70, 40 95 C 40 120, 80 150, 80 150 C 80 150, 120 120, 120 95 C 120 70, 95 60, 80 80' stroke='%23ffb6c1' stroke-width='3' opacity='0.4' transform='translate(280, 250) scale(0.6)'/%3E%3C!-- Cupid Arrow --%3E%3Cg transform='translate(50, 280) rotate(-30)'%3E%3Cline x1='0' y1='0' x2='100' y2='0' stroke='%238b4513' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M100 0 L85 -8 L85 8 Z' stroke='%23e63946' fill='%23e63946' opacity='0.5'/%3E%3Cpath d='M0 0 L15 -10 M0 0 L15 10' stroke='%23ff69b4' stroke-width='2' opacity='0.5'/%3E%3C/g%3E%3C!-- Rose --%3E%3Cg transform='translate(320, 80)'%3E%3Cpath d='M0 20 Q5 10 0 0 Q-5 10 0 20' stroke='%23e63946' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M0 0 Q10 -5 5 -15 Q0 -10 -5 -15 Q-10 -5 0 0' stroke='%23e63946' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M0 20 L0 50' stroke='%23228b22' stroke-width='2' opacity='0.4'/%3E%3Cpath d='M0 35 Q10 30 15 35' stroke='%23228b22' stroke-width='2' opacity='0.4'/%3E%3C/g%3E%3C!-- Tiny Hearts scattered --%3E%3Cpath d='M350 320 C 345 315, 338 318, 338 325 C 338 332, 350 340, 350 340 C 350 340, 362 332, 362 325 C 362 318, 355 315, 350 320' stroke='%23ff69b4' stroke-width='2' opacity='0.3'/%3E%3Cpath d='M60 180 C 55 175, 48 178, 48 185 C 48 192, 60 200, 60 200 C 60 200, 72 192, 72 185 C 72 178, 65 175, 60 180' stroke='%23ffb6c1' stroke-width='2' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`;

// Birthday theme - balloons, confetti, party hats, presents
const birthdayDoodle = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cfilter id='doodle-filter' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='4' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='5' /%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round' filter='url(%23doodle-filter)'%3E%3C!-- Balloon 1 (Red) --%3E%3Cellipse cx='100' cy='80' rx='30' ry='40' stroke='%23e63946' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M100 120 Q105 125 100 130 L100 180' stroke='%23e63946' stroke-width='2' opacity='0.4'/%3E%3C!-- Balloon 2 (Blue) --%3E%3Cellipse cx='140' cy='100' rx='25' ry='35' stroke='%234a90d9' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M140 135 Q145 140 140 145 L140 180' stroke='%234a90d9' stroke-width='2' opacity='0.4'/%3E%3C!-- Balloon 3 (Yellow) --%3E%3Cellipse cx='60' cy='100' rx='25' ry='35' stroke='%23f4d03f' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M60 135 Q65 140 60 145 L60 180' stroke='%23f4d03f' stroke-width='2' opacity='0.4'/%3E%3C!-- Party Hat --%3E%3Cg transform='translate(300, 60)'%3E%3Cpath d='M0 60 L30 60 L15 0 Z' stroke='%23ff69b4' stroke-width='3' opacity='0.5'/%3E%3Cellipse cx='15' cy='60' rx='20' ry='5' stroke='%23f4d03f' stroke-width='2' opacity='0.5'/%3E%3Ccircle cx='15' cy='0' r='8' stroke='%23f4d03f' fill='%23f4d03f' opacity='0.5'/%3E%3Cpath d='M5 20 L25 20 M8 35 L22 35 M10 50 L20 50' stroke='%234a90d9' stroke-width='2' opacity='0.4'/%3E%3C/g%3E%3C!-- Present Box --%3E%3Cg transform='translate(50, 280)'%3E%3Crect x='0' y='15' width='60' height='45' stroke='%2327ae60' stroke-width='3' opacity='0.5'/%3E%3Crect x='-5' y='0' width='70' height='15' stroke='%2327ae60' stroke-width='3' opacity='0.5'/%3E%3Cline x1='30' y1='0' x2='30' y2='60' stroke='%23e63946' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M30 0 Q20 -15 10 0 M30 0 Q40 -15 50 0' stroke='%23e63946' stroke-width='3' opacity='0.5'/%3E%3C/g%3E%3C!-- Confetti pieces --%3E%3Crect x='200' y='50' width='8' height='8' stroke='%23e63946' stroke-width='2' opacity='0.4' transform='rotate(30, 200, 50)'/%3E%3Crect x='250' y='150' width='6' height='6' stroke='%234a90d9' stroke-width='2' opacity='0.4' transform='rotate(-20, 250, 150)'/%3E%3Crect x='180' y='200' width='7' height='7' stroke='%23f4d03f' stroke-width='2' opacity='0.4' transform='rotate(45, 180, 200)'/%3E%3Crect x='350' y='300' width='8' height='8' stroke='%23ff69b4' stroke-width='2' opacity='0.4' transform='rotate(15, 350, 300)'/%3E%3Crect x='280' y='350' width='6' height='6' stroke='%2327ae60' stroke-width='2' opacity='0.4' transform='rotate(-35, 280, 350)'/%3E%3Ccircle cx='320' cy='200' r='4' stroke='%23e63946' stroke-width='2' opacity='0.3'/%3E%3Ccircle cx='150' cy='320' r='5' stroke='%234a90d9' stroke-width='2' opacity='0.3'/%3E%3C!-- Cake --%3E%3Cg transform='translate(280, 250)'%3E%3Crect x='0' y='20' width='50' height='30' stroke='%23ffb6c1' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M0 20 Q25 10 50 20' stroke='%23ffffff' stroke-width='3' opacity='0.4'/%3E%3Cline x1='25' y1='5' x2='25' y2='20' stroke='%23f4d03f' stroke-width='2' opacity='0.5'/%3E%3Ccircle cx='25' cy='2' r='4' stroke='%23f39c12' fill='%23f39c12' opacity='0.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

// Wedding theme - rings, bells, doves, flowers, hearts
const weddingDoodle = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cfilter id='doodle-filter' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='4' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='5' /%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round' filter='url(%23doodle-filter)'%3E%3C!-- Wedding Rings --%3E%3Cg transform='translate(180, 80)'%3E%3Ccircle cx='0' cy='0' r='25' stroke='%23ffd700' stroke-width='4' opacity='0.5'/%3E%3Ccircle cx='30' cy='0' r='25' stroke='%23ffd700' stroke-width='4' opacity='0.5'/%3E%3Ccircle cx='30' cy='-5' r='4' stroke='%23ffffff' fill='%23ffffff' opacity='0.4'/%3E%3C/g%3E%3C!-- Bell 1 --%3E%3Cg transform='translate(60, 60)'%3E%3Cpath d='M0 0 Q-20 10 -20 35 L20 35 Q20 10 0 0' stroke='%23ffd700' stroke-width='3' opacity='0.5'/%3E%3Cellipse cx='0' cy='35' rx='22' ry='5' stroke='%23ffd700' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='0' cy='40' r='5' stroke='%23ffd700' fill='%23ffd700' opacity='0.4'/%3E%3Cpath d='M0 -5 Q5 -15 0 -20 Q-5 -15 0 -5' stroke='%23ff69b4' stroke-width='2' opacity='0.4'/%3E%3C/g%3E%3C!-- Dove --%3E%3Cg transform='translate(300, 150) scale(0.8)'%3E%3Cpath d='M0 0 Q-10 -10 -30 -5 Q-20 0 -30 10 Q-10 5 0 0' stroke='%23c0c0c0' stroke-width='3' opacity='0.5'/%3E%3Ccircle cx='5' cy='-2' r='8' stroke='%23c0c0c0' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M13 -2 L20 -5 L20 0 Z' stroke='%23f39c12' fill='%23f39c12' opacity='0.4'/%3E%3Ccircle cx='10' cy='-4' r='2' stroke='%23333' fill='%23333' opacity='0.4'/%3E%3C/g%3E%3C!-- Flower 1 --%3E%3Cg transform='translate(80, 280)'%3E%3Ccircle cx='0' cy='0' r='8' stroke='%23ffb6c1' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='0' cy='-15' r='10' stroke='%23ffb6c1' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='14' cy='-5' r='10' stroke='%23ffb6c1' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='9' cy='12' r='10' stroke='%23ffb6c1' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='-9' cy='12' r='10' stroke='%23ffb6c1' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='-14' cy='-5' r='10' stroke='%23ffb6c1' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='0' cy='0' r='6' stroke='%23f4d03f' fill='%23f4d03f' opacity='0.4'/%3E%3C/g%3E%3C!-- Heart --%3E%3Cpath d='M320 320 C 305 300, 280 310, 280 335 C 280 360, 320 390, 320 390 C 320 390, 360 360, 360 335 C 360 310, 335 300, 320 320' stroke='%23ffb6c1' stroke-width='3' opacity='0.4' transform='scale(0.5) translate(400, 500)'/%3E%3C!-- Small flowers scattered --%3E%3Cg transform='translate(350, 60) scale(0.5)'%3E%3Ccircle cx='0' cy='-10' r='6' stroke='%23ffffff' stroke-width='2' opacity='0.3'/%3E%3Ccircle cx='10' cy='0' r='6' stroke='%23ffffff' stroke-width='2' opacity='0.3'/%3E%3Ccircle cx='0' cy='10' r='6' stroke='%23ffffff' stroke-width='2' opacity='0.3'/%3E%3Ccircle cx='-10' cy='0' r='6' stroke='%23ffffff' stroke-width='2' opacity='0.3'/%3E%3Ccircle cx='0' cy='0' r='4' stroke='%23f4d03f' fill='%23f4d03f' opacity='0.3'/%3E%3C/g%3E%3C!-- Ribbon bow --%3E%3Cg transform='translate(180, 320)'%3E%3Cpath d='M0 0 Q-20 -15 -25 0 Q-20 15 0 0' stroke='%23ffd700' stroke-width='2' opacity='0.4'/%3E%3Cpath d='M0 0 Q20 -15 25 0 Q20 15 0 0' stroke='%23ffd700' stroke-width='2' opacity='0.4'/%3E%3Cpath d='M-5 0 L-10 20 M5 0 L10 20' stroke='%23ffd700' stroke-width='2' opacity='0.4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    emoji: '✏️',
    doodleSvg: defaultDoodle,
  },
  {
    id: 'christmas',
    name: 'Christmas',
    emoji: '🎄',
    doodleSvg: christmasDoodle,
  },
  {
    id: 'valentine',
    name: 'Valentine',
    emoji: '💕',
    doodleSvg: valentineDoodle,
  },
  {
    id: 'birthday',
    name: 'Birthday',
    emoji: '🎂',
    doodleSvg: birthdayDoodle,
  },
  {
    id: 'wedding',
    name: 'Wedding',
    emoji: '💒',
    doodleSvg: weddingDoodle,
  },
];

export const getThemeById = (id: string): Theme => {
  return themes.find((t) => t.id === id) || themes[0];
};

export const DEFAULT_THEME_ID = 'default';
