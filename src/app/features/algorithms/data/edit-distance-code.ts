import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const EDIT_DISTANCE_TS = buildStructuredCode(`
  /**
   * Compute Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  function editDistance(a: string, b: string): number {
    //@step 2
    const dp = Array.from({ length: a.length + 1 }, (_, row) =>
      Array.from({ length: b.length + 1 }, (_, col) => (row === 0 ? col : col === 0 ? row : 0)),
    );

    for (let row = 1; row <= a.length; row += 1) {
      for (let col = 1; col <= b.length; col += 1) {
        const replaceCost = dp[row - 1][col - 1] + (a[row - 1] === b[col - 1] ? 0 : 1);
        const deleteCost = dp[row - 1][col] + 1;
        const insertCost = dp[row][col - 1] + 1;

        //@step 5
        const best = Math.min(replaceCost, deleteCost, insertCost);

        //@step 8
        dp[row][col] = best;
      }
    }

    let row = a.length;
    let col = b.length;

    while (row > 0 || col > 0) {
      //@step 11
      const matchesDiagonal =
        row > 0 &&
        col > 0 &&
        dp[row][col] === dp[row - 1][col - 1] + (a[row - 1] === b[col - 1] ? 0 : 1);

      if (matchesDiagonal) {
        row -= 1;
        col -= 1;
        continue;
      }

      if (row > 0 && dp[row][col] === dp[row - 1][col] + 1) {
        //@step 13
        row -= 1;
      } else {
        //@step 14
        col -= 1;
      }
    }

    //@step 16
    return dp[a.length][b.length];
  }
  //#endregion edit-distance
`);

const EDIT_DISTANCE_JS = buildStructuredCode(
  `
  /**
   * Compute Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  function editDistance(a, b) {
      //@step 2
      const dp = Array.from({ length: a.length + 1 }, (_, row) =>
          Array.from({ length: b.length + 1 }, (_, col) => (row === 0 ? col : col === 0 ? row : 0)),
      );

      for (let row = 1; row <= a.length; row += 1) {
          for (let col = 1; col <= b.length; col += 1) {
              const replaceCost = dp[row - 1][col - 1] + (a[row - 1] === b[col - 1] ? 0 : 1);
              const deleteCost = dp[row - 1][col] + 1;
              const insertCost = dp[row][col - 1] + 1;

              //@step 5
              const best = Math.min(replaceCost, deleteCost, insertCost);

              //@step 8
              dp[row][col] = best;
          }
      }

      let row = a.length;
      let col = b.length;

      while (row > 0 || col > 0) {
          //@step 11
          const matchesDiagonal =
              row > 0 &&
              col > 0 &&
              dp[row][col] === dp[row - 1][col - 1] + (a[row - 1] === b[col - 1] ? 0 : 1);

          if (matchesDiagonal) {
              row -= 1;
              col -= 1;
              continue;
          }

          if (row > 0 && dp[row][col] === dp[row - 1][col] + 1) {
              //@step 13
              row -= 1;
          } else {
              //@step 14
              col -= 1;
          }
      }

      //@step 16
      return dp[a.length][b.length];
  }
  //#endregion edit-distance
  `,
  'javascript',
);

const EDIT_DISTANCE_PY = buildStructuredCode(
  `
  """
  Compute Levenshtein distance and one edit script between two strings.
  Input: source string a and target string b.
  Returns: edit distance.
  """
  //#region edit-distance function open
  def edit_distance(a: str, b: str) -> int:
      //@step 2
      dp = [
          [col if row == 0 else row if col == 0 else 0 for col in range(len(b) + 1)]
          for row in range(len(a) + 1)
      ]

      for row in range(1, len(a) + 1):
          for col in range(1, len(b) + 1):
              replace_cost = dp[row - 1][col - 1] + (0 if a[row - 1] == b[col - 1] else 1)
              delete_cost = dp[row - 1][col] + 1
              insert_cost = dp[row][col - 1] + 1

              //@step 5
              best = min(replace_cost, delete_cost, insert_cost)

              //@step 8
              dp[row][col] = best

      row = len(a)
      col = len(b)

      while row > 0 or col > 0:
          //@step 11
          matches_diagonal = (
              row > 0 and
              col > 0 and
              dp[row][col] == dp[row - 1][col - 1] + (0 if a[row - 1] == b[col - 1] else 1)
          )

          if matches_diagonal:
              row -= 1
              col -= 1
              continue

          if row > 0 and dp[row][col] == dp[row - 1][col] + 1:
              //@step 13
              row -= 1
          else:
              //@step 14
              col -= 1

      //@step 16
      return dp[len(a)][len(b)]
  //#endregion edit-distance
  `,
  'python',
);

