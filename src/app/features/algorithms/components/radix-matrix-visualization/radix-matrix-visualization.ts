import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { SortStep } from '../../models/sort-step';
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

interface MatrixDigitCell {
  readonly value: string;
  readonly active: boolean;
}

interface MatrixRow {
  readonly id: string;
  readonly value: number;
  readonly digits: readonly MatrixDigitCell[];
  readonly active: boolean;
  readonly bucket: number | null;
  readonly order: number | null;
}

interface MatrixBucket {
  readonly bucket: number;
  readonly color: string;
  readonly active: boolean;
  readonly count: number;
  readonly values: readonly number[];
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
  selector: 'app-radix-matrix-visualization',
  imports: [],
  templateUrl: './radix-matrix-visualization.html',
  styleUrl: './radix-matrix-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadixMatrixVisualization {
  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly state = computed<RadixViewState>(() => createRadixViewState(this.step(), this.array()));
  readonly motion = computed(() => createMotionProfile(this.speed()));
  readonly digitBadges = computed<readonly RadixDigitBadge[]>(() =>
    createRadixDigitBadges(this.state().maxDigits, this.state().activeDigitIndex),
  );
  readonly digitGridColumns = computed(() => `repeat(${this.state().maxDigits}, minmax(0, 1fr))`);
  readonly phase = computed(() => phaseLabel(this.state().phase));
  readonly passLabel = computed(() => `Pass ${this.state().passNumber}/${this.state().maxDigits}`);
  readonly summary = computed(() => {
    const state = this.state();
    const activeValue = findActiveValue(state, state.activeItemId);
    if (state.phase === 'focus-digit' && state.activeDigitIndex !== null) {
      return `Digit matrix focused on the ${digitName(state.activeDigitIndex)}`;
    }
    if (state.phase === 'distribute' && activeValue !== null && state.activeBucket !== null) {
      return `${activeValue} mapped to bucket ${state.activeBucket}`;
    }
    if (state.phase === 'gather' && activeValue !== null && state.activeBucket !== null) {
      return `${activeValue} re-enters the stable output from bucket ${state.activeBucket}`;
    }
    return state.description;
  });
  readonly rows = computed<readonly MatrixRow[]>(() => {
    const state = this.state();
    const bucketLookup = new Map<string, number>();
    state.buckets.forEach((bucket) => {
      bucket.items.forEach((item) => bucketLookup.set(item.id, bucket.bucket));
    });
    const orderLookup = new Map<string, number>();
    state.items.forEach((item, index) => orderLookup.set(item.id, index));
    return state.sourceItems.map((item) => ({
      id: item.id,
      value: item.value,
      digits: digitsForValue(item.value, state.maxDigits).map((value, index) => ({
        value,
        active: state.activeDigitCharIndex === index,
      })),
      active: state.activeItemId === item.id,
      bucket: bucketLookup.get(item.id) ?? null,
      order: orderLookup.get(item.id) ?? null,
    }));
  });
  readonly buckets = computed<readonly MatrixBucket[]>(() => {
    const state = this.state();
    return state.buckets.map((bucket) => ({
      bucket: bucket.bucket,
      color: BUCKET_COLORS[bucket.bucket],
      active: state.activeBucket === bucket.bucket,
      count: bucket.items.length,
      values: bucket.items.map((item) => item.value),
    }));
  });
  readonly orderedValues = computed(() => this.state().items.map((item) => item.value));
}
