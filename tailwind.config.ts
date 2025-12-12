import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Set our new fonts as the defaults
        title: ['var(--font-title)', 'cursive'],
        body: ['var(--font-body)', 'cursive'],
      },
      // Let's add some custom colors too
      colors: {
        'crayon-red': '#e65a5a',
        'crayon-blue': '#4a90e2',
        'paper-cream': '#fcfaf2',
      },
      backgroundImage: {
        // A crumpled paper pattern for the item cards
        'crumpled-paper': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
};
export default config;