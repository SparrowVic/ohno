import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const MANACHER_TS = buildStructuredCode(`
  /**
   * Find the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  function manacher(source: string): number[] {
    const transformed = ['#', ...source.split('').flatMap((char) => [char, '#'])].join('');
    const radii = Array.from({ length: transformed.length }, () => 0);

    let center = 0;
    let right = 0;

    for (let index = 0; index < transformed.length; index += 1) {
      const mirror = 2 * center - index;

      if (index < right) {
        //@step 7
        radii[index] = Math.min(right - index, radii[mirror] ?? 0);
      }

      //@step 8
      while (
        index - radii[index] - 1 >= 0 &&
        index + radii[index] + 1 < transformed.length &&
        transformed[index - radii[index] - 1] === transformed[index + radii[index] + 1]
      ) {
        radii[index]++;
      }

      if (index + radii[index] > right) {
        //@step 11
        center = index;
        right = index + radii[index];
      }
    }

    return radii;
  }
  //#endregion manacher
`);

const MANACHER_PY = buildStructuredCode(
  `
  """
  Find the longest palindromic substring with Manacher's algorithm.
  Input: source string.
  Returns: palindrome radii in the transformed string.
  """
  //#region manacher function open
  //@step 1
  def manacher(source: str) -> list[int]:
      transformed = "#" + "#".join(source) + "#"
      radii = [0] * len(transformed)

      center = 0
      right = 0

      for index in range(len(transformed)):
          mirror = 2 * center - index

          if index < right:
              //@step 7
              radii[index] = min(right - index, radii[mirror])

          //@step 8
          while (
              index - radii[index] - 1 >= 0 and
              index + radii[index] + 1 < len(transformed) and
              transformed[index - radii[index] - 1] == transformed[index + radii[index] + 1]
          ):
              radii[index] += 1

          if index + radii[index] > right:
              //@step 11
              center = index
              right = index + radii[index]

      return radii
  //#endregion manacher
  `,
  'python',
);

const MANACHER_CS = buildStructuredCode(
  `
  using System;
  using System.Linq;

  /// <summary>
  /// Finds the longest palindromic substring with Manacher's algorithm.
  /// Input: source string.
  /// Returns: palindrome radii in the transformed string.
  /// </summary>
  //#region manacher function open
  //@step 1
  public static int[] Manacher(string source)
  {
      var transformed = $"#{string.Join("#", source.ToCharArray())}#";
      var radii = new int[transformed.Length];

      var center = 0;
      var right = 0;

      for (var index = 0; index < transformed.Length; index += 1)
      {
          var mirror = 2 * center - index;

          if (index < right)
          {
              //@step 7
              radii[index] = Math.Min(right - index, radii[mirror]);
          }

          //@step 8
          while (
              index - radii[index] - 1 >= 0 &&
              index + radii[index] + 1 < transformed.Length &&
              transformed[index - radii[index] - 1] == transformed[index + radii[index] + 1]
          )
          {
              radii[index] += 1;
          }

          if (index + radii[index] > right)
          {
              //@step 11
              center = index;
              right = index + radii[index];
          }
      }

      return radii;
  }
  //#endregion manacher
  `,
  'csharp',
);

const MANACHER_JAVA = buildStructuredCode(
  `
  /**
   * Finds the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  public static int[] manacher(String source) {
      String transformed = buildTransformed(source);
      int[] radii = new int[transformed.length()];

      int center = 0;
      int right = 0;

      for (int index = 0; index < transformed.length(); index += 1) {
          int mirror = 2 * center - index;

          if (index < right) {
              //@step 7
              radii[index] = Math.min(right - index, radii[mirror]);
          }

          //@step 8
          while (
              index - radii[index] - 1 >= 0 &&
              index + radii[index] + 1 < transformed.length() &&
              transformed.charAt(index - radii[index] - 1) == transformed.charAt(index + radii[index] + 1)
          ) {
              radii[index] += 1;
          }

          if (index + radii[index] > right) {
              //@step 11
              center = index;
              right = index + radii[index];
          }
      }

      return radii;
  }
  //#endregion manacher

  //#region transform helper collapsed
  private static String buildTransformed(String source) {
      StringBuilder transformed = new StringBuilder("#");
      for (int index = 0; index < source.length(); index += 1) {
          transformed.append(source.charAt(index)).append('#');
      }
      return transformed.toString();
  }
  //#endregion transform
  `,
  'java',
);

