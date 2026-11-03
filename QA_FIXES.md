# QA fixes — 3 November 2026

The user requested implementation of WEBSITE_QA_FIXES_FOR_TOMORROW.md. Existing artwork revisions were preserved. Original audit evidence remains unchanged.

| Findings | Change |
| --- | --- |
| #15 | Enquiry fieldsets and submit buttons remain disabled until the client handler mounts. Server-rendered fallback instructions remain visible without JavaScript. Forms use POST as additional protection against GET serialization; Maps sends no referrer. |
| #1, #2 | Local validation checks normalized phone digit counts, allowed characters, meaningful required text, and recognized time zones. Associated inline errors identify invalid fields and focus the first error. |
| #3 | The birthday calculation has independent state from the browsed reflection sign. |
| #4, #7, #11 | Tablet headers retain Reviews and More. The brand's accessible name follows its visible text. More exposes its expanded state and controlled content, closes on Escape/focus departure, and returns focus on Escape. |
| #5 | Inner-page reading sections and hero text have dependable dark backdrops. Home design is preserved. |
| #6 | Portrait and desktop posters use the same width/height fitting rule and focal position as their live scenes, including tablet widths. |
| #8, #10 | Time-only preferences remain in the message. Dated preferences are checked against the current wall clock in the entered time zone. |
| #9 | Shared origin validation and a deployment release check were added. A configured sitemap and robots reference are tested for all 39 URLs. **The real domain is pending: the user has not bought it yet.** |
| #12 | The About page CTA now leads to How It Works. The home About CTA retains its destination. |
| #13 | `npm run lint` runs ESLint with Next.js recommended/Core Web Vitals rules and a TypeScript parser. The minimatch dependency override uses the patched 11.x release. |
| #14 | Known above-the-fold poster, About, Services and Journal images load eagerly. The deprecated home image priority prop uses preload. Lower-page images remain lazy. |
| #16 | The original home scene now reports actual WebGL context loss through the existing poster fallback state. Original home geometry and poster are unchanged. |

New validation/fallback copy is included in all six website language dictionaries; these additions have not received native-speaker editorial review.

Deployment: after buying the domain, set `NEXT_PUBLIC_SITE_URL=https://your-domain` in the hosting environment and run `npm run build:release`. Local builds remain usable without a domain. No deployment was performed.

## Verification

- Production build, post-build TypeScript check and ESLint: passed.
- Unit tests: 18 passed.
- Production Firefox browser checks: 14 passed, covering all three forms with/without JavaScript, phone/text validation, time-only preferences, stale previews, copying recovery, URL service selection, navigation, birthday-result independence, tablet disclosure, and actual home WebGL context loss.
- Tablet visual comparison: paused and live focal artwork have matching scale/position. Label-in-name axe check: no violations; no document overflow in the sampled tablet view. Screenshots and JSON are in `qa-audit/fixes/`.
- Targeted About contrast samples: no glyph pixels below 4.5:1; the originally reported paragraph measured approximately 10.6:1, and the next paragraph approximately 9.4:1. This is a targeted measurement, not an exhaustive accessibility certification.
- Dependency audit: zero known vulnerabilities after applying the lint dependency patch.
- Missing deployment origin is rejected by `check:release`; a test HTTPS origin passes, and the sitemap/robots test verifies 39 unique URLs. The actual deployment domain remains unset by user choice until purchased.

Browser startup initially failed because the cached Chromium binary is truncated. Firefox was used with locally extracted system libraries via `LD_LIBRARY_PATH`; no system package installation was performed. Earlier development runs encountered parse errors and initialization races while development output was changing. The successful 14-test run used the completed production build at port 3002.
