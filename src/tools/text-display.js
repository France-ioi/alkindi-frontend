import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Alert,Button} from 'react-bootstrap';

import {lookupByPropName,SelectVariable} from '../environment';
import {updateTool} from '../actions';
import code from '../code';

// BareTextDisplay displays its 'text' property as a text.
const BareTextDisplay = React.createClass({
  propTypes: {
    text: React.PropTypes.object,
    columns: React.PropTypes.number,
    lines: React.PropTypes.number
  },
  getDefaultProps: function () {
    return {
      columns: 40,
      lines: 6
    };
  },
  render: function () {
    const {text} = this.props;
    // Validate the input value.
    if (typeof text === 'undefined')
      return (<Alert bsStyle="warning">no value</Alert>);
    if (text.type !== 'text')
      return (<Alert bsStyle="danger">bad type ({text.type})</Alert>);
    // Render the text block.
    const symbols = text.alphabet.symbols;
    const iqArray = text.iqArray;
    const inserts = text.inserts || [];
    const maxCols = this.props.columns;
    const maxLines = this.props.lines;
    const lines = [];
    let offset = 0;
    const showInserts = false, insert = [];
    let iInsert = 0;
    for (let i = 0; i < maxLines; i += 1) {
      let cols = [];
      for (let j = 0; j < maxCols; j += 1) {
        if (showInserts && inserts[iInsert] && offset === inserts[iInsert][0]) {
          cols.push(<span key={j} className="textInsert">{inserts[iInsert][1]}</span>);
          iInsert += 1;
        } else {
          let iq = iqArray[offset];
          cols.push(<span key={j} className={'q-'+iq.q}>{symbols[iq.i]}</span>);
          offset += 1;
        }
      }
      lines.push(<div key={i}>{cols}</div>);
    }
    return (<div className='textBlock'>{lines}</div>);
  }
});

// IndirectTextDisplay displays the content of the variable referenced by
// its 'source' property.
const selIndirectTextDisplay = createSelector(
  lookupByPropName('source'),
  function (text) {
    return {text};
  }
);
const IndirectTextDisplay = connect(selIndirectTextDisplay)(BareTextDisplay);

// TextDisplay is the normal tool's UI.
const TextDisplay = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    settings: React.PropTypes.object
  },
  render: function () {
    const {input} = this.props.settings;
    return (
      <div>
        <IndirectTextDisplay source={input}/>
      </div>);
  }
});

// CollapsedTextDisplay is the collapsed view of the tool's UI.
const CollapsedTextDisplay = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    settings: React.PropTypes.object
  },
  render: function () {
    const {input} = this.props.settings;
    return (
      <div>
        <IndirectTextDisplay source={input} lines={2}/>
      </div>);
  }
});

const ConfigureTextDisplay = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    settings: React.PropTypes.object
  },
  getInitialState: function () {
    // Initialize the settings from props.
    return {settings: this.props.settings};
  },
  render: function () {
    // Read the settings from our local state.
    const {input} = this.state.settings;
    return (
      <div>
        <p>Input variable</p>
        <SelectVariable type='text' value={input} eventKey='input' onSelect={this.onSelect} />
        <Button className='btn-primary pull-right' onClick={this.close}>Ok</Button>
      </div>
    );
  },
  onSelect: function (event, key, value) {
    // Update our local state with the user's input.
    this.setState(function (state) {
      return {...state, settings: {...state.settings, [key]: value}};
    });
  },
  close: function (event) {
    // Exit configuration mode and update the tool's settings.
    this.props.dispatch(
      updateTool(this.props.id, {
        state: {configuring: false},
        settings: this.state.settings
      }));
  }
});


const buildTitle = function (props) {
  return code.wrap([code.keyword('0', 'print'), ' ', code.variable('1', props.settings.input)]);
};

export default {
  normal: TextDisplay,
  collapsed: CollapsedTextDisplay,
  configure: ConfigureTextDisplay,
  buildTitle: buildTitle
};
