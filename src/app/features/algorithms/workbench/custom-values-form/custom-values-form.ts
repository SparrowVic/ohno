import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { isI18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoKey } from '../../../../shared/instrument/key/key';
import { TaskInputField, TaskInputSchema } from '../../models/task';
import {
  collectCustomValues,
  parseFieldText,
  seedFieldText,
  validateFieldValue,
} from '../utils/custom-values.utils';

interface CustomField {
  readonly key: string;
  readonly kind: TaskInputField<unknown>['kind'];
  readonly label: string;
  readonly placeholder: string;
  readonly text: string;
  readonly error: string | null;
  readonly inputId: string;
}

let formSequence = 0;

@Component({
  selector: 'ohno-custom-values-form',
  imports: [OhnoEngraving, OhnoKey, TranslocoPipe],
  templateUrl: './custom-values-form.html',
  styleUrl: './custom-values-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoCustomValuesForm {
  readonly schema = input.required<TaskInputSchema<Record<string, unknown>>>();
  readonly initialValues = input.required<Record<string, unknown>>();
  readonly validate = input<((values: Record<string, unknown>) => TranslatableText | null) | null>(null);
  readonly apply = output<Record<string, unknown>>();
  readonly cancel = output<void>();

  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly formId = `ohno-custom-values-${formSequence++}`;
  private readonly texts = signal<Readonly<Record<string, string>>>({});

  protected readonly I18N_KEY = I18N_KEY;

  protected readonly fields = computed<readonly CustomField[]>(() => {
    const texts = this.texts();
    return Object.entries(this.schema()).map(([key, field]) => {
      const text = texts[key] ?? '';
      const error = text === '' ? null : validateFieldValue(field, parseFieldText(field, text));
      return {
        key,
        kind: field.kind,
        label: this.resolve(field.label),
        placeholder: field.kind === 'list' || field.placeholder === undefined ? '' : this.resolve(field.placeholder),
        text,
        error: error === null ? null : this.resolve(error),
        inputId: `${this.formId}-${key}`,
      };
    });
  });

  protected readonly values = computed(() => collectCustomValues(this.schema(), this.texts()));
  protected readonly crossError = computed(() => {
    const validator = this.validate();
    const values = this.values();
    if (!validator || !values) return null;
    const error = validator(values);
    return error === null ? null : this.resolve(error);
  });
  protected readonly canApply = computed(() => this.values() !== null && this.crossError() === null);

  constructor() {
    effect(() => {
      const seed = this.initialValues();
      const schema = this.schema();
      this.texts.set(
        Object.fromEntries(Object.entries(schema).map(([key, field]) => [key, seedFieldText(field, seed[key])])),
      );
    });
  }

  protected update(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.texts.update((texts) => ({ ...texts, [key]: value }));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const values = this.values();
    if (!values || !this.canApply()) return;
    this.apply.emit(values);
  }

  protected inputMode(kind: TaskInputField<unknown>['kind']): string {
    return kind === 'int' || kind === 'float' ? 'decimal' : 'text';
  }

  private resolve(text: TranslatableText): string {
    this.language.activeLang();
    if (isI18nText(text)) return this.transloco.translate(text.key, text.params);
    return looksLikeI18nKey(text) ? this.transloco.translate(text) : text;
  }
}