const EDIT_DISTANCE_CS = buildStructuredCode(
  `
  using System;

  /// <summary>
  /// Computes Levenshtein distance and one edit script between two strings.
  /// Input: source string a and target string b.
  /// Returns: edit distance.
  /// </summary>
  //#region edit-distance function open
  public static int EditDistance(string a, string b)
  {
      //@step 2
      var dp = new int[a.Length + 1, b.Length + 1];
      for (var row = 0; row <= a.Length; row += 1)
      {
          dp[row, 0] = row;
      }
      for (var col = 0; col <= b.Length; col += 1)
      {
          dp[0, col] = col;
      }

      for (var row = 1; row <= a.Length; row += 1)
      {
          for (var col = 1; col <= b.Length; col += 1)
          {
              var replaceCost = dp[row - 1, col - 1] + (a[row - 1] == b[col - 1] ? 0 : 1);
              var deleteCost = dp[row - 1, col] + 1;
              var insertCost = dp[row, col - 1] + 1;

              //@step 5
              var best = Math.Min(replaceCost, Math.Min(deleteCost, insertCost));

              //@step 8
              dp[row, col] = best;
          }
      }

      var currentRow = a.Length;
      var currentCol = b.Length;

      while (currentRow > 0 || currentCol > 0)
      {
          //@step 11
          var matchesDiagonal =
              currentRow > 0 &&
              currentCol > 0 &&
              dp[currentRow, currentCol] ==
              dp[currentRow - 1, currentCol - 1] + (a[currentRow - 1] == b[currentCol - 1] ? 0 : 1);

          if (matchesDiagonal)
          {
              currentRow -= 1;
              currentCol -= 1;
              continue;
          }

          if (currentRow > 0 && dp[currentRow, currentCol] == dp[currentRow - 1, currentCol] + 1)
          {
              //@step 13
              currentRow -= 1;
          }
          else
          {
              //@step 14
              currentCol -= 1;
          }
      }

      //@step 16
      return dp[a.Length, b.Length];
  }
  //#endregion edit-distance
  `,
  'csharp',
);

const EDIT_DISTANCE_JAVA = buildStructuredCode(
  `
  /**
   * Computes Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  public static int editDistance(String a, String b) {
      //@step 2
      int[][] dp = new int[a.length() + 1][b.length() + 1];
      for (int row = 0; row <= a.length(); row += 1) {
          dp[row][0] = row;
      }
      for (int col = 0; col <= b.length(); col += 1) {
          dp[0][col] = col;
      }

      for (int row = 1; row <= a.length(); row += 1) {
          for (int col = 1; col <= b.length(); col += 1) {
              int replaceCost = dp[row - 1][col - 1] + (a.charAt(row - 1) == b.charAt(col - 1) ? 0 : 1);
              int deleteCost = dp[row - 1][col] + 1;
              int insertCost = dp[row][col - 1] + 1;

              //@step 5
              int best = Math.min(replaceCost, Math.min(deleteCost, insertCost));

              //@step 8
              dp[row][col] = best;
          }
      }

      int currentRow = a.length();
      int currentCol = b.length();

      while (currentRow > 0 || currentCol > 0) {
          //@step 11
          boolean matchesDiagonal =
              currentRow > 0 &&
              currentCol > 0 &&
              dp[currentRow][currentCol] ==
              dp[currentRow - 1][currentCol - 1] + (a.charAt(currentRow - 1) == b.charAt(currentCol - 1) ? 0 : 1);

          if (matchesDiagonal) {
              currentRow -= 1;
              currentCol -= 1;
              continue;
          }

          if (currentRow > 0 && dp[currentRow][currentCol] == dp[currentRow - 1][currentCol] + 1) {
              //@step 13
              currentRow -= 1;
          } else {
              //@step 14
              currentCol -= 1;
          }
      }

      //@step 16
      return dp[a.length()][b.length()];
  }
  //#endregion edit-distance
  `,
  'java',
);

