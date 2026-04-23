import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import katex from 'katex';

import {
  autoTextToTex,
  escapePlainText,
  looksMathishContent,
  MathRenderMode,
  MathTextVariant,
} from './math-text.utils';

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

    if (this.mode() === 'auto' && !looksMathishContent(content)) {
      return this.renderPlain(content);
    }

    return this.renderKatex(autoTextToTex(content), content);
  });

  private renderKatex(tex: string, fallback: string | null): SafeHtml {
    try {
      const html = katex.renderToString(tex, {
        displayMode: this.displayMode(),
        output: 'htmlAndMathml',
        strict: 'ignore',
        throwOnError: true,
      });
      return this.sanitizer.bypassSecurityTrustHtml(
        `<span class="math-text__rendered">${html}</span>`,
      );
    } catch {
      return this.renderPlain(fallback ?? tex);
    }
  }

  private renderPlain(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span class="math-text__plain">${escapePlainText(content)}</span>`,
    );
  }
}
