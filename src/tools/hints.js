
import React from 'react';
import range from 'node-range';

import {substitute, inverse, toChar} from '../alpha';

export default React.createClass({
  getInitialState: function () {
    return {
      revealed: Array.apply(null, {length: 26}).map(function () { return true; })
    };
  },
  propTypes: function () {
    return {};
  },
  render: function () {
    const cipher = window.permutation;
    const decipher = inverse(cipher);
    const cipherMapping = cipher.map(function (c, i) {
      const showC = this.state.revealed[i];
      return (
        <div key={i} className="char-pairs">
          <span className="char-base">{toChar(i)}</span>
          <span className="char-subs cipher">{showC ? toChar(c) : ' '}</span>
        </div>
      );
    }.bind(this));
    const decipherMapping = decipher.map(function (d, i) {
      const showD = this.state.revealed[d];
      return (
        <div key={i} className="char-pairs">
          <span className="char-base cipher">{toChar(i)}</span>
          <span className="char-subs">{showD ? toChar(d) : ' '}</span>
        </div>
      );
    }.bind(this));
    return (
      <div className="hints">
        <p>Demandez des indices pour vous aider (les points utilisés seront retirés de votre score)</p>
        <p id="hint-score">Points restants : 250/300</p>
        <hr/>
        <div>
          <div className="clearfix">
            {decipherMapping}
          </div>
          <p>Pour 10 points, cliquez sur une case pour connaître la lettre associée un symbole.</p>
        </div>
        <hr/>
        <div className="clearfix">
          <div className="clearfix">
            {cipherMapping}
          </div>
          <p>Pour 15 points, cliquez sur une case pour connaître le symbole associé à une lettre.</p>
        </div>
      </div>);
  }
});
