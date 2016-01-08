import React from 'react';

import {PureComponent} from '../misc';

export const TextInput = PureComponent(self => {
  const onChange = function (_event) {
    const input = self.refs.input.value;
    self.props.onChange(input);
  };
  self.render = function () {
    const {text, rows} = self.props;
    return (<textarea ref='input' className="full-width" value={text} rows={rows} onChange={onChange} />);
  };
});

export default TextInput;
