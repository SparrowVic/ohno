import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SOS_TS = buildStructuredCode(`
  /**
   * Compute Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  function sosDp(base: number[], bits: number): number[] {
    //@step 2
    const dp = [...base];

    for (let bit = 0; bit < bits; bit += 1) {
      for (let mask = 0; mask < (1 << bits); mask += 1) {
        if ((mask & (1 << bit)) !== 0) {
          //@step 5
          dp[mask] += dp[mask ^ (1 << bit)];
        } else {
          //@step 6
          dp[mask] = dp[mask];
        }
      }
    }

    function traceContributors(mask: number, bit: number): void {
      if (bit < 0) {
        return;
      }

      //@step 7
      traceContributors(mask, bit - 1);
      if ((mask & (1 << bit)) !== 0) {
        traceContributors(mask ^ (1 << bit), bit - 1);
      }
    }

    traceContributors((1 << bits) - 1, bits - 1);

    //@step 8
    return dp;
  }
  //#endregion sos
`);

const SOS_PY = buildStructuredCode(
  `
  """
  Compute Sum Over Subsets DP for a base array indexed by bitmasks.
  Input: base values for every bitmask and number of bits.
  Returns: subset sums for each mask.
  """
  //#region sos function open
  def sos_dp(base: list[int], bits: int) -> list[int]:
      //@step 2
      dp = list(base)

      for bit in range(bits):
          for mask in range(1 << bits):
              if (mask & (1 << bit)) != 0:
                  //@step 5
                  dp[mask] += dp[mask ^ (1 << bit)]
              else:
                  //@step 6
                  dp[mask] = dp[mask]

      def trace_contributors(mask: int, bit: int) -> None:
          if bit < 0:
              return

          //@step 7
          trace_contributors(mask, bit - 1)
          if (mask & (1 << bit)) != 0:
              trace_contributors(mask ^ (1 << bit), bit - 1)

      trace_contributors((1 << bits) - 1, bits - 1)

      //@step 8
      return dp
  //#endregion sos
  `,
  'python',
);

const SOS_CS = buildStructuredCode(
  `
  /// <summary>
  /// Computes Sum Over Subsets DP for a base array indexed by bitmasks.
  /// Input: base values for every bitmask and number of bits.
  /// Returns: subset sums for each mask.
  /// </summary>
  //#region sos function open
  public static int[] SosDp(int[] baseValues, int bits)
  {
      //@step 2
      var dp = (int[])baseValues.Clone();

      for (var bit = 0; bit < bits; bit += 1)
      {
          for (var mask = 0; mask < (1 << bits); mask += 1)
          {
              if ((mask & (1 << bit)) != 0)
              {
                  //@step 5
                  dp[mask] += dp[mask ^ (1 << bit)];
              }
              else
              {
                  //@step 6
                  dp[mask] = dp[mask];
              }
          }
      }

      void TraceContributors(int mask, int bit)
      {
          if (bit < 0)
          {
              return;
          }

          //@step 7
          TraceContributors(mask, bit - 1);
          if ((mask & (1 << bit)) != 0)
          {
              TraceContributors(mask ^ (1 << bit), bit - 1);
          }
      }

      TraceContributors((1 << bits) - 1, bits - 1);

      //@step 8
      return dp;
  }
  //#endregion sos
  `,
  'csharp',
);

const SOS_JAVA = buildStructuredCode(
  `
  /**
   * Computes Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  public static int[] sosDp(int[] baseValues, int bits) {
      //@step 2
      int[] dp = baseValues.clone();

      for (int bit = 0; bit < bits; bit += 1) {
          for (int mask = 0; mask < (1 << bits); mask += 1) {
              if ((mask & (1 << bit)) != 0) {
                  //@step 5
                  dp[mask] += dp[mask ^ (1 << bit)];
              } else {
                  //@step 6
                  dp[mask] = dp[mask];
              }
          }
      }

      traceContributors((1 << bits) - 1, bits - 1);

      //@step 8
      return dp;
  }
  //#endregion sos

  //#region trace helper collapsed
  private static void traceContributors(int mask, int bit) {
      if (bit < 0) {
          return;
      }

      //@step 7
      traceContributors(mask, bit - 1);
      if ((mask & (1 << bit)) != 0) {
          traceContributors(mask ^ (1 << bit), bit - 1);
      }
  }
  //#endregion trace
  `,
  'java',
);

