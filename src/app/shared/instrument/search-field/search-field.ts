import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { faMagnifyingGlass } from '@fortawesome/pro-regular-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { OhnoKbd } from '../kbd/kbd';

@Component({
  selector: 'ohno-search-field',
  imports: [FaIconComponent, OhnoKbd],
  templateUrl: './search-field.html',
  styleUrl: './search-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoSearchField {
  readonly placeholder = input.required<string>();
  readonly label = input.required<string>();
  readonly shortcut = input('⌘K');

  readonly open = output<void>();

  protected readonly icon = faMagnifyingGlass;
}
