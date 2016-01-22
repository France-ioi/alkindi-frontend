import React from 'react';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {getMostFrequentBigrams} from '../utils/bigram';


export const Component = EpicComponent(self => {

   const renderBigramHisto = function (bigram, iBigram) {
      return (
         <li key={bigram.v}>
            <span>{bigram.v}</span>
            {' '}
            <span>{(bigram.p * 100).toFixed(1)}{'%'}</span>
         </li>
      );
   };

   self.render = function() {
      const {inputTextVariable, outputSubstitutionVariable} = self.props.toolState;
      const {bigramFreqs} = self.props.scope;
      // Button to reset substitution to match order of bigrams frequencies
      // with order of letter frequencies in french.
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputSubstitutionVariable}/>
                     <Python.Call name="analyseFréquence">
                        <Python.Var name={inputTextVariable}/>
                        <span>…</span>
                     </Python.Call>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <div>
                  <ul>{bigramFreqs.map(renderBigramHisto)}</ul>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   scope.bigramFreqs = getMostFrequentBigrams(scope.cipheredText, scope.bigramAlphabet.size);
   // TODO: generate the substitution
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
