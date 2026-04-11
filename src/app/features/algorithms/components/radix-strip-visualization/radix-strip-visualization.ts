import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { SortItemSnapshot, SortStep } from '../../models/sort-step';
import { createMotionProfile } from '../../utils/visualization-motion';
import {
  RadixDigitBadge,
  RadixViewState,
  createRadixDigitBadges,
  createRadixViewState,
  digitName,
  digitsForValue,
  findActiveValue,
  phaseLabel,
} from '../../utils/radix-visualization';

interface StripDigitCell {
  readonly value: string;
  readonly active: boolean;
}

interface StripCard {
  readonly id: string;
  readonly value: number;
  readonly digits: readonly StripDigitCell[];
  readonly active: boolean;
  readonly ghost: boolean;
  readonly settled: boolean;
}

interface StripBucket {
  readonly bucket: number;
  readonly color: string;
  readonly active: boolean;
  readonly items: readonly StripCard[];
}

const BUCKET_COLORS = [
  '#38bdf8',
  '#22d3ee',
  '#06b6d4',
  '#2dd4bf',
  '#34d399',
  '#a3e635',
  '#facc15',
  '#f59e0b',
  '#fb7185',
  '#f472b6',
] as const;

@Component({
  selector: 'app-radix-strip-visualization',
  imports: [],
  templateUrl: './radix-strip-visualization.html',
  styleUrl: './radix-strip-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadixStripVisualization {
  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly state = computed<RadixViewState>(() => createRadixViewState(this.step(), this.array()));
  readonly motion = computed(() => createMotionProfile(this.speed()));
  readonly digitBadges = computed<readonly RadixDigitBadge[]>(() =>
    createRadixDigitBadges(this.state().maxDigits, this.state().activeDigitIndex),
  );
  readonly phase = computed(() => phaseLabel(this.state().phase));
  readonly passLabel = computed(() => `Pass ${this.state().passNumber}/${this.state().maxDigits}`);
  readonly summary = computed(() => {
    const state = this.state();
    const activeValue = findActiveValue(state, state.activeItemId);
    if (state.phase === 'focus-digit' && state.activeDigitIndex !== null) {
      return `Scanning ${digitName(state.activeDigitIndex)}`;
    }
    if (state.phase === 'distribute' && activeValue !== null && state.activeBucket !== null) {
      return `Routing ${activeValue} into bucket ${state.activeBucket}`;
    }
    if (state.phase === 'gather' && activeValue !== null && state.activeBucket !== null) {
      return `Pulling ${activeValue} out of bucket ${state.activeBucket}`;
    }
    return state.description;
  });
  readonly scannerCards = computed<readonly StripCard[]>(() => {
    const state = this.state();
    const bucketIds = new Set<string>();
    state.buckets.forEach((bucket) => {
      bucket.items.forEach((item) => bucketIds.add(item.id));
    });
    const outputIds = new Set(state.items.map((item) => item.id));
    return state.sourceItems.map((item) =>
      this.createCard(
        item,
        state,
        state.phase === 'distribute' && bucketIds.has(item.id),
        state.phase === 'gather' && outputIds.has(item.id),
      ),
    );
  });
  readonly buckets = computed<readonly StripBucket[]>(() => {
    const state = this.state();
    return state.buckets.map((bucket) => ({
      bucket: bucket.bucket,
      color: BUCKET_COLORS[bucket.bucket],
      active: state.activeBucket === bucket.bucket,
      items: bucket.items.map((item) => this.createCard(item, state, false, false)),
    }));
  });
  readonly outputCards = computed<readonly StripCard[]>(() => {
    const state = this.state();
    return state.items.map((item) => this.createCard(item, state, false, true));
  });

  private createCard(
    item: SortItemSnapshot,
    state: RadixViewState,
    ghost: boolean,
    settled: boolean,
  ): StripCard {
    return {
      id: item.id,
      value: item.value,
      digits: digitsForValue(item.value, state.maxDigits).map((value, index) => ({
        value,
        active: state.activeDigitCharIndex === index,
      })),
      active: state.activeItemId === item.id,
      ghost,
      settled,
    };
  }
}
