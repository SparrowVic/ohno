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

export const EDIT_DISTANCE_CODE = EDIT_DISTANCE_TS.lines;
export const EDIT_DISTANCE_CODE_REGIONS = EDIT_DISTANCE_TS.regions;
export const EDIT_DISTANCE_CODE_HIGHLIGHT_MAP = EDIT_DISTANCE_TS.highlightMap;
export const EDIT_DISTANCE_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: EDIT_DISTANCE_TS.lines, regions: EDIT_DISTANCE_TS.regions, highlightMap: EDIT_DISTANCE_TS.highlightMap, source: EDIT_DISTANCE_TS.source },
  python: { language: 'python', lines: EDIT_DISTANCE_PY.lines, regions: EDIT_DISTANCE_PY.regions, highlightMap: EDIT_DISTANCE_PY.highlightMap, source: EDIT_DISTANCE_PY.source },
  csharp: { language: 'csharp', lines: EDIT_DISTANCE_CS.lines, regions: EDIT_DISTANCE_CS.regions, highlightMap: EDIT_DISTANCE_CS.highlightMap, source: EDIT_DISTANCE_CS.source },
  java: { language: 'java', lines: EDIT_DISTANCE_JAVA.lines, regions: EDIT_DISTANCE_JAVA.regions, highlightMap: EDIT_DISTANCE_JAVA.highlightMap, source: EDIT_DISTANCE_JAVA.source },
  cpp: { language: 'cpp', lines: EDIT_DISTANCE_CPP.lines, regions: EDIT_DISTANCE_CPP.regions, highlightMap: EDIT_DISTANCE_CPP.highlightMap, source: EDIT_DISTANCE_CPP.source },
};
