import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const KMP_TS = buildStructuredCode(`
  /**
   * Find every occurrence of pattern in text with Knuth-Morris-Pratt.
   * Input: text and pattern strings.
   * Returns: all start indices where pattern occurs in text.
   */
  //#region kmp-search function open
  //@step 1
  function kmpSearch(text: string, pattern: string): number[] {
    if (pattern.length === 0) {
      return [];
    }

    const matches: number[] = [];
    const failure = buildFailureTable(pattern);

    //@step 3
    let textIndex = 0;
    let patternIndex = 0;

    while (textIndex < text.length) {
      //@step 5
      if (text[textIndex] === pattern[patternIndex]) {
        //@step 6
        textIndex++;
        patternIndex++;

        if (patternIndex === pattern.length) {
          //@step 8
          matches.push(textIndex - patternIndex);
          patternIndex = failure[patternIndex - 1] ?? 0;
        }

        continue;
      }

      if (patternIndex > 0) {
        //@step 10
        patternIndex = failure[patternIndex - 1] ?? 0;
        continue;
      }

      //@step 11
      textIndex++;
    }

    return matches;
  }
  //#endregion kmp-search

  //#region failure-table helper collapsed
  //@step 2
  function buildFailureTable(pattern: string): number[] {
    const failure = Array.from({ length: pattern.length }, () => 0);
    let prefix = 0;

    for (let index = 1; index < pattern.length; index += 1) {
      while (prefix > 0 && pattern[index] !== pattern[prefix]) {
        prefix = failure[prefix - 1] ?? 0;
      }

      if (pattern[index] === pattern[prefix]) {
        prefix++;
      }

      failure[index] = prefix;
    }

    return failure;
  }
  //#endregion failure-table
`);

const KMP_PY = buildStructuredCode(
  `
  """
  Find every occurrence of pattern in text with Knuth-Morris-Pratt.
  Input: text and pattern strings.
  Returns: all start indices where pattern occurs in text.
  """
  //#region kmp-search function open
  //@step 1
  def kmp_search(text: str, pattern: str) -> list[int]:
      if not pattern:
          return []

      matches: list[int] = []
      failure = build_failure_table(pattern)

      //@step 3
      text_index = 0
      pattern_index = 0

      while text_index < len(text):
          //@step 5
          if text[text_index] == pattern[pattern_index]:
              //@step 6
              text_index += 1
              pattern_index += 1

              if pattern_index == len(pattern):
                  //@step 8
                  matches.append(text_index - pattern_index)
                  pattern_index = failure[pattern_index - 1]

              continue

          if pattern_index > 0:
              //@step 10
              pattern_index = failure[pattern_index - 1]
              continue

          //@step 11
          text_index += 1

      return matches
  //#endregion kmp-search

  //#region failure-table helper collapsed
  //@step 2
  def build_failure_table(pattern: str) -> list[int]:
      failure = [0] * len(pattern)
      prefix = 0

      for index in range(1, len(pattern)):
          while prefix > 0 and pattern[index] != pattern[prefix]:
              prefix = failure[prefix - 1]

          if pattern[index] == pattern[prefix]:
              prefix += 1

          failure[index] = prefix

      return failure
  //#endregion failure-table
  `,
  'python',
);

