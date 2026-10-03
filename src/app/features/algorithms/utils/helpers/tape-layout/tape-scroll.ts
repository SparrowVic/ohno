import { prefersReducedMotion } from '../visualization-motion/visualization-motion';

const SCROLL_MARGIN = 24;

export function keepTapeFocusInView(track: HTMLElement, focus: HTMLElement | null): void {
  if (track.scrollWidth <= track.clientWidth) return;
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (!focus) return;
  const box = track.getBoundingClientRect();
  const rect = focus.getBoundingClientRect();
  const outLeft = rect.left < box.left + SCROLL_MARGIN;
  const outRight = rect.right > box.right - SCROLL_MARGIN;
  if (!outLeft && !outRight) return;
  const offset = rect.left + rect.width / 2 - (box.left + box.width / 2);
  track.scrollTo({ left: track.scrollLeft + offset, behavior });
}
