import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Alert,Button} from 'react-bootstrap';

import {lookupByPropName,SelectVariable} from '../environment';

// BareTextDisplay displays its 'text' property as a text.
const BareTextDisplay = React.createClass({
  getDefaultProps: function () {
    return {};
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
    const maxCols = 40;
    const maxLines = 6;
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

// TextDisplay is the configurable UI component.
const TextDisplay = React.createClass({
  render: function () {
    const {input} = this.props.settings;
    return (
      <div>
        <p>Affichage du texte contenu dans la variable <tt>{input}</tt>.</p>
        <IndirectTextDisplay source={input}/>
      </div>);
  }
});

const ConfigureTextDisplay = React.createClass({
  getInitialState: function () {
    return {input: this.props.settings.input};
  },
  render: function () {
    const {input} = this.state;
    return (
      <div>
        <p>Input variable</p>
        <SelectVariable type='text' value={input} eventKey='input' onSelect={this.onSelect} />
        <Button className='btn-primary pull-right' onClick={this.close}>Ok</Button>
      </div>
    );
  },
  onSelect: function (event, key, value) {
    this.setState(function (state) {
      return {...state, [key]: value};
    });
  },
  close: function (event) {
    this.props.dispatch({
      type: 'UPDATE_TOOL',
      id: this.props.id,
      data: {
        state: {configuring: false},
        settings: this.state
      }
    });
  }
});

export default {
  normal: TextDisplay,
  configure: ConfigureTextDisplay
};
