import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const TSP_TS = buildStructuredCode(`
  //#region tsp-result interface collapsed
  interface TspResult {
    readonly minCost: number;
    readonly tour: number[];
  }
  //#endregion tsp-result

  /**
   * Solve Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  function heldKarp(dist: number[][], start: number): TspResult {
    const cityCount = dist.length;
    const fullMask = (1 << cityCount) - 1;
    const dp = Array.from({ length: 1 << cityCount }, () =>
      Array.from({ length: cityCount }, () => Number.POSITIVE_INFINITY),
    );
    const parent = Array.from({ length: 1 << cityCount }, () =>
      Array.from({ length: cityCount }, () => -1),
    );

    //@step 2
    dp[1 << start][start] = 0;

    for (let mask = 0; mask <= fullMask; mask += 1) {
      if ((mask & (1 << start)) === 0) {
        continue;
      }

      for (let end = 0; end < cityCount; end += 1) {
        if ((mask & (1 << end)) === 0 || !Number.isFinite(dp[mask][end])) {
          continue;
        }

        for (let next = 0; next < cityCount; next += 1) {
          if ((mask & (1 << next)) !== 0) {
            continue;
          }

          //@step 5
          const nextMask = mask | (1 << next);
          //@step 6
          const candidate = dp[mask][end] + dist[end][next];

          if (candidate < dp[nextMask][next]) {
            dp[nextMask][next] = candidate;
            parent[nextMask][next] = end;
          }
        }
      }
    }

    //@step 8
    let bestEnd = start;
    let bestCost = Number.POSITIVE_INFINITY;
    for (let end = 0; end < cityCount; end += 1) {
      if (end === start || !Number.isFinite(dp[fullMask][end])) {
        continue;
      }

      const tourCost = dp[fullMask][end] + dist[end][start];
      if (tourCost < bestCost) {
        //@step 9
        bestCost = tourCost;
        bestEnd = end;
      }
    }

    const reverseTour = [start];
    let mask = fullMask;
    let city = bestEnd;
    while (city !== -1 && city !== start) {
      //@step 10
      reverseTour.push(city);
      const previous = parent[mask][city];
      mask ^= 1 << city;
      city = previous;
    }

    //@step 11
    return {
      minCost: bestCost,
      tour: [start, ...reverseTour.slice(1).reverse(), start],
    };
  }
  //#endregion tsp
`);

const TSP_PY = buildStructuredCode(
  `
  from math import inf
  from typing import TypedDict


  //#region tsp-result interface collapsed
  class TspResult(TypedDict):
      min_cost: int
      tour: list[int]
  //#endregion tsp-result

  """
  Solve Traveling Salesman with Held-Karp dynamic programming.
  Input: distance matrix and start city.
  Returns: minimum Hamiltonian tour cost and one optimal tour.
  """
  //#region tsp function open
  def held_karp(dist: list[list[int]], start: int) -> TspResult:
      city_count = len(dist)
      full_mask = (1 << city_count) - 1
      dp = [[inf] * city_count for _ in range(1 << city_count)]
      parent = [[-1] * city_count for _ in range(1 << city_count)]

      //@step 2
      dp[1 << start][start] = 0

      for mask in range(full_mask + 1):
          if (mask & (1 << start)) == 0:
              continue

          for end in range(city_count):
              if (mask & (1 << end)) == 0 or dp[mask][end] == inf:
                  continue

              for nxt in range(city_count):
                  if (mask & (1 << nxt)) != 0:
                      continue

                  //@step 5
                  next_mask = mask | (1 << nxt)
                  //@step 6
                  candidate = dp[mask][end] + dist[end][nxt]

                  if candidate < dp[next_mask][nxt]:
                      dp[next_mask][nxt] = candidate
                      parent[next_mask][nxt] = end

      //@step 8
      best_end = start
      best_cost = inf
      for end in range(city_count):
          if end == start or dp[full_mask][end] == inf:
              continue

          tour_cost = dp[full_mask][end] + dist[end][start]
          if tour_cost < best_cost:
              //@step 9
              best_cost = tour_cost
              best_end = end

      reverse_tour = [start]
      mask = full_mask
      city = best_end
      while city != -1 and city != start:
          //@step 10
          reverse_tour.append(city)
          previous = parent[mask][city]
          mask ^= 1 << city
          city = previous

      //@step 11
      return {"min_cost": int(best_cost), "tour": [start, *reversed(reverse_tour[1:]), start]}
  //#endregion tsp
  `,
  'python',
);

