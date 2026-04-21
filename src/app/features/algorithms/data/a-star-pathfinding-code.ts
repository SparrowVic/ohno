import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const A_STAR_PATHFINDING_CODE_SOURCES = {
  typescript: `
    function aStar(grid: number[][], start: string, goal: string): string[] {
      //@step 2
      const open = new Set([start]);
      const g = new Map([[start, 0]]);
      const f = new Map([[start, heuristic(start, goal)]]);
      const parent = new Map<string, string | null>([[start, null]]);

      while (open.size > 0) {
        //@step 5
        const current = [...open].reduce((best, node) =>
          (f.get(node) ?? Number.POSITIVE_INFINITY) < (f.get(best) ?? Number.POSITIVE_INFINITY) ? node : best,
        );
        if (current === goal) {
          //@step 12
          return reconstructPath(parent, goal);
        }

        open.delete(current);
        //@step 7
        for (const neighbor of neighbors(grid, current)) {
          const tentativeG = (g.get(current) ?? Number.POSITIVE_INFINITY) + 1;
          //@step 8
          if (tentativeG >= (g.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
            continue;
          }
          //@step 9
          parent.set(neighbor, current);
          g.set(neighbor, tentativeG);
          f.set(neighbor, tentativeG + heuristic(neighbor, goal));
          open.add(neighbor);
        }
      }

      //@step 13
      return [];
    }
  `,
  javascript: `
    function aStar(grid, start, goal) {
      const open = new Set([start]);
      const g = new Map([[start, 0]]);
      const f = new Map([[start, heuristic(start, goal)]]);
      const parent = new Map([[start, null]]);

      while (open.size > 0) {
        const current = [...open].reduce((best, node) =>
          (f.get(node) ?? Number.POSITIVE_INFINITY) < (f.get(best) ?? Number.POSITIVE_INFINITY) ? node : best,
        );
        if (current === goal) {
          return reconstructPath(parent, goal);
        }

        open.delete(current);
        for (const neighbor of neighbors(grid, current)) {
          const tentativeG = (g.get(current) ?? Number.POSITIVE_INFINITY) + 1;
          if (tentativeG >= (g.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
            continue;
          }
          parent.set(neighbor, current);
          g.set(neighbor, tentativeG);
          f.set(neighbor, tentativeG + heuristic(neighbor, goal));
          open.add(neighbor);
        }
      }

      return [];
    }
  `,
  python: `
    def a_star(grid: list[list[int]], start: str, goal: str) -> list[str]:
        open_set = {start}
        g = {start: 0}
        f = {start: heuristic(start, goal)}
        parent = {start: None}

        while open_set:
            current = min(open_set, key=lambda node: f.get(node, float("inf")))
            if current == goal:
                return reconstruct_path(parent, goal)

            open_set.remove(current)
            for neighbor in neighbors(grid, current):
                tentative_g = g.get(current, float("inf")) + 1
                if tentative_g >= g.get(neighbor, float("inf")):
                    continue
                parent[neighbor] = current
                g[neighbor] = tentative_g
                f[neighbor] = tentative_g + heuristic(neighbor, goal)
                open_set.add(neighbor)

        return []
  `,
  csharp: `
    using System.Collections.Generic;
    using System.Linq;

    public static List<string> AStar(int[][] grid, string start, string goal)
    {
        var open = new HashSet<string> { start };
        var g = new Dictionary<string, double> { [start] = 0 };
        var f = new Dictionary<string, double> { [start] = Heuristic(start, goal) };
        var parent = new Dictionary<string, string?> { [start] = null };

        while (open.Count > 0)
        {
            var current = open.MinBy(node => f.GetValueOrDefault(node, double.PositiveInfinity))!;
            if (current == goal) return ReconstructPath(parent, goal);

            open.Remove(current);
            foreach (var neighbor in Neighbors(grid, current))
            {
                var tentativeG = g.GetValueOrDefault(current, double.PositiveInfinity) + 1;
                if (tentativeG >= g.GetValueOrDefault(neighbor, double.PositiveInfinity)) continue;
                parent[neighbor] = current;
                g[neighbor] = tentativeG;
                f[neighbor] = tentativeG + Heuristic(neighbor, goal);
                open.Add(neighbor);
            }
        }

        return [];
    }
  `,
  java: `
    import java.util.*;

    public static List<String> aStar(int[][] grid, String start, String goal) {
        Set<String> open = new HashSet<>(List.of(start));
        Map<String, Double> g = new HashMap<>(Map.of(start, 0.0));
        Map<String, Double> f = new HashMap<>(Map.of(start, heuristic(start, goal)));
        Map<String, String> parent = new HashMap<>();
        parent.put(start, null);

        while (!open.isEmpty()) {
            String current = open.stream()
                .min(Comparator.comparingDouble(node -> f.getOrDefault(node, Double.POSITIVE_INFINITY)))
                .orElseThrow();
            if (current.equals(goal)) return reconstructPath(parent, goal);

            open.remove(current);
            for (String neighbor : neighbors(grid, current)) {
                double tentativeG = g.getOrDefault(current, Double.POSITIVE_INFINITY) + 1;
                if (tentativeG >= g.getOrDefault(neighbor, Double.POSITIVE_INFINITY)) continue;
                parent.put(neighbor, current);
                g.put(neighbor, tentativeG);
                f.put(neighbor, tentativeG + heuristic(neighbor, goal));
                open.add(neighbor);
            }
        }

        return List.of();
    }
  `,
  cpp: `
    #include <string>
    #include <unordered_map>
    #include <unordered_set>
    #include <vector>

    std::vector<std::string> aStar(
        const std::vector<std::vector<int>>& grid,
        const std::string& start,
        const std::string& goal
    ) {
        std::unordered_set<std::string> open{ start };
        std::unordered_map<std::string, double> g{ { start, 0.0 } };
        std::unordered_map<std::string, double> f{ { start, heuristic(start, goal) } };
        std::unordered_map<std::string, std::string> parent;

        while (!open.empty()) {
            std::string current = pickMinByScore(open, f);
            if (current == goal) return reconstructPath(parent, goal);

            open.erase(current);
            for (const auto& neighbor : neighbors(grid, current)) {
                double tentativeG = g[current] + 1.0;
                if (tentativeG >= g.count(neighbor) ? g[neighbor] : std::numeric_limits<double>::infinity()) continue;
                parent[neighbor] = current;
                g[neighbor] = tentativeG;
                f[neighbor] = tentativeG + heuristic(neighbor, goal);
                open.insert(neighbor);
            }
        }

        return {};
    }
  `,
  go: `
    package graphs

    import "math"

    func AStar(grid [][]int, start string, goal string) []string {
        open := map[string]struct{}{start: {}}
        g := map[string]float64{start: 0}
        f := map[string]float64{start: heuristic(start, goal)}
        parent := map[string]*string{start: nil}

        for len(open) > 0 {
            current := pickMinByScore(open, f)
            if current == goal {
                return reconstructPath(parent, goal)
            }

            delete(open, current)
            for _, neighbor := range neighbors(grid, current) {
                tentativeG := g[current] + 1
                if tentativeG >= valueOrInf(g, neighbor) {
                    continue
                }
                parentValue := current
                parent[neighbor] = &parentValue
                g[neighbor] = tentativeG
                f[neighbor] = tentativeG + heuristic(neighbor, goal)
                open[neighbor] = struct{}{}
            }
        }

        return []string{}
    }

    func valueOrInf(values map[string]float64, key string) float64 {
        if value, ok := values[key]; ok {
            return value
        }
        return math.Inf(1)
    }
  `,
  rust: `
    use std::collections::{HashMap, HashSet};

    fn a_star(grid: &[Vec<i32>], start: &str, goal: &str) -> Vec<String> {
        let mut open = HashSet::from([start.to_string()]);
        let mut g = HashMap::from([(start.to_string(), 0.0)]);
        let mut f = HashMap::from([(start.to_string(), heuristic(start, goal))]);
        let mut parent = HashMap::from([(start.to_string(), None::<String>)]);

        while !open.is_empty() {
            let current = pick_min_by_score(&open, &f);
            if current == goal {
                return reconstruct_path(&parent, goal);
            }

            open.remove(&current);
            for neighbor in neighbors(grid, &current) {
                let tentative_g = g.get(&current).copied().unwrap_or(f64::INFINITY) + 1.0;
                if tentative_g >= g.get(&neighbor).copied().unwrap_or(f64::INFINITY) {
                    continue;
                }
                parent.insert(neighbor.clone(), Some(current.clone()));
                g.insert(neighbor.clone(), tentative_g);
                f.insert(neighbor.clone(), tentative_g + heuristic(&neighbor, goal));
                open.insert(neighbor);
            }
        }

        Vec::new()
    }
  `,
  swift: `
    func aStar(grid: [[Int]], start: String, goal: String) -> [String] {
        var open: Set<String> = [start]
        var g: [String: Double] = [start: 0]
        var f: [String: Double] = [start: heuristic(start, goal)]
        var parent: [String: String?] = [start: nil]

        while !open.isEmpty {
            let current = pickMinByScore(open: open, score: f)
            if current == goal {
                return reconstructPath(parent: parent, goal: goal)
            }

            open.remove(current)
            for neighbor in neighbors(grid: grid, node: current) {
                let tentativeG = (g[current] ?? Double.infinity) + 1
                if tentativeG >= (g[neighbor] ?? Double.infinity) {
                    continue
                }
                parent[neighbor] = current
                g[neighbor] = tentativeG
                f[neighbor] = tentativeG + heuristic(neighbor, goal)
                open.insert(neighbor)
            }
        }

        return []
    }
  `,
  php: `
    <?php

    function aStar(array $grid, string $start, string $goal): array
    {
        $open = [$start => true];
        $g = [$start => 0.0];
        $f = [$start => heuristic($start, $goal)];
        $parent = [$start => null];

        while ($open !== []) {
            $current = pickMinByScore($open, $f);
            if ($current === $goal) {
                return reconstructPath($parent, $goal);
            }

            unset($open[$current]);
            foreach (neighbors($grid, $current) as $neighbor) {
                $tentativeG = ($g[$current] ?? INF) + 1.0;
                if ($tentativeG >= ($g[$neighbor] ?? INF)) {
                    continue;
                }
                $parent[$neighbor] = $current;
                $g[$neighbor] = $tentativeG;
                $f[$neighbor] = $tentativeG + heuristic($neighbor, $goal);
                $open[$neighbor] = true;
            }
        }

        return [];
    }
  `,
  kotlin: `
    fun aStar(grid: List<List<Int>>, start: String, goal: String): List<String> {
        val open = mutableSetOf(start)
        val g = mutableMapOf(start to 0.0)
        val f = mutableMapOf(start to heuristic(start, goal))
        val parent = mutableMapOf<String, String?>(start to null)

        while (open.isNotEmpty()) {
            val current = open.minByOrNull { f[it] ?: Double.POSITIVE_INFINITY } ?: return emptyList()
            if (current == goal) {
                return reconstructPath(parent, goal)
            }

            open -= current
            for (neighbor in neighbors(grid, current)) {
                val tentativeG = (g[current] ?: Double.POSITIVE_INFINITY) + 1.0
                if (tentativeG >= (g[neighbor] ?: Double.POSITIVE_INFINITY)) {
                    continue
                }
                parent[neighbor] = current
                g[neighbor] = tentativeG
                f[neighbor] = tentativeG + heuristic(neighbor, goal)
                open += neighbor
            }
        }

        return emptyList()
    }
  `,
} as const;

export const A_STAR_PATHFINDING_CODE_VARIANTS: CodeVariantMap = buildCodeVariants(
  A_STAR_PATHFINDING_CODE_SOURCES,
);
export const A_STAR_PATHFINDING_CODE = A_STAR_PATHFINDING_CODE_VARIANTS.typescript?.lines ?? [];
