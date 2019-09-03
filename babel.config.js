module.exports = (api) => {
  api.cache(false);
  return {
    plugins: [
      '@babel/plugin-transform-modules-commonjs',
    ],
  };
};
