import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const MATRIX_CHAIN_JS = buildStructuredCode(
  `
  /**
   * Computes the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  function matrixChainOrder(dimensions) {
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

      function trace(left, right) {
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
  `,
  'javascript',
);

const MATRIX_CHAIN_GO = buildStructuredCode(
  `
  package dp

  import "math"

  //#region matrix-chain-result interface collapsed
  type MatrixChainResult struct {
      MinCost int
      Splits [][]int
  }
  //#endregion matrix-chain-result

  /**
   * Computes the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  func MatrixChainOrder(dimensions []int) MatrixChainResult {
      matrixCount := len(dimensions) - 1

      //@step 2
      cost := make([][]int, matrixCount)
      split := make([][]int, matrixCount)
      for row := 0; row < matrixCount; row += 1 {
          cost[row] = make([]int, matrixCount)
          split[row] = make([]int, matrixCount)
          for col := 0; col < matrixCount; col += 1 {
              split[row][col] = -1
          }
      }

      for span := 2; span <= matrixCount; span += 1 {
          for left := 0; left + span - 1 < matrixCount; left += 1 {
              right := left + span - 1
              cost[left][right] = math.MaxInt

              for pivot := left; pivot < right; pivot += 1 {
                  //@step 7
                  candidate :=
                      cost[left][pivot] +
                      cost[pivot + 1][right] +
                      dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1]

                  if candidate < cost[left][right] {
                      cost[left][right] = candidate
                      split[left][right] = pivot
                  }
              }

              //@step 10
              cost[left][right] = cost[left][right]
          }
      }

      var trace func(int, int)
      trace = func(left int, right int) {
          if left >= right {
              return
          }

          //@step 11
          pivot := split[left][right]
          trace(left, pivot)
          trace(pivot + 1, right)
      }

      if matrixCount > 0 {
          trace(0, matrixCount - 1)
      }

      //@step 12
      if matrixCount == 0 {
          return MatrixChainResult{MinCost: 0, Splits: split}
      }
      return MatrixChainResult{MinCost: cost[0][matrixCount - 1], Splits: split}
  }
  //#endregion matrix-chain
  `,
  'go',
);

const MATRIX_CHAIN_RUST = buildStructuredCode(
  `
  //#region matrix-chain-result interface collapsed
  struct MatrixChainResult {
      min_cost: i32,
      splits: Vec<Vec<i32>>,
  }
  //#endregion matrix-chain-result

  /**
   * Computes the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  fn matrix_chain_order(dimensions: &[i32]) -> MatrixChainResult {
      let matrix_count = dimensions.len().saturating_sub(1);

      //@step 2
      let mut cost = vec![vec![0; matrix_count]; matrix_count];
      let mut split = vec![vec![-1; matrix_count]; matrix_count];

      for span in 2..=matrix_count {
          for left in 0..=(matrix_count - span) {
              let right = left + span - 1;
              cost[left][right] = i32::MAX;

              for pivot in left..right {
                  //@step 7
                  let candidate =
                      cost[left][pivot] +
                      cost[pivot + 1][right] +
                      dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1];

                  if candidate < cost[left][right] {
                      cost[left][right] = candidate;
                      split[left][right] = pivot as i32;
                  }
              }

              //@step 10
              cost[left][right] = cost[left][right];
          }
      }

      if matrix_count > 0 {
          trace(&split, 0, matrix_count - 1);
      }

      //@step 12
      MatrixChainResult {
          min_cost: if matrix_count == 0 { 0 } else { cost[0][matrix_count - 1] },
          splits: split,
      }
  }
  //#endregion matrix-chain

  //#region trace helper collapsed
  fn trace(split: &[Vec<i32>], left: usize, right: usize) {
      if left >= right {
          return;
      }

      //@step 11
      let pivot = split[left][right] as usize;
      trace(split, left, pivot);
      trace(split, pivot + 1, right);
  }
  //#endregion trace
  `,
  'rust',
);

