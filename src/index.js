#!/usr/bin/env node

const fs = require('fs-extra');
const mri = require('mri');
const path = require('path');
const util = require('util');
const uppercamelcase = require('uppercamelcase');
const componentToReact = require('./componentToReact');
const typescript = require('typescript');
const { _: [moduleName], ...opts } = mri(process.argv.slice(2));
const outDir = opts['out-dir'] || 'dist';
const pkgBasePath = path.resolve('node_modules', moduleName);
// Compile stencil files so they can be read in NodeJS
require('@babel/register')({
  only: [pkgBasePath],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  cache: false
});

async function main() {
  const pkgJsonPath = path.resolve(pkgBasePath, 'package.json');
  const pkgJson = require(pkgJsonPath);
  const collectionPath = path.resolve(pkgBasePath, pkgJson.collection);
  const { entries } = require(collectionPath);
  let indexFile = '';

  const transforms = entries.map(async entry => {
    const entryPath = path.resolve(pkgBasePath, 'collection', entry);
    const baseName = path.basename(entryPath, '.js');
    // Assume files named foo-bar.js have named export 'FooBar'
    const exportName = uppercamelcase(baseName);
    const componentClass = require(entryPath)[exportName];
    const reactComponent = componentToReact(componentClass);
    const writePath = path.resolve(outDir, 'tsx', entry).replace('.js', '.tsx');
    const writeDir = path.dirname(writePath);
    const relativePath = path.relative(__dirname + '/../dist/tsx', writePath);
    indexFile += `export { ${exportName} } from './${relativePath.replace('.tsx', '')}';\n`
    await fs.ensureDir(writeDir);
    await fs.writeFile(writePath, reactComponent);
  });

  await Promise.all(transforms);
  await fs.writeFile('./dist/tsx/index.js', indexFile);

  // Typescript file generation complete.
  // Now to make ES Modules.
  // Also, make CommonJS Modules.
}

main();
