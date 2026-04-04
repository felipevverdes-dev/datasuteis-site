# Component Inventory

## Layout compartilhado

- `PageShell`
  - Wrapper padrão de páginas utilitárias e institucionais.
- `Header`
  - Navegação principal, idioma, tema e comportamento global.
- `Footer`
  - Links estruturais e apoio institucional.
- `FloatingSectionNav`
  - Navegação flutuante por âncoras de seção.
- `PageIntroNavigation`
  - Breadcrumb + ação de voltar.
- `CtaFinalBlock`
  - CTA de fechamento reaproveitado no fim das páginas.

## Componentes de infraestrutura

- `AdSlot`
  - Wrapper de anúncios com reserva de espaço.
- `CookieConsentBanner`
  - Consentimento antes de habilitar tracking e AdSense.
- `ErrorBoundary`
  - Contenção de erro de renderização.
- `RouteBehavior`
  - Ajustes de navegação global.

## UI primitives

- `ModalDialog`
  - Modal acessível e reutilizável.
- `tooltip.tsx`
  - Tooltip compartilhado.
- `sonner.tsx`
  - Toaster compartilhado.

## Home e header

- `HeaderInfoCluster`
  - Clima + câmbio do header.
- `HomeMomentSummary`
  - Resumo de data, clima e próximo feriado.

## Idade

- `AgeExperience`
  - Fluxo principal da ferramenta de idade.
- `LocalizedDateInput`
- `LocalizedTimeInput`

## Novo conjunto de Horário Mundial

- `WorldClock`
  - Página dedicada de países, continentes e busca.
- `WorldClockMarkets`
  - Página dedicada de horários de bolsas e snapshots.
- `WorldClockToolSwitcher`
  - Navegação interna entre as duas rotas físicas da feature.
- `WorldClockContinentNav`
  - Navegação horizontal por continentes com suporte a teclado.
- `WorldClockCountryCard`
  - Card compacto de relógio por país.
- `WorldClockCountryModalContent`
  - Conteúdo rico do modal sob demanda.
  - Consome `CountryProfileContent` já resolvido, sem montar fallback na UI.
- `WorldClockMarketsTable`
  - Tabela compacta desktop + cards mobile para bolsas.

## Fontes de dados do modal

- `client/src/lib/world-clock-countries.ts`
  - Dataset canônico de países, capitais, fusos, aliases e regime político.
- `client/src/lib/world-clock-country-details.ts`
  - Fonte única dos perfis editoriais de países.
  - Guarda perfis curados dos países prioritários e fallback automático para o restante.

## O que ainda merece refatoração

- `Schedule.tsx`
  - Muito grande e com responsabilidades demais.
- `Calculator.tsx`
  - Componente extenso e com bastante lógica acoplada.
- `Calendar.tsx`
  - Mistura render, filtros e regras de domínio.
- Jogos (`Crossword`, `Sudoku`, `WordSearch`)
  - Ainda concentram bastante UI + regra no mesmo arquivo.
