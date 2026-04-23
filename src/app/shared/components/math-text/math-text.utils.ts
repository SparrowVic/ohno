const SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
  '₊': '+',
  '₋': '-',
  '₌': '=',
  '₍': '(',
  '₎': ')',
  'ₐ': 'a',
  'ₑ': 'e',
  'ₕ': 'h',
  'ᵢ': 'i',
  'ₖ': 'k',
  'ₗ': 'l',
  'ₘ': 'm',
  'ₙ': 'n',
  'ₒ': 'o',
  'ₚ': 'p',
  'ᵣ': 'r',
  'ₛ': 's',
  'ₜ': 't',
  'ᵤ': 'u',
  'ᵥ': 'v',
  'ₓ': 'x',
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
  '⁼': '=',
  '⁽': '(',
  '⁾': ')',
  'ⁿ': 'n',
  'ⁱ': 'i',
};

const SYMBOL_REPLACEMENTS: readonly [string, string][] = [
  ['α', '\\alpha'],
  ['β', '\\beta'],
  ['∞', '\\infty'],
  ['×', '\\times'],
  ['·', '\\cdot'],
  ['÷', '\\div'],
  ['≥', '\\ge'],
  ['≤', '\\le'],
  ['→', '\\to'],
  ['⊕', '\\oplus'],
  ['∅', '\\varnothing'],
  ['−', '-'],
  ['–', '-'],
];

export type MathRenderMode = 'auto' | 'math' | 'text';
export type MathTextVariant = 'default' | 'metric' | 'chip' | 'formula' | 'copy';

