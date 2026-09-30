import { MenuItem } from './menu.types';

export function nextMenuIndex(items: readonly MenuItem[], current: number, direction: -1 | 1): number {
  if (items.length === 0) return -1;
  let index = current === -1 && direction === -1 ? items.length : current;
  for (let attempt = 0; attempt < items.length; attempt += 1) {
    index = (index + direction + items.length) % items.length;
    if (!items[index].disabled) return index;
  }
  return -1;
}
