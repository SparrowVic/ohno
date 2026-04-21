import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const LIS_JS = buildStructuredCode(
  `
  //#region lis-result interface collapsed
  class LisResult {
      constructor(length, sequence) {
          this.length = length;
          this.sequence = sequence;
      }
  }
  //#endregion lis-result

  /**
   * Compute one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  function lisDp(values) {
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

      const sequence = [];
      while (bestIndex !== -1) {
          //@step 11
          sequence.push(values[bestIndex]);
          bestIndex = previous[bestIndex];
      }

      //@step 12
      return new LisResult(sequence.length, sequence.reverse());
  }
  //#endregion lis
  `,
  'javascript',
);

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

const LIS_GO = buildStructuredCode(
  `
  package dp

  //#region lis-result interface collapsed
  type LisResult struct {
      Length   int
      Sequence []int
  }
  //#endregion lis-result

  /**
   * Compute one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  func LisDp(values []int) LisResult {
      //@step 2
      lengths := make([]int, len(values))
      previous := make([]int, len(values))
      for index := range lengths {
          lengths[index] = 1
          previous[index] = -1
      }

      for end := 0; end < len(values); end += 1 {
          for candidate := 0; candidate < end; candidate += 1 {
              //@step 5
              canExtend := values[candidate] < values[end]

              if canExtend && lengths[candidate] + 1 > lengths[end] {
                  //@step 6
                  lengths[end] = lengths[candidate] + 1
                  previous[end] = candidate
              }
          }

          //@step 8
          if lengths[end] < 1 {
              lengths[end] = 1
          }
      }

      //@step 10
      bestIndex := 0
      for index := 1; index < len(values); index += 1 {
          if lengths[index] > lengths[bestIndex] {
              bestIndex = index
          }
      }

      sequence := make([]int, 0)
      for bestIndex != -1 {
          //@step 11
          sequence = append(sequence, values[bestIndex])
          bestIndex = previous[bestIndex]
      }

      for left, right := 0, len(sequence) - 1; left < right; left, right = left + 1, right - 1 {
          sequence[left], sequence[right] = sequence[right], sequence[left]
      }

      //@step 12
      return LisResult{Length: len(sequence), Sequence: sequence}
  }
  //#endregion lis
  `,
  'go',
);

const LIS_RUST = buildStructuredCode(
  `
  //#region lis-result interface collapsed
  struct LisResult {
      length: usize,
      sequence: Vec<i32>,
  }
  //#endregion lis-result

  /**
   * Compute one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  fn lis_dp(values: &[i32]) -> LisResult {
      //@step 2
      let mut lengths = vec![1; values.len()];
      let mut previous = vec![-1isize; values.len()];

      for end in 0..values.len() {
          for candidate in 0..end {
              //@step 5
              let can_extend = values[candidate] < values[end];

              if can_extend && lengths[candidate] + 1 > lengths[end] {
                  //@step 6
                  lengths[end] = lengths[candidate] + 1;
                  previous[end] = candidate as isize;
              }
          }

          //@step 8
          lengths[end] = lengths[end].max(1);
      }

      //@step 10
      let mut best_index = 0usize;
      for index in 1..values.len() {
          if lengths[index] > lengths[best_index] {
              best_index = index;
          }
      }

      let mut sequence = Vec::new();
      let mut current = best_index as isize;
      while current != -1 {
          //@step 11
          sequence.push(values[current as usize]);
          current = previous[current as usize];
      }

      sequence.reverse();

      //@step 12
      LisResult {
          length: sequence.len(),
          sequence,
      }
  }
  //#endregion lis
  `,
  'rust',
);

const LIS_SWIFT = buildStructuredCode(
  `
  //#region lis-result interface collapsed
  struct LisResult {
      let length: Int
      let sequence: [Int]
  }
  //#endregion lis-result

  /**
   * Compute one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  func lisDp(_ values: [Int]) -> LisResult {
      //@step 2
      var lengths = Array(repeating: 1, count: values.count)
      var previous = Array(repeating: -1, count: values.count)

      for end in 0..<values.count {
          for candidate in 0..<end {
              //@step 5
              let canExtend = values[candidate] < values[end]

              if canExtend && lengths[candidate] + 1 > lengths[end] {
                  //@step 6
                  lengths[end] = lengths[candidate] + 1
                  previous[end] = candidate
              }
          }

          //@step 8
          lengths[end] = max(lengths[end], 1)
      }

      //@step 10
      var bestIndex = 0
      for index in 1..<values.count {
          if lengths[index] > lengths[bestIndex] {
              bestIndex = index
          }
      }

      var sequence: [Int] = []
      while bestIndex != -1 {
          //@step 11
          sequence.append(values[bestIndex])
          bestIndex = previous[bestIndex]
      }

      //@step 12
      return LisResult(length: sequence.count, sequence: sequence.reversed())
  }
  //#endregion lis
  `,
  'swift',
);

