import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import {
  closestRegionText,
  dividerText,
  lineEventText,
  sweepEventText,
  trailText,
  triangleVerticesText,
} from './geometry-labels.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;

describe('geometry-labels.utils', () => {
  it('maps recursion trail steps to keys', () => {
    expect(trailText('L')).toEqual({ key: GEO.trail.left, params: undefined });
    expect(trailText('merge')).toEqual({ key: GEO.trail.merge, params: undefined });
    expect(trailText('unknown')).toBe('unknown');
  });

  it('parses closest-pair region labels', () => {
    expect(closestRegionText('12 points on the plane')).toEqual({ key: GEO.region.points, params: { count: 12 } });
    expect(closestRegionText('x-sorted anchor: P3 … P9')).toEqual({ key: GEO.region.sorted, params: { first: 'P3', last: 'P9' } });
    expect(closestRegionText('root / L / R • 4 pts')).toEqual({ key: GEO.region.slice, params: { path: 'L / R', count: 4 } });
    expect(closestRegionText('root • 14 pts')).toEqual({ key: GEO.region.whole, params: { count: 14 } });
    expect(closestRegionText(null)).toBe('');
  });

  it('maps dividers and sweep events', () => {
    expect(dividerText('split')).toEqual({ key: GEO.divider.split, params: undefined });
    expect(lineEventText('Start S2')).toEqual({ key: GEO.events.start, params: { segment: 'S2' } });
    expect(lineEventText('Cross S1 · S3')).toEqual({ key: GEO.events.cross, params: { pair: 'S1 · S3' } });
    expect(sweepEventText('+R0')).toEqual({ key: GEO.events.enter, params: { rect: 'R0' } });
    expect(sweepEventText('−R4')).toEqual({ key: GEO.events.leave, params: { rect: 'R4' } });
  });

  it('spells triangle ids as point triples', () => {
    expect(triangleVerticesText('Δ1-4-7')).toBe('P1 · P4 · P7');
    expect(triangleVerticesText('mesh ready')).toBe('mesh ready');
  });
});
