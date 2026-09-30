import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from './catalog';

const load = (lang: string) =>
  JSON.parse(readFileSync(resolve(process.cwd(), `public/i18n/${lang}.json`), 'utf8')) as {
    features: { algorithms: { catalog: { modules: Record<string, { description: string }> } } };
  };

describe('module descriptions', () => {
  for (const lang of ['pl', 'en']) {
    it(`${lang}.json has a description for every catalog module`, () => {
      const modules = load(lang).features.algorithms.catalog.modules;
      for (const item of ALGORITHM_CATALOG) {
        expect(modules[item.id]?.description, item.id).toBeTruthy();
        expect(modules[item.id].description.length, item.id).toBeLessThanOrEqual(84);
      }
    });
  }
});
