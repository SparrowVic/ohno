import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const HUNGARIAN_ALGORITHM_CODE_SOURCES = {
  typescript: `
    function hungarian(cost: number[][]): number[] {
      //@step 2
      //@step 4
      //@step 5
      const reduced = subtractRowAndColumnMinima(cost);

      while (true) {
        //@step 6
        const matching = maximumZeroMatching(reduced);
        if (matching.length === reduced.length) {
          //@step 10
          return matching;
        }

        //@step 7
        const cover = minimumZeroCover(reduced, matching);
        //@step 8
        const smallest = minimumUncoveredValue(reduced, cover);
        //@step 9
        adjustUncoveredEntries(reduced, cover, smallest);
      }
    }
  `,
  javascript: `
    function hungarian(cost) {
      const reduced = subtractRowAndColumnMinima(cost);

      while (true) {
        const matching = maximumZeroMatching(reduced);
        if (matching.length === reduced.length) {
          return matching;
        }

        const cover = minimumZeroCover(reduced, matching);
        const smallest = minimumUncoveredValue(reduced, cover);
        adjustUncoveredEntries(reduced, cover, smallest);
      }
    }
  `,
  python: `
    def hungarian(cost: list[list[float]]) -> list[int]:
        reduced = subtract_row_and_column_minima(cost)

        while True:
            matching = maximum_zero_matching(reduced)
            if len(matching) == len(reduced):
                return matching

            cover = minimum_zero_cover(reduced, matching)
            smallest = minimum_uncovered_value(reduced, cover)
            adjust_uncovered_entries(reduced, cover, smallest)
  `,
  csharp: `
    public static List<int> Hungarian(double[][] cost)
    {
        var reduced = SubtractRowAndColumnMinima(cost);

        while (true)
        {
            var matching = MaximumZeroMatching(reduced);
            if (matching.Count == reduced.Length)
            {
                return matching;
            }

            var cover = MinimumZeroCover(reduced, matching);
            var smallest = MinimumUncoveredValue(reduced, cover);
            AdjustUncoveredEntries(reduced, cover, smallest);
        }
    }
  `,
  java: `
    public static List<Integer> hungarian(double[][] cost) {
        var reduced = subtractRowAndColumnMinima(cost);

        while (true) {
            var matching = maximumZeroMatching(reduced);
            if (matching.size() == reduced.length) {
                return matching;
            }

            var cover = minimumZeroCover(reduced, matching);
            double smallest = minimumUncoveredValue(reduced, cover);
            adjustUncoveredEntries(reduced, cover, smallest);
        }
    }
  `,
  cpp: `
    std::vector<int> hungarian(std::vector<std::vector<double>> cost) {
        auto reduced = subtractRowAndColumnMinima(cost);

        while (true) {
            auto matching = maximumZeroMatching(reduced);
            if (matching.size() == reduced.size()) {
                return matching;
            }

            auto cover = minimumZeroCover(reduced, matching);
            double smallest = minimumUncoveredValue(reduced, cover);
            adjustUncoveredEntries(reduced, cover, smallest);
        }
    }
  `,
  go: `
    package graphs

    func Hungarian(cost [][]float64) []int {
        reduced := subtractRowAndColumnMinima(cost)

        for {
            matching := maximumZeroMatching(reduced)
            if len(matching) == len(reduced) {
                return matching
            }

            cover := minimumZeroCover(reduced, matching)
            smallest := minimumUncoveredValue(reduced, cover)
            adjustUncoveredEntries(reduced, cover, smallest)
        }
    }
  `,
  rust: `
    fn hungarian(cost: Vec<Vec<f64>>) -> Vec<usize> {
        let mut reduced = subtract_row_and_column_minima(cost);

        loop {
            let matching = maximum_zero_matching(&reduced);
            if matching.len() == reduced.len() {
                return matching;
            }

            let cover = minimum_zero_cover(&reduced, &matching);
            let smallest = minimum_uncovered_value(&reduced, &cover);
            adjust_uncovered_entries(&mut reduced, &cover, smallest);
        }
    }
  `,
  swift: `
    func hungarian(cost: [[Double]]) -> [Int] {
        var reduced = subtractRowAndColumnMinima(cost: cost)

        while true {
            let matching = maximumZeroMatching(cost: reduced)
            if matching.count == reduced.count {
                return matching
            }

            let cover = minimumZeroCover(cost: reduced, matching: matching)
            let smallest = minimumUncoveredValue(cost: reduced, cover: cover)
            adjustUncoveredEntries(cost: &reduced, cover: cover, smallest: smallest)
        }
    }
  `,
  php: `
    <?php

    function hungarian(array $cost): array
    {
        $reduced = subtractRowAndColumnMinima($cost);

        while (true) {
            $matching = maximumZeroMatching($reduced);
            if (count($matching) === count($reduced)) {
                return $matching;
            }

            $cover = minimumZeroCover($reduced, $matching);
            $smallest = minimumUncoveredValue($reduced, $cover);
            adjustUncoveredEntries($reduced, $cover, $smallest);
        }
    }
  `,
  kotlin: `
    fun hungarian(cost: List<List<Double>>): List<Int> {
        val reduced = subtractRowAndColumnMinima(cost).toMutableList()

        while (true) {
            val matching = maximumZeroMatching(reduced)
            if (matching.size == reduced.size) {
                return matching
            }

            val cover = minimumZeroCover(reduced, matching)
            val smallest = minimumUncoveredValue(reduced, cover)
            adjustUncoveredEntries(reduced, cover, smallest)
        }
    }
  `,
} as const;

export const HUNGARIAN_ALGORITHM_CODE_VARIANTS: CodeVariantMap = buildCodeVariants(
  HUNGARIAN_ALGORITHM_CODE_SOURCES,
);
export const HUNGARIAN_ALGORITHM_CODE = HUNGARIAN_ALGORITHM_CODE_VARIANTS.typescript?.lines ?? [];
