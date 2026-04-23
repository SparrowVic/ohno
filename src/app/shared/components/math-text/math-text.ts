import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import katex from 'katex';

import {
  autoTextToTex,
  escapePlainText,
  hasMarkedMathSegments,
  looksMathishContent,
  MathRenderMode,
  MathTextSegment,
  MathTextVariant,
  splitMathTextSegments,
} from './math-text.utils';

/**
 * Module-level cache for KaTeX-rendered HTML. `katex.renderToString` is
 * non-trivial (parse → build tree → serialise HTML + MathML) and log
 * playbacks re-run through 100+ descriptions per tick. Memoising on
 * `tex + displayMode` keeps CD cycles cheap without losing correctness
 * (KaTeX output is deterministic for a given input pair).
 *
 * Caps the map so a very long session cannot leak memory — once we hit
 * MAX we drop the oldest entry. Typical traces see ≤ a few hundred
 * distinct formulas, well under the cap.
 */
const KATEX_CACHE_MAX = 512;
const katexCache = new Map<string, string>();

function renderKatexCached(tex: string, displayMode: boolean): string | null {
  const key = `${displayMode ? 'D' : 'I'}|${tex}`;
  const cached = katexCache.get(key);
  if (cached !== undefined) return cached;

  try {
    const html = katex.renderToString(tex, {
      displayMode,
      output: 'htmlAndMathml',
      strict: 'ignore',
      throwOnError: true,
    });
    if (katexCache.size >= KATEX_CACHE_MAX) {
      const firstKey = katexCache.keys().next().value;
      if (firstKey !== undefined) katexCache.delete(firstKey);
    }
    katexCache.set(key, html);
    return html;
  } catch {
    return null;
  }
}

/**
 * Small KaTeX wrapper used across algorithm visualizations.
 *
 * It accepts either explicit TeX or simple math-ish text from the
 * existing trace models (`Fₙ₊₁`, `fib(5)`, `√n`, `α`, `β`, `mod`) and
 * converts it to KaTeX inline markup. Non-math labels safely fall back
 * to plain text so views can opt into `mode="auto"` without extra
 * branching in every template.
 */
@Component({
  selector: 'app-math-text',
  templateUrl: './math-text.html',
  styleUrl: './math-text.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MathText {
  readonly content = input<string | null>(null);
  readonly tex = input<string | null>(null);
  readonly mode = input<MathRenderMode>('auto');
  readonly displayMode = input(false);
  readonly variant = input<MathTextVariant>('default');

  private readonly sanitizer = inject(DomSanitizer);

  readonly renderedHtml = computed<SafeHtml>(() => {
    const explicitTex = this.tex()?.trim();
    if (explicitTex) {
      return this.renderKatex(explicitTex, this.content());
    }

    const content = this.content()?.trim() ?? '';
    if (!content) return this.renderPlain('');

    if (this.mode() === 'text') {
      return this.renderPlain(content);
    }

    if (hasMarkedMathSegments(content) || this.mode() === 'mixed') {
      return this.renderMixed(content);
    }

    if (this.mode() === 'auto' && !looksMathishContent(content)) {
      return this.renderPlain(content);
    }

    return this.renderKatex(autoTextToTex(content), content);
  });

  private renderKatex(tex: string, fallback: string | null): SafeHtml {
    const html = this.renderKatexMarkup(tex, this.displayMode());
    if (html !== null) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<span class="math-text__rendered">${html}</span>`,
      );
    }

    return this.renderPlain(fallback ?? tex);
  }

  private renderMixed(content: string): SafeHtml {
    const segments = splitMathTextSegments(content);
    if (segments.length === 1 && segments[0]?.kind === 'text') {
      if (this.mode() === 'mixed' && looksMathishContent(content)) {
        return this.renderKatex(autoTextToTex(content), content);
      }
      return this.renderPlain(content);
    }

    const html = segments.map((segment) => this.renderMixedSegment(segment)).join('');
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span class="math-text__rendered math-text__rendered--mixed">${html}</span>`,
    );
  }

  private renderMixedSegment(segment: MathTextSegment): string {
    if (segment.kind === 'text') {
      return `<span class="math-text__segment math-text__segment--plain">${escapePlainText(segment.content)}</span>`;
    }

    const html = this.renderKatexMarkup(autoTextToTex(segment.content), false);
    if (html === null) {
      return `<span class="math-text__segment math-text__segment--plain">${escapePlainText(segment.content)}</span>`;
    }

    return `<span class="math-text__segment math-text__segment--math">${html}</span>`;
  }

  private renderKatexMarkup(tex: string, displayMode: boolean): string | null {
    return renderKatexCached(tex, displayMode);
  }

  private renderPlain(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span class="math-text__plain">${escapePlainText(content)}</span>`,
    );
  }
}
