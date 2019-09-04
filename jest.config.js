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
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!(@anjuna/core|d3-stencil)).+\\.js$',
  ],
  verbose: true,
};
