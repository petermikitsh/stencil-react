module.exports = {
  /**
   * These package.json fields are ignored and cannot be override
   */
  ignoredPkgJsonOverrideFields: [
    'main',
    'module',
    'types',
    'peerDependencies',
    'dependencies',
  ],
};
