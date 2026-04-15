import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const WILDCARD_TS = buildStructuredCode(`
  /**
   * Match a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  function wildcardMatch(text: string, pattern: string): boolean {
    //@step 2
    const dp = Array.from({ length: text.length + 1 }, () =>
      Array.from({ length: pattern.length + 1 }, () => false),
    );
    dp[0][0] = true;

    for (let col = 1; col <= pattern.length; col += 1) {
      if (pattern[col - 1] === '*') {
        dp[0][col] = dp[0][col - 1];
      }
    }

    for (let row = 1; row <= text.length; row += 1) {
      for (let col = 1; col <= pattern.length; col += 1) {
        //@step 5
        const token = pattern[col - 1];

        if (token === '*') {
          //@step 6
          dp[row][col] = dp[row][col - 1] || dp[row - 1][col];
        } else if (token === '?' || token === text[row - 1]) {
          //@step 7
          dp[row][col] = dp[row - 1][col - 1];
        } else {
          //@step 8
          dp[row][col] = false;
        }
      }
    }

    let row = text.length;
    let col = pattern.length;
    while (row > 0 || col > 0) {
      //@step 9
      if (col > 0 && pattern[col - 1] === '*' && dp[row][col - 1]) {
        col -= 1;
      } else if (col > 0 && pattern[col - 1] === '*') {
        row -= 1;
      } else {
        row -= 1;
        col -= 1;
      }
    }

    //@step 10
    return dp[text.length][pattern.length];
  }
  //#endregion wildcard
`);

const WILDCARD_PY = buildStructuredCode(
  `
  """
  Match a string against a wildcard pattern with '?' and '*'.
  Input: text and wildcard pattern.
  Returns: true when the whole text matches the whole pattern.
  """
  //#region wildcard function open
  def wildcard_match(text: str, pattern: str) -> bool:
      //@step 2
      dp = [[False] * (len(pattern) + 1) for _ in range(len(text) + 1)]
      dp[0][0] = True

      for col in range(1, len(pattern) + 1):
          if pattern[col - 1] == "*":
              dp[0][col] = dp[0][col - 1]

      for row in range(1, len(text) + 1):
          for col in range(1, len(pattern) + 1):
              //@step 5
              token = pattern[col - 1]

              if token == "*":
                  //@step 6
                  dp[row][col] = dp[row][col - 1] or dp[row - 1][col]
              elif token == "?" or token == text[row - 1]:
                  //@step 7
                  dp[row][col] = dp[row - 1][col - 1]
              else:
                  //@step 8
                  dp[row][col] = False

      row = len(text)
      col = len(pattern)
      while row > 0 or col > 0:
          //@step 9
          if col > 0 and pattern[col - 1] == "*" and dp[row][col - 1]:
              col -= 1
          elif col > 0 and pattern[col - 1] == "*":
              row -= 1
          else:
              row -= 1
              col -= 1

      //@step 10
      return dp[len(text)][len(pattern)]
  //#endregion wildcard
  `,
  'python',
);

const WILDCARD_CS = buildStructuredCode(
  `
  /// <summary>
  /// Matches a string against a wildcard pattern with '?' and '*'.
  /// Input: text and wildcard pattern.
  /// Returns: true when the whole text matches the whole pattern.
  /// </summary>
  //#region wildcard function open
  public static bool WildcardMatch(string text, string pattern)
  {
      //@step 2
      var dp = new bool[text.Length + 1, pattern.Length + 1];
      dp[0, 0] = true;

      for (var col = 1; col <= pattern.Length; col += 1)
      {
          if (pattern[col - 1] == '*')
          {
              dp[0, col] = dp[0, col - 1];
          }
      }

      for (var row = 1; row <= text.Length; row += 1)
      {
          for (var col = 1; col <= pattern.Length; col += 1)
          {
              //@step 5
              var token = pattern[col - 1];

              if (token == '*')
              {
                  //@step 6
                  dp[row, col] = dp[row, col - 1] || dp[row - 1, col];
              }
              else if (token == '?' || token == text[row - 1])
              {
                  //@step 7
                  dp[row, col] = dp[row - 1, col - 1];
              }
              else
              {
                  //@step 8
                  dp[row, col] = false;
              }
          }
      }

      var currentRow = text.Length;
      var currentCol = pattern.Length;
      while (currentRow > 0 || currentCol > 0)
      {
          //@step 9
          if (currentCol > 0 && pattern[currentCol - 1] == '*' && dp[currentRow, currentCol - 1])
          {
              currentCol -= 1;
          }
          else if (currentCol > 0 && pattern[currentCol - 1] == '*')
          {
              currentRow -= 1;
          }
          else
          {
              currentRow -= 1;
              currentCol -= 1;
          }
      }

      //@step 10
      return dp[text.Length, pattern.Length];
  }
  //#endregion wildcard
  `,
  'csharp',
);

