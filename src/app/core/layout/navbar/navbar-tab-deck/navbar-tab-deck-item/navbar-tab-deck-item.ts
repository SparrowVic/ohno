import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavTab } from '../../../../models/navigation';

@Component({
  selector: 'li[app-navbar-tab-deck-item]',
  imports: [RouterLink],
  templateUrl: './navbar-tab-deck-item.html',
  styleUrl: './navbar-tab-deck-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tab-deck-item',
    '[class.is-active]': 'active()',
    '[attr.data-tab-id]': 'tab().id',
  },
})
export class NavbarTabDeckItem {
  readonly tab = input.required<NavTab>();
  readonly active = input.required<boolean>();
}
