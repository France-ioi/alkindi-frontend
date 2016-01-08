import React from 'react';
import {Button, Panel} from 'react-bootstrap';

import {PureComponent, stateSetters} from '../../misc';
import code from '../utils/code';
import SelectVariable from '../ui/select_variable';
import TextDisplay from '../ui/text_display';
import ToolHeader from '../ui/tool_header';

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
    const header = <ToolHeader {...self.props} title={renderTitle(tool)}/>;
    const body = <TextDisplay text={input} lines={nLines} />;
    return (<Panel header={header}>{body}</Panel>);
  };
});

export const Configure = PureComponent(self => {
  const setters = stateSetters(self, ['inputVarName']);
  const close = function (_event) {
    const {inputVarName} = self.state;
    self.props.update({configuring: false, inputVarName});
  };
  self.render = function () {
    const {tool} = self.props;
    const {inputVarName} = self.state;
    const header = <ToolHeader {...self.props} title={renderTitle(tool)}/>;
    return (
      <Panel header={header}>
        <p>Input variable</p>
        <SelectVariable scope={tool.outputScope} typeFilter='text' value={inputVarName} onChange={setters.inputVarName} />
        <Button className='btn-primary pull-right' onClick={close}>Ok</Button>
      </Panel>
    );
  };
}, self => {
  const {inputVarName} = self.props.tool.state;
  return {inputVarName};
});

export const compute = function (_state, _scope) {
};

export default self => {
  self.state = {
    inputVarName: undefined
  };
  self.Component = Component;
  self.Configure = Configure;
  self.compute = compute;
};
