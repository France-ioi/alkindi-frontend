
import React from 'react';
import range from 'node-range';

import {toChar} from '../alpha';

export default React.createClass({
  propTypes: function () {
    return {};
  },
  render: function () {
    const clearHints = this.props.hints.fromClear;
    const codedAlphabet = this.props.alphabets[this.props.codedAlphabet];
    const codedToClear = codedAlphabet.map(function (c) {
      var d = c in clearHints ? clearHints[c] : '\u00A0';
      return (
        <div key={c} className="char-pairs">
          <span className="char-base cipher">{c}</span>
          <span className="char-subs">{d}</span>
        </div>
      );
    });
    const codedHints = this.props.hints.fromCoded;
    const clearAlphabet = this.props.alphabets[this.props.clearAlphabet];
    const clearToCoded = clearAlphabet.map(function (c) {
      var d = c in codedHints ? codedHints[c] : '\u00A0';
      return (
        <div key={c} className="char-pairs">
          <span className="char-base">{c}</span>
          <span className="char-subs cipher">{d}</span>
        </div>
      );
    });
    return (
      <div className="hints">
        <p>Demandez des indices pour vous aider (les points utilisés seront retirés de votre score)</p>
        <p id="hint-score">Points restants : {this.props.score}/{this.props.maxScore}</p>
        <hr/>
        <div>
          <div className="clearfix">
            {codedToClear}
          </div>
          <p>Pour 10 points, cliquez sur une case pour connaître la lettre associée un symbole.</p>
        </div>
        <hr/>
        <div className="clearfix">
          <div className="clearfix">
            {clearToCoded}
          </div>
          <p>Pour 15 points, cliquez sur une case pour connaître le symbole associé à une lettre.</p>
        </div>
      </div>);
  }
});
