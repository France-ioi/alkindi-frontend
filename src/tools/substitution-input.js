import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button, ButtonGroup, Input} from 'react-bootstrap';
import range from 'node-range';
import classnames from 'classnames';
import deepmerge from 'deepmerge';

import {updateTool} from '../actions';
import code from '../code';
import {SelectAlphabet} from '../select_alphabet';
import * as alphabets from '../alphabets';
import {PureRenderMixin} from '../misc';

const importSubstitution = function (input) {
  const {sourceAlphabetName, targetAlphabetName, pairs} = input;
  // Make sure the source alphabet exists.
  const sourceAlphabet = alphabets[sourceAlphabetName];
  if (typeof sourceAlphabet === 'undefined')
    return {'error': 'invalid source alphabet: ' + sourceAlphabetName};
  // Make sure the target alphabet exists.
  const targetAlphabet = alphabets[targetAlphabetName];
  if (typeof sourceAlphabet === 'undefined')
    return {'error': 'invalid target alphabet: ' + targetAlphabetName};
  // Build an array from which we'll remove used indexes in the target
  // alphabet, and which we'll then use to fill in undefined mappings.
  const targetRange = range(0, targetAlphabet.symbols.length).toArray();
  // Build a mapping from source symbol to target index, ignoring pairs
  // that have no index in the target alphabet.
  const mapping = {};
  pairs && Object.keys(pairs).forEach(function (c) {
    const p = pairs[c];
    const targetIndex = targetAlphabet.symbols.indexOf(p.c);
    if (targetIndex !== -1) {
      // Remove targetIndex from targetRange to avoid using this symbol as
      // a filler.
      const i = targetRange.indexOf(targetIndex);
      if (i !== -1)
        targetRange.splice(i, 1);
      mapping[c] = {i: targetIndex, l: p.l};
    }
  });
  // Build the index map (array keyed by source index).
  const indexMap = targetAlphabet.symbols.map(function (c) {
    if (c in mapping)
      return mapping[c];
    // Fill up the substitution using the next index from targetRange.
    return {i: targetRange.shift(), l: false};
  });
  return {
    type: 'substitution', sourceAlphabet, targetAlphabet, indexMap
  };
};

const SubstitutionInput = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState: function () {
    return {
      selected: undefined
    }
  },
  render: function () {
    // Render nothing if we don't have a valid substitution output to display.
    if (typeof this.props.outputs === 'undefined')
      return false;
    const substitution = this.props.outputs.output;
    const {selected} = this.state;
    if (typeof substitution === 'undefined')
      return (<p>no value</p>);
    const {sourceAlphabet, targetAlphabet, indexMap} = substitution;
    const charPairs = indexMap.map((p, i) => {
      const sourceSymbol = sourceAlphabet.symbols[i];
      const targetSymbol = targetAlphabet.symbols[p.i];
      const targetClasses = ['char-subs'];
      if (p.l) targetClasses.push('char-locked');
      if (targetSymbol === selected)
        targetClasses.push('char-selected');
      return (
        <div key={i} className="char-pairs">
          <span className="char-base">{sourceSymbol}</span>
          <span className={classnames(targetClasses)} onClick={this.onClick} data-key={targetSymbol} >{targetSymbol}</span>
        </div>);
    });
    return (
      <div key='substitution'>
        <div className="clearfix">{charPairs}</div>
      </div>);
  },
  onClick: function (event) {
    const key = event.currentTarget.getAttribute('data-key');
    this.setState({selected: key});
  }
});

const ConfigureSubstitutionInput = React.createClass({
  getInitialState: function () {
    return {initializerChanged: false};
  },
  render: function () {
    const {tool} = this.props;
    const {initializerChanged} = this.state;
    const {sourceAlphabetName, targetAlphabetName, initializer} = tool.compute;
    const {output} = tool.outputs;
    return (
      <div>
        <SelectAlphabet ref='sourceAlphabet' label="Source alphabet" defaultValue={sourceAlphabetName} />
        <SelectAlphabet ref='targetAlphabet' label="Target alphabet" defaultValue={targetAlphabetName} />
        <Input type='text' ref='output' label="Output variable" defaultValue={output} placeholder="Enter variable name"/>
        <Input type='select' ref='initializer' label="Initializer" defaultValue={initializer} onChange={this.update}>
          <option name='identity'>identity</option>
          <option name='undefined'>undefined</option>
        </Input>
        <ButtonGroup className='pull-right'>
          <Button className={initializerChanged?'btn-primary':''} onClick={this.reset}>reset</Button>
          <Button className={initializerChanged?'':'btn-primary'} onClick={this.close}>Ok</Button>
        </ButtonGroup>
      </div>
    );
  },
  update: function (event) {
    const initializerChanged = this.props.tool.comput.initializer !== this.refs.initializer.getValue();
    this.setState({
      initializerChanged
    });
  },
  close: function (event, options) {
    options = typeof options === 'object' ? options : {};
    // Exit configuration mode and update the tool's configuration.
    const {id, dispatch} = this.props;
    const output = this.refs.output.getValue();
    const sourceAlphabetName = this.refs.sourceAlphabet.getValue();
    const targetAlphabetName = this.refs.targetAlphabet.getValue();
    const initializer = this.refs.initializer.getValue();
    let update = {
      configuring: false,
      compute: {
        sourceAlphabetName,
        targetAlphabetName,
        initializer
      },
      outputs: {
        output: output
      }
    };
    if ('update' in options)
      update = deepmerge(options.update, update);
    dispatch(updateTool(id, update));
  },
  reset: function (event) {
    // Setting the pairs to undefined will cause onUpdate to re-run the
    // initializer.
    this.close(event, {update: {compute: {pairs: undefined}}});
  }
});

const getDefaults = function () {
  return {
    compute: {
      sourceAlphabetName: 'letters',
      targetAlphabetName: 'letters',
      pairs: undefined,
      initializer: 'identify'
    },
    inputs: {
      input: undefined
    },
    outputs: {
      output: undefined     // name of the variable that receives the text
    }
  };
};

const getTitle = function (tool) {
  const {compute, outputs} = tool;
  const {substitution} = compute;
  const {output} = outputs;
  // TODO: include the alphabet in the display?
  return code.wrap([code.variable('1', output), ' = (substitution)']);
};

const compute = function (tool, inputs) {
  return {
    output: importSubstitution(tool.compute)
  };
};

function getIdentityMapping (tool) {
  const {sourceAlphabetName, targetAlphabetName} = tool.compute;
  if (sourceAlphabetName !== targetAlphabetName) {
    console.log('warning: cannot build identity substitution')
    return;
  }
  const alphabet = alphabets[sourceAlphabetName];
  if (typeof alphabet === 'undefined')
    return;
  const mapping = {};
  alphabet.symbols.map(function (c) {
    mapping[c] = {c: c, l: false};
  });
  return mapping;
}

function getInitialPairs (tool) {
  switch (tool.compute.initializer) {
  case 'identity':
    return getIdentityMapping(tool);
  case 'undefined':
    return {};
  }
}

const onUpdate = function (tool, data) {
  let result = deepmerge(tool, data);
  if (typeof result.compute.pairs === 'undefined') {
    let pairs = getInitialPairs(result);
    result = deepmerge(result, {compute: {pairs}});
  }
  return result;
};

export default {
  normal: SubstitutionInput,
  configure: ConfigureSubstitutionInput,
  getDefaults,
  getTitle,
  compute,
  onUpdate
};
