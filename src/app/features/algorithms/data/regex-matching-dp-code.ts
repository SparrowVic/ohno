import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const REGEX_TS = buildStructuredCode(`
  /**
   * Match a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  function regexMatch(text: string, pattern: string): boolean {
    //@step 2
    const dp = Array.from({ length: text.length + 1 }, () =>
      Array.from({ length: pattern.length + 1 }, () => false),
    );
    dp[0][0] = true;

    for (let col = 2; col <= pattern.length; col += 1) {
      if (pattern[col - 1] === '*') {
        dp[0][col] = dp[0][col - 2];
      }
    }

    for (let row = 1; row <= text.length; row += 1) {
      for (let col = 1; col <= pattern.length; col += 1) {
        //@step 5
        const token = pattern[col - 1];

        if (token === '*') {
          //@step 6
          const zeroOccurrences = dp[row][col - 2];
          const previousToken = pattern[col - 2];
          const consumeOne =
            (previousToken === '.' || previousToken === text[row - 1]) && dp[row - 1][col];
          dp[row][col] = zeroOccurrences || consumeOne;
        } else if (token === '.' || token === text[row - 1]) {
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
      if (col > 0 && pattern[col - 1] === '*') {
        if (dp[row][col - 2]) {
          col -= 2;
        } else {
          row -= 1;
        }
      } else {
        row -= 1;
        col -= 1;
      }
    }

    //@step 10
    return dp[text.length][pattern.length];
  }
  //#endregion regex
`);

const REGEX_PY = buildStructuredCode(
  `
  """
  Match a string against a regular expression with '.' and '*'.
  Input: text and pattern.
  Returns: true when the whole text matches the whole pattern.
  """
  //#region regex function open
  def regex_match(text: str, pattern: str) -> bool:
      //@step 2
      dp = [[False] * (len(pattern) + 1) for _ in range(len(text) + 1)]
      dp[0][0] = True

      for col in range(2, len(pattern) + 1):
          if pattern[col - 1] == "*":
              dp[0][col] = dp[0][col - 2]

      for row in range(1, len(text) + 1):
          for col in range(1, len(pattern) + 1):
              //@step 5
              token = pattern[col - 1]

              if token == "*":
                  //@step 6
                  zero_occurrences = dp[row][col - 2]
                  previous_token = pattern[col - 2]
                  consume_one = (previous_token == "." or previous_token == text[row - 1]) and dp[row - 1][col]
                  dp[row][col] = zero_occurrences or consume_one
              elif token == "." or token == text[row - 1]:
                  //@step 7
                  dp[row][col] = dp[row - 1][col - 1]
              else:
                  //@step 8
                  dp[row][col] = False

      row = len(text)
      col = len(pattern)
      while row > 0 or col > 0:
          //@step 9
          if col > 0 and pattern[col - 1] == "*":
              if dp[row][col - 2]:
                  col -= 2
              else:
                  row -= 1
          else:
              row -= 1
              col -= 1

      //@step 10
      return dp[len(text)][len(pattern)]
  //#endregion regex
  `,
  'python',
);

const REGEX_CS = buildStructuredCode(
  `
  /// <summary>
  /// Matches a string against a regular expression with '.' and '*'.
  /// Input: text and pattern.
  /// Returns: true when the whole text matches the whole pattern.
  /// </summary>
  //#region regex function open
  public static bool RegexMatch(string text, string pattern)
  {
      //@step 2
      var dp = new bool[text.Length + 1, pattern.Length + 1];
      dp[0, 0] = true;

      for (var col = 2; col <= pattern.Length; col += 1)
      {
          if (pattern[col - 1] == '*')
          {
              dp[0, col] = dp[0, col - 2];
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
                  var zeroOccurrences = dp[row, col - 2];
                  var previousToken = pattern[col - 2];
                  var consumeOne = (previousToken == '.' || previousToken == text[row - 1]) && dp[row - 1, col];
                  dp[row, col] = zeroOccurrences || consumeOne;
              }
              else if (token == '.' || token == text[row - 1])
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
          if (currentCol > 0 && pattern[currentCol - 1] == '*')
          {
              if (dp[currentRow, currentCol - 2])
              {
                  currentCol -= 2;
              }
              else
              {
                  currentRow -= 1;
              }
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
  //#endregion regex
  `,
  'csharp',
);

