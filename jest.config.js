module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**.js',
  ],
  coverageReporters: [
    'lcov',
    'text-summary',
    'html',
  ],
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '/node_modules/(?!@anjuna/core).+\\.js$',
  ],
  verbose: true,
};
