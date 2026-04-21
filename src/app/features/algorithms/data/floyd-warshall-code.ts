import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const FLOYD_WARSHALL_CODE_SOURCES = {
  typescript: `
    function floydWarshall(distance: number[][]): number[][] {
      //@step 2
      const nodeCount = distance.length;

      //@step 3
      for (let mid = 0; mid < nodeCount; mid += 1) {
        for (let from = 0; from < nodeCount; from += 1) {
          for (let to = 0; to < nodeCount; to += 1) {
            //@step 4
            const throughMid = distance[from]![mid]! + distance[mid]![to]!;
            if (throughMid < distance[from]![to]!) {
              //@step 5
              distance[from]![to] = throughMid;
            }
          }
        }
      }

      //@step 6
      return distance;
    }
  `,
  javascript: `
    function floydWarshall(distance) {
      const nodeCount = distance.length;

      for (let mid = 0; mid < nodeCount; mid += 1) {
        for (let from = 0; from < nodeCount; from += 1) {
          for (let to = 0; to < nodeCount; to += 1) {
            const throughMid = distance[from][mid] + distance[mid][to];
            if (throughMid < distance[from][to]) {
              distance[from][to] = throughMid;
            }
          }
        }
      }

      return distance;
    }
  `,
  python: `
    def floyd_warshall(distance: list[list[float]]) -> list[list[float]]:
        node_count = len(distance)

        for mid in range(node_count):
            for from_index in range(node_count):
                for to_index in range(node_count):
                    through_mid = distance[from_index][mid] + distance[mid][to_index]
                    if through_mid < distance[from_index][to_index]:
                        distance[from_index][to_index] = through_mid

        return distance
  `,
  csharp: `
    public static double[][] FloydWarshall(double[][] distance)
    {
        var nodeCount = distance.Length;

        for (var mid = 0; mid < nodeCount; mid += 1)
        {
            for (var from = 0; from < nodeCount; from += 1)
            {
                for (var to = 0; to < nodeCount; to += 1)
                {
                    var throughMid = distance[from][mid] + distance[mid][to];
                    if (throughMid < distance[from][to])
                    {
                        distance[from][to] = throughMid;
                    }
                }
            }
        }

        return distance;
    }
  `,
  java: `
    public static double[][] floydWarshall(double[][] distance) {
        int nodeCount = distance.length;

        for (int mid = 0; mid < nodeCount; mid += 1) {
            for (int from = 0; from < nodeCount; from += 1) {
                for (int to = 0; to < nodeCount; to += 1) {
                    double throughMid = distance[from][mid] + distance[mid][to];
                    if (throughMid < distance[from][to]) {
                        distance[from][to] = throughMid;
                    }
                }
            }
        }

        return distance;
    }
  `,
  cpp: `
    #include <vector>

    std::vector<std::vector<double>> floydWarshall(std::vector<std::vector<double>> distance) {
        int nodeCount = static_cast<int>(distance.size());

        for (int mid = 0; mid < nodeCount; mid += 1) {
            for (int from = 0; from < nodeCount; from += 1) {
                for (int to = 0; to < nodeCount; to += 1) {
                    double throughMid = distance[from][mid] + distance[mid][to];
                    if (throughMid < distance[from][to]) {
                        distance[from][to] = throughMid;
                    }
                }
            }
        }

        return distance;
    }
  `,
  go: `
    package graphs

    func FloydWarshall(distance [][]float64) [][]float64 {
        nodeCount := len(distance)

        for mid := 0; mid < nodeCount; mid += 1 {
            for from := 0; from < nodeCount; from += 1 {
                for to := 0; to < nodeCount; to += 1 {
                    throughMid := distance[from][mid] + distance[mid][to]
                    if throughMid < distance[from][to] {
                        distance[from][to] = throughMid
                    }
                }
            }
        }

        return distance
    }
  `,
  rust: `
    fn floyd_warshall(mut distance: Vec<Vec<f64>>) -> Vec<Vec<f64>> {
        let node_count = distance.len();

        for mid in 0..node_count {
            for from in 0..node_count {
                for to in 0..node_count {
                    let through_mid = distance[from][mid] + distance[mid][to];
                    if through_mid < distance[from][to] {
                        distance[from][to] = through_mid;
                    }
                }
            }
        }

        distance
    }
  `,
  swift: `
    func floydWarshall(distance: inout [[Double]]) {
        let nodeCount = distance.count

        for mid in 0..<nodeCount {
            for from in 0..<nodeCount {
                for to in 0..<nodeCount {
                    let throughMid = distance[from][mid] + distance[mid][to]
                    if throughMid < distance[from][to] {
                        distance[from][to] = throughMid
                    }
                }
            }
        }
    }
  `,
  php: `
    <?php

    function floydWarshall(array $distance): array
    {
        $nodeCount = count($distance);

        for ($mid = 0; $mid < $nodeCount; $mid += 1) {
            for ($from = 0; $from < $nodeCount; $from += 1) {
                for ($to = 0; $to < $nodeCount; $to += 1) {
                    $throughMid = $distance[$from][$mid] + $distance[$mid][$to];
                    if ($throughMid < $distance[$from][$to]) {
                        $distance[$from][$to] = $throughMid;
                    }
                }
            }
        }

        return $distance;
    }
  `,
  kotlin: `
    fun floydWarshall(distance: MutableList<MutableList<Double>>): List<List<Double>> {
        val nodeCount = distance.size

        for (mid in 0 until nodeCount) {
            for (from in 0 until nodeCount) {
                for (to in 0 until nodeCount) {
                    val throughMid = distance[from][mid] + distance[mid][to]
                    if (throughMid < distance[from][to]) {
                        distance[from][to] = throughMid
                    }
                }
            }
        }

        return distance
    }
  `,
} as const;

export const FLOYD_WARSHALL_CODE_VARIANTS: CodeVariantMap = buildCodeVariants(
  FLOYD_WARSHALL_CODE_SOURCES,
);
export const FLOYD_WARSHALL_CODE = FLOYD_WARSHALL_CODE_VARIANTS.typescript?.lines ?? [];
