import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const AHO_CORASICK_TS = buildStructuredCode(`
  type TrieNode = {
    next: Map<string, number>;
    fail: number;
    output: string[];
  };

  //#region aho-corasick function open
  //@step 1
  function ahoCorasick(text: string, patterns: string[]): Array<{ pattern: string; start: number }> {
    const trie: TrieNode[] = [{ next: new Map(), fail: 0, output: [] }];

    for (const pattern of patterns) {
      //@step 2
      let state = 0;

      for (const char of pattern) {
        if (!trie[state]!.next.has(char)) {
          //@step 3
          trie[state]!.next.set(char, trie.length);
          trie.push({ next: new Map(), fail: 0, output: [] });
        }

        state = trie[state]!.next.get(char)!;
      }

      //@step 4
      trie[state]!.output.push(pattern);
    }

    const queue: number[] = [];
    for (const nextState of trie[0]!.next.values()) {
      //@step 5
      queue.push(nextState);
    }

    while (queue.length > 0) {
      const state = queue.shift()!;

      for (const [char, nextState] of trie[state]!.next) {
        let fail = trie[state]!.fail;

        while (fail > 0 && !trie[fail]!.next.has(char)) {
          fail = trie[fail]!.fail;
        }

        //@step 6
        trie[nextState]!.fail = trie[fail]!.next.get(char) ?? 0;
        trie[nextState]!.output.push(...trie[trie[nextState]!.fail]!.output);
        queue.push(nextState);
      }
    }

    const matches: Array<{ pattern: string; start: number }> = [];
    let state = 0;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index]!;

      //@step 8
      while (state > 0 && !trie[state]!.next.has(char)) {
        state = trie[state]!.fail;
      }

      //@step 7
      state = trie[state]!.next.get(char) ?? 0;

      if (trie[state]!.output.length > 0) {
        //@step 9
        for (const pattern of trie[state]!.output) {
          matches.push({ pattern, start: index - pattern.length + 1 });
        }
      }
    }

    //@step 10
    return matches;
  }
  //#endregion aho-corasick
`);

const AHO_CORASICK_PY = buildStructuredCode(
  `
  from collections import deque

  """
  Find every pattern occurrence in text with the Aho-Corasick automaton.
  """
  //#region aho-corasick function open
  //@step 1
  def aho_corasick(text: str, patterns: list[str]) -> list[tuple[str, int]]:
      trie = [{"next": {}, "fail": 0, "output": []}]

      for pattern in patterns:
          //@step 2
          state = 0

          for char in pattern:
              if char not in trie[state]["next"]:
                  //@step 3
                  trie[state]["next"][char] = len(trie)
                  trie.append({"next": {}, "fail": 0, "output": []})

              state = trie[state]["next"][char]

          //@step 4
          trie[state]["output"].append(pattern)

      queue = deque(trie[0]["next"].values())

      while queue:
          state = queue.popleft()

          for char, next_state in trie[state]["next"].items():
              fail = trie[state]["fail"]
              while fail > 0 and char not in trie[fail]["next"]:
                  fail = trie[fail]["fail"]

              //@step 6
              trie[next_state]["fail"] = trie[fail]["next"].get(char, 0)
              trie[next_state]["output"].extend(trie[trie[next_state]["fail"]]["output"])
              queue.append(next_state)

      matches: list[tuple[str, int]] = []
      state = 0

      for index, char in enumerate(text):
          //@step 8
          while state > 0 and char not in trie[state]["next"]:
              state = trie[state]["fail"]

          //@step 7
          state = trie[state]["next"].get(char, 0)

          if trie[state]["output"]:
              //@step 9
              for pattern in trie[state]["output"]:
                  matches.append((pattern, index - len(pattern) + 1))

      //@step 10
      return matches
  //#endregion aho-corasick
  `,
  'python',
);

export const AHO_CORASICK_CODE = AHO_CORASICK_TS.lines;
export const AHO_CORASICK_CODE_REGIONS = AHO_CORASICK_TS.regions;
export const AHO_CORASICK_CODE_HIGHLIGHT_MAP = AHO_CORASICK_TS.highlightMap;
export const AHO_CORASICK_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: AHO_CORASICK_TS.lines,
    regions: AHO_CORASICK_TS.regions,
    highlightMap: AHO_CORASICK_TS.highlightMap,
    source: AHO_CORASICK_TS.source,
  },
  python: {
    language: 'python',
    lines: AHO_CORASICK_PY.lines,
    regions: AHO_CORASICK_PY.regions,
    highlightMap: AHO_CORASICK_PY.highlightMap,
    source: AHO_CORASICK_PY.source,
  },
};
