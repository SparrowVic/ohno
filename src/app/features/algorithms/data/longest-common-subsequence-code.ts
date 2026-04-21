import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const LCS_TS = buildStructuredCode(`
  /**
   * Compute one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  function lcs(a: string, b: string): string {
    //@step 2
    const dp = Array.from({ length: a.length + 1 }, () =>
      Array.from({ length: b.length + 1 }, () => 0),
    );

    for (let row = 1; row <= a.length; row += 1) {
      for (let col = 1; col <= b.length; col += 1) {
        //@step 5
        const charsMatch = a[row - 1] === b[col - 1];

        if (charsMatch) {
          //@step 6
          dp[row][col] = dp[row - 1][col - 1] + 1;
        } else {
          //@step 8
          dp[row][col] = Math.max(dp[row - 1][col], dp[row][col - 1]);
        }
      }
    }

    const result: string[] = [];
    let row = a.length;
    let col = b.length;

    while (row > 0 && col > 0) {
      //@step 11
      if (a[row - 1] === b[col - 1]) {
        result.push(a[row - 1]);
        row -= 1;
        col -= 1;
        continue;
      }

      if (dp[row - 1][col] >= dp[row][col - 1]) {
        //@step 13
        row -= 1;
      } else {
        //@step 14
        col -= 1;
      }
    }

    //@step 16
    return result.reverse().join('');
  }
  //#endregion lcs
`);

const LCS_JS = buildStructuredCode(
  `
  /**
   * Compute one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  function lcs(a, b) {
      //@step 2
      const dp = Array.from({ length: a.length + 1 }, () => Array.from({ length: b.length + 1 }, () => 0));

      for (let row = 1; row <= a.length; row += 1) {
          for (let col = 1; col <= b.length; col += 1) {
              //@step 5
              const charsMatch = a[row - 1] === b[col - 1];

              if (charsMatch) {
                  //@step 6
                  dp[row][col] = dp[row - 1][col - 1] + 1;
              } else {
                  //@step 8
                  dp[row][col] = Math.max(dp[row - 1][col], dp[row][col - 1]);
              }
          }
      }

      const result = [];
      let row = a.length;
      let col = b.length;

      while (row > 0 && col > 0) {
          //@step 11
          if (a[row - 1] === b[col - 1]) {
              result.push(a[row - 1]);
              row -= 1;
              col -= 1;
              continue;
          }

          if (dp[row - 1][col] >= dp[row][col - 1]) {
              //@step 13
              row -= 1;
          } else {
              //@step 14
              col -= 1;
          }
      }

      //@step 16
      return result.reverse().join('');
  }
  //#endregion lcs
  `,
  'javascript',
);

const LCS_PY = buildStructuredCode(
  `
  """
  Compute one longest common subsequence of two strings.
  Input: strings a and b.
  Returns: an LCS string.
  """
  //#region lcs function open
  def lcs(a: str, b: str) -> str:
      //@step 2
      dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]

      for row in range(1, len(a) + 1):
          for col in range(1, len(b) + 1):
              //@step 5
              chars_match = a[row - 1] == b[col - 1]

              if chars_match:
                  //@step 6
                  dp[row][col] = dp[row - 1][col - 1] + 1
              else:
                  //@step 8
                  dp[row][col] = max(dp[row - 1][col], dp[row][col - 1])

      result: list[str] = []
      row = len(a)
      col = len(b)

      while row > 0 and col > 0:
          //@step 11
          if a[row - 1] == b[col - 1]:
              result.append(a[row - 1])
              row -= 1
              col -= 1
              continue

          if dp[row - 1][col] >= dp[row][col - 1]:
              //@step 13
              row -= 1
          else:
              //@step 14
              col -= 1

      //@step 16
      return "".join(reversed(result))
  //#endregion lcs
  `,
  'python',
);

