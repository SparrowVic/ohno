import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const REGEX_JS = buildStructuredCode(
  `
  /**
   * Match a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  function regexMatch(text, pattern) {
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
  `,
  'javascript',
);

const REGEX_GO = buildStructuredCode(
  `
  package dp

  /**
   * Matches a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  func RegexMatch(text string, pattern string) bool {
      //@step 2
      dp := make([][]bool, len(text) + 1)
      for row := 0; row <= len(text); row += 1 {
          dp[row] = make([]bool, len(pattern) + 1)
      }
      dp[0][0] = true

      for col := 2; col <= len(pattern); col += 1 {
          if pattern[col - 1] == '*' {
              dp[0][col] = dp[0][col - 2]
          }
      }

      for row := 1; row <= len(text); row += 1 {
          for col := 1; col <= len(pattern); col += 1 {
              //@step 5
              token := pattern[col - 1]

              if token == '*' {
                  //@step 6
                  zeroOccurrences := dp[row][col - 2]
                  previousToken := pattern[col - 2]
                  consumeOne := (previousToken == '.' || previousToken == text[row - 1]) && dp[row - 1][col]
                  dp[row][col] = zeroOccurrences || consumeOne
              } else if token == '.' || token == text[row - 1] {
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
          if col > 0 && pattern[col - 1] == '*' {
              if dp[row][col - 2] {
                  col -= 2
              } else {
                  row -= 1
              }
          } else {
              row -= 1
              col -= 1
          }
      }

      //@step 10
      return dp[len(text)][len(pattern)]
  }
  //#endregion regex
  `,
  'go',
);

const REGEX_RUST = buildStructuredCode(
  `
  /**
   * Matches a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  fn regex_match(text: &str, pattern: &str) -> bool {
      let text_chars: Vec<char> = text.chars().collect();
      let pattern_chars: Vec<char> = pattern.chars().collect();

      //@step 2
      let mut dp = vec![vec![false; pattern_chars.len() + 1]; text_chars.len() + 1];
      dp[0][0] = true;

      for col in 2..=pattern_chars.len() {
          if pattern_chars[col - 1] == '*' {
              dp[0][col] = dp[0][col - 2];
          }
      }

      for row in 1..=text_chars.len() {
          for col in 1..=pattern_chars.len() {
              //@step 5
              let token = pattern_chars[col - 1];

              if token == '*' {
                  //@step 6
                  let zero_occurrences = dp[row][col - 2];
                  let previous_token = pattern_chars[col - 2];
                  let consume_one =
                      (previous_token == '.' || previous_token == text_chars[row - 1]) && dp[row - 1][col];
                  dp[row][col] = zero_occurrences || consume_one;
              } else if token == '.' || token == text_chars[row - 1] {
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
          if col > 0 && pattern_chars[col - 1] == '*' {
              if dp[row][col - 2] {
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
      dp[text_chars.len()][pattern_chars.len()]
  }
  //#endregion regex
  `,
  'rust',
);

const REGEX_SWIFT = buildStructuredCode(
  `
  /**
   * Matches a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  func regexMatch(_ text: String, _ pattern: String) -> Bool {
      let textChars = Array(text)
      let patternChars = Array(pattern)

      //@step 2
      var dp = Array(
          repeating: Array(repeating: false, count: patternChars.count + 1),
          count: textChars.count + 1,
      )
      dp[0][0] = true

      for col in 2...patternChars.count {
          if patternChars[col - 1] == "*" {
              dp[0][col] = dp[0][col - 2]
          }
      }

      for row in 1...textChars.count {
          for col in 1...patternChars.count {
              //@step 5
              let token = patternChars[col - 1]

              if token == "*" {
                  //@step 6
                  let zeroOccurrences = dp[row][col - 2]
                  let previousToken = patternChars[col - 2]
                  let consumeOne =
                      (previousToken == "." || previousToken == textChars[row - 1]) && dp[row - 1][col]
                  dp[row][col] = zeroOccurrences || consumeOne
              } else if token == "." || token == textChars[row - 1] {
                  //@step 7
                  dp[row][col] = dp[row - 1][col - 1]
              } else {
                  //@step 8
                  dp[row][col] = false
              }
          }
      }

      var row = textChars.count
      var col = patternChars.count
      while row > 0 || col > 0 {
          //@step 9
          if col > 0 && patternChars[col - 1] == "*" {
              if dp[row][col - 2] {
                  col -= 2
              } else {
                  row -= 1
              }
          } else {
              row -= 1
              col -= 1
          }
      }

      //@step 10
      return dp[textChars.count][patternChars.count]
  }
  //#endregion regex
  `,
  'swift',
);

