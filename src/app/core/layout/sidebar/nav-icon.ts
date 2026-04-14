import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowDownWideShort,
  faCompass,
  faDiamond,
  faEllipsis,
  faFont,
  faHashtag,
  faList,
  faMagnifyingGlass,
  faShareNodes,
  faShapes,
  faSitemap,
  faTable,
} from '@fortawesome/pro-solid-svg-icons';

export type NavIconName =
  | 'browse'
  | 'sorting'
  | 'searching'
  | 'trees'
  | 'graphs'
  | 'dp'
  | 'strings'
  | 'geometry'
  | 'misc'
  | 'linear'
  | 'hashing'
  | 'specialized';

const ICON_MAP: Record<NavIconName, IconDefinition> = {
  browse: faCompass,
  sorting: faArrowDownWideShort,
  searching: faMagnifyingGlass,
  trees: faSitemap,
  graphs: faShareNodes,
  dp: faTable,
  strings: faFont,
  geometry: faShapes,
  misc: faEllipsis,
  linear: faList,
  hashing: faHashtag,
  specialized: faDiamond,
};

@Component({
  selector: 'app-nav-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent],
  template: `<fa-icon [icon]="icon()" />`,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        font-size: 12px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class NavIcon {
  readonly name = input.required<NavIconName>();
  readonly icon = computed<IconDefinition>(() => ICON_MAP[this.name()]);
}
