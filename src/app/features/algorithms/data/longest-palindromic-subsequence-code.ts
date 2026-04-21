import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const LPS_TS = buildStructuredCode(`
  /**
   * Compute one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  function longestPalSubseq(source: string): string {
    const length = source.length;

    //@step 2
    const dp = Array.from({ length }, (_, row) =>
      Array.from({ length }, (_, col) => (row === col ? 1 : 0)),
    );

    for (let span = 2; span <= length; span += 1) {
      for (let left = 0; left + span - 1 < length; left += 1) {
        const right = left + span - 1;

        //@step 5
        const charsMatch = source[left] === source[right];

        if (charsMatch) {
          //@step 6
          dp[left][right] = span === 2 ? 2 : dp[left + 1][right - 1] + 2;
        } else {
          //@step 8
          dp[left][right] = Math.max(dp[left + 1][right], dp[left][right - 1]);
        }
      }
    }

    const prefix: string[] = [];
    const suffix: string[] = [];
    let left = 0;
    let right = length - 1;

    while (left <= right) {
      //@step 11
      if (left === right) {
        prefix.push(source[left]);
        break;
      }

      if (
        source[left] === source[right] &&
        dp[left][right] === (right - left === 1 ? 2 : dp[left + 1][right - 1] + 2)
      ) {
        //@step 12
        prefix.push(source[left]);
        suffix.push(source[right]);
        left += 1;
        right -= 1;
      } else if (dp[left + 1][right] >= dp[left][right - 1]) {
        //@step 13
        left += 1;
      } else {
        //@step 13
        right -= 1;
      }
    }

    //@step 14
    return prefix.join('') + suffix.reverse().join('');
  }
  //#endregion lps
`);

const LPS_PY = buildStructuredCode(
  `
  """
  Compute one longest palindromic subsequence of a string.
  Input: source string.
  Returns: an LPS string.
  """
  //#region lps function open
  def longest_pal_subseq(source: str) -> str:
      length = len(source)

      //@step 2
      dp = [[1 if row == col else 0 for col in range(length)] for row in range(length)]

      for span in range(2, length + 1):
          for left in range(length - span + 1):
              right = left + span - 1

              //@step 5
              chars_match = source[left] == source[right]

              if chars_match:
                  //@step 6
                  dp[left][right] = 2 if span == 2 else dp[left + 1][right - 1] + 2
              else:
                  //@step 8
                  dp[left][right] = max(dp[left + 1][right], dp[left][right - 1])

      prefix: list[str] = []
      suffix: list[str] = []
      left = 0
      right = length - 1

      while left <= right:
          //@step 11
          if left == right:
              prefix.append(source[left])
              break

          if (
              source[left] == source[right] and
              dp[left][right] == (2 if right - left == 1 else dp[left + 1][right - 1] + 2)
          ):
              //@step 12
              prefix.append(source[left])
              suffix.append(source[right])
              left += 1
              right -= 1
          elif dp[left + 1][right] >= dp[left][right - 1]:
              //@step 13
              left += 1
          else:
              //@step 13
              right -= 1

      //@step 14
      return "".join(prefix) + "".join(reversed(suffix))
  //#endregion lps
  `,
  'python',
);

