import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const map = new URL(import.meta.env.BASE_URL.replace(/\/$/, '') + '/sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${map}\n`, { headers: { 'Content-Type': 'text/plain' } });
};
