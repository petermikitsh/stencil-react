#!/usr/bin/env node

const fs = require('fs-extra');
const mri = require('mri');
const path = require('path');
const outdent = require('outdent');
const uppercamelcase = require('uppercamelcase');
const componentToReact = require('./componentToReact');
const ts = require('typescript');
const { _: [moduleName], ...opts } = mri(process.argv.slice(2));
const outDir = opts['out-dir'] || 'dist';
const pkgBasePath = path.resolve('node_modules', moduleName);
const pkgJsonPath = path.resolve(pkgBasePath, 'package.json');
const pkgJson = require(pkgJsonPath);
// Compile stencil files so they can be read in NodeJS
require('@babel/register')({
  only: [pkgBasePath],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  cache: false
});

async function main() {
  const collectionPath = path.resolve(pkgBasePath, pkgJson.collection);
  const { entries } = require(collectionPath);
  let indexFile = '';
  const relativeFiles = [];

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
    relativeFiles.push('./dist/tsx/' + relativePath);
    indexFile += `export { ${exportName} } from './${relativePath.replace('.tsx', '')}';\n`
    await fs.ensureDir(writeDir);
    await fs.writeFile(writePath, reactComponent);
  });

  await Promise.all(transforms);
  await fs.writeFile('./dist/tsx/index.ts', indexFile);

  // Typescript file generation complete.
  // Now to make ES Modules.
  const files = ['./dist/tsx/index.ts', ...relativeFiles];
  const baseConfig = {
    target: ts.ScriptTarget.ES5,
    importHelpers: true,
    sourceMap: true
  };
  const esmProgram = ts.createProgram(files, {
    ...baseConfig,
    module: ts.ModuleKind.ESNext,
    outDir: 'dist/esm',
    declaration: true,
    declarationDir: 'dist/types'
  });
  esmProgram.emit();

  // Also, make CommonJS Modules.
  const cjsProgram = ts.createProgram(files, {
    ...baseConfig,
    module: ts.ModuleKind.CommonJS,
    outDir: 'dist/cjs'
  });
  cjsProgram.emit();

  // Make a package.json file
  await fs.writeFile('./dist/package.json', outdent`
  {
    "name": "${moduleName}-react",
    "description": "${moduleName} Stencil Components for React",
    "version": "${pkgJson.version}",
    "main": "./cjs/index.js",
    "module": "./esm/index.js",
    "types": "./types/index.d.ts",
    "peerDependencies": {
      "${moduleName}": "^${pkgJson.version}"
    }
  }
  `);

  // Lastly, cleanup the tsx folder
  await fs.remove('./dist/tsx');
}

main();