const TSP_CS = buildStructuredCode(
  `
  using System;
  using System.Collections.Generic;

  //#region tsp-result interface collapsed
  public sealed class TspResult
  {
      public required int MinCost { get; init; }
      public required List<int> Tour { get; init; }
  }
  //#endregion tsp-result

  /// <summary>
  /// Solves Traveling Salesman with Held-Karp dynamic programming.
  /// Input: distance matrix and start city.
  /// Returns: minimum Hamiltonian tour cost and one optimal tour.
  /// </summary>
  //#region tsp function open
  public static TspResult HeldKarp(int[,] dist, int start)
  {
      var cityCount = dist.GetLength(0);
      var fullMask = (1 << cityCount) - 1;
      var dp = new int[1 << cityCount, cityCount];
      var parent = new int[1 << cityCount, cityCount];

      for (var mask = 0; mask <= fullMask; mask += 1)
      {
          for (var city = 0; city < cityCount; city += 1)
          {
              dp[mask, city] = int.MaxValue;
              parent[mask, city] = -1;
          }
      }

      //@step 2
      dp[1 << start, start] = 0;

      for (var mask = 0; mask <= fullMask; mask += 1)
      {
          if ((mask & (1 << start)) == 0)
          {
              continue;
          }

          for (var end = 0; end < cityCount; end += 1)
          {
              if ((mask & (1 << end)) == 0 || dp[mask, end] == int.MaxValue)
              {
                  continue;
              }

              for (var next = 0; next < cityCount; next += 1)
              {
                  if ((mask & (1 << next)) != 0)
                  {
                      continue;
                  }

                  //@step 5
                  var nextMask = mask | (1 << next);
                  //@step 6
                  var candidate = dp[mask, end] + dist[end, next];

                  if (candidate < dp[nextMask, next])
                  {
                      dp[nextMask, next] = candidate;
                      parent[nextMask, next] = end;
                  }
              }
          }
      }

      //@step 8
      var bestEnd = start;
      var bestCost = int.MaxValue;
      for (var end = 0; end < cityCount; end += 1)
      {
          if (end == start || dp[fullMask, end] == int.MaxValue)
          {
              continue;
          }

          var tourCost = dp[fullMask, end] + dist[end, start];
          if (tourCost < bestCost)
          {
              //@step 9
              bestCost = tourCost;
              bestEnd = end;
          }
      }

      var reverseTour = new List<int> { start };
      var currentMask = fullMask;
      var city = bestEnd;
      while (city != -1 && city != start)
      {
          //@step 10
          reverseTour.Add(city);
          var previous = parent[currentMask, city];
          currentMask ^= 1 << city;
          city = previous;
      }

      reverseTour.Reverse();
      reverseTour.Insert(0, start);
      reverseTour.Add(start);

      //@step 11
      return new TspResult { MinCost = bestCost, Tour = reverseTour };
  }
  //#endregion tsp
  `,
  'csharp',
);

