import React from 'react';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {getCellLetter} from '../utils/cell';

export const Component = EpicComponent(self => {

   /*
      props:
         scope:
            clearAlphabet
            text
            outputText
         toolState:
            outputTextVariable
   */

   self.render = function() {
      const {outputGridVariable, outputPermutationVariable} = self.props.toolState;
      const {text, hintsGrid, clearAlphabet} = self.props.scope;
      const inputVars = [];
      const outputVars = [
         {label: "Grille enregistrée", name: outputGridVariable},
         {label: "Permutation", name: outputPermutationVariable}
      ];
      const grid = hintsGrid.split('\n').map(row => row.split(''));
      const renderCell = function (c) {
         return c === ' ' ? 'None' : '\'' + c + '\'';
      };
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputGridVariable}/>
                     <Python.Grid grid={grid} renderCell={renderCell}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <Variables inputVars={inputVars} outputVars={outputVars} />
               <p>TODO</p>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   scope.outputText = scope.text;
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
