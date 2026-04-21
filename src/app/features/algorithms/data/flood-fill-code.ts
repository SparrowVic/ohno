import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const FLOOD_FILL_CODE_SOURCES = {
  typescript: `
    function floodFill(grid: number[][], startRow: number, startCol: number, newColor: number): number[][] {
      //@step 2
      const oldColor = grid[startRow]?.[startCol];
      if (oldColor === undefined || oldColor === newColor) {
        return grid;
      }

      const queue: Array<[number, number]> = [[startRow, startCol]];
      const directions: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

      while (queue.length > 0) {
        //@step 5
        const [row, col] = queue.shift()!;
        //@step 6
        if (grid[row]?.[col] !== oldColor) {
          continue;
        }

        //@step 7
        grid[row][col] = newColor;
        for (const [dr, dc] of directions) {
          if (grid[row + dr]?.[col + dc] === oldColor) {
            //@step 8
            queue.push([row + dr, col + dc]);
          }
        }
      }

      //@step 10
      return grid;
    }
  `,
  javascript: `
    function floodFill(grid, startRow, startCol, newColor) {
      const oldColor = grid[startRow]?.[startCol];
      if (oldColor === undefined || oldColor === newColor) {
        return grid;
      }

      const queue = [[startRow, startCol]];
      const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

      while (queue.length > 0) {
        const [row, col] = queue.shift();
        if (grid[row]?.[col] !== oldColor) {
          continue;
        }

        grid[row][col] = newColor;
        for (const [dr, dc] of directions) {
          if (grid[row + dr]?.[col + dc] === oldColor) {
            queue.push([row + dr, col + dc]);
          }
        }
      }

      return grid;
    }
  `,
  python: `
    from collections import deque

    def flood_fill(grid: list[list[int]], start_row: int, start_col: int, new_color: int) -> list[list[int]]:
        old_color = grid[start_row][start_col]
        if old_color == new_color:
            return grid

        queue = deque([(start_row, start_col)])
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        while queue:
            row, col = queue.popleft()
            if grid[row][col] != old_color:
                continue

            grid[row][col] = new_color
            for dr, dc in directions:
                next_row, next_col = row + dr, col + dc
                if 0 <= next_row < len(grid) and 0 <= next_col < len(grid[0]) and grid[next_row][next_col] == old_color:
                    queue.append((next_row, next_col))

        return grid
  `,
  csharp: `
    using System.Collections.Generic;

    public static int[][] FloodFill(int[][] grid, int startRow, int startCol, int newColor)
    {
        var oldColor = grid[startRow][startCol];
        if (oldColor == newColor) return grid;

        var queue = new Queue<(int Row, int Col)>();
        queue.Enqueue((startRow, startCol));
        var directions = new (int Row, int Col)[] { (1, 0), (-1, 0), (0, 1), (0, -1) };

        while (queue.Count > 0)
        {
            var (row, col) = queue.Dequeue();
            if (grid[row][col] != oldColor) continue;

            grid[row][col] = newColor;
            foreach (var (dr, dc) in directions)
            {
                var nextRow = row + dr;
                var nextCol = col + dc;
                if (nextRow >= 0 && nextRow < grid.Length && nextCol >= 0 && nextCol < grid[0].Length && grid[nextRow][nextCol] == oldColor)
                {
                    queue.Enqueue((nextRow, nextCol));
                }
            }
        }

        return grid;
    }
  `,
  java: `
    import java.util.ArrayDeque;

    public static int[][] floodFill(int[][] grid, int startRow, int startCol, int newColor) {
        int oldColor = grid[startRow][startCol];
        if (oldColor == newColor) return grid;

        ArrayDeque<int[]> queue = new ArrayDeque<>();
        queue.add(new int[] { startRow, startCol });
        int[][] directions = new int[][] { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };

        while (!queue.isEmpty()) {
            int[] current = queue.removeFirst();
            int row = current[0];
            int col = current[1];
            if (grid[row][col] != oldColor) continue;

            grid[row][col] = newColor;
            for (int[] direction : directions) {
                int nextRow = row + direction[0];
                int nextCol = col + direction[1];
                if (0 <= nextRow && nextRow < grid.length && 0 <= nextCol && nextCol < grid[0].length && grid[nextRow][nextCol] == oldColor) {
                    queue.add(new int[] { nextRow, nextCol });
                }
            }
        }

        return grid;
    }
  `,
  cpp: `
    #include <array>
    #include <queue>
    #include <utility>
    #include <vector>

    std::vector<std::vector<int>> floodFill(
        std::vector<std::vector<int>> grid,
        int startRow,
        int startCol,
        int newColor
    ) {
        int oldColor = grid[startRow][startCol];
        if (oldColor == newColor) return grid;

        std::queue<std::pair<int, int>> queue;
        queue.push({ startRow, startCol });
        std::array<std::pair<int, int>, 4> directions{ { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } } };

        while (!queue.empty()) {
            auto [row, col] = queue.front();
            queue.pop();
            if (grid[row][col] != oldColor) continue;

            grid[row][col] = newColor;
            for (auto [dr, dc] : directions) {
                int nextRow = row + dr;
                int nextCol = col + dc;
                if (0 <= nextRow && nextRow < static_cast<int>(grid.size()) && 0 <= nextCol && nextCol < static_cast<int>(grid[0].size()) && grid[nextRow][nextCol] == oldColor) {
                    queue.push({ nextRow, nextCol });
                }
            }
        }

        return grid;
    }
  `,
  go: `
    package graphs

    type Cell struct {
        Row int
        Col int
    }

    func FloodFill(grid [][]int, startRow int, startCol int, newColor int) [][]int {
        oldColor := grid[startRow][startCol]
        if oldColor == newColor {
            return grid
        }

        queue := []Cell{{Row: startRow, Col: startCol}}
        directions := []Cell{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}

        for len(queue) > 0 {
            current := queue[0]
            queue = queue[1:]
            if grid[current.Row][current.Col] != oldColor {
                continue
            }

            grid[current.Row][current.Col] = newColor
            for _, direction := range directions {
                nextRow := current.Row + direction.Row
                nextCol := current.Col + direction.Col
                if 0 <= nextRow && nextRow < len(grid) && 0 <= nextCol && nextCol < len(grid[0]) && grid[nextRow][nextCol] == oldColor {
                    queue = append(queue, Cell{Row: nextRow, Col: nextCol})
                }
            }
        }

        return grid
    }
  `,
  rust: `
    use std::collections::VecDeque;

    fn flood_fill(
        mut grid: Vec<Vec<i32>>,
        start_row: usize,
        start_col: usize,
        new_color: i32,
    ) -> Vec<Vec<i32>> {
        let old_color = grid[start_row][start_col];
        if old_color == new_color {
            return grid;
        }

        let mut queue = VecDeque::from([(start_row, start_col)]);
        let directions = [(1isize, 0isize), (-1, 0), (0, 1), (0, -1)];

        while let Some((row, col)) = queue.pop_front() {
            if grid[row][col] != old_color {
                continue;
            }

            grid[row][col] = new_color;
            for (dr, dc) in directions {
                let next_row = row as isize + dr;
                let next_col = col as isize + dc;
                if next_row >= 0
                    && next_col >= 0
                    && (next_row as usize) < grid.len()
                    && (next_col as usize) < grid[0].len()
                    && grid[next_row as usize][next_col as usize] == old_color
                {
                    queue.push_back((next_row as usize, next_col as usize));
                }
            }
        }

        grid
    }
  `,
  swift: `
    func floodFill(
        grid: inout [[Int]],
        startRow: Int,
        startCol: Int,
        newColor: Int,
    ) {
        let oldColor = grid[startRow][startCol]
        if oldColor == newColor { return }

        var queue: [(row: Int, col: Int)] = [(startRow, startCol)]
        let directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        while !queue.isEmpty {
            let current = queue.removeFirst()
            if grid[current.row][current.col] != oldColor { continue }

            grid[current.row][current.col] = newColor
            for (dr, dc) in directions {
                let nextRow = current.row + dr
                let nextCol = current.col + dc
                if 0 <= nextRow && nextRow < grid.count && 0 <= nextCol && nextCol < grid[0].count && grid[nextRow][nextCol] == oldColor {
                    queue.append((nextRow, nextCol))
                }
            }
        }
    }
  `,
  php: `
    <?php

    function floodFill(array $grid, int $startRow, int $startCol, int $newColor): array
    {
        $oldColor = $grid[$startRow][$startCol];
        if ($oldColor === $newColor) {
            return $grid;
        }

        $queue = [[$startRow, $startCol]];
        $directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        while ($queue !== []) {
            [$row, $col] = array_shift($queue);
            if ($grid[$row][$col] !== $oldColor) {
                continue;
            }

            $grid[$row][$col] = $newColor;
            foreach ($directions as [$dr, $dc]) {
                $nextRow = $row + $dr;
                $nextCol = $col + $dc;
                if (0 <= $nextRow && $nextRow < count($grid) && 0 <= $nextCol && $nextCol < count($grid[0]) && $grid[$nextRow][$nextCol] === $oldColor) {
                    $queue[] = [$nextRow, $nextCol];
                }
            }
        }

        return $grid;
    }
  `,
  kotlin: `
    fun floodFill(
        grid: MutableList<MutableList<Int>>,
        startRow: Int,
        startCol: Int,
        newColor: Int,
    ): List<List<Int>> {
        val oldColor = grid[startRow][startCol]
        if (oldColor == newColor) return grid

        val queue = ArrayDeque<Pair<Int, Int>>()
        queue.addLast(startRow to startCol)
        val directions = listOf(1 to 0, -1 to 0, 0 to 1, 0 to -1)

        while (queue.isNotEmpty()) {
            val (row, col) = queue.removeFirst()
            if (grid[row][col] != oldColor) continue

            grid[row][col] = newColor
            for ((dr, dc) in directions) {
                val nextRow = row + dr
                val nextCol = col + dc
                if (nextRow in grid.indices && nextCol in grid[0].indices && grid[nextRow][nextCol] == oldColor) {
                    queue.addLast(nextRow to nextCol)
                }
            }
        }

        return grid
    }
  `,
} as const;

export const FLOOD_FILL_CODE_VARIANTS: CodeVariantMap = buildCodeVariants(FLOOD_FILL_CODE_SOURCES);
export const FLOOD_FILL_CODE = FLOOD_FILL_CODE_VARIANTS.typescript?.lines ?? [];
