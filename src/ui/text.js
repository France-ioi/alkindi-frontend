import React from 'react';
import classnames from 'classnames';

// This component displays its 'text' property as a preformated text.
export const Text = React.createClass({
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

export default Text;
