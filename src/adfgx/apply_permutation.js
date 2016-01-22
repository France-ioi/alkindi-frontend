import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {getCellLetter, getQualifierClass} from '../utils/cell';
import {applyPermutation} from '../utils/permutation';
import {bigramsFromCells} from '../utils/bigram';

export const Component = EpicComponent(self => {

   const renderBigram = function (bigram, key, alphabet) {
      const c0 = getCellLetter(alphabet, bigram.c0, true);
      const c1 = getCellLetter(alphabet, bigram.c0, true);
      const q0 = classnames(['adfgx-cell', getQualifierClass(bigram.c0.q)]);
      const q1 = classnames(['adfgx-cell', getQualifierClass(bigram.c1.q)]);
      return (
         <span key={key} className="adfgx-bigram">
            <span className={q0}>{c0}</span>
            <span className={q1}>{c1}</span>
         </span>);
   };

   const renderText = function (text, alphabet, stride) {
      const elements = text.map(function (bigram, iBigram) {
         return renderBigram(text[iBigram], iBigram, alphabet);
      });
      return <div className='adfgx-text'>{elements}</div>;
   };

   self.render = function() {
      const {inputPermutationVariable, inputCipheredTextVariable, outputTextVariable} = self.props.toolState;
      const {alphabet, outputText} = self.props.scope;
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputTextVariable}/>
                     <Python.Call name="appliquePermutation">
                        <Python.Var name={inputPermutationVariable}/>
                        <Python.Var name={inputCipheredTextVariable}/>
                     </Python.Call>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               {renderText(outputText, alphabet)}
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {permutation, cipheredText, adfgxAlphabet} = scope;
   const permText = applyPermutation(cipheredText, permutation);
   scope.outputText = bigramsFromCells(permText, adfgxAlphabet);
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
