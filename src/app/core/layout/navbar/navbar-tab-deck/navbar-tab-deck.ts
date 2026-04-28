import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../i18n/i18n-keys';
import { NavTab, NavTabId } from '../../../models/navigation';
import { NavbarTabDeckItem } from './navbar-tab-deck-item/navbar-tab-deck-item';

@Component({
  selector: 'app-navbar-tab-deck',
  imports: [NavbarTabDeckItem, TranslocoPipe],
  templateUrl: './navbar-tab-deck.html',
  styleUrl: './navbar-tab-deck.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarTabDeck {
  protected readonly I18N_KEY = I18N_KEY;
  readonly tabs = input.required<readonly NavTab[]>();
  readonly activeTabId = input.required<NavTabId>();
}