const LPS_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  /// <summary>
  /// Computes one longest palindromic subsequence of a string.
  /// Input: source string.
  /// Returns: an LPS string.
  /// </summary>
  //#region lps function open
  public static string LongestPalSubseq(string source)
  {
      var length = source.Length;

      //@step 2
      var dp = new int[length, length];
      for (var index = 0; index < length; index += 1)
      {
          dp[index, index] = 1;
      }

      for (var span = 2; span <= length; span += 1)
      {
          for (var left = 0; left + span - 1 < length; left += 1)
          {
              var right = left + span - 1;

              //@step 5
              var charsMatch = source[left] == source[right];

              if (charsMatch)
              {
                  //@step 6
                  dp[left, right] = span == 2 ? 2 : dp[left + 1, right - 1] + 2;
              }
              else
              {
                  //@step 8
                  dp[left, right] = Math.Max(dp[left + 1, right], dp[left, right - 1]);
              }
          }
      }

      var prefix = new List<char>();
      var suffix = new List<char>();
      var currentLeft = 0;
      var currentRight = length - 1;

      while (currentLeft <= currentRight)
      {
          //@step 11
          if (currentLeft == currentRight)
          {
              prefix.Add(source[currentLeft]);
              break;
          }

          if (
              source[currentLeft] == source[currentRight] &&
              dp[currentLeft, currentRight] ==
              (currentRight - currentLeft == 1 ? 2 : dp[currentLeft + 1, currentRight - 1] + 2)
          )
          {
              //@step 12
              prefix.Add(source[currentLeft]);
              suffix.Add(source[currentRight]);
              currentLeft += 1;
              currentRight -= 1;
          }
          else if (dp[currentLeft + 1, currentRight] >= dp[currentLeft, currentRight - 1])
          {
              //@step 13
              currentLeft += 1;
          }
          else
          {
              //@step 13
              currentRight -= 1;
          }
      }

      suffix.Reverse();

      //@step 14
      return new string([.. prefix, .. suffix]);
  }
  //#endregion lps
  `,
  'csharp',
);

const LPS_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Collections;
  import java.util.List;

  /**
   * Computes one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  public static String longestPalSubseq(String source) {
      int length = source.length();

      //@step 2
      int[][] dp = new int[length][length];
      for (int index = 0; index < length; index += 1) {
          dp[index][index] = 1;
      }

      for (int span = 2; span <= length; span += 1) {
          for (int left = 0; left + span - 1 < length; left += 1) {
              int right = left + span - 1;

              //@step 5
              boolean charsMatch = source.charAt(left) == source.charAt(right);

              if (charsMatch) {
                  //@step 6
                  dp[left][right] = span == 2 ? 2 : dp[left + 1][right - 1] + 2;
              } else {
                  //@step 8
                  dp[left][right] = Math.max(dp[left + 1][right], dp[left][right - 1]);
              }
          }
      }

      List<Character> prefix = new ArrayList<>();
      List<Character> suffix = new ArrayList<>();
      int currentLeft = 0;
      int currentRight = length - 1;

      while (currentLeft <= currentRight) {
          //@step 11
          if (currentLeft == currentRight) {
              prefix.add(source.charAt(currentLeft));
              break;
          }

          if (
              source.charAt(currentLeft) == source.charAt(currentRight) &&
              dp[currentLeft][currentRight] ==
              (currentRight - currentLeft == 1 ? 2 : dp[currentLeft + 1][currentRight - 1] + 2)
          ) {
              //@step 12
              prefix.add(source.charAt(currentLeft));
              suffix.add(source.charAt(currentRight));
              currentLeft += 1;
              currentRight -= 1;
          } else if (dp[currentLeft + 1][currentRight] >= dp[currentLeft][currentRight - 1]) {
              //@step 13
              currentLeft += 1;
          } else {
              //@step 13
              currentRight -= 1;
          }
      }

      Collections.reverse(suffix);
      StringBuilder builder = new StringBuilder();
      for (char ch : prefix) {
          builder.append(ch);
      }
      for (char ch : suffix) {
          builder.append(ch);
      }

      //@step 14
      return builder.toString();
  }
  //#endregion lps
  `,
  'java',
);

