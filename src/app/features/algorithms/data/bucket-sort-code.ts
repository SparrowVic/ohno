import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const BUCKET_SORT_TS = buildStructuredCode(`
  /**
   * Sort integers by scattering them into value buckets, sorting each bucket, and concatenating.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region bucket-sort function open
  //@step 1
  function bucketSort(values: number[]): number[] {
    if (values.length === 0) {
      return values;
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const buckets = Array.from(
      { length: Math.max(1, Math.ceil(Math.sqrt(values.length))) },
      () => [] as number[],
    );

    //@step 5
    for (const value of values) {
      buckets[bucketIndex(value, minValue, maxValue, buckets.length)].push(value);
    }

    let write = 0;
    for (const bucket of buckets) {
      //@step 8
      bucket.sort((left, right) => left - right);

      for (const value of bucket) {
        //@step 10
        values[write] = value;
        write += 1;
      }
    }

    //@step 13
    return values;
  }
  //#endregion bucket-sort

  //#region bucket-index helper collapsed
  function bucketIndex(
    value: number,
    minValue: number,
    maxValue: number,
    bucketCount: number,
  ): number {
    const span = Math.max(1, Math.floor((maxValue - minValue) / bucketCount) + 1);
    return Math.min(bucketCount - 1, Math.floor((value - minValue) / span));
  }
  //#endregion bucket-index
`);

const BUCKET_SORT_PY = buildStructuredCode(
  `
  import math

  """
  Sort integers by scattering them into value buckets, sorting each bucket, and concatenating.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region bucket-sort function open
  //@step 1
  def bucket_sort(values: list[int]) -> list[int]:
      if not values:
          return values

      min_value = min(values)
      max_value = max(values)
      bucket_count = max(1, math.ceil(math.sqrt(len(values))))
      buckets = [[] for _ in range(bucket_count)]

      //@step 5
      for value in values:
          buckets[bucket_index(value, min_value, max_value, bucket_count)].append(value)

      write = 0
      for bucket in buckets:
          //@step 8
          bucket.sort()

          for value in bucket:
              //@step 10
              values[write] = value
              write += 1

      //@step 13
      return values
  //#endregion bucket-sort

  //#region bucket-index helper collapsed
  def bucket_index(value: int, min_value: int, max_value: int, bucket_count: int) -> int:
      span = max(1, (max_value - min_value) // bucket_count + 1)
      return min(bucket_count - 1, (value - min_value) // span)
  //#endregion bucket-index
  `,
  'python',
);

const BUCKET_SORT_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;
  using System.Linq;

  /// <summary>
  /// Sorts integers by scattering them into value buckets, sorting each bucket, and concatenating.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region bucket-sort function open
  //@step 1
  public static int[] BucketSort(int[] values)
  {
      if (values.Length == 0)
      {
          return values;
      }

      var minValue = values.Min();
      var maxValue = values.Max();
      var bucketCount = Math.Max(1, (int)Math.Ceiling(Math.Sqrt(values.Length)));
      var buckets = new List<int>[bucketCount];
      for (var bucket = 0; bucket < bucketCount; bucket += 1)
      {
          buckets[bucket] = new List<int>();
      }

      //@step 5
      foreach (var value in values)
      {
          buckets[BucketIndex(value, minValue, maxValue, bucketCount)].Add(value);
      }

      var write = 0;
      foreach (var bucket in buckets)
      {
          //@step 8
          bucket.Sort();

          foreach (var value in bucket)
          {
              //@step 10
              values[write] = value;
              write += 1;
          }
      }

      //@step 13
      return values;
  }
  //#endregion bucket-sort

  //#region bucket-index helper collapsed
  private static int BucketIndex(int value, int minValue, int maxValue, int bucketCount)
  {
      var span = Math.Max(1, (maxValue - minValue) / bucketCount + 1);
      return Math.Min(bucketCount - 1, (value - minValue) / span);
  }
  //#endregion bucket-index
  `,
  'csharp',
);

const BUCKET_SORT_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Collections;
  import java.util.List;

  /**
   * Sorts integers by scattering them into value buckets, sorting each bucket, and concatenating.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region bucket-sort function open
  //@step 1
  public static int[] bucketSort(int[] values) {
      if (values.length == 0) {
          return values;
      }

      int minValue = values[0];
      int maxValue = values[0];
      for (int value : values) {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
      }

      int bucketCount = Math.max(1, (int) Math.ceil(Math.sqrt(values.length)));
      List<List<Integer>> buckets = new ArrayList<>();
      for (int bucket = 0; bucket < bucketCount; bucket += 1) {
          buckets.add(new ArrayList<>());
      }

      //@step 5
      for (int value : values) {
          buckets.get(bucketIndex(value, minValue, maxValue, bucketCount)).add(value);
      }

      int write = 0;
      for (List<Integer> bucket : buckets) {
          //@step 8
          Collections.sort(bucket);

          for (int value : bucket) {
              //@step 10
              values[write] = value;
              write += 1;
          }
      }

      //@step 13
      return values;
  }
  //#endregion bucket-sort

  //#region bucket-index helper collapsed
  private static int bucketIndex(int value, int minValue, int maxValue, int bucketCount) {
      int span = Math.max(1, (maxValue - minValue) / bucketCount + 1);
      return Math.min(bucketCount - 1, (value - minValue) / span);
  }
  //#endregion bucket-index
  `,
  'java',
);

