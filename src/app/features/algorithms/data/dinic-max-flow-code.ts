import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const DINIC_MAX_FLOW_CODE_SOURCES = {
  typescript: `
    function dinic(network: ResidualNetwork, source: string, sink: string): number {
      //@step 2
      let flow = 0;

      //@step 3
      //@step 4
      //@step 9
      while (buildLevelGraph(network, source, sink)) {
        //@step 5
        const nextEdge = new Map<string, number>();

        while (true) {
          //@step 7
          const pushed = sendBlockingFlow(network, source, sink, Number.POSITIVE_INFINITY, nextEdge);
          if (pushed === 0) {
            break;
          }
          //@step 8
          flow += pushed;
        }
      }

      //@step 10
      return flow;
    }
  `,
  javascript: `
    function dinic(network, source, sink) {
      let flow = 0;

      while (buildLevelGraph(network, source, sink)) {
        const nextEdge = new Map();

        while (true) {
          const pushed = sendBlockingFlow(network, source, sink, Number.POSITIVE_INFINITY, nextEdge);
          if (pushed === 0) {
            break;
          }
          flow += pushed;
        }
      }

      return flow;
    }
  `,
  python: `
    def dinic(network: ResidualNetwork, source: str, sink: str) -> int:
        flow = 0

        while build_level_graph(network, source, sink):
            next_edge: dict[str, int] = {}

            while True:
                pushed = send_blocking_flow(network, source, sink, float("inf"), next_edge)
                if pushed == 0:
                    break
                flow += pushed

        return flow
  `,
  csharp: `
    public static int Dinic(ResidualNetwork network, string source, string sink)
    {
        var flow = 0;

        while (BuildLevelGraph(network, source, sink))
        {
            var nextEdge = new Dictionary<string, int>();

            while (true)
            {
                var pushed = SendBlockingFlow(network, source, sink, int.MaxValue, nextEdge);
                if (pushed == 0) break;
                flow += pushed;
            }
        }

        return flow;
    }
  `,
  java: `
    public static int dinic(ResidualNetwork network, String source, String sink) {
        int flow = 0;

        while (buildLevelGraph(network, source, sink)) {
            var nextEdge = new HashMap<String, Integer>();

            while (true) {
                int pushed = sendBlockingFlow(network, source, sink, Integer.MAX_VALUE, nextEdge);
                if (pushed == 0) break;
                flow += pushed;
            }
        }

        return flow;
    }
  `,
  cpp: `
    int dinic(ResidualNetwork& network, const std::string& source, const std::string& sink) {
        int flow = 0;

        while (buildLevelGraph(network, source, sink)) {
            std::unordered_map<std::string, int> nextEdge;

            while (true) {
                int pushed = sendBlockingFlow(network, source, sink, std::numeric_limits<int>::max(), nextEdge);
                if (pushed == 0) break;
                flow += pushed;
            }
        }

        return flow;
    }
  `,
  go: `
    package graphs

    func Dinic(network *ResidualNetwork, source string, sink string) int {
        flow := 0

        for buildLevelGraph(network, source, sink) {
            nextEdge := map[string]int{}

            for {
                pushed := sendBlockingFlow(network, source, sink, infCapacity, nextEdge)
                if pushed == 0 {
                    break
                }
                flow += pushed
            }
        }

        return flow
    }
  `,
  rust: `
    fn dinic(network: &mut ResidualNetwork, source: &str, sink: &str) -> i32 {
        let mut flow = 0;

        while build_level_graph(network, source, sink) {
            let mut next_edge = std::collections::HashMap::new();

            loop {
                let pushed = send_blocking_flow(network, source, sink, i32::MAX, &mut next_edge);
                if pushed == 0 {
                    break;
                }
                flow += pushed;
            }
        }

        flow
    }
  `,
  swift: `
    func dinic(network: inout ResidualNetwork, source: String, sink: String) -> Int {
        var flow = 0

        while buildLevelGraph(network: network, source: source, sink: sink) {
            var nextEdge: [String: Int] = [:]

            while true {
                let pushed = sendBlockingFlow(
                    network: &network,
                    source: source,
                    sink: sink,
                    limit: Int.max,
                    nextEdge: &nextEdge
                )
                if pushed == 0 { break }
                flow += pushed
            }
        }

        return flow
    }
  `,
  php: `
    <?php

    function dinic(ResidualNetwork $network, string $source, string $sink): int
    {
        $flow = 0;

        while (buildLevelGraph($network, $source, $sink)) {
            $nextEdge = [];

            while (true) {
                $pushed = sendBlockingFlow($network, $source, $sink, PHP_INT_MAX, $nextEdge);
                if ($pushed === 0) {
                    break;
                }
                $flow += $pushed;
            }
        }

        return $flow;
    }
  `,
  kotlin: `
    fun dinic(network: ResidualNetwork, source: String, sink: String): Int {
        var flow = 0

        while (buildLevelGraph(network, source, sink)) {
            val nextEdge = mutableMapOf<String, Int>()

            while (true) {
                val pushed = sendBlockingFlow(network, source, sink, Int.MAX_VALUE, nextEdge)
                if (pushed == 0) {
                    break
                }
                flow += pushed
            }
        }

        return flow
    }
  `,
} as const;

export const DINIC_MAX_FLOW_CODE_VARIANTS: CodeVariantMap = buildCodeVariants(
  DINIC_MAX_FLOW_CODE_SOURCES,
);
export const DINIC_MAX_FLOW_CODE = DINIC_MAX_FLOW_CODE_VARIANTS.typescript?.lines ?? [];
