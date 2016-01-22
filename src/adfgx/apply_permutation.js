import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {bigramsFromCells, applyPermutation, renderBigram} from './common';

export const Component = EpicComponent(self => {

   const renderText = function (text, alphabet) {
      const elements = text.map(function (bigram, iBigram) {
         return renderBigram(iBigram, text[iBigram], alphabet);
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
