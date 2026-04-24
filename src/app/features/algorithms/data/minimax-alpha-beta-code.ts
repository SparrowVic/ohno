import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const MINIMAX_TS = buildStructuredCode(`
  /**
   * Minimax with α/β pruning. MAX maximises the leaf reward, MIN
   * minimises it; once α ≥ β we can skip the remaining siblings.
   */
  //#region minimax function open
  function minimax(node: Node, depth: number, alpha: number, beta: number, isMax: boolean): number {
    //@step 1
    if (depth === 0 || isLeaf(node)) return value(node);

    //@step 2
    if (isMax) {
      let best = -Infinity;
      //@step 3
      for (const child of node.children) {
        //@step 4
        const v = minimax(child, depth - 1, alpha, beta, false);
        best = Math.max(best, v);
        alpha = Math.max(alpha, best);
        //@step 5
        if (alpha >= beta) break; // β-cut
      }
      return best;
    } else {
      let best = Infinity;
      //@step 6
      for (const child of node.children) {
        //@step 7
        const v = minimax(child, depth - 1, alpha, beta, true);
        best = Math.min(best, v);
        beta = Math.min(beta, best);
        //@step 8
        if (alpha >= beta) break; // α-cut
      }
      return best;
    }
  }
  //#endregion minimax
`);

export const MINIMAX_ALPHA_BETA_CODE = MINIMAX_TS.lines;
export const MINIMAX_ALPHA_BETA_CODE_REGIONS = MINIMAX_TS.regions;
export const MINIMAX_ALPHA_BETA_CODE_HIGHLIGHT_MAP = MINIMAX_TS.highlightMap;
export const MINIMAX_ALPHA_BETA_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: MINIMAX_TS.lines,
    regions: MINIMAX_TS.regions,
    highlightMap: MINIMAX_TS.highlightMap,
    source: MINIMAX_TS.source,
  },
};
