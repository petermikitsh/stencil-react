const rimraf = require('rimraf');
const path = require('path');

const componentToReact = require('../src/componentToReact');

beforeEach(() => {
  jest.resetModules();
});

test('Generate React Component from Web Component', () => {
  const componentClass = {
    is: 'anj-button',
    properties: {
      context: {
        type: 'string',
        complexType: {
          original: "'primary' | 'secondary' | 'text' | 'icon' | 'free'",
          // eslint-disable-next-line
          resolved: "\"free\" | \"icon\" | \"primary\" | \"secondary\" | \"text\"",
        },
        attribute: 'context',
      },
    },
    events: [
      {
        method: 'anjBlur',
        name: 'anjBlur',
        complexType: {
          original: 'void',
          resolved: 'void',
        },
      },
    ],
    name: 'Button',
  };
  const result = componentToReact(componentClass);
  expect(typeof result).toBe('string');
});

describe('CLI npm package generation', () => {
  /**
   * Clean up directories
   *
   * @param {string} dirs
   */
  function cleanup(...dirs) {
    dirs.forEach((dir) => rimraf.sync(path.resolve(__dirname, dir)));
  }

  cleanup(
    '../dist',
    '../test_output',
  );

  it('should fail when no name supplied', async () => {
    try {
      await require('../src/index.js');
    } catch (e) {
      expect(e.message).toMatch('No module supplied.');
    }
  });

  it('should generate package inside /dist if no --outDir provided', async () => {
    jest.setTimeout(20000);

    process.argv.push('@anjuna/core');
    await require('../src/index.js');
    process.argv.pop();

    const json = require(path.resolve(__dirname, '../dist/package.json'));
    expect(json.name).toBe('@anjuna/core-react');
  });

  it('should generate in correct directory if --outDir provided', async () => {
    jest.setTimeout(20000);

    process.argv.push('d3-stencil', '--outDir', 'test_output/outdir');
    await require('../src/index.js');
    process.argv.splice(-3, 3);

    const json = require(path.resolve(__dirname, '../test_output/outdir/package.json'));
    expect(json.name).toBe('d3-stencil-react');
  });

  it('should generate packge with correct package.json if --packageJson provided', async () => {
    jest.setTimeout(20000);

    process.argv.push(
      'd3-stencil',
      '--outDir',
      'test_output/packageJson',
      '--packageJson',
      JSON.stringify({
        name: 'd3-stencil-react-binding',
      }),
    );
    await require('../src/index.js');
    process.argv.splice(-5, 5);

    const json = require(path.resolve(__dirname, '../test_output/packageJson/package.json'));
    expect(json.name).toBe('d3-stencil-react-binding');
  });
});
