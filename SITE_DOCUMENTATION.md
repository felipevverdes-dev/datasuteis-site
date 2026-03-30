# SITE DOCUMENTATION

## 1. Visao Geral Do Projeto

- Projeto: `datas-uteis-new`
- Objetivo: site utilitario para calculo de dias uteis, calendario de feriados, calculadora auxiliar, simulacao de escalas de trabalho e publicacao de artigos de blog.
- Stack principal:
  - Frontend: React 19 + Vite 7 + TypeScript + Wouter
  - Estilos: Tailwind CSS v4 via `@tailwindcss/vite` + CSS utilitario em `client/src/index.css`
  - Backend de entrega: Express simples em `server/index.ts`
  - SEO por rota: HTMLs estaticos por rota + atualizacao de head em runtime via `usePageSeo`
  - I18n: camada propria com provider global e fallback para PT
  - Google: GA4 e AdSense integrados no HTML e no runtime

## 2. Estrutura De Pastas

- `client/`
  - `index.html` e subpastas de rota com `index.html` proprio para SEO/entrypoints
  - `public/`
    - `assets/brand/`: logo oficial, favicons e OG image
    - `ads.txt`, `robots.txt`, `sitemap.xml`
  - `src/`
    - `components/`: blocos compartilhados como `Header`, `Footer`, `Brand`, `AdSlot`
    - `components/ui/`: primitives realmente em uso (`tooltip`, `sonner`)
    - `contexts/`: `ThemeContext` e `LanguageContext`
    - `lib/`: SEO, i18n, blog, feriados, simulador de escala, utilitarios e constantes de site
    - `pages/`: paginas principais e auxiliares
    - `types/`: declaracoes globais de `window.gtag` e `window.adsbygoogle`
- `server/`
  - `index.ts`: servidor Express que serve `dist/public`
- `dist/`
  - build de producao gerado por `pnpm build`
- `patches/`
  - patch aplicado ao `wouter`
- `shared/`
  - alias reservado em `tsconfig.json` e `vite.config.ts`; atualmente sem modulos ativos

## 3. Rotas Do Site

- Home: `/`
- Dias Uteis: `/calcular/` e `/calcular`
- Calculadora: `/calculadora/` e `/calculadora`
- Calendario: `/calendario/` e `/calendario`
- Escala: `/escala/` e `/escala`
- Blog hub: `/blog/` e `/blog`
- Blog artigo: `/blog/:slug/` e `/blog/:slug`
- Privacidade: `/privacidade/` e `/privacidade`
- Fallback:
  - `/404`
  - rota final do Wouter -> `NotFound`

Artigos atuais do blog:

- `/blog/escalas-de-trabalho-clt/`
- `/blog/escala-12x36-como-funciona/`
- `/blog/escala-6x1-como-funciona/`
- `/blog/dias-uteis-o-que-sao/`
- `/blog/quinto-dia-util/`
- `/blog/adicional-noturno/`

## 4. Padroes De UI

- Navbar:
  - componente: `client/src/components/Header.tsx`
  - sticky no topo, com `Brand`, nav principal, seletor de idioma e toggle de tema
  - nav desktop em `md+` e menu mobile colapsavel abaixo disso
- Footer:
  - componente: `client/src/components/Footer.tsx`
  - `AdSlot` fica imediatamente acima do `<footer>`
  - footer contem marca, links de ferramentas, conteudo, contato e copyright
- Cards:
  - base visual: classe `card-base`
  - bordas arredondadas amplas, sombra leve e espacamento confortavel
- Ad slots:
  - componente: `client/src/components/AdSlot.tsx`
  - shell visual limpo, sem fundo e sem borda
  - `minHeight` padrao para reduzir CLS
- Formularios:
  - campos usam `input-base`
  - botoes usam `btn-primary`, `btn-secondary` e `btn-outline`
- Responsividade:
  - `container mx-auto` como estrutura base
  - grids com quebras principais em `sm`, `md`, `lg` e `xl`

## 5. Branding

- Logo oficial usada:
  - `client/public/assets/brand/datas-uteis.svg`
- Uso da marca:
  - `client/src/components/Brand.tsx`
  - a marca do navbar renderiza somente a imagem
  - o componente limita largura maxima com `max-w-[132px] sm:max-w-[148px]`
- Cache-busting atual:
  - `Brand.tsx` usa `"/assets/brand/datas-uteis.svg?v=20260311-2"`
- Favicons e imagens relacionadas:
  - `client/public/assets/brand/apple-touch-icon.png`
  - `client/public/assets/brand/favicon-16.png`
  - `client/public/assets/brand/favicon-32.png`
  - `client/public/assets/brand/og-image.png`
- Regra de manutencao:
  - nao trocar caminho da logo sem validar o navbar
  - se trocar o asset, revisar `viewBox`, proporcao e possivel cache-busting

## 6. Cores Do Projeto

Tokens principais em `client/src/index.css`:

