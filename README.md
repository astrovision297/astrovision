# AstroVision

Next.js website with a navy and gold design, responsive navigation, section-specific Three.js backgrounds, service imagery and static reduced-motion fallbacks.

## Run locally

Use Node 20.9 or newer. Run `npm install`, then `npm run dev` and open http://localhost:3000.

For production: `npm run build`, then `npm start`. Run `npm test` and `npm run typecheck` for checks. Run the build and typecheck sequentially because the build regenerates `.next/types`.

Browser regression: with the site running, use `npx playwright test tests/navigation.spec.ts tests/enquiry.spec.ts --browser=firefox` (requires Playwright Firefox and its system libraries).

## Pages and content

Home, About, Services, 30 service detail pages, How It Works, Reviews, FAQ, Contact, Book Appointment, Horoscope, Journal with three articles, Privacy and Terms are implemented. No pricing is displayed.

The header language selector translates page content into Greek, French, Dutch, Turkish and Hindi, with English as the default. Local dictionaries are fetched only when selected; the choice is saved on the device and remains across navigation. These are website languages, not a promise of consultation-language availability. Original client review quotations and user-entered text remain in their original language. Enquiry messages currently use English labels. The horoscope contains labelled reflection prompts and an approximate Western sun-sign finder, not calculated personal predictions.

Hanuman Puja has been removed as requested, leaving 30 services across five categories. Descriptive service titles avoid promises; the specialist index also shows the supplied names. Edit `src/data/content.ts` for services, FAQs and articles, and `src/data/site.ts` for business identity, map, Instagram and supplied review excerpts. Reviews are not a live Google feed. Real biography and credentials still require client material. The Reviews page includes five supplied video clips, shown in every website language. Video entries are configured in `src/data/video-reviews.json` and served from `public/videos/reviews/`.

## Contact configuration

Copy `.env.example` to `.env.local` and fill in the available public business details. WhatsApp requires an international number using digits only, without `+`. Phone, email, opening hours and Facebook appear when configured. `NEXT_PUBLIC_SITE_URL` supplies the production origin for sitemap and robots output; rebuild after changing public environment variables.

Forms prepare an editable enquiry locally. Visitors explicitly open WhatsApp to send it; when no WhatsApp number is configured, they can copy it into Instagram. No enquiry is stored in a website database, and no appointment is confirmed automatically. Scheduling, payments and WhatsApp Business auto-replies are not integrated.

## Animation and assets

`src/components/celestial.tsx` preserves the homepage Jyotisha scene and renders full-page Indian astrology backgrounds on every other route. All 44 inner pages have distinct artwork, including each of the 30 services and three journal articles. `src/lib/page-themes.ts` selects the route configuration; `src/lib/page-art.ts` builds layered kundlis, Navagraha motifs, nakshatra bands, lunar phases, yantra geometry and brass instruments. See `ASTROLOGY_VISUAL_RESEARCH.md` for visual meanings and research. Existing service photographs remain on the catalogue and detail pages.

With a local server running, `npx tsx scripts/create-page-art.ts` captures matching fallback posters from the actual WebGL scenes. Set `PLAYWRIGHT_CHANNEL=chrome` to use installed Chrome, or `PAGE_ART_RAW_DIR` to capture transparent PNGs for separate WebP conversion. Home assets are excluded. Reduced motion, hidden tabs, data saving, low-memory hints and unavailable/lost WebGL retain static artwork. The pause control persists across navigation. New photographs are stored locally; see [asset credits and research](ASSET_CREDITS.md).

## Translations and verification

`public/locales/` contains static dictionaries. `scripts/extract-translations.cjs` extracts source text. Translation drafts were generated offline using Argos models with CTranslate2 and sentencepiece in a separate tooling environment; those tools and models are not application dependencies. `scripts/translate-offline.py` documents regeneration. Reviewed navigation, booking, zodiac and heading translations live in `src/data/translations/ui.tsv`; apply them with `node scripts/apply-translation-overrides.cjs`. Long-form translations are machine-assisted drafts and should receive native-language editorial review before publication.

Run `npm test`, `npm run build`, and then `npm run typecheck`. With a server running, run `npx playwright test tests/navigation.spec.ts tests/enquiry.spec.ts tests/revision.spec.ts tests/backgrounds.spec.ts --browser=firefox`. Set `PLAYWRIGHT_BASE_URL` to use another port. The revision suite checks all main routes at desktop/mobile widths, axe accessibility/contrast, removed-service URLs, image loading, all language switches, persistence, input preservation and failed-language-download recovery. On Windows-mounted WSL workspaces, `WATCHPACK_POLLING=true npm run dev -- --webpack` reliably detects file changes.

The repository contains the application source and runtime assets. Original reference photos, design briefs, internal working notes and local environment files are excluded. Production hosting uses Vercel, with deployments from the GitHub main branch.

## QA release checks

Run `npm run lint`, `npm test`, `npm run build`, then `npm run typecheck`. For deployment use `npm run build:release`: it requires a real HTTPS `NEXT_PUBLIC_SITE_URL` and prevents releasing an empty sitemap by accident. A configured sitemap contains all 45 page URLs and robots.txt references it. Local builds may omit the deployment origin.

Enquiry controls stay disabled until their local handler is ready. Without JavaScript, visitors see an explanation and can use the contact links. Phone numbers need 7–15 digits; scheduling uses a valid time zone such as Europe/Nicosia. Time-only preferences are retained and dated preferences must still be in the future in the selected zone.

The lint command uses ESLint 10 with the Next.js recommended and Core Web Vitals rules and the TypeScript parser. The minimatch override retains the patched 11.x release for lint dependencies (GHSA-g3hv-75wg-m249).

For the focused QA regression suite against a running server, use `PLAYWRIGHT_BASE_URL=http://localhost:3002 npx playwright test --config=playwright.qa.config.ts tests/qa-fixes.spec.ts tests/enquiry.spec.ts tests/navigation.spec.ts`. Set `QA_BROWSER=firefox` to use Firefox; the default is installed Playwright Chromium. See `QA_FIXES.md` for the completed handoff and testing evidence.

## Traffic and media

Public images and videos have a one-hour browser cache and one-day shared cache, with stale responses allowed during revalidation. Translation dictionaries revalidate in the browser and can be cached at the CDN. Next.js manages HTML, RSC and optimized-image caching itself; no blanket page cache header is applied. Service and journal detail URLs are restricted to their build-time catalogue with `dynamicParams = false`.

The client-supplied background track is encoded at 96 kbps (3.55 MB versus the 9.47 MB original) with its full duration retained. Its content-hashed URL is cached for a year; replace the hash and URL whenever changing the file. Music still starts after interaction and honors the existing playback controls. Video reviews use local WebP posters and `preload="none"`, downloading clips on playback. Their native aspect ratios are preserved.

Browser checks support an installed Chrome with `PLAYWRIGHT_CHANNEL=chrome`. Against a production server, run `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test --config=playwright.qa.config.ts`. The high-traffic suite verifies media caching, byte-range audio responses, deferred video loading and unknown catalogue URLs.

Vercel account capacity, spending alerts and firewall rules are configured separately in the Vercel dashboard. Automatic budget pausing makes the production site unavailable; choose it according to the client's cost/availability requirements. Source optimizations do not establish a guaranteed concurrent visitor capacity.
