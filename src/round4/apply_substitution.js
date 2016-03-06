import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {c} from './common';

export const Component = EpicComponent(self => {

   const renderText = function (text) {
      const {alphabet, cells} = text;
      const renderCell = function (cell, i) {
         const classes = [c('substChar-'+cell.qualifier)];
         if (cell.rank !== undefined) {
            return <span key={i} className={classnames(classes)}>{alphabet.symbols[cell.rank]}</span>;
         } else {
            return <span key={i} className={classnames(classes)}>{cell.symbol}</span>;
         }
      };
      return <div className={c('textOutput')}>{cells.map(renderCell)}</div>;
   };

   self.render = function() {
      const {inputTextVariable, inputSubstitutionVariable, outputClearTextVariable} = self.props.toolState;
      const {outputText} = self.props.scope;
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
               {renderText(outputText)}
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {inputText, substitution} = scope;
   const outputCells = inputText.cells.map(function (cell) {
      if (cell.rank === undefined)
         return cell;
      return substitution.mapping[cell.rank];
   });
   scope.outputText = {
      alphabet: substitution.targetAlphabet,
      cells: outputCells
   };
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
