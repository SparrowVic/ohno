import {
  CodeLanguage,
  CodeLine,
  CodeRegion,
  CodeVariant,
  CodeVariantMap,
} from '../../../models/detail';

export interface CodeLanguageOption {
  readonly id: CodeLanguage;
  readonly language?: CodeLanguage;
  readonly label: string;
  readonly disabled?: boolean;
}

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  csharp: 'C#',
  java: 'Java',
  cpp: 'C/C++',
  go: 'Go',
  rust: 'Rust',
  swift: 'Swift',
  php: 'PHP',
  kotlin: 'Kotlin',
  plaintext: 'Text',
};

const LANGUAGE_SHORT_LABELS: Record<CodeLanguage, string> = {
  typescript: 'TS',
  javascript: 'JS',
  python: 'PY',
  csharp: 'C#',
  java: 'JAVA',
  cpp: 'C++',
  go: 'GO',
  rust: 'RS',
  swift: 'SWIFT',
  php: 'PHP',
  kotlin: 'KT',
  plaintext: 'TXT',
};

const SUGGESTED_LANGUAGES: readonly CodeLanguage[] = ['javascript', 'go', 'rust', 'swift', 'php', 'kotlin'];

export const EMPTY_CODE_PANEL_HTML = '<pre class="code-panel__shiki"><code></code></pre>';

export function buildVariantSource(lines: readonly CodeLine[]): string {
  return lines.map((line) => line.tokens.map((token) => token.text).join('')).join('\n');
}

export function shortLanguageLabel(language: CodeLanguage): string {
  return LANGUAGE_SHORT_LABELS[language];
}

export function buildVariantMap(options: {
  readonly inputVariants: CodeVariantMap;
  readonly fallbackLanguage: CodeLanguage;
  readonly fallbackLines: readonly CodeLine[];
  readonly fallbackRegions: readonly CodeRegion[];
}): Record<CodeLanguage, CodeVariant> {
  const presentEntries = Object.entries(options.inputVariants).filter(
    (entry): entry is [CodeLanguage, CodeVariant] => Boolean(entry[1]),
  );

  if (presentEntries.length > 0) {
    return Object.fromEntries(presentEntries) as Record<CodeLanguage, CodeVariant>;
  }

  return {
    [options.fallbackLanguage]: {
      language: options.fallbackLanguage,
      lines: options.fallbackLines,
      regions: options.fallbackRegions,
      highlightMap: undefined,
      source: buildVariantSource(options.fallbackLines),
    },
  } as Record<CodeLanguage, CodeVariant>;
}

export function buildAvailableLanguageOptions(
  variants: Record<CodeLanguage, CodeVariant>,
): readonly CodeLanguageOption[] {
  const implementedLanguages = new Set<CodeLanguage>(
    Object.values(variants).map((variant) => variant.language),
  );

  return [
    ...Object.values(variants).map((variant) => ({
      id: variant.language,
      language: variant.language,
      label: LANGUAGE_LABELS[variant.language],
    })),
    ...SUGGESTED_LANGUAGES.filter((language) => !implementedLanguages.has(language)).map((language) => ({
      id: language,
      label: LANGUAGE_LABELS[language],
      disabled: true,
    })),
  ];
}

export function resolveActiveVariant(
  variants: Record<CodeLanguage, CodeVariant>,
  selectedLanguage: CodeLanguage,
): CodeVariant {
  return variants[selectedLanguage] ?? Object.values(variants)[0]!;
}

export function buildVariantIdentity(variant: CodeVariant): string {
  const regions = variant.regions ?? [];
  return [
    variant.language,
    variant.source ?? buildVariantSource(variant.lines),
    ...regions.map(
      (region) =>
        `${region.id}:${region.startLine}:${region.endLine}:${region.collapsedByDefault ? 1 : 0}`,
    ),
  ].join('\u0001');
}

function hasRenderableContent(line: CodeLine | undefined): boolean {
  if (!line) {
    return false;
  }

  return line.tokens.some((token) => token.text.trim().length > 0);
}

export function resolveActiveCodeLine(
  activeLineNumber: number | null,
  variant: CodeVariant,
): number | null {
  if (activeLineNumber === null) {
    return null;
  }

  if (variant.lines.length === 0) {
    return null;
  }

  const mapped = variant.highlightMap?.[activeLineNumber] ?? activeLineNumber;
  const clamped = Math.min(Math.max(mapped, 1), variant.lines.length);

  if (hasRenderableContent(variant.lines[clamped - 1])) {
    return clamped;
  }

  for (let offset = 1; offset < variant.lines.length; offset += 1) {
    const forward = clamped + offset;
    if (forward <= variant.lines.length && hasRenderableContent(variant.lines[forward - 1])) {
      return forward;
    }

    const backward = clamped - offset;
    if (backward >= 1 && hasRenderableContent(variant.lines[backward - 1])) {
      return backward;
    }
  }

  return clamped;
}

export async function copyTextToClipboard(document: Document, value: string): Promise<void> {
  const clipboard = document.defaultView?.navigator.clipboard;

  try {
    if (!clipboard) {
      throw new Error('Clipboard API unavailable');
    }

    await clipboard.writeText(value);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}
