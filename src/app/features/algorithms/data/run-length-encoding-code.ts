import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const RLE_TS = buildStructuredCode(`
  //#region run type collapsed
  interface Run {
    readonly char: string;
    readonly count: number;
  }
  //#endregion run

  /**
   * Encode a string with run-length encoding.
   * Input: source string.
   * Returns: consecutive runs as (char, count) pairs.
   */
  //#region rle function open
  //@step 1
  function runLengthEncode(source: string): Run[] {
    const runs: Run[] = [];
    let index = 0;

    while (index < source.length) {
      //@step 4
      const char = source[index]!;
      let next = index + 1;
      let count = 1;

      //@step 6
      while (next < source.length && source[next] === char) {
        next++;
        count++;
      }

      //@step 8
      runs.push({ char, count });
      index = next;
    }

    return runs;
  }
  //#endregion rle
`);

const RLE_PY = buildStructuredCode(
  `
  from dataclasses import dataclass


  //#region run type collapsed
  @dataclass(frozen=True)
  class Run:
      char: str
      count: int
  //#endregion run

  """
  Encode a string with run-length encoding.
  Input: source string.
  Returns: consecutive runs as (char, count) pairs.
  """
  //#region rle function open
  //@step 1
  def run_length_encode(source: str) -> list[Run]:
      runs: list[Run] = []
      index = 0

      while index < len(source):
          //@step 4
          char = source[index]
          next_index = index + 1
          count = 1

          //@step 6
          while next_index < len(source) and source[next_index] == char:
              next_index += 1
              count += 1

          //@step 8
          runs.append(Run(char=char, count=count))
          index = next_index

      return runs
  //#endregion rle
  `,
  'python',
);

const RLE_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  //#region run type collapsed
  public readonly record struct Run(char Char, int Count);
  //#endregion run

  /// <summary>
  /// Encodes a string with run-length encoding.
  /// Input: source string.
  /// Returns: consecutive runs as (char, count) pairs.
  /// </summary>
  //#region rle function open
  //@step 1
  public static List<Run> RunLengthEncode(string source)
  {
      var runs = new List<Run>();
      var index = 0;

      while (index < source.Length)
      {
          //@step 4
          var ch = source[index];
          var next = index + 1;
          var count = 1;

          //@step 6
          while (next < source.Length && source[next] == ch)
          {
              next += 1;
              count += 1;
          }

          //@step 8
          runs.Add(new Run(ch, count));
          index = next;
      }

      return runs;
  }
  //#endregion rle
  `,
  'csharp',
);

const RLE_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.List;

  //#region run type collapsed
  public record Run(char ch, int count) {}
  //#endregion run

  /**
   * Encodes a string with run-length encoding.
   * Input: source string.
   * Returns: consecutive runs as (char, count) pairs.
   */
  //#region rle function open
  //@step 1
  public static List<Run> runLengthEncode(String source) {
      List<Run> runs = new ArrayList<>();
      int index = 0;

      while (index < source.length()) {
          //@step 4
          char ch = source.charAt(index);
          int next = index + 1;
          int count = 1;

          //@step 6
          while (next < source.length() && source.charAt(next) == ch) {
              next += 1;
              count += 1;
          }

          //@step 8
          runs.add(new Run(ch, count));
          index = next;
      }

      return runs;
  }
  //#endregion rle
  `,
  'java',
);

const RLE_CPP = buildStructuredCode(
  `
  #include <string>
  #include <vector>

  //#region run type collapsed
  struct Run {
      char ch;
      int count;
  };
  //#endregion run

  /**
   * Encodes a string with run-length encoding.
   * Input: source string.
   * Returns: consecutive runs as (char, count) pairs.
   */
  //#region rle function open
  //@step 1
  std::vector<Run> runLengthEncode(const std::string& source) {
      std::vector<Run> runs;
      int index = 0;

      while (index < static_cast<int>(source.size())) {
          //@step 4
          char ch = source[index];
          int next = index + 1;
          int count = 1;

          //@step 6
          while (next < static_cast<int>(source.size()) && source[next] == ch) {
              next += 1;
              count += 1;
          }

          //@step 8
          runs.push_back({ch, count});
          index = next;
      }

      return runs;
  }
  //#endregion rle
  `,
  'cpp',
);

export const RLE_CODE = RLE_TS.lines;
export const RLE_CODE_REGIONS = RLE_TS.regions;
export const RLE_CODE_HIGHLIGHT_MAP = RLE_TS.highlightMap;
export const RLE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: RLE_TS.lines,
    regions: RLE_TS.regions,
    highlightMap: RLE_TS.highlightMap,
    source: RLE_TS.source,
  },
  python: {
    language: 'python',
    lines: RLE_PY.lines,
    regions: RLE_PY.regions,
    highlightMap: RLE_PY.highlightMap,
    source: RLE_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: RLE_CS.lines,
    regions: RLE_CS.regions,
    highlightMap: RLE_CS.highlightMap,
    source: RLE_CS.source,
  },
  java: {
    language: 'java',
    lines: RLE_JAVA.lines,
    regions: RLE_JAVA.regions,
    highlightMap: RLE_JAVA.highlightMap,
    source: RLE_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: RLE_CPP.lines,
    regions: RLE_CPP.regions,
    highlightMap: RLE_CPP.highlightMap,
    source: RLE_CPP.source,
  },
};
