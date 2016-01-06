import React from 'react';
import ReactDOM from 'react-dom';

import {PureComponent} from './tools-react/utils';
import DisplayText from './tools-react/displayText';
import Hints from './tools-react/hints';

const at = function (index, func) {
   return function (array) {
      const result = array.slice();
      result[index] = func(array[index]);
      return result;
   };
};
const put = function (value) {
   return function (_) {
      return value;
   };
};

const App = PureComponent(self => {

   const alphabet = playFair.alphabet;

   const getQueryCost = function (query) {
      if (query.type === "grid")
         return 10;
      if (query.type === "alphabet")
         return 10;
      return 0;
   };

   const getHint = function (query, callback) {
      setTimeout(function () {
         const {hintsGrid, score} = self.state;
         const queryCost = getQueryCost(query);
         if (query.type == "grid") {
            const {row, col} = query;
            const hint = playFair.getHintGrid(playFair.sampleHints, row, col);
            self.setState({
               hintsGrid: at(row, at(col, put({l: hint, q: 'confirmed'})))(hintsGrid),
               score: score - queryCost
            });
            callback(false);
         } else {
            const {rank} = query;
            const {row, col} = playFair.getHintAlphabet(playFair.sampleHints, rank);
            self.setState({
               hintsGrid: at(row, at(col, put({l: rank, q: 'confirmed'})))(hintsGrid),
               score: score - queryCost
            });
            callback(false);
         }
      }, 1000);
   };

   self.render = function () {
      return (
         <div>
            <DisplayText alphabet={alphabet} cipheredText={self.state.cipheredText} outputCipheredTextVariable="texteChiffré" />
            <Hints gridCells={self.state.hintsGrid} score={self.state.score} alphabet={alphabet} outputGridVariable="lettresGrilleIndice" getQueryCost={getQueryCost} getHint={getHint} />
         </div>
      );
   };

}, self => {
   return {
      cipheredText: playFair.sampleCipheredText,
      hintsGrid: playFair.initialTaskGrid,
      score: 500
   };
});

const container = document.getElementById('react-container');
ReactDOM.render(<App/>, container);
