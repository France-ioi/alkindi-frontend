import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {getCellLetter, getQualifierClass} from '../utils/cell';
import {applyPermutation} from '../utils/permutation';

export const Component = EpicComponent(self => {

   const renderCell = function (alphabet, cell, key) {
      const classes = ['adfgx-letter', getQualifierClass(cell.q)];
      const letter = 'l' in cell ? getCellLetter(alphabet, cell, true) : cell.c;
      return <span key={key} className={classnames(classes)}>{letter}</span>;
   };

   const renderText = function (text, alphabet, stride) {
      const elements = [];
      for (let iCell = 0; iCell < text.length; iCell += stride) {
         const nCellsGroup = iCell + stride < text.length ? stride : text.length - iCell;
         const groupElements = [];
         for (let j = 0; j < nCellsGroup; j++) {
            const cell = text[iCell + j];
            groupElements.push(renderCell(alphabet, cell, j));
         }
         elements.push(<div key={iCell} className='adfgx-text-block'>{groupElements}</div>);
      }
      return <div className='adfgx-text'>{elements}</div>;
   };

   self.render = function() {
      const {inputPermutationVariable, inputCipheredTextVariable, outputTextVariable} = self.props.toolState;
      const {alphabet, outputText} = self.props.scope;
      const {stride} = self.props.toolState;
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
               {renderText(outputText, alphabet, stride)}
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {permutation, cipheredText} = scope;
   scope.outputText = applyPermutation(cipheredText, permutation);
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
