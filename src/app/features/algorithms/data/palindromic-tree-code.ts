import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const PALINDROMIC_TREE_TS = buildStructuredCode(`
  type Node = {
    length: number;
    link: number;
    next: Map<string, number>;
  };

  //#region palindromic-tree function open
  //@step 1
  function buildEertree(text: string): Node[] {
    const nodes: Node[] = [
      { length: -1, link: 0, next: new Map() },
      { length: 0, link: 0, next: new Map() },
    ];

    let last = 1;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index]!;
      let current = last;

      //@step 2
      while (
        index - 1 - nodes[current]!.length < 0 ||
        text[index - 1 - nodes[current]!.length] !== char
      ) {
        current = nodes[current]!.link;
      }

      if (nodes[current]!.next.has(char)) {
        //@step 3
        last = nodes[current]!.next.get(char)!;
        continue;
      }

      //@step 4
      const nodeId = nodes.length;
      nodes[current]!.next.set(char, nodeId);
      nodes.push({ length: nodes[current]!.length + 2, link: 1, next: new Map() });

      if (nodes[nodeId]!.length > 1) {
        let suffix = nodes[current]!.link;
        while (
          index - 1 - nodes[suffix]!.length < 0 ||
          text[index - 1 - nodes[suffix]!.length] !== char
        ) {
          suffix = nodes[suffix]!.link;
        }
        nodes[nodeId]!.link = nodes[suffix]!.next.get(char) ?? 1;
      }

      last = nodeId;
    }

    //@step 5
    return nodes;
  }
  //#endregion palindromic-tree
`);

const PALINDROMIC_TREE_PY = buildStructuredCode(
  `
  """
  Build an Eertree (palindromic tree) online.
  """
  //#region palindromic-tree function open
  //@step 1
  def build_eertree(text: str) -> list[dict]:
      nodes = [
          {"length": -1, "link": 0, "next": {}},
          {"length": 0, "link": 0, "next": {}},
      ]
      last = 1

      for index, char in enumerate(text):
          current = last

          //@step 2
          while (
              index - 1 - nodes[current]["length"] < 0 or
              text[index - 1 - nodes[current]["length"]] != char
          ):
              current = nodes[current]["link"]

          if char in nodes[current]["next"]:
              //@step 3
              last = nodes[current]["next"][char]
              continue

          //@step 4
          node_id = len(nodes)
          nodes[current]["next"][char] = node_id
          nodes.append({"length": nodes[current]["length"] + 2, "link": 1, "next": {}})

          if nodes[node_id]["length"] > 1:
              suffix = nodes[current]["link"]
              while (
                  index - 1 - nodes[suffix]["length"] < 0 or
                  text[index - 1 - nodes[suffix]["length"]] != char
              ):
                  suffix = nodes[suffix]["link"]
              nodes[node_id]["link"] = nodes[suffix]["next"].get(char, 1)

          last = node_id

      //@step 5
      return nodes
  //#endregion palindromic-tree
  `,
  'python',
);

export const PALINDROMIC_TREE_CODE = PALINDROMIC_TREE_TS.lines;
export const PALINDROMIC_TREE_CODE_REGIONS = PALINDROMIC_TREE_TS.regions;
export const PALINDROMIC_TREE_CODE_HIGHLIGHT_MAP = PALINDROMIC_TREE_TS.highlightMap;
export const PALINDROMIC_TREE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: PALINDROMIC_TREE_TS.lines,
    regions: PALINDROMIC_TREE_TS.regions,
    highlightMap: PALINDROMIC_TREE_TS.highlightMap,
    source: PALINDROMIC_TREE_TS.source,
  },
  python: {
    language: 'python',
    lines: PALINDROMIC_TREE_PY.lines,
    regions: PALINDROMIC_TREE_PY.regions,
    highlightMap: PALINDROMIC_TREE_PY.highlightMap,
    source: PALINDROMIC_TREE_PY.source,
  },
};
