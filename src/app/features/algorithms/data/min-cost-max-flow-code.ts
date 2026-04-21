import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const MIN_COST_MAX_FLOW_CODE_SOURCES = {
  typescript: `
    function minCostMaxFlow(network: ResidualCostNetwork, source: string, sink: string): {
      flow: number;
      cost: number;
    } {
      //@step 2
      let flow = 0;
      let cost = 0;

      while (true) {
        //@step 3
        //@step 4
        //@step 5
        const shortestPath = shortestResidualPath(network, source, sink);
        if (!shortestPath.parent.has(sink)) {
          break;
        }

        //@step 6
        const bottleneck = pathBottleneck(network, shortestPath.parent, source, sink);
        //@step 7
        augmentPath(network, shortestPath.parent, source, sink, bottleneck);
        flow += bottleneck;
        cost += bottleneck * shortestPath.distance.get(sink)!;
      }

      //@step 8
      return { flow, cost };
    }
  `,
  javascript: `
    function minCostMaxFlow(network, source, sink) {
      let flow = 0;
      let cost = 0;

      while (true) {
        const shortestPath = shortestResidualPath(network, source, sink);
        if (!shortestPath.parent.has(sink)) {
          break;
        }

        const bottleneck = pathBottleneck(network, shortestPath.parent, source, sink);
        augmentPath(network, shortestPath.parent, source, sink, bottleneck);
        flow += bottleneck;
        cost += bottleneck * shortestPath.distance.get(sink);
      }

      return { flow, cost };
    }
  `,
  python: `
    def min_cost_max_flow(network: ResidualCostNetwork, source: str, sink: str) -> tuple[int, int]:
        flow = 0
        cost = 0

        while True:
            shortest_path = shortest_residual_path(network, source, sink)
            if sink not in shortest_path.parent:
                break

            bottleneck = path_bottleneck(network, shortest_path.parent, source, sink)
            augment_path(network, shortest_path.parent, source, sink, bottleneck)
            flow += bottleneck
            cost += bottleneck * shortest_path.distance[sink]

        return flow, cost
  `,
  csharp: `
    public static (int Flow, int Cost) MinCostMaxFlow(
        ResidualCostNetwork network,
        string source,
        string sink
    ) {
        var flow = 0;
        var cost = 0;

        while (true)
        {
            var shortestPath = ShortestResidualPath(network, source, sink);
            if (!shortestPath.Parent.ContainsKey(sink))
            {
                break;
            }

            var bottleneck = PathBottleneck(network, shortestPath.Parent, source, sink);
            AugmentPath(network, shortestPath.Parent, source, sink, bottleneck);
            flow += bottleneck;
            cost += bottleneck * shortestPath.Distance[sink];
        }

        return (flow, cost);
    }
  `,
  java: `
    public static Map<String, Integer> minCostMaxFlow(
        ResidualCostNetwork network,
        String source,
        String sink
    ) {
        int flow = 0;
        int cost = 0;

        while (true) {
            var shortestPath = shortestResidualPath(network, source, sink);
            if (!shortestPath.parent().containsKey(sink)) {
                break;
            }

            int bottleneck = pathBottleneck(network, shortestPath.parent(), source, sink);
            augmentPath(network, shortestPath.parent(), source, sink, bottleneck);
            flow += bottleneck;
            cost += bottleneck * shortestPath.distance().get(sink);
        }

        return Map.of("flow", flow, "cost", cost);
    }
  `,
  cpp: `
    std::pair<int, int> minCostMaxFlow(
        ResidualCostNetwork& network,
        const std::string& source,
        const std::string& sink
    ) {
        int flow = 0;
        int cost = 0;

        while (true) {
            auto shortestPath = shortestResidualPath(network, source, sink);
            if (!shortestPath.parent.contains(sink)) {
                break;
            }

            int bottleneck = pathBottleneck(network, shortestPath.parent, source, sink);
            augmentPath(network, shortestPath.parent, source, sink, bottleneck);
            flow += bottleneck;
            cost += bottleneck * shortestPath.distance[sink];
        }

        return { flow, cost };
    }
  `,
  go: `
    package graphs

    func MinCostMaxFlow(network *ResidualCostNetwork, source string, sink string) (int, int) {
        flow := 0
        cost := 0

        for {
            shortestPath := shortestResidualPath(network, source, sink)
            if _, ok := shortestPath.Parent[sink]; !ok {
                break
            }

            bottleneck := pathBottleneck(network, shortestPath.Parent, source, sink)
            augmentPath(network, shortestPath.Parent, source, sink, bottleneck)
            flow += bottleneck
            cost += bottleneck * shortestPath.Distance[sink]
        }

        return flow, cost
    }
  `,
  rust: `
    fn min_cost_max_flow(
        network: &mut ResidualCostNetwork,
        source: &str,
        sink: &str,
    ) -> (i32, i32) {
        let mut flow = 0;
        let mut cost = 0;

        loop {
            let shortest_path = shortest_residual_path(network, source, sink);
            if !shortest_path.parent.contains_key(sink) {
                break;
            }

            let bottleneck = path_bottleneck(network, &shortest_path.parent, source, sink);
            augment_path(network, &shortest_path.parent, source, sink, bottleneck);
            flow += bottleneck;
            cost += bottleneck * shortest_path.distance[sink];
        }

        (flow, cost)
    }
  `,
  swift: `
    func minCostMaxFlow(
        network: inout ResidualCostNetwork,
        source: String,
        sink: String,
    ) -> (flow: Int, cost: Int) {
        var flow = 0
        var cost = 0

        while true {
            let shortestPath = shortestResidualPath(network: network, source: source, sink: sink)
            if shortestPath.parent[sink] == nil {
                break
            }

            let bottleneck = pathBottleneck(network: network, parent: shortestPath.parent, source: source, sink: sink)
            augmentPath(network: &network, parent: shortestPath.parent, source: source, sink: sink, bottleneck: bottleneck)
            flow += bottleneck
            cost += bottleneck * (shortestPath.distance[sink] ?? 0)
        }

        return (flow, cost)
    }
  `,
  php: `
    <?php

    function minCostMaxFlow(ResidualCostNetwork $network, string $source, string $sink): array
    {
        $flow = 0;
        $cost = 0;

        while (true) {
            $shortestPath = shortestResidualPath($network, $source, $sink);
            if (!array_key_exists($sink, $shortestPath['parent'])) {
                break;
            }

            $bottleneck = pathBottleneck($network, $shortestPath['parent'], $source, $sink);
            augmentPath($network, $shortestPath['parent'], $source, $sink, $bottleneck);
            $flow += $bottleneck;
            $cost += $bottleneck * $shortestPath['distance'][$sink];
        }

        return ['flow' => $flow, 'cost' => $cost];
    }
  `,
  kotlin: `
    fun minCostMaxFlow(network: ResidualCostNetwork, source: String, sink: String): Pair<Int, Int> {
        var flow = 0
        var cost = 0

        while (true) {
            val shortestPath = shortestResidualPath(network, source, sink)
            if (sink !in shortestPath.parent) {
                break
            }

            val bottleneck = pathBottleneck(network, shortestPath.parent, source, sink)
            augmentPath(network, shortestPath.parent, source, sink, bottleneck)
            flow += bottleneck
            cost += bottleneck * shortestPath.distance.getValue(sink)
        }

        return flow to cost
    }
  `,
} as const;

export const MIN_COST_MAX_FLOW_CODE_VARIANTS: CodeVariantMap = buildCodeVariants(
  MIN_COST_MAX_FLOW_CODE_SOURCES,
);
export const MIN_COST_MAX_FLOW_CODE = MIN_COST_MAX_FLOW_CODE_VARIANTS.typescript?.lines ?? [];
