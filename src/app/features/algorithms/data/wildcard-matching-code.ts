import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const WILDCARD_JS = buildStructuredCode(
  `
  /**
   * Match a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  function wildcardMatch(text, pattern) {
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
  `,
  'javascript',
);

const WILDCARD_GO = buildStructuredCode(
  `
  package dp

  /**
   * Matches a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  func WildcardMatch(text string, pattern string) bool {
      //@step 2
      dp := make([][]bool, len(text) + 1)
      for row := 0; row <= len(text); row += 1 {
          dp[row] = make([]bool, len(pattern) + 1)
      }
      dp[0][0] = true

      for col := 1; col <= len(pattern); col += 1 {
          if pattern[col - 1] == '*' {
              dp[0][col] = dp[0][col - 1]
          }
      }

      for row := 1; row <= len(text); row += 1 {
          for col := 1; col <= len(pattern); col += 1 {
              //@step 5
              token := pattern[col - 1]

              if token == '*' {
                  //@step 6
                  dp[row][col] = dp[row][col - 1] || dp[row - 1][col]
              } else if token == '?' || token == text[row - 1] {
                  //@step 7
                  dp[row][col] = dp[row - 1][col - 1]
              } else {
                  //@step 8
                  dp[row][col] = false
              }
          }
      }

      row := len(text)
      col := len(pattern)
      for row > 0 || col > 0 {
          //@step 9
          if col > 0 && pattern[col - 1] == '*' && dp[row][col - 1] {
              col -= 1
          } else if col > 0 && pattern[col - 1] == '*' {
              row -= 1
          } else {
              row -= 1
              col -= 1
          }
      }

      //@step 10
      return dp[len(text)][len(pattern)]
  }
  //#endregion wildcard
  `,
  'go',
);

const WILDCARD_RUST = buildStructuredCode(
  `
  /**
   * Matches a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  fn wildcard_match(text: &str, pattern: &str) -> bool {
      let text_chars: Vec<char> = text.chars().collect();
      let pattern_chars: Vec<char> = pattern.chars().collect();

      //@step 2
      let mut dp = vec![vec![false; pattern_chars.len() + 1]; text_chars.len() + 1];
      dp[0][0] = true;

      for col in 1..=pattern_chars.len() {
          if pattern_chars[col - 1] == '*' {
              dp[0][col] = dp[0][col - 1];
          }
      }

      for row in 1..=text_chars.len() {
          for col in 1..=pattern_chars.len() {
              //@step 5
              let token = pattern_chars[col - 1];

              if token == '*' {
                  //@step 6
                  dp[row][col] = dp[row][col - 1] || dp[row - 1][col];
              } else if token == '?' || token == text_chars[row - 1] {
                  //@step 7
                  dp[row][col] = dp[row - 1][col - 1];
              } else {
                  //@step 8
                  dp[row][col] = false;
              }
          }
      }

      let mut row = text_chars.len();
      let mut col = pattern_chars.len();
      while row > 0 || col > 0 {
          //@step 9
          if col > 0 && pattern_chars[col - 1] == '*' && dp[row][col - 1] {
              col -= 1;
          } else if col > 0 && pattern_chars[col - 1] == '*' {
              row -= 1;
          } else {
              row -= 1;
              col -= 1;
          }
      }

      //@step 10
      dp[text_chars.len()][pattern_chars.len()]
  }
  //#endregion wildcard
  `,
  'rust',
);

const WILDCARD_SWIFT = buildStructuredCode(
  `
  /**
   * Matches a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  func wildcardMatch(_ text: String, _ pattern: String) -> Bool {
      let textChars = Array(text)
      let patternChars = Array(pattern)

      //@step 2
      var dp = Array(
          repeating: Array(repeating: false, count: patternChars.count + 1),
          count: textChars.count + 1,
      )
      dp[0][0] = true

      if patternChars.count > 0 {
          for col in 1...patternChars.count {
              if patternChars[col - 1] == "*" {
                  dp[0][col] = dp[0][col - 1]
              }
          }
      }

      if textChars.count > 0 && patternChars.count > 0 {
          for row in 1...textChars.count {
              for col in 1...patternChars.count {
                  //@step 5
                  let token = patternChars[col - 1]

                  if token == "*" {
                      //@step 6
                      dp[row][col] = dp[row][col - 1] || dp[row - 1][col]
                  } else if token == "?" || token == textChars[row - 1] {
                      //@step 7
                      dp[row][col] = dp[row - 1][col - 1]
                  } else {
                      //@step 8
                      dp[row][col] = false
                  }
              }
          }
      }

      var row = textChars.count
      var col = patternChars.count
      while row > 0 || col > 0 {
          //@step 9
          if col > 0 && patternChars[col - 1] == "*" && dp[row][col - 1] {
              col -= 1
          } else if col > 0 && patternChars[col - 1] == "*" {
              row -= 1
          } else {
              row -= 1
              col -= 1
          }
      }

      //@step 10
      return dp[textChars.count][patternChars.count]
  }
  //#endregion wildcard
  `,
  'swift',
);

