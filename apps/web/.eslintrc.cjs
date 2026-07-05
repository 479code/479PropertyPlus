module.exports = {
  root: true,
  extends: [require.resolve('@479property/config/eslint/react')],
  parserOptions: {
    project: ['./tsconfig.app.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist', 'vite.config.ts', 'tailwind.config.ts', 'postcss.config.js'],
};
