import React from 'react';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import Tooltip from '../ui/tooltip';

export const Component = EpicComponent(self => {

   /*
      props:
         scope:
            hintsGrid
            getHint
            getQueryCost
            outputSubstitution
            outputPermutation
         toolState:
            outputSubstitutionVariable
            outputPermutationVariable
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
      const {outputSubstitutionVariable, outputPermutationVariable} = self.props.toolState;
      const {outputSubstitution, outputPermutation, getQueryCost} = self.props.scope;
      const inputVars = [];
      const outputVars = [
         {label: "Substitution", name: outputSubstitutionVariable},
         {label: "Permutation", name: outputPermutationVariable}
      ];
      const renderCell = function (c) {
         return 'l' in c ? c.l : 'None';
      };
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputSubstitutionVariable}/>
                     <Python.Grid grid={outputSubstitution} renderCell={renderCell}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               {false && <Variables inputVars={inputVars} outputVars={outputVars} />}
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
                     {renderGrid(outputSubstitution)}
                  </div>
                  <div className='adfgx-hints-alphabet'>
                     <p>
                        {'Révéler la position d\'une lettre : '}
                        {getQueryCost({type: "alphabet"})}
                        {' points '}
                        <Tooltip content={<p>Cliquer sur une lettre non grisée ci-dessous pour demander sa position au sein de la grille.</p>}/>
                     </p>
                     {renderAlphabet(outputSubstitution)}
                  </div>
                  <p className='hints-section-title'>Des indices sur la permutation :</p>
                  <div className='adfgx-hints-perm-forward'>
                     <p>
                        {'Révéler la position où sera envoyée une lettre de chaque bloc de 6 lettres lors de la permutation : '}
                        {getQueryCost({type: "perm-forward"})}
                        {' points '}
                        <Tooltip content={<p>TODO</p>}/>
                     </p>
                     {renderPermForward(outputPermutation)}
                  </div>
                  <div className='adfgx-hints-perm-backward'>
                     <p>
                        {'Révéler la position d\'origine d\'une lettre de chaque bloc permuté : '}
                        {getQueryCost({type: "perm-backward"})}
                        {' points '}
                        <Tooltip content={<p>TODO</p>}/>
                     </p>
                     {renderPermBackward(outputPermutation)}
                  </div>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {substitutionGridHints, permutationHints} = scope;
   scope.outputSubstitution = substitutionGridHints.map(
      row => row.map(
         l => l === null ? {q:'unknown'} : {q:'hint',l}));
   scope.outputPermutation = permutationHints.map(
      l => l === null ? {q:'unknown'} : {q:'hint',l});
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
