import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Host-agnostic: change only these two env vars when moving hosts.
// GitHub Pages: SITE_URL=https://USER.github.io  BASE_PATH=/REPO
// Custom domain: SITE_URL=https://cinestream.com BASE_PATH=/
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.github.io',
  base: process.env.BASE_PATH ?? '/',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
