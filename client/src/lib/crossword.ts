export type CrosswordDifficulty = "easy" | "medium" | "hard" | "expert";
export type CrosswordDirection = "across" | "down";
export type CrosswordCluePriority = "required" | "recommended";

export interface CrosswordEntry {
  answer: string;
  label: string;
  clue: string;
  category: string;
}

export interface CrosswordPlacement {
  id: string;
  entry: CrosswordEntry;
  row: number;
  col: number;
  direction: CrosswordDirection;
  number: number;
  cells: number[];
  crossings: number;
  cluePriority: CrosswordCluePriority;
}

export interface CrosswordCell {
  index: number;
  row: number;
  col: number;
  solution: string;
  number?: number;
  acrossId?: string;
  downId?: string;
}

export interface CrosswordPuzzle {
  difficulty: CrosswordDifficulty;
  width: number;
  height: number;
  cells: Array<CrosswordCell | null>;
  across: CrosswordPlacement[];
  down: CrosswordPlacement[];
  totalLetters: number;
  categories: string[];
  theme: string;
  themeId: string;
  signature: string;
}

type CrosswordTheme = {
  id: string;
  label: string;
  entries: CrosswordEntry[];
};

type CrosswordThemeSeed = {
  id: string;
  label: string;
  words: Array<[label: string, clue: string]>;
};

type GridCell = {
  letter: string;
  acrossId?: string;
  downId?: string;
};

const OVERSIZE_GRID = 32;

const CONFIG = {
  easy: { wordCount: 8 },
  medium: { wordCount: 12 },
  hard: { wordCount: 16 },
  expert: { wordCount: 20 },
} as const satisfies Record<CrosswordDifficulty, { wordCount: number }>;

