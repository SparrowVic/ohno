import { marker as t } from '@jsverse/transloco-keys-manager/marker';

/**
 * Per-algorithm catalog shared by the sorting Trace tab (short hint
 * at the top — step-accompanying teaching) and the sorting Info tab
 * (full tutorial — how it works, strengths, trade-offs).
 *
 * Keep entries beginner-friendly: plain language, short sentences,
 * one idea per bullet.
 */

export interface SortAlgorithmTutorial {
  /** Short family label shown as a badge in the Info tutorial card. */
  readonly pattern: string;
  /** One plain-language sentence describing the algorithm's pattern. */
  readonly keyIdea: string;
  /** One short sentence pointing the user at what to watch on the canvas. */
  readonly watch: string;
  /** Numbered steps describing how the algorithm proceeds. */
  readonly howItWorks: readonly string[];
  /** 2–3 sentences on when this algorithm shines. */
  readonly strengths: readonly string[];
  /** 2–3 sentences on when to avoid it / watch out. */
  readonly weaknesses: readonly string[];
}

const SORT_TUTORIAL_KEY = {
  bubbleSort: {
    pattern: t('features.algorithms.tutorials.sort.bubbleSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.bubbleSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.bubbleSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.bubbleSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.bubbleSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.bubbleSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.bubbleSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.bubbleSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.bubbleSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.bubbleSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.bubbleSort.weaknesses.item2'),
    },
  },
  selectionSort: {
    pattern: t('features.algorithms.tutorials.sort.selectionSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.selectionSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.selectionSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.selectionSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.selectionSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.selectionSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.selectionSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.selectionSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.selectionSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.selectionSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.selectionSort.weaknesses.item2'),
    },
  },
  insertionSort: {
    pattern: t('features.algorithms.tutorials.sort.insertionSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.insertionSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.insertionSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.insertionSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.insertionSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.insertionSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.insertionSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.insertionSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.insertionSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.insertionSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.insertionSort.weaknesses.item2'),
    },
  },
  mergeSort: {
    pattern: t('features.algorithms.tutorials.sort.mergeSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.mergeSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.mergeSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.mergeSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.mergeSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.mergeSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.mergeSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.mergeSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.mergeSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.mergeSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.mergeSort.weaknesses.item2'),
    },
  },
  quickSort: {
    pattern: t('features.algorithms.tutorials.sort.quickSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.quickSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.quickSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.quickSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.quickSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.quickSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.quickSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.quickSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.quickSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.quickSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.quickSort.weaknesses.item2'),
    },
  },
  heapSort: {
    pattern: t('features.algorithms.tutorials.sort.heapSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.heapSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.heapSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.heapSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.heapSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.heapSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.heapSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.heapSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.heapSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.heapSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.heapSort.weaknesses.item2'),
    },
  },
  radixSort: {
    pattern: t('features.algorithms.tutorials.sort.radixSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.radixSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.radixSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.radixSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.radixSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.radixSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.radixSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.radixSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.radixSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.radixSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.radixSort.weaknesses.item2'),
    },
  },
  countingSort: {
    pattern: t('features.algorithms.tutorials.sort.countingSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.countingSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.countingSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.countingSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.countingSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.countingSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.countingSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.countingSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.countingSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.countingSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.countingSort.weaknesses.item2'),
    },
  },
  shellSort: {
    pattern: t('features.algorithms.tutorials.sort.shellSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.shellSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.shellSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.shellSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.shellSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.shellSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.shellSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.shellSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.shellSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.shellSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.shellSort.weaknesses.item2'),
    },
  },
  timSort: {
    pattern: t('features.algorithms.tutorials.sort.timSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.timSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.timSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.timSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.timSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.timSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.timSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.timSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.timSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.timSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.timSort.weaknesses.item2'),
    },
  },
  bucketSort: {
    pattern: t('features.algorithms.tutorials.sort.bucketSort.pattern'),
    keyIdea: t('features.algorithms.tutorials.sort.bucketSort.keyIdea'),
    watch: t('features.algorithms.tutorials.sort.bucketSort.watch'),
    howItWorks: {
      step1: t('features.algorithms.tutorials.sort.bucketSort.howItWorks.step1'),
      step2: t('features.algorithms.tutorials.sort.bucketSort.howItWorks.step2'),
      step3: t('features.algorithms.tutorials.sort.bucketSort.howItWorks.step3'),
      step4: t('features.algorithms.tutorials.sort.bucketSort.howItWorks.step4'),
    },
    strengths: {
      item1: t('features.algorithms.tutorials.sort.bucketSort.strengths.item1'),
      item2: t('features.algorithms.tutorials.sort.bucketSort.strengths.item2'),
    },
    weaknesses: {
      item1: t('features.algorithms.tutorials.sort.bucketSort.weaknesses.item1'),
      item2: t('features.algorithms.tutorials.sort.bucketSort.weaknesses.item2'),
    },
  },
} as const;

