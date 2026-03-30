# Accessibility - Datas Uteis

## Scope

This project update applies the accessibility patterns below across navigation, page landmarks, breadcrumb controls, and icon-only interactions.

## WCAG 2.1 AA conventions

- A skip link is rendered before the app shell and targets `#main-content`.
- The main layout exposes `header[role="banner"]`, `nav[role="navigation"]`, `main[role="main"]`, and `footer[role="contentinfo"]`.
- Internal pages provide a visible back button plus breadcrumb navigation with clear labels.
- Interactive controls without visible text must expose a translated `aria-label` and `title`.
- Focus states rely on existing visible focus styling. No control should remove focus indication without a replacement.

## Navigation rules

- Desktop dropdowns support keyboard opening, closing, and arrow-key traversal.
- Mobile submenus expand as accordions with state exposed through `aria-expanded`.
- Dropdown menus use `aria-haspopup="true"`, `role="menu"`, and `role="menuitem"` where appropriate.
- Clicking outside an open desktop dropdown closes it.

## Translation rules

- New navigation, breadcrumb, skip-link, and back-button labels are localized for PT, EN, and ES.
- The document `lang` attribute follows the active site language.
- Tooltip text and accessibility labels must stay aligned with the active language.

## Audit checklist

- Theme toggle uses a translated `aria-label` and `title`.
- Mobile menu button uses a translated `aria-label` and `title`.
- Header info buttons and icon-only actions expose descriptive labels.
- Breadcrumbs are present on every internal page.
- The first tabbable element on the page is the skip link.
- Sitemap and route metadata expose updated modification dates and alternate language references.
