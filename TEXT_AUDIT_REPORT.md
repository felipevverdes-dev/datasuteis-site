# Auditoria de Textos — Datas Úteis

> **Data da auditoria:** 29 de março de 2026
> **Auditor:** Análise estática de código-fonte (sem execução em browser)
> **Escopo:** Todos os textos visíveis em PT-BR — i18n (i18n.ts), componentes hardcoded e conteúdo do blog
> **Framework:** React + Vite + Wouter + sistema próprio de i18n (arquivo `client/src/lib/i18n.ts`)

---

## 1. Resumo Geral

### Visão geral da qualidade textual
O site apresenta uma base textual sólida para as páginas de ferramentas (calculadora de dias úteis, calendário, escala) e tem bom nível de coerência no tom. No entanto, há problemas claros de inconsistência entre textos que estão no sistema i18n e textos hardcoded em componentes — especialmente nas páginas de Jogos, UtilityWidgets (Home) e Sobre. A duplicação de i18n com outra fonte de cópia no mesmo componente (exemplo: `HOME_COPY` paralelo a chaves do i18n) também cria risco de desalinhamento.

### Páginas com melhor qualidade textual
- **/calcular/** — Textos claros, H1 funcional, guia de instruções bem estruturado
- **/blog/** e artigos — Títulos, descrições e excerpts bem redigidos e coerentes
- **/escala/** — Vocabulário técnico consistente, bom equilíbrio entre clareza e precisão
- **/privacidade/** — Estrutura clara e linguagem acessível

### Páginas mais problemáticas
- **/jogos/** — H1 com barra separadora estilo título de página SEO (`|`), badge hardcoded em PT fixo, textos de cards placeholder que revelam arquitetura interna
- **/jogos/sudoku/** — Textos hardcoded em PT sem passagem pelo i18n; mistura de mensagens técnicas (`Linha, coluna e bloco destacados`) com copy de produto
- **/calculadora/** — SEO title e H1 desconectados da proposta principal do site; "Calculadora Avançada" como H1 sem contexto de onde ela está inserida
- **/sobre/** — SEO title hardcoded fora do i18n com texto diferente do padrão; `usePageSeo` recebe strings literais em vez de chaves i18n
- **Footer** — Coluna "Contato" contém links de navegação (Início, Jogos) completamente fora de contexto semântico

### Padrões de erro encontrados
1. **Textos hardcoded em PT fora do i18n** em páginas de jogos (Sudoku, Caça-Palavras, Palavras Cruzadas, Games)
2. **H1 com formato de título SEO** (uso de pipe `|` como separador) em `/jogos/`
3. **Textos que revelam implementação técnica** ao usuário final
4. **Footer com conteúdo semanticamente incorreto** na coluna "Contato"
5. **Ausência de H1 em i18n** para a página Sobre (title hardcoded fora do sistema)
6. **Duplicação parcial de cópias** entre objeto `HOME_COPY` e chaves do i18n
7. **Mensagens de toast técnicas** sem padronização de tom
8. **"Gorjeta 15%" / "Gorjeta 20%"** como labels de botão na calculadora financeira — contextualmente deslocados para um site de dias úteis

---

## 2. Auditoria por Página

---

### / (Home)

#### SEO Atual
- **title:** `Calcular Dias Úteis, Calendário, Escala e Calculadora | Datas Úteis`
- **meta description:** `Calcule dias úteis, consulte calendário, simule escala de trabalho, use calculadora, acompanhe clima, moedas e indicadores e jogue online grátis no Datas Úteis.`
- **H1:** `Dias úteis, calendário, calculadora e utilidades rápidas em um só lugar`

#### Textos Principais
*(Fonte: `client/src/pages/Home.tsx` — objeto `HOME_COPY.pt`)*

- **Badge/Eyebrow:** `Ferramentas úteis para o dia a dia`
- **H1:** `Dias úteis, calendário, calculadora e utilidades rápidas em um só lugar`
- **Subtítulo hero:** `Organize prazos, acompanhe feriados, simule escalas, consulte cotações, veja o clima e acesse jogos leves e conteúdo prático sem sair do Datas Úteis.`
- **Botões rápidos (nav):** Dias Úteis / Calculadora / Escala / Jogos
- **Seção Ferramentas:** `Ferramentas do Datas Úteis` + `Acesse os principais recursos do site com navegação clara para rotina pessoal, profissional e operacional.`
- **CTA de cada card:** `Abrir`
- **Seção Blog:** `Conteúdos úteis do blog` + `Artigos objetivos para apoiar rotina de RH, prazos, escalas e decisões do dia a dia.`
- **CTA Blog:** `Ir para o blog`
- **Seção Sobre:** `Sobre o Datas Úteis` + `O projeto nasceu de uma necessidade real de calcular prazo de entrega e evoluiu para reunir ferramentas úteis do cotidiano em um único produto.`
- **CTA Sobre:** `Conhecer a história do site`
- **Highlights:** `Dias úteis, cálculos, calendário, escalas, jogos leves e outras ferramentas úteis do cotidiano.` / `Projeto em evolução contínua, aberto a sugestões enviadas por e-mail.`
- **FAQ title:** `Perguntas frequentes`
- **FAQ 1:** O Datas Úteis é gratuito? / Sim. As ferramentas do site podem ser usadas sem cadastro e sem cobrança.
- **FAQ 2:** O cálculo de dias úteis considera feriados? / Sim. A ferramenta considera feriados nacionais oficiais...
- **FAQ 3:** Os widgets da Home criam páginas novas? / Não. Clima, moedas, indicadores e notícias funcionam dentro da própria Home...
- **FAQ 4:** O site funciona no celular? / Sim. As páginas seguem layout responsivo...

*(Fonte: `client/src/components/home/UtilityWidgets.tsx` — hardcoded PT)*

- **Badge:** `Utilidades rápidas`
- **H2 Widgets:** `Consulta rápida de moedas, crypto, bolsas, clima e conversão`
- **Subtítulo widgets:** `Dados leves carregados de forma assíncrona para apoiar decisões do dia a dia sem poluir a página.`
- **Botão notícias:** `Buscar notícias`
- **Widget Moedas:** `Moedas`
- **Widget Criptomoedas:** `Criptomoedas`
- **Widget Bolsas:** `Bolsas`
- **Widget Clima:** `Clima` / `Agora` / `Condição` / `Vento`
- **Fallback clima:** `Sem geolocalização disponível, exibimos um fallback leve para São Paulo.`
- **Error moedas:** `As cotações estão temporariamente indisponíveis.`
- **Error clima:** `Não foi possível carregar o clima agora.`
- **Conversor:** `Conversor de moeda` / `Conversão rápida usando as cotações carregadas nesta seção.`
- **Labels conversor:** `Valor` / `De` / `Para` / `Resultado`
- **Loading clima:** `Carregando...`
- **Fallback região:** `Sua região`

#### Problemas Encontrados

1. **FAQ 3 com linguagem técnica/interna:** `"Os widgets da Home criam páginas novas?"` — A palavra "widgets" e a expressão "páginas indexáveis" são vocabulário de desenvolvedor/SEO, não de usuário final. O usuário não perguntaria isso; a FAQ existe para fins de SEO, não de usabilidade real.

2. **Subtítulo do widget de utilidades revela implementação:** `"Dados leves carregados de forma assíncrona para apoiar decisões do dia a dia sem poluir a página."` — O usuário não precisa saber que são dados assíncronos ou que existem preocupações com poluição de página.

3. **Fallback de clima com linguagem técnica:** `"Sem geolocalização disponível, exibimos um fallback leve para São Paulo."` — A palavra "fallback" é jargão técnico que não deve aparecer para o usuário final.

4. **Duplicação de cópia:** A página Home tem dois sistemas paralelos de copy — o objeto `HOME_COPY` no próprio arquivo e as chaves do i18n (`hero_title`, `hero_subtitle`, etc. no i18n). Isso causa situação onde o i18n tem copy de hero diferente da Home real. O i18n tem: `"Calcule dias úteis e organize escalas de trabalho com mais precisão"` (hero_title), mas esse texto não é usado na Home atual.

5. **CTA genérico:** O botão `"Abrir"` nos cards de ferramenta é fraco. Não comunica nenhuma ação ou benefício específico.

6. **Redundância título/subtítulo SEO:** O title tem `"Calcular Dias Úteis, Calendário, Escala e Calculadora"` e a description começa com `"Calcule dias úteis, consulte calendário, simule escala de trabalho, use calculadora..."` — as primeiras palavras da description repetem o title em forma verbal.

7. **UtilityWidgets sem i18n:** Todo o componente `UtilityWidgets.tsx` está hardcoded em português, sem suporte ao sistema i18n. Isso inclui labels de UI, mensagens de erro, texto de fallback e todo o copy da seção.

#### Observações
- A seção de FAQ da Home no i18n (`pages.home.faqItems`) é um conjunto diferente do FAQ em `HOME_COPY.pt.faqItems`. Os dois coexistem mas apenas o de `HOME_COPY` é usado. O FAQ do i18n contém perguntas sobre a calculadora e a escala, enquanto o da Home atual tem perguntas mais amplas sobre o site.
- O logo exibido pelo componente `Brand` não foi auditado (imagem).

---

### /calcular/ (Calculadora de Dias Úteis)

#### SEO Atual
- **title:** `Calcular Dias Úteis Entre Datas 2026 | Datas Úteis`
- **meta description:** `Calcule dias úteis entre datas com feriados nacionais oficiais do Brasil. Contador de dias úteis online gratuito.`
- **H1:** `Calcular Dias Úteis`

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chaves `calc_*` e `pages.calculator.*`)*

- **H1:** `Calcular Dias Úteis`
- **Subtítulo:** `Informe o período para calcular dias úteis considerando apenas feriados nacionais oficiais.`
- **Label data inicial:** `Data inicial`
- **Label data final:** `Data final`
- **Botão calcular:** `Calcular período`
- **Resultado - Dias úteis:** `Dias úteis`
- **Resultado - Dias corridos:** `Dias corridos`
- **Resultado - Fins de semana:** `Fins de semana`
- **Resultado - Feriados:** `Feriados nacionais`
- **Ação copiar:** `Copiar`
- **Ação CSV:** `Baixar CSV`
- **Guia - título:** `O que entra nessa contagem`
- **Guia - intro:** `O cálculo desconta fins de semana e feriados nacionais oficiais de 2026. Pontos facultativos, como Carnaval e Corpus Christi, ficam fora da conta padrão.`
- **Guia - itens:** `O período é contado da data inicial até a data final.` / `Sábados e domingos saem automaticamente da conta.` / `Somente feriados nacionais oficiais são abatidos do resultado.`
- **Links relacionados:** `Ver calendário 2026` / `Entender o quinto dia útil` / `Simular escala de trabalho`
- **Validação datas vazias:** `Preencha as duas datas para continuar.`
- **Validação ordem:** `A data inicial precisa ser menor ou igual à data final.`

#### Problemas Encontrados

1. **H1 imperativo sem objeto:** `"Calcular Dias Úteis"` é título de ação, adequado como CTA mas fraco como H1 editorial. Não comunica diferencial nem contexto do que o usuário vai obter.

2. **Validação via `alert()`:** As mensagens de validação (`Preencha as duas datas para continuar.` e `A data inicial precisa ser menor ou igual à data final.`) são disparadas com `window.alert()`, que é uma experiência de UX muito antiga. Não é problema de texto em si, mas o texto fica preso em modal nativo do browser.

3. **Guia menciona o ano fixo:** `"feriados nacionais oficiais de 2026"` no texto do guia introdutório está hardcoded. Quando o ano mudar, o texto ficará desatualizado.

4. **Link relacionado com texto inconsistente:** `"Entender o quinto dia útil"` usa verbo no infinitivo, enquanto os outros links usam verbos no imperativo (`"Ver calendário 2026"`, `"Simular escala de trabalho"`). Inconsistência de padrão de CTA.

5. **Guia item 3 redundante com subtítulo:** O subtítulo já diz `"considerando apenas feriados nacionais oficiais"` e o terceiro item do guia repete `"Somente feriados nacionais oficiais são abatidos do resultado."`

#### Observações
- A página usa `a href` em vez de `<Link>` para os links relacionados (linha 183 e 186 do Calculator.tsx), quebrando a navegação SPA — não é problema de texto mas impacta a experiência.
- O campo de CSV tem cabeçalhos bem definidos e nome de arquivo descritivo (`calculo-dias-uteis.csv`).

---

### /calculadora/ (Calculadora Multimodal)

#### SEO Atual
- **title:** `Calculadora Online Grátis | Calculadora Simples Responsiva | Datas Úteis`
- **meta description:** `Calculadora online com modos simples, financeira, científica e de desenvolvedor em layout rápido e responsivo.`
- **H1:** `Calculadora Avançada`

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chaves `pages.calculatorApp.*`)*

- **H1:** `Calculadora Avançada`
- **Subtítulo:** `Calculadora com múltiplos modos: Simples, Financeira, Desenvolvedor e Científica.`
- **Seletor de modos:** `Simples` / `Financeira` / `Desenvolvedor` / `Científica`
- **Seção modos - título:** `Quatro modos em uma única calculadora`
- **Card Simples:** `Operações rápidas para contas do dia a dia com foco em velocidade.`
- **Card Financeira:** `Atalhos para porcentagem e cálculos rápidos de gorjeta ou ajuste de valor.`
- **Card Desenvolvedor:** `Conversão entre bases e operações bitwise para leitura técnica.`
- **Card Científica:** `Funções trigonométricas, logaritmos, potência, raiz e constantes.`
- **Botão gorjeta:** `Gorjeta 15%` / `Gorjeta 20%`

*(Botões hardcoded da calculadora: `C`, `←`, `÷`, `×`, `−`, `+`, `=`, `.`, `HEX`, `BIN`, `OCT`, `NOT`, `AND`, `OR`, `XOR`, `sin`, `cos`, `tan`, `√`, `log`, `ln`, `x^y`, `1/x`, `x!`, `π`, `e`)*

#### Problemas Encontrados

1. **H1 desconectado do site:** `"Calculadora Avançada"` não contextualiza onde o usuário está. Nenhum site de dias úteis seria procurado por "calculadora avançada". O H1 funciona melhor para um app isolado, não para uma ferramenta secundária num site especializado.

2. **Desconexão do SEO title com o H1:** O title menciona `"Calculadora Simples Responsiva"` mas o H1 diz `"Calculadora Avançada"`. São propostas opostas (simples vs. avançada).

3. **Botões "Gorjeta 15%" e "Gorjeta 20%" fora de contexto:** A calculadora financeira exposta como feature de um site de dias úteis/escalas/prazos tem botões de gorjeta (15% e 20%) — uma convenção americana de restaurantes que não é padrão no Brasil. No Brasil, gorjeta de restaurante não segue esses percentuais fixos. O texto correto seria "Tip 15%" em inglês ou recontextualizado como "Percentual 15%" para o mercado brasileiro.

4. **Descrição do modo Desenvolvedor com jargão:** `"Conversão entre bases e operações bitwise para leitura técnica."` — "bitwise" é um termo técnico em inglês inserido num texto em português. Deveria ser "operações bit a bit" ou "operações binárias".

5. **Subtítulo é apenas listagem:** `"Calculadora com múltiplos modos: Simples, Financeira, Desenvolvedor e Científica."` — é uma frase descritiva fraca, equivalente a uma legenda de imagem.

6. **Meta description genérica:** `"Calculadora online com modos simples, financeira, científica e de desenvolvedor em layout rápido e responsivo."` — Não explica POR QUÊ esta calculadora está neste site, nem qual problema resolve.

7. **Botão `←` (backspace) sem texto alternativo acessível:** O botão de apagar usa apenas o símbolo `←` sem `aria-label`.

#### Observações
- Toda a lógica de botões numéricos (C, ←, dígitos, operadores) está hardcoded sem i18n, o que é aceitável para símbolos matemáticos universais.
- A página tem estrutura visual sólida mas o copy de apresentação é fraco.

---

### /calendario/ (Calendário)

#### SEO Atual
- **title:** `Calendário de Feriados 2026 | Datas Úteis`
- **meta description:** `Visualize os feriados nacionais oficiais, pontos facultativos mais consultados, fins de semana e dias úteis do ano de 2026 em um calendário interativo.`
- **H1:** `Calendário 2026`

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chaves `calendar_title` e `pages.calendar.*`)*

- **H1:** `Calendário 2026`
- **Subtítulo:** `Leia 2026 com foco em feriados nacionais oficiais, pontos facultativos mais consultados, fins de semana e dias úteis.`
- **Nomes dos dias:** `DOM` / `SEG` / `TER` / `QUA` / `QUI` / `SEX` / `SÁB`
- **Labels das células:** `Feriado` / `Ponto facultativo` / `Fim de semana` / `Dia útil`
- **Lista feriados - título:** `Feriados nacionais e pontos facultativos de 2026`
- **Navegação:** `Mês anterior` / `Próximo mês`

#### Problemas Encontrados

1. **H1 minimalista demais:** `"Calendário 2026"` é extremamente básico. Não diferencia o calendário de qualquer outro. O SEO title (`"Calendário de Feriados 2026"`) é mais descritivo que o H1, o que cria inversão semântica — o dado mais relevante está fora do H1.

2. **Subtítulo com verbo incomum:** `"Leia 2026 com foco em..."` — o verbo "Leia" aplicado a um ano é uma construção estranha. Normalmente se leria "Consulte" ou "Visualize".

3. **"Ponto facultativo" como label de célula:** Em dias normais de trabalho, o usuário que vê uma célula azul com "Ponto facultativo" pode não entender o significado sem contexto adicional. A legenda/lista de feriados resolve parcialmente, mas não há legenda visual resumida no calendário.

4. **Título da lista de feriados repete o subtítulo:** O subtítulo menciona "feriados nacionais oficiais, pontos facultativos" e o título da lista abaixo diz "Feriados nacionais e pontos facultativos de 2026". Redundância temática.

#### Observações
- O calendário é fixo para 2026 (`CALENDAR_YEAR = 2026` hardcoded), mas os textos incluem "2026" explicitamente — o que ficará desatualizado futuramente.
- Boa clareza nos labels de célula (Feriado, Ponto facultativo, Fim de semana, Dia útil).

---

### /escala/ (Simulador de Escala)

#### SEO Atual
- **title:** `Simulador de Escala de Trabalho | Datas Úteis`
- **meta description:** `Simule cobertura operacional, quadro mínimo, horas por colaborador e calendário mensal para escalas 5x2, 6x1, 12x36, 4x2 e 24x48.`
- **H1:** `Simulador de Escala de Trabalho`

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chaves `scale_*` e `pages.schedule.*`)*

- **H1:** `Simulador de Escala de Trabalho`
- **Subtítulo:** `Analise cobertura, quadro mínimo e distribuição mensal da equipe sem perder a leitura do calendário.`
- **Seção parâmetros - título:** `Parâmetros da operação`
- **Labels do formulário:** `Mês` / `Escala` / `Postos simultâneos` / `Início da operação` / `Fim da operação` / `Quantidade de turnos` / `Encontro de turnos` / `Sábado` / `Domingo` / `Feriados`
- **Opção auto:** `Sugerida automaticamente`
- **Botão gerar:** `Gerar simulação`
- **Resultado - eyebrow:** `Resultado executivo`
- **Resultado - título:** `Resultado da simulação`
- **Métricas:** `Escala recomendada` / `Escala simulada` / `Quadro mínimo` / `Horas por colaborador` / `Cobertura`
- **Ajuste - eyebrow:** `Ajuste de jornada`
- **Ajuste - título:** `Horas por colaborador consideradas`
- **Referência sugerida:** `Referência sugerida: {value}`
- **Botões ajuste:** `- 1h` / `+ 1h` / `Aplicar ajuste` / `Voltar ao sugerido`
- **Calendário - eyebrow:** `Calendário`
- **Calendário - título:** `Calendário da escala`
- **Alertas - eyebrow:** `Alertas e observações`
- **Sem alertas:** `Sem alertas críticos para o cenário simulado.`
- **Status:** `Dentro do padrão` / `Alerta` / `Incompatível`
- **Resumo legal:** `Resumo legal:`
- **Folga:** `Folga`
- **Déficit:** `Déficit de {count}`

#### Problemas Encontrados

1. **Label "Encontro de turnos" ambíguo:** O checkbox `"Encontro de turnos"` não é autoexplicativo. Um usuário leigo não sabe o que significa "encontro de turnos" sem tooltip ou explicação. Poderia ser "Turnos com sobreposição" ou "Turnos com horário de passagem".

2. **Label "Postos simultâneos" é jargão operacional:** Usuários de RH podem entender, mas o público mais amplo pode não saber o que é um "posto" neste contexto. Sem tooltip ou exemplo, o campo fica opaco.

3. **"Resultado executivo" como eyebrow pode ser confuso:** O termo `"Resultado executivo"` como eyebrow pequeno antes do título da seção cria uma estranheza — "executivo" aqui quer dizer "resumo de alto nível", mas o leitor pode associar ao cargo executivo.

4. **"Ajuste de jornada" como eyebrow é redundante:** O eyebrow diz `"Ajuste de jornada"` e o título logo abaixo diz `"Horas por colaborador consideradas"`. Os dois comunicam ideias distintas mas estão sobrepostos visualmente de forma que um parece redundante do outro.

5. **Referência sugerida sem unidade clara:** `"Referência sugerida: {value}"` — o valor formatado inclui a unidade (ex: "180 h/mês"), mas o label "Referência sugerida" não explica ao usuário o que é essa referência, por que ela existe ou por que difere do que ele configurou.

6. **"Resultado da simulação" como título é redundante:** O eyebrow já diz "Resultado executivo" e o título diz "Resultado da simulação". As duas frases cobrem o mesmo conceito de ângulos diferentes sem adicionar informação.

7. **Perfis legais com texto técnico denso:** Os textos de `legalProfiles` (ex: `"Normalmente pede atenção a acordo coletivo, política interna e jornada real."`) são bem escritos mas extremamente densos para um resumo de 1 linha. Para o usuário menos familiarizado com CLT, esses avisos podem gerar ansiedade sem orientação de ação.

#### Observações
- O vocabulário técnico da escala (postos, turnos, cobertura, déficit) é consistente internamente, o que é positivo.
- A página não tem FAQ nem link para blog relacionado — uma oportunidade perdida de SEO e esclarecimento para o usuário.
- O i18n da Escala está bem completo e organizado.

---

### /jogos/ (Hub de Jogos)

#### SEO Atual
- **title:** `Jogos Online Grátis | Sudoku, Caça-Palavras e Palavras Cruzadas | Datas Úteis`
- **meta description:** `Jogue Sudoku, caça-palavras e palavras cruzadas online grátis no Datas Úteis. Jogos leves, rápidos e com boa experiência no celular e computador.`
- **H1:** `Jogos Online Grátis | Datas Úteis`

#### Textos Principais
*(Fonte: `client/src/pages/Games.tsx` — hardcoded em PT)*

- **Badge:** `Jogos`
- **H1:** `Jogos Online Grátis | Datas Úteis`
- **Subtítulo:** `Sudoku, caça-palavras e palavras cruzadas dentro do mesmo layout do Datas Úteis, com boa leitura no celular, navegação clara e páginas indexáveis.`
- **Card Sudoku - título:** `Sudoku`
- **Card Sudoku - descrição:** `Grade 9x9 com quatro níveis, timer, verificação de progresso e Top 10 salvo neste navegador.`
- **Card Sudoku - badge:** `Ativo`
- **Card Sudoku - CTA:** `Abrir Sudoku`
- **Card Caça-Palavras - título:** `Caça-Palavras`
- **Card Caça-Palavras - descrição:** `Categorias temáticas, quatro dificuldades, dicas, streak, pontuação e ranking local por dificuldade.`
- **Card Caça-Palavras - badge:** `Ativo`
- **Card Caça-Palavras - CTA:** `Abrir Caça-Palavras`
- **Card Palavras Cruzadas - título:** `Palavras Cruzadas`
- **Card Palavras Cruzadas - descrição:** `Grade compacta com dicas, teclado virtual, verificação, revelação de letras e ranking local.`
- **Card Palavras Cruzadas - badge:** `Ativo`
- **Card Palavras Cruzadas - CTA:** `Abrir Palavras Cruzadas`
- **Seção futura - título:** `Área pronta para crescer`
- **Seção futura - texto:** `A seção Jogos foi organizada como parte nativa do produto, usando o mesmo header, footer, tema e estrutura do restante do Datas Úteis. Isso ajuda a manter navegação interna forte, boa experiência em mobile e páginas úteis para SEO.`
- **Card futuro 1 - título:** `Desafio diário`
- **Card futuro 1 - descrição:** `Espaço reservado para uma rodada curta com retorno frequente e boa leitura em mobile.`
- **Card futuro 2 - título:** `Lógica relâmpago`
- **Card futuro 2 - descrição:** `Área preparada para novos jogos rápidos sem criar páginas soltas fora do layout do site.`
- **Badge futuros:** `Em breve`
- **Sidebar - título:** `Continue navegando`
- **Sidebar - links:** Sudoku / Caça-Palavras / Palavras Cruzadas / Conteúdos do blog

#### Problemas Encontrados

1. **CRÍTICO — H1 com pipe como separador:** `"Jogos Online Grátis | Datas Úteis"` — O pipe (`|`) é convenção de títulos de janela/SEO title, não de H1 editorial. Um H1 com pipe ficou colado do template SEO para o conteúdo da página, gerando texto que parece um título de aba de browser. O correto seria algo como `"Jogos Online Grátis no Datas Úteis"` ou simplesmente `"Jogos Online Grátis"`.

2. **Subtítulo menciona "páginas indexáveis":** `"...navegação clara e páginas indexáveis."` — "indexáveis" é vocabulário de SEO técnico, não de produto para usuário. O usuário não pensa em "páginas indexáveis" ao escolher jogar.

3. **Seção "Área pronta para crescer" explica arquitetura técnica:** `"A seção Jogos foi organizada como parte nativa do produto, usando o mesmo header, footer, tema e estrutura do restante do Datas Úteis. Isso ajuda a manter navegação interna forte, boa experiência em mobile e páginas úteis para SEO."` — Este texto é justificativa de arquitetura para desenvolvedor/stakeholder, não copy para usuário final. O usuário não se importa com o design system compartilhado.

4. **Descrições de jogos são specs técnicas, não benefícios:** `"Grade 9x9 com quatro níveis, timer, verificação de progresso e Top 10 salvo neste navegador."` — Esta é uma listagem de features técnicas. Copy de produto deve comunicar o benefício ou a experiência, não as especificações.

5. **Cards futuros revelam estado interno:** `"Espaço reservado para uma rodada curta..."` e `"Área preparada para novos jogos rápidos sem criar páginas soltas..."` — O usuário vê que um card existe mas não tem conteúdo, com texto que explica que é um placeholder. Isso prejudica a credibilidade da página.

6. **Badge "Ativo" é redundante:** Os três jogos têm badge `"Ativo"` — mas se todos estão ativos, o badge não diferencia nada. O conceito de badge é destacar exceção, não regra.

7. **Toda a página está hardcoded em PT sem i18n:** A página de Jogos não usa o sistema i18n para nenhum dos textos.

8. **"Conteúdos do blog" na sidebar como link:** O link na sidebar que vai para `/blog/` com o texto `"Conteúdos do blog"` está misturado com links dos jogos sem hierarquia ou separação clara.

#### Observações
- O badge no hero é `"Jogos"` (redundante com o H1 que também começa com "Jogos").
- A inconsistência de capitalização: `"Abrir Sudoku"`, `"Abrir Caça-Palavras"`, `"Abrir Palavras Cruzadas"` — título case nos CTAs mas o restante da página usa só primeira letra maiúscula.

---

### /jogos/sudoku/ (Sudoku)

#### SEO Atual
- **title:** `Sudoku Online Grátis | Fácil, Médio, Difícil e Expert | Datas Úteis`
- **meta description:** `Jogue Sudoku online grátis com níveis de dificuldade, timer, ranking local, validação de progresso e boa experiência no celular e no computador.`
- **H1:** `Sudoku Online Grátis`

#### Textos Principais
*(Fonte: `client/src/pages/Sudoku.tsx` — hardcoded em PT)*

- **Breadcrumb:** `Jogos / Sudoku`
- **H1:** `Sudoku Online Grátis`
- **Subtítulo:** `Jogue Sudoku com quatro níveis de dificuldade, timer, verificação de progresso e Top 10 salvo neste navegador.`
- **Eyebrow do tabuleiro:** `Tabuleiro atual`
- **Níveis:** `Fácil` / `Médio` / `Difícil` / `Expert`
- **Teasers:** `Mais pistas iniciais e leitura mais aberta da grade.` / `Equilíbrio entre velocidade, atenção e dedução.` / `Menos pistas e mais dependência de cruzamentos.` / `Poucas pistas iniciais e leitura mais analítica.`
- **Métricas:** `Tempo` / `Progresso` / `Preenchidas` / `Conflitos`
- **Teclado:** `Teclado numérico` / `Toque nos números ou digite de 1 a 9`
- **Botão limpar célula:** `Limpar`
- **Ações:** `Novo jogo` / `Reiniciar jogo` / `Limpar erros editáveis` / `Verificar progresso`
- **Ranking:** `Top 10 neste navegador`
- **Registrar:** `Registrar pontuação` / `Nome ou apelido` (placeholder: `Ex.: Felipe`)
- **Conclusão:** `Tabuleiro concluído em {tempo}.`
- **Sem ranking:** `Ainda não há partidas registradas nesta dificuldade.`
- **Conclusão sidebar:** `Sua partida entrou em {N}º lugar nesta dificuldade.`
- **Não entrou Top 10:** `Termine a partida para tentar entrar no Top 10 desta dificuldade.`
- **Seção informativa - H2:** `O que é Sudoku` / `Como funciona o Sudoku` / `Níveis de dificuldade` / `Benefícios do Sudoku` / `Como jogar`
- **Aria-label grade:** `Grade de Sudoku`
- **Aria-label célula:** `Linha {N}, coluna {N}`
- **Aria-label botão número:** `Inserir número {N}`
- **Aria-label limpar célula:** `Limpar célula selecionada`
- **FAQ:** `Perguntas frequentes`
- **Links:** `Todos os jogos` / `Caça-Palavras` / `Palavras Cruzadas` / `Ir para o blog`

**Mensagens de toast:**
- `Sudoku concluído em {tempo}.`
- `Novo tabuleiro {dificuldade} pronto.`
- `O tabuleiro foi reiniciado.`
- `Selecione uma célula editável para continuar.`
- `Essa célula faz parte das pistas iniciais.`
- `Não há erros editáveis para limpar agora.`
- `{N} célula(s) com conflito foram limpas.`
- `Ainda existem {N} conflito(s) editáveis na grade.`
- `Progresso atual: {N} célula(s) preenchidas e {N} restantes.`
- `Pontuação registrada em {N}º lugar.`
- `Este tempo não entrou no Top 10 desta dificuldade.`

**Mensagens de validação de nickname:**
- `Informe um nome para registrar a partida.`
- `Use pelo menos 3 caracteres.`
- `Use no máximo 12 caracteres.`
- `Use apenas letras, números e espaços.`
- `Esse nome não pode ser usado no ranking.`
- `Escolha um nome mais apropriado para o ranking.`
- `Escolha um nome menos repetitivo.`

#### Problemas Encontrados

1. **Toda a página hardcoded em PT:** O Sudoku não usa o sistema i18n. Com suporte a 3 idiomas no site, esta página apresenta todo o conteúdo somente em português independentemente da língua do usuário.

2. **Subtítulo é listagem de features:** `"Jogue Sudoku com quatro níveis de dificuldade, timer, verificação de progresso e Top 10 salvo neste navegador."` — enumeração técnica, não benefício ou experiência.

3. **"Top 10 neste navegador" é informação técnica de armazenamento:** O usuário quer saber que tem um ranking, não onde ele é armazenado. O correto seria `"Ranking de melhores tempos"` ou `"Top 10 da sua sessão"`.

4. **Placeholder `"Ex.: Felipe"` usa nome próprio específico:** O exemplo de nome no campo de ranking usa `"Felipe"` como exemplo — que é claramente o nome do desenvolvedor/proprietário do site. Isso não é necessariamente um problema, mas pode parecer pessoal demais.

5. **"Limpar erros editáveis" é jargão técnico do jogo:** O botão `"Limpar erros editáveis"` usa o termo "editáveis" que é um detalhe de implementação (distingue pistas dadas das células preenchidas pelo usuário). Para o usuário, `"Limpar erros"` seria suficiente.

6. **Toast `"O tabuleiro foi reiniciado."` é voz passiva desnecessária:** `"Tabuleiro reiniciado."` ou `"Jogo reiniciado."` seria mais direto.

7. **Inconsistência nas mensagens de toast:** Algumas terminam com ponto final (`"O tabuleiro foi reiniciado."`) e outras não têm padrão uniforme. O toast de conclusão usa formato diferente (`"Sudoku concluído em 12:34."`) dos outros.

8. **H2 dentro do FAQ é `<h2>` mas a seção de perguntas usa `<details>`/`<summary>`:** Não é problema de texto, mas o heading hierárquico pode confundir leitores de tela.

9. **FAQ FAQ de Sudoku duplica FAQ da Home:** As perguntas sobre gratuidade (`"O Sudoku é grátis?"`) e mobile (`"Funciona no celular?"`) repetem o padrão das páginas de jogos. O FAQ específico do Sudoku deveria focar mais nas mecânicas do jogo em si.

10. **`"Verificar progresso"` como nome de botão pode criar expectativas erradas:** O usuário pode esperar que a verificação "resolva" ou valide completamente o puzzle. A mensagem resultante (`"Progresso atual: N célula(s) preenchidas..."`) é mais uma contagem do que uma verificação de correção.

#### Observações
- A seção "Benefícios do Sudoku" é claramente voltada a SEO. Não é problemática, mas é redundante com os dados do FAQ.
- Os aria-labels das células (`"Linha 1, coluna 1"`) são bons para acessibilidade.
- "Expert" em inglês no meio dos outros níveis em português (`Fácil`, `Médio`, `Difícil`, `Expert`) é uma inconsistência de idioma.

---

### /jogos/caca-palavras/ (Caça-Palavras)

#### SEO Atual
- **title:** `Caça-Palavras Online Grátis | Ranking, Dicas e Níveis | Datas Úteis`
- **meta description:** `Jogue caça-palavras online grátis com níveis de dificuldade, dicas, pontuação, ranking e categorias temáticas. Funciona no celular e no computador.`
- **H1:** `Caça-Palavras Online Grátis`

#### Textos Principais
*(Fonte: `client/src/pages/WordSearch.tsx` — hardcoded em PT)*

- **Breadcrumb:** `Jogos / Caça-Palavras`
- **H1:** `Caça-Palavras Online Grátis`
- **Subtítulo:** `Encontre palavras em até 8 direções, use dicas com parcimônia e registre sua melhor pontuação por dificuldade.`
- **Níveis:** `Fácil` / `Médio` / `Difícil` / `Expert`
- **Info de jogo:** `Tema: {categoria}` / `Tempo: {tempo}` / `Pontos: {pontos}` / `Multiplicador: {N}x`
- **Sidebar jogo:** `Palavras da rodada`
- **Streak e palavras:** `Streak atual: {N}` / `Palavras encontradas: {N}/{total}`
- **Ações do jogo:** `Usar dica ({N})` / `Embaralhar letras livres` / `Novo jogo`
- **Toast:** `Palavra encontrada: {palavra}` / `Partida concluída.`
- **Ranking:** `Top 10 por dificuldade`
- **Dificuldade no ranking:** `Dificuldade: Fácil/Médio/Difícil/Expert`
- **Ranking vazio:** `Ainda não há partidas registradas nesta dificuldade.`
- **Registrar:** `Registrar pontuação` / placeholder: `Nome ou apelido`
- **Pontuação registrada:** `Pontuação registrada em {N}º lugar.`
- **Não Top 10:** `Termine uma rodada para tentar entrar no Top 10.`
- **Seções informativas:** `Como funciona o caça-palavras` / `Níveis de dificuldade` / `Recursos do jogo` / `Categorias e banco de palavras` / `Perguntas frequentes`
- **Links:** `Todos os jogos` / `Palavras cruzadas` / `Sudoku`

#### Problemas Encontrados

1. **"use dicas com parcimônia":** A palavra `"parcimônia"` no subtítulo (`"use dicas com parcimônia"`) é formal e incomum no contexto de um jogo casual. A maioria dos usuários de jogos online não usa esse vocabulário. Uma alternativa seria `"use dicas com cuidado"` ou `"use as dicas com moderação"`.

2. **"Embaralhar letras livres":** O botão `"Embaralhar letras livres"` é confuso — o usuário pode não entender o que são "letras livres" em contraposição às letras das palavras. Uma alternativa seria `"Embaralhar o grid"` ou apenas `"Embaralhar"`.

3. **"Streak atual" sem explicação:** O label `"Streak atual"` sem tooltip ou explicação assume que o usuário sabe o que é streak. O termo em inglês não é universal.

4. **"Multiplicador: {N}x" sem contexto:** O multiplicador de pontuação é exibido mas não há explicação do que ele significa ou como aumentá-lo na interface do jogo.

5. **Inconsistência de capitalização em links:** Na seção FAQ, o link aparece como `"Palavras cruzadas"` (minúsculo) enquanto nos cards do hub de jogos aparece como `"Palavras Cruzadas"` (title case).

6. **Toda a página hardcoded em PT:** Mesma situação do Sudoku — sem suporte i18n.

7. **"A pontuação não entrou no Top 10 desta dificuldade."** como mensagem de validação — este erro aparece em código mas o estado correto após salvar seria uma mensagem de sucesso, não de erro. A mensagem de "não entrou no Top 10" serve como feedback de ranking mas não é uma mensagem de erro de formulário.

#### Observações
- O subtítulo é mais informativo que o do Sudoku, comunicando a mecânica (`"até 8 direções"`) e incentivo (`"registre sua melhor pontuação"`).
- A seção informativa é bem estruturada para SEO.

---

### /jogos/palavras-cruzadas/ (Palavras Cruzadas)

#### SEO Atual
- **title:** `Palavras Cruzadas Online Grátis | Com Dicas e Níveis | Datas Úteis`
- **meta description:** `Resolva palavras cruzadas online grátis com dicas, teclado virtual, níveis de dificuldade, pontuação e ranking. Jogue no celular ou computador.`
- **H1:** `Palavras Cruzadas Online Grátis`

#### Textos Principais
*(Fonte: `client/src/pages/Crossword.tsx` — hardcoded em PT)*

- **Breadcrumb:** `Jogos / Palavras Cruzadas`
- **H1:** `Palavras Cruzadas Online Grátis`
- **Subtítulo:** `Resolva uma grade compacta com dicas, teclado virtual, verificação e ranking local por dificuldade.`
- **Info:** `Tempo: {tempo}` / `Progresso: {N}%` / `Pontos: {N}`
- **Seção dicas:** `Dicas horizontais` / `Dicas verticais`
- **Ações:** `Revelar letra` / `Revelar palavra` / `Verificar` / `Novo jogo`
- **Teclado virtual:** `Teclado virtual` / `Apagar`
- **Toast:** `Palavras cruzadas concluídas.` / `{N} letra(s) precisam de revisão.` / `Nenhum erro encontrado.`
- **Modal de vitória:** `Grade concluída`
- **Modal texto:** `Você terminou a rodada em {tempo} com {N} pontos.`
- **Modal CTA:** `Ver ranking` / `Novo jogo`
- **Ranking:** `Top 10 por dificuldade` / `Ainda não há partidas registradas nesta dificuldade.`
- **Registrar:** `Registrar pontuação` / placeholder: `Nome ou apelido`
- **Sem jogo concluído:** `Termine a grade para tentar entrar no Top 10.`
- **Seções informativas:** `Como as palavras cruzadas são geradas` / `Recursos do jogo` / `Banco de palavras com dicas` / `Níveis de dificuldade` / `Perguntas frequentes`

**Validações:**
- `Informe um nome para registrar a partida.`
- `Use pelo menos 3 caracteres.`
- `Use no máximo 12 caracteres.`
- `Use apenas letras, números e espaço.` *(sem "s" no final, diferente das outras páginas)*
- `Esse nome não pode ser usado no ranking.`
- `Escolha um nome mais apropriado para o ranking.`
- `Escolha um nome menos repetitivo.`
- `A partida não entrou no Top 10 desta dificuldade.`

#### Problemas Encontrados

1. **Inconsistência de validação com Caça-Palavras:** Na Palavras Cruzadas a mensagem é `"Use apenas letras, números e espaço."` (singular), enquanto no Caça-Palavras é `"Use apenas letras, números e espaços."` (plural). São a mesma regra com textos levemente diferentes.

2. **Inconsistência de mensagem de ranking não qualificado:** No Caça-Palavras: `"A pontuação não entrou no Top 10..."`. Nas Palavras Cruzadas: `"A partida não entrou no Top 10..."`. São contextos idênticos com textos diferentes.

3. **"Termine a grade" vs "Termine uma rodada":** O Caça-Palavras diz `"Termine uma rodada para tentar entrar no Top 10."` enquanto a Palavras Cruzadas diz `"Termine a grade para tentar entrar no Top 10."` — o mesmo call-to-action usa vocabulários diferentes.

4. **Seção "Como as palavras cruzadas são geradas" é técnica demais:** `"O sistema coloca palavras maiores primeiro, inicia a grade pelo centro e tenta encaixar as próximas por interseções de letras em posições perpendiculares."` — o usuário não precisa saber do algoritmo de geração. É copy de bastidor.

5. **Toast `"Nenhum erro encontrado."` é impreciso:** A verificação pode retornar "nenhum erro" mas a grade estar incompleta. A mensagem deveria ser `"Nenhum erro nas letras preenchidas."` ou similar para clareza.

6. **Toda a página hardcoded em PT:** Mesma situação dos outros jogos.

#### Observações
- O modal de vitória (`"Grade concluída"`) é um texto claro e direto.
- A seção FAQ tem boas perguntas orientadas ao uso (`"Dá para jogar no celular?"`, `"O jogo tem dicas?"`, `"Posso usar teclado?"`).
- `"Expert"` segue aparecendo em inglês no seletor de dificuldade.

---

### /sobre/ (Sobre o Datas Úteis)

#### SEO Atual
- **title:** `Sobre o Datas Úteis | Ferramentas úteis para o dia a dia` *(hardcoded em `usePageSeo`, não via i18n)*
- **meta description:** `Conheça a história do Datas Úteis, um site criado para reunir ferramentas úteis como cálculo de dias úteis, calendário, escalas, jogos e outras utilidades do cotidiano.`
- **H1:** `Sobre o Datas Úteis`

#### Textos Principais
*(Fonte: `client/src/pages/About.tsx` — objeto `ABOUT_COPY.pt`)*

- **Breadcrumb:** `Datas Úteis / Sobre`
- **H1:** `Sobre o Datas Úteis`
- **Subtítulo:** `Conheça a origem do projeto, o propósito do site e a ideia de reunir ferramentas realmente úteis para rotina pessoal e profissional.`
- **Origem - título:** `Origem`
- **Origem - texto:** `O Datas Úteis nasceu de uma necessidade real: calcular o prazo de entrega de uma encomenda. A partir disso, ficou claro que o problema não era apenas um cálculo pontual, e sim a falta de um lugar simples para reunir ferramentas úteis do cotidiano.`
- **Propósito - título:** `Propósito`
- **Propósito - texto:** `O site foi criado para oferecer utilidades práticas para dias úteis, prazos, cálculos, escalas, calendário, jogos leves e outras tarefas que fazem parte da rotina de trabalho e da vida pessoal.`
- **Evolução - título:** `Evolução`
- **Evolução - texto:** `O projeto segue em evolução contínua. Novas ferramentas podem entrar conforme a utilidade real para o usuário, sempre com foco em clareza, performance e boa experiência em desktop e mobile.`
- **Contato - título:** `Contato`
- **Contato - texto:** `Tem uma ideia de ferramenta útil? Envie sua sugestão por e-mail. O canal de contato do projeto é contato@datasuteis.com.br.`
- **CTA contato:** `Enviar sugestão por e-mail`
- **Botões:** `Início` / `Jogos`

#### Problemas Encontrados

1. **SEO title hardcoded e fora do i18n:** O `usePageSeo` da página Sobre recebe o título como string literal (`"Sobre o Datas Úteis | Ferramentas úteis para o dia a dia"`) em vez de usar chave do i18n. Isso significa que, em inglês ou espanhol, o title ainda ficará em português.

2. **H1 com "Sobre o" é fraco editorialmente:** `"Sobre o Datas Úteis"` é o tipo de H1 que não diz nada sobre o que o usuário vai encontrar. Poderia ser `"A história do Datas Úteis"` ou `"Como o Datas Úteis nasceu"`.

3. **Botões de CTA desconexos:** Na seção de Contato, além do botão principal `"Enviar sugestão por e-mail"`, há dois botões secundários: `"Início"` e `"Jogos"`. A presença de `"Jogos"` como destaque nesta seção de contato é aleatória — por que jogos e não "Calcular Dias Úteis"?

4. **Texto de contato redundante:** `"Tem uma ideia de ferramenta útil? Envie sua sugestão por e-mail. O canal de contato do projeto é contato@datasuteis.com.br."` — o e-mail aparece no texto E o botão `"Enviar sugestão por e-mail"` também vai para `mailto:contato@datasuteis.com.br`. O e-mail no texto é redundante com o botão.

5. **Breadcrumb usa "Datas Úteis" como link para home:** `Datas Úteis / Sobre` — o primeiro item do breadcrumb hardcoded como `"Datas Úteis"` (string literal), não usando chave do i18n.

#### Observações
- O texto de Origem é bem escrito e humaniza o projeto de forma autêntica.
- A estrutura de 3 cards (Origem, Propósito, Evolução) é clara e tem bom equilíbrio.

---

### /blog/ (Blog)

#### SEO Atual
- **title:** `Blog Datas Úteis | Escalas, Dias Úteis e Rotinas de Trabalho`
- **meta description:** `Artigos sobre escalas de trabalho, dias úteis, adicional noturno e rotinas CLT. Conteúdo prático para trabalhadores, empresas e profissionais de RH.`
- **H1:** `Blog Datas Úteis`

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chaves `pages.blog.*`)*

- **H1:** `Blog Datas Úteis`
- **Subtítulo:** `Conteúdo direto sobre dias úteis, escalas de trabalho, adicional noturno e decisões operacionais que impactam RH, folha e cobertura.`
- **CTA artigo:** `Ler artigo`
- **Ferramentas relacionadas - título:** `Ferramentas relacionadas`
- **Links ferramentas:** `Dias úteis entre datas` / `Calendário com feriados` / `Simulador de escalas`

#### Artigos disponíveis (PT):
1. `Escalas de Trabalho na CLT: Guia Completo` — categoria: Escalas
2. `Escala 12x36: Como Funciona na Prática` — categoria: Escalas
3. `Escala 6x1: Como Funciona no Dia a Dia` — categoria: Escalas
4. `Dias Úteis: O Que São e Como Contar` — categoria: Dias Úteis
5. `Quinto Dia Útil: O Que É e Por Que Importa` — categoria: Dias Úteis
6. `Adicional Noturno: O Que É e Como Funciona` — categoria: Legislação

#### Problemas Encontrados

1. **H1 é nome do blog, não descrição de conteúdo:** `"Blog Datas Úteis"` diz onde o usuário está, não o que vai encontrar. Para SEO e UX, um H1 como `"Artigos sobre Dias Úteis, Escalas e CLT"` seria mais efetivo.

2. **Subtítulo usa "folha" sem contexto:** `"...que impactam RH, folha e cobertura."` — a palavra `"folha"` sem complemento (folha de pagamento) pode ser ambígua para leitores menos familiarizados com jargão de RH.

3. **CTA `"Ler artigo"` é genérico:** O mesmo CTA `"Ler artigo"` aparece em todos os posts. Sem variação de copy ou personalização, o CTA não cria distinção entre artigos.

4. **Todos os artigos têm data idêntica de publicação:** `"2026-03-06"` para todos os 6 artigos — isso pode indicar que foram publicados em lote e não há variedade temporal.

#### Observações
- Os títulos dos artigos são bem descritivos e alinhados com busca orgânica.
- O tempo de leitura (`"6 min"`, `"5 min"`, `"4 min"`) é exibido corretamente.

---

### /blog/{slug}/ (Artigos do Blog)

#### SEO Atual (exemplo: escalas-de-trabalho-clt)
- **title:** `Escalas de Trabalho na CLT: Guia Completo | Datas Úteis`
- **meta description:** `Conheça os principais tipos de escala de trabalho previstos na CLT: 5x2, 6x1, 12x36 e 24x48. Entenda como funcionam e como escolher a escala adequada.`
- **H1:** Título do artigo (dinâmico via `post.title`)

#### Textos Principais
*(Fonte: `client/src/pages/BlogPost.tsx` + dados de `client/src/lib/blog.ts`)*

- **Breadcrumb:** `Início / Blog / {título do artigo}`
- **Ferramentas relacionadas:** `Dias úteis` / `Calendário` / `Escala`
- **Leia também:** `Leia também`
- **Breadcrumb aria-label:** `Breadcrumb` *(literal, em inglês no i18n)*

#### Problemas Encontrados

1. **`breadcrumb` como aria-label em inglês:** A chave i18n `pages.blogPost.breadcrumb` tem o valor `"Breadcrumb"` — uma palavra em inglês usada como aria-label de navegação. Este texto não deve aparecer para usuários, mas é exposto para leitores de tela e ferramentas de acessibilidade. Deveria ser `"Navegação de localização"` ou `"Trilha de navegação"`.

2. **Ferramentas relacionadas com labels muito curtos:** `"Dias úteis"`, `"Calendário"` e `"Escala"` como links são genéricos. No contexto de um artigo sobre, por exemplo, escala 12x36, um link chamado `"Dias úteis"` não comunica relevância.

#### Observações
- O sistema de blog é bem estruturado, com FAQs extraídas do HTML do artigo para schema FAQ.
- Os artigos usam conteúdo carregado de arquivos JSON (`legacy/pt.json`), cujo conteúdo não foi auditado nesta análise por ser HTML puro.

---

### /privacidade/ (Política de Privacidade)

#### SEO Atual
- **title:** `Política de Privacidade | Datas Úteis`
- **meta description:** `Saiba como o Datas Úteis utiliza cookies técnicos, armazenamento local e integrações de terceiros para funcionamento, preferências e monetização.`
- **H1:** `Política de Privacidade`

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chave `pages.privacy.*`)*

- **H1 (via `t('components.footer.privacy')`):** `Política de Privacidade`
- **Subtítulo:** `Entenda como coletamos, usamos e protegemos seus dados.`
- **Última atualização:** `Última atualização: 11 de março de 2026`
- **Seção 1:** `1. Informações que Coletamos`
- **Seção 2:** `2. Como Usamos Seus Dados`
- **Seção 3:** `3. Cookies e Rastreamento`
- **Seção 4:** `4. Segurança de Dados`
- **Seção 5:** `5. Terceiros`
- **Seção 6:** `6. Seus Direitos`
- **Seção 7:** `7. Alterações na Política`
- **Seção 8:** `8. Contato`
- **E-mail contato:** `privacidade@datasuteis.com.br`

#### Problemas Encontrados

1. **H1 vem de chave de footer:** A página de Privacidade usa `t('components.footer.privacy')` para renderizar o H1 (`"Política de Privacidade"`). Isso significa que o H1 está semanticamente vinculado à chave de link do footer, não a uma chave dedicada da página. Se o texto do link no footer mudar, o H1 muda junto.

2. **Seção 6 "Seus Direitos" inclui direito de "Optar por não receber comunicações":** O site não tem nenhum canal de comunicação (newsletter, e-mail marketing), então o direito de "Optar por não receber comunicações" é incoerente com o produto real.

3. **Seção 3 "Cookies" tem dois parágrafos desconectados:** O segundo parágrafo da seção 3 (`"Você pode desabilitar cookies em seu navegador, mas isso pode afetar a funcionalidade do site."`) aparece solto no texto — a estrutura sugere que ele deveria vir depois dos bullets, mas está misturado.

4. **"Dados de navegação através do Google Analytics":** A frase `"através do Google Analytics"` no primeiro bullet é vaga. O usuário não sabe o que "dados de navegação" inclui especificamente.

5. **Meta description menciona "monetização":** `"...para funcionamento, preferências e monetização."` — a palavra "monetização" na meta description é direta mas pode gerar resistência. É transparente, mas o contexto da descrição pode ser mais amigável.

#### Observações
- A página é bem organizada e a linguagem é acessível para o nível de complexidade do conteúdo.
- O e-mail `privacidade@datasuteis.com.br` é diferente do e-mail de contato geral (`contato@datasuteis.com.br`).

---

### 404 (Página Não Encontrada)

#### SEO Atual
- **title:** `Página não encontrada | Datas Úteis`
- **meta description:** `A página solicitada não foi encontrada.`
- **H1:** `404` (número, não texto)
- **H2:** `Página não encontrada`

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chave `pages.notFound.*`)*

- **H1 visual:** `404` *(número em fonte grande — não é H1 de texto, é decorativo)*
- **H2:** `Página não encontrada`
- **Descrição:** `Desculpe, a página que você está procurando não existe ou foi movida.`
- **CTA:** `Voltar para Início`

#### Problemas Encontrados

1. **Meta description minimalista:** `"A página solicitada não foi encontrada."` é a descrição mais curta e genérica do site. Para uma página 404, não há muito a dizer, mas poderia incluir o nome do site: `"Esta página não existe no Datas Úteis. Acesse a página inicial para continuar navegando."`

2. **"Desculpe" como abertura é padrão mas passível de melhoria:** A frase `"Desculpe, a página que você está procurando não existe ou foi movida."` é correta e convencional, mas não oferece nenhuma orientação de próximo passo além do botão.

3. **CTA único:** Há apenas um CTA (`"Voltar para Início"`). Uma 404 poderia oferecer CTAs para as principais ferramentas ou para o blog.

#### Observações
- A página tem noindex/nofollow configurado corretamente.
- O número `404` como H1 visual funciona bem como convenção de design.

---

### Header / Navegação

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chaves de nav + `client/src/components/Header.tsx`)*

- **Nav items:** `Início` / `Dias Úteis` / `Calculadora` / `Calendário` / `Escala` / `Jogos` / `Blog`
- **Aria-label nav principal:** `Navegação principal`
- **Aria-label menu mobile:** `Menu mobile`
- **Aria-label botão menu:** `Abrir menu`
- **Aria-label tema:** `Alternar tema`
- **Aria-label idioma:** `Selecionar idioma`

#### Problemas Encontrados

1. **"Dias Úteis" como item de nav leva para a calculadora de dias úteis:** O item de navegação `"Dias Úteis"` (`/calcular/`) usa o mesmo nome da marca do site ("Datas Úteis"), criando confusão. O usuário pode pensar que "Dias Úteis" é o link para a home. Um nome mais descritivo seria `"Calcular"` ou `"Contador"`.

2. **"Escala" como único item de nav sem contexto:** O item `"Escala"` é ambíguo sem o contexto de "escala de trabalho". Para quem não conhece o site, "Escala" pode significar várias coisas.

3. **"Menu mobile" como aria-label:** `"Menu mobile"` usa a palavra inglesa "mobile" em um label que deveria ser em português. Seria `"Menu para celular"` ou `"Menu de navegação"`.

---

### Footer

#### Textos Principais
*(Fonte: `client/src/lib/i18n.ts` — chaves `components.footer.*` + `client/src/components/Footer.tsx`)*

- **Descrição:** `O Datas Úteis é uma ferramenta gratuita para calcular dias úteis, consultar feriados nacionais e simular escalas de trabalho com leitura operacional mais objetiva.`
- **Coluna Ferramentas:** `Ferramentas` → Dias Úteis / Calculadora / Calendário / Simulador de Escalas / Jogos
- **Coluna Conteúdo:** `Conteúdo` → Blog / O que são dias úteis / Escalas na CLT / Política de Privacidade / Sobre
- **Coluna Contato:** `Contato` → contato@datasuteis.com.br / **Início** / **Jogos**
- **Copyright:** `© 2026 Datas Úteis. Todos os direitos reservados.`

#### Problemas Encontrados

1. **CRÍTICO — Coluna "Contato" contém links de navegação não relacionados a contato:** A coluna `"Contato"` no footer contém: `contato@datasuteis.com.br`, `Início` e `Jogos`. Links para a Home e para Jogos dentro de uma coluna intitulada "Contato" é semanticamente incorreto. Essas são páginas de navegação, não formas de contato.

2. **"leitura operacional mais objetiva" na descrição é jargão:** `"...com leitura operacional mais objetiva."` — a expressão é empresarial/técnica e não comunica claramente um benefício ao usuário comum.

3. **Coluna "Conteúdo" mistura artigos do blog com Política de Privacidade e Sobre:** A coluna `"Conteúdo"` contém: Blog, artigos específicos do blog (O que são dias úteis, Escalas na CLT), Política de Privacidade e Sobre. Política de Privacidade e Sobre não são "conteúdo" — são páginas institucionais.

4. **Heading `<h2>` para títulos de coluna do footer:** Os títulos das colunas do footer (`Ferramentas`, `Conteúdo`, `Contato`) usam `<h2>`, o que quebra a hierarquia semântica quando as páginas já têm um H1 ou quando o footer aparece depois de H2 no corpo da página.

---

## 3. Lista dos Principais Textos Incoerentes

| Rota | Texto Exato | Motivo do Problema | Severidade |
|------|-------------|-------------------|------------|
| `/jogos/` | `"Jogos Online Grátis \| Datas Úteis"` (H1) | Pipe `\|` é convenção de title tag, não de H1 editorial | Alta |
| `/jogos/` | `"páginas indexáveis"` (subtítulo) | Jargão de SEO para usuário final | Alta |
| `/jogos/` | `"A seção Jogos foi organizada como parte nativa do produto, usando o mesmo header, footer, tema e estrutura do restante do Datas Úteis."` | Justificativa de arquitetura técnica exposta ao usuário | Alta |
| `/jogos/` | `"Área pronta para crescer"` / `"Espaço reservado para..."` / `"Área preparada para..."` | Textos de placeholder visíveis ao usuário final | Alta |
| `/` (UtilityWidgets) | `"Dados leves carregados de forma assíncrona para apoiar decisões do dia a dia sem poluir a página."` | Exposição de detalhe de implementação ao usuário | Média |
| `/` (UtilityWidgets) | `"Sem geolocalização disponível, exibimos um fallback leve para São Paulo."` | "fallback" é jargão técnico | Média |
| `/calculadora/` | `"Gorjeta 15%"` / `"Gorjeta 20%"` | Gorjeta com percentual fixo não é convenção brasileira | Média |
| `/calculadora/` | `"operações bitwise para leitura técnica"` | "bitwise" em inglês dentro de texto em português | Média |
| `/jogos/sudoku/` | `"Top 10 neste navegador"` | Informa detalhe de armazenamento técnico ao usuário | Baixa |
| `/` (FAQ) | `"Os widgets da Home criam páginas novas?"` | Vocabulário de desenvolvedor em FAQ de usuário | Média |
| `/privacidade/` | `"Optar por não receber comunicações"` (Seção Seus Direitos) | O site não tem canal de comunicações/newsletter | Média |
| `/blog/` | `"...impactam RH, folha e cobertura."` | `"folha"` sem complemento é ambíguo | Baixa |
| `/escala/` | `"Resultado executivo"` (eyebrow) | "Executivo" no contexto de eyebrow pode ser mal interpretado | Baixa |
| Footer | `"Início"` e `"Jogos"` na coluna `"Contato"` | Links de navegação dentro de seção de contato | Alta |
| `/sobre/` | `"Jogos"` como botão na seção Contato | Destino aleatório sem relação com o contexto de contato | Baixa |

---

## 4. Lista de Redundâncias

| Rota | Bloco Redundante | Motivo |
|------|-----------------|--------|
| `/calcular/` | Guia item 3 (`"Somente feriados nacionais oficiais são abatidos do resultado."`) + subtítulo (`"considerando apenas feriados nacionais oficiais"`) | A mesma informação aparece no subtítulo e no guia |
| `/calcular/` | SEO title repete na description | Title: `"Calcular Dias Úteis Entre Datas 2026"` / Description começa com `"Calcule dias úteis entre datas"` |
| `/` (Home) | SEO title e description têm mesma listagem de ferramentas | Title: `"Calcular Dias Úteis, Calendário, Escala e Calculadora"` / Desc: `"Calcule dias úteis, consulte calendário, simule escala de trabalho, use calculadora"` |
| `/calendario/` | Subtítulo e título da lista de feriados | Ambos mencionam feriados nacionais e pontos facultativos de 2026 |
| `/escala/` | `"Resultado executivo"` (eyebrow) + `"Resultado da simulação"` (H2) | Dois títulos para a mesma seção expressando ideias similares |
| `/jogos/` | Badge `"Jogos"` + H1 começa com `"Jogos Online Grátis"` | Badge repete o início do H1 |
| `/jogos/sudoku/` | Seções `"Benefícios do Sudoku"` + FAQ | Sobreposição de conteúdo informativo para SEO já coberto pelo FAQ |
| `/sobre/` | E-mail no texto + botão de e-mail | `"O canal de contato do projeto é contato@datasuteis.com.br."` + botão `"Enviar sugestão por e-mail"` que vai para o mesmo endereço |
| `/privacidade/` | H1 usa chave do footer (`components.footer.privacy`) | O H1 da página e o link do footer compartilham a mesma chave de i18n, criando acoplamento semântico |
| i18n vs Home.tsx | Duas fontes de cópia paralelas para a Home | O i18n tem `hero_title`, `hero_subtitle`, `hero_cta_*`, `faq_*` mas `Home.tsx` usa `HOME_COPY` com textos diferentes |

---

## 5. Problemas de UX Copy

| Rota | Elemento | Problema |
|------|----------|----------|
| `/calcular/` | Validações via `alert()` | Uso de modal nativo do browser para mensagens de validação — experiência de UX datada |
| `/calcular/` | CTA `"Entender o quinto dia útil"` | Único CTA em infinitivo; os outros dois usam imperativo (`"Ver"`, `"Simular"`) |
| `/` (Home) | CTA `"Abrir"` nos cards | CTA genérico sem benefício ou ação específica |
| `/escala/` | Label `"Encontro de turnos"` | Checkbox sem tooltip ou explicação; jargão operacional opaco |
| `/escala/` | Label `"Postos simultâneos"` | "Posto" no sentido de posto de trabalho não é autoexplicativo |
| `/escala/` | `"Referência sugerida: {value}"` | Não explica o que é a referência ou por que difere do valor configurado |
| `/jogos/caca-palavras/` | `"use dicas com parcimônia"` | "parcimônia" é vocabulário formal/incomum em contexto de jogo casual |
| `/jogos/caca-palavras/` | `"Embaralhar letras livres"` | "letras livres" é jargão interno; usuário não sabe o que são "letras livres" |
| `/jogos/caca-palavras/` | `"Streak atual"` sem explicação | Termo em inglês sem contexto, assume conhecimento prévio |
| `/jogos/sudoku/` | `"Limpar erros editáveis"` | "editáveis" é detalhe técnico de implementação, não copy de produto |
| `/jogos/sudoku/` | `"Verificar progresso"` | Pode criar expectativa de resolução automática do puzzle |
| `/jogos/sudoku/` | Placeholder `"Ex.: Felipe"` | Nome próprio do proprietário como exemplo no campo de ranking |
| `/404/` | Único CTA: `"Voltar para Início"` | Não oferece alternativas para o usuário explorar o site |
| Header | `"Dias Úteis"` como item de nav | Mesmo nome da marca, confunde com link para home |
| Header | `"Menu mobile"` (aria-label) | "mobile" em inglês em aria-label português |
| Footer | `"leitura operacional mais objetiva"` | Jargão B2B na descrição do site no footer |

---

## 6. Problemas de SEO Editorial

| Rota | Problema | Impacto |
|------|----------|---------|
| `/` (Home) | H1 (`"Dias úteis, calendário, calculadora e utilidades rápidas em um só lugar"`) não prioriza o termo principal: "calcular dias úteis" | Baixo — o H1 é descritivo mas dispersa a intenção |
| `/calcular/` | H1 `"Calcular Dias Úteis"` é imperativo, não editorial; falta contexto do benefício ou do resultado | Médio |
| `/calculadora/` | H1 `"Calculadora Avançada"` vs. SEO title que menciona `"Calculadora Simples Responsiva"` — contradição direta | Alto |
| `/calendario/` | H1 `"Calendário 2026"` muito curto; SEO title `"Calendário de Feriados 2026"` é mais descritivo que o H1 | Médio |
| `/jogos/` | H1 com pipe (`\|`) — não é formato válido de H1 editorial | Alto |
| `/blog/` | H1 `"Blog Datas Úteis"` é identidade de marca, não intenção de busca; usuário busca por temas, não pelo nome do blog | Médio |
| `/sobre/` | SEO title hardcoded em PT fora do i18n — em outros idiomas, o title permanecerá em português | Alto (multilíngue) |
| `/jogos/sudoku/` | Seção `"Benefícios do Sudoku"` e FAQ duplicam conteúdo sem diferenciação | Baixo — conteúdo duplicado interno |
| `/privacidade/` | H1 herda a chave de texto do link do footer (`components.footer.privacy`) — acoplamento semântico frágil | Médio (manutenção) |
| `/blog/` | Todos os 6 artigos têm a mesma data de publicação (`2026-03-06`) | Baixo — pode indicar conteúdo em lote para rastreadores |
| Blog post | `breadcrumb` como aria-label em inglês | Baixo (acessibilidade) |
| Geral | i18n tem `hero_title` e `hero_subtitle` com copy diferente do usado na Home real — copy morto no sistema | Baixo (manutenção/confusão) |

---

## 7. Prioridade de Revisão

### Alta Prioridade

1. **Footer — Coluna "Contato" com links de navegação (`Início`, `Jogos`):** Corrigir a estrutura do footer removendo ou realocando os links de navegação para uma coluna mais adequada.

2. **`/jogos/` — H1 com pipe:** `"Jogos Online Grátis | Datas Úteis"` deve ser reescrito sem o separador de título tag. Sugestão: `"Jogos Online Grátis"` ou `"Jogos Online no Datas Úteis"`.

3. **`/jogos/` — Textos de arquitetura/produto expostos ao usuário:** A seção `"Área pronta para crescer"` e as descrições dos cards futuros (`"Espaço reservado..."`, `"Área preparada..."`) devem ser reescritas como copy de produto orientado ao usuário, ou removidos da visualização pública.

4. **`/calculadora/` — Conflito H1 vs SEO title (Simples vs. Avançada):** Alinhar o H1 com o SEO title para comunicar proposta coerente.

5. **`/sobre/` — SEO title hardcoded fora do i18n:** Mover o title para o i18n para garantir tradução correta nos outros idiomas.

6. **Páginas de jogos sem i18n:** Sudoku, Caça-Palavras, Palavras Cruzadas e Games.tsx estão inteiramente hardcoded em PT, sem suporte ao sistema i18n do site.

7. **`/` (UtilityWidgets) sem i18n:** Todo o componente de utilidades rápidas está hardcoded em PT.

---

### Média Prioridade

8. **Mensagem de fallback de clima com jargão técnico:** `"Sem geolocalização disponível, exibimos um fallback leve para São Paulo."` → reescrever sem "fallback".

9. **Subtítulo widgets:** `"Dados leves carregados de forma assíncrona..."` → reescrever orientado ao benefício, não à implementação.

10. **FAQ da Home com pergunta técnica (`"Os widgets da Home criam páginas novas?"`):** Reescrever ou substituir por pergunta mais natural.

11. **Label `"Encontro de turnos"` na Escala:** Tornar o label mais descritivo ou adicionar tooltip.

12. **`"Gorjeta 15%"` e `"Gorjeta 20%"` na Calculadora Financeira:** Contextualizar para o mercado brasileiro ou renomear para `"Percentual 15%"` / `"Percentual 20%"`.

13. **`"bitwise"` em inglês na descrição do modo Desenvolvedor da Calculadora:** Traduzir para `"bit a bit"` ou `"operações binárias"`.

14. **`breadcrumb` como aria-label em inglês no Blog Post:** Traduzir para `"Trilha de navegação"` ou `"Navegação de localização"`.

15. **Inconsistência de validações entre Caça-Palavras e Palavras Cruzadas:** Padronizar as mensagens de validação de nome do ranking.

16. **`"Streak atual"` sem contexto no Caça-Palavras:** Adicionar explicação ou traduzir para `"Sequência atual"`.

17. **Coluna "Conteúdo" do footer inclui Privacidade e Sobre:** Reorganizar para separar conteúdo editorial de páginas institucionais.

---

### Baixa Prioridade

18. **`"Expert"` em inglês nos seletores de dificuldade dos jogos:** Avaliar tradução para `"Especialista"` ou manter como convenção de jogos.

19. **CTA `"Abrir"` nos cards da Home:** Tornar mais descritivo (ex: `"Acessar"`, `"Ver ferramenta"` ou remover o CTA).

20. **Placeholder `"Ex.: Felipe"` no campo de ranking do Sudoku:** Substituir por exemplo mais neutro.

21. **`"Menu mobile"` como aria-label:** Traduzir para `"Menu de navegação"`.

22. **`"Dias Úteis"` como item de nav ambíguo:** Avaliar renomear para `"Calcular"` ou `"Contador de Dias"`.

23. **H1 `"Sobre o Datas Úteis"` pouco editorial:** Avaliar alternativas mais descritivas.

24. **`"Seção Seus Direitos"` na Privacidade menciona opt-out de comunicações inexistentes:** Remover ou ajustar o bullet `"Optar por não receber comunicações"`.

25. **Badges `"Ativo"` nos três jogos:** Avaliar necessidade — se todos estão ativos, o badge não diferencia.

26. **`"leitura operacional mais objetiva"` no footer:** Simplificar a descrição do site para linguagem mais acessível.

27. **Toasts sem padronização de tom e pontuação:** Revisar todas as mensagens de toast dos jogos para consistência (uso de ponto final, voz ativa/passiva).

---

*Relatório gerado em análise estática do código-fonte em 13 de março de 2026.*
*Arquivos auditados: `client/src/lib/i18n.ts`, `client/src/pages/*.tsx`, `client/src/components/*.tsx`, `client/src/lib/blog.ts`, `client/src/lib/games-nav.ts`.*
*Conteúdo HTML dos artigos do blog (`client/src/lib/i18n/legacy/pt.json`) não foi incluído nesta auditoria.*
