import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

type StreamColor = 'cyan' | 'violet' | 'lime' | 'pink';
type StreamAxis = 'h' | 'v';

interface StreamSeed {
  readonly axis: StreamAxis;
  readonly rowOrCol: number;
  readonly length: number;
  readonly thickness: number;
  readonly color: StreamColor;
  readonly peakAlpha: number;
  readonly midAlpha: number;
  readonly duration: number;
  readonly delay: number;
  readonly reverse: boolean;
  readonly peakRange: readonly [number, number];
}

export interface BgStream {
  readonly id: number;
  readonly axis: StreamAxis;
  readonly rowOrCol: number;
  readonly length: number;
  readonly thickness: number;
  readonly color: StreamColor;
  readonly peakAlpha: number;
  readonly midAlpha: number;
  readonly duration: number;
  readonly delay: number;
  readonly reverse: boolean;
  readonly peakRange: readonly [number, number];
  readonly pathD: string;
  readonly gradientId: string;
  readonly gradientCx: number;
  readonly gradientCy: number;
  readonly gradientR: number;
  readonly viewBox: string;
  readonly width: number;
  readonly height: number;
}

const SEEDS: readonly StreamSeed[] = [
  { axis: 'h', rowOrCol:  96, length: 280, thickness: 4, color: 'cyan',   peakAlpha: 0.46, midAlpha: 0.14, duration:  9, delay:  -1, reverse: false, peakRange: [0.30, 0.72] },
  { axis: 'h', rowOrCol: 288, length: 320, thickness: 5, color: 'violet', peakAlpha: 0.44, midAlpha: 0.13, duration: 13, delay:  -3, reverse: true,  peakRange: [0.28, 0.70] },
  { axis: 'h', rowOrCol: 480, length: 240, thickness: 3, color: 'lime',   peakAlpha: 0.36, midAlpha: 0.10, duration: 11, delay:  -7, reverse: false, peakRange: [0.32, 0.68] },
  { axis: 'h', rowOrCol: 672, length: 300, thickness: 4, color: 'cyan',   peakAlpha: 0.40, midAlpha: 0.12, duration: 17, delay: -11, reverse: true,  peakRange: [0.30, 0.72] },
  { axis: 'h', rowOrCol: 768, length: 260, thickness: 3, color: 'pink',   peakAlpha: 0.32, midAlpha: 0.09, duration:  7, delay:  -2, reverse: false, peakRange: [0.32, 0.68] },
  { axis: 'h', rowOrCol: 960, length: 290, thickness: 4, color: 'violet', peakAlpha: 0.38, midAlpha: 0.11, duration: 19, delay: -13, reverse: true,  peakRange: [0.30, 0.72] },
  { axis: 'v', rowOrCol:  192, length: 280, thickness: 4, color: 'violet', peakAlpha: 0.42, midAlpha: 0.13, duration: 10, delay:  -1, reverse: false, peakRange: [0.30, 0.72] },
  { axis: 'v', rowOrCol:  480, length: 320, thickness: 5, color: 'cyan',   peakAlpha: 0.46, midAlpha: 0.14, duration: 16, delay:  -5, reverse: true,  peakRange: [0.28, 0.70] },
  { axis: 'v', rowOrCol:  768, length: 240, thickness: 3, color: 'lime',   peakAlpha: 0.34, midAlpha: 0.10, duration: 12, delay:  -8, reverse: false, peakRange: [0.32, 0.68] },
  { axis: 'v', rowOrCol: 1056, length: 280, thickness: 4, color: 'pink',   peakAlpha: 0.30, midAlpha: 0.09, duration:  8, delay:  -3, reverse: true,  peakRange: [0.30, 0.72] },
  { axis: 'v', rowOrCol: 1344, length: 300, thickness: 4, color: 'cyan',   peakAlpha: 0.40, midAlpha: 0.12, duration: 21, delay: -15, reverse: false, peakRange: [0.30, 0.72] },
  { axis: 'v', rowOrCol: 1632, length: 260, thickness: 3, color: 'violet', peakAlpha: 0.36, midAlpha: 0.11, duration: 14, delay:  -9, reverse: true,  peakRange: [0.28, 0.70] },
];

