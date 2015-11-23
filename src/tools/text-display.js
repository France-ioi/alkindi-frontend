import React from 'react';

let TextDisplay = React.createClass({
  getInitialState: function () {
    return {};
  },
  getDefaultProps: function () {
    return {
      title: 'Text input'
    };
  },
  propTypes: function () {
    return {
      title: React.PropTypes.string,
      text: React.PropTypes.string.isRequired
    };
  },
  render: function () {
    let symbols = this.props.text.alphabet.symbols;
    let iqArray = this.props.text.iqArray;
    let inserts = this.props.text.inserts || [];
    let maxCols = 40;
    let maxLines = 6;
    let lines = [];
    let offset = 0;
    let showInserts = false, iInsert = 0, insert = [];
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

export default {
  Component: TextDisplay,
  propTypes: {
    text: 'text'
  }
};
