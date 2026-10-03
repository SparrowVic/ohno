import { prefersReducedMotion } from '../visualization-motion/visualization-motion';

const SCROLL_MARGIN = 24;

interface TapeExtent {
  readonly left: number;
  readonly right: number;
}

function extentOf(elements: readonly HTMLElement[]): TapeExtent | null {
  if (elements.length === 0) return null;
  const rects = elements.map((element) => element.getBoundingClientRect());
  return { left: Math.min(...rects.map((rect) => rect.left)), right: Math.max(...rects.map((rect) => rect.right)) };
}

export function keepTapeFocusInView(track: HTMLElement, focus: HTMLElement | null, span: readonly HTMLElement[] = []): void {
  if (track.scrollWidth <= track.clientWidth) return;
  const box = track.getBoundingClientRect();
  const spanExtent = extentOf(span);
  const fitsSpan = spanExtent !== null && spanExtent.right - spanExtent.left <= box.width - 2 * SCROLL_MARGIN;
  const target = fitsSpan ? spanExtent : focus ? extentOf([focus]) : null;
  if (!target) return;
  const outLeft = target.left < box.left + SCROLL_MARGIN;
  const outRight = target.right > box.right - SCROLL_MARGIN;
  if (!outLeft && !outRight) return;
  const offset = (target.left + target.right) / 2 - (box.left + box.width / 2);
  track.scrollTo({ left: track.scrollLeft + offset, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
