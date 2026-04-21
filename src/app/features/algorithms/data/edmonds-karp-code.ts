import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const EDMONDS_KARP_CODE_SOURCES = {
  typescript: `
    function edmondsKarp(network: ResidualNetwork, source: string, sink: string): number {
      //@step 2
      let flow = 0;

      while (true) {
        //@step 3
        //@step 4
        //@step 5
        const parent = bfsResidual(network, source, sink);
        if (!parent.has(sink)) {
          break;
        }

        //@step 7
        const bottleneck = pathBottleneck(network, parent, source, sink);
        //@step 8
        augmentPath(network, parent, source, sink, bottleneck);
        flow += bottleneck;
      }

      //@step 9
      return flow;
    }
  `,
  javascript: `
    function edmondsKarp(network, source, sink) {
      let flow = 0;

      while (true) {
        const parent = bfsResidual(network, source, sink);
        if (!parent.has(sink)) {
          break;
        }

        const bottleneck = pathBottleneck(network, parent, source, sink);
        augmentPath(network, parent, source, sink, bottleneck);
        flow += bottleneck;
      }

      return flow;
    }
  `,
  python: `
    def edmonds_karp(network: ResidualNetwork, source: str, sink: str) -> int:
        flow = 0

        while True:
            parent = bfs_residual(network, source, sink)
            if sink not in parent:
                break

            bottleneck = path_bottleneck(network, parent, source, sink)
            augment_path(network, parent, source, sink, bottleneck)
            flow += bottleneck

        return flow
  `,
  csharp: `
    public static int EdmondsKarp(ResidualNetwork network, string source, string sink)
    {
        var flow = 0;

        while (true)
        {
            var parent = BfsResidual(network, source, sink);
            if (!parent.ContainsKey(sink))
            {
                break;
            }

            var bottleneck = PathBottleneck(network, parent, source, sink);
            AugmentPath(network, parent, source, sink, bottleneck);
            flow += bottleneck;
        }

        return flow;
    }
  `,
  java: `
    public static int edmondsKarp(ResidualNetwork network, String source, String sink) {
        int flow = 0;

        while (true) {
            var parent = bfsResidual(network, source, sink);
            if (!parent.containsKey(sink)) {
                break;
            }

            int bottleneck = pathBottleneck(network, parent, source, sink);
            augmentPath(network, parent, source, sink, bottleneck);
            flow += bottleneck;
        }

        return flow;
    }
  `,
  cpp: `
    int edmondsKarp(ResidualNetwork& network, const std::string& source, const std::string& sink) {
        int flow = 0;

        while (true) {
            auto parent = bfsResidual(network, source, sink);
            if (!parent.contains(sink)) {
                break;
            }

            int bottleneck = pathBottleneck(network, parent, source, sink);
            augmentPath(network, parent, source, sink, bottleneck);
            flow += bottleneck;
        }

        return flow;
    }
  `,
  go: `
    package graphs

    func EdmondsKarp(network *ResidualNetwork, source string, sink string) int {
        flow := 0

        for {
            parent := bfsResidual(network, source, sink)
            if _, ok := parent[sink]; !ok {
                break
            }

            bottleneck := pathBottleneck(network, parent, source, sink)
            augmentPath(network, parent, source, sink, bottleneck)
            flow += bottleneck
        }

        return flow
    }
  `,
  rust: `
    fn edmonds_karp(network: &mut ResidualNetwork, source: &str, sink: &str) -> i32 {
        let mut flow = 0;

        loop {
            let parent = bfs_residual(network, source, sink);
            if !parent.contains_key(sink) {
                break;
            }

            let bottleneck = path_bottleneck(network, &parent, source, sink);
            augment_path(network, &parent, source, sink, bottleneck);
            flow += bottleneck;
        }

        flow
    }
  `,
  swift: `
    func edmondsKarp(network: inout ResidualNetwork, source: String, sink: String) -> Int {
        var flow = 0

        while true {
            let parent = bfsResidual(network: network, source: source, sink: sink)
            if parent[sink] == nil {
                break
            }

            let bottleneck = pathBottleneck(network: network, parent: parent, source: source, sink: sink)
            augmentPath(network: &network, parent: parent, source: source, sink: sink, bottleneck: bottleneck)
            flow += bottleneck
        }

        return flow
    }
  `,
  php: `
    <?php

    function edmondsKarp(ResidualNetwork $network, string $source, string $sink): int
    {
        $flow = 0;

        while (true) {
            $parent = bfsResidual($network, $source, $sink);
            if (!array_key_exists($sink, $parent)) {
                break;
            }

            $bottleneck = pathBottleneck($network, $parent, $source, $sink);
            augmentPath($network, $parent, $source, $sink, $bottleneck);
            $flow += $bottleneck;
        }

        return $flow;
    }
  `,
  kotlin: `
    fun edmondsKarp(network: ResidualNetwork, source: String, sink: String): Int {
        var flow = 0

        while (true) {
            val parent = bfsResidual(network, source, sink)
            if (sink !in parent) {
                break
            }

            val bottleneck = pathBottleneck(network, parent, source, sink)
            augmentPath(network, parent, source, sink, bottleneck)
            flow += bottleneck
        }

        return flow
    }
  `,
} as const;

export const EDMONDS_KARP_CODE_VARIANTS: CodeVariantMap =
  buildCodeVariants(EDMONDS_KARP_CODE_SOURCES);
export const EDMONDS_KARP_CODE = EDMONDS_KARP_CODE_VARIANTS.typescript?.lines ?? [];