const MATRIX_CHAIN_SWIFT = buildStructuredCode(
  `
  //#region matrix-chain-result interface collapsed
  struct MatrixChainResult {
      let minCost: Int
      let splits: [[Int]]
  }
  //#endregion matrix-chain-result

  /**
   * Computes the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  func matrixChainOrder(_ dimensions: [Int]) -> MatrixChainResult {
      let matrixCount = max(dimensions.count - 1, 0)

      //@step 2
      var cost = Array(repeating: Array(repeating: 0, count: matrixCount), count: matrixCount)
      var split = Array(repeating: Array(repeating: -1, count: matrixCount), count: matrixCount)

      if matrixCount >= 2 {
          for span in 2...matrixCount {
              for left in 0...(matrixCount - span) {
                  let right = left + span - 1
                  cost[left][right] = Int.max

                  for pivot in left..<right {
                      //@step 7
                      let candidate =
                          cost[left][pivot] +
                          cost[pivot + 1][right] +
                          dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1]

                      if candidate < cost[left][right] {
                          cost[left][right] = candidate
                          split[left][right] = pivot
                      }
                  }

                  //@step 10
                  cost[left][right] = cost[left][right]
              }
          }
      }

      func trace(_ left: Int, _ right: Int) {
          if left >= right {
              return
          }

          //@step 11
          let pivot = split[left][right]
          trace(left, pivot)
          trace(pivot + 1, right)
      }

      if matrixCount > 0 {
          trace(0, matrixCount - 1)
      }

      //@step 12
      return MatrixChainResult(
          minCost: matrixCount == 0 ? 0 : cost[0][matrixCount - 1],
          splits: split,
      )
  }
  //#endregion matrix-chain
  `,
  'swift',
);

const MATRIX_CHAIN_PHP = buildStructuredCode(
  `
  /**
   * Computes the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  function matrixChainOrder(array $dimensions): array
  {
      $matrixCount = count($dimensions) - 1;

      //@step 2
      $cost = array_fill(0, $matrixCount, array_fill(0, $matrixCount, 0));
      $split = array_fill(0, $matrixCount, array_fill(0, $matrixCount, -1));

      for ($span = 2; $span <= $matrixCount; $span += 1) {
          for ($left = 0; $left + $span - 1 < $matrixCount; $left += 1) {
              $right = $left + $span - 1;
              $cost[$left][$right] = PHP_INT_MAX;

              for ($pivot = $left; $pivot < $right; $pivot += 1) {
                  //@step 7
                  $candidate =
                      $cost[$left][$pivot] +
                      $cost[$pivot + 1][$right] +
                      $dimensions[$left] * $dimensions[$pivot + 1] * $dimensions[$right + 1];

                  if ($candidate < $cost[$left][$right]) {
                      $cost[$left][$right] = $candidate;
                      $split[$left][$right] = $pivot;
                  }
              }

              //@step 10
              $cost[$left][$right] = $cost[$left][$right];
          }
      }

      $trace = null;
      $trace = function (int $left, int $right) use (&$trace, &$split): void {
          if ($left >= $right) {
              return;
          }

          //@step 11
          $pivot = $split[$left][$right];
          $trace($left, $pivot);
          $trace($pivot + 1, $right);
      };

      if ($matrixCount > 0) {
          $trace(0, $matrixCount - 1);
      }

      //@step 12
      return [
          'minCost' => $matrixCount === 0 ? 0 : $cost[0][$matrixCount - 1],
          'splits' => $split,
      ];
  }
  //#endregion matrix-chain
  `,
  'php',
);

const MATRIX_CHAIN_KOTLIN = buildStructuredCode(
  `
  //#region matrix-chain-result interface collapsed
  data class MatrixChainResult(
      val minCost: Int,
      val splits: Array<IntArray>,
  )
  //#endregion matrix-chain-result

  /**
   * Computes the optimal parenthesization cost for matrix-chain multiplication.
   * Input: dimensions p where matrix i has size p[i] x p[i + 1].
   * Returns: minimum scalar multiplication count and split table.
   */
  //#region matrix-chain function open
  fun matrixChainOrder(dimensions: IntArray): MatrixChainResult {
      val matrixCount = dimensions.size - 1

      //@step 2
      val cost = Array(matrixCount) { IntArray(matrixCount) }
      val split = Array(matrixCount) { IntArray(matrixCount) { -1 } }

      for (span in 2..matrixCount) {
          for (left in 0..(matrixCount - span)) {
              val right = left + span - 1
              cost[left][right] = Int.MAX_VALUE

              for (pivot in left until right) {
                  //@step 7
                  val candidate =
                      cost[left][pivot] +
                      cost[pivot + 1][right] +
                      dimensions[left] * dimensions[pivot + 1] * dimensions[right + 1]

                  if (candidate < cost[left][right]) {
                      cost[left][right] = candidate
                      split[left][right] = pivot
                  }
              }

              //@step 10
              cost[left][right] = cost[left][right]
          }
      }

      fun trace(left: Int, right: Int) {
          if (left >= right) {
              return
          }

          //@step 11
          val pivot = split[left][right]
          trace(left, pivot)
          trace(pivot + 1, right)
      }

      if (matrixCount > 0) {
          trace(0, matrixCount - 1)
      }

      //@step 12
      return MatrixChainResult(
          minCost = if (matrixCount == 0) 0 else cost[0][matrixCount - 1],
          splits = split,
      )
  }
  //#endregion matrix-chain
  `,
  'kotlin',
);

