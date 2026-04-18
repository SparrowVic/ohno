import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const FIBONACCI_TS = buildStructuredCode(`
  /**
   * Compute the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  function fibonacciTab(n: number): number {
    if (n <= 1) {
      return n;
    }

    //@step 2
    const fib = Array.from({ length: n + 1 }, () => 0);
    fib[0] = 0;
    fib[1] = 1;

    for (let index = 2; index <= n; index += 1) {
      //@step 4
      const previous = fib[index - 1];
      const beforePrevious = fib[index - 2];

      //@step 5
      fib[index] = previous + beforePrevious;
    }

    //@step 6
    return fib[n];
  }
  //#endregion fibonacci
`);

const FIBONACCI_PY = buildStructuredCode(
  `
  """
  Compute the n-th Fibonacci number with bottom-up dynamic programming.
  Input: non-negative index n.
  Returns: fib[n].
  """
  //#region fibonacci function open
  def fibonacci_tab(n: int) -> int:
      if n <= 1:
          return n

      //@step 2
      fib = [0] * (n + 1)
      fib[0] = 0
      fib[1] = 1

      for index in range(2, n + 1):
          //@step 4
          previous = fib[index - 1]
          before_previous = fib[index - 2]

          //@step 5
          fib[index] = previous + before_previous

      //@step 6
      return fib[n]
  //#endregion fibonacci
  `,
  'python',
);

const FIBONACCI_CS = buildStructuredCode(
  `
  /// <summary>
  /// Computes the n-th Fibonacci number with bottom-up dynamic programming.
  /// Input: non-negative index n.
  /// Returns: fib[n].
  /// </summary>
  //#region fibonacci function open
  public static int FibonacciTab(int n)
  {
      if (n <= 1)
      {
          return n;
      }

      //@step 2
      var fib = new int[n + 1];
      fib[0] = 0;
      fib[1] = 1;

      for (var index = 2; index <= n; index += 1)
      {
          //@step 4
          var previous = fib[index - 1];
          var beforePrevious = fib[index - 2];

          //@step 5
          fib[index] = previous + beforePrevious;
      }

      //@step 6
      return fib[n];
  }
  //#endregion fibonacci
  `,
  'csharp',
);

const FIBONACCI_JAVA = buildStructuredCode(
  `
  /**
   * Computes the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  public static int fibonacciTab(int n) {
      if (n <= 1) {
          return n;
      }

      //@step 2
      int[] fib = new int[n + 1];
      fib[0] = 0;
      fib[1] = 1;

      for (int index = 2; index <= n; index += 1) {
          //@step 4
          int previous = fib[index - 1];
          int beforePrevious = fib[index - 2];

          //@step 5
          fib[index] = previous + beforePrevious;
      }

      //@step 6
      return fib[n];
  }
  //#endregion fibonacci
  `,
  'java',
);

const FIBONACCI_CPP = buildStructuredCode(
  `
  #include <vector>

  /**
   * Computes the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  int fibonacciTab(int n) {
      if (n <= 1) {
          return n;
      }

      //@step 2
      std::vector<int> fib(n + 1, 0);
      fib[0] = 0;
      fib[1] = 1;

      for (int index = 2; index <= n; index += 1) {
          //@step 4
          int previous = fib[index - 1];
          int beforePrevious = fib[index - 2];

          //@step 5
          fib[index] = previous + beforePrevious;
      }

      //@step 6
      return fib[n];
  }
  //#endregion fibonacci
  `,
  'cpp',
);

export const FIBONACCI_DP_CODE = FIBONACCI_TS.lines;
export const FIBONACCI_DP_CODE_REGIONS = FIBONACCI_TS.regions;
export const FIBONACCI_DP_CODE_HIGHLIGHT_MAP = FIBONACCI_TS.highlightMap;
export const FIBONACCI_DP_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: FIBONACCI_TS.lines,
    regions: FIBONACCI_TS.regions,
    highlightMap: FIBONACCI_TS.highlightMap,
    source: FIBONACCI_TS.source,
  },
  python: {
    language: 'python',
    lines: FIBONACCI_PY.lines,
    regions: FIBONACCI_PY.regions,
    highlightMap: FIBONACCI_PY.highlightMap,
    source: FIBONACCI_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: FIBONACCI_CS.lines,
    regions: FIBONACCI_CS.regions,
    highlightMap: FIBONACCI_CS.highlightMap,
    source: FIBONACCI_CS.source,
  },
  java: {
    language: 'java',
    lines: FIBONACCI_JAVA.lines,
    regions: FIBONACCI_JAVA.regions,
    highlightMap: FIBONACCI_JAVA.highlightMap,
    source: FIBONACCI_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: FIBONACCI_CPP.lines,
    regions: FIBONACCI_CPP.regions,
    highlightMap: FIBONACCI_CPP.highlightMap,
    source: FIBONACCI_CPP.source,
  },
};