export const SORT_ALGORITHM_TUTORIALS: Record<string, SortAlgorithmTutorial> = {
  'bubble-sort': {
    pattern: SORT_TUTORIAL_KEY.bubbleSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.bubbleSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.bubbleSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.bubbleSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.bubbleSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.bubbleSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.bubbleSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.bubbleSort.strengths.item1,
      SORT_TUTORIAL_KEY.bubbleSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.bubbleSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.bubbleSort.weaknesses.item2,
    ],
  },

  'selection-sort': {
    pattern: SORT_TUTORIAL_KEY.selectionSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.selectionSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.selectionSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.selectionSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.selectionSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.selectionSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.selectionSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.selectionSort.strengths.item1,
      SORT_TUTORIAL_KEY.selectionSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.selectionSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.selectionSort.weaknesses.item2,
    ],
  },

  'insertion-sort': {
    pattern: SORT_TUTORIAL_KEY.insertionSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.insertionSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.insertionSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.insertionSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.insertionSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.insertionSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.insertionSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.insertionSort.strengths.item1,
      SORT_TUTORIAL_KEY.insertionSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.insertionSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.insertionSort.weaknesses.item2,
    ],
  },

  'merge-sort': {
    pattern: SORT_TUTORIAL_KEY.mergeSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.mergeSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.mergeSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.mergeSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.mergeSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.mergeSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.mergeSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.mergeSort.strengths.item1,
      SORT_TUTORIAL_KEY.mergeSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.mergeSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.mergeSort.weaknesses.item2,
    ],
  },

  'quick-sort': {
    pattern: SORT_TUTORIAL_KEY.quickSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.quickSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.quickSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.quickSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.quickSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.quickSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.quickSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.quickSort.strengths.item1,
      SORT_TUTORIAL_KEY.quickSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.quickSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.quickSort.weaknesses.item2,
    ],
  },

  'heap-sort': {
    pattern: SORT_TUTORIAL_KEY.heapSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.heapSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.heapSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.heapSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.heapSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.heapSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.heapSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.heapSort.strengths.item1,
      SORT_TUTORIAL_KEY.heapSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.heapSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.heapSort.weaknesses.item2,
    ],
  },

  'radix-sort': {
    pattern: SORT_TUTORIAL_KEY.radixSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.radixSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.radixSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.radixSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.radixSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.radixSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.radixSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.radixSort.strengths.item1,
      SORT_TUTORIAL_KEY.radixSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.radixSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.radixSort.weaknesses.item2,
    ],
  },

  'counting-sort': {
    pattern: SORT_TUTORIAL_KEY.countingSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.countingSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.countingSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.countingSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.countingSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.countingSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.countingSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.countingSort.strengths.item1,
      SORT_TUTORIAL_KEY.countingSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.countingSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.countingSort.weaknesses.item2,
    ],
  },

  'shell-sort': {
    pattern: SORT_TUTORIAL_KEY.shellSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.shellSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.shellSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.shellSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.shellSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.shellSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.shellSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.shellSort.strengths.item1,
      SORT_TUTORIAL_KEY.shellSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.shellSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.shellSort.weaknesses.item2,
    ],
  },

  'tim-sort': {
    pattern: SORT_TUTORIAL_KEY.timSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.timSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.timSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.timSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.timSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.timSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.timSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.timSort.strengths.item1,
      SORT_TUTORIAL_KEY.timSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.timSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.timSort.weaknesses.item2,
    ],
  },

  'bucket-sort': {
    pattern: SORT_TUTORIAL_KEY.bucketSort.pattern,
    keyIdea: SORT_TUTORIAL_KEY.bucketSort.keyIdea,
    watch: SORT_TUTORIAL_KEY.bucketSort.watch,
    howItWorks: [
      SORT_TUTORIAL_KEY.bucketSort.howItWorks.step1,
      SORT_TUTORIAL_KEY.bucketSort.howItWorks.step2,
      SORT_TUTORIAL_KEY.bucketSort.howItWorks.step3,
      SORT_TUTORIAL_KEY.bucketSort.howItWorks.step4,
    ],
    strengths: [
      SORT_TUTORIAL_KEY.bucketSort.strengths.item1,
      SORT_TUTORIAL_KEY.bucketSort.strengths.item2,
    ],
    weaknesses: [
      SORT_TUTORIAL_KEY.bucketSort.weaknesses.item1,
      SORT_TUTORIAL_KEY.bucketSort.weaknesses.item2,
    ],
  },
};
