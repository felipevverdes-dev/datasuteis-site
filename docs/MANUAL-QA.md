# Manual QA

## Antes de começar

- rodar `npm run check`
- rodar `npm run build`
- rodar `npm run preview -- --host`
- validar no navegador com viewport mobile, tablet e desktop

## Global

- header abre e fecha corretamente
- troca de idioma muda texto sem quebrar layout
- troca de tema mantém contraste e foco visível
- breadcrumb aparece quando esperado
- footer mantém links válidos
- anúncios não causam quebra visual severa

## Home

- hero carrega sem CLS perceptível
- cards principais abrem rotas corretas
- bloco de resumo do momento carrega fallback e localização
- FAQ expande sem quebrar espaçamento

## Dias úteis

- cálculo com datas válidas funciona
- validação impede data final menor que inicial
- CSV gera corretamente
- resultado não muda idioma parcialmente

## Calendário

- troca de mês e ano funciona
- rotas `/calendario/:year/` e `/calendario/:year/:month/` respondem
- legenda e lista de feriados permanecem legíveis em mobile

## Escalas

- formulário gera simulação
- alertas e observações aparecem quando esperado
- calendário interno não quebra em telas menores

## Idade

- `/idade/` responde 200
- subrotas de idade funcionam
- textos, labels e CTA mudam por idioma

## Utilitários

- lista de utilitários abre todos os cards corretamente
- layout não quebra em 320px
- CTAs finais continuam corretos

## Horário Mundial

- rota `/utilitarios/horario-mundial/` responde
- navegação horizontal por continentes funciona por clique
- navegação horizontal por continentes funciona por teclado
- busca por país/cidade filtra a grade
- busca por alias retorna o país correto
- contagem de resultados acompanha a grade filtrada
- troca de continente não duplica resultados
- clique no relógio abre o modal do país correto
- modal:
  - abre
  - fecha no botão
  - fecha com `ESC`
  - fecha ao clicar fora
  - prende foco
  - devolve foco ao fechar
  - mantém a mesma hierarquia:
    - resumo editorial
    - visão geral
    - ficha rápida
    - contexto cultural
    - principais características
    - pontos turísticos
  - renderiza corretamente um país curado e um país em fallback
  - nunca exibe `undefined`, `null`, `NaN` ou bloco vazio
- PT / EN / ES mudam:
  - título
  - descrição
  - FAQ
  - labels
  - modal

## Mercados Globais

- rota `/utilitarios/horario-mercados/` responde
- `/utilitarios/horario-mundial/?tab=mercados` redireciona para `/utilitarios/horario-mercados/`
- tabela compacta aparece em desktop
- cards compactos aparecem em mobile
- horários locais atualizam
- status da bolsa muda sem depender de cor apenas
- cotação, fechamento e variação exibem fallback elegante quando ausentes
- botão atualizar funciona
- HTML estático não imprime tabela inteira com “cotação indisponível” antes da hidratação

## Jogos

- `/jogos/` responde
- `/jogos/sudoku/` responde e mantém breadcrumb/schema sem erro
- palavras cruzadas e caça-palavras carregam sem regressão

## Blog e institucional

- `/blog/` e posts respondem
- `/sobre/`, `/contato/`, `/privacidade/`, `/termos/` respondem
- titles e descriptions são únicos

## SEO e indexação

- abrir `view-source:` e validar:
  - `<title>`
  - meta description
  - canonical
  - hreflang
  - JSON-LD
- conferir:
  - `https://datasuteis.com.br/robots.txt`
  - `https://datasuteis.com.br/sitemap.xml`
  - `https://datasuteis.com.br/ads.txt`

## Analytics e consentimento

- sem consentimento, scripts não essenciais não devem disparar como antes do aceite
- com consentimento, GA4 deve registrar navegação
- trocar continente e abrir a página de mercados deve emitir evento
- seleção de país e abertura de modal devem emitir evento

## Acessibilidade

- navegar por teclado:
  - header
  - switcher entre horário mundial e mercados
  - navegação por continentes
  - inputs
  - cards
  - modal
- verificar foco visível
- validar leitura básica com leitor de tela:
  - heading principal
  - breadcrumb
  - switcher entre páginas
  - modal
  - tabela de mercados

## Breakpoints

- mobile: 320px / 375px / 430px
- tablet: 768px
- desktop: 1280px e 1440px

## Erros visuais

- sem overflow horizontal inesperado
- sem texto cortado em botões
- sem cards gigantes fora de proporção
- sem `null`, `undefined` ou placeholders técnicos na UI
