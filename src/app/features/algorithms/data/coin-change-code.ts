import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const COIN_CHANGE_TS = buildStructuredCode(`
  //#region coin-result interface collapsed
  interface CoinChangeResult {
    readonly minCoins: number;
    readonly coins: number[];
  }
  //#endregion coin-result

  /**
   * Solve the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  function coinChange(coins: number[], amount: number): CoinChangeResult {
    //@step 2
    const dp = Array.from({ length: coins.length + 1 }, (_, row) =>
      Array.from({ length: amount + 1 }, (__, currentAmount) =>
        currentAmount === 0 ? 0 : row === 0 ? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY,
      ),
    );

    for (let row = 1; row <= coins.length; row += 1) {
      const coin = coins[row - 1];

      for (let currentAmount = 1; currentAmount <= amount; currentAmount += 1) {
        const skip = dp[row - 1][currentAmount];
        const take =
          coin <= currentAmount && Number.isFinite(dp[row][currentAmount - coin])
            ? dp[row][currentAmount - coin] + 1
            : Number.POSITIVE_INFINITY;

        //@step 5
        const best = Math.min(skip, take);

        //@step 8
        dp[row][currentAmount] = best;
      }
    }

    //@step 15
    if (!Number.isFinite(dp[coins.length][amount])) {
      return { minCoins: -1, coins: [] };
    }

    const chosenCoins: number[] = [];
    let row = coins.length;
    let currentAmount = amount;

    while (currentAmount > 0 && row > 0) {
      const coin = coins[row - 1];
      const current = dp[row][currentAmount];
      const skip = dp[row - 1][currentAmount];
      const take =
        coin <= currentAmount && Number.isFinite(dp[row][currentAmount - coin])
          ? dp[row][currentAmount - coin] + 1
          : Number.POSITIVE_INFINITY;

      if (take <= current && take < skip) {
        //@step 11
        chosenCoins.push(coin);
        currentAmount -= coin;
      } else {
        //@step 13
        row -= 1;
      }
    }

    //@step 15
    return {
      minCoins: dp[coins.length][amount],
      coins: chosenCoins.reverse(),
    };
  }
  //#endregion coin-change
`);

const COIN_CHANGE_PY = buildStructuredCode(
  `
  from math import inf


  //#region coin-result interface collapsed
  from typing import TypedDict

  class CoinChangeResult(TypedDict):
      min_coins: int
      coins: list[int]
  //#endregion coin-result

  """
  Solve the unbounded coin change problem with table DP and backtracking.
  Input: available coin denominations and target amount.
  Returns: minimum coin count together with one optimal multiset.
  """
  //#region coin-change function open
  def coin_change(coins: list[int], amount: int) -> CoinChangeResult:
      //@step 2
      dp = [
          [0 if current_amount == 0 else inf for current_amount in range(amount + 1)]
          for _ in range(len(coins) + 1)
      ]

      for row in range(1, len(coins) + 1):
          coin = coins[row - 1]

          for current_amount in range(1, amount + 1):
              skip = dp[row - 1][current_amount]
              take = (
                  dp[row][current_amount - coin] + 1
                  if coin <= current_amount and dp[row][current_amount - coin] != inf
                  else inf
              )

              //@step 5
              best = min(skip, take)

              //@step 8
              dp[row][current_amount] = best

      //@step 15
      if dp[len(coins)][amount] == inf:
          return {"min_coins": -1, "coins": []}

      chosen_coins: list[int] = []
      row = len(coins)
      current_amount = amount

      while current_amount > 0 and row > 0:
          coin = coins[row - 1]
          current = dp[row][current_amount]
          skip = dp[row - 1][current_amount]
          take = (
              dp[row][current_amount - coin] + 1
              if coin <= current_amount and dp[row][current_amount - coin] != inf
              else inf
          )

          if take <= current and take < skip:
              //@step 11
              chosen_coins.append(coin)
              current_amount -= coin
          else:
              //@step 13
              row -= 1

      //@step 15
      return {"min_coins": dp[len(coins)][amount], "coins": list(reversed(chosen_coins))}
  //#endregion coin-change
  `,
  'python',
);

