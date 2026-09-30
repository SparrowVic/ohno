import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, computed, inject, signal, untracked } from '@angular/core';

import { RecentEntry, parseRecentEntries, upsertRecent } from './recent-algorithms.utils';

const STORAGE_KEY = 'ohno:recent:v1';

@Injectable({ providedIn: 'root' })
export class RecentAlgorithmsStore {
  private readonly storage = inject(DOCUMENT).defaultView?.localStorage ?? null;
  private readonly entriesState = signal<readonly RecentEntry[]>(this.read());

  readonly entries: Signal<readonly RecentEntry[]> = this.entriesState.asReadonly();
  readonly finishedIds: Signal<ReadonlySet<string>> = computed(
    () => new Set(this.entries().filter((entry) => entry.finished).map((entry) => entry.id)),
  );

  touch(id: string): void {
    this.record({ id, step: 0, total: 0, finished: false });
  }

  record(entry: Omit<RecentEntry, 'updatedAt'>): void {
    const current = untracked(() => this.entriesState());
    const next = upsertRecent(current, { ...entry, updatedAt: Date.now() });
    this.entriesState.set(next);
    this.write(next);
  }

  private read(): readonly RecentEntry[] {
    try {
      return parseRecentEntries(this.storage?.getItem(STORAGE_KEY) ?? null);
    } catch {
      return [];
    }
  }

  private write(entries: readonly RecentEntry[]): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      return;
    }
  }
}
