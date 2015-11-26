import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Alert,Button} from 'react-bootstrap';
import classnames from 'classnames';

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
      lines: 6,
      lineHeight: 30
    };
  },
  getInitialState: function (props) {
    return {
      scrollTop: 0
    };
  },
  render: function () {
    const {text, columns, lines, lineHeight} = this.props;
    const height = lines * lineHeight;
    // Validate the input value.
    if (typeof text === 'undefined')
      return (<Alert bsStyle='warning'>no value</Alert>);
    if (text.type !== 'text')
      return (<Alert bsStyle='danger'>bad type ({text.type})</Alert>);
    // Compute the indices of the first and list line to render.
    const lineCount = Math.trunc((text.iqArray.length + columns - 1) / columns);
    let   firstLine = Math.trunc(this.state.scrollTop / lineHeight);
    let   lastLine  = firstLine + lines;
    // Include the line immediately above the top of the view, if there is one.
    if (firstLine > 0) firstLine -= 1;
    // Include the line immediately below the top of the view, if there is one.
    if (lastLine < lineCount) lastLine += 1;
    // Render the line elements, adding two anchors to make the view scrollable.
    const lineElements = [];
    lineElements.push(<div key="top" className='textTopAnchor'/>);
    lineElements.push(<div key="bot" className='textBottomAnchor' style={{top: lineCount * lineHeight}}/>);
    for (let i = firstLine; i < lastLine; i += 1) {
      lineElements.push(this.renderLine(i));
    }
    return (<div ref='container' onScroll={this.onScroll} className='textBlock' style={{height: height}}>{lineElements}</div>);
  },
  onScroll: function (event) {
    const scrollTop = this.refs.container.scrollTop;
    this.setState({scrollTop});
  },
  renderLine: function (lineIndex) {
    const {text, columns, lineHeight} = this.props;
    const {iqArray,alphabet} = text;
    const {symbols} = alphabet;
    const position = lineIndex * columns;
    const cols = [];
    let maxColumn = iqArray.length - position;
    if (maxColumn > columns)
      maxColumn = columns;
    for (let j = 0; j < maxColumn; j += 1) {
      let iq = iqArray[position + j];
      cols.push(<span key={j} className={classnames('textSym', 'q-'+iq.q)}>{symbols[iq.i]}</span>);
    }
    return (<div key={lineIndex} className='textLine' style={{top: lineIndex * lineHeight}}>
      <span className='textPos'>{position}</span> {cols}
    </div>);
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
  return code.wrap([code.keyword('0', 'print'), '(', code.variable('1', props.settings.input), ')']);
};

export default {
  normal: TextDisplay,
  collapsed: CollapsedTextDisplay,
  configure: ConfigureTextDisplay,
  buildTitle: buildTitle
};
