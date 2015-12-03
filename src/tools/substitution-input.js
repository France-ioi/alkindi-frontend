import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button, Input} from 'react-bootstrap';
import range from 'node-range';
import classnames from 'classnames';

import {updateTool} from '../actions';
import code from '../code';
import {SelectAlphabet} from '../select_alphabet';
import * as alphabets from '../alphabets';

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
  Object.keys(pairs).forEach(function (c) {
    const p = pairs[c];
    const targetIndex = targetAlphabet.symbols.indexOf(p.c);
    if (targetIndex !== -1) {
      // Remove targetIndex from targetRange to avoid using this symbol as
      // a filler.
      const i = targetRange.indexOf(targetIndex);
      if (i !== -1)
        targetRange.splice(i, 1);
      mapping[c] = {i: targetIndex, q: p.q};
    }
  });
  // Build the index map (array keyed by source index).
  const indexMap = targetAlphabet.symbols.map(function (c) {
    if (c in mapping)
      return mapping[c];
    // Fill up the substitution using the next index from targetRange.
    return {i: targetRange.shift(), q: 'filler'};
  });
  return {
    type: 'substitution', sourceAlphabet, targetAlphabet, indexMap
  };
};

const SubstitutionInput = React.createClass({
  render: function () {
    const substitution = this.props.outputs.output;
    console.log('render', substitution);
    if (typeof substitution === 'undefined')
      return (<p>no value</p>);
    const {sourceAlphabet, targetAlphabet, indexMap} = substitution;
    const charPairs = indexMap.map(function (p, i) {
      const sourceSymbol = sourceAlphabet.symbols[i];
      const targetSymbol = targetAlphabet.symbols[p.i];
      const targetClasses = classnames(['char-subs', 'char-'+p.q]);
      return (
        <div key={i} className="char-pairs">
          <span className="char-base">{sourceSymbol}</span>
          <span className={targetClasses}>{targetSymbol}</span>
        </div>);
    });
    return (
      <div key='substitution'>
        <div className="clearfix">{charPairs}</div>
      </div>);
  }
});

const ConfigureSubstitutionInput = React.createClass({
  getInitialState: function () {
    let {tool} = this.props;
    // Initialize our local state using the tool's settings.
    return {
      sourceAlphabetName: tool.compute.sourceAlphabetName,
      targetAlphabetName: tool.compute.targetAlphabetName,
      output: tool.outputs.output
    };
  },
  render: function () {
    // Read the settings from our local state.
    const {output, sourceAlphabetName, targetAlphabetName} = this.state;
    // TODO: allow selecting the source and target alphabets
    return (
      <div>
        <SelectAlphabet ref='sourceAlphabet' label="Source alphabet" value={this.state.sourceAlphabetName} />
        <SelectAlphabet ref='targetAlphabet' label="Target alphabet" value={this.state.targetAlphabetName} />
        <Input type='text' ref='output' value={output} label="Output variable" placeholder="Enter variable name"/>
        <Button className='btn-primary pull-right' onClick={this.close}>Ok</Button>
      </div>
    );
  },
  onChange: function (event, key, value) {
    // Update our local state with the user's input.
    // this.setState({output: this.refs.output.getValue()});
    console.log('onChange', event.target, event.target.getValue());
  },
  close: function (event) {
    // Exit configuration mode and update the tool's configuration.
    const {id, dispatch} = this.props;
    const output = this.refs.output.getValue();
    const sourceAlphabetName = this.refs.sourceAlphabet.getValue();
    const targetAlphabetName = this.refs.targetAlphabet.getValue();
    dispatch(
      updateTool(id, {
        configuring: false,
        compute: {
          sourceAlphabetName,
          targetAlphabetName
        },
        outputs: {
          output: output
        }
      }));
  }
});

const getDefaults = function () {
  return {
    compute: {
      sourceAlphabetName: 'letters',
      targetAlphabetName: 'letters',
      pairs: []
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

export default {
  normal: SubstitutionInput,
  configure: ConfigureSubstitutionInput,
  getDefaults,
  getTitle,
  compute
};