const SOS_CPP = buildStructuredCode(
  `
  #include <vector>

  /**
   * Computes Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  std::vector<int> sosDp(const std::vector<int>& baseValues, int bits) {
      //@step 2
      std::vector<int> dp = baseValues;

      for (int bit = 0; bit < bits; bit += 1) {
          for (int mask = 0; mask < (1 << bits); mask += 1) {
              if ((mask & (1 << bit)) != 0) {
                  //@step 5
                  dp[mask] += dp[mask ^ (1 << bit)];
              } else {
                  //@step 6
                  dp[mask] = dp[mask];
              }
          }
      }

      traceContributors((1 << bits) - 1, bits - 1);

      //@step 8
      return dp;
  }
  //#endregion sos

  //#region trace helper collapsed
  void traceContributors(int mask, int bit) {
      if (bit < 0) {
          return;
      }

      //@step 7
      traceContributors(mask, bit - 1);
      if ((mask & (1 << bit)) != 0) {
          traceContributors(mask ^ (1 << bit), bit - 1);
      }
  }
  //#endregion trace
  `,
  'cpp',
);

const SOS_JS = buildStructuredCode(
  `
  /**
   * Compute Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  function sosDp(base, bits) {
      //@step 2
      const dp = [...base];

      for (let bit = 0; bit < bits; bit += 1) {
          for (let mask = 0; mask < (1 << bits); mask += 1) {
              if ((mask & (1 << bit)) !== 0) {
                  //@step 5
                  dp[mask] += dp[mask ^ (1 << bit)];
              } else {
                  //@step 6
                  dp[mask] = dp[mask];
              }
          }
      }

      function traceContributors(mask, bit) {
          if (bit < 0) {
              return;
          }

          //@step 7
          traceContributors(mask, bit - 1);
          if ((mask & (1 << bit)) !== 0) {
              traceContributors(mask ^ (1 << bit), bit - 1);
          }
      }

      traceContributors((1 << bits) - 1, bits - 1);

      //@step 8
      return dp;
  }
  //#endregion sos
  `,
  'javascript',
);

const SOS_GO = buildStructuredCode(
  `
  package dp

  /**
   * Computes Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  func SosDp(baseValues []int, bits int) []int {
      //@step 2
      dp := append([]int(nil), baseValues...)

      for bit := 0; bit < bits; bit += 1 {
          for mask := 0; mask < (1 << bits); mask += 1 {
              if (mask & (1 << bit)) != 0 {
                  //@step 5
                  dp[mask] += dp[mask ^ (1 << bit)]
              } else {
                  //@step 6
                  dp[mask] = dp[mask]
              }
          }
      }

      var traceContributors func(int, int)
      traceContributors = func(mask int, bit int) {
          if bit < 0 {
              return
          }

          //@step 7
          traceContributors(mask, bit - 1)
          if (mask & (1 << bit)) != 0 {
              traceContributors(mask ^ (1 << bit), bit - 1)
          }
      }

      traceContributors((1 << bits) - 1, bits - 1)

      //@step 8
      return dp
  }
  //#endregion sos
  `,
  'go',
);

const SOS_RUST = buildStructuredCode(
  `
  /**
   * Computes Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  fn sos_dp(base_values: &[i32], bits: usize) -> Vec<i32> {
      //@step 2
      let mut dp = base_values.to_vec();

      for bit in 0..bits {
          for mask in 0..(1usize << bits) {
              if (mask & (1usize << bit)) != 0 {
                  //@step 5
                  dp[mask] += dp[mask ^ (1usize << bit)];
              } else {
                  //@step 6
                  dp[mask] = dp[mask];
              }
          }
      }

      trace_contributors((1usize << bits) - 1, bits as isize - 1);

      //@step 8
      dp
  }
  //#endregion sos

  //#region trace helper collapsed
  fn trace_contributors(mask: usize, bit: isize) {
      if bit < 0 {
          return;
      }

      //@step 7
      trace_contributors(mask, bit - 1);
      if (mask & (1usize << bit)) != 0 {
          trace_contributors(mask ^ (1usize << bit), bit - 1);
      }
  }
  //#endregion trace
  `,
  'rust',
);

const SOS_SWIFT = buildStructuredCode(
  `
  /**
   * Computes Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  func sosDp(_ baseValues: [Int], bits: Int) -> [Int] {
      //@step 2
      var dp = baseValues

      for bit in 0..<bits {
          for mask in 0..<(1 << bits) {
              if (mask & (1 << bit)) != 0 {
                  //@step 5
                  dp[mask] += dp[mask ^ (1 << bit)]
              } else {
                  //@step 6
                  dp[mask] = dp[mask]
              }
          }
      }

      func traceContributors(_ mask: Int, _ bit: Int) {
          if bit < 0 {
              return
          }

          //@step 7
          traceContributors(mask, bit - 1)
          if (mask & (1 << bit)) != 0 {
              traceContributors(mask ^ (1 << bit), bit - 1)
          }
      }

      traceContributors((1 << bits) - 1, bits - 1)

      //@step 8
      return dp
  }
  //#endregion sos
  `,
  'swift',
);

