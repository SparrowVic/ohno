import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { AlgorithmItem } from '../../models/algorithm';
import { CodeLine, LogEntry } from '../../models/detail';
import { CodePanel } from '../code-panel/code-panel';
import { InfoPanel } from '../info-panel/info-panel';
import { LogPanel } from '../log-panel/log-panel';

type SideTabId = 'code' | 'info' | 'log';

interface SideTab {
  readonly id: SideTabId;
  readonly label: string;
}

const SIDE_TABS: readonly SideTab[] = [
  { id: 'code', label: 'Code' },
  { id: 'info', label: 'Info' },
  { id: 'log', label: 'Log' },
];

@Component({
  selector: 'app-side-panel',
  imports: [CodePanel, InfoPanel, LogPanel],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidePanel {
  readonly algorithm = input.required<AlgorithmItem>();
  readonly codeLines = input.required<readonly CodeLine[]>();
  readonly activeLineNumber = input<number | null>(null);
  readonly logEntries = input.required<readonly LogEntry[]>();

  readonly tabs = SIDE_TABS;

  private readonly activeTabState = signal<SideTabId>('code');
  readonly activeTab = this.activeTabState.asReadonly();

  selectTab(id: SideTabId): void {
    this.activeTabState.set(id);
  }
}
