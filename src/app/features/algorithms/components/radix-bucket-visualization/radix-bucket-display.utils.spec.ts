import { describe, expect, it } from 'vitest';

import { radixSortGenerator } from '../../algorithms/radix-sort';
import { SortStep } from '../../models/sort-step';
import {
  RADIX_BUCKET_COUNT,
  RADIX_BUCKET_METRICS,
  RadixBucketLayout,
  RadixScene,
  radixBinRect,
  radixBinSlot,
  radixBucketLayout,
  radixCardFrame,
  radixCardMetrics,
  radixCardText,
  radixChipVisible,
  radixDigitAt,
  radixDigitCount,
  radixDigits,
  radixFlightPoint,
  radixGuide,
  radixGuidePath,
  radixLayoutFits,
  radixMaxLoad,
  radixMinCardWidth,
  radixOverflow,
  radixPlaceName,
  radixScene,
  radixStreamSlot,
  radixVisibleBinSlot,
  radixZoneChanges,
} from './radix-bucket-display.utils';

const VALUES = [170, 45, 75, 90, 802, 24, 2, 66];

function run(values: readonly number[] = VALUES): SortStep[] {
  return [...radixSortGenerator(values)];
}

function firstStep(steps: readonly SortStep[], phase: SortStep['phase'], digitIndex = 0): SortStep {
  const step = steps.find((item) => item.phase === phase && (item.digitIndex ?? 0) === digitIndex);
  if (!step) throw new Error(`no ${phase} step`);
  return step;
}

function streamValues(scene: RadixScene): number[] {
  return scene.cards
    .flatMap((card) => (card.placement.zone === 'stream' ? [{ slot: card.placement.slot, value: card.value }] : []))
    .sort((left, right) => left.slot - right.slot)
    .map((entry) => entry.value);
}

function layoutFor(scene: RadixScene, width = 826, height = 370): RadixBucketLayout {
  return radixBucketLayout({
    width,
    height,
    count: scene.slotCount,
    maxDigits: scene.maxDigits,
    maxLoad: scene.maxLoad,
  });
}

describe('radix bucket digits', () => {
  it('pads digits to the widest value and reads places like the generator', () => {
    expect(radixDigits(47, 3)).toEqual(['0', '4', '7']);
    expect(radixDigits(802, 3)).toEqual(['8', '0', '2']);
    expect(radixDigitAt(802, 0)).toBe(2);
    expect(radixDigitAt(802, 1)).toBe(0);
    expect(radixDigitAt(802, 2)).toBe(8);
    expect(radixDigitAt(47, 2)).toBe(0);
    expect(radixDigitCount(0)).toBe(1);
    expect(radixDigitCount(999)).toBe(3);
  });

  it('names the ones, tens and hundreds places and falls back to a power', () => {
    expect(radixPlaceName(0)).toBe('ones');
    expect(radixPlaceName(1)).toBe('tens');
    expect(radixPlaceName(2)).toBe('hundreds');
    expect(radixPlaceName(3)).toBe('power');
  });

  it('finds the fullest bucket over every pass', () => {
    expect(radixMaxLoad(VALUES, 3)).toBe(6);
    expect(radixMaxLoad([11, 21, 31, 41], 2)).toBe(4);
    expect(radixMaxLoad([1, 2, 3], 1)).toBe(1);
    expect(radixMaxLoad([], 3)).toBe(0);
  });
});

