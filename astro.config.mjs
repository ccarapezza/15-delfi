// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: "https://f7t795mp-4321.brs.devtunnels.ms",
  vite: {
    plugins: [tailwindcss()]
  }
});