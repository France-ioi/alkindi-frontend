import React from 'react';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import Tooltip from '../ui/tooltip';

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

   const renderGrid = function () {
      return false;
   };
   const renderAlphabet = function () {
      return false;
   };
   const renderPermForward = function () {
      return false;
   };
   const renderPermBackward = function () {
      return false;
   };

   self.render = function() {
      const {outputGridVariable, outputPermutationVariable} = self.props.toolState;
      const {hintsGrid, getQueryCost} = self.props.scope;
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
               <div className='grillesSection'>
                  <p className='hints-title'>Plusieurs types d'indices sont disponibles :</p>
                  <p className='hints-section-title'>Des indices sur le contenu de la grille :</p>
                  <div className='adfgx-hints-grid'>
                     <p>
                        {'Révéler une case : '}
                        {getQueryCost({type: "grid"})}
                        {' points '}
                        <Tooltip content={<p>Cliquez sur une case de la grille pour demander quelle lettre elle contient.</p>}/>
                     </p>
                     {renderGrid()}
                  </div>
                  <div className='adfgx-hints-alphabet'>
                     <p>
                        {'Révéler la position d\'une lettre : '}
                        {getQueryCost({type: "alphabet"})}
                        {' points '}
                        <Tooltip content={<p>Cliquer sur une lettre non grisée ci-dessous pour demander sa position au sein de la grille.</p>}/>
                     </p>
                     {renderAlphabet()}
                  </div>
                  <p className='hints-section-title'>Des indices sur la permutation :</p>
                  <div className='adfgx-hints-perm-forward'>
                     <p>
                        {'Révéler la position où sera envoyée une lettre de chaque bloc de 6 lettres lors de la permutation : '}
                        {getQueryCost({type: "perm-forward"})}
                        {' points '}
                        <Tooltip content={<p>TODO</p>}/>
                     </p>
                     {renderPermForward()}
                  </div>
                  <div className='adfgx-hints-perm-backward'>
                     <p>
                        {'Révéler la position d\'origine d\'une lettre de chaque bloc permuté : '}
                        {getQueryCost({type: "perm-backward"})}
                        {' points '}
                        <Tooltip content={<p>TODO</p>}/>
                     </p>
                     {renderPermBackward()}
                  </div>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   scope.outputText = scope.text;
   scope.outputPermutation = [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}];
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
