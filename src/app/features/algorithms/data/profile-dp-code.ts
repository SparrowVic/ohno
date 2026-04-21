import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const PROFILE_TS = buildStructuredCode(`
  /**
   * Count domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  function profileDp(columns: number): number {
    //@step 2
    const dp = Array.from({ length: columns + 1 }, () =>
      Array.from({ length: 1 << 2 }, () => 0),
    );
    dp[0][0] = 1;

    for (let column = 0; column < columns; column += 1) {
      for (let mask = 0; mask < (1 << 2); mask += 1) {
        if (dp[column][mask] === 0) {
          continue;
        }

        //@step 5
        for (const nextMask of generateNextMasks(mask, 0, 0)) {
          //@step 6
          dp[column + 1][nextMask] += dp[column][mask];
        }
      }
    }

    function trace(column: number, mask: number): void {
      if (column === 0) {
        return;
      }

      //@step 8
      trace(column - 1, 0);
    }

    trace(columns, 0);

    //@step 9
    return dp[columns][0];
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  function generateNextMasks(mask: number, row: number, nextMask: number): number[] {
    if (row === 2) {
      return [nextMask];
    }

    if ((mask & (1 << row)) !== 0) {
      return generateNextMasks(mask, row + 1, nextMask);
    }

    const transitions = generateNextMasks(mask, row + 1, nextMask | (1 << row));
    if (row + 1 < 2 && (mask & (1 << (row + 1))) === 0) {
      transitions.push(...generateNextMasks(mask, row + 2, nextMask));
    }

    return transitions;
  }
  //#endregion transition
`);

const PROFILE_PY = buildStructuredCode(
  `
  """
  Count domino tilings of a 2 x columns board with profile DP.
  Input: number of board columns.
  Returns: total number of tilings.
  """
  //#region profile-dp function open
  def profile_dp(columns: int) -> int:
      //@step 2
      dp = [[0] * (1 << 2) for _ in range(columns + 1)]
      dp[0][0] = 1

      for column in range(columns):
          for mask in range(1 << 2):
              if dp[column][mask] == 0:
                  continue

              //@step 5
              for next_mask in generate_next_masks(mask, 0, 0):
                  //@step 6
                  dp[column + 1][next_mask] += dp[column][mask]

      def trace(column: int, mask: int) -> None:
          if column == 0:
              return

          //@step 8
          trace(column - 1, 0)

      trace(columns, 0)

      //@step 9
      return dp[columns][0]
  //#endregion profile-dp

  //#region transition helper collapsed
  def generate_next_masks(mask: int, row: int, next_mask: int) -> list[int]:
      if row == 2:
          return [next_mask]

      if (mask & (1 << row)) != 0:
          return generate_next_masks(mask, row + 1, next_mask)

      transitions = generate_next_masks(mask, row + 1, next_mask | (1 << row))
      if row + 1 < 2 and (mask & (1 << (row + 1))) == 0:
          transitions.extend(generate_next_masks(mask, row + 2, next_mask))

      return transitions
  //#endregion transition
  `,
  'python',
);

const PROFILE_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  /// <summary>
  /// Counts domino tilings of a 2 x columns board with profile DP.
  /// Input: number of board columns.
  /// Returns: total number of tilings.
  /// </summary>
  //#region profile-dp function open
  public static int ProfileDp(int columns)
  {
      //@step 2
      var dp = new int[columns + 1, 1 << 2];
      dp[0, 0] = 1;

      for (var column = 0; column < columns; column += 1)
      {
          for (var mask = 0; mask < (1 << 2); mask += 1)
          {
              if (dp[column, mask] == 0)
              {
                  continue;
              }

              //@step 5
              foreach (var nextMask in GenerateNextMasks(mask, 0, 0))
              {
                  //@step 6
                  dp[column + 1, nextMask] += dp[column, mask];
              }
          }
      }

      void Trace(int column, int mask)
      {
          if (column == 0)
          {
              return;
          }

          //@step 8
          Trace(column - 1, 0);
      }

      Trace(columns, 0);

      //@step 9
      return dp[columns, 0];
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  private static List<int> GenerateNextMasks(int mask, int row, int nextMask)
  {
      if (row == 2)
      {
          return [nextMask];
      }

      if ((mask & (1 << row)) != 0)
      {
          return GenerateNextMasks(mask, row + 1, nextMask);
      }

      var transitions = GenerateNextMasks(mask, row + 1, nextMask | (1 << row));
      if (row + 1 < 2 && (mask & (1 << (row + 1))) == 0)
      {
          transitions.AddRange(GenerateNextMasks(mask, row + 2, nextMask));
      }

      return transitions;
  }
  //#endregion transition
  `,
  'csharp',
);

const PROFILE_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.List;

  /**
   * Counts domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  public static int profileDp(int columns) {
      //@step 2
      int[][] dp = new int[columns + 1][1 << 2];
      dp[0][0] = 1;

      for (int column = 0; column < columns; column += 1) {
          for (int mask = 0; mask < (1 << 2); mask += 1) {
              if (dp[column][mask] == 0) {
                  continue;
              }

              //@step 5
              for (int nextMask : generateNextMasks(mask, 0, 0)) {
                  //@step 6
                  dp[column + 1][nextMask] += dp[column][mask];
              }
          }
      }

      trace(columns, 0);

      //@step 9
      return dp[columns][0];
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  private static void trace(int column, int mask) {
      if (column == 0) {
          return;
      }

      //@step 8
      trace(column - 1, 0);
  }

  private static List<Integer> generateNextMasks(int mask, int row, int nextMask) {
      if (row == 2) {
          return new ArrayList<>(List.of(nextMask));
      }

      if ((mask & (1 << row)) != 0) {
          return generateNextMasks(mask, row + 1, nextMask);
      }

      List<Integer> transitions = generateNextMasks(mask, row + 1, nextMask | (1 << row));
      if (row + 1 < 2 && (mask & (1 << (row + 1))) == 0) {
          transitions.addAll(generateNextMasks(mask, row + 2, nextMask));
      }

      return transitions;
  }
  //#endregion transition
  `,
  'java',
);

