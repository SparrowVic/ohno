import { describe, expect, it } from 'vitest';

import { buildStructuredCode, makeTextCodeLines } from './code-line-builder';

describe('code-line-builder', () => {
  it('makeTextCodeLines numbers lines sequentially', () => {
    expect(makeTextCodeLines(['alpha', 'beta'])).toEqual([
      { number: 1, tokens: [{ kind: 'text', text: 'alpha' }] },
      { number: 2, tokens: [{ kind: 'text', text: 'beta' }] },
    ]);
  });

  it('buildStructuredCode extracts regions and step mappings', () => {
    const structured = buildStructuredCode(`
      //#region main function collapsed
      function demo() {
        //@step 7
        return 42;
      }
      //#endregion main
    `);

    expect(structured.source).toBe('function demo() {\n  return 42;\n}');
    expect(structured.highlightMap).toEqual({ 7: 2 });
    expect(structured.regions).toEqual([
      {
        id: 'main',
        kind: 'function',
        startLine: 1,
        endLine: 3,
        collapsedByDefault: true,
      },
    ]);
  });

  it('throws on mismatched and unclosed regions', () => {
    expect(() =>
      buildStructuredCode(`
        //#region main function collapsed
        const x = 1;
        //#endregion other
      `),
    ).toThrow(/Mismatched/);

    expect(() =>
      buildStructuredCode(`
        //#region pending block collapsed
        const x = 1;
      `),
    ).toThrow(/Unclosed code regions/);
  });
});
