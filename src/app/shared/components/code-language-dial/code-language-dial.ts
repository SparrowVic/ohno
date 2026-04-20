import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
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
  readonly launchSpinDeg: number;
  readonly delayMs: number;
}

interface TriggerRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
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

// Fan dimensions (kept in sync with CSS). The items orbit these virtual
// trigger dimensions — when the real trigger shrinks at small widths the
// SCSS falls back to the same defaults so the math stays predictable.
const TRIGGER_VIRTUAL_WIDTH = 32;
const TRIGGER_VIRTUAL_HEIGHT = 32;
const ITEM_SIZE = 44;
const DIAL_RADIUS = 96;
// Dealer-throw cadence: first card flicks out almost immediately, each
// subsequent one ~34ms behind. Tight enough to feel like one continuous
// motion, loose enough that the eye can track individual cards.
const STAGGER_BASE_MS = 4;
const STAGGER_STEP_MS = 34;

@Component({
  selector: 'app-code-language-dial',
  imports: [FaIconComponent],
  templateUrl: './code-language-dial.html',
  styleUrl: './code-language-dial.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeLanguageDial implements AfterViewInit, OnDestroy {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('triggerBtn');
  private readonly fanRef = viewChild<ElementRef<HTMLDivElement>>('fan');
  private fanEl: HTMLDivElement | null = null;
  private pulseResetTimer: ReturnType<typeof setTimeout> | null = null;
  private listenersAttached = false;
  private rafToken: number | null = null;
  private readonly repositionHandler = () => this.scheduleMeasure();

  readonly options = input.required<readonly CodeLanguageDialOption[]>();
  readonly value = input.required<CodeLanguage>();
  readonly ariaLabel = input('Code language switcher');
  readonly valueChange = output<CodeLanguage>();

  protected readonly open = signal(false);
  protected readonly selectionPulse = signal(false);
  protected readonly triggerRect = signal<TriggerRect>({
    x: 0,
    y: 0,
    width: TRIGGER_VIRTUAL_WIDTH,
    height: TRIGGER_VIRTUAL_HEIGHT,
  });
  protected readonly activeOption = computed<CodeLanguageDialItem>(() => {
    const option =
      this.options().find((candidate) => candidate.language === this.value()) ?? this.options()[0]!;

    return this.toDialItem(option, 0, 0, 0, 0);
  });
  protected readonly radialItems = computed<readonly CodeLanguageDialItem[]>(() => {
    const selected = this.value();
    const enabled = this.options().filter(
      (option) => option.language !== selected && !option.disabled,
    );
    const disabled = this.options().filter(
      (option) => option.language !== selected && option.disabled,
    );
    const items = [...enabled, ...disabled];
    const count = items.length;
    if (count === 0) return [];

    const centerX = TRIGGER_VIRTUAL_WIDTH / 2 - ITEM_SIZE / 2;
    const centerY = TRIGGER_VIRTUAL_HEIGHT / 2 - ITEM_SIZE / 2;
    const startAngle = -Math.PI / 2;
    const angleStep = (Math.PI * 2) / count;

    return items.map((option, index) => {
      const angle = startAngle + index * angleStep;
      const x = centerX + Math.cos(angle) * DIAL_RADIUS;
      const y = centerY + Math.sin(angle) * DIAL_RADIUS;

      // Card-throw spin: each card rotates out of the trigger along the
      // tangent of its orbit, tumbles once, then lands flat at its slot.
      // Angle-specific spin varies the feel slightly for each position.
      const spinDeg = -180 + Math.sin(angle) * 60;

      return this.toDialItem(option, x, y, spinDeg, STAGGER_BASE_MS + index * STAGGER_STEP_MS);
    });
  });

  ngAfterViewInit(): void {
    // Portal the fan to <body>. Any ancestor with backdrop-filter/transform/
    // filter/will-change creates a containing block that re-scopes our
    // position:fixed fan — causing it to be clipped by parent overflow.
    // Living at body level guarantees the fan positions against the real
    // viewport and its z-index beats every in-flow stacking context.
    const fanEl = this.fanRef()?.nativeElement;
    if (fanEl && fanEl.parentElement !== document.body) {
      this.fanEl = fanEl;
      document.body.appendChild(fanEl);
    }
  }

  protected toggle(): void {
    if (this.radialItems().length === 0) return;

    const next = !this.open();
    if (next) {
      this.measureTrigger();
      this.attachListeners();
    } else {
      this.detachListeners();
    }
    this.open.set(next);
  }

  protected select(language: CodeLanguage): void {
    if (language === this.value()) {
      this.close();
      return;
    }

    this.valueChange.emit(language);
    this.runSelectionPulse();
    this.close();
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.detachListeners();
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (!this.open()) return;

    const target = event.target as Node;
    const insideHost = this.hostRef.nativeElement.contains(target);
    const insideFan = this.fanEl?.contains(target) ?? false;

    if (!insideHost && !insideFan) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  ngOnDestroy(): void {
    if (this.pulseResetTimer !== null) clearTimeout(this.pulseResetTimer);
    if (this.rafToken !== null) cancelAnimationFrame(this.rafToken);
    this.detachListeners();
    if (this.fanEl && this.fanEl.parentElement === document.body) {
      this.fanEl.remove();
    }
    this.fanEl = null;
  }

  // ---- private ------------------------------------------------------------

  private toDialItem(
    option: CodeLanguageDialOption,
    x: number,
    y: number,
    launchSpinDeg: number,
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
      launchSpinDeg,
      delayMs,
    };
  }

  private runSelectionPulse(): void {
    this.selectionPulse.set(false);
    if (this.pulseResetTimer !== null) clearTimeout(this.pulseResetTimer);

    queueMicrotask(() => this.selectionPulse.set(true));
    this.pulseResetTimer = setTimeout(() => this.selectionPulse.set(false), 520);
  }

  private measureTrigger(): void {
    const el = this.triggerRef()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.triggerRect.set({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  private scheduleMeasure(): void {
    if (!this.open()) return;
    if (this.rafToken !== null) return;
    this.rafToken = requestAnimationFrame(() => {
      this.rafToken = null;
      this.zone.run(() => this.measureTrigger());
    });
  }

  private attachListeners(): void {
    if (this.listenersAttached) return;
    this.zone.runOutsideAngular(() => {
      // Capture-phase scroll catches any ancestor scroller (side-panel,
      // viewport, resizable handles).
      document.addEventListener('scroll', this.repositionHandler, {
        capture: true,
        passive: true,
      });
      window.addEventListener('resize', this.repositionHandler);
    });
    this.listenersAttached = true;
  }

  private detachListeners(): void {
    if (!this.listenersAttached) return;
    document.removeEventListener('scroll', this.repositionHandler, {
      capture: true,
    } as AddEventListenerOptions);
    window.removeEventListener('resize', this.repositionHandler);
    this.listenersAttached = false;
    if (this.rafToken !== null) {
      cancelAnimationFrame(this.rafToken);
      this.rafToken = null;
    }
  }
}