const PROFILE_CPP = buildStructuredCode(
  `
  #include <vector>

  /**
   * Counts domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  int profileDp(int columns) {
      //@step 2
      std::vector<std::vector<int>> dp(columns + 1, std::vector<int>(1 << 2, 0));
      dp[0][0] = 1;

      for (int column = 0; column < columns; column += 1) {
          for (int mask = 0; mask < (1 << 2); mask += 1) {
              if (dp[column][mask] == 0) {
                  continue;
              }

              //@step 5
              for (int nextMask : generateNextMasks(mask, 0, 0)) {
                  //@step 6
                  dp[column + 1][nextMask] += dp[column][mask];
              }
          }
      }

      trace(columns, 0);

      //@step 9
      return dp[columns][0];
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  void trace(int column, int mask) {
      if (column == 0) {
          return;
      }

      //@step 8
      trace(column - 1, 0);
  }

  std::vector<int> generateNextMasks(int mask, int row, int nextMask) {
      if (row == 2) {
          return {nextMask};
      }

      if ((mask & (1 << row)) != 0) {
          return generateNextMasks(mask, row + 1, nextMask);
      }

      std::vector<int> transitions = generateNextMasks(mask, row + 1, nextMask | (1 << row));
      if (row + 1 < 2 && (mask & (1 << (row + 1))) == 0) {
          std::vector<int> extra = generateNextMasks(mask, row + 2, nextMask);
          transitions.insert(transitions.end(), extra.begin(), extra.end());
      }

      return transitions;
  }
  //#endregion transition
  `,
  'cpp',
);

const PROFILE_JS = buildStructuredCode(
  `
  /**
   * Count domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  function profileDp(columns) {
      //@step 2
      const dp = Array.from({ length: columns + 1 }, () =>
          Array.from({ length: 1 << 2 }, () => 0),
      );
      dp[0][0] = 1;

      for (let column = 0; column < columns; column += 1) {
          for (let mask = 0; mask < (1 << 2); mask += 1) {
              if (dp[column][mask] === 0) {
                  continue;
              }

              //@step 5
              for (const nextMask of generateNextMasks(mask, 0, 0)) {
                  //@step 6
                  dp[column + 1][nextMask] += dp[column][mask];
              }
          }
      }

      function trace(column, mask) {
          if (column === 0) {
              return;
          }

          //@step 8
          trace(column - 1, 0);
      }

      trace(columns, 0);

      //@step 9
      return dp[columns][0];
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  function generateNextMasks(mask, row, nextMask) {
      if (row === 2) {
          return [nextMask];
      }

      if ((mask & (1 << row)) !== 0) {
          return generateNextMasks(mask, row + 1, nextMask);
      }

      const transitions = generateNextMasks(mask, row + 1, nextMask | (1 << row));
      if (row + 1 < 2 && (mask & (1 << (row + 1))) === 0) {
          transitions.push(...generateNextMasks(mask, row + 2, nextMask));
      }

      return transitions;
  }
  //#endregion transition
  `,
  'javascript',
);

