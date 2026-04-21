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

const FIBONACCI_JS = buildStructuredCode(
  `
  /**
   * Computes the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  function fibonacciTab(n) {
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
  `,
  'javascript',
);

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

const FIBONACCI_GO = buildStructuredCode(
  `
  package dp

  /**
   * Computes the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  func FibonacciTab(n int) int {
      if n <= 1 {
          return n
      }

      //@step 2
      fib := make([]int, n + 1)
      fib[0] = 0
      fib[1] = 1

      for index := 2; index <= n; index += 1 {
          //@step 4
          previous := fib[index - 1]
          beforePrevious := fib[index - 2]

          //@step 5
          fib[index] = previous + beforePrevious
      }

      //@step 6
      return fib[n]
  }
  //#endregion fibonacci
  `,
  'go',
);

const FIBONACCI_RUST = buildStructuredCode(
  `
  /**
   * Computes the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  fn fibonacci_tab(n: usize) -> usize {
      if n <= 1 {
          return n;
      }

      //@step 2
      let mut fib = vec![0; n + 1];
      fib[0] = 0;
      fib[1] = 1;

      for index in 2..=n {
          //@step 4
          let previous = fib[index - 1];
          let before_previous = fib[index - 2];

          //@step 5
          fib[index] = previous + before_previous;
      }

      //@step 6
      fib[n]
  }
  //#endregion fibonacci
  `,
  'rust',
);

const FIBONACCI_SWIFT = buildStructuredCode(
  `
  /**
   * Computes the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  func fibonacciTab(_ n: Int) -> Int {
      if n <= 1 {
          return n
      }

      //@step 2
      var fib = Array(repeating: 0, count: n + 1)
      fib[0] = 0
      fib[1] = 1

      for index in 2...n {
          //@step 4
          let previous = fib[index - 1]
          let beforePrevious = fib[index - 2]

          //@step 5
          fib[index] = previous + beforePrevious
      }

      //@step 6
      return fib[n]
  }
  //#endregion fibonacci
  `,
  'swift',
);

const FIBONACCI_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Computes the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  function fibonacciTab(int $n): int
  {
      if ($n <= 1) {
          return $n;
      }

      //@step 2
      $fib = array_fill(0, $n + 1, 0);
      $fib[0] = 0;
      $fib[1] = 1;

      for ($index = 2; $index <= $n; $index += 1) {
          //@step 4
          $previous = $fib[$index - 1];
          $beforePrevious = $fib[$index - 2];

          //@step 5
          $fib[$index] = $previous + $beforePrevious;
      }

      //@step 6
      return $fib[$n];
  }
  //#endregion fibonacci
  `,
  'php',
);

const FIBONACCI_KOTLIN = buildStructuredCode(
  `
  /**
   * Computes the n-th Fibonacci number with bottom-up dynamic programming.
   * Input: non-negative index n.
   * Returns: fib[n].
   */
  //#region fibonacci function open
  fun fibonacciTab(n: Int): Int {
      if (n <= 1) {
          return n
      }

      //@step 2
      val fib = IntArray(n + 1)
      fib[0] = 0
      fib[1] = 1

      for (index in 2..n) {
          //@step 4
          val previous = fib[index - 1]
          val beforePrevious = fib[index - 2]

          //@step 5
          fib[index] = previous + beforePrevious
      }

      //@step 6
      return fib[n]
  }
  //#endregion fibonacci
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: FIBONACCI_JS.lines,
    regions: FIBONACCI_JS.regions,
    highlightMap: FIBONACCI_JS.highlightMap,
    source: FIBONACCI_JS.source,
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
  go: {
    language: 'go',
    lines: FIBONACCI_GO.lines,
    regions: FIBONACCI_GO.regions,
    highlightMap: FIBONACCI_GO.highlightMap,
    source: FIBONACCI_GO.source,
  },
  rust: {
    language: 'rust',
    lines: FIBONACCI_RUST.lines,
    regions: FIBONACCI_RUST.regions,
    highlightMap: FIBONACCI_RUST.highlightMap,
    source: FIBONACCI_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: FIBONACCI_SWIFT.lines,
    regions: FIBONACCI_SWIFT.regions,
    highlightMap: FIBONACCI_SWIFT.highlightMap,
    source: FIBONACCI_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: FIBONACCI_PHP.lines,
    regions: FIBONACCI_PHP.regions,
    highlightMap: FIBONACCI_PHP.highlightMap,
    source: FIBONACCI_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: FIBONACCI_KOTLIN.lines,
    regions: FIBONACCI_KOTLIN.regions,
    highlightMap: FIBONACCI_KOTLIN.highlightMap,
    source: FIBONACCI_KOTLIN.source,
  },
};
