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

const COIN_CHANGE_JS = buildStructuredCode(
  `
  /**
   * Solve the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  function coinChange(coins, amount) {
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

      const chosenCoins = [];
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
  `,
  'javascript',
);

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

const COIN_CHANGE_GO = buildStructuredCode(
  `
  package dp

  //#region coin-result interface collapsed
  type CoinChangeResult struct {
      MinCoins int
      Coins    []int
  }
  //#endregion coin-result

  /**
   * Solve the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  func CoinChange(coins []int, amount int) CoinChangeResult {
      //@step 2
      dp := make([][]int, len(coins) + 1)
      for row := range dp {
          dp[row] = make([]int, amount + 1)
          for currentAmount := 1; currentAmount <= amount; currentAmount += 1 {
              dp[row][currentAmount] = inf()
          }
      }

      for row := 1; row <= len(coins); row += 1 {
          coin := coins[row - 1]

          for currentAmount := 1; currentAmount <= amount; currentAmount += 1 {
              skip := dp[row - 1][currentAmount]
              take := inf()
              if coin <= currentAmount && dp[row][currentAmount - coin] != inf() {
                  take = dp[row][currentAmount - coin] + 1
              }

              //@step 5
              best := minInt(skip, take)

              //@step 8
              dp[row][currentAmount] = best
          }
      }

      //@step 15
      if dp[len(coins)][amount] == inf() {
          return CoinChangeResult{MinCoins: -1, Coins: []int{}}
      }

      chosenCoins := make([]int, 0)
      row := len(coins)
      currentAmount := amount

      for currentAmount > 0 && row > 0 {
          coin := coins[row - 1]
          current := dp[row][currentAmount]
          skip := dp[row - 1][currentAmount]
          take := inf()
          if coin <= currentAmount && dp[row][currentAmount - coin] != inf() {
              take = dp[row][currentAmount - coin] + 1
          }

          if take <= current && take < skip {
              //@step 11
              chosenCoins = append(chosenCoins, coin)
              currentAmount -= coin
          } else {
              //@step 13
              row -= 1
          }
      }

      for left, right := 0, len(chosenCoins) - 1; left < right; left, right = left + 1, right - 1 {
          chosenCoins[left], chosenCoins[right] = chosenCoins[right], chosenCoins[left]
      }

      //@step 15
      return CoinChangeResult{MinCoins: dp[len(coins)][amount], Coins: chosenCoins}
  }
  //#endregion coin-change

  //#region helpers helper collapsed
  func minInt(a int, b int) int {
      if a < b {
          return a
      }
      return b
  }

  func inf() int {
      return 1 << 60
  }
  //#endregion helpers
  `,
  'go',
);

const COIN_CHANGE_RUST = buildStructuredCode(
  `
  //#region coin-result interface collapsed
  struct CoinChangeResult {
      min_coins: i32,
      coins: Vec<i32>,
  }
  //#endregion coin-result

  /**
   * Solve the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  fn coin_change(coins: &[i32], amount: usize) -> CoinChangeResult {
      //@step 2
      let mut dp = vec![vec![i32::MAX / 4; amount + 1]; coins.len() + 1];
      for row in 0..=coins.len() {
          dp[row][0] = 0;
      }

      for row in 1..=coins.len() {
          let coin = coins[row - 1] as usize;

          for current_amount in 1..=amount {
              let skip = dp[row - 1][current_amount];
              let take =
                  if coin <= current_amount && dp[row][current_amount - coin] < i32::MAX / 4 {
                      dp[row][current_amount - coin] + 1
                  } else {
                      i32::MAX / 4
                  };

              //@step 5
              let best = skip.min(take);

              //@step 8
              dp[row][current_amount] = best;
          }
      }

      //@step 15
      if dp[coins.len()][amount] >= i32::MAX / 4 {
          return CoinChangeResult { min_coins: -1, coins: vec![] };
      }

      let mut chosen_coins = Vec::new();
      let mut row = coins.len();
      let mut current_amount = amount;

      while current_amount > 0 && row > 0 {
          let coin = coins[row - 1] as usize;
          let current = dp[row][current_amount];
          let skip = dp[row - 1][current_amount];
          let take =
              if coin <= current_amount && dp[row][current_amount - coin] < i32::MAX / 4 {
                  dp[row][current_amount - coin] + 1
              } else {
                  i32::MAX / 4
              };

          if take <= current && take < skip {
              //@step 11
              chosen_coins.push(coins[row - 1]);
              current_amount -= coin;
          } else {
              //@step 13
              row -= 1;
          }
      }

      chosen_coins.reverse();

      //@step 15
      CoinChangeResult {
          min_coins: dp[coins.len()][amount],
          coins: chosen_coins,
      }
  }
  //#endregion coin-change
  `,
  'rust',
);

