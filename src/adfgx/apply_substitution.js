import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {getQualifierClass} from './common';

export const Component = EpicComponent(self => {

   const renderCell = function (key, cell, alphabet) {
      const c0 = alphabet.symbols[cell.l];
      const q0 = classnames(['adfgx-cell', getQualifierClass(cell.q)]);
      return <span key={key} className={q0}>{c0}</span>;
   };

   const renderText = function (text) {
      const {alphabet, cells} = text;
      const elements = cells.map(function (cell, iCell) {
         return renderCell(iCell, cell, alphabet);
      });
      return <div className='adfgx-text'>{elements}</div>;
   };

   self.render = function() {
      const {inputTextVariable, inputSubstitutionVariable, outputClearTextVariable} = self.props.toolState;
      const {outputText} = self.props.scope;
      console.log('applySubstitution', outputText);
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputClearTextVariable}/>
                     <Python.Call name="appliqueSubstitution">
                        <Python.Var name={inputTextVariable}/>
                        <Python.Var name={inputSubstitutionVariable}/>
                     </Python.Call>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <div className='adfgx-deciphered-text'>
                  {renderText(outputText)}
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {cipheredText, substitution} = scope;
   const targetCells = cipheredText.map(function (cell) {
      return substitution.mapping[cell.l];
   });
   scope.outputText = {alphabet: substitution.targetAlphabet, cells: targetCells};
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
