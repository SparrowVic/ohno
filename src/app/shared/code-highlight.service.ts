import { Injectable } from '@angular/core';
import { transformerRemoveLineBreak } from '@shikijs/transformers';
import csharp from '@shikijs/langs/csharp';
import cpp from '@shikijs/langs/cpp';
import go from '@shikijs/langs/go';
import javascript from '@shikijs/langs/javascript';
import java from '@shikijs/langs/java';
import kotlin from '@shikijs/langs/kotlin';
import php from '@shikijs/langs/php';
import python from '@shikijs/langs/python';
import rust from '@shikijs/langs/rust';
import swift from '@shikijs/langs/swift';
import typescript from '@shikijs/langs/typescript';
import darkPlus from '@shikijs/themes/dark-plus';
import { createHighlighterCore, type ShikiTransformer } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { CodeLanguage, CodeLine } from '../features/algorithms/models/detail';

const SHIKI_THEME = 'dark-plus';

function lineText(line: CodeLine): string {
  return line.tokens.map((token) => token.text).join('');
}

function createLineTransformer(): ShikiTransformer {
  return {
    pre(node) {
      this.addClassToHast(node, 'code-panel__shiki');
    },
    code(node) {
      this.addClassToHast(node, 'code-panel__code');
    },
    line(node, line) {
      this.addClassToHast(node, 'code-panel__render-line');
      node.properties['data-line'] = String(line);
    },
  };
}

@Injectable({ providedIn: 'root' })
export class CodeHighlightService {
  private highlighterPromise:
    | ReturnType<typeof createHighlighterCore>
    | null = null;
  private readonly htmlCache = new Map<string, Promise<string>>();

  async highlight(lines: readonly CodeLine[], language: CodeLanguage): Promise<string> {
    const source = lines.map(lineText).join('\n');
    const cacheKey = `${language}\u0000${source}`;
    const cached = this.htmlCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const pending = this.render(source, language);
    this.htmlCache.set(cacheKey, pending);
    return pending;
  }

  private getHighlighter(): ReturnType<typeof createHighlighterCore> {
    this.highlighterPromise ??= createHighlighterCore({
      engine: createJavaScriptRegexEngine(),
      themes: [darkPlus],
      langs: [typescript, javascript, python, csharp, java, cpp, go, rust, swift, php, kotlin],
      warnings: false,
    });

    return this.highlighterPromise;
  }

  private async render(source: string, language: CodeLanguage): Promise<string> {
    const highlighter = await this.getHighlighter();
    return highlighter.codeToHtml(source, {
      lang: language,
      theme: SHIKI_THEME,
      transformers: [transformerRemoveLineBreak(), createLineTransformer()],
    });
  }
}
