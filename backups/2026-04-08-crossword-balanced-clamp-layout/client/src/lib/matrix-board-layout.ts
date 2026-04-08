export interface MatrixBoardLayoutInput {
  rows: number;
  columns: number;
  availableWidth: number;
  availableHeight: number;
  gridGap: number;
  gridPadding: number;
}

export interface MatrixBoardLayoutMetrics {
  rows: number;
  columns: number;
  cellSize: number;
  boardWidth: number;
  boardHeight: number;
  innerWidth: number;
  innerHeight: number;
  gridGap: number;
  gridPadding: number;
}

export function calculateMatrixBoardMetrics(
  input: MatrixBoardLayoutInput
): MatrixBoardLayoutMetrics {
  const rows = Math.max(1, Math.floor(input.rows));
  const columns = Math.max(1, Math.floor(input.columns));
  const gridGap = Math.max(0, Math.floor(input.gridGap));
  const gridPadding = Math.max(0, Math.floor(input.gridPadding));
  const totalGapWidth = Math.max(0, columns - 1) * gridGap;
  const totalGapHeight = Math.max(0, rows - 1) * gridGap;
  const availableWidth = Math.max(0, Math.floor(input.availableWidth));
  const availableHeight = Math.max(0, Math.floor(input.availableHeight));
  const innerWidth = Math.max(0, availableWidth - gridPadding * 2 - totalGapWidth);
  const innerHeight = Math.max(
    0,
    availableHeight - gridPadding * 2 - totalGapHeight
  );
  const cellSize = Math.max(
    1,
    Math.floor(Math.min(innerWidth / columns, innerHeight / rows))
  );

  return {
    rows,
    columns,
    cellSize,
    boardWidth: columns * cellSize + totalGapWidth + gridPadding * 2,
    boardHeight: rows * cellSize + totalGapHeight + gridPadding * 2,
    innerWidth,
    innerHeight,
    gridGap,
    gridPadding,
  };
}