const COIN_CHANGE_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  //#region coin-result interface collapsed
  public sealed class CoinChangeResult
  {
      public required int MinCoins { get; init; }
      public required List<int> Coins { get; init; }
  }
  //#endregion coin-result

  /// <summary>
  /// Solves the unbounded coin change problem with table DP and backtracking.
  /// Input: available coin denominations and target amount.
  /// Returns: minimum coin count together with one optimal multiset.
  /// </summary>
  //#region coin-change function open
  public static CoinChangeResult CoinChange(int[] coins, int amount)
  {
      //@step 2
      var dp = new int[coins.Length + 1, amount + 1];
      for (var row = 0; row <= coins.Length; row += 1)
      {
          for (var currentAmount = 1; currentAmount <= amount; currentAmount += 1)
          {
              dp[row, currentAmount] = int.MaxValue;
          }
      }

      for (var row = 1; row <= coins.Length; row += 1)
      {
          var coin = coins[row - 1];

          for (var currentAmount = 1; currentAmount <= amount; currentAmount += 1)
          {
              var skip = dp[row - 1, currentAmount];
              var take =
                  coin <= currentAmount && dp[row, currentAmount - coin] != int.MaxValue
                      ? dp[row, currentAmount - coin] + 1
                      : int.MaxValue;

              //@step 5
              var best = Math.Min(skip, take);

              //@step 8
              dp[row, currentAmount] = best;
          }
      }

      //@step 15
      if (dp[coins.Length, amount] == int.MaxValue)
      {
          return new CoinChangeResult { MinCoins = -1, Coins = [] };
      }

      var chosenCoins = new List<int>();
      var currentRow = coins.Length;
      var currentAmount = amount;

      while (currentAmount > 0 && currentRow > 0)
      {
          var coin = coins[currentRow - 1];
          var current = dp[currentRow, currentAmount];
          var skip = dp[currentRow - 1, currentAmount];
          var take =
              coin <= currentAmount && dp[currentRow, currentAmount - coin] != int.MaxValue
                  ? dp[currentRow, currentAmount - coin] + 1
                  : int.MaxValue;

          if (take <= current && take < skip)
          {
              //@step 11
              chosenCoins.Add(coin);
              currentAmount -= coin;
          }
          else
          {
              //@step 13
              currentRow -= 1;
          }
      }

      chosenCoins.Reverse();

      //@step 15
      return new CoinChangeResult
      {
          MinCoins = dp[coins.Length, amount],
          Coins = chosenCoins,
      };
  }
  //#endregion coin-change
  `,
  'csharp',
);

const COIN_CHANGE_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Collections;
  import java.util.List;

  //#region coin-result interface collapsed
  public record CoinChangeResult(int minCoins, List<Integer> coins) {}
  //#endregion coin-result

  /**
   * Solves the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  public static CoinChangeResult coinChange(int[] coins, int amount) {
      //@step 2
      int[][] dp = new int[coins.length + 1][amount + 1];
      for (int row = 0; row <= coins.length; row += 1) {
          for (int currentAmount = 1; currentAmount <= amount; currentAmount += 1) {
              dp[row][currentAmount] = Integer.MAX_VALUE;
          }
      }

      for (int row = 1; row <= coins.length; row += 1) {
          int coin = coins[row - 1];

          for (int currentAmount = 1; currentAmount <= amount; currentAmount += 1) {
              int skip = dp[row - 1][currentAmount];
              int take =
                  coin <= currentAmount && dp[row][currentAmount - coin] != Integer.MAX_VALUE
                      ? dp[row][currentAmount - coin] + 1
                      : Integer.MAX_VALUE;

              //@step 5
              int best = Math.min(skip, take);

              //@step 8
              dp[row][currentAmount] = best;
          }
      }

      //@step 15
      if (dp[coins.length][amount] == Integer.MAX_VALUE) {
          return new CoinChangeResult(-1, List.of());
      }

      List<Integer> chosenCoins = new ArrayList<>();
      int currentRow = coins.length;
      int currentAmount = amount;

      while (currentAmount > 0 && currentRow > 0) {
          int coin = coins[currentRow - 1];
          int current = dp[currentRow][currentAmount];
          int skip = dp[currentRow - 1][currentAmount];
          int take =
              coin <= currentAmount && dp[currentRow][currentAmount - coin] != Integer.MAX_VALUE
                  ? dp[currentRow][currentAmount - coin] + 1
                  : Integer.MAX_VALUE;

          if (take <= current && take < skip) {
              //@step 11
              chosenCoins.add(coin);
              currentAmount -= coin;
          } else {
              //@step 13
              currentRow -= 1;
          }
      }

      Collections.reverse(chosenCoins);

      //@step 15
      return new CoinChangeResult(dp[coins.length][amount], chosenCoins);
  }
  //#endregion coin-change
  `,
  'java',
);

