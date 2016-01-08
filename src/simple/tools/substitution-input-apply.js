
import React from 'react';
import {Alert, Button, ButtonGroup, Panel} from 'react-bootstrap';
import deepmerge from 'deepmerge';

import {PureComponent, stateSetters} from '../../misc';
import alphabets from '../utils/alphabets';
import {importSubstitution, runSubstitutionInitializer, applySubstitution} from '../utils/values';
import InputVariableName from '../ui/input_variable_name';
import SelectAlphabet from '../ui/select_alphabet';
import SelectVariable from '../ui/select_variable';
import SubstitutionEditor from '../ui/substitution_editor';
import SubstitutionInitializer from '../ui/substitution_initializer';
import TextDisplay from '../ui/text_display';
import ToolHeader from '../ui/tool_header';

export const renderTitle = function (tool) {
  const {inputVarName, outputVarName} = tool.state;
  return <span>{outputVarName} = (substitution).apply({inputVarName})</span>;
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
    const parentScope = Object.getPrototypeOf(tool.outputScope);
    const {inputVarName, outputVarName} = tool.state;
    const header = <ToolHeader {...self.props} title={renderTitle(tool)} />;
    const body = [];
    // Show the input text if available.
    if (inputVarName in parentScope) {
      const input = parentScope[inputVarName];
      body.push(<label key='il' className='control-label'>Input text:</label>);
      body.push(<TextDisplay key='id' text={input} lines={2} />);
    } else {
      body.push(<Alert key='ia' bsStyle='warning'>no input for {inputVarName}</Alert>);
    }
    // Show the substitution if available.
    if (outputScope.hasOwnProperty('$sub')) {
      const substitution = outputScope.$sub;
      body.push(<Button key='sr' className='pull-right' onClick={reset}>reset</Button>);
      body.push(<label key='sl' className='control-label'>Substitution:</label>);
      body.push(<div key='se' className='substitution-editor-wrapper clearfix'><SubstitutionEditor substitution={substitution} updatePairs={updatePairs} /></div>);
    } else {
      body.push(<Alert key='sa' bsStyle='warning'>no substitution</Alert>);
    }
    // Show the output text if available.
    if (outputScope.hasOwnProperty(outputVarName)) {
      const output = outputScope[outputVarName];
      body.push(<label key='ol' className='control-label'>Output text:</label>);
      body.push(<TextDisplay key='od' text={output} lines={2} />);
    } else {
      body.push(<Alert key='oa' bsStyle='warning'>failed to compute {outputVarName}</Alert>);
    }
    return (<Panel header={header}>{body}</Panel>);
  };
}, _self => {
  return {
    selected: undefined
  };
});

export const Configure = PureComponent(self => {
  const setters = stateSetters(self, ['alphabetName', 'initializer', 'inputVarName', 'outputVarName']);
  const close = function (event, options) {
    options = typeof options === 'object' ? options : {};
    // Exit configuration mode and update the tool's configuration.
    const {alphabetName, initializer, inputVarName, outputVarName} = self.state;
    const update = {configuring: false, alphabetName, initializer, inputVarName, outputVarName};
    if ('reset' in options)
      update.pairs = undefined;
    self.props.update(update);
  };
  const reset = function (event) {
    close(event, {reset: true});
  };
  self.render = function () {
    const {tool} = self.props;
    const {alphabetName, initializer, inputVarName, outputVarName} = self.state;
    const parentScope = Object.getPrototypeOf(tool.outputScope);
    const initializerChanged = initializer !== self.props.tool.state.initializer;
    return (
      <div>
        <ToolHeader {...self.props} title={renderTitle(tool)} />
        <SelectVariable scope={parentScope} typeFilter='text' value={inputVarName} onChange={setters.inputVarName} />
        <InputVariableName label="Output variable" placeholder="Enter variable name" value={outputVarName} onChange={setters.outputVarName} />
        <SelectAlphabet label="Alphabet" value={alphabetName} onChange={setters.alphabetName} />
        <SubstitutionInitializer label="Initializer" value={initializer} onChange={setters.initializer} />
        <ButtonGroup className='pull-right'>
          <Button className={initializerChanged?'btn-primary':''} onClick={reset}>reset</Button>
          <Button className={initializerChanged?'':'btn-primary'} onClick={close}>Ok</Button>
        </ButtonGroup>
      </div>
    );
  };
}, self => {
  const {alphabetName, initializer, inputVarName, outputVarName} = self.props.tool.state;
  return {alphabetName, initializer, inputVarName, outputVarName};
});

export const compute = function (state, scope) {
  const {inputVarName, alphabetName, pairs, outputVarName} = state;
  const alphabet = alphabets[alphabetName];
  if (alphabet === undefined)
    return; // TODO: error
  const substitution = importSubstitution({sourceAlphabet: alphabet, targetAlphabet: alphabet, pairs});
  // Store the substitution in the scope as $sub so that we can display it.
  scope.$sub = substitution;
  if (substitution === undefined)
    return;
  // Apply the substitution to the input text, if any.
  const input = scope[inputVarName];
  if (input === undefined)
    return; // TODO: error
  scope[outputVarName] = applySubstitution(substitution, input);
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
    inputVarName: undefined,
    alphabetName: undefined,
    outputVarName: undefined,
    pairs: undefined,
    initializer: {type: 'identify'}
  };
  self.Component = Component;
  self.Configure = Configure;
  self.compute = compute;
  self.mergeState = mergeState;
};
