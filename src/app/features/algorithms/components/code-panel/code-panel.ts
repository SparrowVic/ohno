import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { CodeHighlightService } from '../../../../shared/code-highlight.service';
import {
  CodeLanguageDial,
  CodeLanguageDialOption,
} from '../../../../shared/code-language-dial/code-language-dial';
import { CopyCodeButton } from '../../../../shared/ui/copy-code-button/copy-code-button';
import { CodeLanguage, CodeLine, CodeRegion, CodeVariant, CodeVariantMap } from '../../models/detail';

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  typescript: 'TypeScript',
  python: 'Python',
  csharp: 'C#',
  java: 'Java',
  cpp: 'C/C++',
  plaintext: 'Text',
};

const SUGGESTED_LANGUAGE_OPTIONS: readonly CodeLanguageDialOption[] = [
  { id: 'javascript', label: 'JavaScript', disabled: true, hint: 'Coming soon' },
  { id: 'go', label: 'Go', disabled: true, hint: 'Coming soon' },
  { id: 'rust', label: 'Rust', disabled: true, hint: 'Coming soon' },
  { id: 'swift', label: 'Swift', disabled: true, hint: 'Coming soon' },
  { id: 'php', label: 'PHP', disabled: true, hint: 'Coming soon' },
  { id: 'kotlin', label: 'Kotlin', disabled: true, hint: 'Coming soon' },
];

