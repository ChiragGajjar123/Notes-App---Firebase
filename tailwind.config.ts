import type { Config } from 'tailwindcss';

// Note: Tailwind CSS v4 uses a CSS-first configuration system via @theme in src/app/globals.css.
// This config file is maintained to support editor extensions and lint tools.
const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