const COIN_CHANGE_SWIFT = buildStructuredCode(
  `
  //#region coin-result interface collapsed
  struct CoinChangeResult {
      let minCoins: Int
      let coins: [Int]
  }
  //#endregion coin-result

  /**
   * Solve the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  func coinChange(_ coins: [Int], amount: Int) -> CoinChangeResult {
      //@step 2
      var dp = Array(
          repeating: Array(repeating: Int.max / 4, count: amount + 1),
          count: coins.count + 1
      )
      for row in 0...coins.count {
          dp[row][0] = 0
      }

      for row in 1...coins.count {
          let coin = coins[row - 1]

          for currentAmount in 1...amount {
              let skip = dp[row - 1][currentAmount]
              let take =
                  coin <= currentAmount && dp[row][currentAmount - coin] < Int.max / 4
                      ? dp[row][currentAmount - coin] + 1
                      : Int.max / 4

              //@step 5
              let best = min(skip, take)

              //@step 8
              dp[row][currentAmount] = best
          }
      }

      //@step 15
      if dp[coins.count][amount] >= Int.max / 4 {
          return CoinChangeResult(minCoins: -1, coins: [])
      }

      var chosenCoins: [Int] = []
      var row = coins.count
      var currentAmount = amount

      while currentAmount > 0 && row > 0 {
          let coin = coins[row - 1]
          let current = dp[row][currentAmount]
          let skip = dp[row - 1][currentAmount]
          let take =
              coin <= currentAmount && dp[row][currentAmount - coin] < Int.max / 4
                  ? dp[row][currentAmount - coin] + 1
                  : Int.max / 4

          if take <= current && take < skip {
              //@step 11
              chosenCoins.append(coin)
              currentAmount -= coin
          } else {
              //@step 13
              row -= 1
          }
      }

      //@step 15
      return CoinChangeResult(minCoins: dp[coins.count][amount], coins: chosenCoins.reversed())
  }
  //#endregion coin-change
  `,
  'swift',
);

