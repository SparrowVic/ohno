import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faCopy, faSparkles } from '@fortawesome/pro-solid-svg-icons';
import { translateSignal } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

@Component({
  selector: 'app-copy-code-button',
  imports: [FaIconComponent],
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

  protected readonly pressPulse = signal(false);
  protected readonly successPulse = signal(false);
  protected readonly iconPulse = signal(false);
  protected readonly resolvedLabel = computed(() => this.label() ?? this.defaultLabel());
  protected readonly resolvedCopiedLabel = computed(
    () => this.copiedLabel() ?? this.defaultCopiedLabel(),
  );
  protected readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() ?? this.defaultAriaLabel(),
  );
  protected readonly resolvedCopiedAriaLabel = computed(
    () => this.copiedAriaLabel() ?? this.defaultCopiedAriaLabel(),
  );
  protected readonly icons = {
    copy: faCopy,
    check: faCheck,
    sparkle: faSparkles,
  };

  private pressResetTimer: ReturnType<typeof setTimeout> | null = null;
  private successResetTimer: ReturnType<typeof setTimeout> | null = null;
  private iconResetTimer: ReturnType<typeof setTimeout> | null = null;
  private lastCopied = false;
  private readonly defaultLabel = translateSignal(t('shared.copyCodeButton.label'));
  private readonly defaultCopiedLabel = translateSignal(t('shared.copyCodeButton.copiedLabel'));
  private readonly defaultAriaLabel = translateSignal(t('shared.copyCodeButton.ariaLabel'));
  private readonly defaultCopiedAriaLabel = translateSignal(
    t('shared.copyCodeButton.copiedAriaLabel'),
  );

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
