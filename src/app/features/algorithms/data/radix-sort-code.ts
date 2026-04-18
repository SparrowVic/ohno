import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const RADIX_SORT_TS = buildStructuredCode(`
  /**
   * Sort non-negative integers with LSD radix sort in base 10.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region radix-sort function open
  //@step 1
  function radixSort(values: number[]): number[] {
    const maxValue = Math.max(0, ...values);
    const maxDigits = digitCount(maxValue);

    //@step 3
    for (let place = 0; place < maxDigits; place += 1) {
      const buckets = Array.from({ length: 10 }, () => [] as number[]);

      for (const value of values) {
        const digit = getDigit(value, place);
        //@step 7
        buckets[digit].push(value);
      }

      let write = 0;
      for (const bucket of buckets) {
        for (const value of bucket) {
          //@step 11
          values[write] = value;
          write += 1;
        }
      }

      //@step 13
      continue;
    }

    return values;
  }
  //#endregion radix-sort

  //#region digit-count helper collapsed
  function digitCount(value: number): number {
    return Math.max(1, Math.floor(Math.log10(Math.max(1, value))) + 1);
  }
  //#endregion digit-count

  //#region get-digit helper collapsed
  function getDigit(value: number, place: number): number {
    return Math.floor(value / 10 ** place) % 10;
  }
  //#endregion get-digit
`);

const RADIX_SORT_PY = buildStructuredCode(
  `
  """
  Sort non-negative integers with LSD radix sort in base 10.
  Input: mutable list of integers.
  Returns: the same list after in-place sorting.
  """
  //#region radix-sort function open
  //@step 1
  def radix_sort(values: list[int]) -> list[int]:
      max_value = max([0, *values])
      max_digits = digit_count(max_value)

      //@step 3
      for place in range(max_digits):
          buckets = [[] for _ in range(10)]

          for value in values:
              digit = get_digit(value, place)
              //@step 7
              buckets[digit].append(value)

          write = 0
          for bucket in buckets:
              for value in bucket:
                  //@step 11
                  values[write] = value
                  write += 1

          //@step 13
          continue

      return values
  //#endregion radix-sort

  //#region digit-count helper collapsed
  def digit_count(value: int) -> int:
      if value == 0:
          return 1

      digits = 0
      while value > 0:
          digits += 1
          value //= 10
      return digits
  //#endregion digit-count

  //#region get-digit helper collapsed
  def get_digit(value: int, place: int) -> int:
      return (value // (10 ** place)) % 10
  //#endregion get-digit
  `,
  'python',
);

const RADIX_SORT_CS = buildStructuredCode(
  `
  using System.Collections.Generic;
  using System.Linq;

  /// <summary>
  /// Sorts non-negative integers with LSD radix sort in base 10.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region radix-sort function open
  //@step 1
  public static int[] RadixSort(int[] values)
  {
      var maxValue = values.Length == 0 ? 0 : values.Max();
      var maxDigits = DigitCount(maxValue);

      //@step 3
      for (var place = 0; place < maxDigits; place += 1)
      {
          var buckets = Enumerable.Range(0, 10).Select(_ => new List<int>()).ToArray();

          foreach (var value in values)
          {
              var digit = GetDigit(value, place);
              //@step 7
              buckets[digit].Add(value);
          }

          var write = 0;
          foreach (var bucket in buckets)
          {
              foreach (var value in bucket)
              {
                  //@step 11
                  values[write] = value;
                  write += 1;
              }
          }

          //@step 13
          continue;
      }

      return values;
  }
  //#endregion radix-sort

  //#region digit-count helper collapsed
  private static int DigitCount(int value)
  {
      if (value == 0)
      {
          return 1;
      }

      var digits = 0;
      while (value > 0)
      {
          digits += 1;
          value /= 10;
      }
      return digits;
  }
  //#endregion digit-count

  //#region get-digit helper collapsed
  private static int GetDigit(int value, int place)
  {
      return (value / (int)System.Math.Pow(10, place)) % 10;
  }
  //#endregion get-digit
  `,
  'csharp',
);