@Component({
  selector: 'app-code-panel',
  imports: [CodeLanguageDial, CopyCodeButton],
  templateUrl: './code-panel.html',
  styleUrl: './code-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodePanel implements AfterViewChecked, OnDestroy {
  private readonly highlighter = inject(CodeHighlightService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);

  readonly lines = input<readonly CodeLine[]>([]);
  readonly language = input<CodeLanguage>('typescript');
  readonly regions = input<readonly CodeRegion[]>([]);
  readonly codeVariants = input<CodeVariantMap>({});
  readonly activeLineNumber = input<number | null>(null);
  protected readonly renderRoot = viewChild<ElementRef<HTMLElement>>('renderRoot');
  protected readonly highlightedHtml = signal<SafeHtml>(
    this.sanitizer.bypassSecurityTrustHtml('<pre class="code-panel__shiki"><code></code></pre>'),
  );
  protected readonly hasLines = signal(false);
  protected readonly copied = signal(false);
  protected readonly selectedLanguage = signal<CodeLanguage>('typescript');
  protected readonly availableLanguages = computed<readonly CodeLanguageDialOption[]>(() => {
    return [
      ...Object.values(this.variantMap()).map((variant) => ({
        id: variant.language,
        language: variant.language,
        label: LANGUAGE_LABELS[variant.language],
      })),
      ...SUGGESTED_LANGUAGE_OPTIONS,
    ];
  });
  protected readonly activeVariant = computed<CodeVariant>(() => {
    const variants = this.variantMap();
    const selected = this.selectedLanguage();
    return variants[selected] ?? Object.values(variants)[0]!;
  });

  private renderVersion = 0;
  private lastAppliedActiveLine: number | null = null;
  private needsDomSync = false;
  private lastVariantIdentity = '';
  private readonly collapsedRegionIds = new Set<string>();
  private domSyncFrame: number | null = null;
  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly variantMap = computed<Record<CodeLanguage, CodeVariant>>(() => {
    const inputVariants = this.codeVariants();
    const presentEntries = Object.entries(inputVariants).filter((entry): entry is [CodeLanguage, CodeVariant] =>
      Boolean(entry[1]),
    );

    if (presentEntries.length > 0) {
      return Object.fromEntries(presentEntries) as Record<CodeLanguage, CodeVariant>;
    }

    return {
      [this.language()]: {
        language: this.language(),
        lines: this.lines(),
        regions: this.regions(),
        highlightMap: undefined,
        source: this.lines()
          .map((line) => line.tokens.map((token) => token.text).join(''))
          .join('\n'),
      },
    } as Record<CodeLanguage, CodeVariant>;
  });

  constructor() {
    effect(() => {
      const variants = this.variantMap();
      const selected = this.selectedLanguage();
      if (!variants[selected]) {
        this.selectedLanguage.set((Object.keys(variants)[0] as CodeLanguage | undefined) ?? 'typescript');
      }
    });

    effect(() => {
      const variant = this.activeVariant();
      this.syncRegionDefaults(variant);
      void this.renderCode(variant);
    });

    effect(() => {
      this.activeLineNumber();
      this.activeVariant();
      this.ensureVisibleActiveLine();
      this.requestDomSync();
    });
  }

  ngOnDestroy(): void {
    if (this.domSyncFrame !== null) {
      cancelAnimationFrame(this.domSyncFrame);
    }
    if (this.copyResetTimer !== null) {
      clearTimeout(this.copyResetTimer);
    }
  }

  ngAfterViewChecked(): void {
    if (this.needsDomSync) {
      this.applyRegionState();
      this.applyActiveLine();
      this.needsDomSync = false;
    }
  }

  protected selectLanguage(language: CodeLanguage): void {
    if (language === this.selectedLanguage()) {
      return;
    }

    this.selectedLanguage.set(language);
  }

  protected async copyCurrentCode(): Promise<void> {
    const source = this.activeVariant().source ?? this.variantSource(this.activeVariant());
    const clipboard = this.document.defaultView?.navigator.clipboard;

    try {
      if (!clipboard) {
        throw new Error('Clipboard API unavailable');
      }

      await clipboard.writeText(source);
    } catch {
      const textarea = this.document.createElement('textarea');
      textarea.value = source;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      this.document.body.append(textarea);
      textarea.select();
      this.document.execCommand('copy');
      textarea.remove();
    }

    this.copied.set(true);
    if (this.copyResetTimer !== null) {
      clearTimeout(this.copyResetTimer);
    }
    this.copyResetTimer = setTimeout(() => this.copied.set(false), 1400);
  }

  protected onRenderClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const toggle = target?.closest<HTMLButtonElement>('.code-panel__fold-toggle');
    const regionId = toggle?.dataset['regionId'];
    if (!regionId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.collapsedRegionIds.has(regionId)) {
      this.collapsedRegionIds.delete(regionId);
    } else {
      this.collapsedRegionIds.add(regionId);
    }

    this.ensureVisibleActiveLine();
    this.requestDomSync();
  }

  private async renderCode(variant: CodeVariant): Promise<void> {
    const version = ++this.renderVersion;
    const html = await this.highlighter.highlight(variant.lines, variant.language);
    if (version !== this.renderVersion) {
      return;
    }

    this.highlightedHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
    this.hasLines.set(variant.lines.length > 0);
    this.requestDomSync();
  }

  private applyActiveLine(): void {
    const root = this.renderRoot()?.nativeElement;
    if (!root) {
      return;
    }

    if (this.lastAppliedActiveLine !== null) {
      root
        .querySelector<HTMLElement>(`.code-panel__render-line[data-line="${this.lastAppliedActiveLine}"]`)
        ?.classList.remove('code-panel__render-line--active');
    }

    const nextLine = this.resolveActiveLine();
    if (nextLine !== null) {
      const nextElement = root.querySelector<HTMLElement>(
        `.code-panel__render-line[data-line="${nextLine}"]`,
      );
      nextElement?.classList.add('code-panel__render-line--active');
      nextElement?.scrollIntoView({ block: 'nearest' });
    }

    this.lastAppliedActiveLine = nextLine;
  }

  private syncRegionDefaults(variant: CodeVariant): void {
    const regions = variant.regions ?? [];
    const identity = [
      variant.language,
      variant.source ?? this.variantSource(variant),
      ...regions.map((region) => `${region.id}:${region.startLine}:${region.endLine}:${region.collapsedByDefault ? 1 : 0}`),
    ].join('\u0001');
    if (identity === this.lastVariantIdentity) {
      return;
    }

    this.collapsedRegionIds.clear();
    for (const region of regions) {
      if (region.collapsedByDefault && region.endLine > region.startLine) {
        this.collapsedRegionIds.add(region.id);
      }
    }

    this.lastVariantIdentity = identity;
    this.ensureVisibleActiveLine();
    this.requestDomSync();
  }

  private ensureVisibleActiveLine(): void {
    const activeLine = this.resolveActiveLine();
    if (activeLine === null) {
      return;
    }

    for (const region of this.activeVariant().regions ?? []) {
      if (
        this.collapsedRegionIds.has(region.id) &&
        activeLine > region.startLine &&
        activeLine <= region.endLine
      ) {
        this.collapsedRegionIds.delete(region.id);
      }
    }
  }

  private applyRegionState(): void {
    const root = this.renderRoot()?.nativeElement;
    if (!root) {
      return;
    }

    const document = root.ownerDocument;
    const lines = [...root.querySelectorAll<HTMLElement>('.code-panel__render-line')];
    const lineMap = new Map<number, HTMLElement>();

    for (const line of lines) {
      const number = Number(line.dataset['line']);
      lineMap.set(number, line);
      line.classList.remove(
        'code-panel__render-line--foldable',
        'code-panel__render-line--collapsed',
        'code-panel__render-line--hidden',
      );
      line.querySelectorAll('.code-panel__fold-toggle, .code-panel__fold-summary').forEach((node) => node.remove());
    }

    const hiddenLines = new Set<number>();
    for (const region of this.activeVariant().regions ?? []) {
      if (!this.collapsedRegionIds.has(region.id)) {
        continue;
      }

      for (let line = region.startLine + 1; line <= region.endLine; line += 1) {
        hiddenLines.add(line);
      }
    }

    for (const lineNumber of hiddenLines) {
      lineMap.get(lineNumber)?.classList.add('code-panel__render-line--hidden');
    }

    for (const region of this.activeVariant().regions ?? []) {
      if (region.endLine <= region.startLine) {
        continue;
      }

      const header = lineMap.get(region.startLine);
      if (!header) {
        continue;
      }

      const collapsed = this.collapsedRegionIds.has(region.id);
      header.classList.add('code-panel__render-line--foldable');
      if (collapsed) {
        header.classList.add('code-panel__render-line--collapsed');
      }

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'code-panel__fold-toggle';
      toggle.dataset['regionId'] = region.id;
      toggle.setAttribute('aria-label', collapsed ? 'Expand code region' : 'Collapse code region');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.innerHTML =
        '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2.5L8 6 4 9.5"/></svg>';
      header.prepend(toggle);

      if (collapsed) {
        const summary = document.createElement('span');
        summary.className = 'code-panel__fold-summary';
        summary.textContent = `… ${region.endLine - region.startLine} lines`;
        header.append(summary);
      }
    }
  }

  private resolveActiveLine(): number | null {
    const activeStep = this.activeLineNumber();
    if (activeStep === null) {
      return null;
    }

    const map = this.activeVariant().highlightMap;
    return map?.[activeStep] ?? activeStep;
  }

  private requestDomSync(): void {
    this.needsDomSync = true;
    if (this.domSyncFrame !== null) {
      cancelAnimationFrame(this.domSyncFrame);
    }

    const view = this.document.defaultView;
    if (!view) {
      return;
    }

    queueMicrotask(() => {
      this.domSyncFrame = view.requestAnimationFrame(() => {
        this.applyRegionState();
        this.applyActiveLine();
        this.needsDomSync = false;
        this.domSyncFrame = null;
      });
    });
  }

  private variantSource(variant: CodeVariant): string {
    return variant.lines.map((line) => line.tokens.map((token) => token.text).join('')).join('\n');
  }
}
