<div align="center">
  <img src="hero.png" height="250">
</div>

# stencil-react

Generate React Components ("bindings") from Stencil 1.x projects.

## Usage

Make sure your Stencil v1 component library (e.g, `@anjuna/core`) is installed as an npm dependency.

```
npm i stencil-react
stencil-react @anjuna/core --outDir dist
```

Your output directory will contain:

- A `package.json` file with `main`, `module`, and `types` fields
- An ES Module build of your React-wrapped Stencil components
- A CommonJS build of your React-wrapped Stencil components
- TypeScript types
- Source Maps

## Usage (In React)

The generated NPM package is the original, suffixed with `-react`.

All your Stencil Components will be exported from the main/module entry file. E.g., if you had a `Button` component:

```jsx
import { Button } from '@anjuna/core-react';
```

Custom properties, custom events, synthentic React events, and aria-attributes are all supported:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

const App = (
  <Button
    context="primary"
    anjBlur={(customBlurEvent) => { debugger; }}
    onClick={(syntheticReactClickEvent) => { debugger; }}
    aria-label="My ARIA Example"
  >
    Hello World
  </Button>
);

ReactDOM.render(<App />, document.body);
```
