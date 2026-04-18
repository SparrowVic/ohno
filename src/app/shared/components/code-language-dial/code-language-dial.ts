import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faGolang,
  faJava,
  faJs,
  faPhp,
  faPython,
  faRust,
  faSwift,
} from '@fortawesome/free-brands-svg-icons';

import { CodeLanguage } from '../../../features/algorithms/models/detail';

type CodeLanguageDialId =
  | CodeLanguage
  | 'javascript'
  | 'go'
  | 'rust'
  | 'swift'
  | 'php'
  | 'kotlin';

export interface CodeLanguageDialOption {
  readonly id: CodeLanguageDialId;
  readonly language?: CodeLanguage;
  readonly label: string;
  readonly disabled?: boolean;
  readonly hint?: string;
}

interface CodeLanguageDialItem extends CodeLanguageDialOption {
  readonly shortLabel: string;
  readonly accent: string;
  readonly icon?: IconDefinition;
  readonly x: number;
  readonly y: number;
  readonly viaX: number;
  readonly viaY: number;
  readonly delayMs: number;
}

const LANGUAGE_DIAL_META: Record<
  CodeLanguageDialId,
  {
    readonly shortLabel: string;
    readonly accent: string;
    readonly icon?: IconDefinition;
  }
> = {
  typescript: { shortLabel: 'TS', accent: '#54b7ff' },
  python: { shortLabel: 'Py', accent: '#8adf84', icon: faPython },
  csharp: { shortLabel: 'C#', accent: '#bd9cff' },
  java: { shortLabel: 'Java', accent: '#ffac74', icon: faJava },
  cpp: { shortLabel: 'C++', accent: '#79d8ff' },
  plaintext: { shortLabel: 'TXT', accent: '#c5ccd9' },
  javascript: { shortLabel: 'JS', accent: '#f7dc6f', icon: faJs },
  go: { shortLabel: 'Go', accent: '#7be0ff', icon: faGolang },
  rust: { shortLabel: 'Rust', accent: '#ffb16a', icon: faRust },
  swift: { shortLabel: 'Swift', accent: '#ff9a66', icon: faSwift },
  php: { shortLabel: 'PHP', accent: '#b2a4ff', icon: faPhp },
  kotlin: { shortLabel: 'Kt', accent: '#ff8ec8' },
};

@Component({
  selector: 'app-code-language-dial',
  imports: [FaIconComponent],
  templateUrl: './code-language-dial.html',
  styleUrl: './code-language-dial.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeLanguageDial implements OnDestroy {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private pulseResetTimer: ReturnType<typeof setTimeout> | null = null;

  readonly options = input.required<readonly CodeLanguageDialOption[]>();
  readonly value = input.required<CodeLanguage>();
  readonly ariaLabel = input('Code language switcher');
  readonly valueChange = output<CodeLanguage>();

  protected readonly open = signal(false);
  protected readonly selectionPulse = signal(false);
  protected readonly activeOption = computed<CodeLanguageDialItem>(() => {
    const option =
      this.options().find((candidate) => candidate.language === this.value()) ?? this.options()[0]!;

    return this.toDialItem(option, 0, 0, 0, 0, 0);
  });
  protected readonly radialItems = computed<readonly CodeLanguageDialItem[]>(() => {
    const selected = this.value();
    const enabled = this.options().filter((option) => option.language !== selected && !option.disabled);
    const disabled = this.options().filter((option) => option.language !== selected && option.disabled);
    const items = [...enabled, ...disabled];
    const count = items.length;
    if (count === 0) {
      return [];
    }

    const itemSize = 44;
    const triggerWidth = 64;
    const triggerHeight = 30;
    const centerX = triggerWidth / 2 - itemSize / 2;
    const centerY = triggerHeight / 2 - itemSize / 2;
    const radius = 92;
    const startAngle = -Math.PI / 2;
    const angleStep = (Math.PI * 2) / count;

    return items.map((option, index) => {
      const angle = startAngle + index * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const sweepAngle = angle - 0.55;
      const viaX = centerX + Math.cos(sweepAngle) * radius * 0.52;
      const viaY = centerY + Math.sin(sweepAngle) * radius * 0.52;

      return this.toDialItem(option, x, y, viaX, viaY, 24 + index * 34);
    });
  });

  protected toggle(): void {
    if (this.radialItems().length === 0) {
      return;
    }

    this.open.update((value) => !value);
  }

  protected select(language: CodeLanguage): void {
    if (language === this.value()) {
      this.open.set(false);
      return;
    }

    this.valueChange.emit(language);
    this.runSelectionPulse();
    this.open.set(false);
  }

  protected close(): void {
    this.open.set(false);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (!this.open()) {
      return;
    }

    if (!this.hostRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  ngOnDestroy(): void {
    if (this.pulseResetTimer !== null) {
      clearTimeout(this.pulseResetTimer);
    }
  }

  private toDialItem(
    option: CodeLanguageDialOption,
    x: number,
    y: number,
    viaX: number,
    viaY: number,
    delayMs: number,
  ): CodeLanguageDialItem {
    const meta = LANGUAGE_DIAL_META[option.id];
    return {
      ...option,
      shortLabel: meta.shortLabel,
      accent: meta.accent,
      icon: meta.icon,
      x,
      y,
      viaX,
      viaY,
      delayMs,
    };
  }

  private runSelectionPulse(): void {
    this.selectionPulse.set(false);
    if (this.pulseResetTimer !== null) {
      clearTimeout(this.pulseResetTimer);
    }

    queueMicrotask(() => this.selectionPulse.set(true));
    this.pulseResetTimer = setTimeout(() => this.selectionPulse.set(false), 520);
  }

}