const LCS_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  /// <summary>
  /// Computes one longest common subsequence of two strings.
  /// Input: strings a and b.
  /// Returns: an LCS string.
  /// </summary>
  //#region lcs function open
  public static string Lcs(string a, string b)
  {
      //@step 2
      var dp = new int[a.Length + 1, b.Length + 1];

      for (var row = 1; row <= a.Length; row += 1)
      {
          for (var col = 1; col <= b.Length; col += 1)
          {
              //@step 5
              var charsMatch = a[row - 1] == b[col - 1];

              if (charsMatch)
              {
                  //@step 6
                  dp[row, col] = dp[row - 1, col - 1] + 1;
              }
              else
              {
                  //@step 8
                  dp[row, col] = Math.Max(dp[row - 1, col], dp[row, col - 1]);
              }
          }
      }

      var result = new List<char>();
      var currentRow = a.Length;
      var currentCol = b.Length;

      while (currentRow > 0 && currentCol > 0)
      {
          //@step 11
          if (a[currentRow - 1] == b[currentCol - 1])
          {
              result.Add(a[currentRow - 1]);
              currentRow -= 1;
              currentCol -= 1;
              continue;
          }

          if (dp[currentRow - 1, currentCol] >= dp[currentRow, currentCol - 1])
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

      result.Reverse();

      //@step 16
      return new string([.. result]);
  }
  //#endregion lcs
  `,
  'csharp',
);

const LCS_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Collections;
  import java.util.List;

  /**
   * Computes one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  public static String lcs(String a, String b) {
      //@step 2
      int[][] dp = new int[a.length() + 1][b.length() + 1];

      for (int row = 1; row <= a.length(); row += 1) {
          for (int col = 1; col <= b.length(); col += 1) {
              //@step 5
              boolean charsMatch = a.charAt(row - 1) == b.charAt(col - 1);

              if (charsMatch) {
                  //@step 6
                  dp[row][col] = dp[row - 1][col - 1] + 1;
              } else {
                  //@step 8
                  dp[row][col] = Math.max(dp[row - 1][col], dp[row][col - 1]);
              }
          }
      }

      List<Character> result = new ArrayList<>();
      int currentRow = a.length();
      int currentCol = b.length();

      while (currentRow > 0 && currentCol > 0) {
          //@step 11
          if (a.charAt(currentRow - 1) == b.charAt(currentCol - 1)) {
              result.add(a.charAt(currentRow - 1));
              currentRow -= 1;
              currentCol -= 1;
              continue;
          }

          if (dp[currentRow - 1][currentCol] >= dp[currentRow][currentCol - 1]) {
              //@step 13
              currentRow -= 1;
          } else {
              //@step 14
              currentCol -= 1;
          }
      }

      Collections.reverse(result);
      StringBuilder builder = new StringBuilder();
      for (char ch : result) {
          builder.append(ch);
      }

      //@step 16
      return builder.toString();
  }
  //#endregion lcs
  `,
  'java',
);

