import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const MATRIX_CHAIN_TS = buildStructuredCode(`
  //#region matrix-chain-result interface collapsed
  interface MatrixChainResult {
    readonly minCost: number;
    readonly splits: number[][];
  }
  //#endregion matrix-chain-result

  /**
   * Compute the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  function matrixChainOrder(dimensions: number[]): MatrixChainResult {
    const matrixCount = dimensions.length - 1;

    //@step 2
    const cost = Array.from({ length: matrixCount }, () =>
      Array.from({ length: matrixCount }, () => 0),
    );
    const split = Array.from({ length: matrixCount }, () =>
      Array.from({ length: matrixCount }, () => -1),
    );

    for (let span = 2; span <= matrixCount; span += 1) {
      for (let left = 0; left + span - 1 < matrixCount; left += 1) {
        const right = left + span - 1;
        cost[left][right] = Number.POSITIVE_INFINITY;

        for (let pivot = left; pivot < right; pivot += 1) {
          //@step 7
          const candidate =
            cost[left][pivot] +
            cost[pivot + 1][right] +
            dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1];

          if (candidate < cost[left][right]) {
            cost[left][right] = candidate;
            split[left][right] = pivot;
          }
        }

        //@step 10
        cost[left][right] = cost[left][right];
      }
    }

    function trace(left: number, right: number): void {
      if (left >= right) {
        return;
      }

      //@step 11
      const pivot = split[left][right];
      trace(left, pivot);
      trace(pivot + 1, right);
    }

    if (matrixCount > 0) {
      trace(0, matrixCount - 1);
    }

    //@step 12
    return {
      minCost: matrixCount === 0 ? 0 : cost[0][matrixCount - 1],
      splits: split,
    };
  }
  //#endregion matrix-chain
`);

const MATRIX_CHAIN_PY = buildStructuredCode(
  `
  from typing import TypedDict


  //#region matrix-chain-result interface collapsed
  class MatrixChainResult(TypedDict):
      min_cost: int
      splits: list[list[int]]
  //#endregion matrix-chain-result

  """
  Compute the optimal parenthesization cost for matrix-chain multiplication.
  Input: dimensions p where matrix i has size p[i] x p[i + 1].
  Returns: minimum scalar multiplication count and split table.
  """
  //#region matrix-chain function open
  def matrix_chain_order(dimensions: list[int]) -> MatrixChainResult:
      matrix_count = len(dimensions) - 1

      //@step 2
      cost = [[0] * matrix_count for _ in range(matrix_count)]
      split = [[-1] * matrix_count for _ in range(matrix_count)]

      for span in range(2, matrix_count + 1):
          for left in range(matrix_count - span + 1):
              right = left + span - 1
              cost[left][right] = float("inf")

              for pivot in range(left, right):
                  //@step 7
                  candidate = (
                      cost[left][pivot] +
                      cost[pivot + 1][right] +
                      dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1]
                  )

                  if candidate < cost[left][right]:
                      cost[left][right] = candidate
                      split[left][right] = pivot

              //@step 10
              cost[left][right] = cost[left][right]

      def trace(left: int, right: int) -> None:
          if left >= right:
              return

          //@step 11
          pivot = split[left][right]
          trace(left, pivot)
          trace(pivot + 1, right)

      if matrix_count > 0:
          trace(0, matrix_count - 1)

      //@step 12
      return {"min_cost": 0 if matrix_count == 0 else int(cost[0][matrix_count - 1]), "splits": split}
  //#endregion matrix-chain
  `,
  'python',
);

const MATRIX_CHAIN_CS = buildStructuredCode(
  `
  using System;

  //#region matrix-chain-result interface collapsed
  public sealed class MatrixChainResult
  {
      public required int MinCost { get; init; }
      public required int[,] Splits { get; init; }
  }
  //#endregion matrix-chain-result

  /// <summary>
  /// Computes the optimal parenthesization cost for matrix-chain multiplication.
  /// Input: dimensions p where matrix i has size p[i] x p[i + 1].
  /// Returns: minimum scalar multiplication count and split table.
  /// </summary>
  //#region matrix-chain function open
  public static MatrixChainResult MatrixChainOrder(int[] dimensions)
  {
      var matrixCount = dimensions.Length - 1;

      //@step 2
      var cost = new int[matrixCount, matrixCount];
      var split = new int[matrixCount, matrixCount];
      for (var row = 0; row < matrixCount; row += 1)
      {
          for (var col = 0; col < matrixCount; col += 1)
          {
              split[row, col] = -1;
          }
      }

      for (var span = 2; span <= matrixCount; span += 1)
      {
          for (var left = 0; left + span - 1 < matrixCount; left += 1)
          {
              var right = left + span - 1;
              cost[left, right] = int.MaxValue;

              for (var pivot = left; pivot < right; pivot += 1)
              {
                  //@step 7
                  var candidate =
                      cost[left, pivot] +
                      cost[pivot + 1, right] +
                      dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1];

                  if (candidate < cost[left, right])
                  {
                      cost[left, right] = candidate;
                      split[left, right] = pivot;
                  }
              }

              //@step 10
              cost[left, right] = cost[left, right];
          }
      }

      void Trace(int left, int right)
      {
          if (left >= right)
          {
              return;
          }

          //@step 11
          var pivot = split[left, right];
          Trace(left, pivot);
          Trace(pivot + 1, right);
      }

      if (matrixCount > 0)
      {
          Trace(0, matrixCount - 1);
      }

      //@step 12
      return new MatrixChainResult
      {
          MinCost = matrixCount == 0 ? 0 : cost[0, matrixCount - 1],
          Splits = split,
      };
  }
  //#endregion matrix-chain
  `,
  'csharp',
);

