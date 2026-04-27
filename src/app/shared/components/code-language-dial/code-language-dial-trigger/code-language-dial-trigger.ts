import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { CodeLanguageDialItem, TriggerRect } from '../code-language-dial.types';

@Component({
  selector: 'app-code-language-dial-trigger',
  imports: [FaIconComponent],
  templateUrl: './code-language-dial-trigger.html',
  styleUrl: './code-language-dial-trigger.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeLanguageDialTrigger {
  readonly option = input.required<CodeLanguageDialItem>();
  readonly open = input.required<boolean>();
  readonly pulse = input.required<boolean>();
  readonly ariaLabel = input.required<string>();
  readonly toggle = output<void>();

  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('triggerBtn');

  measure(): TriggerRect | null {
    const element = this.triggerRef()?.nativeElement;
    if (!element) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }
}