const BUCKET_SORT_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <cmath>
  #include <vector>

  int bucketIndex(int value, int minValue, int maxValue, int bucketCount);

  /**
   * Sorts integers by scattering them into value buckets, sorting each bucket, and concatenating.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region bucket-sort function open
  //@step 1
  std::vector<int> bucketSort(std::vector<int> values) {
      if (values.empty()) {
          return values;
      }

      int minValue = *std::min_element(values.begin(), values.end());
      int maxValue = *std::max_element(values.begin(), values.end());
      int bucketCount = std::max(1, static_cast<int>(std::ceil(std::sqrt(values.size()))));
      std::vector<std::vector<int>> buckets(bucketCount);

      //@step 5
      for (int value : values) {
          buckets[bucketIndex(value, minValue, maxValue, bucketCount)].push_back(value);
      }

      int write = 0;
      for (auto& bucket : buckets) {
          //@step 8
          std::sort(bucket.begin(), bucket.end());

          for (int value : bucket) {
              //@step 10
              values[write] = value;
              write += 1;
          }
      }

      //@step 13
      return values;
  }
  //#endregion bucket-sort

  //#region bucket-index helper collapsed
  int bucketIndex(int value, int minValue, int maxValue, int bucketCount) {
      int span = std::max(1, (maxValue - minValue) / bucketCount + 1);
      return std::min(bucketCount - 1, (value - minValue) / span);
  }
  //#endregion bucket-index
  `,
  'cpp',
);

export const BUCKET_SORT_CODE = BUCKET_SORT_TS.lines;
export const BUCKET_SORT_CODE_REGIONS = BUCKET_SORT_TS.regions;
export const BUCKET_SORT_CODE_HIGHLIGHT_MAP = BUCKET_SORT_TS.highlightMap;
export const BUCKET_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: BUCKET_SORT_TS.lines, regions: BUCKET_SORT_TS.regions, highlightMap: BUCKET_SORT_TS.highlightMap, source: BUCKET_SORT_TS.source },
  python: { language: 'python', lines: BUCKET_SORT_PY.lines, regions: BUCKET_SORT_PY.regions, highlightMap: BUCKET_SORT_PY.highlightMap, source: BUCKET_SORT_PY.source },
  csharp: { language: 'csharp', lines: BUCKET_SORT_CS.lines, regions: BUCKET_SORT_CS.regions, highlightMap: BUCKET_SORT_CS.highlightMap, source: BUCKET_SORT_CS.source },
  java: { language: 'java', lines: BUCKET_SORT_JAVA.lines, regions: BUCKET_SORT_JAVA.regions, highlightMap: BUCKET_SORT_JAVA.highlightMap, source: BUCKET_SORT_JAVA.source },
  cpp: { language: 'cpp', lines: BUCKET_SORT_CPP.lines, regions: BUCKET_SORT_CPP.regions, highlightMap: BUCKET_SORT_CPP.highlightMap, source: BUCKET_SORT_CPP.source },
};
