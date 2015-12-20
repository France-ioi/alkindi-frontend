import React from 'react';
import * as PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

export {PureRenderMixin};

/* A pure component must always render the same for given props and state.
*/

export function PureComponent (factory, getInitialState) {
  return function (props, context) {
    const self = {
      ...React.Component.prototype,
      ...PureRenderMixin,
      props,
      context
    };
    if (getInitialState !== undefined)
      self.state = getInitialState(self);
    factory(self);
    return self;
  };
}

export function stateSetters (self, names) {
  const setters = {};
  names.forEach(function (name) {
    setters[name] = function (value) {
      self.setState({[name]: value});
    };
  });
  return setters;
}
