import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type UiTagTone =
  | 'neutral'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'ultra-hard'
  | 'accent'
  | 'window'
  | 'route'
  | 'warning'
  | 'danger'
  | 'success'
  | 'hit';

export type UiTagAppearance = 'soft' | 'outline' | 'solid' | 'ghost';
export type UiTagSize = 'sm' | 'md';
export type UiTagShape = 'pill' | 'icon';

export interface UiTagModel {
  readonly label?: string | number | null;
  readonly icon?: IconDefinition | null;
  readonly title?: string | null;
  readonly ariaLabel?: string | null;
  readonly tone?: UiTagTone;
  readonly appearance?: UiTagAppearance;
  readonly size?: UiTagSize;
  readonly shape?: UiTagShape;
  readonly mono?: boolean;
  readonly uppercase?: boolean;
  readonly ghost?: boolean;
}

@Component({
  selector: 'app-ui-tag',
  imports: [FaIconComponent],
  templateUrl: './ui-tag.html',
  styleUrl: './ui-tag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTag {
  readonly label = input<string | number | null>(null);
  readonly icon = input<IconDefinition | null>(null);
  readonly title = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly tone = input<UiTagTone>('neutral');
  readonly appearance = input<UiTagAppearance>('soft');
  readonly size = input<UiTagSize>('sm');
  readonly shape = input<UiTagShape>('pill');
  readonly mono = input(false);
  readonly uppercase = input(false);
  readonly ghost = input(false);

  readonly resolvedAriaLabel = computed(() => {
    const ariaLabel = this.ariaLabel();
    if (ariaLabel) return ariaLabel;

    const title = this.title();
    if (title) return title;

    const label = this.label();
    return label !== null && label !== undefined ? String(label) : null;
  });

  readonly hasLabel = computed(() => {
    const label = this.label();
    return label !== null && label !== undefined && String(label).length > 0;
  });
}
