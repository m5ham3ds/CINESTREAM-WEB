# CineStream Web
Static one-page site. Astro 5 + TypeScript (strict) + Tailwind 4 + GSAP/ScrollTrigger + Lenis.

## Develop
`npm install` → `npm run dev` · `npm run build` · `npm run preview`

## Configure (no component edits needed)
- **Download link:** `src/config/site.ts` → `download.url` (empty = button shows "coming soon").
- **Version / release date:** `app.version`, `app.releaseDate`.
- **Copy / UI text:** the bilingual copy is kept with the page and mirrors the current app terminology.
- **Colors:** CSS variables in `src/styles/global.css` mirror the Android app theme values from `Color.kt`.
- **Privacy / Terms / Support links:** `links.*` — shown only when set.

## GitHub Pages
Push to `main`, Settings → Pages → Source: GitHub Actions. The workflow sets `SITE_URL` and `BASE_PATH` itself.

## Other hosts
Set `SITE_URL=https://yourdomain.com` and `BASE_PATH=/` then `npm run build`; upload `dist/`.
