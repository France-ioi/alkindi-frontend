import React from 'react';
import {Button, Panel} from 'react-bootstrap';

import {PureComponent, stateSetters} from '../../misc';
import code from '../utils/code';
import {importText} from '../utils/values';
import alphabets from '../utils/alphabets';
import InputVariableName from '../ui/input_variable_name';
import SelectAlphabet from '../ui/select_alphabet';
import TextInput from '../ui/text_input';
import ToolHeader from '../ui/tool_header';

export const renderTitle = function (tool) {
  const maxTextLength = 20;
  const {input, outputVarName} = tool.state;
  const shortenedInput = (input.length > maxTextLength) ? input.slice(0, maxTextLength) + '…' : input;
  // Consider: include alphabetName in the display
  return code.wrap([code.variable('1', outputVarName), ' = "', shortenedInput, '"']);
};

export const Component = PureComponent(self => {
  const updateInput = function (input) {
    self.props.update({input});
  };
  self.render = function () {
    const {tool} = self.props;
    const {input, collapsed} = tool.state;
    const rows = collapsed ? 2 : 6;
    const header = <ToolHeader {...self.props} title={renderTitle(tool)}/>;
    return (
      <Panel header={header}>
        <TextInput text={input} onChange={updateInput} rows={rows} />
      </Panel>
    );
  };
});

export const Configure = PureComponent(self => {
  const setters = stateSetters(self, ['outputVarName', 'alphabetName']);
  const close = function (_event) {
    const {alphabetName, outputVarName} = self.state;
    self.props.update({configuring: false, alphabetName, outputVarName});
  };
  self.render = function () {
    const {tool} = self.props;
    const {alphabetName, outputVarName} = self.state;
    const header = <ToolHeader {...self.props} title={renderTitle(tool)}/>;
    return (
      <Panel header={header}>
        <InputVariableName label="Output variable" placeholder="Enter variable name" value={outputVarName} onChange={setters.outputVarName} />
        <SelectAlphabet label="Alphabet" value={alphabetName} onChange={setters.alphabetName} />
        <Button className='btn-primary pull-right' onClick={close}>Ok</Button>
      </Panel>
    );
  };
}, self => {
  const {alphabetName, outputVarName} = self.props.tool.state;
  return {alphabetName, outputVarName};
});

export const compute = function (state, scope) {
  const {alphabetName, outputVarName, input} = state;
  const alphabet = alphabets[alphabetName];
  if (outputVarName !== undefined)
    scope[outputVarName] = importText(alphabet, input, 'input');
};

export default self => {
  self.state = {
    input: '',
    alphabetName: 'letters',
    outputVarName: undefined
  };
  self.Component = Component;
  self.Configure = Configure;
  self.compute = compute;
};
