/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Resolve workspace packages from their TypeScript source so ts-jest compiles
  // them to CommonJS. Their published build is ESM ("type": "module"), which the
  // CommonJS Jest runtime cannot load directly.
  moduleNameMapper: {
    '^@479property/utils$': '<rootDir>/../../../packages/utils/src/index.ts',
    '^@479property/types$': '<rootDir>/../../../packages/types/src/index.ts',
  },
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
