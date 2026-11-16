# Performance and UI verification — 16 November 2026

The site retains its existing design and client content. All 45 content pages are prerendered in the production build. Booking enquiries remain browser-local; `/api/health` is the only application API route and remains dynamic.

## Traffic improvements

| Area | Result |
| --- | --- |
| Background recording | 9,473,462 → 3,553,219 bytes: 62.49% smaller, with the full recording retained at 96 kbps stereo |
| Public assets | 44,433,896 → 34,185,078 bytes: about 10.25 MB removed overall |
| Review videos | Five WebP thumbnails total 96,244 bytes; MP4 downloads wait for playback |
| Audio caching | Content-hashed filename, one-year immutable browser cache; byte-range playback verified |
| Images and videos | One-hour browser cache, one-day shared cache, stale responses allowed during revalidation |
| Translation dictionaries | Browser revalidation with a one-day shared cache |
| Catalogue URLs | Unknown service and article slugs return 404 instead of generating new detail pages |

HTML, RSC and optimized-image caching remain controlled by Next.js. No blanket cache headers were applied to pages or APIs.

## Cleanup and UI fixes

Removed 44 obsolete files: superseded service images and scene posters, the previous audio assets, three unused animation components, an obsolete poster generator and an unused SVG. Removed three unused direct dependencies and 42 installed packages in total. Also removed their legacy icon styles, unused translation bindings and an unused geometry helper. Client reference folders and the original supplied recording were preserved.

Video players now preserve their actual aspect ratios, including the landscape review. A localized play button over each poster avoids Chrome's initial loading indicator; native controls appear when playback starts. Video interaction remains excluded from the background music's first-interaction trigger.

Browser tests now select the mobile menu explicitly and derive category counts from the current service catalogue. The Playwright configuration excludes Node unit tests and supports an installed Chrome channel.

## Verification

- Production build, TypeScript, lint, all 22 unit tests and Git whitespace checks passed.
- All 41 unique browser checks passed across grouped runs using Chrome against the final production build. The long combined run was interrupted after 30 passing cases; the complete 12-case revision group subsequently passed separately.
- Accessibility checks across 12 main routes at 390 and 1440 pixels found no automated WCAG violations, broken main-content images or runtime errors.
- Additional layout checks covered the 12 main routes at 320, 768, 1024 and 1440 pixels, plus all five translated languages at 320 pixels: no horizontal overflow or runtime errors.
- Background fallbacks loaded on all 45 content routes. Live animation, reduced motion, WebGL failure recovery, booking forms, navigation, language persistence, video playback and music controls passed.
- A local production smoke test served 200 requests with 20 concurrent clients and no errors (median 77 ms, p95 190 ms). This does not establish Vercel's traffic capacity.
- Dependency removal reported zero vulnerabilities in the installed package audit.

Local screenshots and UI/load reports are retained in the ignored `artifacts/traffic-qa/` folder.

Vercel plan capacity, firewall rules, monitoring and spending policies were not changed. These require configuration in the hosting account. In particular, automatic budget pausing trades availability for a spending limit. The code changes must go through the normal GitHub/Vercel deployment before affecting production.
