import { describe, expect, it, vi } from 'vitest';

import {
  cancelElementAnimations,
  computePlaybackDelay,
  createMotionProfile,
  findNewSorted,
  pulseElement,
  pulseSvgElement,
  samePair,
} from './visualization-motion';

describe('visualization-motion', () => {
  it('clamps playback delay and derives bounded motion profiles', () => {
    expect(computePlaybackDelay(0)).toBe(500);
    expect(computePlaybackDelay(10)).toBe(20);
    expect(createMotionProfile(1)).toEqual({
      frameMs: 500,
      compareMs: 220,
      swapMs: 360,
      settleMs: 320,
      completeStepMs: 72,
      swapLiftPx: 34,
    });
    expect(createMotionProfile(10)).toEqual({
      frameMs: 20,
      compareMs: 90,
      swapMs: 140,
      settleMs: 150,
      completeStepMs: 18,
      swapLiftPx: 14,
    });
  });

  it('compares pairs and extracts newly sorted indices', () => {
    expect(samePair([1, 2], [1, 2])).toBe(true);
    expect(samePair([1, 2], [2, 1])).toBe(false);
    expect(samePair(null, [1, 2])).toBe(false);
    expect(findNewSorted([0, 2], [0, 1, 2, 4])).toEqual([1, 4]);
  });

  it('cancels running animations before pulsing html elements', () => {
    const target = document.createElement('div');
    const cancel = vi.fn();
    const animate = vi.fn();

    Object.defineProperty(target, 'getAnimations', {
      value: () => [{ cancel }],
      configurable: true,
    });
    Object.defineProperty(target, 'animate', {
      value: animate,
      configurable: true,
    });

    cancelElementAnimations(target);
    pulseElement(target, { duration: 180, scale: 1.12, origin: 'left center' });

    expect(cancel).toHaveBeenCalledTimes(2);
    expect(target.style.transformOrigin).toBe('left center');
    expect(animate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ transform: 'scale(1)' }),
        expect.objectContaining({ transform: 'scale(1.12)' }),
      ]),
      expect.objectContaining({ duration: 180 }),
    );
  });

  it('prepares svg targets before pulsing them', () => {
    const target = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    const cancel = vi.fn();
    const animate = vi.fn();

    Object.defineProperty(target, 'getAnimations', {
      value: () => [{ cancel }],
      configurable: true,
    });
    Object.defineProperty(target, 'animate', {
      value: animate,
      configurable: true,
    });

    pulseSvgElement(target, { duration: 120, origin: 'center' });

    expect(cancel).toHaveBeenCalled();
    expect(target.style.transformBox).toBe('fill-box');
    expect(target.style.transformOrigin).toBe('center');
    expect(animate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ transform: 'scale(1)' }),
        expect.objectContaining({ transform: 'scale(1.08)' }),
      ]),
      expect.objectContaining({ duration: 120 }),
    );
  });
});