const PROFILE_GO = buildStructuredCode(
  `
  package dp

  /**
   * Counts domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  func ProfileDp(columns int) int {
      //@step 2
      dp := make([][]int, columns + 1)
      for column := 0; column <= columns; column += 1 {
          dp[column] = make([]int, 1 << 2)
      }
      dp[0][0] = 1

      for column := 0; column < columns; column += 1 {
          for mask := 0; mask < (1 << 2); mask += 1 {
              if dp[column][mask] == 0 {
                  continue
              }

              //@step 5
              for _, nextMask := range generateNextMasks(mask, 0, 0) {
                  //@step 6
                  dp[column + 1][nextMask] += dp[column][mask]
              }
          }
      }

      var trace func(int, int)
      trace = func(column int, mask int) {
          if column == 0 {
              return
          }

          //@step 8
          trace(column - 1, 0)
      }

      trace(columns, 0)

      //@step 9
      return dp[columns][0]
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  func generateNextMasks(mask int, row int, nextMask int) []int {
      if row == 2 {
          return []int{nextMask}
      }

      if (mask & (1 << row)) != 0 {
          return generateNextMasks(mask, row + 1, nextMask)
      }

      transitions := generateNextMasks(mask, row + 1, nextMask | (1 << row))
      if row + 1 < 2 && (mask & (1 << (row + 1))) == 0 {
          transitions = append(transitions, generateNextMasks(mask, row + 2, nextMask)...)
      }

      return transitions
  }
  //#endregion transition
  `,
  'go',
);

const PROFILE_RUST = buildStructuredCode(
  `
  /**
   * Counts domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  fn profile_dp(columns: usize) -> i32 {
      //@step 2
      let mut dp = vec![vec![0; 1 << 2]; columns + 1];
      dp[0][0] = 1;

      for column in 0..columns {
          for mask in 0..(1usize << 2) {
              if dp[column][mask] == 0 {
                  continue;
              }

              //@step 5
              for next_mask in generate_next_masks(mask, 0, 0) {
                  //@step 6
                  dp[column + 1][next_mask] += dp[column][mask];
              }
          }
      }

      trace(columns, 0);

      //@step 9
      dp[columns][0]
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  fn trace(column: usize, mask: usize) {
      if column == 0 {
          return;
      }

      //@step 8
      trace(column - 1, 0);
  }

  fn generate_next_masks(mask: usize, row: usize, next_mask: usize) -> Vec<usize> {
      if row == 2 {
          return vec![next_mask];
      }

      if (mask & (1usize << row)) != 0 {
          return generate_next_masks(mask, row + 1, next_mask);
      }

      let mut transitions = generate_next_masks(mask, row + 1, next_mask | (1usize << row));
      if row + 1 < 2 && (mask & (1usize << (row + 1))) == 0 {
          transitions.extend(generate_next_masks(mask, row + 2, next_mask));
      }

      transitions
  }
  //#endregion transition
  `,
  'rust',
);

const PROFILE_SWIFT = buildStructuredCode(
  `
  /**
   * Counts domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  func profileDp(_ columns: Int) -> Int {
      //@step 2
      var dp = Array(repeating: Array(repeating: 0, count: 1 << 2), count: columns + 1)
      dp[0][0] = 1

      for column in 0..<columns {
          for mask in 0..<(1 << 2) {
              if dp[column][mask] == 0 {
                  continue
              }

              //@step 5
              for nextMask in generateNextMasks(mask, 0, 0) {
                  //@step 6
                  dp[column + 1][nextMask] += dp[column][mask]
              }
          }
      }

      func trace(_ column: Int, _ mask: Int) {
          if column == 0 {
              return
          }

          //@step 8
          trace(column - 1, 0)
      }

      trace(columns, 0)

      //@step 9
      return dp[columns][0]
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  func generateNextMasks(_ mask: Int, _ row: Int, _ nextMask: Int) -> [Int] {
      if row == 2 {
          return [nextMask]
      }

      if (mask & (1 << row)) != 0 {
          return generateNextMasks(mask, row + 1, nextMask)
      }

      var transitions = generateNextMasks(mask, row + 1, nextMask | (1 << row))
      if row + 1 < 2 && (mask & (1 << (row + 1))) == 0 {
          transitions += generateNextMasks(mask, row + 2, nextMask)
      }

      return transitions
  }
  //#endregion transition
  `,
  'swift',
);

const PROFILE_PHP = buildStructuredCode(
  `
  /**
   * Counts domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  function profileDp(int $columns): int
  {
      //@step 2
      $dp = array_fill(0, $columns + 1, array_fill(0, 1 << 2, 0));
      $dp[0][0] = 1;

      for ($column = 0; $column < $columns; $column += 1) {
          for ($mask = 0; $mask < (1 << 2); $mask += 1) {
              if ($dp[$column][$mask] === 0) {
                  continue;
              }

              //@step 5
              foreach (generateNextMasks($mask, 0, 0) as $nextMask) {
                  //@step 6
                  $dp[$column + 1][$nextMask] += $dp[$column][$mask];
              }
          }
      }

      $trace = null;
      $trace = function (int $column, int $mask) use (&$trace): void {
          if ($column === 0) {
              return;
          }

          //@step 8
          $trace($column - 1, 0);
      };

      $trace($columns, 0);

      //@step 9
      return $dp[$columns][0];
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  function generateNextMasks(int $mask, int $row, int $nextMask): array
  {
      if ($row === 2) {
          return [$nextMask];
      }

      if (($mask & (1 << $row)) !== 0) {
          return generateNextMasks($mask, $row + 1, $nextMask);
      }

      $transitions = generateNextMasks($mask, $row + 1, $nextMask | (1 << $row));
      if ($row + 1 < 2 && ($mask & (1 << ($row + 1))) === 0) {
          $transitions = [...$transitions, ...generateNextMasks($mask, $row + 2, $nextMask)];
      }

      return $transitions;
  }
  //#endregion transition
  `,
  'php',
);