- `--primary: #1a3a5c`
- `--primary-foreground: #ffffff`
- `--background: #ffffff`
- `--foreground: #1f2937`
- `--secondary: #f3f4f6`
- `--secondary-foreground: #374151`
- `--muted: #e5e7eb`
- `--muted-foreground: #6b7280`
- `--accent: #10b981`
- `--accent-foreground: #ffffff`
- `--destructive: #ef4444`
- `--border: #e5e7eb`

Tema dark tambem existe em `index.css`, mas o site inicia em light por padrao e so entra em dark por escolha explicita do usuario.

Classes utilitarias recorrentes:

- `hero`
- `hero-title`
- `hero-subtitle`
- `card-base`
- `btn-primary`
- `btn-secondary`
- `btn-outline`
- `input-base`
- `badge`
- `badge-primary`
- `badge-success`
- `section-sm`
- `section-md`
- `section-lg`

## 7. Tipografia E Espacamento

- Fonte principal:
  - `"Inter", ui-sans-serif, system-ui, sans-serif`
- Fonte de destaque/titulos:
  - `"Poppins", ui-sans-serif, system-ui, sans-serif`
- Convencoes visuais:
  - titulos principais com peso forte e espacamento vertical generoso
  - cards com `rounded-2xl` ou superior
  - secoes principais usando `section-md` e `section-lg`
  - containers com `mx-auto` e limites de largura em secoes hero/editoriais

## 8. Padroes De Componentes

### Brand

- Arquivo: `client/src/components/Brand.tsx`
- Responsavel por renderizar a logo oficial e o link para a home
- Deve permanecer compacto para nao empurrar o menu

### Navbar

- Arquivo: `client/src/components/Header.tsx`
- Itens:
  - Home
  - Dias Uteis
  - Calculadora
  - Calendario
  - Escala
  - Blog
- Usa `LanguageSwitcher`
- Usa `ThemeContext` para toggle de tema

### Footer

- Arquivo: `client/src/components/Footer.tsx`
- Mantem `AdSlot` acima do rodape
- Reaproveita `Brand`
- Expone links importantes como `ads.txt` e `sitemap.xml`

### AdSlot

- Arquivo: `client/src/components/AdSlot.tsx`
- Faz `window.adsbygoogle.push({})` com retentativas curtas
- Usa `ADSENSE_CLIENT_ID` vindo de `client/src/lib/site.ts`
- Nao define `data-ad-slot` manual; validacao final depende da estrategia configurada no AdSense

### LanguageSwitcher

- Arquivo: `client/src/components/LanguageSwitcher.tsx`
- Formato compacto com botoes:
  - `🇧🇷 PT`
  - `🇺🇸 EN`
  - `🇪🇸 ES`
- Usa `aria-label` e `aria-pressed`
- Nao altera rotas; apenas muda o idioma global

### Estrutura Recomendada Das Paginas

- `Header`
- `main`
- secoes de conteudo
- `Footer`

Todas as paginas principais seguem esse padrao.

## 9. SEO

Arquivos centrais:

- `client/src/lib/seo.ts`
- HTMLs de rota em `client/` e subpastas
- `client/public/robots.txt`
- `client/public/sitemap.xml`

Padrao atual:

- Cada rota estrategica possui um HTML proprio com head estatico
- Em runtime, `usePageSeo` atualiza:
  - `title`
  - `meta description`
  - `robots`
  - `author`
  - `keywords`
  - Open Graph
  - Twitter Card
  - canonical
  - JSON-LD

Observacoes:

- A estrategia nao depende apenas do `index.html` da SPA
- O blog usa schema de artigo e FAQs quando aplicavel
- O canonical sempre usa `SITE_URL` + path normalizado

## 10. Google

### Google Analytics

- ID usado: `G-E9198198D5`
- Constante: `GA_MEASUREMENT_ID` em `client/src/lib/site.ts`
- Scripts base ficam nos HTMLs de rota
- A navegacao SPA envia pageview em `usePageSeo`
- Configuracao inicial usa `send_page_view: false` para evitar duplicacao

### Google AdSense

- Client usado: `ca-pub-3377250238500968`
- Constante: `ADSENSE_CLIENT_ID` em `client/src/lib/site.ts`
- Script base fica nos HTMLs de rota
- `AdSlot.tsx` renderiza o bloco `ins.adsbygoogle`
- `client/public/ads.txt` contem:
  - `google.com, pub-3377250238500968, DIRECT, f08c47fec0942fa0`

Pontos de atencao:

- Evitar duplicar script do AdSense em componentes
- Validar em ambiente real se a estrategia atual de slot automatico atende a conta
- Manter `minHeight` para reduzir CLS

## 11. I18N

Arquivos centrais:

- `client/src/contexts/LanguageContext.tsx`
- `client/src/lib/i18n.ts`
- `client/src/lib/i18n/legacy/pt.json`
- `client/src/lib/i18n/legacy/en.json`
- `client/src/lib/i18n/legacy/es.json`

Como funciona:

- Idioma default: `pt`
- Idiomas suportados:
  - `pt`
  - `en`
  - `es`
- Persistencia:
  - `datasuteis_lang`
  - compatibilidade com chave legada `lang`
- O provider aplica `document.documentElement.lang`
- Fallback de traducao sempre cai para PT quando necessario