const RADIX_SORT_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.List;

  /**
   * Sorts non-negative integers with LSD radix sort in base 10.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region radix-sort function open
  //@step 1
  public static int[] radixSort(int[] values) {
      int maxValue = 0;
      for (int value : values) {
          maxValue = Math.max(maxValue, value);
      }

      int maxDigits = digitCount(maxValue);

      //@step 3
      for (int place = 0; place < maxDigits; place += 1) {
          List<List<Integer>> buckets = new ArrayList<>();
          for (int bucket = 0; bucket < 10; bucket += 1) {
              buckets.add(new ArrayList<>());
          }

          for (int value : values) {
              int digit = getDigit(value, place);
              //@step 7
              buckets.get(digit).add(value);
          }

          int write = 0;
          for (List<Integer> bucket : buckets) {
              for (int value : bucket) {
                  //@step 11
                  values[write] = value;
                  write += 1;
              }
          }

          //@step 13
          continue;
      }

      return values;
  }
  //#endregion radix-sort

  //#region digit-count helper collapsed
  private static int digitCount(int value) {
      if (value == 0) {
          return 1;
      }

      int digits = 0;
      while (value > 0) {
          digits += 1;
          value /= 10;
      }
      return digits;
  }
  //#endregion digit-count

  //#region get-digit helper collapsed
  private static int getDigit(int value, int place) {
      return (value / (int) Math.pow(10, place)) % 10;
  }
  //#endregion get-digit
  `,
  'java',
);

const RADIX_SORT_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <vector>

  int digitCount(int value);
  int getDigit(int value, int place);

  /**
   * Sorts non-negative integers with LSD radix sort in base 10.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region radix-sort function open
  //@step 1
  std::vector<int> radixSort(std::vector<int> values) {
      int maxValue = 0;
      for (int value : values) {
          maxValue = std::max(maxValue, value);
      }

      int maxDigits = digitCount(maxValue);

      //@step 3
      for (int place = 0; place < maxDigits; place += 1) {
          std::vector<std::vector<int>> buckets(10);

          for (int value : values) {
              int digit = getDigit(value, place);
              //@step 7
              buckets[digit].push_back(value);
          }

          int write = 0;
          for (const auto& bucket : buckets) {
              for (int value : bucket) {
                  //@step 11
                  values[write] = value;
                  write += 1;
              }
          }

          //@step 13
          continue;
      }

      return values;
  }
  //#endregion radix-sort

  //#region digit-count helper collapsed
  int digitCount(int value) {
      if (value == 0) {
          return 1;
      }

      int digits = 0;
      while (value > 0) {
          digits += 1;
          value /= 10;
      }
      return digits;
  }
  //#endregion digit-count

  //#region get-digit helper collapsed
  int getDigit(int value, int place) {
      int divisor = 1;
      for (int index = 0; index < place; index += 1) {
          divisor *= 10;
      }
      return (value / divisor) % 10;
  }
  //#endregion get-digit
  `,
  'cpp',
);

export const RADIX_SORT_CODE = RADIX_SORT_TS.lines;
export const RADIX_SORT_CODE_REGIONS = RADIX_SORT_TS.regions;
export const RADIX_SORT_CODE_HIGHLIGHT_MAP = RADIX_SORT_TS.highlightMap;
export const RADIX_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: RADIX_SORT_TS.lines, regions: RADIX_SORT_TS.regions, highlightMap: RADIX_SORT_TS.highlightMap, source: RADIX_SORT_TS.source },
  python: { language: 'python', lines: RADIX_SORT_PY.lines, regions: RADIX_SORT_PY.regions, highlightMap: RADIX_SORT_PY.highlightMap, source: RADIX_SORT_PY.source },
  csharp: { language: 'csharp', lines: RADIX_SORT_CS.lines, regions: RADIX_SORT_CS.regions, highlightMap: RADIX_SORT_CS.highlightMap, source: RADIX_SORT_CS.source },
  java: { language: 'java', lines: RADIX_SORT_JAVA.lines, regions: RADIX_SORT_JAVA.regions, highlightMap: RADIX_SORT_JAVA.highlightMap, source: RADIX_SORT_JAVA.source },
  cpp: { language: 'cpp', lines: RADIX_SORT_CPP.lines, regions: RADIX_SORT_CPP.regions, highlightMap: RADIX_SORT_CPP.highlightMap, source: RADIX_SORT_CPP.source },
};