const LPS_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <string>
  #include <vector>

  /**
   * Computes one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  std::string longestPalSubseq(const std::string& source) {
      int length = static_cast<int>(source.size());

      //@step 2
      std::vector<std::vector<int>> dp(length, std::vector<int>(length, 0));
      for (int index = 0; index < length; index += 1) {
          dp[index][index] = 1;
      }

      for (int span = 2; span <= length; span += 1) {
          for (int left = 0; left + span - 1 < length; left += 1) {
              int right = left + span - 1;

              //@step 5
              bool charsMatch = source[left] == source[right];

              if (charsMatch) {
                  //@step 6
                  dp[left][right] = span == 2 ? 2 : dp[left + 1][right - 1] + 2;
              } else {
                  //@step 8
                  dp[left][right] = std::max(dp[left + 1][right], dp[left][right - 1]);
              }
          }
      }

      std::string prefix;
      std::string suffix;
      int currentLeft = 0;
      int currentRight = length - 1;

      while (currentLeft <= currentRight) {
          //@step 11
          if (currentLeft == currentRight) {
              prefix.push_back(source[currentLeft]);
              break;
          }

          if (
              source[currentLeft] == source[currentRight] &&
              dp[currentLeft][currentRight] ==
              (currentRight - currentLeft == 1 ? 2 : dp[currentLeft + 1][currentRight - 1] + 2)
          ) {
              //@step 12
              prefix.push_back(source[currentLeft]);
              suffix.push_back(source[currentRight]);
              currentLeft += 1;
              currentRight -= 1;
          } else if (dp[currentLeft + 1][currentRight] >= dp[currentLeft][currentRight - 1]) {
              //@step 13
              currentLeft += 1;
          } else {
              //@step 13
              currentRight -= 1;
          }
      }

      std::reverse(suffix.begin(), suffix.end());

      //@step 14
      return prefix + suffix;
  }
  //#endregion lps
  `,
  'cpp',
);

const LPS_JS = buildStructuredCode(
  `
  /**
   * Compute one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  function longestPalSubseq(source) {
      const length = source.length;

      //@step 2
      const dp = Array.from({ length }, (_, row) =>
          Array.from({ length }, (_, col) => (row === col ? 1 : 0)),
      );

      for (let span = 2; span <= length; span += 1) {
          for (let left = 0; left + span - 1 < length; left += 1) {
              const right = left + span - 1;

              //@step 5
              const charsMatch = source[left] === source[right];

              if (charsMatch) {
                  //@step 6
                  dp[left][right] = span === 2 ? 2 : dp[left + 1][right - 1] + 2;
              } else {
                  //@step 8
                  dp[left][right] = Math.max(dp[left + 1][right], dp[left][right - 1]);
              }
          }
      }

      const prefix = [];
      const suffix = [];
      let left = 0;
      let right = length - 1;

      while (left <= right) {
          //@step 11
          if (left === right) {
              prefix.push(source[left]);
              break;
          }

          if (
              source[left] === source[right] &&
              dp[left][right] === (right - left === 1 ? 2 : dp[left + 1][right - 1] + 2)
          ) {
              //@step 12
              prefix.push(source[left]);
              suffix.push(source[right]);
              left += 1;
              right -= 1;
          } else if (dp[left + 1][right] >= dp[left][right - 1]) {
              //@step 13
              left += 1;
          } else {
              //@step 13
              right -= 1;
          }
      }

      //@step 14
      return prefix.join('') + suffix.reverse().join('');
  }
  //#endregion lps
  `,
  'javascript',
);

const LPS_GO = buildStructuredCode(
  `
  package dp

  /**
   * Computes one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  func LongestPalSubseq(source string) string {
      length := len(source)

      //@step 2
      dp := make([][]int, length)
      for row := 0; row < length; row += 1 {
          dp[row] = make([]int, length)
          dp[row][row] = 1
      }

      for span := 2; span <= length; span += 1 {
          for left := 0; left + span - 1 < length; left += 1 {
              right := left + span - 1

              //@step 5
              charsMatch := source[left] == source[right]

              if charsMatch {
                  //@step 6
                  if span == 2 {
                      dp[left][right] = 2
                  } else {
                      dp[left][right] = dp[left + 1][right - 1] + 2
                  }
              } else {
                  //@step 8
                  dp[left][right] = maxInt(dp[left + 1][right], dp[left][right - 1])
              }
          }
      }

      prefix := make([]byte, 0, length)
      suffix := make([]byte, 0, length)
      left := 0
      right := length - 1

      for left <= right {
          //@step 11
          if left == right {
              prefix = append(prefix, source[left])
              break
          }

          if source[left] == source[right] &&
              dp[left][right] == ternaryInt(right - left == 1, 2, dp[left + 1][right - 1] + 2) {
              //@step 12
              prefix = append(prefix, source[left])
              suffix = append(suffix, source[right])
              left += 1
              right -= 1
          } else if dp[left + 1][right] >= dp[left][right - 1] {
              //@step 13
              left += 1
          } else {
              //@step 13
              right -= 1
          }
      }

      for lo, hi := 0, len(suffix) - 1; lo < hi; lo, hi = lo + 1, hi - 1 {
          suffix[lo], suffix[hi] = suffix[hi], suffix[lo]
      }

      //@step 14
      return string(prefix) + string(suffix)
  }
  //#endregion lps

  //#region numeric helper collapsed
  func maxInt(a int, b int) int {
      if a > b {
          return a
      }
      return b
  }

  func ternaryInt(condition bool, yes int, no int) int {
      if condition {
          return yes
      }
      return no
  }
  //#endregion numeric
  `,
  'go',
);

const LPS_RUST = buildStructuredCode(
  `
  /**
   * Computes one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  fn longest_pal_subseq(source: &str) -> String {
      let chars: Vec<char> = source.chars().collect();
      let length = chars.len();
      if length == 0 {
          return String::new();
      }

      //@step 2
      let mut dp = vec![vec![0; length]; length];
      for index in 0..length {
          dp[index][index] = 1;
      }

      for span in 2..=length {
          for left in 0..=(length - span) {
              let right = left + span - 1;

              //@step 5
              let chars_match = chars[left] == chars[right];

              if chars_match {
                  //@step 6
                  dp[left][right] = if span == 2 { 2 } else { dp[left + 1][right - 1] + 2 };
              } else {
                  //@step 8
                  dp[left][right] = dp[left + 1][right].max(dp[left][right - 1]);
              }
          }
      }

      let mut prefix: Vec<char> = Vec::new();
      let mut suffix: Vec<char> = Vec::new();
      let mut left = 0usize;
      let mut right = length.saturating_sub(1);

      while left <= right {
          //@step 11
          if left == right {
              prefix.push(chars[left]);
              break;
          }

          if chars[left] == chars[right]
              && dp[left][right] == if right - left == 1 { 2 } else { dp[left + 1][right - 1] + 2 }
          {
              //@step 12
              prefix.push(chars[left]);
              suffix.push(chars[right]);
              left += 1;
              right -= 1;
          } else if dp[left + 1][right] >= dp[left][right - 1] {
              //@step 13
              left += 1;
          } else {
              //@step 13
              right -= 1;
          }
      }

      suffix.reverse();
      prefix.extend(suffix);

      //@step 14
      prefix.into_iter().collect()
  }
  //#endregion lps
  `,
  'rust',
);

const LPS_SWIFT = buildStructuredCode(
  `
  /**
   * Computes one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  func longestPalSubseq(_ source: String) -> String {
      let chars = Array(source)
      let length = chars.count

      //@step 2
      var dp = Array(repeating: Array(repeating: 0, count: length), count: length)
      for index in 0..<length {
          dp[index][index] = 1
      }

      if length >= 2 {
          for span in 2...length {
              for left in 0...(length - span) {
                  let right = left + span - 1

                  //@step 5
                  let charsMatch = chars[left] == chars[right]

                  if charsMatch {
                      //@step 6
                      dp[left][right] = span == 2 ? 2 : dp[left + 1][right - 1] + 2
                  } else {
                      //@step 8
                      dp[left][right] = max(dp[left + 1][right], dp[left][right - 1])
                  }
              }
          }
      }

      var prefix: [Character] = []
      var suffix: [Character] = []
      var left = 0
      var right = length - 1

      while left <= right {
          //@step 11
          if left == right {
              prefix.append(chars[left])
              break
          }

          if chars[left] == chars[right] &&
              dp[left][right] == (right - left == 1 ? 2 : dp[left + 1][right - 1] + 2) {
              //@step 12
              prefix.append(chars[left])
              suffix.append(chars[right])
              left += 1
              right -= 1
          } else if dp[left + 1][right] >= dp[left][right - 1] {
              //@step 13
              left += 1
          } else {
              //@step 13
              right -= 1
          }
      }

      //@step 14
      return String(prefix + suffix.reversed())
  }
  //#endregion lps
  `,
  'swift',
);

const LPS_PHP = buildStructuredCode(
  `
  /**
   * Computes one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  function longestPalSubseq(string $source): string
  {
      $chars = str_split($source);
      $length = count($chars);

      //@step 2
      $dp = array_fill(0, $length, array_fill(0, $length, 0));
      for ($index = 0; $index < $length; $index += 1) {
          $dp[$index][$index] = 1;
      }

      for ($span = 2; $span <= $length; $span += 1) {
          for ($left = 0; $left + $span - 1 < $length; $left += 1) {
              $right = $left + $span - 1;

              //@step 5
              $charsMatch = $chars[$left] === $chars[$right];

              if ($charsMatch) {
                  //@step 6
                  $dp[$left][$right] = $span === 2 ? 2 : $dp[$left + 1][$right - 1] + 2;
              } else {
                  //@step 8
                  $dp[$left][$right] = max($dp[$left + 1][$right], $dp[$left][$right - 1]);
              }
          }
      }

      $prefix = [];
      $suffix = [];
      $left = 0;
      $right = $length - 1;

      while ($left <= $right) {
          //@step 11
          if ($left === $right) {
              $prefix[] = $chars[$left];
              break;
          }

          if (
              $chars[$left] === $chars[$right] &&
              $dp[$left][$right] === ($right - $left === 1 ? 2 : $dp[$left + 1][$right - 1] + 2)
          ) {
              //@step 12
              $prefix[] = $chars[$left];
              $suffix[] = $chars[$right];
              $left += 1;
              $right -= 1;
          } elseif ($dp[$left + 1][$right] >= $dp[$left][$right - 1]) {
              //@step 13
              $left += 1;
          } else {
              //@step 13
              $right -= 1;
          }
      }

      //@step 14
      return implode('', $prefix) . implode('', array_reverse($suffix));
  }
  //#endregion lps
  `,
  'php',
);

const LPS_KOTLIN = buildStructuredCode(
  `
  /**
   * Computes one longest palindromic subsequence of a string.
   * Input: source string.
   * Returns: an LPS string.
   */
  //#region lps function open
  fun longestPalSubseq(source: String): String {
      val length = source.length

      //@step 2
      val dp = Array(length) { row -> IntArray(length) { col -> if (row == col) 1 else 0 } }

      for (span in 2..length) {
          for (left in 0..(length - span)) {
              val right = left + span - 1

              //@step 5
              val charsMatch = source[left] == source[right]

              if (charsMatch) {
                  //@step 6
                  dp[left][right] = if (span == 2) 2 else dp[left + 1][right - 1] + 2
              } else {
                  //@step 8
                  dp[left][right] = maxOf(dp[left + 1][right], dp[left][right - 1])
              }
          }
      }

      val prefix = StringBuilder()
      val suffix = StringBuilder()
      var left = 0
      var right = length - 1

      while (left <= right) {
          //@step 11
          if (left == right) {
              prefix.append(source[left])
              break
          }

          if (
              source[left] == source[right] &&
              dp[left][right] == if (right - left == 1) 2 else dp[left + 1][right - 1] + 2
          ) {
              //@step 12
              prefix.append(source[left])
              suffix.append(source[right])
              left += 1
              right -= 1
          } else if (dp[left + 1][right] >= dp[left][right - 1]) {
              //@step 13
              left += 1
          } else {
              //@step 13
              right -= 1
          }
      }

      //@step 14
      return prefix.toString() + suffix.reverse().toString()
  }
  //#endregion lps
  `,
  'kotlin',
);

export const LONGEST_PALINDROMIC_SUBSEQUENCE_CODE = LPS_TS.lines;
export const LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_REGIONS = LPS_TS.regions;
export const LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_HIGHLIGHT_MAP = LPS_TS.highlightMap;
export const LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: LPS_TS.lines,
    regions: LPS_TS.regions,
    highlightMap: LPS_TS.highlightMap,
    source: LPS_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: LPS_JS.lines,
    regions: LPS_JS.regions,
    highlightMap: LPS_JS.highlightMap,
    source: LPS_JS.source,
  },
  python: {
    language: 'python',
    lines: LPS_PY.lines,
    regions: LPS_PY.regions,
    highlightMap: LPS_PY.highlightMap,
    source: LPS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: LPS_CS.lines,
    regions: LPS_CS.regions,
    highlightMap: LPS_CS.highlightMap,
    source: LPS_CS.source,
  },
  java: {
    language: 'java',
    lines: LPS_JAVA.lines,
    regions: LPS_JAVA.regions,
    highlightMap: LPS_JAVA.highlightMap,
    source: LPS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: LPS_CPP.lines,
    regions: LPS_CPP.regions,
    highlightMap: LPS_CPP.highlightMap,
    source: LPS_CPP.source,
  },
  go: {
    language: 'go',
    lines: LPS_GO.lines,
    regions: LPS_GO.regions,
    highlightMap: LPS_GO.highlightMap,
    source: LPS_GO.source,
  },
  rust: {
    language: 'rust',
    lines: LPS_RUST.lines,
    regions: LPS_RUST.regions,
    highlightMap: LPS_RUST.highlightMap,
    source: LPS_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: LPS_SWIFT.lines,
    regions: LPS_SWIFT.regions,
    highlightMap: LPS_SWIFT.highlightMap,
    source: LPS_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: LPS_PHP.lines,
    regions: LPS_PHP.regions,
    highlightMap: LPS_PHP.highlightMap,
    source: LPS_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: LPS_KOTLIN.lines,
    regions: LPS_KOTLIN.regions,
    highlightMap: LPS_KOTLIN.highlightMap,
    source: LPS_KOTLIN.source,
  },
};
