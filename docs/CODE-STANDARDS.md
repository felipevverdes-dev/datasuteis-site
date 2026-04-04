# Code Standards

## TypeScript

- manter `strict`
- tipar props, estado assíncrono e payloads de integração
- evitar `any`

## Estrutura

- componente de página:
  - composição
  - SEO
  - estados locais da tela
- helper/lib:
  - formatação
  - domínio
  - integração
- `shared/`:
  - modelos usados em front e backend

## Tamanho de componente

- páginas muito grandes devem ser quebradas quando misturarem:
  - layout
  - dados
  - integração
  - modal
  - tabela complexa
- preferir componentes menores quando um bloco puder ser reutilizado ou isolado com clareza

## Hooks

- usar hooks para:
  - estado assíncrono
  - efeitos repetidos
  - comportamento compartilhado
- não criar hook genérico demais sem ganho real

## Dados estáticos

- evitar hardcode espalhado no JSX
- concentrar dados editoriais e catálogos em módulos dedicados
- dados multilíngues devem ficar fora do componente quando crescerem

## Helpers compartilhados

Criar helper compartilhado quando:

- a mesma lógica aparece 2 vezes ou mais
- a lógica mistura browser API com fallback
- a lógica impacta performance ou SEO

Exemplo recente:

- `client/src/lib/idle.ts`

## Acessibilidade

- foco visível obrigatório
- `aria-label` quando o texto visual não for suficiente
- teclado deve funcionar sem hover
- modal sempre com foco preso e retorno de foco

## Performance

- evitar bibliotecas grandes sem necessidade
- usar lazy load para modal e conteúdo pesado
- evitar polling agressivo
- timers globais devem ser mínimos e centralizados

## SEO

- toda página indexável precisa sair com `usePageSeo`
- canonical sempre com barra final
- schema via helpers centralizados

## Estilo

- reutilizar classes existentes antes de criar novas
- novas classes devem ser genéricas e reaproveitáveis
- evitar “estilo local” excessivo em páginas grandes