Como adicionar novas chaves:

1. Adicionar a chave em `client/src/lib/i18n.ts`
2. Se for conteudo longo legado, adicionar nos JSONs em `client/src/lib/i18n/legacy/`
3. Consumir via `useI18n()` com `t(...)`, `tm(...)` ou `formatDate(...)`
4. Evitar texto hardcoded em paginas e componentes

Componentes/paginas ja adaptados:

- Header
- Footer
- AdSlot
- ErrorBoundary
- Home
- Calculator
- CalculatorApp
- Calendar
- Schedule
- Blog
- BlogPost
- NotFound
- parte principal de Privacy com fallback consistente

## 12. Pagina /escala/

Arquivos centrais:

- `client/src/pages/Schedule.tsx`
- `client/src/lib/schedule-simulator.ts`
- `client/src/lib/holidays.ts`

Fluxo da pagina:

1. Usuario define parametros operacionais:
   - mes
   - escala escolhida ou auto
   - postos simultaneos
   - horario de operacao
   - quantidade de turnos
   - sobreposicao de turnos
   - operacao em sabado/domingo/feriado
   - ajuste manual de horas
2. `simulateScheduleScenario()` calcula:
   - sugestao de escala
   - quadro minimo
   - horas por colaborador
   - cobertura
   - status
   - alertas
   - observacoes
   - simulacao diaria
3. A pagina apresenta a hierarquia executiva:
   - card executivo do resultado
   - ajuste de jornada
   - calendario
   - alertas e observacoes

Regras sensiveis:

- nao quebrar o status:
  - dentro do padrao
  - alerta
  - incompativel
- nao quebrar o tratamento de:
  - sabado
  - domingo
  - feriados
  - turnos
  - sobreposicao de turnos
  - horas ajustadas manualmente
  - quadro minimo
  - cobertura por colaborador
- o simulador usa heuristicas de aderencia, risco e cobertura; evitar alterar sem revalidar cenarios reais

## 13. Blog

Arquivos centrais:

- `client/src/lib/blog.ts`
- `client/src/pages/Blog.tsx`
- `client/src/pages/BlogPost.tsx`
- HTMLs de artigo em `client/blog/<slug>/index.html`

Como os artigos sao organizados:

- `BLOG_CATALOG` em `client/src/lib/blog.ts` concentra:
  - slug
  - datas
  - tempo de leitura
  - relacionados
  - metadados por idioma
- O HTML do artigo vem de chaves traduzidas nos JSONs legados
- FAQs sao extraidas automaticamente do HTML com `<details><summary>...</summary><p>...</p></details>`

Como adicionar um artigo novo:

1. Criar o slug e os metadados em `BLOG_CATALOG`
2. Adicionar o HTML traduzido nos JSONs de `legacy`
3. Criar `client/blog/<slug>/index.html` com head proprio
4. Adicionar o novo entrypoint em `vite.config.ts`
5. Atualizar `client/public/sitemap.xml`
6. Revisar links internos e artigos relacionados

## 14. Build E Deploy

Comandos principais:

- desenvolvimento: `corepack pnpm dev`
- checagem TS: `corepack pnpm check`
- build: `corepack pnpm build`
- preview local: `corepack pnpm preview`
- producao Node: `corepack pnpm start`

Fluxo de build:

- Vite gera o frontend em `dist/public`
- esbuild gera `dist/index.js` a partir de `server/index.ts`

Antes de publicar:

- revisar titulos e canonicals das rotas alteradas
- revisar `ads.txt`, `robots.txt` e `sitemap.xml`
- validar se a logo e os favicons continuam corretos
- verificar se o idioma default continua PT
- validar se nao houve duplicacao de scripts Google

## 15. Checklist De Manutencao

Antes de alterar:

- mapear imports e referencias globais
- verificar se a rota possui HTML proprio
- verificar se existe efeito em i18n, SEO e analytics

Antes de deploy:

- rodar `corepack pnpm check`
- rodar `corepack pnpm build`
- revisar warnings relevantes
- revisar rotas principais e artigos

Apos mudancas:

- testar navbar, footer e logo
- testar troca de idioma
- testar pageview SPA
- testar pagina `/escala/`
- testar blog hub e artigos
- testar links para `ads.txt`, `sitemap.xml` e privacidade

## 16. Checklist De Seguranca De Edicao

- Nao quebrar rotas duplicadas com e sem trailing slash
- Nao trocar caminho da logo sem validar o `Brand.tsx`
- Nao duplicar scripts do Google Analytics ou AdSense
- Nao remover assets sem busca global por referencias
- Nao remover HTMLs de rota sem atualizar `vite.config.ts`
- Nao alterar `ads.txt` sem confirmar `ca-pub-3377250238500968`
- Nao alterar `GA_MEASUREMENT_ID` sem confirmar `G-E9198198D5`
- Nao mexer no simulador de escala sem testar:
  - 5x2
  - 6x1
  - 12x36
  - cobertura parcial
  - ajuste manual de horas
- Nao deixar texto novo hardcoded se a area ja estiver conectada ao i18n
