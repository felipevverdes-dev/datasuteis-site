# Design System

## Fonte da verdade

Os tokens visuais vivem em `client/src/index.css`.

## Tokens base

## Cores

- `--primary`: azul institucional
- `--background`: fundo da aplicação
- `--foreground`: texto principal
- `--secondary`: superfícies auxiliares
- `--muted-foreground`: textos de apoio
- `--border`: borda padrão
- `--ring`: foco visível

## Radius

- `--radius`
- derivados: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`

## Sombra

- Cards usam sombra leve por padrão via `.card-base`
- Blocos principais usam `shadow-sm`
- Modais usam `shadow-2xl`

## Tipografia

- Texto base: `"Segoe UI", "SF Pro Text", "Helvetica Neue", Arial, sans-serif`
- Títulos: `"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif`

## Spacing

Escalas mais frequentes:

- `p-3`, `p-4`, `p-5`, `p-6`, `p-8`
- `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6`

## Padrões reutilizáveis

## Layout

- `.container`
- `.hero`
- `.section-md`
- `.page-stack`
- `.page-grid`
- `.section-card`

## Cards

- `.card-base`
- `.card-hover`
- `.result-card`
- `.compact-stat`

## Botões

- `.btn-primary`
- `.btn-secondary`
- `.btn-outline`
- `.btn-cta-primary`
- `.btn-cta-final`

## Inputs

- `.input-base`
- `.input-touch`

## Badges e chips

- `.badge`
- `.badge-primary`
- `.status-chip`

## Tabelas compactas

- `.table-wrap`
- `.data-table`
- `.compact-table`

## Modais

- `client/src/components/ui/ModalDialog.tsx`
- foco preso
- fechamento por `ESC`
- clique no backdrop
- retorno de foco

## Responsividade

- Mobile-first
- `page-grid` cresce de 1 para 2 e 3 colunas
- tabelas densas devem ter fallback móvel em cards
- conteúdo crítico nunca pode depender de hover

## Diretrizes para novas páginas

- Reutilizar `PageShell`
- Preferir `.section-card` e `.card-base` antes de criar classes novas
- Só criar utilitário novo quando ele for reutilizável em 2 ou mais telas
- Para leitura compacta, preferir `.compact-stat` e `.data-table` em vez de cards grandes
