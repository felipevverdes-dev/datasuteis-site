# Architecture

## Visão geral

O projeto é um site utilitário híbrido:

- Front-end React com navegação client-side por rota.
- Build estático otimizado para indexação.
- Servidor Express para entrega do build, headers de segurança e APIs auxiliares.

## Camadas

## 1. Presentation

- `client/src/pages/`
- `client/src/components/`

Responsável por layout, interação, acessibilidade, responsividade e composição de páginas.

## 2. Contexts

- `client/src/contexts/ThemeContext.tsx`
- `client/src/contexts/LanguageContext.tsx`
- `client/src/contexts/GeolocationContext.tsx`

Responsável por estado global leve e preferências do usuário.

## 3. Page services / domain helpers

- `client/src/lib/`
- `shared/`

Responsável por:

- SEO helpers
- i18n helpers
- formatação de datas/números
- dados de domínio
- modelos de mercado global
- helpers de agenda/negócio

## 4. Server integrations

- `server/index.ts`
- `server/external-data.ts`
- `server/business-days-api.ts`

Responsável por:

- servir `dist/public`
- controlar headers, cache e fallback de rotas
- executar proxy para integrações externas
- proteger a aplicação de exposição indevida de segredos

## 5. Static SEO pipeline

- `scripts/postbuild-seo.mjs`
- `client/src/seo-prerender-entry.tsx`

Responsável por:

- gerar HTML por rota
- aplicar metadados estáticos
- gerar sitemap
- incluir breadcrumbs e schema base no HTML gerado

## Fluxo de renderização

1. O Vite gera assets e o HTML base.
2. O pós-build monta páginas estáticas indexáveis em `dist/public/`.
3. O Express serve os arquivos gerados.
4. O cliente hidrata e `usePageSeo` atualiza metadados quando há navegação interna.

## Padrões atuais que devem ser preservados

- `PageShell` como wrapper principal de páginas utilitárias e institucionais.
- `usePageSeo` para metadados por rota.
- `buildBreadcrumbSchema` e `buildFaqPageSchema` para JSON-LD.
- `LanguageContext` como fonte única de idioma.
- `client/public/` para arquivos estáticos de raiz do domínio.

## Melhorias aplicadas nesta passada

- Helper centralizado de idle-load em `client/src/lib/idle.ts`.
- Nova página de horário mundial quebrada em componentes menores:
  - `WorldClock`
  - `WorldClockMarkets`
  - `WorldClockToolSwitcher`
  - `WorldClockContinentNav`
  - `WorldClockCountryCard`
  - `WorldClockCountryModalContent`
  - `WorldClockMarketsTable`
- Dados e utilitários centralizados para a feature:
  - `client/src/lib/world-clock-countries.ts`
  - dataset global único com continente, capital, aliases e fusos
  - `client/src/lib/world-clock-data.ts`
  - formatadores de hora/data/UTC e leitura de status das bolsas
- Conteúdo multilíngue e dados editoriais centralizados:
  - `client/src/lib/world-clock-copy.ts`
  - `client/src/lib/world-clock-country-details.ts`
- Comparador entre países removido em favor de:
  - navegação horizontal por continentes
  - busca local por país, capital e aliases
  - modal sob demanda por país
- Horário Mundial e Horário de Mercados separados em rotas físicas:
  - `/utilitarios/horario-mundial/`
  - `/utilitarios/horario-mercados/`
- A query legada `?tab=mercados` deixou de ser arquitetura primária e agora redireciona para a rota própria de mercados.
- Estilos reutilizáveis para leitura compacta:
  - `.compact-stat`
  - `.status-chip`
  - `.table-wrap`
  - `.data-table`
- A rota `/api/markets/global` passou a usar:
  - cache curto em memória
  - reaproveitamento do último snapshot válido
  - fallback degradado curto quando o provider falha
  - refresh manual com bypass controlado de cache

## Pontos de dívida técnica ainda existentes

- Há páginas grandes demais em `Schedule.tsx`, `Calculator.tsx`, `Calendar.tsx` e alguns jogos.
- O padrão de cópia multilíngue ainda é misto: parte do site usa `i18n.ts`, parte usa `COPY` por página.
- Ainda existem oportunidades de extrair tabelas e blocos repetidos em páginas de dias úteis.
