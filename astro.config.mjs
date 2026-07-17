// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import expressiveCode from "astro-expressive-code";


// https://astro.build/config
export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()]
  },
  image: {
    domains: ["placehold.co", "docs.astro.build"],
  },
  integrations: [react(), expressiveCode()]
});