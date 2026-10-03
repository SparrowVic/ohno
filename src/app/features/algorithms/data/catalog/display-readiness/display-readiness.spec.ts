import { describe, expect, it } from 'vitest';

import { getAlgorithmViewConfig } from '../../../algorithm-detail/algorithm-detail-config/algorithm-detail-config';
import { ALGORITHM_CATALOG } from '../catalog';
import { PENDING_DISPLAY_IDS, REBUILT_DISPLAY_VARIANTS, isDisplayReady } from './display-readiness';

describe('display-readiness', () => {
  it('marks an algorithm pending exactly when its default display is not rebuilt yet', () => {
    const mismatched = ALGORITHM_CATALOG.filter(
      (algorithm) => isDisplayReady(algorithm.id) !== REBUILT_DISPLAY_VARIANTS.has(getAlgorithmViewConfig(algorithm.id).defaultVariant),
    ).map((algorithm) => algorithm.id);
    expect(mismatched).toEqual([]);
  });

  it('lists only algorithms that exist in the catalog', () => {
    const known = new Set(ALGORITHM_CATALOG.map((algorithm) => algorithm.id));
    expect([...PENDING_DISPLAY_IDS].filter((id) => !known.has(id))).toEqual([]);
  });
});
