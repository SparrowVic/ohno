import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface LangToggleOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'ohno-lang-toggle',
  templateUrl: './lang-toggle.html',
  styleUrl: './lang-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'label()',
  },
})
export class OhnoLangToggle {
  readonly value = input.required<string>();
  readonly options = input.required<readonly LangToggleOption[]>();
  readonly label = input.required<string>();

  readonly valueChange = output<string>();
}
