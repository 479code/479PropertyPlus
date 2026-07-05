module.exports = {
  root: true,
  extends: [require.resolve('@479property/config/eslint/nest')],
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
  ignorePatterns: ['dist', '.eslintrc.cjs', 'jest.config.js'],
};
