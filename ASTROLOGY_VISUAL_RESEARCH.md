# Astrology visual direction — 31 October 2026

The homepage keeps its existing Jyotisha scene and fallback. Every inner page now has a fixed, viewport-filling background that remains visible throughout scrolling. Raised brass geometry, navy surfaces, sparse star points and slow motion connect the scenes to Indian astrology. Detail pages have their own compositions rather than small rotations of section artwork.

## Research and scope

- The [Metropolitan Museum's Nine Luminaries handscroll](https://www.metmuseum.org/art/collection/search/45616) identifies the traditional Navagraha as the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn and the two lunar nodes. The nodes are not drawn as extra physical planets.
- The [Library of Congress, The Heavens](https://loc.gov/exhibits/world/heavens.html) documents celestial charts, movable astronomical diagrams, armillary instruments and Indian planetary traditions. These inform the engraved chart, folio and horizon-instrument visual vocabulary.
- Barry Perlus's Cornell-associated [Jantar Mantar instrument research](https://jantarmantar.org/learn/observatories/instruments/Rasivalaya/index.html) explains the twelve zodiac-related Rasivalaya instruments and their relationship to the equatorial Samrat sundial. The booking image uses an original stylised gnomon and graduated dial, rather than copying a photograph or historical instrument design.
- [NASA's Moon Phases](https://science.nasa.gov/moon/moon-phases/) explains the eight phases and the changing illuminated portion visible from Earth. The horoscope artwork shows a new-to-full-to-new sequence with a phase terminator, rather than eight identical spheres.
- [Smithsonian Folkways' Navagraha notes](https://folkways-media.si.edu/docs/folkways/artwork/FW04131.pdf) identify Rahu and Ketu with the ascending and descending intersections of the lunar path and ecliptic. The FAQ diagram shows two opposite intersections of inclined paths.

These are original symbolic artworks. No diagram represents a visitor's birth chart, actual current transits, calculated auspicious appointment time or a scientific validation of astrology. Sources inform the symbolism; their copyrighted images are not copied into this project.

## Backgrounds

| Page | Visual and movement |
| --- | --- |
| Home | Existing Jyotisha scene, preserved |
| About | Layered North Indian kundli, illuminated house markers and a nakshatra band |
| Services | Navagraha-inspired arrangement: Sun, six orbiting luminaries and two symbolic opposed lunar nodes |
| How it works | Kundli plates gently separating and assembling around a highlighted lagna |
| Reviews | Three kundli panels, pulsing connections and an orbiting light |
| Contact | Brass horizon instrument with intersecting planes and a moving marker |
| Booking | Inclined zodiac sundial with a raised triangular gnomon and time indicator |
| Horoscope | Eight shaded lunar phases, changing central Chandra and 27-part nakshatra band |
| Journal | Raised manuscript leaves, kundli engraving and lotus illustration |
| FAQ | Inclined lunar path meeting the ecliptic at two symbolic nodes |
| Privacy | Personal kundli within layered brass folio frames and a lotus seal |
| Terms | Ordered kundli divisions, steady central axis and rotating outer band |

Service detail scenes use paired or grouped kundlis for relationships, nested chart instruments for readings, interlocking yantra-inspired triangles for spiritual services, Surya and radial brass rays for career, and Chandra with lotus geometry for wellbeing. The edition within each subject changes the geometry: chart count, petal count, triangle layers, rays, nested rings and illuminated markers. Each route also has a stable star arrangement and movement rate.

The three journal articles use layered chart preparation, a larger Chandra with a tilted orbit, and a slowly breathing sixteen-petal lotus respectively. `src/lib/page-themes.ts` maps all 38 inner routes to scene configurations and unique fallback images.

The full-page renderer uses one canvas, capped device pixel ratio, small star counts and transparent overlays. Text-heavy surfaces remain shaded. User pause, reduced motion, hidden tabs, data-saving hints, low-memory hints and unavailable or lost WebGL use the matching static composition. All generated geometry, materials and textures are disposed when a scene is removed.

Generate fallback assets with a local server running using `npx tsx scripts/create-page-art.ts`. `PLAYWRIGHT_CHANNEL=chrome` selects an installed Chrome. For split Windows/WSL tooling, `PAGE_ART_RAW_DIR` captures transparent PNGs for subsequent WebP conversion on the platform with Sharp installed. Home assets are excluded from generation.

## Individual service photographs

Every catalogue service receives a different image. `src/data/service-imagery.json` records the complete subject/prompt set and final project paths. Images are made with the built-in imagegen tool in a cohesive contemporary editorial style; they are illustrations, not photographs of AstroVision staff, premises, clients or proven outcomes.

Relationships use human connection, commitment, respectful space and repair as distinct subjects. Readings show the relevant practice: an open palm, facial profile, paired charts, a prism or a reflective reading desk. Career, job, business, money and property use different real-world settings. Spiritual concerns use reassuring light, a protected flame, reflection and personal boundaries without frightening depictions. Wellbeing imagery portrays quiet support and reflection without medical-treatment imagery.

Generated originals are retained in the imagegen output directory. Optimised local deliverables are in `public/images/services/`; animations and fallback artwork are defined in `src/lib/page-art.ts` and `public/images/scenes/*-astrology.webp`.
