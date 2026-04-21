import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faLightbulb } from '@fortawesome/pro-solid-svg-icons';

import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

/**
 * Thin, reusable "trace hint" card used at the top of every
 * algorithm-family Trace tab (sort / graph / dsu / grid / matrix /
 * network). Carries two short lines — key idea + what to watch on
 * the canvas — plus a lightbulb icon. Fuller tutorials live in the
 * Info tab, so this card stays focused on step-accompanying
 * guidance.
 *
 * Takes the two strings as inputs and renders nothing when both are
 * empty, so consumers can bind optional fields without guarding in
 * their own templates.
 */
@Component({
  selector: 'app-trace-hint',
  imports: [FaIconComponent, SegmentedPanel, SegmentedPanelSection],
  templateUrl: './trace-hint.html',
  styleUrl: './trace-hint.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraceHint {
  readonly keyIdea = input<string | null>(null);
  readonly watch = input<string | null>(null);
  readonly lightbulbIcon = faLightbulb;
}
