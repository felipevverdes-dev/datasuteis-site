export interface MatrixBoardLayoutInput {
  rows: number;
  columns: number;
  availableWidth: number;
  availableHeight: number;
  gridGap: number;
  gridPadding: number;
  minimumCellSize?: number;
  maximumCellSize?: number;
}

export interface MatrixBoardLayoutMetrics {
  rows: number;
  columns: number;
  fitCellSize: number;
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
  const fitCellSize = Math.max(
    1,
    Math.floor(Math.min(innerWidth / columns, innerHeight / rows))
  );
  const minimumCellSize = Math.max(
    1,
    Math.floor(input.minimumCellSize ?? 1)
  );
  const maximumCellSize = Math.max(
    minimumCellSize,
    Math.floor(input.maximumCellSize ?? fitCellSize)
  );
  const safeMinimumCellSize = Math.min(minimumCellSize, fitCellSize);
  const cellSize = Math.min(
    maximumCellSize,
    Math.max(safeMinimumCellSize, fitCellSize)
  );

  return {
    rows,
    columns,
    fitCellSize,
    cellSize,
    boardWidth: columns * cellSize + totalGapWidth + gridPadding * 2,
    boardHeight: rows * cellSize + totalGapHeight + gridPadding * 2,
    innerWidth,
    innerHeight,
    gridGap,
    gridPadding,
  };
}
