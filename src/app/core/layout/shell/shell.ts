import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { OhnoBankSidebar } from '../bank-sidebar/bank-sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, OhnoBankSidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {}
