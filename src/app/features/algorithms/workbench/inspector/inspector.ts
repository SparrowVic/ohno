import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { faCopy } from '@fortawesome/pro-solid-svg-icons';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoFloatingPlate } from '../../../../shared/instrument/floating-plate/floating-plate';
import { OhnoKey } from '../../../../shared/instrument/key/key';
import { OhnoMenu } from '../../../../shared/instrument/menu/menu';
import { MenuItem } from '../../../../shared/instrument/menu/menu.types';
import { OhnoScreen } from '../../../../shared/instrument/screen/screen';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { CodePanel } from '../../components/code-panel/code-panel';
import {
  buildAvailableLanguageOptions,
  buildVariantMap,
  buildVariantSource,
  copyTextToClipboard,
  resolveActiveVariant,
  shortLanguageLabel,
} from '../../components/code-panel/code-panel.utils/code-panel.utils';
import { InfoPanel } from '../../components/info-panel/info-panel';
import { AlgorithmItem } from '../../models/algorithm';
import { CodeLanguage, CodeLine, CodeRegion, CodeVariantMap } from '../../models/detail';
import { hasTrace, WorkbenchTraces } from '../models/workbench-traces';
import { OhnoTraceHost } from '../trace-host/trace-host';

export type InspectorTab = 'code' | 'info' | 'trace';

const COPIED_FLASH_MS = 1400;

@Component({
  selector: 'ohno-inspector',
  imports: [
    CodePanel,
    I18nTextPipe,
    InfoPanel,
    MathText,
    OhnoEngraving,
    OhnoFloatingPlate,
    OhnoKey,
    OhnoMenu,
    OhnoScreen,
    OhnoTraceHost,
    TranslocoPipe,
  ],
  templateUrl: './inspector.html',
  styleUrl: './inspector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoInspector {
  readonly tab = input.required<InspectorTab>();
  readonly algorithm = input.required<AlgorithmItem>();
  readonly codeLines = input<readonly CodeLine[]>([]);
  readonly codeRegions = input<readonly CodeRegion[]>([]);
  readonly codeVariants = input<CodeVariantMap>({});
  readonly activeLineNumber = input<number | null>(null);
  readonly activeTaskName = input<TranslatableText | null>(null);
  readonly codeSnippetMissing = input(false);
  readonly traces = input.required<WorkbenchTraces>();
  readonly tabChange = output<InspectorTab>();

  private readonly document = inject(DOCUMENT);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);
  private copiedTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { copy: faCopy };
  protected readonly selectedLanguage = signal<CodeLanguage>('typescript');
  protected readonly languageMenuOpen = signal(false);
  protected readonly copied = signal(false);

  protected readonly showTrace = computed(() => hasTrace(this.traces()));
  protected readonly tabs = computed<readonly { id: InspectorTab; label: string }[]>(() => {
    this.language.activeLang();
    const inspector = I18N_KEY.features.algorithms.workbench.inspector;
    const tabs: { id: InspectorTab; label: string }[] = [
      { id: 'code', label: this.transloco.translate(inspector.code) },
      { id: 'info', label: this.transloco.translate(inspector.info) },
    ];
    if (this.showTrace()) tabs.push({ id: 'trace', label: this.transloco.translate(inspector.trace) });
    return tabs;
  });
  protected readonly activeTab = computed<InspectorTab>(() =>
    this.tab() === 'trace' && !this.showTrace() ? 'code' : this.tab(),
  );

  private readonly variantMap = computed(() =>
    buildVariantMap({
      inputVariants: this.codeVariants(),
      fallbackLanguage: 'typescript',
      fallbackLines: this.codeLines(),
      fallbackRegions: this.codeRegions(),
    }),
  );
  protected readonly languageItems = computed<readonly MenuItem[]>(() =>
    buildAvailableLanguageOptions(this.variantMap()).map((option) => ({
      id: option.id,
      label: option.label,
      disabled: option.disabled,
    })),
  );
  protected readonly languageKeyLabel = computed(() => `${shortLanguageLabel(this.selectedLanguage())} ▾`);

  constructor() {
    effect(() => {
      const variants = this.variantMap();
      const selected = this.selectedLanguage();
      if (!variants[selected]) {
        this.selectedLanguage.set((Object.keys(variants)[0] as CodeLanguage | undefined) ?? 'typescript');
      }
    });
    this.destroyRef.onDestroy(() => this.clearCopiedTimer());
  }

  protected selectTab(tab: InspectorTab): void {
    if (tab !== this.activeTab()) this.tabChange.emit(tab);
  }

  protected pickLanguage(id: string): void {
    this.languageMenuOpen.set(false);
    if (this.variantMap()[id as CodeLanguage]) this.selectedLanguage.set(id as CodeLanguage);
  }

  protected async copyCode(): Promise<void> {
    const variant = resolveActiveVariant(this.variantMap(), this.selectedLanguage());
    await copyTextToClipboard(this.document, variant.source ?? buildVariantSource(variant.lines));
    this.copied.set(true);
    this.clearCopiedTimer();
    this.copiedTimer = setTimeout(() => this.copied.set(false), COPIED_FLASH_MS);
  }

  private clearCopiedTimer(): void {
    if (this.copiedTimer !== null) clearTimeout(this.copiedTimer);
    this.copiedTimer = null;
  }
}
