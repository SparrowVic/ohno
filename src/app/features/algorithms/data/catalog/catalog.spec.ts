import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from './catalog';

describe('catalog', () => {
  it('keeps algorithm ids and names unique', () => {
    const ids = ALGORITHM_CATALOG.map((item) => item.id);
    const names = ALGORITHM_CATALOG.map((item) => item.name);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('covers the main feature categories with non-empty metadata', () => {
    const categories = new Set(ALGORITHM_CATALOG.map((item) => item.category));
    const implementedCategories = new Set(
      ALGORITHM_CATALOG.filter((item) => item.implemented).map((item) => item.category),
    );

    for (const category of ['sorting', 'graphs', 'dp', 'strings', 'geometry']) {
      expect(categories.has(category)).toBe(true);
      expect(implementedCategories.has(category)).toBe(true);
    }
    expect(
      ALGORITHM_CATALOG.every(
        (item) =>
          item.description.length > 0 &&
          item.tags.length > 0 &&
          item.complexity.timeAverage.length > 0 &&
          item.complexity.space.length > 0,
      ),
    ).toBe(true);
  });
});
