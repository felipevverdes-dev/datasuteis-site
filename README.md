# Datas Úteis

Aplicação React + Vite com foco em utilidades de calendário, dias úteis, escalas, idade, jogos leves e páginas utilitárias orientadas a SEO.

## Stack

- Front-end: React 19 + TypeScript + Wouter
- Build: Vite
- Server: Express + esbuild
- Estilo: Tailwind CSS v4 + tokens em `client/src/index.css`
- SEO estático: `scripts/postbuild-seo.mjs`
- i18n: PT / EN / ES via `LanguageContext` e `?lang=`

## Scripts

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview -- --host
npm run start
```

## Estrutura principal

```text
client/
  index.html
  public/
  src/
    components/
    contexts/
    lib/
    pages/
server/
shared/
scripts/
docs/
```

## Como a aplicação funciona

1. O Vite usa `client/` como raiz da aplicação.
2. O front renderiza as páginas por rota com Wouter.
3. O build executa `vite build`, depois roda `scripts/postbuild-seo.mjs`.
4. O pós-build gera HTML estático por rota, canonical, metadados e `sitemap.xml`.
5. O servidor Express entrega `dist/public/`, aplica headers, API proxy e fallback SPA controlado.

## Decisões importantes

- Arquivos públicos que precisam ir para a raiz do domínio ficam em `client/public/`.
- O diretório efetivamente publicado pelo build é `dist/public/`.
- Canonical, `hreflang`, Open Graph e JSON-LD são ajustados em runtime por `usePageSeo` e em build por `postbuild-seo.mjs`.
- Integrações externas sensíveis passam pelo backend quando necessário para evitar expor chaves no client.
- A nova página de Horário Mundial / Mercados Globais usa dataset global local por continente em `client/src/lib/world-clock-countries.ts`.
- `client/src/lib/world-clock-data.ts` concentra formatadores, status de mercado e tipos normalizados da feature.
- O modal editorial dos países usa `client/src/lib/world-clock-country-details.ts`.
- O comparador entre países foi removido; a navegação atual é por continentes com busca por país, capital e aliases.
- Cotações de mercado usam API interna e fallback local, sem dependência direta de CORS no frontend.

## Fluxo de produção

```bash
npm run check
npm run build
npm run preview -- --host
```

Saídas importantes para validar:

- `dist/public/index.html`
- `dist/public/sitemap.xml`
- `dist/public/robots.txt`
- `dist/public/ads.txt`
- `dist/public/utilitarios/horario-mundial/index.html`

## Deploy resumido

- Docker/Coolify deve servir a imagem construída a partir do `Dockerfile` da raiz.
- A aplicação escuta na porta `3000`.
- Em produção, o servidor deve publicar exatamente `dist/public/`.

Documentação complementar:

- [Arquitetura](docs/ARCHITECTURE.md)
- [Rotas](docs/ROUTES.md)
- [Design System](docs/DESIGN-SYSTEM.md)
- [Inventário de Componentes](docs/COMPONENT-INVENTORY.md)
- [Integrações](docs/API-INTEGRATIONS.md)
- [I18N](docs/I18N.md)
- [SEO Checklist](docs/SEO-CHECKLIST.md)
- [Manual QA](docs/MANUAL-QA.md)
- [Padrões de Código](docs/CODE-STANDARDS.md)
