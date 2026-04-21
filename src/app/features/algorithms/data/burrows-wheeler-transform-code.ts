import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const BURROWS_WHEELER_TRANSFORM_JS = buildStructuredCode(
  `
  /**
   * Build the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  function burrowsWheelerTransform(source) {
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
  function buildRotations(source) {
      return Array.from({ length: source.length }, (_, index) =>
          source.slice(index) + source.slice(0, index),
      );
  }
  //#endregion build-rotations
  `,
  'javascript',
);

const BURROWS_WHEELER_TRANSFORM_GO = buildStructuredCode(
  `
  package strings

  /**
   * Builds the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  func BurrowsWheelerTransform(source string) string {
      //@step 2
      rotations := buildRotations(source)

      //@step 3
      slices.Sort(rotations)

      firstColumn := ""
      for _, rotation := range rotations {
          firstColumn += string(rotation[0])
      }

      //@step 5
      lastColumn := ""
      for _, rotation := range rotations {
          lastColumn += string(rotation[len(rotation) - 1])
      }

      //@step 6
      return lastColumn
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  func buildRotations(source string) []string {
      rotations := make([]string, 0, len(source))
      for index := 0; index < len(source); index += 1 {
          rotations = append(rotations, source[index:] + source[:index])
      }
      return rotations
  }
  //#endregion build-rotations
  `,
  'go',
);

const BURROWS_WHEELER_TRANSFORM_RUST = buildStructuredCode(
  `
  /**
   * Builds the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  fn burrows_wheeler_transform(source: &str) -> String {
      //@step 2
      let mut rotations = build_rotations(source);

      //@step 3
      rotations.sort();

      let first_column: String = rotations.iter().map(|rotation| rotation.chars().next().unwrap_or_default()).collect();

      //@step 5
      let last_column: String = rotations.iter().map(|rotation| rotation.chars().last().unwrap_or_default()).collect();

      //@step 6
      last_column
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  fn build_rotations(source: &str) -> Vec<String> {
      let chars: Vec<char> = source.chars().collect();
      let mut rotations = Vec::new();
      for index in 0..chars.len() {
          let rotation: String = chars[index..].iter().chain(chars[..index].iter()).collect();
          rotations.push(rotation);
      }
      rotations
  }
  //#endregion build-rotations
  `,
  'rust',
);

const BURROWS_WHEELER_TRANSFORM_SWIFT = buildStructuredCode(
  `
  /**
   * Builds the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  func burrowsWheelerTransform(_ source: String) -> String {
      //@step 2
      var rotations = buildRotations(source)

      //@step 3
      rotations.sort()

      let firstColumn = rotations.map { String($0.first ?? Character("")) }.joined()

      //@step 5
      let lastColumn = rotations.map { String($0.last ?? Character("")) }.joined()

      //@step 6
      return lastColumn
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  func buildRotations(_ source: String) -> [String] {
      let chars = Array(source)
      return (0..<chars.count).map { index in
          String(chars[index...] + chars[..<index])
      }
  }
  //#endregion build-rotations
  `,
  'swift',
);

const BURROWS_WHEELER_TRANSFORM_PHP = buildStructuredCode(
  `
  /**
   * Builds the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  function burrowsWheelerTransform(string $source): string
  {
      //@step 2
      $rotations = buildRotations($source);

      //@step 3
      sort($rotations);

      $firstColumn = implode('', array_map(static fn (string $rotation): string => $rotation[0] ?? '', $rotations));

      //@step 5
      $lastColumn = implode('', array_map(static fn (string $rotation): string => $rotation[strlen($rotation) - 1] ?? '', $rotations));

      //@step 6
      return $lastColumn;
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  function buildRotations(string $source): array
  {
      $rotations = [];
      for ($index = 0; $index < strlen($source); $index += 1) {
          $rotations[] = substr($source, $index) . substr($source, 0, $index);
      }
      return $rotations;
  }
  //#endregion build-rotations
  `,
  'php',
);

const BURROWS_WHEELER_TRANSFORM_KOTLIN = buildStructuredCode(
  `
  /**
   * Builds the Burrows-Wheeler transform of a string.
   * Input: source string terminated with a unique sentinel.
   * Returns: the last column of the sorted rotation matrix.
   */
  //#region burrows-wheeler function open
  fun burrowsWheelerTransform(source: String): String {
      //@step 2
      val rotations = buildRotations(source).toMutableList()

      //@step 3
      rotations.sort()

      val firstColumn = rotations.joinToString("") { it.firstOrNull()?.toString() ?: "" }

      //@step 5
      val lastColumn = rotations.joinToString("") { it.lastOrNull()?.toString() ?: "" }

      //@step 6
      return lastColumn
  }
  //#endregion burrows-wheeler

  //#region build-rotations helper collapsed
  fun buildRotations(source: String): List<String> {
      return (source.indices).map { index ->
          source.substring(index) + source.substring(0, index)
      }
  }
  //#endregion build-rotations
  `,
  'kotlin',
);

export const BURROWS_WHEELER_TRANSFORM_CODE = BURROWS_WHEELER_TRANSFORM_TS.lines;
export const BURROWS_WHEELER_TRANSFORM_CODE_REGIONS = BURROWS_WHEELER_TRANSFORM_TS.regions;
export const BURROWS_WHEELER_TRANSFORM_CODE_HIGHLIGHT_MAP =
  BURROWS_WHEELER_TRANSFORM_TS.highlightMap;
export const BURROWS_WHEELER_TRANSFORM_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BURROWS_WHEELER_TRANSFORM_TS.lines,
    regions: BURROWS_WHEELER_TRANSFORM_TS.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_TS.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: BURROWS_WHEELER_TRANSFORM_JS.lines,
    regions: BURROWS_WHEELER_TRANSFORM_JS.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_JS.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_JS.source,
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
  go: {
    language: 'go',
    lines: BURROWS_WHEELER_TRANSFORM_GO.lines,
    regions: BURROWS_WHEELER_TRANSFORM_GO.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_GO.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_GO.source,
  },
  rust: {
    language: 'rust',
    lines: BURROWS_WHEELER_TRANSFORM_RUST.lines,
    regions: BURROWS_WHEELER_TRANSFORM_RUST.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_RUST.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: BURROWS_WHEELER_TRANSFORM_SWIFT.lines,
    regions: BURROWS_WHEELER_TRANSFORM_SWIFT.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_SWIFT.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: BURROWS_WHEELER_TRANSFORM_PHP.lines,
    regions: BURROWS_WHEELER_TRANSFORM_PHP.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_PHP.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: BURROWS_WHEELER_TRANSFORM_KOTLIN.lines,
    regions: BURROWS_WHEELER_TRANSFORM_KOTLIN.regions,
    highlightMap: BURROWS_WHEELER_TRANSFORM_KOTLIN.highlightMap,
    source: BURROWS_WHEELER_TRANSFORM_KOTLIN.source,
  },
};
