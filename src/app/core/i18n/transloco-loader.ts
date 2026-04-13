import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Translation,
  TranslocoLoader,
} from '@jsverse/transloco';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly doc = inject(DOCUMENT);

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(new URL(`i18n/${lang}.json`, this.doc.baseURI).toString());
  }
}