const WILDCARD_PHP = buildStructuredCode(
  `
  /**
   * Matches a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  function wildcardMatch(string $text, string $pattern): bool
  {
      //@step 2
      $dp = array_fill(0, strlen($text) + 1, array_fill(0, strlen($pattern) + 1, false));
      $dp[0][0] = true;

      for ($col = 1; $col <= strlen($pattern); $col += 1) {
          if ($pattern[$col - 1] === '*') {
              $dp[0][$col] = $dp[0][$col - 1];
          }
      }

      for ($row = 1; $row <= strlen($text); $row += 1) {
          for ($col = 1; $col <= strlen($pattern); $col += 1) {
              //@step 5
              $token = $pattern[$col - 1];

              if ($token === '*') {
                  //@step 6
                  $dp[$row][$col] = $dp[$row][$col - 1] || $dp[$row - 1][$col];
              } elseif ($token === '?' || $token === $text[$row - 1]) {
                  //@step 7
                  $dp[$row][$col] = $dp[$row - 1][$col - 1];
              } else {
                  //@step 8
                  $dp[$row][$col] = false;
              }
          }
      }

      $row = strlen($text);
      $col = strlen($pattern);
      while ($row > 0 || $col > 0) {
          //@step 9
          if ($col > 0 && $pattern[$col - 1] === '*' && $dp[$row][$col - 1]) {
              $col -= 1;
          } elseif ($col > 0 && $pattern[$col - 1] === '*') {
              $row -= 1;
          } else {
              $row -= 1;
              $col -= 1;
          }
      }

      //@step 10
      return $dp[strlen($text)][strlen($pattern)];
  }
  //#endregion wildcard
  `,
  'php',
);

const WILDCARD_KOTLIN = buildStructuredCode(
  `
  /**
   * Matches a string against a wildcard pattern with '?' and '*'.
   * Input: text and wildcard pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region wildcard function open
  fun wildcardMatch(text: String, pattern: String): Boolean {
      //@step 2
      val dp = Array(text.length + 1) { BooleanArray(pattern.length + 1) }
      dp[0][0] = true

      for (col in 1..pattern.length) {
          if (pattern[col - 1] == '*') {
              dp[0][col] = dp[0][col - 1]
          }
      }

      for (row in 1..text.length) {
          for (col in 1..pattern.length) {
              //@step 5
              val token = pattern[col - 1]

              if (token == '*') {
                  //@step 6
                  dp[row][col] = dp[row][col - 1] || dp[row - 1][col]
              } else if (token == '?' || token == text[row - 1]) {
                  //@step 7
                  dp[row][col] = dp[row - 1][col - 1]
              } else {
                  //@step 8
                  dp[row][col] = false
              }
          }
      }

      var row = text.length
      var col = pattern.length
      while (row > 0 || col > 0) {
          //@step 9
          if (col > 0 && pattern[col - 1] == '*' && dp[row][col - 1]) {
              col -= 1
          } else if (col > 0 && pattern[col - 1] == '*') {
              row -= 1
          } else {
              row -= 1
              col -= 1
          }
      }

      //@step 10
      return dp[text.length][pattern.length]
  }
  //#endregion wildcard
  `,
  'kotlin',
);

export const WILDCARD_MATCHING_CODE = WILDCARD_TS.lines;
export const WILDCARD_MATCHING_CODE_REGIONS = WILDCARD_TS.regions;
export const WILDCARD_MATCHING_CODE_HIGHLIGHT_MAP = WILDCARD_TS.highlightMap;
export const WILDCARD_MATCHING_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: WILDCARD_TS.lines,
    regions: WILDCARD_TS.regions,
    highlightMap: WILDCARD_TS.highlightMap,
    source: WILDCARD_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: WILDCARD_JS.lines,
    regions: WILDCARD_JS.regions,
    highlightMap: WILDCARD_JS.highlightMap,
    source: WILDCARD_JS.source,
  },
  python: {
    language: 'python',
    lines: WILDCARD_PY.lines,
    regions: WILDCARD_PY.regions,
    highlightMap: WILDCARD_PY.highlightMap,
    source: WILDCARD_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: WILDCARD_CS.lines,
    regions: WILDCARD_CS.regions,
    highlightMap: WILDCARD_CS.highlightMap,
    source: WILDCARD_CS.source,
  },
  java: {
    language: 'java',
    lines: WILDCARD_JAVA.lines,
    regions: WILDCARD_JAVA.regions,
    highlightMap: WILDCARD_JAVA.highlightMap,
    source: WILDCARD_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: WILDCARD_CPP.lines,
    regions: WILDCARD_CPP.regions,
    highlightMap: WILDCARD_CPP.highlightMap,
    source: WILDCARD_CPP.source,
  },
  go: {
    language: 'go',
    lines: WILDCARD_GO.lines,
    regions: WILDCARD_GO.regions,
    highlightMap: WILDCARD_GO.highlightMap,
    source: WILDCARD_GO.source,
  },
  rust: {
    language: 'rust',
    lines: WILDCARD_RUST.lines,
    regions: WILDCARD_RUST.regions,
    highlightMap: WILDCARD_RUST.highlightMap,
    source: WILDCARD_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: WILDCARD_SWIFT.lines,
    regions: WILDCARD_SWIFT.regions,
    highlightMap: WILDCARD_SWIFT.highlightMap,
    source: WILDCARD_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: WILDCARD_PHP.lines,
    regions: WILDCARD_PHP.regions,
    highlightMap: WILDCARD_PHP.highlightMap,
    source: WILDCARD_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: WILDCARD_KOTLIN.lines,
    regions: WILDCARD_KOTLIN.regions,
    highlightMap: WILDCARD_KOTLIN.highlightMap,
    source: WILDCARD_KOTLIN.source,
  },
};
