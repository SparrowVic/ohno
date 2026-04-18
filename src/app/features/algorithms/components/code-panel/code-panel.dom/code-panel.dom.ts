import { CodeRegion } from '../../../models/detail';

export function findClickedRegionId(event: MouseEvent): string | null {
  const target = event.target as HTMLElement | null;
  return target?.closest<HTMLButtonElement>('.code-panel__fold-toggle')?.dataset['regionId'] ?? null;
}

export function applyActiveLineHighlight(
  root: HTMLElement,
  previousLine: number | null,
  nextLine: number | null,
): number | null {
  if (previousLine !== null) {
    root
      .querySelector<HTMLElement>(`.code-panel__render-line[data-line="${previousLine}"]`)
      ?.classList.remove('code-panel__render-line--active');
  }

  if (nextLine !== null) {
    const nextElement = root.querySelector<HTMLElement>(`.code-panel__render-line[data-line="${nextLine}"]`);
    nextElement?.classList.add('code-panel__render-line--active');
    nextElement?.scrollIntoView({ block: 'nearest' });
  }

  return nextLine;
}

export function syncCodeRegionState(
  root: HTMLElement,
  regions: readonly CodeRegion[],
  collapsedRegionIds: ReadonlySet<string>,
): void {
  const document = root.ownerDocument;
  const lines = [...root.querySelectorAll<HTMLElement>('.code-panel__render-line')];
  const lineMap = new Map<number, HTMLElement>();

  for (const line of lines) {
    const number = Number(line.dataset['line']);
    lineMap.set(number, line);
    line.classList.remove(
      'code-panel__render-line--foldable',
      'code-panel__render-line--collapsed',
      'code-panel__render-line--hidden',
    );
    line.querySelectorAll('.code-panel__fold-toggle, .code-panel__fold-summary').forEach((node) => node.remove());
  }

  const hiddenLines = new Set<number>();
  for (const region of regions) {
    if (!collapsedRegionIds.has(region.id)) {
      continue;
    }

    for (let line = region.startLine + 1; line <= region.endLine; line += 1) {
      hiddenLines.add(line);
    }
  }

  for (const lineNumber of hiddenLines) {
    lineMap.get(lineNumber)?.classList.add('code-panel__render-line--hidden');
  }

  for (const region of regions) {
    if (region.endLine <= region.startLine) {
      continue;
    }

    const header = lineMap.get(region.startLine);
    if (!header) {
      continue;
    }

    const collapsed = collapsedRegionIds.has(region.id);
    header.classList.add('code-panel__render-line--foldable');
    if (collapsed) {
      header.classList.add('code-panel__render-line--collapsed');
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'code-panel__fold-toggle';
    toggle.dataset['regionId'] = region.id;
    toggle.setAttribute('aria-label', collapsed ? 'Expand code region' : 'Collapse code region');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.innerHTML =
      '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2.5L8 6 4 9.5"/></svg>';
    header.prepend(toggle);

    if (collapsed) {
      const summary = document.createElement('span');
      summary.className = 'code-panel__fold-summary';
      summary.textContent = `… ${region.endLine - region.startLine} lines`;
      header.append(summary);
    }
  }
}