export function looksMathishContent(value: string): boolean {
  const normalized = value.trim();

  if (!normalized) return false;
  if (/#/.test(normalized)) return false;
  if (/[.!?]$/.test(normalized)) return false;
  if (normalized.length > 40 && /\s/.test(normalized)) return false;
  if ((normalized.match(/\s+/g)?.length ?? 0) >= 5 && !/[αβ∞√₀-₉₊₋₌]/u.test(normalized)) {
    return false;
  }

  return (
    /[αβ∞√×÷≥≤₀-₉₊₋₌₍₎ₐₑₕᵢₖₗₘₙₒₚᵣₛₜᵤᵥₓ]/u.test(normalized)
    || /[ΘΩ·⊕∅²³ⁿ]/u.test(normalized)
    || /^[A-Za-z]\([^()]*\)$/.test(normalized)
    || /^[A-Za-z]{2,}\([^()]*\)$/.test(normalized)
    || /^\d+!$/.test(normalized)
    || /^[A-Za-z]$/.test(normalized)
    || /^(?:O|Θ|Ω)\(/u.test(normalized)
    || /\b(?:acc|fib|gcd|mod|nwd|UCB|MAX|MIN|cross)\b/.test(normalized)
    || /[=+\-*/]/.test(normalized)
  );
}

export function autoTextToTex(value: string): string {
  let tex = convertUnicodeSuperscripts(convertUnicodeSubscripts(value.trim()));
  tex = tex.replaceAll('->', '\\to ');
  tex = normalizeAsciiPowers(tex);

  tex = tex.replace(/√\s*(\([^()]+\)|[A-Za-z0-9_{}+-]+)/g, (_match, rawInner: string) => {
    const inner =
      rawInner.startsWith('(') && rawInner.endsWith(')')
        ? rawInner.slice(1, -1)
        : rawInner;
    return `\\sqrt{${autoTextToTex(inner)}}`;
  });

  const complexityNotation = convertComplexityNotation(tex);
  if (complexityNotation) {
    return complexityNotation;
  }

  tex = tex
    .replace(/\bUCB\b(?!\s*\()/g, '\\mathrm{UCB}')
    .replace(/\bMAX\b(?!\s*\()/g, '\\mathrm{MAX}')
    .replace(/\bMIN\b(?!\s*\()/g, '\\mathrm{MIN}')
    .replace(/\bacc\b(?!\s*\()/g, '\\mathrm{acc}')
    .replace(/\bgcd\b(?!\s*\()/g, '\\gcd')
    .replace(/\bmin\b(?!\s*\()/g, '\\min')
    .replace(/\bmax\b(?!\s*\()/g, '\\max')
    .replace(/\blog\b(?!\s*\()/g, '\\log')
    .replace(/\bln\b(?!\s*\()/g, '\\ln')
    .replace(/\bnwd\b(?!\s*\()/g, '\\operatorname{nwd}')
    .replace(/\bmod\b(?!\s*\()/g, '\\operatorname{mod}')
    .replace(/%/g, '\\%');

  for (const [symbol, replacement] of SYMBOL_REPLACEMENTS) {
    tex = tex.replaceAll(symbol, replacement);
  }

  tex = tex.replace(
    /\\(alpha|beta)\(([^()]*)\)/g,
    (_match, name: string, rawArgs: string) => `\\${name}\\left(${autoTextToTex(rawArgs)}\\right)`,
  );

  tex = tex.replace(/(?<!\\)\b([A-Za-z]+)\(([^()]*)\)/g, (_match, name: string, rawArgs: string) => {
    const args = autoTextToTex(rawArgs);
    if (name.length === 1) return `${name}\\left(${args}\\right)`;
    if (name === 'gcd') return `\\gcd\\left(${args}\\right)`;
    if (name === 'min') return `\\min\\left(${args}\\right)`;
    if (name === 'max') return `\\max\\left(${args}\\right)`;
    if (name === 'log') return `\\log\\left(${args}\\right)`;
    if (name === 'ln') return `\\ln\\left(${args}\\right)`;
    if (name === 'nwd') return `\\operatorname{nwd}\\left(${args}\\right)`;
    return `\\operatorname{${name}}\\left(${args}\\right)`;
  });

  return tex;
}

export function escapePlainText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function convertUnicodeSubscripts(value: string): string {
  let out = '';

  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    let cursor = index + 1;
    let subscript = '';

    while (cursor < value.length) {
      const mapped = SUBSCRIPT_MAP[value[cursor]];
      if (!mapped) break;
      subscript += mapped;
      cursor++;
    }

    out += char;
    if (subscript) {
      out += `_{${subscript}}`;
      index = cursor - 1;
    }
  }

  return out;
}

function convertUnicodeSuperscripts(value: string): string {
  let out = '';

  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    let cursor = index + 1;
    let superscript = '';

    while (cursor < value.length) {
      const mapped = SUPERSCRIPT_MAP[value[cursor]];
      if (!mapped) break;
      superscript += mapped;
      cursor++;
    }

    out += char;
    if (superscript) {
      out += `^{${superscript}}`;
      index = cursor - 1;
    }
  }

  return out;
}

function normalizeAsciiPowers(value: string): string {
  return value.replace(/\^(\([^()]+\)|[A-Za-z0-9.+-]+)/g, (_match, rawExponent: string) => {
    const exponent =
      rawExponent.startsWith('(') && rawExponent.endsWith(')')
        ? rawExponent.slice(1, -1)
        : rawExponent;
    return `^{${autoTextToTex(exponent)}}`;
  });
}

function convertComplexityNotation(value: string): string | null {
  const trimmed = value.trim();
  const macro = complexityMacro(trimmed.charAt(0));

  if (!macro || trimmed.charAt(1) !== '(') {
    return null;
  }

  let depth = 0;
  let closingIndex = -1;

  for (let index = 1; index < trimmed.length; index++) {
    const char = trimmed.charAt(index);
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;

    if (depth === 0) {
      closingIndex = index;
      break;
    }
  }

  if (closingIndex < 0) {
    return null;
  }

  const inner = trimmed.slice(2, closingIndex);
  const suffix = trimmed.slice(closingIndex + 1).trim();

  return `${macro}\\left(${autoTextToTex(inner)}\\right)${complexitySuffixToTex(suffix)}`;
}

function complexityMacro(symbol: string): string | null {
  switch (symbol) {
    case 'O':
      return '\\mathsf{O}';
    case 'Θ':
      return '\\mathsf{\\Theta}';
    case 'Ω':
      return '\\mathsf{\\Omega}';
    default:
      return null;
  }
}

function complexitySuffixToTex(value: string): string {
  if (!value) return '';
  return `\\,\\text{${escapeTexText(value)}}`;
}

function escapeTexText(value: string): string {
  return value
    .replaceAll('\\', '\\textbackslash ')
    .replaceAll('{', '\\{')
    .replaceAll('}', '\\}')
    .replaceAll('%', '\\%');
}
