import { describe, expect, it } from 'vitest';

import type { CodeLine, CodeRegion, CodeVariantMap } from '../../models/detail';

type DataCodeModule = Record<string, unknown>;

const codeModules = import.meta.glob<DataCodeModule>('../*-code.ts', { eager: true });

describe('data code modules', () => {
  it('exports at least one numbered code snippet per module', () => {
    for (const moduleExports of Object.values(codeModules)) {
      const codeExports = Object.entries(moduleExports).filter(
        ([key, value]) => key.endsWith('_CODE') && Array.isArray(value),
      );

      expect(codeExports.length).toBeGreaterThan(0);

      for (const [, value] of codeExports) {
        const lines = value as readonly CodeLine[];

        expect(lines.length).toBeGreaterThan(0);
        expect(lines.map((line) => line.number)).toEqual(
          Array.from({ length: lines.length }, (_, index) => index + 1),
        );
        expect(lines.every((line) => line.tokens.length > 0)).toBe(true);
      }
    }
  });

  it('keeps variants, regions and highlight maps internally consistent when present', () => {
    for (const moduleExports of Object.values(codeModules)) {
      for (const [key, value] of Object.entries(moduleExports)) {
        if (key.endsWith('_CODE_VARIANTS') && value) {
          const variants = Object.values(value as CodeVariantMap).filter(Boolean);

          expect(variants.length).toBeGreaterThan(0);
          expect(
            variants.every(
              (variant) =>
                variant!.lines.length > 0 &&
                variant!.source &&
                variant!.source.length > 0,
            ),
          ).toBe(true);
        }

        if (key.endsWith('_CODE_REGIONS') && value) {
          const regions = value as readonly CodeRegion[];
          expect(regions.every((region) => region.startLine <= region.endLine)).toBe(true);
        }

        if (key.endsWith('_CODE_HIGHLIGHT_MAP') && value) {
          const highlightMap = Object.values(value as Record<number, number>);
          expect(highlightMap.every((lineNumber) => Number.isInteger(lineNumber) && lineNumber > 0)).toBe(true);
        }
      }
    }
  });
});
