# Navigation - Datas Uteis

## Primary structure

Desktop and mobile navigation now follow the same hierarchy:

- Home
- Simulators
- Calendar
- Blog
- Utilities
- Games
- About

`Simulators` groups the core date and schedule tools. `Games` stays as a dropdown with the reasoning-games entry point.

## Route mapping

| Group | Route | PT | EN | ES |
| --- | --- | --- | --- | --- |
| Home | `/` | Início | Home | Inicio |
| Simulators | `/calcular/` | Dias Úteis | Business Days | Días Hábiles |
| Simulators | `/escala/` | Escalas de Trabalho | Work Schedules | Turnos de Trabajo |
| Simulators | `/idade/` | Calculadora de Idade | Age Calculator | Calculadora de Edad |
| Calendar | `/calendario/` | Calendário | Calendar | Calendario |
| Blog | `/blog/` | Blog | Blog | Blog |
| Utilities | `/utilitarios/` | Utilitários | Utilities | Utilidades |
| Games | `/jogos/` | Raciocínio | Brain Games | Razonamiento |
| About | `/sobre/` | Sobre | About | Sobre |

## Behavior

- Desktop dropdowns open on hover and on keyboard interaction.
- Mobile dropdowns behave as accordions inside the hamburger menu.
- Top-level dropdown triggers expose `aria-haspopup`, `aria-expanded`, and `role="menu"` semantics.
- Keyboard support includes `Enter`, `Space`, `Escape`, `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Home`, and `End`.
- Clicking outside the desktop menu closes any open dropdown.

## Breadcrumb model

Breadcrumbs are rendered on every internal page with a reusable component and mirrored in JSON-LD.

Examples:

- `/calcular/` -> Home > Simulators > Business Days
- `/escala/` -> Home > Simulators > Work Schedules
- `/idade/` -> Home > Simulators > Age Calculator
- `/blog/[slug]` -> Home > Blog > Post title
- `/jogos/sudoku/` -> Home > Games > Brain Games > Sudoku

## Localized alternates

The current router keeps canonical routes unchanged and exposes alternate language URLs through the `?lang=` query parameter:

- PT: default route
- EN: `?lang=en`
- ES: `?lang=es`

This structure is reflected in `hreflang` links and in the generated sitemap.
