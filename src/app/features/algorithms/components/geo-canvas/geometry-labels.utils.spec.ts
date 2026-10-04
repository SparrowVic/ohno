import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import {
  dividerText,
  lineEventText,
  sweepEventText,
  triangleVerticesText,
} from './geometry-labels.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;

describe('geometry-labels.utils', () => {
  it('maps dividers and sweep events', () => {
    expect(dividerText('split')).toEqual({ key: GEO.divider.split, params: undefined });
    expect(lineEventText('Start S2')).toEqual({ key: GEO.events.start, params: { segment: 'S2' } });
    expect(lineEventText('Cross S1 · S3')).toEqual({ key: GEO.events.cross, params: { pair: 'S1 · S3' } });
    expect(sweepEventText('+R0')).toEqual({ key: GEO.events.enter, params: { rect: 'R0' } });
    expect(sweepEventText('−R4')).toEqual({ key: GEO.events.leave, params: { rect: 'R4' } });
  });

  it('spells triangle ids as point triples', () => {
    expect(triangleVerticesText('Δ1-4-7')).toBe('P1 · P4 · P7');
    expect(triangleVerticesText({ key: 'k' })).toEqual({ key: 'k' });
  });
});