export const MATRIX_CHAIN_MULTIPLICATION_CODE = MATRIX_CHAIN_TS.lines;
export const MATRIX_CHAIN_MULTIPLICATION_CODE_REGIONS = MATRIX_CHAIN_TS.regions;
export const MATRIX_CHAIN_MULTIPLICATION_CODE_HIGHLIGHT_MAP = MATRIX_CHAIN_TS.highlightMap;
export const MATRIX_CHAIN_MULTIPLICATION_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: MATRIX_CHAIN_TS.lines,
    regions: MATRIX_CHAIN_TS.regions,
    highlightMap: MATRIX_CHAIN_TS.highlightMap,
    source: MATRIX_CHAIN_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: MATRIX_CHAIN_JS.lines,
    regions: MATRIX_CHAIN_JS.regions,
    highlightMap: MATRIX_CHAIN_JS.highlightMap,
    source: MATRIX_CHAIN_JS.source,
  },
  python: {
    language: 'python',
    lines: MATRIX_CHAIN_PY.lines,
    regions: MATRIX_CHAIN_PY.regions,
    highlightMap: MATRIX_CHAIN_PY.highlightMap,
    source: MATRIX_CHAIN_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: MATRIX_CHAIN_CS.lines,
    regions: MATRIX_CHAIN_CS.regions,
    highlightMap: MATRIX_CHAIN_CS.highlightMap,
    source: MATRIX_CHAIN_CS.source,
  },
  java: {
    language: 'java',
    lines: MATRIX_CHAIN_JAVA.lines,
    regions: MATRIX_CHAIN_JAVA.regions,
    highlightMap: MATRIX_CHAIN_JAVA.highlightMap,
    source: MATRIX_CHAIN_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: MATRIX_CHAIN_CPP.lines,
    regions: MATRIX_CHAIN_CPP.regions,
    highlightMap: MATRIX_CHAIN_CPP.highlightMap,
    source: MATRIX_CHAIN_CPP.source,
  },
  go: {
    language: 'go',
    lines: MATRIX_CHAIN_GO.lines,
    regions: MATRIX_CHAIN_GO.regions,
    highlightMap: MATRIX_CHAIN_GO.highlightMap,
    source: MATRIX_CHAIN_GO.source,
  },
  rust: {
    language: 'rust',
    lines: MATRIX_CHAIN_RUST.lines,
    regions: MATRIX_CHAIN_RUST.regions,
    highlightMap: MATRIX_CHAIN_RUST.highlightMap,
    source: MATRIX_CHAIN_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: MATRIX_CHAIN_SWIFT.lines,
    regions: MATRIX_CHAIN_SWIFT.regions,
    highlightMap: MATRIX_CHAIN_SWIFT.highlightMap,
    source: MATRIX_CHAIN_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: MATRIX_CHAIN_PHP.lines,
    regions: MATRIX_CHAIN_PHP.regions,
    highlightMap: MATRIX_CHAIN_PHP.highlightMap,
    source: MATRIX_CHAIN_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: MATRIX_CHAIN_KOTLIN.lines,
    regions: MATRIX_CHAIN_KOTLIN.regions,
    highlightMap: MATRIX_CHAIN_KOTLIN.highlightMap,
    source: MATRIX_CHAIN_KOTLIN.source,
  },
};
