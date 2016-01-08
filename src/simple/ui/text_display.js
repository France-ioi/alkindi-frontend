import React from 'react';
import classnames from 'classnames';
import {Alert} from 'react-bootstrap';
import keycode from 'keycode';

import {importText, editText} from '../values';
import {PureRenderMixin} from '../misc';

// This component displays its 'text' property as a preformated text.
export const Text = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    text: React.PropTypes.object,
    columns: React.PropTypes.number,
    lines: React.PropTypes.number,
    editable: React.PropTypes.bool,
    onInput: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      columns: 40,
      lines: 6,
      lineHeight: 30
    };
  },
  getInitialState: function (_props) {
    return {
      scrollTop: 0,
      cursor: 0
    };
  },
  componentWillReceiveProps: function (_props) {
    // TODO: find position for each line number,
    // store in state.
    /*
    let linePositions = [];
    const {text} = props;
    this.setState({linePositions});
    */
  },
  render: function () {
    const {text, columns, lines, lineHeight, editable} = this.props;
    const height = lines * lineHeight;
    // Validate the input value.
    if (typeof text === 'undefined')
      return (<Alert bsStyle='warning'>no value</Alert>);
    if (text.type !== 'text')
      return (<Alert bsStyle='danger'>bad type ({text.type})</Alert>);
    // Compute the indices of the first and list line to render.
    const lineCount = Math.trunc((text.items.length + columns - 1) / columns);
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
    let containerAttrs = {
      ref: 'container',
      onScroll: this.onScroll,
      className: 'textBlock',
      style: {height: height}
    };
    if (editable) {
      Object.assign(containerAttrs, {
        onMouseEnter: this.onMouseEnter,
        onMouseLeave: this.onMouseLeave,
        tabIndex: 0,
        onKeyPress: this.onKeyPress,
        onKeyDown: this.onKeyDown
      });
    }
    return (<div {...containerAttrs} >{lineElements}</div>);
  },
  renderLine: function (lineIndex) {
    const {text, columns, lineHeight, editable} = this.props;
    const cursor = editable ? this.state.cursor : -1;
    const {items,alphabet} = text;
    const {symbols} = alphabet;
    const position = lineIndex * columns;
    const cols = [];
    let maxColumn = items.length - position;
    if (maxColumn > columns)
      maxColumn = columns;
    for (let j = 0; j < maxColumn; j += 1) {
      const cls = [];
      const item = items[position + j];
      if (cursor === position + j)
        cls.push('textCursor');
      if ('c' in item) {
        cls.push('textLit');
        cols.push(<span key={j} className={classnames(cls)}>{item.c}</span>);
      } else {
        cls.push('textSym');
        cls.push('q-'+item.q);
        cols.push(<span key={j} className={classnames(cls)}>{symbols[item.i]}</span>);
      }
    }
    // Add a cursor if the cursor it is past the end of the text and there is
    // space on the current line.
    if (cursor === items.length && maxColumn < columns && cursor >= position && cursor < position + columns)
      cols.push(<span key={maxColumn} className='textEnd textCursor'>{"\xA0"}</span>);
    return (<div key={lineIndex} className='textLine' style={{top: lineIndex * lineHeight}}>
      <span className='textPos'>{position}</span> {cols}
    </div>);
  },
  onScroll: function (_event) {
    const scrollTop = this.refs.container.scrollTop;
    this.setState({scrollTop});
  },
  onKeyDown: function (event) {
    const kc = keycode(event);
    const {cursor} = this.state;
    const {columns, text} = this.props;
    const textLength = text.items.length;
    switch (kc) {
      case 'backspace':
        // Prevent backspace from navigating.
        event.preventDefault();
        break;
      case 'up':
        if (cursor > columns) {
          this.setState({cursor: cursor - columns});
          event.preventDefault();
        }
        break;
      case 'down':
        if (cursor + columns <= textLength) {
          this.setState({cursor: cursor + columns});
          event.preventDefault();
        }
        break;
      case 'left':
        if (cursor > 0) {
          this.setState({cursor: cursor - 1});
          event.preventDefault();
        }
        break;
      case 'right':
        if (cursor < textLength) {
          this.setState({cursor: cursor + 1});
          event.preventDefault();
        }
        break;
    }
  },
  onKeyPress: function (event) {
    const ch = String.fromCharCode(event.charCode);
    const position = this.state.cursor;
    const oldText = this.props.text;
    const insert = importText(oldText.alphabet, ch, 'input');
    if (insert.items.length > 0) {
      const newText = editText(oldText, {position, insert});
      this.props.setText(newText);
      this.setState({cursor: position + insert.items.length});
    }
  },
  onMouseEnter: function (_event) {
    this.refs.container.focus();
  },
  onMouseLeave: function (_event) {
    this.refs.container.blur();
  }
});

export default Text;
