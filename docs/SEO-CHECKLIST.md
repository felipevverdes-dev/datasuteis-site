# SEO Checklist

## Obrigatório para qualquer nova página

- rota registrada em `client/src/App.tsx`
- rota prevista em `server/index.ts` quando aplicável
- canonical correto
- `title` único
- `description` única
- heading hierarchy coerente
- breadcrumb visível e schema compatível
- conteúdo real na página
- sem 200 com tela vazia
- sem item sem nome em JSON-LD
- sem links internos quebrados

## Quando a rota for indexável

- incluir no sitemap via `scripts/postbuild-seo.mjs`
- incluir no `seo-prerender-entry.tsx` se for rota prioritária
- validar arquivo gerado em `dist/public/.../index.html`

## Schema

- usar helpers centralizados:
  - `buildBreadcrumbSchema`
  - `buildFaqPageSchema`
- só adicionar `FAQPage` quando houver FAQ real na interface
- evitar duplicação de JSON-LD global e local

## Metadata social

- `usePageSeo`
- `og:title`
- `og:description`
- `og:url`
- `twitter:title`
- `twitter:description`

## I18N e indexação

- revisar `?lang=en` e `?lang=es`
- não indexar conteúdo parcialmente traduzido sem fallback claro
- garantir que labels e textos essenciais mudem por idioma

## Infraestrutura

- `client/public/robots.txt`
- `client/public/ads.txt`
- `client/public/sitemap.xml`
- `client/index.html` com verificação do Search Console quando necessário

## Verificação manual mínima

- abrir `view-source:` da página
- conferir canonical
- conferir meta description
- conferir JSON-LD
- conferir `https://datasuteis.com.br/sitemap.xml`
- conferir `https://datasuteis.com.br/robots.txt`