const KMP_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  /// <summary>
  /// Finds every occurrence of pattern in text with Knuth-Morris-Pratt.
  /// Input: text and pattern strings.
  /// Returns: all start indices where pattern occurs in text.
  /// </summary>
  //#region kmp-search function open
  //@step 1
  public static List<int> KmpSearch(string text, string pattern)
  {
      if (pattern.Length == 0)
      {
          return [];
      }

      var matches = new List<int>();
      var failure = BuildFailureTable(pattern);

      //@step 3
      var textIndex = 0;
      var patternIndex = 0;

      while (textIndex < text.Length)
      {
          //@step 5
          if (text[textIndex] == pattern[patternIndex])
          {
              //@step 6
              textIndex += 1;
              patternIndex += 1;

              if (patternIndex == pattern.Length)
              {
                  //@step 8
                  matches.Add(textIndex - patternIndex);
                  patternIndex = failure[patternIndex - 1];
              }

              continue;
          }

          if (patternIndex > 0)
          {
              //@step 10
              patternIndex = failure[patternIndex - 1];
              continue;
          }

          //@step 11
          textIndex += 1;
      }

      return matches;
  }
  //#endregion kmp-search

  //#region failure-table helper collapsed
  //@step 2
  private static int[] BuildFailureTable(string pattern)
  {
      var failure = new int[pattern.Length];
      var prefix = 0;

      for (var index = 1; index < pattern.Length; index += 1)
      {
          while (prefix > 0 && pattern[index] != pattern[prefix])
          {
              prefix = failure[prefix - 1];
          }

          if (pattern[index] == pattern[prefix])
          {
              prefix += 1;
          }

          failure[index] = prefix;
      }

      return failure;
  }
  //#endregion failure-table
  `,
  'csharp',
);

const KMP_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.List;

  /**
   * Finds every occurrence of pattern in text with Knuth-Morris-Pratt.
   * Input: text and pattern strings.
   * Returns: all start indices where pattern occurs in text.
   */
  //#region kmp-search function open
  //@step 1
  public static List<Integer> kmpSearch(String text, String pattern) {
      if (pattern.isEmpty()) {
          return List.of();
      }

      List<Integer> matches = new ArrayList<>();
      int[] failure = buildFailureTable(pattern);

      //@step 3
      int textIndex = 0;
      int patternIndex = 0;

      while (textIndex < text.length()) {
          //@step 5
          if (text.charAt(textIndex) == pattern.charAt(patternIndex)) {
              //@step 6
              textIndex += 1;
              patternIndex += 1;

              if (patternIndex == pattern.length()) {
                  //@step 8
                  matches.add(textIndex - patternIndex);
                  patternIndex = failure[patternIndex - 1];
              }

              continue;
          }

          if (patternIndex > 0) {
              //@step 10
              patternIndex = failure[patternIndex - 1];
              continue;
          }

          //@step 11
          textIndex += 1;
      }

      return matches;
  }
  //#endregion kmp-search

  //#region failure-table helper collapsed
  //@step 2
  private static int[] buildFailureTable(String pattern) {
      int[] failure = new int[pattern.length()];
      int prefix = 0;

      for (int index = 1; index < pattern.length(); index += 1) {
          while (prefix > 0 && pattern.charAt(index) != pattern.charAt(prefix)) {
              prefix = failure[prefix - 1];
          }

          if (pattern.charAt(index) == pattern.charAt(prefix)) {
              prefix += 1;
          }

          failure[index] = prefix;
      }

      return failure;
  }
  //#endregion failure-table
  `,
  'java',
);

const KMP_CPP = buildStructuredCode(
  `
  #include <string>
  #include <vector>

  /**
   * Finds every occurrence of pattern in text with Knuth-Morris-Pratt.
   * Input: text and pattern strings.
   * Returns: all start indices where pattern occurs in text.
   */
  //#region kmp-search function open
  //@step 1
  std::vector<int> kmpSearch(const std::string& text, const std::string& pattern) {
      if (pattern.empty()) {
          return {};
      }

      std::vector<int> matches;
      auto failure = buildFailureTable(pattern);

      //@step 3
      int textIndex = 0;
      int patternIndex = 0;

      while (textIndex < static_cast<int>(text.size())) {
          //@step 5
          if (text[textIndex] == pattern[patternIndex]) {
              //@step 6
              textIndex += 1;
              patternIndex += 1;

              if (patternIndex == static_cast<int>(pattern.size())) {
                  //@step 8
                  matches.push_back(textIndex - patternIndex);
                  patternIndex = failure[patternIndex - 1];
              }

              continue;
          }

          if (patternIndex > 0) {
              //@step 10
              patternIndex = failure[patternIndex - 1];
              continue;
          }

          //@step 11
          textIndex += 1;
      }

      return matches;
  }
  //#endregion kmp-search

  //#region failure-table helper collapsed
  //@step 2
  std::vector<int> buildFailureTable(const std::string& pattern) {
      std::vector<int> failure(pattern.size(), 0);
      int prefix = 0;

      for (int index = 1; index < static_cast<int>(pattern.size()); index += 1) {
          while (prefix > 0 && pattern[index] != pattern[prefix]) {
              prefix = failure[prefix - 1];
          }

          if (pattern[index] == pattern[prefix]) {
              prefix += 1;
          }

          failure[index] = prefix;
      }

      return failure;
  }
  //#endregion failure-table
  `,
  'cpp',
);

export const KMP_PATTERN_MATCHING_CODE = KMP_TS.lines;
export const KMP_PATTERN_MATCHING_CODE_REGIONS = KMP_TS.regions;
export const KMP_PATTERN_MATCHING_CODE_HIGHLIGHT_MAP = KMP_TS.highlightMap;
export const KMP_PATTERN_MATCHING_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: KMP_TS.lines,
    regions: KMP_TS.regions,
    highlightMap: KMP_TS.highlightMap,
    source: KMP_TS.source,
  },
  python: {
    language: 'python',
    lines: KMP_PY.lines,
    regions: KMP_PY.regions,
    highlightMap: KMP_PY.highlightMap,
    source: KMP_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: KMP_CS.lines,
    regions: KMP_CS.regions,
    highlightMap: KMP_CS.highlightMap,
    source: KMP_CS.source,
  },
  java: {
    language: 'java',
    lines: KMP_JAVA.lines,
    regions: KMP_JAVA.regions,
    highlightMap: KMP_JAVA.highlightMap,
    source: KMP_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: KMP_CPP.lines,
    regions: KMP_CPP.regions,
    highlightMap: KMP_CPP.highlightMap,
    source: KMP_CPP.source,
  },
};
