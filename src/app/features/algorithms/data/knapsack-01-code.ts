import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const KNAPSACK_TS = buildStructuredCode(`
  //#region item interface collapsed
  interface KnapsackItem {
    readonly weight: number;
    readonly value: number;
  }

  interface KnapsackResult {
    readonly maxValue: number;
    readonly chosenIndexes: number[];
  }
  //#endregion item

  /**
   * Solve 0/1 knapsack with a 2D DP table and reconstruct one optimal backpack.
   * Input: items with weight/value pairs and the backpack capacity.
   * Returns: optimal value and indexes of selected items.
   */
  //#region knapsack function open
  function knapsack01(items: KnapsackItem[], capacity: number): KnapsackResult {
    //@step 2
    const dp = Array.from({ length: items.length + 1 }, () =>
      Array.from({ length: capacity + 1 }, () => 0),
    );

    for (let row = 1; row <= items.length; row += 1) {
      const item = items[row - 1];

      for (let currentCapacity = 0; currentCapacity <= capacity; currentCapacity += 1) {
        const skip = dp[row - 1][currentCapacity];
        const take =
          item.weight <= currentCapacity
            ? dp[row - 1][currentCapacity - item.weight] + item.value
            : Number.NEGATIVE_INFINITY;

        //@step 5
        const best = Math.max(skip, take);

        //@step 8
        dp[row][currentCapacity] = best;
      }
    }

    const chosenIndexes: number[] = [];
    let row = items.length;
    let currentCapacity = capacity;

    while (row > 0 && currentCapacity >= 0) {
      const item = items[row - 1];
      const current = dp[row][currentCapacity];
      const skip = dp[row - 1][currentCapacity];
      const take =
        item.weight <= currentCapacity
          ? dp[row - 1][currentCapacity - item.weight] + item.value
          : Number.NEGATIVE_INFINITY;

      if (take === current && take > skip) {
        //@step 11
        chosenIndexes.push(row - 1);
        currentCapacity -= item.weight;
      } else {
        //@step 13
        row -= 1;
        continue;
      }

      row -= 1;
    }

    //@step 15
    return {
      maxValue: dp[items.length][capacity],
      chosenIndexes: chosenIndexes.reverse(),
    };
  }
  //#endregion knapsack
`);

const KNAPSACK_PY = buildStructuredCode(
  `
  from typing import TypedDict


  //#region item interface collapsed
  class KnapsackItem(TypedDict):
      weight: int
      value: int

  class KnapsackResult(TypedDict):
      max_value: int
      chosen_indexes: list[int]
  //#endregion item

  """
  Solve 0/1 knapsack with a 2D DP table and reconstruct one optimal backpack.
  Input: items with weight/value pairs and the backpack capacity.
  Returns: optimal value and indexes of selected items.
  """
  //#region knapsack function open
  def knapsack_01(items: list[KnapsackItem], capacity: int) -> KnapsackResult:
      //@step 2
      dp = [[0] * (capacity + 1) for _ in range(len(items) + 1)]

      for row in range(1, len(items) + 1):
          item = items[row - 1]

          for current_capacity in range(capacity + 1):
              skip = dp[row - 1][current_capacity]
              take = (
                  dp[row - 1][current_capacity - item["weight"]] + item["value"]
                  if item["weight"] <= current_capacity
                  else float("-inf")
              )

              //@step 5
              best = max(skip, take)

              //@step 8
              dp[row][current_capacity] = best

      chosen_indexes: list[int] = []
      row = len(items)
      current_capacity = capacity

      while row > 0 and current_capacity >= 0:
          item = items[row - 1]
          current = dp[row][current_capacity]
          skip = dp[row - 1][current_capacity]
          take = (
              dp[row - 1][current_capacity - item["weight"]] + item["value"]
              if item["weight"] <= current_capacity
              else float("-inf")
          )

          if take == current and take > skip:
              //@step 11
              chosen_indexes.append(row - 1)
              current_capacity -= item["weight"]
          else:
              //@step 13
              row -= 1
              continue

          row -= 1

      //@step 15
      return {"max_value": dp[len(items)][capacity], "chosen_indexes": list(reversed(chosen_indexes))}
  //#endregion knapsack
  `,
  'python',
);

