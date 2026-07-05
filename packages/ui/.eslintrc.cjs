module.exports = {
  root: true,
  extends: [require.resolve('@479property/config/eslint/react')],
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
};
