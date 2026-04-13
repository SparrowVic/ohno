const translocoConfig = {
  rootTranslationsPath: 'public/i18n',
  langs: ['pl', 'en'],
  keysManager: {
    input: ['src/app'],
    output: 'public/i18n',
    marker: 't',
    sort: true,
    addMissingKeys: true,
  },
};

export default translocoConfig;
