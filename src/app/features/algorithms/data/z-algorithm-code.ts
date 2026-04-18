import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const Z_ALGORITHM_TS = buildStructuredCode(`
  /**
   * Build the Z-array for a string.
   * Input: one string S.
   * Returns: Z[i] = longest prefix match starting at i.
   */
  //#region z-array function open
  //@step 1
  function buildZArray(source: string): number[] {
    const z = Array.from({ length: source.length }, (_, index) =>
      index === 0 ? source.length : 0,
    );

    let left = 0;
    let right = 0;

    for (let index = 1; index < source.length; index += 1) {
      if (index <= right) {
        //@step 5
        z[index] = Math.min(right - index + 1, z[index - left] ?? 0);
      }

      //@step 6
      while (
        index + z[index] < source.length &&
        source[z[index] ?? 0] === source[index + (z[index] ?? 0)]
      ) {
        z[index]++;
      }

      if (index + z[index] - 1 > right) {
        //@step 9
        left = index;
        right = index + z[index] - 1;
      }
    }

    return z;
  }
  //#endregion z-array
`);

const Z_ALGORITHM_PY = buildStructuredCode(
  `
  """
  Build the Z-array for a string.
  Input: one string S.
  Returns: Z[i] = longest prefix match starting at i.
  """
  //#region z-array function open
  //@step 1
  def build_z_array(source: str) -> list[int]:
      z = [len(source) if index == 0 else 0 for index in range(len(source))]
      left = 0
      right = 0

      for index in range(1, len(source)):
          if index <= right:
              //@step 5
              z[index] = min(right - index + 1, z[index - left])

          //@step 6
          while index + z[index] < len(source) and source[z[index]] == source[index + z[index]]:
              z[index] += 1

          if index + z[index] - 1 > right:
              //@step 9
              left = index
              right = index + z[index] - 1

      return z
  //#endregion z-array
  `,
  'python',
);

const Z_ALGORITHM_CS = buildStructuredCode(
  `
  using System;

  /// <summary>
  /// Builds the Z-array for a string.
  /// Input: one string S.
  /// Returns: Z[i] = longest prefix match starting at i.
  /// </summary>
  //#region z-array function open
  //@step 1
  public static int[] BuildZArray(string source)
  {
      var z = new int[source.Length];
      if (source.Length > 0)
      {
          z[0] = source.Length;
      }

      var left = 0;
      var right = 0;

      for (var index = 1; index < source.Length; index += 1)
      {
          if (index <= right)
          {
              //@step 5
              z[index] = Math.Min(right - index + 1, z[index - left]);
          }

          //@step 6
          while (index + z[index] < source.Length && source[z[index]] == source[index + z[index]])
          {
              z[index] += 1;
          }

          if (index + z[index] - 1 > right)
          {
              //@step 9
              left = index;
              right = index + z[index] - 1;
          }
      }

      return z;
  }
  //#endregion z-array
  `,
  'csharp',
);

const Z_ALGORITHM_JAVA = buildStructuredCode(
  `
  /**
   * Builds the Z-array for a string.
   * Input: one string S.
   * Returns: Z[i] = longest prefix match starting at i.
   */
  //#region z-array function open
  //@step 1
  public static int[] buildZArray(String source) {
      int[] z = new int[source.length()];
      if (!source.isEmpty()) {
          z[0] = source.length();
      }

      int left = 0;
      int right = 0;

      for (int index = 1; index < source.length(); index += 1) {
          if (index <= right) {
              //@step 5
              z[index] = Math.min(right - index + 1, z[index - left]);
          }

          //@step 6
          while (index + z[index] < source.length() && source.charAt(z[index]) == source.charAt(index + z[index])) {
              z[index] += 1;
          }

          if (index + z[index] - 1 > right) {
              //@step 9
              left = index;
              right = index + z[index] - 1;
          }
      }

      return z;
  }
  //#endregion z-array
  `,
  'java',
);

const Z_ALGORITHM_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <string>
  #include <vector>

  /**
   * Builds the Z-array for a string.
   * Input: one string S.
   * Returns: Z[i] = longest prefix match starting at i.
   */
  //#region z-array function open
  //@step 1
  std::vector<int> buildZArray(const std::string& source) {
      std::vector<int> z(source.size(), 0);
      if (!source.empty()) {
          z[0] = static_cast<int>(source.size());
      }

      int left = 0;
      int right = 0;

      for (int index = 1; index < static_cast<int>(source.size()); index += 1) {
          if (index <= right) {
              //@step 5
              z[index] = std::min(right - index + 1, z[index - left]);
          }

          //@step 6
          while (index + z[index] < static_cast<int>(source.size()) && source[z[index]] == source[index + z[index]]) {
              z[index] += 1;
          }

          if (index + z[index] - 1 > right) {
              //@step 9
              left = index;
              right = index + z[index] - 1;
          }
      }

      return z;
  }
  //#endregion z-array
  `,
  'cpp',
);

export const Z_ALGORITHM_CODE = Z_ALGORITHM_TS.lines;
export const Z_ALGORITHM_CODE_REGIONS = Z_ALGORITHM_TS.regions;
export const Z_ALGORITHM_CODE_HIGHLIGHT_MAP = Z_ALGORITHM_TS.highlightMap;
export const Z_ALGORITHM_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: Z_ALGORITHM_TS.lines,
    regions: Z_ALGORITHM_TS.regions,
    highlightMap: Z_ALGORITHM_TS.highlightMap,
    source: Z_ALGORITHM_TS.source,
  },
  python: {
    language: 'python',
    lines: Z_ALGORITHM_PY.lines,
    regions: Z_ALGORITHM_PY.regions,
    highlightMap: Z_ALGORITHM_PY.highlightMap,
    source: Z_ALGORITHM_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: Z_ALGORITHM_CS.lines,
    regions: Z_ALGORITHM_CS.regions,
    highlightMap: Z_ALGORITHM_CS.highlightMap,
    source: Z_ALGORITHM_CS.source,
  },
  java: {
    language: 'java',
    lines: Z_ALGORITHM_JAVA.lines,
    regions: Z_ALGORITHM_JAVA.regions,
    highlightMap: Z_ALGORITHM_JAVA.highlightMap,
    source: Z_ALGORITHM_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: Z_ALGORITHM_CPP.lines,
    regions: Z_ALGORITHM_CPP.regions,
    highlightMap: Z_ALGORITHM_CPP.highlightMap,
    source: Z_ALGORITHM_CPP.source,
  },
};
