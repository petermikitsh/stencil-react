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

test('Generate new NPM package: fail when no name supplied', async () => {
  try {
    await require('../src/index.js');
  } catch (e) {
    expect(e.message).toMatch('No module supplied.');
  }
});


test('Generate new NPM package', async () => {
  jest.setTimeout(10000);
  process.argv.push('@anjuna/core');
  await require('../src/index.js');
});
