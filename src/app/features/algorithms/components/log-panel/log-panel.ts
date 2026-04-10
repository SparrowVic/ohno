import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LogEntry } from '../../models/detail';

@Component({
  selector: 'app-log-panel',
  imports: [],
  templateUrl: './log-panel.html',
  styleUrl: './log-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogPanel {
  readonly entries = input.required<readonly LogEntry[]>();
}