const EDIT_DISTANCE_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <string>
  #include <vector>

  /**
   * Computes Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  int editDistance(const std::string& a, const std::string& b) {
      //@step 2
      std::vector<std::vector<int>> dp(a.size() + 1, std::vector<int>(b.size() + 1, 0));
      for (std::size_t row = 0; row <= a.size(); row += 1) {
          dp[row][0] = static_cast<int>(row);
      }
      for (std::size_t col = 0; col <= b.size(); col += 1) {
          dp[0][col] = static_cast<int>(col);
      }

      for (std::size_t row = 1; row <= a.size(); row += 1) {
          for (std::size_t col = 1; col <= b.size(); col += 1) {
              int replaceCost = dp[row - 1][col - 1] + (a[row - 1] == b[col - 1] ? 0 : 1);
              int deleteCost = dp[row - 1][col] + 1;
              int insertCost = dp[row][col - 1] + 1;

              //@step 5
              int best = std::min(replaceCost, std::min(deleteCost, insertCost));

              //@step 8
              dp[row][col] = best;
          }
      }

      std::size_t currentRow = a.size();
      std::size_t currentCol = b.size();

      while (currentRow > 0 || currentCol > 0) {
          //@step 11
          bool matchesDiagonal =
              currentRow > 0 &&
              currentCol > 0 &&
              dp[currentRow][currentCol] ==
              dp[currentRow - 1][currentCol - 1] + (a[currentRow - 1] == b[currentCol - 1] ? 0 : 1);

          if (matchesDiagonal) {
              currentRow -= 1;
              currentCol -= 1;
              continue;
          }

          if (currentRow > 0 && dp[currentRow][currentCol] == dp[currentRow - 1][currentCol] + 1) {
              //@step 13
              currentRow -= 1;
          } else {
              //@step 14
              currentCol -= 1;
          }
      }

      //@step 16
      return dp[a.size()][b.size()];
  }
  //#endregion edit-distance
  `,
  'cpp',
);

const EDIT_DISTANCE_GO = buildStructuredCode(
  `
  package dp

  /**
   * Compute Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  func EditDistance(a string, b string) int {
      //@step 2
      dp := make([][]int, len(a) + 1)
      for row := range dp {
          dp[row] = make([]int, len(b) + 1)
      }
      for row := 0; row <= len(a); row += 1 {
          dp[row][0] = row
      }
      for col := 0; col <= len(b); col += 1 {
          dp[0][col] = col
      }

      for row := 1; row <= len(a); row += 1 {
          for col := 1; col <= len(b); col += 1 {
              replaceCost := dp[row - 1][col - 1]
              if a[row - 1] != b[col - 1] {
                  replaceCost += 1
              }
              deleteCost := dp[row - 1][col] + 1
              insertCost := dp[row][col - 1] + 1

              //@step 5
              best := minInt(replaceCost, deleteCost, insertCost)

              //@step 8
              dp[row][col] = best
          }
      }

      row := len(a)
      col := len(b)

      for row > 0 || col > 0 {
          //@step 11
          matchesDiagonal := row > 0 && col > 0 && dp[row][col] == dp[row - 1][col - 1] + boolToInt(a[row - 1] != b[col - 1])

          if matchesDiagonal {
              row -= 1
              col -= 1
              continue
          }

          if row > 0 && dp[row][col] == dp[row - 1][col] + 1 {
              //@step 13
              row -= 1
          } else {
              //@step 14
              col -= 1
          }
      }

      //@step 16
      return dp[len(a)][len(b)]
  }
  //#endregion edit-distance

  //#region helpers helper collapsed
  func minInt(values ...int) int {
      best := values[0]
      for _, value := range values[1:] {
          if value < best {
              best = value
          }
      }
      return best
  }

  func boolToInt(value bool) int {
      if value {
          return 1
      }
      return 0
  }
  //#endregion helpers
  `,
  'go',
);

const EDIT_DISTANCE_RUST = buildStructuredCode(
  `
  /**
   * Compute Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  fn edit_distance(a: &str, b: &str) -> usize {
      let a_chars: Vec<char> = a.chars().collect();
      let b_chars: Vec<char> = b.chars().collect();

      //@step 2
      let mut dp = vec![vec![0; b_chars.len() + 1]; a_chars.len() + 1];
      for row in 0..=a_chars.len() {
          dp[row][0] = row;
      }
      for col in 0..=b_chars.len() {
          dp[0][col] = col;
      }

      for row in 1..=a_chars.len() {
          for col in 1..=b_chars.len() {
              let replace_cost = dp[row - 1][col - 1] + usize::from(a_chars[row - 1] != b_chars[col - 1]);
              let delete_cost = dp[row - 1][col] + 1;
              let insert_cost = dp[row][col - 1] + 1;

              //@step 5
              let best = replace_cost.min(delete_cost).min(insert_cost);

              //@step 8
              dp[row][col] = best;
          }
      }

      let mut row = a_chars.len();
      let mut col = b_chars.len();

      while row > 0 || col > 0 {
          //@step 11
          let matches_diagonal =
              row > 0 &&
              col > 0 &&
              dp[row][col] == dp[row - 1][col - 1] + usize::from(a_chars[row - 1] != b_chars[col - 1]);

          if matches_diagonal {
              row -= 1;
              col -= 1;
              continue;
          }

          if row > 0 && dp[row][col] == dp[row - 1][col] + 1 {
              //@step 13
              row -= 1;
          } else {
              //@step 14
              col -= 1;
          }
      }

      //@step 16
      dp[a_chars.len()][b_chars.len()]
  }
  //#endregion edit-distance
  `,
  'rust',
);

const EDIT_DISTANCE_SWIFT = buildStructuredCode(
  `
  /**
   * Compute Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  func editDistance(_ a: String, _ b: String) -> Int {
      let aChars = Array(a)
      let bChars = Array(b)

      //@step 2
      var dp = Array(
          repeating: Array(repeating: 0, count: bChars.count + 1),
          count: aChars.count + 1
      )
      for row in 0...aChars.count {
          dp[row][0] = row
      }
      for col in 0...bChars.count {
          dp[0][col] = col
      }

      for row in 1...aChars.count {
          for col in 1...bChars.count {
              let replaceCost = dp[row - 1][col - 1] + (aChars[row - 1] == bChars[col - 1] ? 0 : 1)
              let deleteCost = dp[row - 1][col] + 1
              let insertCost = dp[row][col - 1] + 1

              //@step 5
              let best = min(replaceCost, deleteCost, insertCost)

              //@step 8
              dp[row][col] = best
          }
      }

      var row = aChars.count
      var col = bChars.count

      while row > 0 || col > 0 {
          //@step 11
          let matchesDiagonal =
              row > 0 &&
              col > 0 &&
              dp[row][col] == dp[row - 1][col - 1] + (aChars[row - 1] == bChars[col - 1] ? 0 : 1)

          if matchesDiagonal {
              row -= 1
              col -= 1
              continue
          }

          if row > 0 && dp[row][col] == dp[row - 1][col] + 1 {
              //@step 13
              row -= 1
          } else {
              //@step 14
              col -= 1
          }
      }

      //@step 16
      return dp[aChars.count][bChars.count]
  }
  //#endregion edit-distance
  `,
  'swift',
);

const EDIT_DISTANCE_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Compute Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  function editDistance(string $a, string $b): int
  {
      $aChars = str_split($a);
      $bChars = str_split($b);

      //@step 2
      $dp = array_fill(0, count($aChars) + 1, array_fill(0, count($bChars) + 1, 0));
      for ($row = 0; $row <= count($aChars); $row += 1) {
          $dp[$row][0] = $row;
      }
      for ($col = 0; $col <= count($bChars); $col += 1) {
          $dp[0][$col] = $col;
      }

      for ($row = 1; $row <= count($aChars); $row += 1) {
          for ($col = 1; $col <= count($bChars); $col += 1) {
              $replaceCost = $dp[$row - 1][$col - 1] + ($aChars[$row - 1] === $bChars[$col - 1] ? 0 : 1);
              $deleteCost = $dp[$row - 1][$col] + 1;
              $insertCost = $dp[$row][$col - 1] + 1;

              //@step 5
              $best = min($replaceCost, $deleteCost, $insertCost);

              //@step 8
              $dp[$row][$col] = $best;
          }
      }

      $row = count($aChars);
      $col = count($bChars);

      while ($row > 0 || $col > 0) {
          //@step 11
          $matchesDiagonal =
              $row > 0 &&
              $col > 0 &&
              $dp[$row][$col] === $dp[$row - 1][$col - 1] + ($aChars[$row - 1] === $bChars[$col - 1] ? 0 : 1);

          if ($matchesDiagonal) {
              $row -= 1;
              $col -= 1;
              continue;
          }

          if ($row > 0 && $dp[$row][$col] === $dp[$row - 1][$col] + 1) {
              //@step 13
              $row -= 1;
          } else {
              //@step 14
              $col -= 1;
          }
      }

      //@step 16
      return $dp[count($aChars)][count($bChars)];
  }
  //#endregion edit-distance
  `,
  'php',
);

const EDIT_DISTANCE_KOTLIN = buildStructuredCode(
  `
  /**
   * Compute Levenshtein distance and one edit script between two strings.
   * Input: source string a and target string b.
   * Returns: edit distance.
   */
  //#region edit-distance function open
  fun editDistance(a: String, b: String): Int {
      //@step 2
      val dp = Array(a.length + 1) { row ->
          IntArray(b.length + 1) { col ->
              when {
                  row == 0 -> col
                  col == 0 -> row
                  else -> 0
              }
          }
      }

      for (row in 1..a.length) {
          for (col in 1..b.length) {
              val replaceCost = dp[row - 1][col - 1] + if (a[row - 1] == b[col - 1]) 0 else 1
              val deleteCost = dp[row - 1][col] + 1
              val insertCost = dp[row][col - 1] + 1

              //@step 5
              val best = minOf(replaceCost, deleteCost, insertCost)

              //@step 8
              dp[row][col] = best
          }
      }

      var row = a.length
      var col = b.length

      while (row > 0 || col > 0) {
          //@step 11
          val matchesDiagonal =
              row > 0 &&
              col > 0 &&
              dp[row][col] == dp[row - 1][col - 1] + if (a[row - 1] == b[col - 1]) 0 else 1

          if (matchesDiagonal) {
              row -= 1
              col -= 1
              continue
          }

          if (row > 0 && dp[row][col] == dp[row - 1][col] + 1) {
              //@step 13
              row -= 1
          } else {
              //@step 14
              col -= 1
          }
      }

      //@step 16
      return dp[a.length][b.length]
  }
  //#endregion edit-distance
  `,
  'kotlin',
);

export const EDIT_DISTANCE_CODE = EDIT_DISTANCE_TS.lines;
export const EDIT_DISTANCE_CODE_REGIONS = EDIT_DISTANCE_TS.regions;
export const EDIT_DISTANCE_CODE_HIGHLIGHT_MAP = EDIT_DISTANCE_TS.highlightMap;
export const EDIT_DISTANCE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: EDIT_DISTANCE_TS.lines,
    regions: EDIT_DISTANCE_TS.regions,
    highlightMap: EDIT_DISTANCE_TS.highlightMap,
    source: EDIT_DISTANCE_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: EDIT_DISTANCE_JS.lines,
    regions: EDIT_DISTANCE_JS.regions,
    highlightMap: EDIT_DISTANCE_JS.highlightMap,
    source: EDIT_DISTANCE_JS.source,
  },
  python: {
    language: 'python',
    lines: EDIT_DISTANCE_PY.lines,
    regions: EDIT_DISTANCE_PY.regions,
    highlightMap: EDIT_DISTANCE_PY.highlightMap,
    source: EDIT_DISTANCE_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: EDIT_DISTANCE_CS.lines,
    regions: EDIT_DISTANCE_CS.regions,
    highlightMap: EDIT_DISTANCE_CS.highlightMap,
    source: EDIT_DISTANCE_CS.source,
  },
  java: {
    language: 'java',
    lines: EDIT_DISTANCE_JAVA.lines,
    regions: EDIT_DISTANCE_JAVA.regions,
    highlightMap: EDIT_DISTANCE_JAVA.highlightMap,
    source: EDIT_DISTANCE_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: EDIT_DISTANCE_CPP.lines,
    regions: EDIT_DISTANCE_CPP.regions,
    highlightMap: EDIT_DISTANCE_CPP.highlightMap,
    source: EDIT_DISTANCE_CPP.source,
  },
  go: {
    language: 'go',
    lines: EDIT_DISTANCE_GO.lines,
    regions: EDIT_DISTANCE_GO.regions,
    highlightMap: EDIT_DISTANCE_GO.highlightMap,
    source: EDIT_DISTANCE_GO.source,
  },
  rust: {
    language: 'rust',
    lines: EDIT_DISTANCE_RUST.lines,
    regions: EDIT_DISTANCE_RUST.regions,
    highlightMap: EDIT_DISTANCE_RUST.highlightMap,
    source: EDIT_DISTANCE_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: EDIT_DISTANCE_SWIFT.lines,
    regions: EDIT_DISTANCE_SWIFT.regions,
    highlightMap: EDIT_DISTANCE_SWIFT.highlightMap,
    source: EDIT_DISTANCE_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: EDIT_DISTANCE_PHP.lines,
    regions: EDIT_DISTANCE_PHP.regions,
    highlightMap: EDIT_DISTANCE_PHP.highlightMap,
    source: EDIT_DISTANCE_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: EDIT_DISTANCE_KOTLIN.lines,
    regions: EDIT_DISTANCE_KOTLIN.regions,
    highlightMap: EDIT_DISTANCE_KOTLIN.highlightMap,
    source: EDIT_DISTANCE_KOTLIN.source,
  },
};
