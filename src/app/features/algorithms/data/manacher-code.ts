import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

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
};
