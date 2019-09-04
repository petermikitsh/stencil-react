#!/usr/bin/env node

const fs = require('fs-extra');
const mri = require('mri');
const path = require('path');
const outdent = require('outdent');
const uppercamelcase = require('uppercamelcase');
const ts = require('typescript');
const componentToReact = require('./componentToReact');

const { _: [moduleName], ...opts } = mri(process.argv.slice(2));
if (!moduleName) {
  throw Error('No module supplied. See https://github.com/petermikitsh/stencil-react#usage');
}
const outDir = opts.outDir || 'dist';
const pkgBasePath = path.resolve('node_modules', moduleName);
const pkgJsonPath = path.resolve(pkgBasePath, 'package.json');
const pkgJson = require(pkgJsonPath);
// Compile stencil files so they can be read in NodeJS
require('@babel/register')({
  only: [pkgBasePath],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  cache: false,
});

async function main() {
  const collectionPath = path.resolve(pkgBasePath, pkgJson.collection);
  const collectionDir = path.dirname(collectionPath);
  const { entries } = require(collectionPath);
  let indexFile = '';
  const relativeFiles = [];

  const transforms = entries.map(async (entry) => {
    const entryPath = path.resolve(collectionDir, entry);
    const baseName = path.basename(entryPath, '.js');
    // Assume files named foo-bar.js have named export 'FooBar'
    const exportName = uppercamelcase(baseName);
    const componentClass = require(entryPath)[exportName];
    const reactComponent = componentToReact(componentClass);
    const writePath = path.resolve(outDir, 'tsx', entry).replace('.js', '.tsx');
    const writeDir = path.dirname(writePath);
    const relativePath = path.relative(outDir, path.resolve(outDir, entry));
    const absPath = path.resolve(outDir, relativePath);
    relativeFiles.push(absPath);
    indexFile += `export { ${exportName} } from './${relativePath.replace('.js', '')}';\n`;
    await fs.ensureDir(writeDir);
    await fs.writeFile(writePath, reactComponent);
  });

  await Promise.all(transforms);
  const indexPath = path.resolve(outDir, 'tsx/index.ts');
  await fs.writeFile(indexPath, indexFile);

  // Typescript file generation complete.
  // Now to make ES Modules.
  const files = [indexPath, ...relativeFiles];
  const baseConfig = {
    target: ts.ScriptTarget.ES5,
    importHelpers: true,
    sourceMap: true,
    jsx: ts.JsxEmit.React,
  };
  const esmProgram = ts.createProgram(files, {
    ...baseConfig,
    module: ts.ModuleKind.ESNext,
    outDir: path.resolve(outDir, 'esm'),
    declaration: true,
    declarationDir: path.resolve(outDir, 'types'),
  });
  esmProgram.emit();

  // Also, make CommonJS Modules.
  const cjsProgram = ts.createProgram(files, {
    ...baseConfig,
    module: ts.ModuleKind.CommonJS,
    outDir: path.resolve(outDir, 'cjs'),
  });
  cjsProgram.emit();

  // Make a package.json file
  const genPkgJsonPath = path.resolve(outDir, 'package.json');
  await fs.writeFile(genPkgJsonPath, outdent`
  {
    "name": "${moduleName}-react",
    "description": "${moduleName} Stencil Components for React",
    "version": "${pkgJson.version}",
    "main": "./cjs/index.js",
    "module": "./esm/index.js",
    "types": "./types/index.d.ts",
    "peerDependencies": {
      "${moduleName}": "^${pkgJson.version}"
    },
    "dependencies": {
      "tslib": "^${require('../package.json').devDependencies.tslib}"
    }
  }
  `);
}

module.exports = main();
