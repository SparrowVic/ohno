import { SortStep } from '../models/sort-step';
import { createArrayStep, prefixSorted } from './array-sort-step';

interface BucketEntry {
  readonly value: number;
  readonly originalIndex: number;
}

export function* bucketSortGenerator(input: readonly number[]): Generator<SortStep> {
  const arr = [...input];
  const size = arr.length;
  const min = Math.min(...arr, 0);
  const max = Math.max(...arr, 0);
  const bucketCount = Math.max(1, Math.ceil(Math.sqrt(Math.max(size, 1))));
  const bucketSpan = Math.max(1, Math.floor((max - min) / bucketCount) + 1);
  const buckets: BucketEntry[][] = Array.from({ length: bucketCount }, () => []);

  yield createArrayStep({
    array: arr,
    activeCodeLine: 1,
    description: `Start bucket sort (n=${size}, buckets=${bucketCount})`,
    boundary: 0,
    phase: 'init',
  });

  for (let index = 0; index < size; index++) {
    const value = arr[index];
    const bucketIndex = Math.min(bucketCount - 1, Math.floor((value - min) / bucketSpan));
    buckets[bucketIndex]?.push({ value, originalIndex: index });

    yield createArrayStep({
      array: arr,
      activeCodeLine: 5,
      description: `Place ${value} from index ${index} into bucket ${bucketIndex}.`,
      comparing: [index, index],
      boundary: 0,
      phase: 'compare',
    });
  }

  const output = [...arr];
  let writeIndex = 0;

  for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
    const bucket = buckets[bucketIndex];
    if (!bucket || bucket.length === 0) {
      continue;
    }

    yield createArrayStep({
      array: output,
      activeCodeLine: 8,
      description: `Sort bucket ${bucketIndex} locally before writing it back.`,
      comparing: [bucket[0]!.originalIndex, bucket[bucket.length - 1]!.originalIndex],
      sorted: prefixSorted(writeIndex),
      boundary: writeIndex,
      phase: 'compare',
    });

    for (let index = 1; index < bucket.length; index++) {
      const entry = bucket[index]!;
      let scan = index - 1;

      yield createArrayStep({
        array: output,
        activeCodeLine: 8,
        description: `Insert ${entry.value} into its sorted position inside bucket ${bucketIndex}.`,
        comparing: [bucket[scan]!.originalIndex, entry.originalIndex],
        sorted: prefixSorted(writeIndex),
        boundary: writeIndex,
        phase: 'compare',
      });

      while (scan >= 0 && bucket[scan]!.value > entry.value) {
        yield createArrayStep({
          array: output,
          activeCodeLine: 8,
          description: `Compare ${bucket[scan]!.value} with ${entry.value} inside bucket ${bucketIndex}.`,
          comparing: [bucket[scan]!.originalIndex, entry.originalIndex],
          sorted: prefixSorted(writeIndex),
          boundary: writeIndex,
          phase: 'compare',
        });

        bucket[scan + 1] = bucket[scan]!;
        scan--;
      }

      bucket[scan + 1] = entry;
    }

    for (const entry of bucket) {
      output[writeIndex] = entry.value;

      yield createArrayStep({
        array: output,
        activeCodeLine: 10,
        description: `Write ${entry.value} from bucket ${bucketIndex} into index ${writeIndex}.`,
        comparing: [writeIndex, writeIndex],
        sorted: prefixSorted(writeIndex + 1),
        boundary: writeIndex + 1,
        phase: 'pass-complete',
      });

      writeIndex++;
    }
  }

  yield createArrayStep({
    array: output,
    activeCodeLine: 13,
    description: 'Bucket sort complete.',
    sorted: prefixSorted(size),
    boundary: size,
    phase: 'complete',
  });
}
