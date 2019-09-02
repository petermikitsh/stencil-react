# stencil-react-bindings

Generate React Components ("bindings") from Stencil 1.x projects.

## Usage

Make sure your Stencil v1 component library is installed as an npm dependency.

```
npm i @anjuna/core --save-dev
```

Next, install `stencil-react-bindings` and supply the name of the NPM package with an optional `--out-dir` flag.

```
npm i stencil-react-bindings
srb @anjuna/core --out-dir dist
```

Your output directory will contain:

- A `package.json` file with `main`, `module`, and `types` fields
- A CommonJS Build of your React-wrapped Stencil components
- An ES Module Build of your React-wrapped Stencil components
- TypeScript bindings
