import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const LIS_TS = buildStructuredCode(`
  //#region lis-result interface collapsed
  interface LisResult {
    readonly length: number;
    readonly sequence: number[];
  }
  //#endregion lis-result

  /**
   * Compute one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  function lisDp(values: number[]): LisResult {
    //@step 2
    const lengths = Array.from({ length: values.length }, () => 1);
    const previous = Array.from({ length: values.length }, () => -1);

    for (let end = 0; end < values.length; end += 1) {
      for (let candidate = 0; candidate < end; candidate += 1) {
        //@step 5
        const canExtend = values[candidate] < values[end];

        if (canExtend && lengths[candidate] + 1 > lengths[end]) {
          //@step 6
          lengths[end] = lengths[candidate] + 1;
          previous[end] = candidate;
        }
      }

      //@step 8
      lengths[end] = Math.max(lengths[end], 1);
    }

    //@step 10
    let bestIndex = 0;
    for (let index = 1; index < values.length; index += 1) {
      if (lengths[index] > lengths[bestIndex]) {
        bestIndex = index;
      }
    }

    const sequence: number[] = [];
    while (bestIndex !== -1) {
      //@step 11
      sequence.push(values[bestIndex]);
      bestIndex = previous[bestIndex];
    }

    //@step 12
    return {
      length: sequence.length,
      sequence: sequence.reverse(),
    };
  }
  //#endregion lis
`);

const LIS_PY = buildStructuredCode(
  `
  from typing import TypedDict


  //#region lis-result interface collapsed
  class LisResult(TypedDict):
      length: int
      sequence: list[int]
  //#endregion lis-result

  """
  Compute one longest increasing subsequence with O(n^2) dynamic programming.
  Input: numeric sequence.
  Returns: LIS length and one optimal subsequence.
  """
  //#region lis function open
  def lis_dp(values: list[int]) -> LisResult:
      //@step 2
      lengths = [1] * len(values)
      previous = [-1] * len(values)

      for end in range(len(values)):
          for candidate in range(end):
              //@step 5
              can_extend = values[candidate] < values[end]

              if can_extend and lengths[candidate] + 1 > lengths[end]:
                  //@step 6
                  lengths[end] = lengths[candidate] + 1
                  previous[end] = candidate

          //@step 8
          lengths[end] = max(lengths[end], 1)

      //@step 10
      best_index = 0
      for index in range(1, len(values)):
          if lengths[index] > lengths[best_index]:
              best_index = index

      sequence: list[int] = []
      while best_index != -1:
          //@step 11
          sequence.append(values[best_index])
          best_index = previous[best_index]

      //@step 12
      return {"length": len(sequence), "sequence": list(reversed(sequence))}
  //#endregion lis
  `,
  'python',
);

const LIS_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  //#region lis-result interface collapsed
  public sealed class LisResult
  {
      public required int Length { get; init; }
      public required List<int> Sequence { get; init; }
  }
  //#endregion lis-result

  /// <summary>
  /// Computes one longest increasing subsequence with O(n^2) dynamic programming.
  /// Input: numeric sequence.
  /// Returns: LIS length and one optimal subsequence.
  /// </summary>
  //#region lis function open
  public static LisResult LisDp(IReadOnlyList<int> values)
  {
      //@step 2
      var lengths = new int[values.Count];
      var previous = new int[values.Count];
      Array.Fill(lengths, 1);
      Array.Fill(previous, -1);

      for (var end = 0; end < values.Count; end += 1)
      {
          for (var candidate = 0; candidate < end; candidate += 1)
          {
              //@step 5
              var canExtend = values[candidate] < values[end];

              if (canExtend && lengths[candidate] + 1 > lengths[end])
              {
                  //@step 6
                  lengths[end] = lengths[candidate] + 1;
                  previous[end] = candidate;
              }
          }

          //@step 8
          lengths[end] = Math.Max(lengths[end], 1);
      }

      //@step 10
      var bestIndex = 0;
      for (var index = 1; index < values.Count; index += 1)
      {
          if (lengths[index] > lengths[bestIndex])
          {
              bestIndex = index;
          }
      }

      var sequence = new List<int>();
      while (bestIndex != -1)
      {
          //@step 11
          sequence.Add(values[bestIndex]);
          bestIndex = previous[bestIndex];
      }

      sequence.Reverse();

      //@step 12
      return new LisResult { Length = sequence.Count, Sequence = sequence };
  }
  //#endregion lis
  `,
  'csharp',
);

const LIS_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Arrays;
  import java.util.Collections;
  import java.util.List;

  //#region lis-result interface collapsed
  public record LisResult(int length, List<Integer> sequence) {}
  //#endregion lis-result

  /**
   * Computes one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  public static LisResult lisDp(List<Integer> values) {
      //@step 2
      int[] lengths = new int[values.size()];
      int[] previous = new int[values.size()];
      Arrays.fill(lengths, 1);
      Arrays.fill(previous, -1);

      for (int end = 0; end < values.size(); end += 1) {
          for (int candidate = 0; candidate < end; candidate += 1) {
              //@step 5
              boolean canExtend = values.get(candidate) < values.get(end);

              if (canExtend && lengths[candidate] + 1 > lengths[end]) {
                  //@step 6
                  lengths[end] = lengths[candidate] + 1;
                  previous[end] = candidate;
              }
          }

          //@step 8
          lengths[end] = Math.max(lengths[end], 1);
      }

      //@step 10
      int bestIndex = 0;
      for (int index = 1; index < values.size(); index += 1) {
          if (lengths[index] > lengths[bestIndex]) {
              bestIndex = index;
          }
      }

      List<Integer> sequence = new ArrayList<>();
      while (bestIndex != -1) {
          //@step 11
          sequence.add(values.get(bestIndex));
          bestIndex = previous[bestIndex];
      }

      Collections.reverse(sequence);

      //@step 12
      return new LisResult(sequence.size(), sequence);
  }
  //#endregion lis
  `,
  'java',
);