const KNAPSACK_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  //#region item interface collapsed
  public sealed class KnapsackItem
  {
      public required int Weight { get; init; }
      public required int Value { get; init; }
  }

  public sealed class KnapsackResult
  {
      public required int MaxValue { get; init; }
      public required List<int> ChosenIndexes { get; init; }
  }
  //#endregion item

  /// <summary>
  /// Solves 0/1 knapsack with a 2D DP table and reconstructs one optimal backpack.
  /// Input: items with weight/value pairs and the backpack capacity.
  /// Returns: optimal value and indexes of selected items.
  /// </summary>
  //#region knapsack function open
  public static KnapsackResult Knapsack01(IReadOnlyList<KnapsackItem> items, int capacity)
  {
      //@step 2
      var dp = new int[items.Count + 1, capacity + 1];

      for (var row = 1; row <= items.Count; row += 1)
      {
          var item = items[row - 1];

          for (var currentCapacity = 0; currentCapacity <= capacity; currentCapacity += 1)
          {
              var skip = dp[row - 1, currentCapacity];
              var take =
                  item.Weight <= currentCapacity
                      ? dp[row - 1, currentCapacity - item.Weight] + item.Value
                      : int.MinValue;

              //@step 5
              var best = Math.Max(skip, take);

              //@step 8
              dp[row, currentCapacity] = best;
          }
      }

      var chosenIndexes = new List<int>();
      var currentRow = items.Count;
      var currentCapacity = capacity;

      while (currentRow > 0 && currentCapacity >= 0)
      {
          var item = items[currentRow - 1];
          var current = dp[currentRow, currentCapacity];
          var skip = dp[currentRow - 1, currentCapacity];
          var take =
              item.Weight <= currentCapacity
                  ? dp[currentRow - 1, currentCapacity - item.Weight] + item.Value
                  : int.MinValue;

          if (take == current && take > skip)
          {
              //@step 11
              chosenIndexes.Add(currentRow - 1);
              currentCapacity -= item.Weight;
          }
          else
          {
              //@step 13
              currentRow -= 1;
              continue;
          }

          currentRow -= 1;
      }

      chosenIndexes.Reverse();

      //@step 15
      return new KnapsackResult
      {
          MaxValue = dp[items.Count, capacity],
          ChosenIndexes = chosenIndexes,
      };
  }
  //#endregion knapsack
  `,
  'csharp',
);

const KNAPSACK_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Collections;
  import java.util.List;

  //#region item interface collapsed
  public record KnapsackItem(int weight, int value) {}

  public record KnapsackResult(int maxValue, List<Integer> chosenIndexes) {}
  //#endregion item

  /**
   * Solves 0/1 knapsack with a 2D DP table and reconstructs one optimal backpack.
   * Input: items with weight/value pairs and the backpack capacity.
   * Returns: optimal value and indexes of selected items.
   */
  //#region knapsack function open
  public static KnapsackResult knapsack01(List<KnapsackItem> items, int capacity) {
      //@step 2
      int[][] dp = new int[items.size() + 1][capacity + 1];

      for (int row = 1; row <= items.size(); row += 1) {
          KnapsackItem item = items.get(row - 1);

          for (int currentCapacity = 0; currentCapacity <= capacity; currentCapacity += 1) {
              int skip = dp[row - 1][currentCapacity];
              int take =
                  item.weight() <= currentCapacity
                      ? dp[row - 1][currentCapacity - item.weight()] + item.value()
                      : Integer.MIN_VALUE;

              //@step 5
              int best = Math.max(skip, take);

              //@step 8
              dp[row][currentCapacity] = best;
          }
      }

      List<Integer> chosenIndexes = new ArrayList<>();
      int currentRow = items.size();
      int currentCapacity = capacity;

      while (currentRow > 0 && currentCapacity >= 0) {
          KnapsackItem item = items.get(currentRow - 1);
          int current = dp[currentRow][currentCapacity];
          int skip = dp[currentRow - 1][currentCapacity];
          int take =
              item.weight() <= currentCapacity
                  ? dp[currentRow - 1][currentCapacity - item.weight()] + item.value()
                  : Integer.MIN_VALUE;

          if (take == current && take > skip) {
              //@step 11
              chosenIndexes.add(currentRow - 1);
              currentCapacity -= item.weight();
          } else {
              //@step 13
              currentRow -= 1;
              continue;
          }

          currentRow -= 1;
      }

      Collections.reverse(chosenIndexes);

      //@step 15
      return new KnapsackResult(dp[items.size()][capacity], chosenIndexes);
  }
  //#endregion knapsack
  `,
  'java',
);