const THEME_SEEDS: CrosswordThemeSeed[] = [
  {
    id: "transporte",
    label: "Transporte",
    words: [
      ["Avião", "Leva passageiros pelo ar."],
      ["Trem", "Anda sobre trilhos."],
      ["Carro", "Veículo comum de quatro rodas."],
      ["Barco", "Transporte usado na água."],
      ["Ônibus", "Leva várias pessoas pela cidade."],
      ["Metrô", "Transporte urbano subterrâneo em muitas capitais."],
      ["Bicicleta", "Veículo movido a pedal."],
      ["Táxi", "Carro de transporte individual pago."],
      ["Navio", "Embarcação grande para viagens ou carga."],
      ["Moto", "Veículo de duas rodas com motor."],
      ["Pista", "Faixa usada por veículos ou aviões."],
      ["Radar", "Equipamento que mede velocidade."],
      ["Garagem", "Lugar de guardar o veículo."],
      ["Pedágio", "Cobrança em algumas rodovias."],
      ["Motor", "Peça que move o veículo."],
      ["Volante", "Usado para dirigir o carro."],
      ["Trilho", "Base por onde corre o trem."],
      ["Asfalto", "Reveste muitas ruas e estradas."],
      ["Estação", "Ponto de embarque e desembarque."],
      ["Viagem", "Deslocamento entre lugares."],
      ["Passagem", "Bilhete para embarcar."],
      ["Terminal", "Ponto de partida ou chegada de linhas."],
      ["Bagagem", "Mala ou mochila levada na viagem."],
      ["Semáforo", "Controla a passagem nas vias."],
      ["Capacete", "Protege a cabeça em moto e bike."],
      ["Combustível", "Alimenta o motor."],
    ],
  },
  {
    id: "estudante",
    label: "Estudante",
    words: [
      ["Livro", "Material de leitura e estudo."],
      ["Lápis", "Usado para escrever e desenhar."],
      ["Prova", "Avaliação feita na escola."],
      ["Classe", "Turma reunida para a aula."],
      ["Caderno", "Guarda anotações das matérias."],
      ["Escola", "Lugar de aprender."],
      ["Professor", "Conduz a aula."],
      ["Aluno", "Pessoa que estuda."],
      ["Mochila", "Leva material escolar."],
      ["Caneta", "Escreve com tinta."],
      ["Borracha", "Apaga o que foi escrito a lápis."],
      ["Estojo", "Guarda lápis, canetas e borracha."],
      ["Quadro", "Fica à frente da sala."],
      ["Merenda", "Lanche servido no intervalo."],
      ["Biblioteca", "Lugar de livros e pesquisa."],
      ["Matéria", "Disciplina ensinada na escola."],
      ["Exercício", "Atividade para praticar o conteúdo."],
      ["Recreio", "Pausa entre as aulas."],
      ["Agenda", "Ajuda a lembrar tarefas e datas."],
      ["Uniforme", "Roupa usada por muitos alunos."],
      ["Pesquisa", "Busca de informações para estudar."],
      ["Leitura", "Ato de ler."],
      ["Cálculo", "Conta de matemática."],
      ["Redação", "Texto escrito pelo aluno."],
      ["Boletim", "Mostra notas e frequência."],
      ["Faculdade", "Etapa de estudo após a escola."],
    ],
  },
  {
    id: "animais",
    label: "Animais",
    words: [
      ["Leão", "Felino conhecido como rei da selva."],
      ["Tigre", "Felino listrado."],
      ["Urso", "Animal grande de pelo espesso."],
      ["Elefante", "Tem tromba e grande porte."],
      ["Cavalo", "Muito usado para montaria."],
      ["Zebra", "Animal de listras pretas e brancas."],
      ["Girafa", "Tem pescoço bem comprido."],
      ["Macaco", "Primate ágil e curioso."],
      ["Coruja", "Ave de hábitos noturnos."],
      ["Raposa", "Animal conhecido pela astúcia."],
      ["Lobo", "Canídeo que vive em alcateia."],
      ["Onça", "Felino forte das matas brasileiras."],
      ["Coelho", "Animal de orelhas longas."],
      ["Cobra", "Réptil sem patas."],
      ["Baleia", "Mamífero gigante do mar."],
      ["Golfinho", "Mamífero marinho muito inteligente."],
      ["Panda", "Urso preto e branco."],
      ["Camelo", "Resiste bem ao deserto."],
      ["Arara", "Ave colorida de bico forte."],
      ["Jacaré", "Réptil de rios e lagoas."],
      ["Tartaruga", "Leva casco nas costas."],
      ["Abelha", "Produz mel."],
      ["Formiga", "Inseto que vive em colônia."],
      ["Pinguim", "Ave que vive no frio."],
      ["Tucano", "Ave de bico grande."],
      ["Galo", "Ave que canta ao amanhecer."],
    ],
  },
  {
    id: "cozinha",
    label: "Cozinha",
    words: [
      ["Arroz", "Grão comum no prato do dia a dia."],
      ["Feijão", "Acompanha o arroz em muitas refeições."],
      ["Panela", "Utensílio usado no fogão."],
      ["Fogão", "Equipamento para cozinhar."],
      ["Forno", "Assa alimentos."],
      ["Prato", "Peça usada para servir comida."],
      ["Receita", "Passo a passo de um preparo."],
      ["Tempero", "Dá sabor à comida."],
      ["Colher", "Talher de sopa e sobremesa."],
      ["Garfo", "Talher com dentes."],
      ["Frigideira", "Panela rasa para fritar."],
      ["Salada", "Mistura fria de folhas ou legumes."],
      ["Sopa", "Prato servido com caldo."],
      ["Massa", "Base de macarrão e outras receitas."],
      ["Café", "Bebida muito comum pela manhã."],
      ["Bolo", "Doce assado servido em fatias."],
      ["Farofa", "Acompanhamento feito com farinha."],
      ["Pimenta", "Ingrediente de sabor ardido."],
      ["Azeite", "Óleo extraído da oliva."],
      ["Geladeira", "Conserva os alimentos frios."],
      ["Xícara", "Recipiente pequeno para bebidas."],
      ["Talher", "Conjunto de utensílios de mesa."],
      ["Toalha", "Pode cobrir a mesa."],
      ["Sobremesa", "Doce servido depois da refeição."],
      ["Molho", "Complemento líquido ou cremoso."],
      ["Lanche", "Refeição rápida."],
    ],
  },
  {
    id: "trabalho",
    label: "Trabalho",
    words: [
      ["Agenda", "Organiza compromissos e reuniões."],
      ["Prazo", "Limite de tempo para concluir algo."],
      ["Reunião", "Encontro para alinhar assuntos."],
      ["Planilha", "Tabela usada para organizar dados."],
      ["Relatório", "Documento que resume informações."],
      ["Pasta", "Guarda arquivos e documentos."],
      ["Arquivo", "Documento salvo no computador."],
      ["Teclado", "Usado para digitar no computador."],
      ["Monitor", "Tela principal da estação de trabalho."],
      ["Contrato", "Formaliza um acordo."],
      ["Projeto", "Conjunto de etapas com objetivo definido."],
      ["Equipe", "Grupo que trabalha junto."],
      ["Cliente", "Recebe o serviço ou produto."],
      ["Meta", "Objetivo a alcançar."],
      ["Turno", "Faixa de horário de trabalho."],
      ["Escala", "Distribui dias e horários da equipe."],
      ["Calculadora", "Ajuda em contas rápidas."],
      ["Calendário", "Mostra dias, meses e datas."],
      ["Email", "Mensagem enviada pela internet."],
      ["Anotação", "Registro curto para lembrar algo."],
      ["Impressora", "Transforma arquivo digital em papel."],
      ["Documento", "Arquivo com informação registrada."],
      ["Revisão", "Conferência final antes de entregar."],
      ["Entrega", "Momento de concluir o combinado."],
      ["Checklist", "Lista usada para conferência."],
      ["Atendimento", "Contato direto com o cliente."],
    ],
  },
  {
    id: "esporte",
    label: "Esporte",
    words: [
      ["Bola", "Objeto usado em vários esportes."],
      ["Time", "Grupo que joga junto."],
      ["Corrida", "Disputa de velocidade ou resistência."],
      ["Atleta", "Pessoa que pratica esporte."],
      ["Treino", "Sessão de prática esportiva."],
      ["Rede", "Fica no vôlei, no tênis e no gol."],
      ["Raquete", "Usada no tênis e no badminton."],
      ["Gol", "Objetivo do futebol."],
      ["Troféu", "Prêmio de campeão."],
      ["Apito", "Usado pelo árbitro."],
      ["Juiz", "Aplica as regras da partida."],
      ["Quadra", "Área de jogos como vôlei e futsal."],
      ["Estádio", "Recebe grandes partidas."],
      ["Natação", "Esporte praticado na piscina."],
      ["Pódio", "Recebe os melhores colocados."],
      ["Ciclista", "Participa de provas de bicicleta."],
      ["Maratona", "Corrida longa."],
      ["Medalha", "Prêmio comum em competições."],
      ["Escudo", "Símbolo de um clube."],
      ["Basquete", "Jogo disputado com cesta."],
      ["Vôlei", "Esporte jogado por cima da rede."],
      ["Remo", "Modalidade praticada com barco estreito."],
      ["Camisa", "Uniforme usado em partidas."],
      ["Torcida", "Público que apoia o time."],
      ["Arena", "Local de eventos esportivos."],
      ["Placar", "Mostra a pontuação da partida."],
    ],
  },
];