const LCS_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <string>
  #include <vector>

  /**
   * Computes one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  std::string lcs(const std::string& a, const std::string& b) {
      //@step 2
      std::vector<std::vector<int>> dp(a.size() + 1, std::vector<int>(b.size() + 1, 0));

      for (std::size_t row = 1; row <= a.size(); row += 1) {
          for (std::size_t col = 1; col <= b.size(); col += 1) {
              //@step 5
              bool charsMatch = a[row - 1] == b[col - 1];

              if (charsMatch) {
                  //@step 6
                  dp[row][col] = dp[row - 1][col - 1] + 1;
              } else {
                  //@step 8
                  dp[row][col] = std::max(dp[row - 1][col], dp[row][col - 1]);
              }
          }
      }

      std::string result;
      std::size_t currentRow = a.size();
      std::size_t currentCol = b.size();

      while (currentRow > 0 && currentCol > 0) {
          //@step 11
          if (a[currentRow - 1] == b[currentCol - 1]) {
              result.push_back(a[currentRow - 1]);
              currentRow -= 1;
              currentCol -= 1;
              continue;
          }

          if (dp[currentRow - 1][currentCol] >= dp[currentRow][currentCol - 1]) {
              //@step 13
              currentRow -= 1;
          } else {
              //@step 14
              currentCol -= 1;
          }
      }

      std::reverse(result.begin(), result.end());

      //@step 16
      return result;
  }
  //#endregion lcs
  `,
  'cpp',
);

const LCS_GO = buildStructuredCode(
  `
  package dp

  /**
   * Compute one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  func Lcs(a string, b string) string {
      //@step 2
      dp := make([][]int, len(a) + 1)
      for row := range dp {
          dp[row] = make([]int, len(b) + 1)
      }

      for row := 1; row <= len(a); row += 1 {
          for col := 1; col <= len(b); col += 1 {
              //@step 5
              charsMatch := a[row - 1] == b[col - 1]

              if charsMatch {
                  //@step 6
                  dp[row][col] = dp[row - 1][col - 1] + 1
              } else {
                  //@step 8
                  if dp[row - 1][col] >= dp[row][col - 1] {
                      dp[row][col] = dp[row - 1][col]
                  } else {
                      dp[row][col] = dp[row][col - 1]
                  }
              }
          }
      }

      result := make([]byte, 0)
      row := len(a)
      col := len(b)

      for row > 0 && col > 0 {
          //@step 11
          if a[row - 1] == b[col - 1] {
              result = append(result, a[row - 1])
              row -= 1
              col -= 1
              continue
          }

          if dp[row - 1][col] >= dp[row][col - 1] {
              //@step 13
              row -= 1
          } else {
              //@step 14
              col -= 1
          }
      }

      for left, right := 0, len(result) - 1; left < right; left, right = left + 1, right - 1 {
          result[left], result[right] = result[right], result[left]
      }

      //@step 16
      return string(result)
  }
  //#endregion lcs
  `,
  'go',
);

const LCS_RUST = buildStructuredCode(
  `
  /**
   * Compute one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  fn lcs(a: &str, b: &str) -> String {
      let a_chars: Vec<char> = a.chars().collect();
      let b_chars: Vec<char> = b.chars().collect();

      //@step 2
      let mut dp = vec![vec![0; b_chars.len() + 1]; a_chars.len() + 1];

      for row in 1..=a_chars.len() {
          for col in 1..=b_chars.len() {
              //@step 5
              let chars_match = a_chars[row - 1] == b_chars[col - 1];

              if chars_match {
                  //@step 6
                  dp[row][col] = dp[row - 1][col - 1] + 1;
              } else {
                  //@step 8
                  dp[row][col] = dp[row - 1][col].max(dp[row][col - 1]);
              }
          }
      }

      let mut result = Vec::new();
      let mut row = a_chars.len();
      let mut col = b_chars.len();

      while row > 0 && col > 0 {
          //@step 11
          if a_chars[row - 1] == b_chars[col - 1] {
              result.push(a_chars[row - 1]);
              row -= 1;
              col -= 1;
              continue;
          }

          if dp[row - 1][col] >= dp[row][col - 1] {
              //@step 13
              row -= 1;
          } else {
              //@step 14
              col -= 1;
          }
      }

      result.reverse();

      //@step 16
      result.into_iter().collect()
  }
  //#endregion lcs
  `,
  'rust',
);

const LCS_SWIFT = buildStructuredCode(
  `
  /**
   * Compute one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  func lcs(_ a: String, _ b: String) -> String {
      let aChars = Array(a)
      let bChars = Array(b)

      //@step 2
      var dp = Array(
          repeating: Array(repeating: 0, count: bChars.count + 1),
          count: aChars.count + 1
      )

      for row in 1...aChars.count {
          for col in 1...bChars.count {
              //@step 5
              let charsMatch = aChars[row - 1] == bChars[col - 1]

              if charsMatch {
                  //@step 6
                  dp[row][col] = dp[row - 1][col - 1] + 1
              } else {
                  //@step 8
                  dp[row][col] = max(dp[row - 1][col], dp[row][col - 1])
              }
          }
      }

      var result: [Character] = []
      var row = aChars.count
      var col = bChars.count

      while row > 0 && col > 0 {
          //@step 11
          if aChars[row - 1] == bChars[col - 1] {
              result.append(aChars[row - 1])
              row -= 1
              col -= 1
              continue
          }

          if dp[row - 1][col] >= dp[row][col - 1] {
              //@step 13
              row -= 1
          } else {
              //@step 14
              col -= 1
          }
      }

      //@step 16
      return String(result.reversed())
  }
  //#endregion lcs
  `,
  'swift',
);

const LCS_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Compute one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  function lcs(string $a, string $b): string
  {
      $aChars = str_split($a);
      $bChars = str_split($b);

      //@step 2
      $dp = array_fill(0, count($aChars) + 1, array_fill(0, count($bChars) + 1, 0));

      for ($row = 1; $row <= count($aChars); $row += 1) {
          for ($col = 1; $col <= count($bChars); $col += 1) {
              //@step 5
              $charsMatch = $aChars[$row - 1] === $bChars[$col - 1];

              if ($charsMatch) {
                  //@step 6
                  $dp[$row][$col] = $dp[$row - 1][$col - 1] + 1;
              } else {
                  //@step 8
                  $dp[$row][$col] = max($dp[$row - 1][$col], $dp[$row][$col - 1]);
              }
          }
      }

      $result = [];
      $row = count($aChars);
      $col = count($bChars);

      while ($row > 0 && $col > 0) {
          //@step 11
          if ($aChars[$row - 1] === $bChars[$col - 1]) {
              $result[] = $aChars[$row - 1];
              $row -= 1;
              $col -= 1;
              continue;
          }

          if ($dp[$row - 1][$col] >= $dp[$row][$col - 1]) {
              //@step 13
              $row -= 1;
          } else {
              //@step 14
              $col -= 1;
          }
      }

      //@step 16
      return implode('', array_reverse($result));
  }
  //#endregion lcs
  `,
  'php',
);

const LCS_KOTLIN = buildStructuredCode(
  `
  /**
   * Compute one longest common subsequence of two strings.
   * Input: strings a and b.
   * Returns: an LCS string.
   */
  //#region lcs function open
  fun lcs(a: String, b: String): String {
      //@step 2
      val dp = Array(a.length + 1) { IntArray(b.length + 1) }

      for (row in 1..a.length) {
          for (col in 1..b.length) {
              //@step 5
              val charsMatch = a[row - 1] == b[col - 1]

              if (charsMatch) {
                  //@step 6
                  dp[row][col] = dp[row - 1][col - 1] + 1
              } else {
                  //@step 8
                  dp[row][col] = maxOf(dp[row - 1][col], dp[row][col - 1])
              }
          }
      }

      val result = mutableListOf<Char>()
      var row = a.length
      var col = b.length

      while (row > 0 && col > 0) {
          //@step 11
          if (a[row - 1] == b[col - 1]) {
              result += a[row - 1]
              row -= 1
              col -= 1
              continue
          }

          if (dp[row - 1][col] >= dp[row][col - 1]) {
              //@step 13
              row -= 1
          } else {
              //@step 14
              col -= 1
          }
      }

      //@step 16
      return result.asReversed().joinToString("")
  }
  //#endregion lcs
  `,
  'kotlin',
);

export const LONGEST_COMMON_SUBSEQUENCE_CODE = LCS_TS.lines;
export const LONGEST_COMMON_SUBSEQUENCE_CODE_REGIONS = LCS_TS.regions;
export const LONGEST_COMMON_SUBSEQUENCE_CODE_HIGHLIGHT_MAP = LCS_TS.highlightMap;
export const LONGEST_COMMON_SUBSEQUENCE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: LCS_TS.lines,
    regions: LCS_TS.regions,
    highlightMap: LCS_TS.highlightMap,
    source: LCS_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: LCS_JS.lines,
    regions: LCS_JS.regions,
    highlightMap: LCS_JS.highlightMap,
    source: LCS_JS.source,
  },
  python: {
    language: 'python',
    lines: LCS_PY.lines,
    regions: LCS_PY.regions,
    highlightMap: LCS_PY.highlightMap,
    source: LCS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: LCS_CS.lines,
    regions: LCS_CS.regions,
    highlightMap: LCS_CS.highlightMap,
    source: LCS_CS.source,
  },
  java: {
    language: 'java',
    lines: LCS_JAVA.lines,
    regions: LCS_JAVA.regions,
    highlightMap: LCS_JAVA.highlightMap,
    source: LCS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: LCS_CPP.lines,
    regions: LCS_CPP.regions,
    highlightMap: LCS_CPP.highlightMap,
    source: LCS_CPP.source,
  },
  go: {
    language: 'go',
    lines: LCS_GO.lines,
    regions: LCS_GO.regions,
    highlightMap: LCS_GO.highlightMap,
    source: LCS_GO.source,
  },
  rust: {
    language: 'rust',
    lines: LCS_RUST.lines,
    regions: LCS_RUST.regions,
    highlightMap: LCS_RUST.highlightMap,
    source: LCS_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: LCS_SWIFT.lines,
    regions: LCS_SWIFT.regions,
    highlightMap: LCS_SWIFT.highlightMap,
    source: LCS_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: LCS_PHP.lines,
    regions: LCS_PHP.regions,
    highlightMap: LCS_PHP.highlightMap,
    source: LCS_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: LCS_KOTLIN.lines,
    regions: LCS_KOTLIN.regions,
    highlightMap: LCS_KOTLIN.highlightMap,
    source: LCS_KOTLIN.source,
  },
};
