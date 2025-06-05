module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        requestAnimationFrame: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn'
    }
  },
  {
    files: ['tests/**'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        __dirname: 'readonly',
        require: 'readonly'
      }
    },
    rules: {}
  }
];
