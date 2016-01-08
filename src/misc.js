import React from 'react';
import * as PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

export {PureRenderMixin};

export const at = function (index, func) {
   return function (array) {
      if (array === undefined) {
         const result = [];
         result[index] = func();
         return result;
      } else {
         const result = array.slice();
         result[index] = func(array[index]);
         return result;
      }
   };
};

export const put = function (value) {
   return function (_) {
      return value;
   };
};

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
