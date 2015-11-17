
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
        <div key={i}>
          <span>{alphabet[i]}</span>
          <span>{showD ? alphabet[d] : ' '}</span>
        </div>
      );
      backwardMapping.push(
        <div key={i}>
          <span>{alphabet[i]}</span>
          <span>{showC ? alphabet[c] : ' '}</span>
        </div>
      );
    }
    return (
      <div className="hints">
        <p>...</p>
        <p>...</p>
        <hr/>
        <div className="forwardMapping">
          {forwardMapping}
          <p>...</p>
        </div>
        <hr/>
        <div className="backwardMapping">
          {backwardMapping}
          <p>...</p>
        </div>
      </div>);
  }
});