const KNAPSACK_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <limits>
  #include <vector>

  //#region item interface collapsed
  struct KnapsackItem {
      int weight;
      int value;
  };

  struct KnapsackResult {
      int maxValue;
      std::vector<int> chosenIndexes;
  };
  //#endregion item

  /**
   * Solves 0/1 knapsack with a 2D DP table and reconstructs one optimal backpack.
   * Input: items with weight/value pairs and the backpack capacity.
   * Returns: optimal value and indexes of selected items.
   */
  //#region knapsack function open
  KnapsackResult knapsack01(const std::vector<KnapsackItem>& items, int capacity) {
      //@step 2
      std::vector<std::vector<int>> dp(items.size() + 1, std::vector<int>(capacity + 1, 0));

      for (std::size_t row = 1; row <= items.size(); row += 1) {
          const KnapsackItem& item = items[row - 1];

          for (int currentCapacity = 0; currentCapacity <= capacity; currentCapacity += 1) {
              int skip = dp[row - 1][currentCapacity];
              int take =
                  item.weight <= currentCapacity
                      ? dp[row - 1][currentCapacity - item.weight] + item.value
                      : std::numeric_limits<int>::min();

              //@step 5
              int best = std::max(skip, take);

              //@step 8
              dp[row][currentCapacity] = best;
          }
      }

      std::vector<int> chosenIndexes;
      std::size_t currentRow = items.size();
      int currentCapacity = capacity;

      while (currentRow > 0 && currentCapacity >= 0) {
          const KnapsackItem& item = items[currentRow - 1];
          int current = dp[currentRow][currentCapacity];
          int skip = dp[currentRow - 1][currentCapacity];
          int take =
              item.weight <= currentCapacity
                  ? dp[currentRow - 1][currentCapacity - item.weight] + item.value
                  : std::numeric_limits<int>::min();

          if (take == current && take > skip) {
              //@step 11
              chosenIndexes.push_back(static_cast<int>(currentRow - 1));
              currentCapacity -= item.weight;
          } else {
              //@step 13
              currentRow -= 1;
              continue;
          }

          currentRow -= 1;
      }

      std::reverse(chosenIndexes.begin(), chosenIndexes.end());

      //@step 15
      return {dp[items.size()][capacity], chosenIndexes};
  }
  //#endregion knapsack
  `,
  'cpp',
);

export const KNAPSACK_01_CODE = KNAPSACK_TS.lines;
export const KNAPSACK_01_CODE_REGIONS = KNAPSACK_TS.regions;
export const KNAPSACK_01_CODE_HIGHLIGHT_MAP = KNAPSACK_TS.highlightMap;
export const KNAPSACK_01_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: KNAPSACK_TS.lines,
    regions: KNAPSACK_TS.regions,
    highlightMap: KNAPSACK_TS.highlightMap,
    source: KNAPSACK_TS.source,
  },
  python: {
    language: 'python',
    lines: KNAPSACK_PY.lines,
    regions: KNAPSACK_PY.regions,
    highlightMap: KNAPSACK_PY.highlightMap,
    source: KNAPSACK_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: KNAPSACK_CS.lines,
    regions: KNAPSACK_CS.regions,
    highlightMap: KNAPSACK_CS.highlightMap,
    source: KNAPSACK_CS.source,
  },
  java: {
    language: 'java',
    lines: KNAPSACK_JAVA.lines,
    regions: KNAPSACK_JAVA.regions,
    highlightMap: KNAPSACK_JAVA.highlightMap,
    source: KNAPSACK_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: KNAPSACK_CPP.lines,
    regions: KNAPSACK_CPP.regions,
    highlightMap: KNAPSACK_CPP.highlightMap,
    source: KNAPSACK_CPP.source,
  },
};