const LIS_PHP = buildStructuredCode(
  `
  <?php

  //#region lis-result interface collapsed
  final class LisResult
  {
      public function __construct(
          public int $length,
          public array $sequence,
      ) {}
  }
  //#endregion lis-result

  /**
   * Compute one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  function lisDp(array $values): LisResult
  {
      //@step 2
      $lengths = array_fill(0, count($values), 1);
      $previous = array_fill(0, count($values), -1);

      for ($end = 0; $end < count($values); $end += 1) {
          for ($candidate = 0; $candidate < $end; $candidate += 1) {
              //@step 5
              $canExtend = $values[$candidate] < $values[$end];

              if ($canExtend && $lengths[$candidate] + 1 > $lengths[$end]) {
                  //@step 6
                  $lengths[$end] = $lengths[$candidate] + 1;
                  $previous[$end] = $candidate;
              }
          }

          //@step 8
          $lengths[$end] = max($lengths[$end], 1);
      }

      //@step 10
      $bestIndex = 0;
      for ($index = 1; $index < count($values); $index += 1) {
          if ($lengths[$index] > $lengths[$bestIndex]) {
              $bestIndex = $index;
          }
      }

      $sequence = [];
      while ($bestIndex !== -1) {
          //@step 11
          $sequence[] = $values[$bestIndex];
          $bestIndex = $previous[$bestIndex];
      }

      //@step 12
      return new LisResult(count($sequence), array_reverse($sequence));
  }
  //#endregion lis
  `,
  'php',
);

const LIS_KOTLIN = buildStructuredCode(
  `
  //#region lis-result interface collapsed
  data class LisResult(val length: Int, val sequence: List<Int>)
  //#endregion lis-result

  /**
   * Compute one longest increasing subsequence with O(n^2) dynamic programming.
   * Input: numeric sequence.
   * Returns: LIS length and one optimal subsequence.
   */
  //#region lis function open
  fun lisDp(values: List<Int>): LisResult {
      //@step 2
      val lengths = MutableList(values.size) { 1 }
      val previous = MutableList(values.size) { -1 }

      for (end in values.indices) {
          for (candidate in 0 until end) {
              //@step 5
              val canExtend = values[candidate] < values[end]

              if (canExtend && lengths[candidate] + 1 > lengths[end]) {
                  //@step 6
                  lengths[end] = lengths[candidate] + 1
                  previous[end] = candidate
              }
          }

          //@step 8
          lengths[end] = maxOf(lengths[end], 1)
      }

      //@step 10
      var bestIndex = 0
      for (index in 1 until values.size) {
          if (lengths[index] > lengths[bestIndex]) {
              bestIndex = index
          }
      }

      val sequence = mutableListOf<Int>()
      while (bestIndex != -1) {
          //@step 11
          sequence += values[bestIndex]
          bestIndex = previous[bestIndex]
      }

      //@step 12
      return LisResult(sequence.size, sequence.asReversed())
  }
  //#endregion lis
  `,
  'kotlin',
);

export const LONGEST_INCREASING_SUBSEQUENCE_CODE = LIS_TS.lines;
export const LONGEST_INCREASING_SUBSEQUENCE_CODE_REGIONS = LIS_TS.regions;
export const LONGEST_INCREASING_SUBSEQUENCE_CODE_HIGHLIGHT_MAP = LIS_TS.highlightMap;
export const LONGEST_INCREASING_SUBSEQUENCE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: LIS_TS.lines,
    regions: LIS_TS.regions,
    highlightMap: LIS_TS.highlightMap,
    source: LIS_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: LIS_JS.lines,
    regions: LIS_JS.regions,
    highlightMap: LIS_JS.highlightMap,
    source: LIS_JS.source,
  },
  python: {
    language: 'python',
    lines: LIS_PY.lines,
    regions: LIS_PY.regions,
    highlightMap: LIS_PY.highlightMap,
    source: LIS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: LIS_CS.lines,
    regions: LIS_CS.regions,
    highlightMap: LIS_CS.highlightMap,
    source: LIS_CS.source,
  },
  java: {
    language: 'java',
    lines: LIS_JAVA.lines,
    regions: LIS_JAVA.regions,
    highlightMap: LIS_JAVA.highlightMap,
    source: LIS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: LIS_CPP.lines,
    regions: LIS_CPP.regions,
    highlightMap: LIS_CPP.highlightMap,
    source: LIS_CPP.source,
  },
  go: {
    language: 'go',
    lines: LIS_GO.lines,
    regions: LIS_GO.regions,
    highlightMap: LIS_GO.highlightMap,
    source: LIS_GO.source,
  },
  rust: {
    language: 'rust',
    lines: LIS_RUST.lines,
    regions: LIS_RUST.regions,
    highlightMap: LIS_RUST.highlightMap,
    source: LIS_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: LIS_SWIFT.lines,
    regions: LIS_SWIFT.regions,
    highlightMap: LIS_SWIFT.highlightMap,
    source: LIS_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: LIS_PHP.lines,
    regions: LIS_PHP.regions,
    highlightMap: LIS_PHP.highlightMap,
    source: LIS_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: LIS_KOTLIN.lines,
    regions: LIS_KOTLIN.regions,
    highlightMap: LIS_KOTLIN.highlightMap,
    source: LIS_KOTLIN.source,
  },
};