const TSP_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Collections;
  import java.util.List;

  //#region tsp-result interface collapsed
  public record TspResult(int minCost, List<Integer> tour) {}
  //#endregion tsp-result

  /**
   * Solves Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  public static TspResult heldKarp(int[][] dist, int start) {
      int cityCount = dist.length;
      int fullMask = (1 << cityCount) - 1;
      int[][] dp = new int[1 << cityCount][cityCount];
      int[][] parent = new int[1 << cityCount][cityCount];

      for (int mask = 0; mask <= fullMask; mask += 1) {
          for (int city = 0; city < cityCount; city += 1) {
              dp[mask][city] = Integer.MAX_VALUE;
              parent[mask][city] = -1;
          }
      }

      //@step 2
      dp[1 << start][start] = 0;

      for (int mask = 0; mask <= fullMask; mask += 1) {
          if ((mask & (1 << start)) == 0) {
              continue;
          }

          for (int end = 0; end < cityCount; end += 1) {
              if ((mask & (1 << end)) == 0 || dp[mask][end] == Integer.MAX_VALUE) {
                  continue;
              }

              for (int next = 0; next < cityCount; next += 1) {
                  if ((mask & (1 << next)) != 0) {
                      continue;
                  }

                  //@step 5
                  int nextMask = mask | (1 << next);
                  //@step 6
                  int candidate = dp[mask][end] + dist[end][next];

                  if (candidate < dp[nextMask][next]) {
                      dp[nextMask][next] = candidate;
                      parent[nextMask][next] = end;
                  }
              }
          }
      }

      //@step 8
      int bestEnd = start;
      int bestCost = Integer.MAX_VALUE;
      for (int end = 0; end < cityCount; end += 1) {
          if (end == start || dp[fullMask][end] == Integer.MAX_VALUE) {
              continue;
          }

          int tourCost = dp[fullMask][end] + dist[end][start];
          if (tourCost < bestCost) {
              //@step 9
              bestCost = tourCost;
              bestEnd = end;
          }
      }

      List<Integer> reverseTour = new ArrayList<>();
      reverseTour.add(start);
      int mask = fullMask;
      int city = bestEnd;
      while (city != -1 && city != start) {
          //@step 10
          reverseTour.add(city);
          int previous = parent[mask][city];
          mask ^= 1 << city;
          city = previous;
      }

      Collections.reverse(reverseTour);
      reverseTour.add(0, start);
      reverseTour.add(start);

      //@step 11
      return new TspResult(bestCost, reverseTour);
  }
  //#endregion tsp
  `,
  'java',
);

const TSP_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <limits>
  #include <vector>

  struct TspResult {
      int minCost;
      std::vector<int> tour;
  };

  /**
   * Solves Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  TspResult heldKarp(const std::vector<std::vector<int>>& dist, int start) {
      int cityCount = static_cast<int>(dist.size());
      int fullMask = (1 << cityCount) - 1;
      std::vector<std::vector<int>> dp(1 << cityCount, std::vector<int>(cityCount, std::numeric_limits<int>::max()));
      std::vector<std::vector<int>> parent(1 << cityCount, std::vector<int>(cityCount, -1));

      //@step 2
      dp[1 << start][start] = 0;

      for (int mask = 0; mask <= fullMask; mask += 1) {
          if ((mask & (1 << start)) == 0) {
              continue;
          }

          for (int end = 0; end < cityCount; end += 1) {
              if ((mask & (1 << end)) == 0 || dp[mask][end] == std::numeric_limits<int>::max()) {
                  continue;
              }

              for (int next = 0; next < cityCount; next += 1) {
                  if ((mask & (1 << next)) != 0) {
                      continue;
                  }

                  //@step 5
                  int nextMask = mask | (1 << next);
                  //@step 6
                  int candidate = dp[mask][end] + dist[end][next];

                  if (candidate < dp[nextMask][next]) {
                      dp[nextMask][next] = candidate;
                      parent[nextMask][next] = end;
                  }
              }
          }
      }

      //@step 8
      int bestEnd = start;
      int bestCost = std::numeric_limits<int>::max();
      for (int end = 0; end < cityCount; end += 1) {
          if (end == start || dp[fullMask][end] == std::numeric_limits<int>::max()) {
              continue;
          }

          int tourCost = dp[fullMask][end] + dist[end][start];
          if (tourCost < bestCost) {
              //@step 9
              bestCost = tourCost;
              bestEnd = end;
          }
      }

      std::vector<int> reverseTour{start};
      int mask = fullMask;
      int city = bestEnd;
      while (city != -1 && city != start) {
          //@step 10
          reverseTour.push_back(city);
          int previous = parent[mask][city];
          mask ^= 1 << city;
          city = previous;
      }

      std::reverse(reverseTour.begin(), reverseTour.end());
      reverseTour.insert(reverseTour.begin(), start);
      reverseTour.push_back(start);

      //@step 11
      return {bestCost, reverseTour};
  }
  //#endregion tsp
  `,
  'cpp',
);

const TSP_JS = buildStructuredCode(
  `
  /**
   * Solve Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  function heldKarp(dist, start) {
      const cityCount = dist.length;
      const fullMask = (1 << cityCount) - 1;
      const dp = Array.from({ length: 1 << cityCount }, () =>
          Array.from({ length: cityCount }, () => Number.POSITIVE_INFINITY),
      );
      const parent = Array.from({ length: 1 << cityCount }, () =>
          Array.from({ length: cityCount }, () => -1),
      );

      //@step 2
      dp[1 << start][start] = 0;

      for (let mask = 0; mask <= fullMask; mask += 1) {
          if ((mask & (1 << start)) === 0) {
              continue;
          }

          for (let end = 0; end < cityCount; end += 1) {
              if ((mask & (1 << end)) === 0 || !Number.isFinite(dp[mask][end])) {
                  continue;
              }

              for (let next = 0; next < cityCount; next += 1) {
                  if ((mask & (1 << next)) !== 0) {
                      continue;
                  }

                  //@step 5
                  const nextMask = mask | (1 << next);
                  //@step 6
                  const candidate = dp[mask][end] + dist[end][next];

                  if (candidate < dp[nextMask][next]) {
                      dp[nextMask][next] = candidate;
                      parent[nextMask][next] = end;
                  }
              }
          }
      }

      //@step 8
      let bestEnd = start;
      let bestCost = Number.POSITIVE_INFINITY;
      for (let end = 0; end < cityCount; end += 1) {
          if (end === start || !Number.isFinite(dp[fullMask][end])) {
              continue;
          }

          const tourCost = dp[fullMask][end] + dist[end][start];
          if (tourCost < bestCost) {
              //@step 9
              bestCost = tourCost;
              bestEnd = end;
          }
      }

      const reverseTour = [start];
      let mask = fullMask;
      let city = bestEnd;
      while (city !== -1 && city !== start) {
          //@step 10
          reverseTour.push(city);
          const previous = parent[mask][city];
          mask ^= 1 << city;
          city = previous;
      }

      //@step 11
      return {
          minCost: bestCost,
          tour: [start, ...reverseTour.slice(1).reverse(), start],
      };
  }
  //#endregion tsp
  `,
  'javascript',
);

const TSP_GO = buildStructuredCode(
  `
  package dp

  //#region tsp-result interface collapsed
  type TspResult struct {
      MinCost int
      Tour []int
  }
  //#endregion tsp-result

  /**
   * Solves Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  func HeldKarp(dist [][]int, start int) TspResult {
      cityCount := len(dist)
      fullMask := (1 << cityCount) - 1
      dp := make([][]int, 1 << cityCount)
      parent := make([][]int, 1 << cityCount)
      for mask := 0; mask <= fullMask; mask += 1 {
          dp[mask] = make([]int, cityCount)
          parent[mask] = make([]int, cityCount)
          for city := 0; city < cityCount; city += 1 {
              dp[mask][city] = inf()
              parent[mask][city] = -1
          }
      }

      //@step 2
      dp[1 << start][start] = 0

      for mask := 0; mask <= fullMask; mask += 1 {
          if (mask & (1 << start)) == 0 {
              continue
          }

          for end := 0; end < cityCount; end += 1 {
              if (mask & (1 << end)) == 0 || dp[mask][end] == inf() {
                  continue
              }

              for next := 0; next < cityCount; next += 1 {
                  if (mask & (1 << next)) != 0 {
                      continue
                  }

                  //@step 5
                  nextMask := mask | (1 << next)
                  //@step 6
                  candidate := dp[mask][end] + dist[end][next]

                  if candidate < dp[nextMask][next] {
                      dp[nextMask][next] = candidate
                      parent[nextMask][next] = end
                  }
              }
          }
      }

      //@step 8
      bestEnd := start
      bestCost := inf()
      for end := 0; end < cityCount; end += 1 {
          if end == start || dp[fullMask][end] == inf() {
              continue
          }

          tourCost := dp[fullMask][end] + dist[end][start]
          if tourCost < bestCost {
              //@step 9
              bestCost = tourCost
              bestEnd = end
          }
      }

      reverseTour := []int{start}
      mask := fullMask
      city := bestEnd
      for city != -1 && city != start {
          //@step 10
          reverseTour = append(reverseTour, city)
          previous := parent[mask][city]
          mask ^= 1 << city
          city = previous
      }

      path := []int{start}
      for index := len(reverseTour) - 1; index >= 1; index -= 1 {
          path = append(path, reverseTour[index])
      }
      path = append(path, start)

      //@step 11
      return TspResult{MinCost: bestCost, Tour: path}
  }
  //#endregion tsp

  //#region inf helper collapsed
  func inf() int {
      return int(^uint(0) >> 1)
  }
  //#endregion inf
  `,
  'go',
);

const TSP_RUST = buildStructuredCode(
  `
  //#region tsp-result interface collapsed
  struct TspResult {
      min_cost: i32,
      tour: Vec<usize>,
  }
  //#endregion tsp-result

  /**
   * Solves Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  fn held_karp(dist: &[Vec<i32>], start: usize) -> TspResult {
      let city_count = dist.len();
      let full_mask = (1usize << city_count) - 1;
      let mut dp = vec![vec![i32::MAX; city_count]; 1usize << city_count];
      let mut parent = vec![vec![-1isize; city_count]; 1usize << city_count];

      //@step 2
      dp[1usize << start][start] = 0;

      for mask in 0..=full_mask {
          if (mask & (1usize << start)) == 0 {
              continue;
          }

          for end in 0..city_count {
              if (mask & (1usize << end)) == 0 || dp[mask][end] == i32::MAX {
                  continue;
              }

              for next in 0..city_count {
                  if (mask & (1usize << next)) != 0 {
                      continue;
                  }

                  //@step 5
                  let next_mask = mask | (1usize << next);
                  //@step 6
                  let candidate = dp[mask][end] + dist[end][next];

                  if candidate < dp[next_mask][next] {
                      dp[next_mask][next] = candidate;
                      parent[next_mask][next] = end as isize;
                  }
              }
          }
      }

      //@step 8
      let mut best_end = start;
      let mut best_cost = i32::MAX;
      for end in 0..city_count {
          if end == start || dp[full_mask][end] == i32::MAX {
              continue;
          }

          let tour_cost = dp[full_mask][end] + dist[end][start];
          if tour_cost < best_cost {
              //@step 9
              best_cost = tour_cost;
              best_end = end;
          }
      }

      let mut reverse_tour = vec![start];
      let mut mask = full_mask;
      let mut city = best_end as isize;
      while city != -1 && city as usize != start {
          //@step 10
          reverse_tour.push(city as usize);
          let previous = parent[mask][city as usize];
          mask ^= 1usize << (city as usize);
          city = previous;
      }

      let mut tour = vec![start];
      for &stop in reverse_tour.iter().skip(1).rev() {
          tour.push(stop);
      }
      tour.push(start);

      //@step 11
      TspResult { min_cost: best_cost, tour }
  }
  //#endregion tsp
  `,
  'rust',
);

const TSP_SWIFT = buildStructuredCode(
  `
  //#region tsp-result interface collapsed
  struct TspResult {
      let minCost: Int
      let tour: [Int]
  }
  //#endregion tsp-result

  /**
   * Solves Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  func heldKarp(_ dist: [[Int]], start: Int) -> TspResult {
      let cityCount = dist.count
      let fullMask = (1 << cityCount) - 1
      var dp = Array(
          repeating: Array(repeating: Int.max, count: cityCount),
          count: 1 << cityCount,
      )
      var parent = Array(
          repeating: Array(repeating: -1, count: cityCount),
          count: 1 << cityCount,
      )

      //@step 2
      dp[1 << start][start] = 0

      for mask in 0...fullMask {
          if (mask & (1 << start)) == 0 {
              continue
          }

          for end in 0..<cityCount {
              if (mask & (1 << end)) == 0 || dp[mask][end] == Int.max {
                  continue
              }

              for next in 0..<cityCount {
                  if (mask & (1 << next)) != 0 {
                      continue
                  }

                  //@step 5
                  let nextMask = mask | (1 << next)
                  //@step 6
                  let candidate = dp[mask][end] + dist[end][next]

                  if candidate < dp[nextMask][next] {
                      dp[nextMask][next] = candidate
                      parent[nextMask][next] = end
                  }
              }
          }
      }

      //@step 8
      var bestEnd = start
      var bestCost = Int.max
      for end in 0..<cityCount where end != start && dp[fullMask][end] != Int.max {
          let tourCost = dp[fullMask][end] + dist[end][start]
          if tourCost < bestCost {
              //@step 9
              bestCost = tourCost
              bestEnd = end
          }
      }

      var reverseTour = [start]
      var mask = fullMask
      var city = bestEnd
      while city != -1 && city != start {
          //@step 10
          reverseTour.append(city)
          let previous = parent[mask][city]
          mask ^= 1 << city
          city = previous
      }

      //@step 11
      return TspResult(
          minCost: bestCost,
          tour: [start] + reverseTour.dropFirst().reversed() + [start],
      )
  }
  //#endregion tsp
  `,
  'swift',
);

const TSP_PHP = buildStructuredCode(
  `
  /**
   * Solves Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  function heldKarp(array $dist, int $start): array
  {
      $cityCount = count($dist);
      $fullMask = (1 << $cityCount) - 1;
      $dp = array_fill(0, 1 << $cityCount, array_fill(0, $cityCount, PHP_INT_MAX));
      $parent = array_fill(0, 1 << $cityCount, array_fill(0, $cityCount, -1));

      //@step 2
      $dp[1 << $start][$start] = 0;

      for ($mask = 0; $mask <= $fullMask; $mask += 1) {
          if (($mask & (1 << $start)) === 0) {
              continue;
          }

          for ($end = 0; $end < $cityCount; $end += 1) {
              if (($mask & (1 << $end)) === 0 || $dp[$mask][$end] === PHP_INT_MAX) {
                  continue;
              }

              for ($next = 0; $next < $cityCount; $next += 1) {
                  if (($mask & (1 << $next)) !== 0) {
                      continue;
                  }

                  //@step 5
                  $nextMask = $mask | (1 << $next);
                  //@step 6
                  $candidate = $dp[$mask][$end] + $dist[$end][$next];

                  if ($candidate < $dp[$nextMask][$next]) {
                      $dp[$nextMask][$next] = $candidate;
                      $parent[$nextMask][$next] = $end;
                  }
              }
          }
      }

      //@step 8
      $bestEnd = $start;
      $bestCost = PHP_INT_MAX;
      for ($end = 0; $end < $cityCount; $end += 1) {
          if ($end === $start || $dp[$fullMask][$end] === PHP_INT_MAX) {
              continue;
          }

          $tourCost = $dp[$fullMask][$end] + $dist[$end][$start];
          if ($tourCost < $bestCost) {
              //@step 9
              $bestCost = $tourCost;
              $bestEnd = $end;
          }
      }

      $reverseTour = [$start];
      $mask = $fullMask;
      $city = $bestEnd;
      while ($city !== -1 && $city !== $start) {
          //@step 10
          $reverseTour[] = $city;
          $previous = $parent[$mask][$city];
          $mask ^= 1 << $city;
          $city = $previous;
      }

      //@step 11
      return [
          'minCost' => $bestCost,
          'tour' => [$start, ...array_reverse(array_slice($reverseTour, 1)), $start],
      ];
  }
  //#endregion tsp
  `,
  'php',
);

const TSP_KOTLIN = buildStructuredCode(
  `
  //#region tsp-result interface collapsed
  data class TspResult(
      val minCost: Int,
      val tour: List<Int>,
  )
  //#endregion tsp-result

  /**
   * Solves Traveling Salesman with Held-Karp dynamic programming.
   * Input: distance matrix and start city.
   * Returns: minimum Hamiltonian tour cost and one optimal tour.
   */
  //#region tsp function open
  fun heldKarp(dist: Array<IntArray>, start: Int): TspResult {
      val cityCount = dist.size
      val fullMask = (1 shl cityCount) - 1
      val dp = Array(1 shl cityCount) { IntArray(cityCount) { Int.MAX_VALUE } }
      val parent = Array(1 shl cityCount) { IntArray(cityCount) { -1 } }

      //@step 2
      dp[1 shl start][start] = 0

      for (mask in 0..fullMask) {
          if ((mask and (1 shl start)) == 0) {
              continue
          }

          for (end in 0 until cityCount) {
              if ((mask and (1 shl end)) == 0 || dp[mask][end] == Int.MAX_VALUE) {
                  continue
              }

              for (next in 0 until cityCount) {
                  if ((mask and (1 shl next)) != 0) {
                      continue
                  }

                  //@step 5
                  val nextMask = mask or (1 shl next)
                  //@step 6
                  val candidate = dp[mask][end] + dist[end][next]

                  if (candidate < dp[nextMask][next]) {
                      dp[nextMask][next] = candidate
                      parent[nextMask][next] = end
                  }
              }
          }
      }

      //@step 8
      var bestEnd = start
      var bestCost = Int.MAX_VALUE
      for (end in 0 until cityCount) {
          if (end == start || dp[fullMask][end] == Int.MAX_VALUE) {
              continue
          }

          val tourCost = dp[fullMask][end] + dist[end][start]
          if (tourCost < bestCost) {
              //@step 9
              bestCost = tourCost
              bestEnd = end
          }
      }

      val reverseTour = mutableListOf(start)
      var mask = fullMask
      var city = bestEnd
      while (city != -1 && city != start) {
          //@step 10
          reverseTour += city
          val previous = parent[mask][city]
          mask = mask xor (1 shl city)
          city = previous
      }

      //@step 11
      return TspResult(
          minCost = bestCost,
          tour = listOf(start) + reverseTour.drop(1).reversed() + start,
      )
  }
  //#endregion tsp
  `,
  'kotlin',
);

export const TRAVELING_SALESMAN_DP_CODE = TSP_TS.lines;
export const TRAVELING_SALESMAN_DP_CODE_REGIONS = TSP_TS.regions;
export const TRAVELING_SALESMAN_DP_CODE_HIGHLIGHT_MAP = TSP_TS.highlightMap;
export const TRAVELING_SALESMAN_DP_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: TSP_TS.lines,
    regions: TSP_TS.regions,
    highlightMap: TSP_TS.highlightMap,
    source: TSP_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: TSP_JS.lines,
    regions: TSP_JS.regions,
    highlightMap: TSP_JS.highlightMap,
    source: TSP_JS.source,
  },
  python: {
    language: 'python',
    lines: TSP_PY.lines,
    regions: TSP_PY.regions,
    highlightMap: TSP_PY.highlightMap,
    source: TSP_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: TSP_CS.lines,
    regions: TSP_CS.regions,
    highlightMap: TSP_CS.highlightMap,
    source: TSP_CS.source,
  },
  java: {
    language: 'java',
    lines: TSP_JAVA.lines,
    regions: TSP_JAVA.regions,
    highlightMap: TSP_JAVA.highlightMap,
    source: TSP_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: TSP_CPP.lines,
    regions: TSP_CPP.regions,
    highlightMap: TSP_CPP.highlightMap,
    source: TSP_CPP.source,
  },
  go: {
    language: 'go',
    lines: TSP_GO.lines,
    regions: TSP_GO.regions,
    highlightMap: TSP_GO.highlightMap,
    source: TSP_GO.source,
  },
  rust: {
    language: 'rust',
    lines: TSP_RUST.lines,
    regions: TSP_RUST.regions,
    highlightMap: TSP_RUST.highlightMap,
    source: TSP_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: TSP_SWIFT.lines,
    regions: TSP_SWIFT.regions,
    highlightMap: TSP_SWIFT.highlightMap,
    source: TSP_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: TSP_PHP.lines,
    regions: TSP_PHP.regions,
    highlightMap: TSP_PHP.highlightMap,
    source: TSP_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: TSP_KOTLIN.lines,
    regions: TSP_KOTLIN.regions,
    highlightMap: TSP_KOTLIN.highlightMap,
    source: TSP_KOTLIN.source,
  },
};