const PROFILE_KOTLIN = buildStructuredCode(
  `
  /**
   * Counts domino tilings of a 2 x columns board with profile DP.
   * Input: number of board columns.
   * Returns: total number of tilings.
   */
  //#region profile-dp function open
  fun profileDp(columns: Int): Int {
      //@step 2
      val dp = Array(columns + 1) { IntArray(1 shl 2) }
      dp[0][0] = 1

      for (column in 0 until columns) {
          for (mask in 0 until (1 shl 2)) {
              if (dp[column][mask] == 0) {
                  continue
              }

              //@step 5
              for (nextMask in generateNextMasks(mask, 0, 0)) {
                  //@step 6
                  dp[column + 1][nextMask] += dp[column][mask]
              }
          }
      }

      fun trace(column: Int, mask: Int) {
          if (column == 0) {
              return
          }

          //@step 8
          trace(column - 1, 0)
      }

      trace(columns, 0)

      //@step 9
      return dp[columns][0]
  }
  //#endregion profile-dp

  //#region transition helper collapsed
  fun generateNextMasks(mask: Int, row: Int, nextMask: Int): List<Int> {
      if (row == 2) {
          return listOf(nextMask)
      }

      if ((mask and (1 shl row)) != 0) {
          return generateNextMasks(mask, row + 1, nextMask)
      }

      val transitions = generateNextMasks(mask, row + 1, nextMask or (1 shl row)).toMutableList()
      if (row + 1 < 2 && (mask and (1 shl (row + 1))) == 0) {
          transitions += generateNextMasks(mask, row + 2, nextMask)
      }

      return transitions
  }
  //#endregion transition
  `,
  'kotlin',
);

export const PROFILE_DP_CODE = PROFILE_TS.lines;
export const PROFILE_DP_CODE_REGIONS = PROFILE_TS.regions;
export const PROFILE_DP_CODE_HIGHLIGHT_MAP = PROFILE_TS.highlightMap;
export const PROFILE_DP_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: PROFILE_TS.lines,
    regions: PROFILE_TS.regions,
    highlightMap: PROFILE_TS.highlightMap,
    source: PROFILE_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: PROFILE_JS.lines,
    regions: PROFILE_JS.regions,
    highlightMap: PROFILE_JS.highlightMap,
    source: PROFILE_JS.source,
  },
  python: {
    language: 'python',
    lines: PROFILE_PY.lines,
    regions: PROFILE_PY.regions,
    highlightMap: PROFILE_PY.highlightMap,
    source: PROFILE_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: PROFILE_CS.lines,
    regions: PROFILE_CS.regions,
    highlightMap: PROFILE_CS.highlightMap,
    source: PROFILE_CS.source,
  },
  java: {
    language: 'java',
    lines: PROFILE_JAVA.lines,
    regions: PROFILE_JAVA.regions,
    highlightMap: PROFILE_JAVA.highlightMap,
    source: PROFILE_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: PROFILE_CPP.lines,
    regions: PROFILE_CPP.regions,
    highlightMap: PROFILE_CPP.highlightMap,
    source: PROFILE_CPP.source,
  },
  go: {
    language: 'go',
    lines: PROFILE_GO.lines,
    regions: PROFILE_GO.regions,
    highlightMap: PROFILE_GO.highlightMap,
    source: PROFILE_GO.source,
  },
  rust: {
    language: 'rust',
    lines: PROFILE_RUST.lines,
    regions: PROFILE_RUST.regions,
    highlightMap: PROFILE_RUST.highlightMap,
    source: PROFILE_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: PROFILE_SWIFT.lines,
    regions: PROFILE_SWIFT.regions,
    highlightMap: PROFILE_SWIFT.highlightMap,
    source: PROFILE_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: PROFILE_PHP.lines,
    regions: PROFILE_PHP.regions,
    highlightMap: PROFILE_PHP.highlightMap,
    source: PROFILE_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: PROFILE_KOTLIN.lines,
    regions: PROFILE_KOTLIN.regions,
    highlightMap: PROFILE_KOTLIN.highlightMap,
    source: PROFILE_KOTLIN.source,
  },
};
