import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { LogEntry } from '../../models/detail';

@Component({
  selector: 'app-log-panel',
  imports: [],
  templateUrl: './log-panel.html',
  styleUrl: './log-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogPanel implements AfterViewChecked, OnDestroy {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly entries = input.required<readonly LogEntry[]>();
  readonly emptyLabel = computed(() =>
    this.translate(t('features.algorithms.logPanel.emptyLabel')),
  );
  readonly timeHeaderLabel = computed(() =>
    this.translate(t('features.algorithms.logPanel.timeHeaderLabel')),
  );
  readonly stepHeaderLabel = computed(() =>
    this.translate(t('features.algorithms.logPanel.stepHeaderLabel')),
  );
  readonly eventHeaderLabel = computed(() =>
    this.translate(t('features.algorithms.logPanel.eventHeaderLabel')),
  );
  readonly stepKeyLabel = computed(() =>
    this.translate(t('features.algorithms.logPanel.stepKeyLabel')),
  );

  private readonly scrollRef = viewChild<ElementRef<HTMLDivElement>>('scroll');
  private lastCount = 0;
  private scrollTimer: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewChecked(): void {
    const count = this.entries().length;
    if (count !== this.lastCount) {
      this.lastCount = count;
      if (this.scrollTimer !== null) clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        this.scrollTimer = null;
        const el = this.scrollRef()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      }, 0);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollTimer !== null) clearTimeout(this.scrollTimer);
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
