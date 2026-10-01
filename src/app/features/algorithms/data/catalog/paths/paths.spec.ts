import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from '../catalog';
import { CATALOG_PATHS, pathForGroup } from './paths';

describe('CATALOG_PATHS', () => {
  const ids = new Set(ALGORITHM_CATALOG.map((item) => item.id));

  it('has one path per bank plus the overview', () => {
    expect(CATALOG_PATHS.map((path) => path.groupId)).toEqual([
      'overview', 'sorting', 'searching', 'trees', 'graphs', 'dp', 'strings', 'geometry', 'misc',
    ]);
  });

  it('only references existing algorithms, three or four per path, without repeats', () => {
    for (const path of CATALOG_PATHS) {
      expect(path.steps.length).toBeGreaterThanOrEqual(3);
      expect(path.steps.length).toBeLessThanOrEqual(4);
      expect(new Set(path.steps).size).toBe(path.steps.length);
      for (const id of path.steps) expect(ids.has(id), `${path.groupId}: ${id}`).toBe(true);
    }
  });

  it('falls back to the overview path for an unknown group', () => {
    expect(pathForGroup('quantum').groupId).toBe('overview');
  });
});
