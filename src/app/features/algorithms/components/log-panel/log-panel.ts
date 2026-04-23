import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { LogEntry } from '../../models/detail';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';

@Component({
  selector: 'app-log-panel',
  imports: [I18nTextPipe, MathText, TranslocoPipe],
  templateUrl: './log-panel.html',
  styleUrl: './log-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogPanel implements AfterViewChecked, OnDestroy {
  protected readonly I18N_KEY = I18N_KEY;
  readonly entries = input.required<readonly LogEntry[]>();

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
}