const REGEX_JAVA = buildStructuredCode(
  `
  /**
   * Matches a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  public static boolean regexMatch(String text, String pattern) {
      //@step 2
      boolean[][] dp = new boolean[text.length() + 1][pattern.length() + 1];
      dp[0][0] = true;

      for (int col = 2; col <= pattern.length(); col += 1) {
          if (pattern.charAt(col - 1) == '*') {
              dp[0][col] = dp[0][col - 2];
          }
      }

      for (int row = 1; row <= text.length(); row += 1) {
          for (int col = 1; col <= pattern.length(); col += 1) {
              //@step 5
              char token = pattern.charAt(col - 1);

              if (token == '*') {
                  //@step 6
                  boolean zeroOccurrences = dp[row][col - 2];
                  char previousToken = pattern.charAt(col - 2);
                  boolean consumeOne = (previousToken == '.' || previousToken == text.charAt(row - 1)) && dp[row - 1][col];
                  dp[row][col] = zeroOccurrences || consumeOne;
              } else if (token == '.' || token == text.charAt(row - 1)) {
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
          if (col > 0 && pattern.charAt(col - 1) == '*') {
              if (dp[row][col - 2]) {
                  col -= 2;
              } else {
                  row -= 1;
              }
          } else {
              row -= 1;
              col -= 1;
          }
      }

      //@step 10
      return dp[text.length()][pattern.length()];
  }
  //#endregion regex
  `,
  'java',
);

const REGEX_CPP = buildStructuredCode(
  `
  #include <string>
  #include <vector>

  /**
   * Matches a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  bool regexMatch(const std::string& text, const std::string& pattern) {
      //@step 2
      std::vector<std::vector<bool>> dp(text.size() + 1, std::vector<bool>(pattern.size() + 1, false));
      dp[0][0] = true;

      for (std::size_t col = 2; col <= pattern.size(); col += 1) {
          if (pattern[col - 1] == '*') {
              dp[0][col] = dp[0][col - 2];
          }
      }

      for (std::size_t row = 1; row <= text.size(); row += 1) {
          for (std::size_t col = 1; col <= pattern.size(); col += 1) {
              //@step 5
              char token = pattern[col - 1];

              if (token == '*') {
                  //@step 6
                  bool zeroOccurrences = dp[row][col - 2];
                  char previousToken = pattern[col - 2];
                  bool consumeOne = (previousToken == '.' || previousToken == text[row - 1]) && dp[row - 1][col];
                  dp[row][col] = zeroOccurrences || consumeOne;
              } else if (token == '.' || token == text[row - 1]) {
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
          if (col > 0 && pattern[col - 1] == '*') {
              if (dp[row][col - 2]) {
                  col -= 2;
              } else {
                  row -= 1;
              }
          } else {
              row -= 1;
              col -= 1;
          }
      }

      //@step 10
      return dp[text.size()][pattern.size()];
  }
  //#endregion regex
  `,
  'cpp',
);

export const REGEX_MATCHING_DP_CODE = REGEX_TS.lines;
export const REGEX_MATCHING_DP_CODE_REGIONS = REGEX_TS.regions;
export const REGEX_MATCHING_DP_CODE_HIGHLIGHT_MAP = REGEX_TS.highlightMap;
export const REGEX_MATCHING_DP_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: REGEX_TS.lines, regions: REGEX_TS.regions, highlightMap: REGEX_TS.highlightMap, source: REGEX_TS.source },
  python: { language: 'python', lines: REGEX_PY.lines, regions: REGEX_PY.regions, highlightMap: REGEX_PY.highlightMap, source: REGEX_PY.source },
  csharp: { language: 'csharp', lines: REGEX_CS.lines, regions: REGEX_CS.regions, highlightMap: REGEX_CS.highlightMap, source: REGEX_CS.source },
  java: { language: 'java', lines: REGEX_JAVA.lines, regions: REGEX_JAVA.regions, highlightMap: REGEX_JAVA.highlightMap, source: REGEX_JAVA.source },
  cpp: { language: 'cpp', lines: REGEX_CPP.lines, regions: REGEX_CPP.regions, highlightMap: REGEX_CPP.highlightMap, source: REGEX_CPP.source },
};