const THEMES: CrosswordTheme[] = THEME_SEEDS.map(theme => ({
  id: theme.id,
  label: theme.label,
  entries: theme.words.map(([label, clue]) => createEntry(label, clue, theme.label)),
}));

function createEntry(
  label: string,
  clue: string,
  category: string
): CrosswordEntry {
  return {
    label,
    clue,
    category,
    answer: label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase(),
  };
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

function indexFor(row: number, col: number, width: number) {
  return row * width + col;
}

function createGrid() {
  return Array.from({ length: OVERSIZE_GRID }, () =>
    Array.from({ length: OVERSIZE_GRID }, () => null as GridCell | null)
  );
}

function sampleEntries(entries: CrosswordEntry[], wordCount: number) {
  const sampleSize = Math.min(entries.length, wordCount + 8);
  return shuffle(entries)
    .slice(0, sampleSize)
    .sort((a, b) => b.answer.length - a.answer.length);
}

function canPlaceWord(
  grid: Array<Array<GridCell | null>>,
  answer: string,
  row: number,
  col: number,
  direction: CrosswordDirection
) {
  const rowStep = direction === "down" ? 1 : 0;
  const colStep = direction === "across" ? 1 : 0;
  const endRow = row + rowStep * (answer.length - 1);
  const endCol = col + colStep * (answer.length - 1);

  if (
    row < 0 ||
    col < 0 ||
    endRow >= OVERSIZE_GRID ||
    endCol >= OVERSIZE_GRID
  ) {
    return { valid: false, overlap: 0 };
  }

  const beforeRow = row - rowStep;
  const beforeCol = col - colStep;
  const afterRow = endRow + rowStep;
  const afterCol = endCol + colStep;

  if (
    beforeRow >= 0 &&
    beforeCol >= 0 &&
    beforeRow < OVERSIZE_GRID &&
    beforeCol < OVERSIZE_GRID &&
    grid[beforeRow][beforeCol]
  ) {
    return { valid: false, overlap: 0 };
  }

  if (
    afterRow >= 0 &&
    afterCol >= 0 &&
    afterRow < OVERSIZE_GRID &&
    afterCol < OVERSIZE_GRID &&
    grid[afterRow][afterCol]
  ) {
    return { valid: false, overlap: 0 };
  }

  let overlap = 0;

  for (let offset = 0; offset < answer.length; offset += 1) {
    const currentRow = row + rowStep * offset;
    const currentCol = col + colStep * offset;
    const currentCell = grid[currentRow][currentCol];
    const letter = answer[offset];

    if (currentCell) {
      if (
        currentCell.letter !== letter ||
        (direction === "across" && currentCell.acrossId) ||
        (direction === "down" && currentCell.downId)
      ) {
        return { valid: false, overlap: 0 };
      }
      overlap += 1;
      continue;
    }

    if (direction === "across") {
      if (
        (currentRow > 0 && grid[currentRow - 1][currentCol]) ||
        (currentRow < OVERSIZE_GRID - 1 && grid[currentRow + 1][currentCol])
      ) {
        return { valid: false, overlap: 0 };
      }
    } else if (
      (currentCol > 0 && grid[currentRow][currentCol - 1]) ||
      (currentCol < OVERSIZE_GRID - 1 && grid[currentRow][currentCol + 1])
    ) {
      return { valid: false, overlap: 0 };
    }
  }

  return { valid: overlap > 0, overlap };
}

function placeWord(
  grid: Array<Array<GridCell | null>>,
  entry: CrosswordEntry,
  row: number,
  col: number,
  direction: CrosswordDirection,
  id: string
) {
  const rowStep = direction === "down" ? 1 : 0;
  const colStep = direction === "across" ? 1 : 0;

  for (let offset = 0; offset < entry.answer.length; offset += 1) {
    const currentRow = row + rowStep * offset;
    const currentCol = col + colStep * offset;
    const current = grid[currentRow][currentCol] ?? {
      letter: entry.answer[offset],
    };
    current.letter = entry.answer[offset];
    if (direction === "across") {
      current.acrossId = id;
    } else {
      current.downId = id;
    }
    grid[currentRow][currentCol] = current;
  }
}

function buildPuzzle(
  difficulty: CrosswordDifficulty,
  theme: CrosswordTheme
) {
  const config = CONFIG[difficulty];
  const selected = sampleEntries(theme.entries, config.wordCount);
  if (selected.length < config.wordCount) {
    return null;
  }

  const grid = createGrid();
  const placements: Array<
    Omit<CrosswordPlacement, "number" | "cells" | "crossings" | "cluePriority"> & {
      number?: number;
      cells?: number[];
    }
  > = [];

  const first = selected[0];
  const startRow = Math.floor(OVERSIZE_GRID / 2);
  const startCol = Math.floor((OVERSIZE_GRID - first.answer.length) / 2);
  placeWord(grid, first, startRow, startCol, "across", "word-0");
  placements.push({
    id: "word-0",
    entry: first,
    row: startRow,
    col: startCol,
    direction: "across",
  });

  for (const entry of selected.slice(1)) {
    let best:
      | {
          row: number;
          col: number;
          direction: CrosswordDirection;
          overlap: number;
          compactness: number;
        }
      | null = null;

    for (let row = 0; row < OVERSIZE_GRID; row += 1) {
      for (let col = 0; col < OVERSIZE_GRID; col += 1) {
        const cell = grid[row][col];
        if (!cell) {
          continue;
        }

        for (let letterIndex = 0; letterIndex < entry.answer.length; letterIndex += 1) {
          if (entry.answer[letterIndex] !== cell.letter) {
            continue;
          }

          const acrossRow = row;
          const acrossCol = col - letterIndex;
          const acrossCheck = canPlaceWord(
            grid,
            entry.answer,
            acrossRow,
            acrossCol,
            "across"
          );

          if (acrossCheck.valid) {
            const compactness =
              Math.abs(acrossRow - OVERSIZE_GRID / 2) +
              Math.abs(acrossCol - OVERSIZE_GRID / 2);
            if (
              !best ||
              acrossCheck.overlap > best.overlap ||
              (acrossCheck.overlap === best.overlap &&
                compactness < best.compactness)
            ) {
              best = {
                row: acrossRow,
                col: acrossCol,
                direction: "across",
                overlap: acrossCheck.overlap,
                compactness,
              };
            }
          }

          const downRow = row - letterIndex;
          const downCol = col;
          const downCheck = canPlaceWord(
            grid,
            entry.answer,
            downRow,
            downCol,
            "down"
          );

          if (downCheck.valid) {
            const compactness =
              Math.abs(downRow - OVERSIZE_GRID / 2) +
              Math.abs(downCol - OVERSIZE_GRID / 2);
            if (
              !best ||
              downCheck.overlap > best.overlap ||
              (downCheck.overlap === best.overlap &&
                compactness < best.compactness)
            ) {
              best = {
                row: downRow,
                col: downCol,
                direction: "down",
                overlap: downCheck.overlap,
                compactness,
              };
            }
          }
        }
      }
    }

    if (!best) {
      continue;
    }

    const id = `word-${placements.length}`;
    placeWord(grid, entry, best.row, best.col, best.direction, id);
    placements.push({
      id,
      entry,
      row: best.row,
      col: best.col,
      direction: best.direction,
    });
  }

  if (placements.length < config.wordCount) {
    return null;
  }

  const chosenPlacements = placements.slice(0, config.wordCount);
  const rows = chosenPlacements.flatMap(placement =>
    Array.from({ length: placement.entry.answer.length }, (_, offset) =>
      placement.row + (placement.direction === "down" ? offset : 0)
    )
  );
  const cols = chosenPlacements.flatMap(placement =>
    Array.from({ length: placement.entry.answer.length }, (_, offset) =>
      placement.col + (placement.direction === "across" ? offset : 0)
    )
  );

  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);
  const height = maxRow - minRow + 1;
  const width = maxCol - minCol + 1;

  const cells = Array.from(
    { length: width * height },
    () => null as CrosswordCell | null
  );
  let numbering = 1;
  const numberedPlacements = new Map<string, number>();

  for (let row = minRow; row <= maxRow; row += 1) {
    for (let col = minCol; col <= maxCol; col += 1) {
      const cell = grid[row][col];
      if (!cell) {
        continue;
      }

      const croppedRow = row - minRow;
      const croppedCol = col - minCol;
      const index = indexFor(croppedRow, croppedCol, width);
      const startsAcross =
        !!cell.acrossId && (col === minCol || !grid[row][col - 1]);
      const startsDown =
        !!cell.downId && (row === minRow || !grid[row - 1][col]);
      const number = startsAcross || startsDown ? numbering++ : undefined;
      if (startsAcross && cell.acrossId) {
        numberedPlacements.set(cell.acrossId, number!);
      }
      if (startsDown && cell.downId) {
        numberedPlacements.set(cell.downId, number!);
      }

      cells[index] = {
        index,
        row: croppedRow,
        col: croppedCol,
        solution: cell.letter,
        number,
        acrossId: cell.acrossId,
        downId: cell.downId,
      };
    }
  }

  const normalizedPlacements = chosenPlacements.map(placement => {
    const cellsForWord = Array.from(
      { length: placement.entry.answer.length },
      (_, offset) =>
        indexFor(
          placement.row - minRow + (placement.direction === "down" ? offset : 0),
          placement.col - minCol + (placement.direction === "across" ? offset : 0),
          width
        )
    );

    const crossings = cellsForWord.reduce((count, cellIndex) => {
      const cell = cells[cellIndex];
      if (!cell) {
        return count;
      }
      const hasCrossing =
        placement.direction === "across" ? cell.downId : cell.acrossId;
      return count + (hasCrossing ? 1 : 0);
    }, 0);

    return {
      ...placement,
      number: numberedPlacements.get(placement.id) ?? 0,
      cells: cellsForWord,
      crossings,
      cluePriority: crossings <= 3 ? "required" : "recommended",
    } satisfies CrosswordPlacement;
  });

  if (normalizedPlacements.some(placement => placement.crossings === 0)) {
    return null;
  }

  const signature = normalizedPlacements
    .map(placement => placement.entry.answer)
    .sort()
    .join("-");

  return {
    difficulty,
    width,
    height,
    cells,
    across: normalizedPlacements
      .filter(placement => placement.direction === "across")
      .sort((a, b) => a.number - b.number),
    down: normalizedPlacements
      .filter(placement => placement.direction === "down")
      .sort((a, b) => a.number - b.number),
    totalLetters: cells.filter(Boolean).length,
    categories: [theme.label],
    theme: theme.label,
    themeId: theme.id,
    signature,
  } satisfies CrosswordPuzzle;
}

function pickThemes(avoidTheme?: string) {
  const preferred = THEMES.filter(theme => theme.id !== avoidTheme);
  const fallback = THEMES.filter(theme => theme.id === avoidTheme);
  return [...shuffle(preferred), ...shuffle(fallback)];
}

export function createCrosswordPuzzle(
  difficulty: CrosswordDifficulty,
  options?: { avoidTheme?: string; avoidSignature?: string }
) {
  const themeQueue = pickThemes(options?.avoidTheme);

  for (let cycle = 0; cycle < 6; cycle += 1) {
    for (const theme of themeQueue) {
      const puzzle = buildPuzzle(difficulty, theme);
      if (!puzzle) {
        continue;
      }
      if (options?.avoidSignature && puzzle.signature === options.avoidSignature) {
        continue;
      }
      return puzzle;
    }
  }

  for (const theme of THEMES) {
    const puzzle = buildPuzzle(difficulty, theme);
    if (puzzle) {
      return puzzle;
    }
  }

  throw new Error("Unable to create crossword puzzle.");
}

export function getCrosswordConfig(difficulty: CrosswordDifficulty) {
  return CONFIG[difficulty];
}
