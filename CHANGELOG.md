# Changelog - Datas Uteis

## [2.5.0] - 2026-03-29

### Changed
- Navbar: weather and exchange data are now grouped into one compact two-line widget, with the location action separated into a smaller circular button.
- Navbar: widget height and padding were reduced so the cluster no longer looks oversized beside the language and theme controls.
- Navbar: the displayed Brazilian region is now abbreviated in the widget, such as `Niterói, RJ` and `Brasília, DF`.

### Fixed
- Navbar: the desktop widget cluster now shrinks inside a constrained width so it no longer collides with the language switcher around 1536 px and above.
- Navbar: removed the extra `min-h-*` sizing that inflated the old three-box layout in both desktop and mobile variants.

## [2.4.0] - 2026-03-29

### Fixed
- CLS: reduced layout instability by reserving stable space for async header widgets and the Home summary, fixing stable logo dimensions, and keeping the mobile header height consistent before data loads.
- LCP: removed the Home route from lazy loading so the prerendered hero and `<h1>` render path no longer waits for a separate Home chunk.
- 404s: browser-side widget and geolocation flows no longer depend on missing local endpoints during first load, and legacy `/widgets/*` aliases now resolve correctly on the server.
- Reflow: simplified the floating section navigation so it no longer recalculates section geometry on every scroll frame.

### Optimized
- JS bundle: moved Home blog teasers to a lightweight module so the full blog catalog and article HTML no longer ride with the initial Home bundle.
- Animations: replaced shared `transition-all` usage with targeted transition properties for cards, inputs, dropdowns, and calculator buttons.
- Network: reduced preconnects to the truly critical origins and added a small critical CSS block for the hero/header shell.
- Bundling: split additional UI dependencies into a dedicated vendor chunk for better cache reuse.

## [2.3.0] - 2026-03-29

### Fixed
- Geolocation: location detection now favors the real visitor location instead of falling back to São Paulo when CDN or edge-network IP hints are imprecise.
- Weather: the header widget, Home summary, weather page, and holiday auto-detection now share the same geolocation source of truth and use the same `lat`/`lon`.
- Weather fallback: direct widget fallbacks no longer geocode by timezone, preventing timezone-based lookups from drifting back to São Paulo.

### Added
- Geolocation: a shared context with 30-minute local cache, browser geolocation on demand, multi-provider IP lookup, reverse geocoding support, and Brasília as the default fallback.
- Geolocation: `/api/geo` now supports both approximate visitor detection and reverse geocoding for explicit coordinates, including Vercel-style geo headers when available.
- UX: explicit `Use my location` actions are available in the Home summary, the weather page, and the header weather cluster when approximate location is being used.

### Changed
- Fallback: the default location remains Brasília, Distrito Federal, and is now used consistently across all weather-related flows.
- Reliability: geolocation providers now prefer direct client IP resolution before looser server-side approximations when both are available.

## [2.2.0] - 2026-03-29

### Fixed
- Navigation: `Simulators` and `Games` dropdowns now remain open while the pointer moves from the trigger to the submenu, with a hover-safe wrapper, `pt-2` gap bridge, and 300 ms delayed close.
- Navigation: the header info widgets now stay hidden until `2xl`, preventing the currency/weather cluster from colliding with the language switcher around 1535 px.
- Console: replaced the deprecated `apple-mobile-web-app-capable` meta tag with `mobile-web-app-capable`.
- Console: added legacy aliases for `/widgets/overview`, `/widgets/weather`, and `/widgets/news` to avoid stale 404 requests.
- Console: changed the flag image overflow rule from `visible` to `hidden`, removing the warning tied to replaced media elements.
- Security: browser geolocation is no longer requested on page load in the header, weather page, or calendar auto-detection flow.

### Changed
- Home: the `Resumo do momento` / `Today snapshot` block is now consolidated into a single card with current date, business-day status, next national holiday, remaining business days in the month, location, temperature, and sky condition.
- Weather UX: approximate weather now loads first, while precise browser location is requested only after an explicit click on the location action.
- Performance: the main stylesheet is converted to async preload in the generated HTML, critical chunks receive `modulepreload`, and Vite now emits manual vendor chunks with CSS code splitting enabled.
- Security: added HSTS for secure requests, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy`, CSP, updated `Permissions-Policy`, and longer cache TTLs for sitemap/static hashed assets.
- Metadata: site-wide last-modified references, `dateModified`, and `og:updated_time` now use `2026-03-29`.

## [1.1.0] - 2026-03-28

### Added
- SEO updates for the Home page title, meta description, `h1`, `hreflang` alternates, and `og:updated_time`.
- A new `Home` entry in the primary navigation.
- A `Simulators` dropdown grouping Business Days, Work Schedules, and Age Calculator.
- A `Games` dropdown structure with the `Brain Games` sub-entry.
- Reusable skip navigation, breadcrumb, and back-button components.
- Breadcrumb navigation and `BreadcrumbList` schema integration across internal pages.
- Keyboard support, click-outside handling, and accessible mobile accordions for header dropdowns.
- `Last-Modified` headers for HTML, XML, and TXT responses.
- Project documentation in `docs/NAVIGATION.md` and `docs/ACCESSIBILITY.md`.

### Changed
- Moved top-level navigation items for Business Days, Work Schedules, and Age into `Simulators`.
- Updated Home and route-level metadata generation to use the 2026-03-28 modification date.
- Expanded sitemap generation with `priority`, `changefreq`, `lastmod`, and language alternates.
- Refined accessibility labels and titles for icon-only and header interaction controls.

### Not changed
- Business-day calculations, calendar logic, schedule simulations, age logic, blog content flow, utilities, and games behavior.
- Logo, language switcher behavior, and theme toggle behavior.
- General visual identity outside the requested navigation and accessibility work.