describe('radix bucket scene', () => {
  const steps = run();

  it('starts with every card in the input stream, idle and unlit', () => {
    const scene = radixScene(steps[0]!, VALUES);
    expect(scene.role).toBe('input');
    expect(scene.slotCount).toBe(VALUES.length);
    expect(scene.maxDigits).toBe(3);
    expect(scene.place).toBeNull();
    expect(scene.flight).toBeNull();
    expect(scene.cards.map((card) => card.placement)).toEqual(
      VALUES.map((_, slot) => ({ zone: 'stream', slot })),
    );
    expect(scene.cards.every((card) => card.tone === 'idle' && card.litIndex === null && card.full)).toBe(true);
    expect(scene.bins.every((bin) => bin.count === 0 && bin.tone === 'idle')).toBe(true);
  });

  it('falls back to the raw array before the first step arrives', () => {
    const scene = radixScene(null, [5, 40]);
    expect(scene.cards.map((card) => card.id)).toEqual(['rdx-0', 'rdx-1']);
    expect(scene.maxDigits).toBe(2);
    expect(scene.phase).toBe('idle');
  });

  it('lights the focused digit cyan on every card', () => {
    const scene = radixScene(firstStep(steps, 'focus-digit', 1), VALUES);
    expect(scene.place).toEqual({ exponent: 1, name: 'tens', tone: 'cyan' });
    expect(scene.cards.every((card) => card.litIndex === 1 && card.litTone === 'cyan')).toBe(true);
    expect(scene.cards.every((card) => card.tone === 'idle')).toBe(true);
  });

  it('sends the active card pink into its destination bin while the rest of the input waits', () => {
    const step = steps.filter((item) => item.phase === 'distribute' && item.digitIndex === 0)[2]!;
    const scene = radixScene(step, VALUES);
    const active = scene.cards.find((card) => card.active)!;
    expect(active.value).toBe(75);
    expect(active.tone).toBe('pink');
    expect(active.full).toBe(true);
    expect(active.litTone).toBe('pink');
    expect(active.placement).toEqual({ zone: 'bin', bucket: 5, index: 1 });
    expect(scene.bins[5]).toEqual({ bucket: 5, count: 2, tone: 'pink' });
    expect(scene.flight).toEqual({ kind: 'distribute', slot: 2, bucket: 5 });
    const waiting = scene.cards.filter((card) => card.placement.zone === 'stream');
    expect(waiting.map((card) => card.value)).toEqual([90, 802, 24, 2, 66]);
    expect(waiting.map((card) => card.placement)).toEqual([3, 4, 5, 6, 7].map((slot) => ({ zone: 'stream', slot })));
    expect(waiting.every((card) => card.litTone === 'cyan')).toBe(true);
    const parked = scene.cards.filter((card) => card.placement.zone === 'bin' && !card.active);
    expect(parked.every((card) => !card.full && card.tone === 'idle')).toBe(true);
  });

  it('gathers into the output stream and reads the source bin cyan', () => {
    const gathers = steps.filter((item) => item.phase === 'gather' && item.digitIndex === 0);
    const scene = radixScene(gathers[3]!, VALUES);
    const active = scene.cards.find((card) => card.active)!;
    expect(scene.role).toBe('output');
    expect(active.placement).toEqual({ zone: 'stream', slot: 3 });
    expect(active.tone).toBe('pink');
    expect(scene.flight).toEqual({ kind: 'gather', slot: 3, bucket: gathers[3]!.activeBucket! });
    expect(scene.bins[gathers[3]!.activeBucket!]!.tone).toBe('cyan');
    expect(streamValues(scene).map((value) => radixDigitAt(value, 0))).toEqual([0, 0, 2, 2]);
  });

  it('settles lime at the end of a pass and drops the lit digit at the end of the run', () => {
    const pass = radixScene(firstStep(steps, 'pass-complete', 0), VALUES);
    expect(pass.role).toBe('output');
    expect(pass.place).toEqual({ exponent: 0, name: 'ones', tone: 'lime' });
    expect(pass.cards.every((card) => card.tone === 'lime' && card.litTone === 'lime')).toBe(true);
    const done = radixScene(steps[steps.length - 1]!, VALUES);
    expect(done.phase).toBe('complete');
    expect(done.place).toBeNull();
    expect(done.cards.every((card) => card.tone === 'lime' && card.litIndex === null)).toBe(true);
    expect(streamValues(done)).toEqual([...VALUES].sort((left, right) => left - right));
  });

  it('places every card exactly once on every step of a run', () => {
    for (const values of [VALUES, [905, 14, 330, 761, 12, 499, 57, 802, 640, 233, 118, 999]]) {
      for (const step of run(values)) {
        const scene = radixScene(step, values);
        expect(scene.cards.length).toBe(values.length);
        const slots = scene.cards.flatMap((card) => (card.placement.zone === 'stream' ? [card.placement.slot] : []));
        expect(new Set(slots).size).toBe(slots.length);
        const binned = scene.cards.filter((card) => card.placement.zone === 'bin');
        expect(binned.length).toBe(scene.bins.reduce((sum, bin) => sum + bin.count, 0));
        expect(scene.cards.filter((card) => card.active).length).toBeLessThanOrEqual(1);
        expect(scene.bins.filter((bin) => bin.tone !== 'idle').length).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('radix bucket layout', () => {
  it('measures the narrowest card that still fits a Doto value at 14px', () => {
    expect(radixMinCardWidth(3)).toBeCloseTo(3 * 0.6 * 14 + RADIX_BUCKET_METRICS.cardPadX * 2);
    expect(radixMinCardWidth(1)).toBeGreaterThanOrEqual(RADIX_BUCKET_METRICS.cardPadX * 2 + 0.6 * 14);
  });

  it('keeps Doto at 14px or more and falls back to mono when a value cannot fit', () => {
    const wide = radixCardMetrics(54, 3);
    expect(wide.valueFont).toBe('dot');
    expect(wide.valueSize).toBe(RADIX_BUCKET_METRICS.dotMax);
    const narrow = radixCardMetrics(34, 3);
    expect(narrow.valueFont).toBe('dot');
    expect(narrow.valueSize).toBe(14);
    const fallback = radixCardMetrics(34, 5);
    expect(fallback.valueFont).toBe('mono');
    expect(fallback.valueSize).toBeGreaterThanOrEqual(RADIX_BUCKET_METRICS.monoMin);
    expect(wide.fullHeight).toBeGreaterThan(wide.compactHeight);
  });

  it('lines ten bins up on a wide stage and wraps them into two rows of five on a phone', () => {
    const wide = radixBucketLayout({ width: 826, height: 370, count: 18, maxDigits: 3, maxLoad: 5 });
    expect(wide.bins.columns).toBe(10);
    expect(wide.bins.rows).toBe(1);
    const phone = radixBucketLayout({ width: 272, height: 0, count: 18, maxDigits: 3, maxLoad: 5 });
    expect(phone.bins.columns).toBe(5);
    expect(phone.bins.rows).toBe(2);
    for (const layout of [wide, phone]) {
      const last = radixBinRect(layout, RADIX_BUCKET_COUNT - 1);
      expect(last.x + last.width).toBeLessThanOrEqual(layout.width + 0.01);
      expect(layout.card.width).toBeLessThanOrEqual(layout.bins.width - layout.bins.padding * 2);
    }
  });

  it('keeps the stream in one row while cards stay wide enough, then splits it evenly', () => {
    const eighteen = radixBucketLayout({ width: 826, height: 370, count: 18, maxDigits: 3, maxLoad: 5 });
    expect(eighteen.stream.columns).toBe(18);
    expect(eighteen.stream.rows).toBe(1);
    expect(eighteen.stream.x).toBeCloseTo(0);
    expect(eighteen.stream.width).toBeCloseTo(826);
    const twoRows = radixBucketLayout({ width: 652, height: 0, count: 18, maxDigits: 3, maxLoad: 5 });
    expect(twoRows.stream.gapX).toBeLessThanOrEqual(twoRows.card.width * RADIX_BUCKET_METRICS.streamGapRatio);
    expect(twoRows.stream.x).toBeGreaterThan(0);
    const twentyFour = radixBucketLayout({ width: 826, height: 370, count: 24, maxDigits: 3, maxLoad: 5 });
    expect(twentyFour.stream.columns).toBe(12);
    expect(twentyFour.stream.rows).toBe(2);
    const phone = radixBucketLayout({ width: 272, height: 0, count: 24, maxDigits: 3, maxLoad: 5 });
    expect(phone.stream.columns).toBe(6);
    expect(phone.stream.rows).toBe(4);
    for (const layout of [eighteen, twentyFour, phone]) {
      expect(layout.stream.x).toBeGreaterThanOrEqual(0);
      expect(layout.stream.x + layout.stream.width).toBeLessThanOrEqual(layout.width + 0.01);
      expect(layout.card.width).toBeGreaterThanOrEqual(radixMinCardWidth(3) - 1);
    }
  });

  it('reports a natural height that holds the fullest bucket with one spare slot', () => {
    const layout = radixBucketLayout({ width: 652, height: 0, count: 18, maxDigits: 3, maxLoad: 5 });
    expect(layout.height).toBe(layout.naturalHeight);
    expect(layout.bins.capacity).toBe(6);
    const last = radixBinRect(layout, RADIX_BUCKET_COUNT - 1);
    expect(last.y + last.height).toBeLessThanOrEqual(layout.naturalHeight);
    const crowded = radixBucketLayout({ width: 652, height: 0, count: 18, maxDigits: 3, maxLoad: 12 });
    expect(crowded.bins.capacity).toBe(RADIX_BUCKET_METRICS.naturalCapacityMax);
    const sparse = radixBucketLayout({ width: 652, height: 0, count: 12, maxDigits: 3, maxLoad: 1 });
    expect(sparse.bins.capacity).toBe(RADIX_BUCKET_METRICS.naturalCapacityMin);
  });

  it('tightens a phone layout so two rows of bins hold exactly the fullest bucket', () => {
    const natural = radixBucketLayout({ width: 272, height: 0, count: 18, maxDigits: 3, maxLoad: 6 });
    expect(natural.bins.capacity).toBe(6);
    expect(natural.card.valueSize).toBeGreaterThanOrEqual(14);
    const comfortable = radixBucketLayout({ width: 652, height: 0, count: 18, maxDigits: 3, maxLoad: 6 });
    expect(natural.bins.height).toBeLessThan(comfortable.bins.height);
    const measured = radixBucketLayout({ width: 272, height: natural.naturalHeight, count: 18, maxDigits: 3, maxLoad: 6 });
    expect(measured.bins.capacity).toBe(6);
    expect(measured.naturalHeight).toBe(natural.naturalHeight);
    const last = radixBinRect(measured, RADIX_BUCKET_COUNT - 1);
    expect(last.y + last.height).toBeLessThanOrEqual(natural.naturalHeight);
  });

  it('fits a given stage height, centres spare room and tightens spacing before overflowing', () => {
    const roomy = radixBucketLayout({ width: 826, height: 600, count: 18, maxDigits: 3, maxLoad: 5 });
    expect(roomy.bins.capacity).toBe(6);
    expect(roomy.stream.y).toBeGreaterThan(RADIX_BUCKET_METRICS.labelLine);
    const bottom = roomy.bins.y + roomy.bins.height;
    expect(bottom).toBeLessThanOrEqual(600);
    const tight = radixBucketLayout({ width: 722, height: 281, count: 18, maxDigits: 3, maxLoad: 6 });
    expect(tight.bins.capacity).toBeGreaterThanOrEqual(6);
    expect(tight.bins.y + tight.bins.height).toBeLessThanOrEqual(281);
    const cramped = radixBucketLayout({ width: 722, height: 200, count: 24, maxDigits: 3, maxLoad: 8 });
    expect(cramped.bins.capacity).toBe(RADIX_BUCKET_METRICS.minCapacity);
    const short = radixBucketLayout({ width: 722, height: 228, count: 24, maxDigits: 3, maxLoad: 7 });
    expect(radixLayoutFits(short)).toBe(true);
    expect(short.bins.capacity).toBe(RADIX_BUCKET_METRICS.minCapacity);
  });

  it('fits every deck size inside the stage from phone to desktop', () => {
    const stretched = (width: number, count: number, maxLoad: number) =>
      radixBucketLayout({ width, height: 0, count, maxDigits: 3, maxLoad }).naturalHeight + 40;
    const cases: [number, (count: number, maxLoad: number) => readonly number[]][] = [
      [272, (count, maxLoad) => [0, stretched(272, count, maxLoad)]],
      [652, (count, maxLoad) => [0, stretched(652, count, maxLoad)]],
      [880, (count, maxLoad) => [0, stretched(880, count, maxLoad)]],
      [722, () => [228, 281, 370, 600]],
      [826, () => [228, 270, 370, 600]],
    ];
    for (const [width, heightsFor] of cases) {
      for (const count of [12, 18, 24]) {
        for (const maxLoad of [2, 4, 6, 9]) {
          for (const height of heightsFor(count, maxLoad)) {
            const layout = radixBucketLayout({ width, height, count, maxDigits: 3, maxLoad });
            const label = `${width}x${height} n${count} load${maxLoad}`;
            expect(radixLayoutFits(layout), label).toBe(true);
            expect(layout.stream.x + layout.stream.width, label).toBeLessThanOrEqual(width + 0.01);
            const last = radixBinRect(layout, RADIX_BUCKET_COUNT - 1);
            expect(last.x + last.width, label).toBeLessThanOrEqual(width + 0.01);
            expect(layout.card.valueFont, label).toBe('dot');
            expect(layout.card.valueSize, label).toBeGreaterThanOrEqual(14);
            expect(layout.bins.capacity, label).toBeGreaterThanOrEqual(RADIX_BUCKET_METRICS.minCapacity);
          }
        }
      }
    }
  });

  it('places stream slots, bins and bin slots on the grid', () => {
    const layout = radixBucketLayout({ width: 826, height: 370, count: 24, maxDigits: 3, maxLoad: 5 });
    const first = radixStreamSlot(layout, 0);
    const wrap = radixStreamSlot(layout, layout.stream.columns);
    expect(first).toEqual({ x: layout.stream.x, y: layout.stream.y });
    expect(wrap.x).toBe(layout.stream.x);
    expect(wrap.y).toBe(layout.stream.y + layout.card.fullHeight + layout.stream.gapY);
    const bin = radixBinRect(layout, 3);
    expect(bin.x).toBeCloseTo(3 * (layout.bins.width + layout.bins.gapX));
    const slot = radixBinSlot(layout, 3, 2);
    expect(slot.x).toBeCloseTo(bin.x + (bin.width - layout.card.width) / 2);
    expect(slot.y).toBe(bin.y + layout.bins.header + 2 * layout.bins.pitch);
  });
});

describe('radix bucket overflow', () => {
  it('shows the head of a crowded bin and parks the rest under a counter', () => {
    expect(radixVisibleBinSlot(1, 3, 4, false)).toEqual({ slot: 1, hidden: false });
    expect(radixVisibleBinSlot(2, 6, 4, false)).toEqual({ slot: 2, hidden: false });
    expect(radixVisibleBinSlot(4, 6, 4, false)).toEqual({ slot: 3, hidden: true });
    expect(radixVisibleBinSlot(5, 6, 4, true)).toEqual({ slot: 3, hidden: false });
    expect(radixOverflow(3, 4)).toBe(0);
    expect(radixOverflow(6, 4)).toBe(3);
  });

  it('hides the counter while the active card sits on top of it', () => {
    const values = [11, 21, 31, 41, 51, 61];
    const steps = run(values);
    const crowded = steps.filter((step) => step.phase === 'distribute' && step.digitIndex === 0);
    const scene = radixScene(crowded[5]!, values);
    expect(radixChipVisible(scene, 1, 4)).toBe(false);
    const settled = radixScene(steps.find((step) => step.phase === 'gather' && step.digitIndex === 0)!, values);
    expect(radixChipVisible(settled, 1, 4)).toBe(true);
    expect(radixChipVisible(settled, 2, 4)).toBe(false);
    const layout = radixBucketLayout({ width: 826, height: 0, count: 6, maxDigits: 2, maxLoad: 6 });
    const tight = { ...layout, bins: { ...layout.bins, capacity: 4 } };
    const active = scene.cards.find((card) => card.active)!;
    const frame = radixCardFrame(tight, scene, active);
    expect(frame.hidden).toBe(false);
    expect(frame.y).toBe(radixBinSlot(tight, 1, 3).y);
    const parked = scene.cards.find((card) => card.value === 51)!;
    expect(radixCardFrame(tight, scene, parked).hidden).toBe(true);
  });
});

describe('radix bucket card frames and motion paths', () => {
  const steps = run();
  const scene = radixScene(steps.filter((step) => step.phase === 'distribute')[2]!, VALUES);
  const layout = layoutFor(scene);

  it('frames stream cards at full height and parked bin cards compact', () => {
    const waiting = scene.cards.find((card) => card.placement.zone === 'stream')!;
    const parked = scene.cards.find((card) => card.placement.zone === 'bin' && !card.active)!;
    const active = scene.cards.find((card) => card.active)!;
    expect(radixCardFrame(layout, scene, waiting)).toMatchObject({ height: layout.card.fullHeight, fullness: 1 });
    expect(radixCardFrame(layout, scene, parked)).toMatchObject({ height: layout.card.compactHeight, fullness: 0 });
    expect(radixCardFrame(layout, scene, active)).toMatchObject({ height: layout.card.fullHeight, fullness: 1, hidden: false });
  });

  it('centres a compact value and drops the digit row while the card is parked', () => {
    const metrics = layout.card;
    const compact = radixCardText(metrics, 3, metrics.compactHeight, 0);
    expect(compact.valueY).toBeCloseTo((metrics.compactHeight + metrics.valueCap) / 2);
    expect(compact.digitsOpacity).toBe(0);
    const full = radixCardText(metrics, 3, metrics.fullHeight, 1);
    expect(full.valueY).toBeCloseTo(metrics.padY + metrics.valueCap);
    expect(full.digitsOpacity).toBe(1);
    expect(full.digitXs[1]).toBeCloseTo(metrics.width / 2);
    expect(full.digitXs[2]! - full.digitXs[1]!).toBeCloseTo(metrics.digitPitch);
  });

  it('draws the guide from the emptied input slot to the top of the destination bin', () => {
    const guide = radixGuide(layout, scene)!;
    const slot = radixStreamSlot(layout, 2);
    const bin = radixBinRect(layout, 5);
    expect(guide.from).toEqual({ x: slot.x + layout.card.width / 2, y: slot.y + layout.card.fullHeight });
    expect(guide.to).toEqual({ x: bin.x + bin.width / 2, y: bin.y });
    expect(radixGuidePath(guide)).toMatch(/^M [\d.]+ [\d.]+ C /);
    const gather = radixScene(steps.find((step) => step.phase === 'gather')!, VALUES);
    const back = radixGuide(layout, gather)!;
    expect(back.from.y).toBe(radixBinRect(layout, gather.flight!.bucket).y);
    expect(radixGuide(layout, radixScene(steps[0]!, VALUES))).toBeNull();
  });

  it('flies along an S-curve that starts and ends on the frames', () => {
    const from = { x: 10, y: 20 };
    const to = { x: 200, y: 180 };
    expect(radixFlightPoint(from, to, 0)).toEqual(from);
    expect(radixFlightPoint(from, to, 1)).toEqual(to);
    const middle = radixFlightPoint(from, to, 0.5);
    expect(middle.x).toBeCloseTo(105);
    expect(middle.y).toBeCloseTo(100);
  });

  it('counts the cards that change zone between two scenes', () => {
    const before = radixScene(steps[0]!, VALUES);
    const firstMove = radixScene(steps.find((step) => step.phase === 'distribute')!, VALUES);
    expect(radixZoneChanges(before.cards, firstMove.cards)).toBe(1);
    expect(radixZoneChanges(before.cards, radixScene(firstStep(steps, 'pass-complete'), VALUES).cards)).toBe(0);
    const lastDistribute = steps.filter((step) => step.phase === 'distribute' && step.digitIndex === 0).pop()!;
    expect(radixZoneChanges(before.cards, radixScene(lastDistribute, VALUES).cards)).toBe(VALUES.length);
  });
});