const MATRIX_CHAIN_JAVA = buildStructuredCode(
  `
  /**
   * Computes the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  public static MatrixChainResult matrixChainOrder(int[] dimensions) {
      int matrixCount = dimensions.length - 1;

      //@step 2
      int[][] cost = new int[matrixCount][matrixCount];
      int[][] split = new int[matrixCount][matrixCount];
      for (int row = 0; row < matrixCount; row += 1) {
          for (int col = 0; col < matrixCount; col += 1) {
              split[row][col] = -1;
          }
      }

      for (int span = 2; span <= matrixCount; span += 1) {
          for (int left = 0; left + span - 1 < matrixCount; left += 1) {
              int right = left + span - 1;
              cost[left][right] = Integer.MAX_VALUE;

              for (int pivot = left; pivot < right; pivot += 1) {
                  //@step 7
                  int candidate =
                      cost[left][pivot] +
                      cost[pivot + 1][right] +
                      dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1];

                  if (candidate < cost[left][right]) {
                      cost[left][right] = candidate;
                      split[left][right] = pivot;
                  }
              }

              //@step 10
              cost[left][right] = cost[left][right];
          }
      }

      trace(split, 0, matrixCount - 1);

      //@step 12
      return new MatrixChainResult(matrixCount == 0 ? 0 : cost[0][matrixCount - 1], split);
  }
  //#endregion matrix-chain

  //#region trace helper collapsed
  private static void trace(int[][] split, int left, int right) {
      if (left >= right) {
          return;
      }

      //@step 11
      int pivot = split[left][right];
      trace(split, left, pivot);
      trace(split, pivot + 1, right);
  }

  public record MatrixChainResult(int minCost, int[][] splits) {}
  //#endregion trace
  `,
  'java',
);

const MATRIX_CHAIN_CPP = buildStructuredCode(
  `
  #include <limits>
  #include <vector>

  //#region matrix-chain-result interface collapsed
  struct MatrixChainResult {
      int minCost;
      std::vector<std::vector<int>> splits;
  };
  //#endregion matrix-chain-result

  /**
   * Computes the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  MatrixChainResult matrixChainOrder(const std::vector<int>& dimensions) {
      int matrixCount = static_cast<int>(dimensions.size()) - 1;

      //@step 2
      std::vector<std::vector<int>> cost(matrixCount, std::vector<int>(matrixCount, 0));
      std::vector<std::vector<int>> split(matrixCount, std::vector<int>(matrixCount, -1));

      for (int span = 2; span <= matrixCount; span += 1) {
          for (int left = 0; left + span - 1 < matrixCount; left += 1) {
              int right = left + span - 1;
              cost[left][right] = std::numeric_limits<int>::max();

              for (int pivot = left; pivot < right; pivot += 1) {
                  //@step 7
                  int candidate =
                      cost[left][pivot] +
                      cost[pivot + 1][right] +
                      dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1];

                  if (candidate < cost[left][right]) {
                      cost[left][right] = candidate;
                      split[left][right] = pivot;
                  }
              }

              //@step 10
              cost[left][right] = cost[left][right];
          }
      }

      trace(split, 0, matrixCount - 1);

      //@step 12
      return {matrixCount == 0 ? 0 : cost[0][matrixCount - 1], split};
  }
  //#endregion matrix-chain

  //#region trace helper collapsed
  void trace(const std::vector<std::vector<int>>& split, int left, int right) {
      if (left >= right) {
          return;
      }

      //@step 11
      int pivot = split[left][right];
      trace(split, left, pivot);
      trace(split, pivot + 1, right);
  }
  //#endregion trace
  `,
  'cpp',
);

export const MATRIX_CHAIN_MULTIPLICATION_CODE = MATRIX_CHAIN_TS.lines;
export const MATRIX_CHAIN_MULTIPLICATION_CODE_REGIONS = MATRIX_CHAIN_TS.regions;
export const MATRIX_CHAIN_MULTIPLICATION_CODE_HIGHLIGHT_MAP = MATRIX_CHAIN_TS.highlightMap;
export const MATRIX_CHAIN_MULTIPLICATION_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: MATRIX_CHAIN_TS.lines, regions: MATRIX_CHAIN_TS.regions, highlightMap: MATRIX_CHAIN_TS.highlightMap, source: MATRIX_CHAIN_TS.source },
  python: { language: 'python', lines: MATRIX_CHAIN_PY.lines, regions: MATRIX_CHAIN_PY.regions, highlightMap: MATRIX_CHAIN_PY.highlightMap, source: MATRIX_CHAIN_PY.source },
  csharp: { language: 'csharp', lines: MATRIX_CHAIN_CS.lines, regions: MATRIX_CHAIN_CS.regions, highlightMap: MATRIX_CHAIN_CS.highlightMap, source: MATRIX_CHAIN_CS.source },
  java: { language: 'java', lines: MATRIX_CHAIN_JAVA.lines, regions: MATRIX_CHAIN_JAVA.regions, highlightMap: MATRIX_CHAIN_JAVA.highlightMap, source: MATRIX_CHAIN_JAVA.source },
  cpp: { language: 'cpp', lines: MATRIX_CHAIN_CPP.lines, regions: MATRIX_CHAIN_CPP.regions, highlightMap: MATRIX_CHAIN_CPP.highlightMap, source: MATRIX_CHAIN_CPP.source },
};
