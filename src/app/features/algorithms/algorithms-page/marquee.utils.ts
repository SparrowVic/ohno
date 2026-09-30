const DOTO_GLYPH_WIDTH_EM = 0.78;

export function marqueeFontSize(label: string, maxWidth = 600, maxSize = 58, minSize = 26): number {
  if (label.length === 0) return maxSize;
  const fitting = Math.floor(maxWidth / (DOTO_GLYPH_WIDTH_EM * label.length));
  return Math.max(minSize, Math.min(maxSize, fitting));
}
