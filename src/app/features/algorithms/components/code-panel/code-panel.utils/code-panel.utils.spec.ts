import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CodeLine, CodeVariantMap } from '../../../models/detail';
import {
  buildAvailableLanguageOptions,
  buildVariantIdentity,
  buildVariantMap,
  buildVariantSource,
  copyTextToClipboard,
  resolveActiveCodeLine,
  resolveActiveVariant,
} from './code-panel.utils';

const sampleLines: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'text', text: 'const answer = 42;' }] },
  { number: 2, tokens: [{ kind: 'text', text: 'return answer;' }] },
];

describe('code-panel.utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('buildVariantSource joins token text into source code', () => {
    expect(buildVariantSource(sampleLines)).toBe('const answer = 42;\nreturn answer;');
  });

  it('buildVariantMap returns the provided variants when they exist', () => {
    const inputVariants: CodeVariantMap = {
      python: {
        language: 'python',
        lines: sampleLines,
        regions: [],
        source: 'print(42)',
      },
    };

    const variants = buildVariantMap({
      inputVariants,
      fallbackLanguage: 'typescript',
      fallbackLines: sampleLines,
      fallbackRegions: [],
    });

    expect(variants.python?.source).toBe('print(42)');
    expect(resolveActiveVariant(variants, 'python').language).toBe('python');
  });

  it('buildVariantMap creates a fallback variant when the map is empty', () => {
    const variants = buildVariantMap({
      inputVariants: {},
      fallbackLanguage: 'typescript',
      fallbackLines: sampleLines,
      fallbackRegions: [
        { id: 'main', kind: 'function', startLine: 1, endLine: 2, collapsedByDefault: false },
      ],
    });

    expect(variants.typescript?.source).toContain('const answer = 42;');
    expect(buildAvailableLanguageOptions(variants)[0]).toMatchObject({
      id: 'typescript',
      label: 'TypeScript',
    });
  });

  it('buildAvailableLanguageOptions omits coming-soon duplicates for implemented languages', () => {
    const variants = buildVariantMap({
      inputVariants: {
        javascript: {
          language: 'javascript',
          lines: sampleLines,
          regions: [],
          source: 'function answer() { return 42; }',
        },
      },
      fallbackLanguage: 'typescript',
      fallbackLines: sampleLines,
      fallbackRegions: [],
    });

    const options = buildAvailableLanguageOptions(variants);
    const javascriptOptions = options.filter((option) => option.id === 'javascript');

    expect(javascriptOptions).toHaveLength(1);
    expect(javascriptOptions[0]).toMatchObject({
      id: 'javascript',
      language: 'javascript',
      label: 'JavaScript',
    });
  });

  it('buildVariantIdentity and resolveActiveCodeLine respect regions and highlight maps', () => {
    const variant = {
      language: 'typescript' as const,
      lines: sampleLines,
      regions: [
        {
          id: 'main',
          kind: 'function' as const,
          startLine: 1,
          endLine: 2,
          collapsedByDefault: true,
        },
      ],
      highlightMap: { 8: 2 },
    };

    expect(buildVariantIdentity(variant)).toContain('main:1:2:1');
    expect(resolveActiveCodeLine(8, variant)).toBe(2);
    expect(resolveActiveCodeLine(null, variant)).toBeNull();
  });

  it('resolveActiveCodeLine skips blank lines when a mapping lands on whitespace', () => {
    const variant = {
      language: 'typescript' as const,
      lines: [
        { number: 1, tokens: [{ kind: 'text', text: 'const start = true;' }] },
        { number: 2, tokens: [{ kind: 'text', text: '' }] },
        { number: 3, tokens: [{ kind: 'text', text: 'process(start);' }] },
      ],
      regions: [],
      highlightMap: { 5: 2 },
    };

    expect(resolveActiveCodeLine(5, variant)).toBe(3);
  });

  it('copyTextToClipboard uses the Clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.defaultView!.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    await copyTextToClipboard(document, 'copied');

    expect(writeText).toHaveBeenCalledWith('copied');
  });

  it('copyTextToClipboard falls back to execCommand when Clipboard API is missing', async () => {
    Object.defineProperty(document.defaultView!.navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', {
      value: execCommand,
      configurable: true,
    });

    await copyTextToClipboard(document, 'fallback');

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });
});
