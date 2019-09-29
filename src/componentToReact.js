const outdent = require('outdent');

module.exports = (componentClass) => {
  const {
    is: customElementTag,
    properties,
    events,
    name: exportName,
  } = componentClass;

  const quote = (str) => {
    const hasHyphen = str.indexOf('-') > -1;
    if (hasHyphen) {
      return `'${str}'`;
    }
    return str;
  };

  const iterate = (obj, mapFn, join) => {
    if (!obj) {
      return '';
    }
    return Object.entries(obj).map(mapFn).join(join || `\n${' '.repeat(2)}`);
  };

  return outdent`
    import React, { Component } from 'react';

    interface ${exportName}Props {
      ${iterate(properties, ([key, prop]) => (
        `${quote(key)}?: ${prop.complexType.resolved.replace(/"/g, "'")};`
      ))}
      ${iterate(events, ([, prop]) => (
        `${quote(prop.method)}?: Function;`
      ))}
      [key: string]: any;
    }

    export class ${exportName} extends Component<${exportName}Props> {
      ref: React.RefObject<any>;
      properties: string[];
      events: string[];

      constructor(props: ${exportName}Props) {
        super(props);
        this.ref = React.createRef();
        this.properties = [${iterate(
          properties,
          ([key]) => (`'${key}'`),
          ', ',
        )}];
        this.events = [${iterate(
          events,
          ([, { method }]) => (`'${method}'`),
          ', ',
        )}];
      }

      componentDidMount() {
        this.properties.forEach((property) => {
          const propertyValue = this.props[property];
          this.ref.current[property] = propertyValue;
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
          this.ref.current[property] = propertyValue;
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
        /* Pass all other props, e.g., React Synthetic Events like 'onClick'
         * or aria attrs like 'aria-label' to custom element
         */
        const others = Object.keys(this.props).reduce((accumulator: { [s: string]: any; }, key) => {
          const isAria = key.indexOf('aria-') === 0;
          const notCustomProperty = this.properties.indexOf(key) === -1;
          const notCustomEvent = this.events.indexOf(key) === -1;
          if (isAria || notCustomProperty && notCustomEvent) {
            accumulator[key] = this.props[key];
          }
          return accumulator;
        }, {});
        return <${customElementTag} ref={this.ref} {...others} />;
      }
    }

  `;
};
