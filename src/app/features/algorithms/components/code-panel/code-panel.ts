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
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { CodeHighlightService } from '../../../../shared/code-highlight.service';
import {
  CodeLanguageDial,
  CodeLanguageDialOption,
} from '../../../../shared/components/code-language-dial/code-language-dial';
import { CopyCodeButton } from '../../../../shared/components/copy-code-button/copy-code-button';
import {
  CodeLanguage,
  CodeLine,
  CodeRegion,
  CodeVariant,
  CodeVariantMap,
} from '../../models/detail';
import {
  applyActiveLineHighlight,
  findClickedRegionId,
  syncCodeRegionState,
} from './code-panel.dom/code-panel.dom';
import {
  EMPTY_CODE_PANEL_HTML,
  buildAvailableLanguageOptions,
  buildVariantIdentity,
  buildVariantMap,
  buildVariantSource,
  copyTextToClipboard,
  resolveActiveCodeLine,
  resolveActiveVariant,
} from './code-panel.utils/code-panel.utils';

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
  private readonly languageService = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly lines = input<readonly CodeLine[]>([]);
  readonly language = input<CodeLanguage>('typescript');
  readonly regions = input<readonly CodeRegion[]>([]);
  readonly codeVariants = input<CodeVariantMap>({});
  readonly activeLineNumber = input<number | null>(null);
  protected readonly renderRoot = viewChild<ElementRef<HTMLElement>>('renderRoot');
  protected readonly highlightedHtml = signal<SafeHtml>(
    this.sanitizer.bypassSecurityTrustHtml(EMPTY_CODE_PANEL_HTML),
  );
  protected readonly hasLines = signal(false);
  protected readonly copied = signal(false);
  protected readonly gutterHover = signal(false);
  protected readonly selectedLanguage = signal<CodeLanguage>('typescript');
  protected readonly availableLanguages = computed<readonly CodeLanguageDialOption[]>(() => {
    return buildAvailableLanguageOptions(this.variantMap());
  });
  protected readonly activeVariant = computed<CodeVariant>(() => {
    return resolveActiveVariant(this.variantMap(), this.selectedLanguage());
  });
  protected readonly codeLanguageAriaLabel = computed(() =>
    this.translate(t('features.algorithms.codePanel.codeLanguageAriaLabel')),
  );
  protected readonly emptyLabel = computed(() =>
    this.translate(t('features.algorithms.codePanel.emptyLabel')),
  );
  private readonly regionStateLabels = computed(() => ({
    expandRegionAriaLabel: this.translate(t('features.algorithms.codePanel.expandRegionAriaLabel')),
    collapseRegionAriaLabel: this.translate(
      t('features.algorithms.codePanel.collapseRegionAriaLabel'),
    ),
    collapsedRegionSummary: (lineCount: number) =>
      this.translate(t('features.algorithms.codePanel.collapsedRegionSummary'), {
        count: lineCount,
      }),
  }));

  // Width of the line-number + fold-toggle gutter column in pixels.
  // Matches the `left: 60px` separator and the 66px content padding in
  // code-panel.scss. When the cursor sits inside this strip, we reveal
  // every available fold toggle at once.
  private static readonly GUTTER_WIDTH_PX = 60;

  private renderVersion = 0;
  private lastAppliedActiveLine: number | null = null;
  private needsDomSync = false;
  private lastVariantIdentity = '';
  private readonly collapsedRegionIds = new Set<string>();
  private domSyncFrame: number | null = null;
  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly variantMap = computed<Record<CodeLanguage, CodeVariant>>(() => {
    return buildVariantMap({
      inputVariants: this.codeVariants(),
      fallbackLanguage: this.language(),
      fallbackLines: this.lines(),
      fallbackRegions: this.regions(),
    });
  });

  constructor() {
    effect(() => {
      const variants = this.variantMap();
      const selected = this.selectedLanguage();
      if (!variants[selected]) {
        this.selectedLanguage.set(
          (Object.keys(variants)[0] as CodeLanguage | undefined) ?? 'typescript',
        );
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
    const source = this.activeVariant().source ?? buildVariantSource(this.activeVariant().lines);
    await copyTextToClipboard(this.document, source);

    this.copied.set(true);
    if (this.copyResetTimer !== null) {
      clearTimeout(this.copyResetTimer);
    }
    this.copyResetTimer = setTimeout(() => this.copied.set(false), 1400);
  }

  protected onRenderMouseMove(event: MouseEvent): void {
    const root = this.renderRoot()?.nativeElement;
    if (!root) {
      return;
    }
    const rect = root.getBoundingClientRect();
    const xWithinRender = event.clientX - rect.left;
    const inGutter = xWithinRender >= 0 && xWithinRender < CodePanel.GUTTER_WIDTH_PX;
    if (inGutter !== this.gutterHover()) {
      this.gutterHover.set(inGutter);
    }
  }

  protected onRenderMouseLeave(): void {
    if (this.gutterHover()) {
      this.gutterHover.set(false);
    }
  }

  protected onRenderClick(event: MouseEvent): void {
    const regionId = findClickedRegionId(event);
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

    this.lastAppliedActiveLine = applyActiveLineHighlight(
      root,
      this.lastAppliedActiveLine,
      this.resolveActiveLine(),
    );
  }

  private syncRegionDefaults(variant: CodeVariant): void {
    const regions = variant.regions ?? [];
    const identity = buildVariantIdentity(variant);
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

    syncCodeRegionState(
      root,
      this.activeVariant().regions ?? [],
      this.collapsedRegionIds,
      this.regionStateLabels(),
    );
  }

  private resolveActiveLine(): number | null {
    return resolveActiveCodeLine(this.activeLineNumber(), this.activeVariant());
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

  private translate(key: string, params?: Record<string, string | number>): string {
    this.languageService.activeLang();
    return this.transloco.translate(key, params);
  }
}