const MANACHER_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <string>
  #include <vector>

  /**
   * Finds the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  std::vector<int> manacher(const std::string& source) {
      std::string transformed = "#";
      for (char ch : source) {
          transformed.push_back(ch);
          transformed.push_back('#');
      }

      std::vector<int> radii(transformed.size(), 0);
      int center = 0;
      int right = 0;

      for (int index = 0; index < static_cast<int>(transformed.size()); index += 1) {
          int mirror = 2 * center - index;

          if (index < right) {
              //@step 7
              radii[index] = std::min(right - index, radii[mirror]);
          }

          //@step 8
          while (
              index - radii[index] - 1 >= 0 &&
              index + radii[index] + 1 < static_cast<int>(transformed.size()) &&
              transformed[index - radii[index] - 1] == transformed[index + radii[index] + 1]
          ) {
              radii[index] += 1;
          }

          if (index + radii[index] > right) {
              //@step 11
              center = index;
              right = index + radii[index];
          }
      }

      return radii;
  }
  //#endregion manacher
  `,
  'cpp',
);

const MANACHER_JS = buildStructuredCode(
  `
  /**
   * Find the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  function manacher(source) {
      const transformed = ['#', ...source.split('').flatMap((char) => [char, '#'])].join('');
      const radii = Array.from({ length: transformed.length }, () => 0);

      let center = 0;
      let right = 0;

      for (let index = 0; index < transformed.length; index += 1) {
          const mirror = 2 * center - index;

          if (index < right) {
              //@step 7
              radii[index] = Math.min(right - index, radii[mirror] ?? 0);
          }

          //@step 8
          while (
              index - radii[index] - 1 >= 0 &&
              index + radii[index] + 1 < transformed.length &&
              transformed[index - radii[index] - 1] === transformed[index + radii[index] + 1]
          ) {
              radii[index] += 1;
          }

          if (index + radii[index] > right) {
              //@step 11
              center = index;
              right = index + radii[index];
          }
      }

      return radii;
  }
  //#endregion manacher
  `,
  'javascript',
);

const MANACHER_GO = buildStructuredCode(
  `
  package strings

  /**
   * Finds the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  func Manacher(source string) []int {
      transformed := buildTransformed(source)
      radii := make([]int, len(transformed))

      center := 0
      right := 0

      for index := 0; index < len(transformed); index += 1 {
          mirror := 2 * center - index

          if index < right {
              //@step 7
              radii[index] = minInt(right - index, radii[mirror])
          }

          //@step 8
          for index - radii[index] - 1 >= 0 &&
              index + radii[index] + 1 < len(transformed) &&
              transformed[index - radii[index] - 1] == transformed[index + radii[index] + 1] {
              radii[index] += 1
          }

          if index + radii[index] > right {
              //@step 11
              center = index
              right = index + radii[index]
          }
      }

      return radii
  }
  //#endregion manacher

  //#region transform helper collapsed
  func buildTransformed(source string) []rune {
      transformed := []rune{'#'}
      for _, char := range source {
          transformed = append(transformed, char, '#')
      }
      return transformed
  }

  func minInt(a int, b int) int {
      if a < b {
          return a
      }
      return b
  }
  //#endregion transform
  `,
  'go',
);

const MANACHER_RUST = buildStructuredCode(
  `
  /**
   * Finds the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  fn manacher(source: &str) -> Vec<usize> {
      let transformed = build_transformed(source);
      let mut radii = vec![0; transformed.len()];

      let mut center = 0usize;
      let mut right = 0usize;

      for index in 0..transformed.len() {
          let mirror = 2isize * center as isize - index as isize;

          if index < right && mirror >= 0 {
              //@step 7
              radii[index] = (right - index).min(radii[mirror as usize]);
          }

          //@step 8
          while index >= radii[index] + 1 &&
              index + radii[index] + 1 < transformed.len() &&
              transformed[index - radii[index] - 1] == transformed[index + radii[index] + 1] {
              radii[index] += 1;
          }

          if index + radii[index] > right {
              //@step 11
              center = index;
              right = index + radii[index];
          }
      }

      radii
  }
  //#endregion manacher

  //#region transform helper collapsed
  fn build_transformed(source: &str) -> Vec<char> {
      let mut transformed = vec!['#'];
      for char in source.chars() {
          transformed.push(char);
          transformed.push('#');
      }
      transformed
  }
  //#endregion transform
  `,
  'rust',
);

const MANACHER_SWIFT = buildStructuredCode(
  `
  /**
   * Finds the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  func manacher(_ source: String) -> [Int] {
      let transformed = buildTransformed(source)
      var radii = Array(repeating: 0, count: transformed.count)

      var center = 0
      var right = 0

      for index in 0..<transformed.count {
          let mirror = 2 * center - index

          if index < right && mirror >= 0 {
              //@step 7
              radii[index] = min(right - index, radii[mirror])
          }

          //@step 8
          while index - radii[index] - 1 >= 0 &&
              index + radii[index] + 1 < transformed.count &&
              transformed[index - radii[index] - 1] == transformed[index + radii[index] + 1] {
              radii[index] += 1
          }

          if index + radii[index] > right {
              //@step 11
              center = index
              right = index + radii[index]
          }
      }

      return radii
  }
  //#endregion manacher

  //#region transform helper collapsed
  func buildTransformed(_ source: String) -> [Character] {
      var transformed: [Character] = ["#"]
      for char in source {
          transformed.append(char)
          transformed.append("#")
      }
      return transformed
  }
  //#endregion transform
  `,
  'swift',
);

const MANACHER_PHP = buildStructuredCode(
  `
  /**
   * Finds the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  function manacher(string $source): array
  {
      $transformed = '#' . implode('#', str_split($source)) . '#';
      $radii = array_fill(0, strlen($transformed), 0);

      $center = 0;
      $right = 0;

      for ($index = 0; $index < strlen($transformed); $index += 1) {
          $mirror = 2 * $center - $index;

          if ($index < $right && $mirror >= 0) {
              //@step 7
              $radii[$index] = min($right - $index, $radii[$mirror]);
          }

          //@step 8
          while (
              $index - $radii[$index] - 1 >= 0 &&
              $index + $radii[$index] + 1 < strlen($transformed) &&
              $transformed[$index - $radii[$index] - 1] === $transformed[$index + $radii[$index] + 1]
          ) {
              $radii[$index] += 1;
          }

          if ($index + $radii[$index] > $right) {
              //@step 11
              $center = $index;
              $right = $index + $radii[$index];
          }
      }

      return $radii;
  }
  //#endregion manacher
  `,
  'php',
);

const MANACHER_KOTLIN = buildStructuredCode(
  `
  /**
   * Finds the longest palindromic substring with Manacher's algorithm.
   * Input: source string.
   * Returns: palindrome radii in the transformed string.
   */
  //#region manacher function open
  //@step 1
  fun manacher(source: String): IntArray {
      val transformed = buildTransformed(source)
      val radii = IntArray(transformed.length)

      var center = 0
      var right = 0

      for (index in transformed.indices) {
          val mirror = 2 * center - index

          if (index < right && mirror >= 0) {
              //@step 7
              radii[index] = minOf(right - index, radii[mirror])
          }

          //@step 8
          while (
              index - radii[index] - 1 >= 0 &&
              index + radii[index] + 1 < transformed.length &&
              transformed[index - radii[index] - 1] == transformed[index + radii[index] + 1]
          ) {
              radii[index] += 1
          }

          if (index + radii[index] > right) {
              //@step 11
              center = index
              right = index + radii[index]
          }
      }

      return radii
  }
  //#endregion manacher

  //#region transform helper collapsed
  fun buildTransformed(source: String): CharArray {
      val builder = StringBuilder("#")
      for (char in source) {
          builder.append(char).append('#')
      }
      return builder.toString().toCharArray()
  }
  //#endregion transform
  `,
  'kotlin',
);

export const MANACHER_CODE = MANACHER_TS.lines;
export const MANACHER_CODE_REGIONS = MANACHER_TS.regions;
export const MANACHER_CODE_HIGHLIGHT_MAP = MANACHER_TS.highlightMap;
export const MANACHER_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: MANACHER_TS.lines,
    regions: MANACHER_TS.regions,
    highlightMap: MANACHER_TS.highlightMap,
    source: MANACHER_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: MANACHER_JS.lines,
    regions: MANACHER_JS.regions,
    highlightMap: MANACHER_JS.highlightMap,
    source: MANACHER_JS.source,
  },
  python: {
    language: 'python',
    lines: MANACHER_PY.lines,
    regions: MANACHER_PY.regions,
    highlightMap: MANACHER_PY.highlightMap,
    source: MANACHER_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: MANACHER_CS.lines,
    regions: MANACHER_CS.regions,
    highlightMap: MANACHER_CS.highlightMap,
    source: MANACHER_CS.source,
  },
  java: {
    language: 'java',
    lines: MANACHER_JAVA.lines,
    regions: MANACHER_JAVA.regions,
    highlightMap: MANACHER_JAVA.highlightMap,
    source: MANACHER_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: MANACHER_CPP.lines,
    regions: MANACHER_CPP.regions,
    highlightMap: MANACHER_CPP.highlightMap,
    source: MANACHER_CPP.source,
  },
  go: {
    language: 'go',
    lines: MANACHER_GO.lines,
    regions: MANACHER_GO.regions,
    highlightMap: MANACHER_GO.highlightMap,
    source: MANACHER_GO.source,
  },
  rust: {
    language: 'rust',
    lines: MANACHER_RUST.lines,
    regions: MANACHER_RUST.regions,
    highlightMap: MANACHER_RUST.highlightMap,
    source: MANACHER_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: MANACHER_SWIFT.lines,
    regions: MANACHER_SWIFT.regions,
    highlightMap: MANACHER_SWIFT.highlightMap,
    source: MANACHER_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: MANACHER_PHP.lines,
    regions: MANACHER_PHP.regions,
    highlightMap: MANACHER_PHP.highlightMap,
    source: MANACHER_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: MANACHER_KOTLIN.lines,
    regions: MANACHER_KOTLIN.regions,
    highlightMap: MANACHER_KOTLIN.highlightMap,
    source: MANACHER_KOTLIN.source,
  },
};
