module.exports = {
  root: true,
  extends: [require.resolve('@479property/config/eslint/base')],
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
};
