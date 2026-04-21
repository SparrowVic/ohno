import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';

export type VizHeaderTone =
  | 'default'
  | 'compare'
  | 'swap'
  | 'sorted'
  | 'settle'
  | 'distribute'
  | 'complete';

/**
 * Compact header bar sitting at the top of every algorithm viz. Two
 * lines of text plus a single tone-coloured accent rail — nothing
 * else. Carries two semantic pieces:
 *
 *   - `phase` → a tiny mono-caps tag (e.g. "RELAX", "SCAN", "SETTLE")
 *     answering "what operation is happening right now?"
 *   - `action` → a single plain-language sentence (e.g. "Edge A → C
 *     improved dist[C] from 10 to 7") answering "what did THIS step
 *     do?"
 *
 * Both accept `TranslatableText` (plain string or i18n-key) and are
 * resolved by the shared `i18nText` pipe. An optional right-side
 * slot can host small contextual chips (focused-route path, etc.).
 *
 * The rail is the only chromatic element on the panel chrome — tone
 * is driven by the `tone` input. Everything else stays neutral so
 * the canvas owns the user's attention.
 */
@Component({
  selector: 'app-viz-header',
  imports: [I18nTextPipe],
  templateUrl: './viz-header.html',
  styleUrl: './viz-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VizHeader {
  readonly phase = input<TranslatableText | null>(null);
  readonly action = input<TranslatableText | null>(null);
  readonly tone = input<VizHeaderTone>('default');
}
