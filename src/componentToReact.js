const outdent = require('outdent');
const syntheticEvents = require('./syntheticEvents');

module.exports = (componentClass) => {
  const {
    is: customElementTag,
    properties,
    events,
    name: exportName
  } = componentClass;

  const quote = (str) => {
    const hasHyphen = str.indexOf('-') > -1;
    if (hasHyphen) {
      return `'${str}'`;
    }
    return str;
  }

  const iterate = (obj, mapFn, join) => {
    if (!obj) {
      return '';
    }
    return Object.entries(obj).map(mapFn).join(join || `\n${' '.repeat(2)}`);
  }

  return outdent`
    import React, { Component } from 'react';

    interface ${exportName}Props {
      ${iterate(properties, ([key, prop]) => (
        `${quote(prop.attribute || key)}?: ${prop.complexType.resolved.replace(/\"/g, "'")};`
      ))}
      ${iterate(events, ([key, prop]) => (
        `${quote(prop.method)}?: Function;`
      ))}
      [key: string]: any;
    }

    export class ${exportName} extends Component<${exportName}Props> {
      ref: React.RefObject<any>;
      properties: string[];
      events: string[];
      syntheticEvents: string[];

      constructor(props: ${exportName}Props) {
        super(props);
        this.ref = React.createRef();
        this.properties = [${iterate(
          properties,
          ([key, {attribute}]) => (`'${attribute || key}'`),
          ', '
        )}];
        this.events = [${iterate(
          events,
          ([key, {method}]) => (`'${method}'`),
          ', '
        )}];
        this.syntheticEvents = [${iterate(
          syntheticEvents,
          ([key, event]) => (`'${event}'`),
          ', '
        )}];
      }

      componentDidMount() {
        this.properties.forEach((property) => {
          const propertyValue = this.props[property];
          if (propertyValue) {
            this.ref.current[property] = propertyValue;
          }
        });

        this.events.forEach((event) => {
          const eventFn = this.props[event];
          if (eventFn) {
            this.ref.current.addEventListener(event, eventFn);
          }
        });
      }

      componentDidUpdate(prevProps: ${exportName}Props) {
        this.properties.forEach((property) => {
          const propertyValue = this.props[property];
          if (prevProps[property] !== propertyValue) {
            this.ref.current[property] = propertyValue;
          }
        });

        this.events.forEach((event) => {
          const prevEvent = prevProps[event];
          const currEvent = this.props[event];
          if (prevEvent !== event) {
            this.ref.current.removeEventListener(event, prevEvent);
            this.ref.current.addEventListener(event, currEvent);
          }
        });
      }

      render() {
        const synEvents = this.syntheticEvents.reduce((accumulator: { [s: string]: any; }, key) => {
          const handler = this.props[key];
          if (handler) {
            accumulator[key] = handler;
          }
          return accumulator;
        }, {});
        return React.createElement(
          '${customElementTag}',
          {
            ref: this.ref,
            ...synEvents
          },
          this.props.children
        );
      }
    }

  `;
}