const COIN_CHANGE_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <limits>
  #include <utility>
  #include <vector>

  //#region coin-result interface collapsed
  struct CoinChangeResult {
      int minCoins;
      std::vector<int> coins;
  };
  //#endregion coin-result

  /**
   * Solves the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  CoinChangeResult coinChange(const std::vector<int>& coins, int amount) {
      //@step 2
      std::vector<std::vector<int>> dp(
          coins.size() + 1,
          std::vector<int>(amount + 1, std::numeric_limits<int>::max())
      );
      for (std::size_t row = 0; row <= coins.size(); row += 1) {
          dp[row][0] = 0;
      }

      for (std::size_t row = 1; row <= coins.size(); row += 1) {
          int coin = coins[row - 1];

          for (int currentAmount = 1; currentAmount <= amount; currentAmount += 1) {
              int skip = dp[row - 1][currentAmount];
              int take =
                  coin <= currentAmount && dp[row][currentAmount - coin] != std::numeric_limits<int>::max()
                      ? dp[row][currentAmount - coin] + 1
                      : std::numeric_limits<int>::max();

              //@step 5
              int best = std::min(skip, take);

              //@step 8
              dp[row][currentAmount] = best;
          }
      }

      //@step 15
      if (dp[coins.size()][amount] == std::numeric_limits<int>::max()) {
          return {-1, {}};
      }

      std::vector<int> chosenCoins;
      std::size_t currentRow = coins.size();
      int currentAmount = amount;

      while (currentAmount > 0 && currentRow > 0) {
          int coin = coins[currentRow - 1];
          int current = dp[currentRow][currentAmount];
          int skip = dp[currentRow - 1][currentAmount];
          int take =
              coin <= currentAmount && dp[currentRow][currentAmount - coin] != std::numeric_limits<int>::max()
                  ? dp[currentRow][currentAmount - coin] + 1
                  : std::numeric_limits<int>::max();

          if (take <= current && take < skip) {
              //@step 11
              chosenCoins.push_back(coin);
              currentAmount -= coin;
          } else {
              //@step 13
              currentRow -= 1;
          }
      }

      std::reverse(chosenCoins.begin(), chosenCoins.end());

      //@step 15
      return {dp[coins.size()][amount], chosenCoins};
  }
  //#endregion coin-change
  `,
  'cpp',
);

export const COIN_CHANGE_CODE = COIN_CHANGE_TS.lines;
export const COIN_CHANGE_CODE_REGIONS = COIN_CHANGE_TS.regions;
export const COIN_CHANGE_CODE_HIGHLIGHT_MAP = COIN_CHANGE_TS.highlightMap;
export const COIN_CHANGE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: COIN_CHANGE_TS.lines,
    regions: COIN_CHANGE_TS.regions,
    highlightMap: COIN_CHANGE_TS.highlightMap,
    source: COIN_CHANGE_TS.source,
  },
  python: {
    language: 'python',
    lines: COIN_CHANGE_PY.lines,
    regions: COIN_CHANGE_PY.regions,
    highlightMap: COIN_CHANGE_PY.highlightMap,
    source: COIN_CHANGE_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: COIN_CHANGE_CS.lines,
    regions: COIN_CHANGE_CS.regions,
    highlightMap: COIN_CHANGE_CS.highlightMap,
    source: COIN_CHANGE_CS.source,
  },
  java: {
    language: 'java',
    lines: COIN_CHANGE_JAVA.lines,
    regions: COIN_CHANGE_JAVA.regions,
    highlightMap: COIN_CHANGE_JAVA.highlightMap,
    source: COIN_CHANGE_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: COIN_CHANGE_CPP.lines,
    regions: COIN_CHANGE_CPP.regions,
    highlightMap: COIN_CHANGE_CPP.highlightMap,
    source: COIN_CHANGE_CPP.source,
  },
};
