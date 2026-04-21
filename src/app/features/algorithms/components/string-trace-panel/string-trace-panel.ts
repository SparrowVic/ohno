import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheckDouble, faCrosshairs, faLink } from '@fortawesome/pro-solid-svg-icons';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import {
  BurrowsWheelerTraceState,
  HuffmanTraceState,
  KmpTraceState,
  ManacherTraceState,
  RabinKarpTraceState,
  RleTraceState,
  StringTraceState,
  ZAlgorithmTraceState,
  isBurrowsWheelerState,
  isHuffmanState,
  isKmpState,
  isManacherState,
  isRabinKarpState,
  isRleState,
  isZAlgorithmState,
} from '../../models/string';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-string-trace-panel',
  imports: [FaIconComponent, SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './string-trace-panel.html',
  styleUrl: './string-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly looksLikeI18nKey = looksLikeI18nKey;
  readonly state = input.required<StringTraceState | null>();

  readonly kmpState = computed<KmpTraceState | null>(() => {
    const state = this.state();
    return isKmpState(state) ? state : null;
  });
  readonly rabinState = computed<RabinKarpTraceState | null>(() => {
    const state = this.state();
    return isRabinKarpState(state) ? state : null;
  });
  readonly zState = computed<ZAlgorithmTraceState | null>(() => {
    const state = this.state();
    return isZAlgorithmState(state) ? state : null;
  });
  readonly manacherState = computed<ManacherTraceState | null>(() => {
    const state = this.state();
    return isManacherState(state) ? state : null;
  });
  readonly bwtState = computed<BurrowsWheelerTraceState | null>(() => {
    const state = this.state();
    return isBurrowsWheelerState(state) ? state : null;
  });
  readonly rleState = computed<RleTraceState | null>(() => {
    const state = this.state();
    return isRleState(state) ? state : null;
  });
  readonly huffmanState = computed<HuffmanTraceState | null>(() => {
    const state = this.state();
    return isHuffmanState(state) ? state : null;
  });

  readonly legend = [
    {
      labelKey: I18N_KEY.features.algorithms.tracePanels.string.legendItems.currentFocus,
      icon: faCrosshairs,
    },
    {
      labelKey: I18N_KEY.features.algorithms.tracePanels.string.legendItems.reusableStructure,
      icon: faLink,
    },
    {
      labelKey: I18N_KEY.features.algorithms.tracePanels.string.legendItems.confirmedResult,
      icon: faCheckDouble,
    },
  ] as const;

  failurePreview(state: KmpTraceState): readonly number[] {
    return state.failure;
  }

  zPreview(state: ZAlgorithmTraceState): readonly number[] {
    return state.zValues;
  }

  radiiPreview(state: ManacherTraceState): readonly number[] {
    return state.radii;
  }

  groupPreview(state: BurrowsWheelerTraceState): readonly string[] {
    return state.runGroups.map((group) => `${group.count}×${group.char}`);
  }

  jumpLabel(state: KmpTraceState): string {
    return state.fallbackFrom !== null
      ? `${state.fallbackFrom} → ${state.fallbackTo}`
      : this.translate(I18N_KEY.features.algorithms.tracePanels.string.kmp.noJumpLabel);
  }

  rabinStatusLabel(state: RabinKarpTraceState): string {
    if (state.collision) {
      return this.translate(
        I18N_KEY.features.algorithms.tracePanels.string.rabinKarp.collisionStatusLabel,
      );
    }
    if (state.verifying) {
      return this.translate(
        I18N_KEY.features.algorithms.tracePanels.string.rabinKarp.verifyStatusLabel,
      );
    }
    return this.translate(
      I18N_KEY.features.algorithms.tracePanels.string.rabinKarp.hashOnlyStatusLabel,
    );
  }

  formatRatio(value: number | null): string {
    return value === null ? '—' : `${value.toFixed(2)}x`;
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
