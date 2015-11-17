
import React from 'react';

module.exports = React.createClass({
  getInitialState: function () {
    return {
      revealed: Array.apply(null, {length: 26}).map(function () { return true; })
    };
  },
  propTypes: function () {
    return {};
  },
  render: function () {
    var alphabet = window.alphabet,
        forwardPermutation = window.permutation,
        reversePermutation = Array.apply(' ', {length: 26}),
        forwardMapping = [],
        backwardMapping = [],
        i, j;
    for (i = 0, j = alphabet.length; i < j; i++) {
      reversePermutation[forwardPermutation[i]] = i;
    }
    for (i = 0, j = window.alphabet.length; i < j; i++) {
      var c = forwardPermutation[i], showC = this.state.revealed[i],
          d = reversePermutation[i], showD = this.state.revealed[d];
      console.log(i, c, showC, d, showD);
      forwardMapping.push(
        <div key={i} className="char-pairs">
          <span className="char-base cipher">{alphabet[i]}</span>
          <span className="char-subs">{showD ? alphabet[d] : ' '}</span>
        </div>
      );
      backwardMapping.push(
        <div key={i} className="char-pairs">
          <span className="char-base">{alphabet[i]}</span>
          <span className="char-subs cipher">{showC ? alphabet[c] : ' '}</span>
        </div>
      );
    }
    return (
      <div className="hints">
        <p>Demandez des indices pour vous aider (les points utilisés seront retirés de votre score)</p>
        <p id="hint-score">Points restants : 250/300</p>
        <hr/>
        <div className="forwardMapping">
          <div className="clearfix">
            {forwardMapping}
          </div>
          <p>Pour 10 points, cliquez sur une case pour connaître la lettre associée un symbole.</p>
        </div>
        <hr/>
        <div className="backwardMapping clearfix">
          <div className="clearfix">
            {backwardMapping}
          </div>
          <p>Pour 15 points, cliquez sur une case pour connaître le symbole associé à une lettre.</p>
        </div>
      </div>);
  }
});
