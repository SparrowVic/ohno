import type { ThemeRegistration } from 'shiki/core';

export const INSTRUMENT_CODE_THEME_NAME = 'instrument';

export const instrumentCodeTheme: ThemeRegistration = {
  name: INSTRUMENT_CODE_THEME_NAME,
  type: 'dark',
  fg: 'var(--code-fg)',
  bg: 'transparent',
  settings: [
    { settings: { foreground: 'var(--code-fg)', background: 'transparent' } },
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.quoted.docstring.multi'],
      settings: { foreground: 'var(--code-comment)' },
    },
    {
      scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'keyword.control'],
      settings: { foreground: 'var(--code-keyword)' },
    },
    {
      scope: ['keyword.operator', 'punctuation', 'meta.brace', 'punctuation.definition', 'punctuation.terminator'],
      settings: { foreground: 'var(--code-punct)' },
    },
    {
      scope: [
        'support.type',
        'support.type.primitive',
        'entity.name.type',
        'entity.other.inherited-class',
        'storage.type.primitive',
        'meta.type.annotation',
        'support.class',
      ],
      settings: { foreground: 'var(--code-type)' },
    },
    {
      scope: ['entity.name.function', 'meta.function-call entity.name.function', 'support.function'],
      settings: { foreground: 'var(--code-fn)', fontStyle: 'bold' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character', 'string', 'string.quoted', 'constant.other'],
      settings: { foreground: 'var(--code-value)' },
    },
    {
      scope: ['variable', 'variable.parameter', 'variable.other', 'meta.definition.variable'],
      settings: { foreground: 'var(--code-fg)' },
    },
  ],
};
