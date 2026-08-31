module.exports = {
  testEnvironment: 'node', clearMocks: true, restoreMocks: true,
  collectCoverageFrom: ['controllers/**/*.js','services/**/*.js','middleware/**/*.js','jobs/**/*.js','utils/**/*.js'],
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } }
};