const REGEX_PHP = buildStructuredCode(
  `
  /**
   * Matches a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  function regexMatch(string $text, string $pattern): bool
  {
      //@step 2
      $dp = array_fill(0, strlen($text) + 1, array_fill(0, strlen($pattern) + 1, false));
      $dp[0][0] = true;

      for ($col = 2; $col <= strlen($pattern); $col += 1) {
          if ($pattern[$col - 1] === '*') {
              $dp[0][$col] = $dp[0][$col - 2];
          }
      }

      for ($row = 1; $row <= strlen($text); $row += 1) {
          for ($col = 1; $col <= strlen($pattern); $col += 1) {
              //@step 5
              $token = $pattern[$col - 1];

              if ($token === '*') {
                  //@step 6
                  $zeroOccurrences = $dp[$row][$col - 2];
                  $previousToken = $pattern[$col - 2];
                  $consumeOne =
                      ($previousToken === '.' || $previousToken === $text[$row - 1]) && $dp[$row - 1][$col];
                  $dp[$row][$col] = $zeroOccurrences || $consumeOne;
              } elseif ($token === '.' || $token === $text[$row - 1]) {
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
          if ($col > 0 && $pattern[$col - 1] === '*') {
              if ($dp[$row][$col - 2]) {
                  $col -= 2;
              } else {
                  $row -= 1;
              }
          } else {
              $row -= 1;
              $col -= 1;
          }
      }

      //@step 10
      return $dp[strlen($text)][strlen($pattern)];
  }
  //#endregion regex
  `,
  'php',
);

const REGEX_KOTLIN = buildStructuredCode(
  `
  /**
   * Matches a string against a regular expression with '.' and '*'.
   * Input: text and pattern.
   * Returns: true when the whole text matches the whole pattern.
   */
  //#region regex function open
  fun regexMatch(text: String, pattern: String): Boolean {
      //@step 2
      val dp = Array(text.length + 1) { BooleanArray(pattern.length + 1) }
      dp[0][0] = true

      for (col in 2..pattern.length) {
          if (pattern[col - 1] == '*') {
              dp[0][col] = dp[0][col - 2]
          }
      }

      for (row in 1..text.length) {
          for (col in 1..pattern.length) {
              //@step 5
              val token = pattern[col - 1]

              if (token == '*') {
                  //@step 6
                  val zeroOccurrences = dp[row][col - 2]
                  val previousToken = pattern[col - 2]
                  val consumeOne =
                      (previousToken == '.' || previousToken == text[row - 1]) && dp[row - 1][col]
                  dp[row][col] = zeroOccurrences || consumeOne
              } else if (token == '.' || token == text[row - 1]) {
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
          if (col > 0 && pattern[col - 1] == '*') {
              if (dp[row][col - 2]) {
                  col -= 2
              } else {
                  row -= 1
              }
          } else {
              row -= 1
              col -= 1
          }
      }

      //@step 10
      return dp[text.length][pattern.length]
  }
  //#endregion regex
  `,
  'kotlin',
);

export const REGEX_MATCHING_DP_CODE = REGEX_TS.lines;
export const REGEX_MATCHING_DP_CODE_REGIONS = REGEX_TS.regions;
export const REGEX_MATCHING_DP_CODE_HIGHLIGHT_MAP = REGEX_TS.highlightMap;
export const REGEX_MATCHING_DP_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: REGEX_TS.lines,
    regions: REGEX_TS.regions,
    highlightMap: REGEX_TS.highlightMap,
    source: REGEX_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: REGEX_JS.lines,
    regions: REGEX_JS.regions,
    highlightMap: REGEX_JS.highlightMap,
    source: REGEX_JS.source,
  },
  python: {
    language: 'python',
    lines: REGEX_PY.lines,
    regions: REGEX_PY.regions,
    highlightMap: REGEX_PY.highlightMap,
    source: REGEX_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: REGEX_CS.lines,
    regions: REGEX_CS.regions,
    highlightMap: REGEX_CS.highlightMap,
    source: REGEX_CS.source,
  },
  java: {
    language: 'java',
    lines: REGEX_JAVA.lines,
    regions: REGEX_JAVA.regions,
    highlightMap: REGEX_JAVA.highlightMap,
    source: REGEX_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: REGEX_CPP.lines,
    regions: REGEX_CPP.regions,
    highlightMap: REGEX_CPP.highlightMap,
    source: REGEX_CPP.source,
  },
  go: {
    language: 'go',
    lines: REGEX_GO.lines,
    regions: REGEX_GO.regions,
    highlightMap: REGEX_GO.highlightMap,
    source: REGEX_GO.source,
  },
  rust: {
    language: 'rust',
    lines: REGEX_RUST.lines,
    regions: REGEX_RUST.regions,
    highlightMap: REGEX_RUST.highlightMap,
    source: REGEX_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: REGEX_SWIFT.lines,
    regions: REGEX_SWIFT.regions,
    highlightMap: REGEX_SWIFT.highlightMap,
    source: REGEX_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: REGEX_PHP.lines,
    regions: REGEX_PHP.regions,
    highlightMap: REGEX_PHP.highlightMap,
    source: REGEX_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: REGEX_KOTLIN.lines,
    regions: REGEX_KOTLIN.regions,
    highlightMap: REGEX_KOTLIN.highlightMap,
    source: REGEX_KOTLIN.source,
  },
};
