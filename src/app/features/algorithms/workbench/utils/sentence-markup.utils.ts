import { autoTextToTex, splitMathTextSegments } from '../../../../shared/components/math-text/math-text.utils';

export type SentencePart =
  | { readonly kind: 'html'; readonly html: string }
  | { readonly kind: 'tex'; readonly tex: string };

const NUMBER_PATTERN = /(?<![\w.-])-?\d+(?:\.\d+)?(?!\w)/g;
const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const TEX_SYMBOLS: Readonly<Record<string, string>> = {
  cdot: '·',
  times: '×',
  div: '÷',
  gcd: 'gcd',
  bmod: 'mod',
  mod: 'mod',
  equiv: '≡',
  varphi: 'φ',
  phi: 'φ',
  to: '→',
  rightarrow: '→',
  leftarrow: '←',
  Rightarrow: '⇒',
  Leftarrow: '⇐',
  omega: 'ω',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  lambda: 'λ',
  mu: 'μ',
  pi: 'π',
  sigma: 'σ',
  theta: 'θ',
  geq: '≥',
  ge: '≥',
  leq: '≤',
  le: '≤',
  neq: '≠',
  ne: '≠',
  approx: '≈',
  in: '∈',
  notin: '∉',
  prod: '∏',
  sum: '∑',
  nmid: '∤',
  mid: '∣',
  max: 'max',
  min: 'min',
  log: 'log',
  ln: 'ln',
  lfloor: '⌊',
  rfloor: '⌋',
  lceil: '⌈',
  rceil: '⌉',
  infty: '∞',
  pm: '±',
  cup: '∪',
  cap: '∩',
  emptyset: '∅',
  varnothing: '∅',
  subseteq: '⊆',
  subset: '⊂',
  oplus: '⊕',
  ldots: '…',
  dots: '…',
  cdots: '⋯',
  quad: ' ',
  qquad: ' ',
};

const BLACKBOARD: Readonly<Record<string, string>> = { Z: 'ℤ', N: 'ℕ', R: 'ℝ', Q: 'ℚ', C: 'ℂ' };

const SUPERSCRIPTS: Readonly<Record<string, string>> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', n: 'ⁿ', i: 'ⁱ', '(': '⁽', ')': '⁾',
};

const SUBSCRIPTS: Readonly<Record<string, string>> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', n: 'ₙ', m: 'ₘ', x: 'ₓ', '(': '₍', ')': '₎',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

export function markupSentence(text: string): string {
  return escapeHtml(text).replace(NUMBER_PATTERN, (match) => `<em>${match}</em>`);
}

function scriptOf(body: string, map: Readonly<Record<string, string>>, marker: string): string {
  const chars = [...body];
  return chars.every((char) => map[char] !== undefined) ? chars.map((char) => map[char]).join('') : `${marker}${body}`;
}

function bracedArgument(source: string, start: number): { readonly body: string; readonly end: number } | null {
  if (source[start] !== '{') return null;
  let depth = 0;
  for (let index = start; index < source.length; index++) {
    if (source[index] === '{') depth++;
    if (source[index] === '}') depth--;
    if (depth === 0) return { body: source.slice(start + 1, index), end: index + 1 };
  }
  return null;
}

function replaceCommandWithArguments(source: string, command: string, count: number, render: (args: readonly string[]) => string): string {
  const token = `\\${command}`;
  let output = '';
  let cursor = 0;
  while (cursor < source.length) {
    const found = source.indexOf(token, cursor);
    if (found < 0 || /[a-zA-Z]/.test(source[found + token.length] ?? '')) {
      if (found < 0) {
        output += source.slice(cursor);
        break;
      }
      output += source.slice(cursor, found + token.length);
      cursor = found + token.length;
      continue;
    }
    const args: string[] = [];
    let position = found + token.length;
    while (args.length < count) {
      while (source[position] === ' ') position++;
      const argument = bracedArgument(source, position);
      if (!argument) break;
      args.push(argument.body);
      position = argument.end;
    }
    if (args.length < count) {
      output += source.slice(cursor, position);
      cursor = position;
      continue;
    }
    output += source.slice(cursor, found) + render(args);
    cursor = position;
  }
  return output;
}

export function texToPlain(tex: string): string {
  let text = tex
    .replace(/\\(?:left|right)\./g, '')
    .replace(/\\left\s*[[(]\s*(\\begin\{(?:array|matrix)\})/g, '$1')
    .replace(/(\\end\{(?:array|matrix)\})\s*\\right\s*[\])]/g, '$1')
    .replace(/\\begin\{array\}\{[^}]*\}/g, '[')
    .replace(/\\end\{array\}/g, ']')
    .replace(/\\begin\{[a-z]*matrix\}/g, '[')
    .replace(/\\end\{[a-z]*matrix\}/g, ']')
    .replace(/\\left|\\right|\\big|\\Big|\\bigg|\\Bigg/g, '')
    .replace(/\\\\/g, '; ')
    .replace(/&/g, ' ');
  text = replaceCommandWithArguments(text, 'frac', 2, ([top, bottom]) => `(${top})/(${bottom})`);
  text = replaceCommandWithArguments(text, 'sqrt', 1, ([body]) => `√(${body})`);
  text = replaceCommandWithArguments(text, 'pmod', 1, ([body]) => ` (mod ${body})`);
  text = replaceCommandWithArguments(text, 'mathbb', 1, ([body]) => BLACKBOARD[body ?? ''] ?? body ?? '');
  for (const command of ['mathrm', 'text', 'textrm', 'textbf', 'mathbf', 'mathit', 'operatorname', 'boldsymbol']) {
    text = replaceCommandWithArguments(text, command, 1, ([body]) => body ?? '');
  }
  text = text
    .replace(/\\[;,:! ]/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, (match, name: string) => {
      const symbol = TEX_SYMBOLS[name];
      if (symbol === undefined) return name;
      return /^[a-z]+$/.test(symbol) ? ` ${symbol} ` : symbol;
    })
    .replace(/\^\{([^{}]*)\}/g, (_match, body: string) => scriptOf(body, SUPERSCRIPTS, '^'))
    .replace(/\^([0-9a-zA-Z+-])/g, (_match, body: string) => scriptOf(body, SUPERSCRIPTS, '^'))
    .replace(/_\{([^{}]*)\}/g, (_match, body: string) => scriptOf(body, SUBSCRIPTS, '_'))
    .replace(/_([0-9a-zA-Z])/g, (_match, body: string) => scriptOf(body, SUBSCRIPTS, '_'))
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/\s+([,;.])/g, '$1');
  return text.trim();
}

export function plainSentence(text: string): string {
  return splitMathTextSegments(text)
    .map((segment) => (segment.kind === 'math' ? texToPlain(segment.content) : segment.content))
    .join('')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function sentenceParts(text: string): readonly SentencePart[] {
  return splitMathTextSegments(text).map((segment): SentencePart =>
    segment.kind === 'math' ? { kind: 'tex', tex: autoTextToTex(segment.content) } : { kind: 'html', html: markupSentence(segment.content) },
  );
}
