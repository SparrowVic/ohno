import { CodeLanguage, CodeVariantMap } from '../../models/detail';
import { buildStructuredCode } from '../code-line-builder/code-line-builder';

type ProgrammingCodeLanguage = Exclude<CodeLanguage, 'plaintext'>;

export function buildCodeVariants(
  sources: Readonly<Record<ProgrammingCodeLanguage, string>>,
): CodeVariantMap {
  const variants: CodeVariantMap = {};

  for (const language of Object.keys(sources) as ProgrammingCodeLanguage[]) {
    const built =
      language === 'typescript'
        ? buildStructuredCode(sources[language])
        : buildStructuredCode(sources[language], language);

    variants[language] = {
      language,
      lines: built.lines,
      regions: built.regions,
      highlightMap: built.highlightMap,
      source: built.source,
    };
  }

  return variants;
}
