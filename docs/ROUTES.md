# Routes

## Rotas principais

- `/`
- `/calcular/`
- `/calendario/`
- `/escala/`
- `/idade/`
- `/blog/`
- `/sobre/`
- `/contato/`
- `/privacidade/`
- `/termos/`

## Rotas de simuladores e cálculo

- `/calcular/`
- `/dias-uteis/`
- `/dias-uteis/:year/`
- `/dias-uteis/:year/:month/`
- `/quinto-dia-util/`
- `/quinto-dia-util/:year/`
- `/quinto-dia-util/:year/:month/`
- `/idade/`
- `/idade/calcular-idade/`
- `/idade/data-de-nascimento/`
- `/idade/dia-da-semana-que-nasceu/`
- `/idade/quantos-dias-eu-tenho-de-vida/`

## Rotas utilitárias

- `/utilitarios/`
- `/utilitarios/calculadora/`
- `/utilitarios/sorteador/`
- `/utilitarios/conversor-de-moeda/`
- `/utilitarios/clima/`
- `/utilitarios/horario-mundial/`
  - navegação interna por continentes
  - busca por país, capital e aliases
- `/utilitarios/horario-mercados/`
  - página própria para horários de bolsas e snapshots de mercado
  - query antiga `/utilitarios/horario-mundial/?tab=mercados` redireciona para esta rota

## Rotas de jogos

- `/jogos/`
- `/jogos/sudoku/`
- `/jogos/caca-palavras/`
- `/jogos/palavras-cruzadas/`

## Rotas de conteúdo

- `/blog/`
- `/blog/:slug/`

## Rotas institucionais

- `/sobre/`
- `/contato/`
- `/privacidade/`
- `/termos/`
- `/404/`

## Rotas programáticas geradas no build

Geradas por `scripts/postbuild-seo.mjs`:

- `/calendario/:year/`
- `/calendario/:year/:month-slug/`
- `/dias-uteis/:year/`
- `/dias-uteis/:year/:month-slug/`
- `/quinto-dia-util/:year/`
- `/quinto-dia-util/:year/:month-slug/`
- `/blog/:slug/`

## Observações importantes

- A aplicação aceita variantes com e sem barra final no roteador, mas o padrão canônico é sempre com barra final.
- Rotas indexáveis precisam existir em três lugares quando aplicável:
  - `client/src/App.tsx`
  - `client/src/seo-prerender-entry.tsx`
  - `scripts/postbuild-seo.mjs`
- O servidor Express espelha as rotas SPA válidas em `server/index.ts` para diferenciar fallback 200 de 404 real.
