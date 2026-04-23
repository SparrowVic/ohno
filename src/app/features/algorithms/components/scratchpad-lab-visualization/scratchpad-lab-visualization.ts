import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { MathText } from '../../../../shared/components/math-text/math-text';
import {
  VizOptionDefinition,
  VizOptionsMenu,
} from '../../../../shared/components/viz-options-menu/viz-options-menu';
import { ScratchpadLabTraceState, ScratchpadMargin } from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetOption, VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';

/**
 * "Tablica" (chalkboard) canvas — renders a derivation line by line as
 * if a tutor were writing the proof out on a blackboard or a student's
 * notebook. Used as an alternative / primary view for math-heavy
 * algorithms where the registers dashboard answers "WHAT is in memory"
 * but fails at "WHY — what's the derivation we're following".
 *
 * View-options menu (gear icon in the header) exposes two toggles so
 * the student can dial the density:
 *   - `captions`     → show the step-title line above each entry
 *   - `instructions` → show the imperative tag (e.g. "Policz 48 mod
 *                      36") that pairs with each calculation
 * Preferences persist in localStorage under a single key so the
 * student keeps their choice across algorithms / sessions.
 */
@Component({
  selector: 'app-scratchpad-lab-visualization',
  imports: [I18nTextPipe, MathText, VizHeader, VizOptionsMenu, VizPanel, VizPresetPicker],
  templateUrl: './scratchpad-lab-visualization.html',
  styleUrl: './scratchpad-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScratchpadLabVisualization implements OnInit {
  protected readonly I18N_KEY = I18N_KEY;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  /** Scenario presets surfaced by the algorithm (e.g. Euclidean's
   *  coprime / shared / large pairs). Shared with the dashboard
   *  variant so toggling between views doesn't hide the choice. */
  readonly presetOptions = input<readonly VizPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();
  /** Optional hint input (reserved for future toggle-mode UX). */
  readonly variantHintKey = input<TranslatableText | null>(null);

  selectPreset(id: string): void {
    this.presetChange.emit(id);
  }

  readonly state = computed<ScratchpadLabTraceState | null>(
    () => this.step()?.scratchpadLab ?? null,
  );

  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decisionLabel ?? state.phaseLabel ?? '';
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const tone = this.state()?.tone ?? 'idle';
    switch (tone) {
      case 'setup':
        return 'default';
      case 'compute':
        return 'compare';
      case 'substitute':
        return 'swap';
      case 'decide':
        return 'settle';
      case 'conclude':
      case 'complete':
        return 'complete';
      default:
        return 'default';
    }
  });

  readonly marginsByAnchor = computed<Map<string | null, readonly ScratchpadMargin[]>>(() => {
    const map = new Map<string | null, ScratchpadMargin[]>();
    for (const margin of this.state()?.margins ?? []) {
      const key = margin.anchorLineId ?? null;
      const bucket = map.get(key);
      if (bucket) bucket.push(margin);
      else map.set(key, [margin]);
    }
    return map;
  });

  readonly globalMargins = computed<readonly ScratchpadMargin[]>(
    () => this.marginsByAnchor().get(null) ?? [],
  );

  marginsForLine(lineId: string): readonly ScratchpadMargin[] {
    return this.marginsByAnchor().get(lineId) ?? [];
  }

  /* --- View options (gear menu) --------------------------------- */

  private static readonly STORAGE_KEY = 'ohno:scratchpad-lab:options:v1';

  private readonly doc = inject(DOCUMENT);
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly showCaptions = signal(true);
  readonly showInstructions = signal(true);

  readonly vizOptions = computed<readonly VizOptionDefinition[]>(() => [
    {
      id: 'captions',
      label: I18N_KEY.features.algorithms.vizOptions.scratchpadLab.captionsLabel,
      description: I18N_KEY.features.algorithms.vizOptions.scratchpadLab.captionsDescription,
      checked: this.showCaptions(),
    },
    {
      id: 'instructions',
      label: I18N_KEY.features.algorithms.vizOptions.scratchpadLab.instructionsLabel,
      description:
        I18N_KEY.features.algorithms.vizOptions.scratchpadLab.instructionsDescription,
      checked: this.showInstructions(),
    },
  ]);

  constructor() {
    effect(() => {
      // Persist whenever either toggle flips.
      const state = {
        captions: this.showCaptions(),
        instructions: this.showInstructions(),
      };
      try {
        this.doc.defaultView?.localStorage.setItem(
          ScratchpadLabVisualization.STORAGE_KEY,
          JSON.stringify(state),
        );
      } catch {
        /* localStorage can be disabled — fall back to in-memory only. */
      }
    });

    // Auto-follow the current line. On long derivations (Extended
    // Euclidean easily runs 15+ lines) the current line falls off-viewport
    // as new lines append; without this the student has to scroll by
    // hand every step.
    effect(() => {
      const snapshot = this.state();
      if (!snapshot) return;
      const currentId = snapshot.lines.find((l) => l.state === 'current')?.id;
      if (!currentId) return;
      // Wait for the render commit before querying the DOM — the effect
      // fires with the new signal value but Angular hasn't flushed the
      // template yet, so a synchronous querySelector would resolve
      // against the previous snapshot's nodes.
      queueMicrotask(() => {
        const el = this.hostEl.nativeElement.querySelector<HTMLElement>(
          `[data-line-id="${CSS.escape(currentId)}"]`,
        );
        el?.scrollIntoView({
          block: 'nearest',
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
      });
    });
  }

  ngOnInit(): void {
    try {
      const raw = this.doc.defaultView?.localStorage.getItem(
        ScratchpadLabVisualization.STORAGE_KEY,
      );
      if (!raw) return;
      const parsed = JSON.parse(raw) as { captions?: boolean; instructions?: boolean };
      if (typeof parsed.captions === 'boolean') this.showCaptions.set(parsed.captions);
      if (typeof parsed.instructions === 'boolean')
        this.showInstructions.set(parsed.instructions);
    } catch {
      /* ignore — defaults hold. */
    }
  }

  onOptionChange(change: { id: string; checked: boolean }): void {
    if (change.id === 'captions') this.showCaptions.set(change.checked);
    else if (change.id === 'instructions') this.showInstructions.set(change.checked);
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
