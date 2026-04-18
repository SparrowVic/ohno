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

export const SOS_DP_CODE = SOS_TS.lines;
export const SOS_DP_CODE_REGIONS = SOS_TS.regions;
export const SOS_DP_CODE_HIGHLIGHT_MAP = SOS_TS.highlightMap;
export const SOS_DP_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: SOS_TS.lines, regions: SOS_TS.regions, highlightMap: SOS_TS.highlightMap, source: SOS_TS.source },
  python: { language: 'python', lines: SOS_PY.lines, regions: SOS_PY.regions, highlightMap: SOS_PY.highlightMap, source: SOS_PY.source },
  csharp: { language: 'csharp', lines: SOS_CS.lines, regions: SOS_CS.regions, highlightMap: SOS_CS.highlightMap, source: SOS_CS.source },
  java: { language: 'java', lines: SOS_JAVA.lines, regions: SOS_JAVA.regions, highlightMap: SOS_JAVA.highlightMap, source: SOS_JAVA.source },
  cpp: { language: 'cpp', lines: SOS_CPP.lines, regions: SOS_CPP.regions, highlightMap: SOS_CPP.highlightMap, source: SOS_CPP.source },
};
