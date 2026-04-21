import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Unified visualization container. Wraps every algorithm viz with a
 * flat dark surface — same language as the app's floating panels
 * and overlays — so the canvas and its header sit on a single
 * neutral ground instead of three colored sub-containers.
 *
 * Consumer layout:
 *   <app-viz-panel>
 *     <app-viz-header [phase]="..." [action]="..." />
 *     <svg class="canvas">…</svg>
 *   </app-viz-panel>
 *
 * Header is picked up by its selector slot and sits at the top; the
 * remaining projected content fills the rest. No gradients, no
 * atmospheric glows, no competing surfaces — focus belongs to the
 * visualization itself.
 */
@Component({
  selector: 'app-viz-panel',
  imports: [],
  templateUrl: './viz-panel.html',
  styleUrl: './viz-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VizPanel {}
