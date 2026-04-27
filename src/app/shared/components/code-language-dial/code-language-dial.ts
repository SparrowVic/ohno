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
import { TranslocoPipe } from '@jsverse/transloco';
import {
  faGolang,
  faJava,
  faJs,
  faPhp,
  faPython,
  faRust,
  faSwift,
} from '@fortawesome/free-brands-svg-icons';

import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { CodeLanguage } from '../../../features/algorithms/models/detail';
import { CodeLanguageDialFan } from './code-language-dial-fan/code-language-dial-fan';
import { CodeLanguageDialTrigger } from './code-language-dial-trigger/code-language-dial-trigger';
import type {
  CodeLanguageDialId,
  CodeLanguageDialItem,
  CodeLanguageDialMeta,
  CodeLanguageDialOption,
  TriggerRect,
} from './code-language-dial.types';

export type { CodeLanguageDialOption } from './code-language-dial.types';

const LANGUAGE_DIAL_META: Record<CodeLanguageDialId, CodeLanguageDialMeta> = {
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

const TRIGGER_VIRTUAL_WIDTH = 32;
const TRIGGER_VIRTUAL_HEIGHT = 32;
const ITEM_SIZE = 44;
const DIAL_RADIUS = 96;
const STAGGER_BASE_MS = 4;
const STAGGER_STEP_MS = 34;

@Component({
  selector: 'app-code-language-dial',
  imports: [CodeLanguageDialFan, CodeLanguageDialTrigger, TranslocoPipe],
  templateUrl: './code-language-dial.html',
  styleUrl: './code-language-dial.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeLanguageDial implements AfterViewInit, OnDestroy {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly triggerComponent = viewChild(CodeLanguageDialTrigger);
  private readonly fanComponent = viewChild(CodeLanguageDialFan);
  private fanEl: HTMLDivElement | null = null;
  private pulseResetTimer: ReturnType<typeof setTimeout> | null = null;
  private listenersAttached = false;
  private rafToken: number | null = null;
  private readonly repositionHandler = () => this.scheduleMeasure();

  protected readonly I18N_KEY = I18N_KEY;
  readonly options = input.required<readonly CodeLanguageDialOption[]>();
  readonly value = input.required<CodeLanguage>();
  readonly ariaLabel = input<string | null>(null);
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
      const spinDeg = -180 + Math.sin(angle) * 60;

      return this.toDialItem(option, x, y, spinDeg, STAGGER_BASE_MS + index * STAGGER_STEP_MS);
    });
  });

  ngAfterViewInit(): void {
    const fanEl = this.fanComponent()?.element();
    if (!fanEl) {
      return;
    }

    this.fanEl = fanEl;
    if (fanEl.parentElement !== document.body) {
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
    const rect = this.triggerComponent()?.measure();
    if (!rect) return;
    this.triggerRect.set(rect);
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