const SOS_PHP = buildStructuredCode(
  `
  /**
   * Computes Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  function sosDp(array $baseValues, int $bits): array
  {
      //@step 2
      $dp = $baseValues;

      for ($bit = 0; $bit < $bits; $bit += 1) {
          for ($mask = 0; $mask < (1 << $bits); $mask += 1) {
              if (($mask & (1 << $bit)) !== 0) {
                  //@step 5
                  $dp[$mask] += $dp[$mask ^ (1 << $bit)];
              } else {
                  //@step 6
                  $dp[$mask] = $dp[$mask];
              }
          }
      }

      $traceContributors = null;
      $traceContributors = function (int $mask, int $bit) use (&$traceContributors): void {
          if ($bit < 0) {
              return;
          }

          //@step 7
          $traceContributors($mask, $bit - 1);
          if (($mask & (1 << $bit)) !== 0) {
              $traceContributors($mask ^ (1 << $bit), $bit - 1);
          }
      };

      $traceContributors((1 << $bits) - 1, $bits - 1);

      //@step 8
      return $dp;
  }
  //#endregion sos
  `,
  'php',
);

const SOS_KOTLIN = buildStructuredCode(
  `
  /**
   * Computes Sum Over Subsets DP for a base array indexed by bitmasks.
   * Input: base values for every bitmask and number of bits.
   * Returns: subset sums for each mask.
   */
  //#region sos function open
  fun sosDp(baseValues: IntArray, bits: Int): IntArray {
      //@step 2
      val dp = baseValues.clone()

      for (bit in 0 until bits) {
          for (mask in 0 until (1 shl bits)) {
              if ((mask and (1 shl bit)) != 0) {
                  //@step 5
                  dp[mask] += dp[mask xor (1 shl bit)]
              } else {
                  //@step 6
                  dp[mask] = dp[mask]
              }
          }
      }

      fun traceContributors(mask: Int, bit: Int) {
          if (bit < 0) {
              return
          }

          //@step 7
          traceContributors(mask, bit - 1)
          if ((mask and (1 shl bit)) != 0) {
              traceContributors(mask xor (1 shl bit), bit - 1)
          }
      }

      traceContributors((1 shl bits) - 1, bits - 1)

      //@step 8
      return dp
  }
  //#endregion sos
  `,
  'kotlin',
);

export const SOS_DP_CODE = SOS_TS.lines;
export const SOS_DP_CODE_REGIONS = SOS_TS.regions;
export const SOS_DP_CODE_HIGHLIGHT_MAP = SOS_TS.highlightMap;
export const SOS_DP_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SOS_TS.lines,
    regions: SOS_TS.regions,
    highlightMap: SOS_TS.highlightMap,
    source: SOS_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: SOS_JS.lines,
    regions: SOS_JS.regions,
    highlightMap: SOS_JS.highlightMap,
    source: SOS_JS.source,
  },
  python: {
    language: 'python',
    lines: SOS_PY.lines,
    regions: SOS_PY.regions,
    highlightMap: SOS_PY.highlightMap,
    source: SOS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: SOS_CS.lines,
    regions: SOS_CS.regions,
    highlightMap: SOS_CS.highlightMap,
    source: SOS_CS.source,
  },
  java: {
    language: 'java',
    lines: SOS_JAVA.lines,
    regions: SOS_JAVA.regions,
    highlightMap: SOS_JAVA.highlightMap,
    source: SOS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: SOS_CPP.lines,
    regions: SOS_CPP.regions,
    highlightMap: SOS_CPP.highlightMap,
    source: SOS_CPP.source,
  },
  go: {
    language: 'go',
    lines: SOS_GO.lines,
    regions: SOS_GO.regions,
    highlightMap: SOS_GO.highlightMap,
    source: SOS_GO.source,
  },
  rust: {
    language: 'rust',
    lines: SOS_RUST.lines,
    regions: SOS_RUST.regions,
    highlightMap: SOS_RUST.highlightMap,
    source: SOS_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: SOS_SWIFT.lines,
    regions: SOS_SWIFT.regions,
    highlightMap: SOS_SWIFT.highlightMap,
    source: SOS_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: SOS_PHP.lines,
    regions: SOS_PHP.regions,
    highlightMap: SOS_PHP.highlightMap,
    source: SOS_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: SOS_KOTLIN.lines,
    regions: SOS_KOTLIN.regions,
    highlightMap: SOS_KOTLIN.highlightMap,
    source: SOS_KOTLIN.source,
  },
};
