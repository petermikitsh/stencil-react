# stencil-react

Generate React Components ("bindings") from Stencil 1.x projects.

## Usage

Make sure your Stencil v1 component library (e.g, `@anjuna/core`) is installed as an npm dependency.

```
npm i stencil-react
stencil-react @anjuna/core --out-dir dist
```

Your output directory will contain:

- A `package.json` file with `main`, `module`, and `types` fields
- An ES Module build of your React-wrapped Stencil components
- A CommonJS build of your React-wrapped Stencil components
- TypeScript types
- Source Maps
