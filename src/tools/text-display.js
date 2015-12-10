import React from 'react';
import {Button} from 'react-bootstrap';

import code from '../code';
import ToolHeader from '../ui/tool_header';
import TextDisplay from '../ui/text_display';
import SelectVariable from '../ui/select_variable';
import {PureComponent, stateSetters} from '../misc';

export const renderTitle = function (tool) {
  return code.wrap([
    code.keyword('0', 'print'),
    '(', code.variable('1', tool.state.inputVarName), ')'
  ]);
};

export const Component = PureComponent(self => {
  self.render = function () {
    const {tool} = self.props;
    const nLines = tool.state.collapsed ? 2 : 10;
    const input = tool.outputScope[tool.state.inputVarName];
    return (<div>
      <ToolHeader {...self.props} title={renderTitle(tool)}/>
      <TextDisplay text={input} lines={nLines} />
    </div>);
  };
});

export const Configure = PureComponent(self => {
  const setters = stateSetters(self, ['inputVarName']);
  const close = function (event) {
    const {inputVarName} = self.state;
    self.props.update({configuring: false, inputVarName});
  };
  self.render = function () {
    const {tool} = self.props;
    const {inputVarName} = self.state;
    return (
      <div>
        <ToolHeader {...self.props} title={renderTitle(tool)}/>
        <p>Input variable</p>
        <SelectVariable scope={tool.outputScope} typeFilter='text' value={inputVarName} onChange={setters.inputVarName} />
        <Button className='btn-primary pull-right' onClick={close}>Ok</Button>
      </div>
    );
  };
}, self => {
  const {inputVarName} = self.props.tool.state;
  return {inputVarName};
});

export const compute = function (state, scope) {
};

export default self => {
  self.state = {
    inputVarName: undefined
  };
  self.Component = Component;
  self.Configure = Configure;
  self.compute = compute;
};
