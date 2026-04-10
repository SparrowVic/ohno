import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CodeLine, CodeTokenKind } from '../../models/detail';

@Component({
  selector: 'app-code-panel',
  imports: [],
  templateUrl: './code-panel.html',
  styleUrl: './code-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodePanel {
  readonly lines = input.required<readonly CodeLine[]>();
  readonly activeLineNumber = input<number | null>(null);

  tokenClass(kind: CodeTokenKind): string {
    return kind === 'text' ? '' : kind;
  }
}
