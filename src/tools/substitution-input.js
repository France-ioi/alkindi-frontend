import React from 'react';
import {Alert, Button, ButtonGroup, Panel} from 'react-bootstrap';
import deepmerge from 'deepmerge';

import code from '../code';
import ToolHeader from '../ui/tool_header';
import SubstitutionEditor from '../ui/substitution_editor';
import SelectAlphabet from '../ui/select_alphabet';
import InputVariableName from '../ui/input_variable_name';
import SubstitutionInitializer from '../ui/substitution_initializer';
import alphabets from '../alphabets';
import {PureComponent, stateSetters} from '../misc';
import {importSubstitution, runSubstitutionInitializer} from '../values';

export const renderTitle = function (tool) {
  const {outputVarName} = tool.state;
  // TODO: include the alphabet in the display?
  return code.wrap([code.variable('1', outputVarName), ' = (substitution)']);
};

export const Component = PureComponent(self => {
  const updatePairs = function (pairs) {
    // This component's mergeState performs a deep merge on pairs.
    self.props.update({pairs});
  };
  const reset = function () {
    // Setting the pairs to undefined will cause the initializer to run.
    self.props.update({pairs: undefined});
  };
  self.render = function () {
    // Use our own output to display the substitution.
    const {tool} = self.props;
    const {outputScope} = tool;
    const {outputVarName} = tool.state;
    let body;
    if (outputScope.hasOwnProperty(outputVarName)) {
      const substitution = outputScope[outputVarName];
      body = (
        <div>
          <Button className='pull-right' onClick={reset}>reset</Button>
          <SubstitutionEditor substitution={substitution} updatePairs={updatePairs} />
        </div>
      );
    } else {
      body = <Alert bsStyle='warning'>no substitution</Alert>;
    }
    const header = <ToolHeader {...self.props} title={renderTitle(tool)} />;
    return (<Panel header={header}>{body}</Panel>);
  };
}, _self => {
  return {
    selected: undefined
  };
});

export const Configure = PureComponent(self => {
  const setters = stateSetters(self, ['alphabetName', 'initializer', 'outputVarName']);
  const close = function (event, options) {
    options = typeof options === 'object' ? options : {};
    // Exit configuration mode and update the tool's configuration.
    const {alphabetName, initializer, outputVarName} = self.state;
    const update = {configuring: false, alphabetName, initializer, outputVarName};
    if ('reset' in options)
      update.pairs = undefined;
    self.props.update(update);
  };
  const reset = function (event) {
    close(event, {reset: true});
  };
  self.render = function () {
    const {tool} = self.props;
    const {alphabetName, initializer, outputVarName} = self.state;
    const initializerChanged = initializer !== self.props.tool.state.initializer;
    const header = <ToolHeader {...self.props} title={renderTitle(tool)} />;
    return (
      <Panel header={header}>
        <InputVariableName label="Output variable" placeholder="Enter variable name" value={outputVarName} onChange={setters.outputVarName} />
        <SelectAlphabet label="Alphabet" value={alphabetName} onChange={setters.alphabetName} />
        <SubstitutionInitializer label="Initializer" value={initializer} onChange={setters.initializer} />
        <ButtonGroup className='pull-right'>
          <Button className={initializerChanged?'btn-primary':''} onClick={reset}>reset</Button>
          <Button className={initializerChanged?'':'btn-primary'} onClick={close}>Ok</Button>
        </ButtonGroup>
      </Panel>
    );
  };
}, _self => {
  const {alphabetName, initializer, outputVarName} = self.props.tool.state;
  return {alphabetName, initializer, outputVarName};
});

export const compute = function (state, scope) {
  const {alphabetName, pairs, outputVarName} = state;
  const alphabet = alphabets[alphabetName];
  if (alphabet !== undefined && outputVarName !== undefined)
    scope[outputVarName] = importSubstitution({sourceAlphabet: alphabet, targetAlphabet: alphabet, pairs});
};

const mergeState = function (state, update) {
  const newState = deepmerge(state, update);
  if (newState.pairs === undefined) {
    const {initializer, alphabetName} = newState;
    const alphabet = alphabets[alphabetName];
    newState.pairs = runSubstitutionInitializer(initializer, alphabet);
  }
  return newState;
};

export default self => {
  self.state = {
    alphabetName: 'letters',
    pairs: undefined,
    initializer: {type: 'identify'},
    canCollapse: false
  };
  self.Component = Component;
  self.Configure = Configure;
  self.compute = compute;
  self.mergeState = mergeState;
};