@Component({
  selector: 'ohno-bg-energy-layer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bg-energy-layer.html',
  styleUrl: './bg-energy-layer.scss',
})
export class BgEnergyLayer {
  protected readonly streams = signal<readonly BgStream[]>(SEEDS.map((seed, i) => buildStream(seed, i)));

  protected onIteration(id: number): void {
    this.streams.update((prev) => prev.map((s) => (s.id === id ? buildStream(s, id) : s)));
  }
}

function buildStream(seed: StreamSeed, id: number): BgStream {
  const peakOffset = randInRange(seed.peakRange[0], seed.peakRange[1]);
  const peakPx = peakOffset * seed.length;
  const thickness = Math.max(2, seed.thickness - 1);

  const isHorizontal = seed.axis === 'h';
  const pathD = isHorizontal
    ? leafPathHorizontal(seed.length, thickness, peakPx)
    : leafPathVertical(seed.length, thickness, peakPx);

  const reach = Math.max(peakOffset, 1 - peakOffset) * seed.length * 0.88;
  const gradientCx = isHorizontal ? peakPx : thickness / 2;
  const gradientCy = isHorizontal ? thickness / 2 : peakPx;

  const width = isHorizontal ? seed.length : thickness;
  const height = isHorizontal ? thickness : seed.length;

  return {
    id,
    axis: seed.axis,
    rowOrCol: seed.rowOrCol,
    length: seed.length,
    thickness,
    color: seed.color,
    peakAlpha: seed.peakAlpha,
    midAlpha: seed.midAlpha,
    duration: seed.duration,
    delay: seed.delay,
    reverse: seed.reverse,
    peakRange: seed.peakRange,
    pathD,
    gradientId: `bg-energy-grad-${id}`,
    gradientCx,
    gradientCy,
    gradientR: reach,
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
  };
}

function randInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function leafPathHorizontal(length: number, thickness: number, peakX: number): string {
  const halfT = thickness / 2;
  const leftSpan = peakX;
  const rightSpan = length - peakX;
  const peakSmooth = 0.5;

  return [
    `M 0 ${halfT}`,
    `C ${leftSpan * 0.2} ${halfT * 0.4} ${leftSpan * (1 - peakSmooth)} 0 ${peakX} 0`,
    `C ${peakX + rightSpan * peakSmooth} 0 ${length - rightSpan * 0.2} ${halfT * 0.4} ${length} ${halfT}`,
    `C ${length - rightSpan * 0.2} ${halfT * 1.6} ${peakX + rightSpan * peakSmooth} ${thickness} ${peakX} ${thickness}`,
    `C ${leftSpan * (1 - peakSmooth)} ${thickness} ${leftSpan * 0.2} ${halfT * 1.6} 0 ${halfT}`,
    'Z',
  ].join(' ');
}

function leafPathVertical(length: number, thickness: number, peakY: number): string {
  const halfT = thickness / 2;
  const upSpan = peakY;
  const downSpan = length - peakY;
  const peakSmooth = 0.5;

  return [
    `M ${halfT} 0`,
    `C ${halfT * 0.4} ${upSpan * 0.2} 0 ${upSpan * (1 - peakSmooth)} 0 ${peakY}`,
    `C 0 ${peakY + downSpan * peakSmooth} ${halfT * 0.4} ${length - downSpan * 0.2} ${halfT} ${length}`,
    `C ${halfT * 1.6} ${length - downSpan * 0.2} ${thickness} ${peakY + downSpan * peakSmooth} ${thickness} ${peakY}`,
    `C ${thickness} ${upSpan * (1 - peakSmooth)} ${halfT * 1.6} ${upSpan * 0.2} ${halfT} 0`,
    'Z',
  ].join(' ');
}