const LIS_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <vector>

  //#region lis-result interface collapsed
  struct LisResult {
      int length;
      std::vector<int> sequence;
  };
  //#endregion lis-result

  /**
   * Computes one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  LisResult lisDp(const std::vector<int>& values) {
      //@step 2
      std::vector<int> lengths(values.size(), 1);
      std::vector<int> previous(values.size(), -1);

      for (std::size_t end = 0; end < values.size(); end += 1) {
          for (std::size_t candidate = 0; candidate < end; candidate += 1) {
              //@step 5
              bool canExtend = values[candidate] < values[end];

              if (canExtend && lengths[candidate] + 1 > lengths[end]) {
                  //@step 6
                  lengths[end] = lengths[candidate] + 1;
                  previous[end] = static_cast<int>(candidate);
              }
          }

          //@step 8
          lengths[end] = std::max(lengths[end], 1);
      }

      //@step 10
      std::size_t bestIndex = 0;
      for (std::size_t index = 1; index < values.size(); index += 1) {
          if (lengths[index] > lengths[bestIndex]) {
              bestIndex = index;
          }
      }

      std::vector<int> sequence;
      for (int index = static_cast<int>(bestIndex); index != -1; index = previous[index]) {
          //@step 11
          sequence.push_back(values[index]);
      }

      std::reverse(sequence.begin(), sequence.end());

      //@step 12
      return {static_cast<int>(sequence.size()), sequence};
  }
  //#endregion lis
  `,
  'cpp',
);

export const LONGEST_INCREASING_SUBSEQUENCE_CODE = LIS_TS.lines;
export const LONGEST_INCREASING_SUBSEQUENCE_CODE_REGIONS = LIS_TS.regions;
export const LONGEST_INCREASING_SUBSEQUENCE_CODE_HIGHLIGHT_MAP = LIS_TS.highlightMap;
export const LONGEST_INCREASING_SUBSEQUENCE_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: LIS_TS.lines, regions: LIS_TS.regions, highlightMap: LIS_TS.highlightMap, source: LIS_TS.source },
  python: { language: 'python', lines: LIS_PY.lines, regions: LIS_PY.regions, highlightMap: LIS_PY.highlightMap, source: LIS_PY.source },
  csharp: { language: 'csharp', lines: LIS_CS.lines, regions: LIS_CS.regions, highlightMap: LIS_CS.highlightMap, source: LIS_CS.source },
  java: { language: 'java', lines: LIS_JAVA.lines, regions: LIS_JAVA.regions, highlightMap: LIS_JAVA.highlightMap, source: LIS_JAVA.source },
  cpp: { language: 'cpp', lines: LIS_CPP.lines, regions: LIS_CPP.regions, highlightMap: LIS_CPP.highlightMap, source: LIS_CPP.source },
};