const COIN_CHANGE_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Solve the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  function coinChange(array $coins, int $amount): array
  {
      //@step 2
      $dp = array_fill(0, count($coins) + 1, array_fill(0, $amount + 1, PHP_INT_MAX));
      for ($row = 0; $row <= count($coins); $row += 1) {
          $dp[$row][0] = 0;
      }

      for ($row = 1; $row <= count($coins); $row += 1) {
          $coin = $coins[$row - 1];

          for ($currentAmount = 1; $currentAmount <= $amount; $currentAmount += 1) {
              $skip = $dp[$row - 1][$currentAmount];
              $take =
                  $coin <= $currentAmount && $dp[$row][$currentAmount - $coin] !== PHP_INT_MAX
                      ? $dp[$row][$currentAmount - $coin] + 1
                      : PHP_INT_MAX;

              //@step 5
              $best = min($skip, $take);

              //@step 8
              $dp[$row][$currentAmount] = $best;
          }
      }

      //@step 15
      if ($dp[count($coins)][$amount] === PHP_INT_MAX) {
          return ['minCoins' => -1, 'coins' => []];
      }

      $chosenCoins = [];
      $row = count($coins);
      $currentAmount = $amount;

      while ($currentAmount > 0 && $row > 0) {
          $coin = $coins[$row - 1];
          $current = $dp[$row][$currentAmount];
          $skip = $dp[$row - 1][$currentAmount];
          $take =
              $coin <= $currentAmount && $dp[$row][$currentAmount - $coin] !== PHP_INT_MAX
                  ? $dp[$row][$currentAmount - $coin] + 1
                  : PHP_INT_MAX;

          if ($take <= $current && $take < $skip) {
              //@step 11
              $chosenCoins[] = $coin;
              $currentAmount -= $coin;
          } else {
              //@step 13
              $row -= 1;
          }
      }

      //@step 15
      return [
          'minCoins' => $dp[count($coins)][$amount],
          'coins' => array_reverse($chosenCoins),
      ];
  }
  //#endregion coin-change
  `,
  'php',
);

const COIN_CHANGE_KOTLIN = buildStructuredCode(
  `
  data class CoinChangeResult(val minCoins: Int, val coins: List<Int>)

  /**
   * Solve the unbounded coin change problem with table DP and backtracking.
   * Input: available coin denominations and target amount.
   * Returns: minimum coin count together with one optimal multiset.
   */
  //#region coin-change function open
  fun coinChange(coins: List<Int>, amount: Int): CoinChangeResult {
      //@step 2
      val dp = Array(coins.size + 1) { IntArray(amount + 1) { Int.MAX_VALUE } }
      for (row in 0..coins.size) {
          dp[row][0] = 0
      }

      for (row in 1..coins.size) {
          val coin = coins[row - 1]

          for (currentAmount in 1..amount) {
              val skip = dp[row - 1][currentAmount]
              val take =
                  if (coin <= currentAmount && dp[row][currentAmount - coin] != Int.MAX_VALUE) {
                      dp[row][currentAmount - coin] + 1
                  } else {
                      Int.MAX_VALUE
                  }

              //@step 5
              val best = minOf(skip, take)

              //@step 8
              dp[row][currentAmount] = best
          }
      }

      //@step 15
      if (dp[coins.size][amount] == Int.MAX_VALUE) {
          return CoinChangeResult(-1, emptyList())
      }

      val chosenCoins = mutableListOf<Int>()
      var row = coins.size
      var currentAmount = amount

      while (currentAmount > 0 && row > 0) {
          val coin = coins[row - 1]
          val current = dp[row][currentAmount]
          val skip = dp[row - 1][currentAmount]
          val take =
              if (coin <= currentAmount && dp[row][currentAmount - coin] != Int.MAX_VALUE) {
                  dp[row][currentAmount - coin] + 1
              } else {
                  Int.MAX_VALUE
              }

          if (take <= current && take < skip) {
              //@step 11
              chosenCoins += coin
              currentAmount -= coin
          } else {
              //@step 13
              row -= 1
          }
      }

      //@step 15
      return CoinChangeResult(dp[coins.size][amount], chosenCoins.asReversed())
  }
  //#endregion coin-change
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: COIN_CHANGE_JS.lines,
    regions: COIN_CHANGE_JS.regions,
    highlightMap: COIN_CHANGE_JS.highlightMap,
    source: COIN_CHANGE_JS.source,
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
  go: {
    language: 'go',
    lines: COIN_CHANGE_GO.lines,
    regions: COIN_CHANGE_GO.regions,
    highlightMap: COIN_CHANGE_GO.highlightMap,
    source: COIN_CHANGE_GO.source,
  },
  rust: {
    language: 'rust',
    lines: COIN_CHANGE_RUST.lines,
    regions: COIN_CHANGE_RUST.regions,
    highlightMap: COIN_CHANGE_RUST.highlightMap,
    source: COIN_CHANGE_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: COIN_CHANGE_SWIFT.lines,
    regions: COIN_CHANGE_SWIFT.regions,
    highlightMap: COIN_CHANGE_SWIFT.highlightMap,
    source: COIN_CHANGE_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: COIN_CHANGE_PHP.lines,
    regions: COIN_CHANGE_PHP.regions,
    highlightMap: COIN_CHANGE_PHP.highlightMap,
    source: COIN_CHANGE_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: COIN_CHANGE_KOTLIN.lines,
    regions: COIN_CHANGE_KOTLIN.regions,
    highlightMap: COIN_CHANGE_KOTLIN.highlightMap,
    source: COIN_CHANGE_KOTLIN.source,
  },
};
