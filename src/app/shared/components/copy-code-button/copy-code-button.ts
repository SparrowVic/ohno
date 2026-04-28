import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faCopy, faSparkles } from '@fortawesome/pro-solid-svg-icons';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { AppButton } from '../button/button';

@Component({
  selector: 'app-copy-code-button',
  imports: [AppButton, FaIconComponent, TranslocoPipe],
  templateUrl: './copy-code-button.html',
  styleUrl: './copy-code-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyCodeButton implements OnDestroy {
  readonly copied = input(false);
  readonly label = input<string | null>(null);
  readonly copiedLabel = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly copiedAriaLabel = input<string | null>(null);
  readonly pressed = output<void>();

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly pressPulse = signal(false);
  protected readonly successPulse = signal(false);
  protected readonly iconPulse = signal(false);
  protected readonly icons = {
    copy: faCopy,
    check: faCheck,
    sparkle: faSparkles,
  };

  private pressResetTimer: ReturnType<typeof setTimeout> | null = null;
  private successResetTimer: ReturnType<typeof setTimeout> | null = null;
  private iconResetTimer: ReturnType<typeof setTimeout> | null = null;
  private lastCopied = false;

  constructor() {
    effect(() => {
      const copied = this.copied();
      if (copied && !this.lastCopied) {
        this.runSuccessPulse();
      }
      this.lastCopied = copied;
    });
  }

  ngOnDestroy(): void {
    if (this.pressResetTimer !== null) {
      clearTimeout(this.pressResetTimer);
    }
    if (this.successResetTimer !== null) {
      clearTimeout(this.successResetTimer);
    }
    if (this.iconResetTimer !== null) {
      clearTimeout(this.iconResetTimer);
    }
  }

  protected handleClick(): void {
    this.runPressPulse();
    this.pressed.emit();
  }

  private runPressPulse(): void {
    this.pressPulse.set(false);
    if (this.pressResetTimer !== null) {
      clearTimeout(this.pressResetTimer);
    }

    queueMicrotask(() => this.pressPulse.set(true));
    this.pressResetTimer = setTimeout(() => this.pressPulse.set(false), 240);
  }

  private runSuccessPulse(): void {
    this.successPulse.set(false);
    this.iconPulse.set(false);

    if (this.successResetTimer !== null) {
      clearTimeout(this.successResetTimer);
    }
    if (this.iconResetTimer !== null) {
      clearTimeout(this.iconResetTimer);
    }

    queueMicrotask(() => {
      this.successPulse.set(true);
      this.iconPulse.set(true);
    });

    this.iconResetTimer = setTimeout(() => this.iconPulse.set(false), 520);
    this.successResetTimer = setTimeout(() => this.successPulse.set(false), 760);
  }
}
