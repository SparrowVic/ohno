import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { UiTag, UiTagModel } from '../ui-tag/ui-tag';

export type TableColumnKind = 'text' | 'mono' | 'number' | 'tag' | 'tags';
export type TableColumnAlign = 'start' | 'center' | 'end';
export type TableRowTone = 'default' | 'active' | 'success' | 'warning' | 'danger';
export type TableTagValue = UiTagModel | string | number | null | undefined;
export type TableTagsValue = readonly (UiTagModel | string | number)[];
export type TableCellValue =
  | string
  | number
  | TableTagValue
  | TableTagsValue
  | null
  | undefined;

export interface TableColumn {
  readonly id: string;
  readonly header?: string;
  readonly kind?: TableColumnKind;
  readonly width?: string;
  readonly align?: TableColumnAlign;
  readonly placeholder?: string;
}

export interface TableRow {
  readonly id: string | number;
  readonly tone?: TableRowTone;
  readonly ghost?: boolean;
  readonly cells: Readonly<Record<string, TableCellValue>>;
}

export interface TableLegendItem {
  readonly id: string | number;
  readonly tag?: UiTagModel | null;
  readonly label: string;
  readonly description?: string | null;
}

@Component({
  selector: 'app-table',
  imports: [UiTag],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table {
  readonly columns = input.required<readonly TableColumn[]>();
  readonly rows = input.required<readonly TableRow[]>();
  readonly showHeader = input(true);
  readonly stickyHeader = input(true);
  readonly density = input<'default' | 'compact'>('default');
  readonly emptyLabel = input('No rows');
  readonly legendItems = input<readonly TableLegendItem[]>([]);
  readonly legendLabel = input('Legend');

  readonly legendOpen = signal(false);

  cellKind(column: TableColumn): TableColumnKind {
    return column.kind ?? 'text';
  }

  cellAlign(column: TableColumn): TableColumnAlign {
    return column.align ?? 'start';
  }

  textValue(row: TableRow, column: TableColumn): string {
    const value = row.cells[column.id];

    if (value === null || value === undefined || value === '') {
      return column.placeholder ?? '—';
    }

    if (this.isTagList(value)) {
      return column.placeholder ?? '—';
    }

    if (this.isTagModel(value)) {
      const label = value.label;
      return label === null || label === undefined || label === ''
        ? column.placeholder ?? '—'
        : String(label);
    }

    return String(value);
  }

  tagValue(row: TableRow, column: TableColumn): UiTagModel | null {
    return this.normalizeTag(row.cells[column.id]);
  }

  tagsValue(row: TableRow, column: TableColumn): readonly UiTagModel[] {
    const value = row.cells[column.id];

    if (!this.isTagList(value)) {
      const tag = this.normalizeTag(value);
      return tag ? [tag] : [];
    }

    return value
      .map((tag) => this.normalizeTag(tag))
      .filter((tag): tag is UiTagModel => tag !== null);
  }

  trackTag(index: number, tag: UiTagModel): string | number {
    return tag.title ?? tag.ariaLabel ?? tag.label ?? index;
  }

  toggleLegend(): void {
    this.legendOpen.update((open) => !open);
  }

  private normalizeTag(value: TableCellValue): UiTagModel | null {
    if (value === null || value === undefined || value === '') return null;
    if (this.isTagList(value)) return null;

    if (this.isTagModel(value)) {
      return value;
    }

    return {
      label: value,
      tone: 'neutral',
      appearance: 'soft',
      size: 'sm',
    };
  }

  private isTagList(value: TableCellValue): value is TableTagsValue {
    return Array.isArray(value);
  }

  private isTagModel(value: TableCellValue): value is UiTagModel {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
