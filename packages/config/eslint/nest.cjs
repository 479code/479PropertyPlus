/** ESLint config for NestJS backend. */
module.exports = {
  extends: ['./base.cjs'],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    // Decorator-heavy Nest code frequently uses classes with only decorated members.
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
