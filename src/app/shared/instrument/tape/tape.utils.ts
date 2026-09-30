import { TapeRow } from './tape.types';

export function currentTapeIndex(rows: readonly TapeRow[]): number {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (rows[index].kind === 'event') return index;
  }
  return -1;
}
