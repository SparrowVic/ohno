import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const MCTS_TS = buildStructuredCode(`
  /**
   * Monte Carlo Tree Search — select → expand → simulate →
   * backpropagate. The UCB1 score balances exploitation (mean reward)
   * with exploration (visit-count penalty).
   */
  //#region mcts function open
  function mcts(root: Node, iterations: number, c: number): Node {
    //@step 1
    for (let i = 0; i < iterations; i++) {
      //@step 2
      const leaf = select(root, c);
      //@step 3
      const child = expand(leaf);
      //@step 4
      const reward = simulate(child);
      //@step 5
      backpropagate(child, reward);
    }
    //@step 6
    return bestChild(root);
  }
  //#endregion mcts
`);

export const MCTS_CODE = MCTS_TS.lines;
export const MCTS_CODE_REGIONS = MCTS_TS.regions;
export const MCTS_CODE_HIGHLIGHT_MAP = MCTS_TS.highlightMap;
export const MCTS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: MCTS_TS.lines,
    regions: MCTS_TS.regions,
    highlightMap: MCTS_TS.highlightMap,
    source: MCTS_TS.source,
  },
};
