import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  viewChild,
} from '@angular/core';

import { LogEntry } from '../../models/detail';

@Component({
  selector: 'app-log-panel',
  imports: [],
  templateUrl: './log-panel.html',
  styleUrl: './log-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogPanel implements AfterViewChecked, OnDestroy {
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
