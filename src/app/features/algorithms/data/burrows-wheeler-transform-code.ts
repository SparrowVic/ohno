import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const BURROWS_WHEELER_TRANSFORM_TS = buildStructuredCode(`
  /**
   * Build the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  function burrowsWheelerTransform(source: string): string {
    //@step 2
    const rotations = buildRotations(source);

    //@step 3
    rotations.sort();

    const firstColumn = rotations.map((rotation) => rotation[0] ?? '').join('');

    //@step 5
    const lastColumn = rotations.map((rotation) => rotation.at(-1) ?? '').join('');

    //@step 6
    return lastColumn;
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  function buildRotations(source: string): string[] {
    return Array.from({ length: source.length }, (_, index) =>
      source.slice(index) + source.slice(0, index),
    );
  }
  //#endregion build-rotations
`);

const BURROWS_WHEELER_TRANSFORM_PY = buildStructuredCode(
  `
  """
  Build the Burrows-Wheeler transform of a string.
  Input: source string terminated with a unique sentinel.
  Returns: the last column of the sorted rotation matrix.
  """
  //#region burrows-wheeler function open
  def burrows_wheeler_transform(source: str) -> str:
      //@step 2
      rotations = build_rotations(source)

      //@step 3
      rotations.sort()

      first_column = "".join(rotation[0] for rotation in rotations)

      //@step 5
      last_column = "".join(rotation[-1] for rotation in rotations)

      //@step 6
      return last_column
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  def build_rotations(source: str) -> list[str]:
      return [source[index:] + source[:index] for index in range(len(source))]
  //#endregion build-rotations
  `,
  'python',
);

const BURROWS_WHEELER_TRANSFORM_CS = buildStructuredCode(
  `
  using System;
  using System.Linq;

  /// <summary>
  /// Builds the Burrows-Wheeler transform of a string.
  /// Input: source string terminated with a unique sentinel.
  /// Returns: the last column of the sorted rotation matrix.
  /// </summary>
  //#region burrows-wheeler function open
  public static string BurrowsWheelerTransform(string source)
  {
      //@step 2
      var rotations = BuildRotations(source);

      //@step 3
      rotations.Sort(StringComparer.Ordinal);

      var firstColumn = string.Concat(rotations.Select(rotation => rotation[0]));

      //@step 5
      var lastColumn = string.Concat(rotations.Select(rotation => rotation[^1]));

      //@step 6
      return lastColumn;
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  private static List<string> BuildRotations(string source)
  {
      return Enumerable.Range(0, source.Length)
          .Select(index => source[index..] + source[..index])
          .ToList();
  }
  //#endregion build-rotations
  `,
  'csharp',
);

const BURROWS_WHEELER_TRANSFORM_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Collections;
  import java.util.List;

  /**
   * Builds the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  public static String burrowsWheelerTransform(String source) {
      //@step 2
      List<String> rotations = buildRotations(source);

      //@step 3
      Collections.sort(rotations);

      StringBuilder firstColumn = new StringBuilder();
      for (String rotation : rotations) {
          firstColumn.append(rotation.charAt(0));
      }

      //@step 5
      StringBuilder lastColumn = new StringBuilder();
      for (String rotation : rotations) {
          lastColumn.append(rotation.charAt(rotation.length() - 1));
      }

      //@step 6
      return lastColumn.toString();
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  private static List<String> buildRotations(String source) {
      List<String> rotations = new ArrayList<>();
      for (int index = 0; index < source.length(); index += 1) {
          rotations.add(source.substring(index) + source.substring(0, index));
      }
      return rotations;
  }
  //#endregion build-rotations
  `,
  'java',
);

const BURROWS_WHEELER_TRANSFORM_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <string>
  #include <vector>

  /**
   * Builds the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  std::string burrowsWheelerTransform(const std::string& source) {
      //@step 2
      auto rotations = buildRotations(source);

      //@step 3
      std::sort(rotations.begin(), rotations.end());

      std::string firstColumn;
      firstColumn.reserve(rotations.size());
      for (const auto& rotation : rotations) {
          firstColumn.push_back(rotation.front());
      }

      //@step 5
      std::string lastColumn;
      lastColumn.reserve(rotations.size());
      for (const auto& rotation : rotations) {
          lastColumn.push_back(rotation.back());
      }

      //@step 6
      return lastColumn;
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  std::vector<std::string> buildRotations(const std::string& source) {
      std::vector<std::string> rotations;
      rotations.reserve(source.size());
      for (int index = 0; index < static_cast<int>(source.size()); index += 1) {
          rotations.push_back(source.substr(index) + source.substr(0, index));
      }
      return rotations;
  }
  //#endregion build-rotations
  `,
  'cpp',
);

export const BURROWS_WHEELER_TRANSFORM_CODE = BURROWS_WHEELER_TRANSFORM_TS.lines;
export const BURROWS_WHEELER_TRANSFORM_CODE_REGIONS = BURROWS_WHEELER_TRANSFORM_TS.regions;
export const BURROWS_WHEELER_TRANSFORM_CODE_HIGHLIGHT_MAP = BURROWS_WHEELER_TRANSFORM_TS.highlightMap;
export const BURROWS_WHEELER_TRANSFORM_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BURROWS_WHEELER_TRANSFORM_TS.lines,
    regions: BURROWS_WHEELER_TRANSFORM_TS.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_TS.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_TS.source,
  },
  python: {
    language: 'python',
    lines: BURROWS_WHEELER_TRANSFORM_PY.lines,
    regions: BURROWS_WHEELER_TRANSFORM_PY.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_PY.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BURROWS_WHEELER_TRANSFORM_CS.lines,
    regions: BURROWS_WHEELER_TRANSFORM_CS.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_CS.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_CS.source,
  },
  java: {
    language: 'java',
    lines: BURROWS_WHEELER_TRANSFORM_JAVA.lines,
    regions: BURROWS_WHEELER_TRANSFORM_JAVA.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_JAVA.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BURROWS_WHEELER_TRANSFORM_CPP.lines,
    regions: BURROWS_WHEELER_TRANSFORM_CPP.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_CPP.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_CPP.source,
  },
};