const WILDCARD_JAVA = buildStructuredCode(
  `
  /**
   * Matches a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  public static boolean wildcardMatch(String text, String pattern) {
      //@step 2
      boolean[][] dp = new boolean[text.length() + 1][pattern.length() + 1];
      dp[0][0] = true;

      for (int col = 1; col <= pattern.length(); col += 1) {
          if (pattern.charAt(col - 1) == '*') {
              dp[0][col] = dp[0][col - 1];
          }
      }

      for (int row = 1; row <= text.length(); row += 1) {
          for (int col = 1; col <= pattern.length(); col += 1) {
              //@step 5
              char token = pattern.charAt(col - 1);

              if (token == '*') {
                  //@step 6
                  dp[row][col] = dp[row][col - 1] || dp[row - 1][col];
              } else if (token == '?' || token == text.charAt(row - 1)) {
                  //@step 7
                  dp[row][col] = dp[row - 1][col - 1];
              } else {
                  //@step 8
                  dp[row][col] = false;
              }
          }
      }

      int row = text.length();
      int col = pattern.length();
      while (row > 0 || col > 0) {
          //@step 9
          if (col > 0 && pattern.charAt(col - 1) == '*' && dp[row][col - 1]) {
              col -= 1;
          } else if (col > 0 && pattern.charAt(col - 1) == '*') {
              row -= 1;
          } else {
              row -= 1;
              col -= 1;
          }
      }

      //@step 10
      return dp[text.length()][pattern.length()];
  }
  //#endregion wildcard
  `,
  'java',
);

const WILDCARD_CPP = buildStructuredCode(
  `
  #include <string>
  #include <vector>

  /**
   * Matches a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  bool wildcardMatch(const std::string& text, const std::string& pattern) {
      //@step 2
      std::vector<std::vector<bool>> dp(text.size() + 1, std::vector<bool>(pattern.size() + 1, false));
      dp[0][0] = true;

      for (std::size_t col = 1; col <= pattern.size(); col += 1) {
          if (pattern[col - 1] == '*') {
              dp[0][col] = dp[0][col - 1];
          }
      }

      for (std::size_t row = 1; row <= text.size(); row += 1) {
          for (std::size_t col = 1; col <= pattern.size(); col += 1) {
              //@step 5
              char token = pattern[col - 1];

              if (token == '*') {
                  //@step 6
                  dp[row][col] = dp[row][col - 1] || dp[row - 1][col];
              } else if (token == '?' || token == text[row - 1]) {
                  //@step 7
                  dp[row][col] = dp[row - 1][col - 1];
              } else {
                  //@step 8
                  dp[row][col] = false;
              }
          }
      }

      std::size_t row = text.size();
      std::size_t col = pattern.size();
      while (row > 0 || col > 0) {
          //@step 9
          if (col > 0 && pattern[col - 1] == '*' && dp[row][col - 1]) {
              col -= 1;
          } else if (col > 0 && pattern[col - 1] == '*') {
              row -= 1;
          } else {
              row -= 1;
              col -= 1;
          }
      }

      //@step 10
      return dp[text.size()][pattern.size()];
  }
  //#endregion wildcard
  `,
  'cpp',
);

export const WILDCARD_MATCHING_CODE = WILDCARD_TS.lines;
export const WILDCARD_MATCHING_CODE_REGIONS = WILDCARD_TS.regions;
export const WILDCARD_MATCHING_CODE_HIGHLIGHT_MAP = WILDCARD_TS.highlightMap;
export const WILDCARD_MATCHING_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: WILDCARD_TS.lines, regions: WILDCARD_TS.regions, highlightMap: WILDCARD_TS.highlightMap, source: WILDCARD_TS.source },
  python: { language: 'python', lines: WILDCARD_PY.lines, regions: WILDCARD_PY.regions, highlightMap: WILDCARD_PY.highlightMap, source: WILDCARD_PY.source },
  csharp: { language: 'csharp', lines: WILDCARD_CS.lines, regions: WILDCARD_CS.regions, highlightMap: WILDCARD_CS.highlightMap, source: WILDCARD_CS.source },
  java: { language: 'java', lines: WILDCARD_JAVA.lines, regions: WILDCARD_JAVA.regions, highlightMap: WILDCARD_JAVA.highlightMap, source: WILDCARD_JAVA.source },
  cpp: { language: 'cpp', lines: WILDCARD_CPP.lines, regions: WILDCARD_CPP.regions, highlightMap: WILDCARD_CPP.highlightMap, source: WILDCARD_CPP.source },
};
