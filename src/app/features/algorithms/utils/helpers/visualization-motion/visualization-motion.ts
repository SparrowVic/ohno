export interface MotionProfile {
  readonly frameMs: number;
  readonly compareMs: number;
  readonly swapMs: number;
  readonly settleMs: number;
  readonly completeStepMs: number;
  readonly swapLiftPx: number;
}

type Pair = readonly [number, number] | null;

interface PulseOptions {
  readonly duration: number;
  readonly delay?: number;
  readonly scale?: number;
  readonly opacity?: readonly [number, number, number];
  readonly filter?: readonly [string, string, string];
  readonly easing?: string;
  readonly origin?: string;
}

const MOTION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function computePlaybackDelay(speed: number): number {
  const clamped = Math.max(1, Math.min(10, speed));
  return 500 - ((clamped - 1) / 9) * 480;
}

export function createMotionProfile(speed: number): MotionProfile {
  const frameMs = computePlaybackDelay(speed);
  return {
    frameMs,
    compareMs: clamp(frameMs * 0.48, 90, 220),
    swapMs: clamp(frameMs * 0.82, 140, 360),
    settleMs: clamp(frameMs * 0.68, 150, 320),
    completeStepMs: clamp(frameMs * 0.2, 18, 72),
    swapLiftPx: clamp(frameMs * 0.09, 14, 34),
  };
}

export function samePair(left: Pair, right: Pair): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  return left[0] === right[0] && left[1] === right[1];
}

export function findNewSorted(
  previous: readonly number[] | null | undefined,
  current: readonly number[],
): number[] {
  const previousSet = new Set(previous ?? []);
  return current.filter((index) => !previousSet.has(index));
}

export function cancelElementAnimations(target: Element): void {
  target.getAnimations().forEach((animation) => animation.cancel());
}

export function pulseSvgElement(target: SVGElement, options: PulseOptions): void {
  prepareSvgTarget(target, options.origin ?? 'center');
  cancelElementAnimations(target);
  const opacity = options.opacity ?? [1, 1, 1];
  const filter = options.filter ?? [
    'drop-shadow(0 0 0 transparent)',
    'drop-shadow(0 0 12px rgba(255,255,255,0.28))',
    'drop-shadow(0 0 0 transparent)',
  ];
  const scale = options.scale ?? 1.08;
  target.animate(
    [
      {
        transform: 'scale(1)',
        opacity: opacity[0],
        filter: filter[0],
      },
      {
        transform: `scale(${scale})`,
        opacity: opacity[1],
        filter: filter[1],
      },
      {
        transform: 'scale(1)',
        opacity: opacity[2],
        filter: filter[2],
      },
    ],
    {
      duration: options.duration,
      delay: options.delay ?? 0,
      easing: options.easing ?? MOTION_EASING,
    },
  );
}

export function pulseElement(target: HTMLElement, options: PulseOptions): void {
  target.style.transformOrigin = options.origin ?? 'center';
  cancelElementAnimations(target);
  const opacity = options.opacity ?? [1, 1, 1];
  const filter = options.filter ?? [
    'drop-shadow(0 0 0 transparent)',
    'drop-shadow(0 0 12px rgba(255,255,255,0.28))',
    'drop-shadow(0 0 0 transparent)',
  ];
  const scale = options.scale ?? 1.04;
  target.animate(
    [
      {
        transform: 'scale(1)',
        opacity: opacity[0],
        filter: filter[0],
      },
      {
        transform: `scale(${scale})`,
        opacity: opacity[1],
        filter: filter[1],
      },
      {
        transform: 'scale(1)',
        opacity: opacity[2],
        filter: filter[2],
      },
    ],
    {
      duration: options.duration,
      delay: options.delay ?? 0,
      easing: options.easing ?? MOTION_EASING,
    },
  );
}

function prepareSvgTarget(target: SVGElement, origin: string): void {
  target.style.transformBox = 'fill-box';
  target.style.transformOrigin = origin;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
