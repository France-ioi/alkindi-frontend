import React from 'react';
import {Input} from 'react-bootstrap';

import {PureComponent} from '../misc';

export const SubstitutionInitializer = PureComponent(self => {
  const typeChanged = function () {
    const type = self.refs.selectType.getValue();
    self.props.onChange({type});
  };
  self.render = function () {
    const {value} = this.props;
    return (
      <Input ref='selectType' type='select' label="Initializer" value={value.type} onChange={typeChanged} >
        <option name='identity'>identity</option>
        <option name='shuffle'>shuffle</option>
      </Input>
    );
  };
});

export default SubstitutionInitializer;
