import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {generatePermutations, comparePermutations, permutationFromString,
   applyPermutation, numbersAlphabet} from '../utils/permutation';
import {bigramsFromCells} from '../utils/bigram';
import {coincidenceIndex} from '../utils/cell';

export const Component = EpicComponent(self => {

   const onSelectPermutation = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      self.props.setToolState({selectedPermutationKey: key})
   };

   self.render = function() {
      const {selectedPermutationKey, permutationData, showOnlyFavorited,
         inputPermutationVariable, inputCipheredTextVariable, outputPermutationVariable} = self.props.toolState;
      const {selectedPermutation, permutations} = self.props.scope;
      const renderPermutationItem = function (permutation, i) {
         const classes = ['adfgx-perm', selectedPermutation === permutation && 'adfgx-perm-selected'];
         return (
            <li key={i} className={classnames(classes)} data-key={permutation.key} onClick={onSelectPermutation}>
               <span>{permutation.key}</span>
               {' '}
               <span>{permutation.ci.toFixed(3)}</span>
               {' '}
               <span>{permutation.favorited ? '*' : ' '}</span>
            </li>
         );
      };
      const inputVars = [
         {label: "Permutation", name: inputPermutationVariable},
         {label: "Texte chiffré", name: inputCipheredTextVariable}
      ];
      const outputVars = [
         {label: "Nouvelle permutation", name: outputPermutationVariable}
      ];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputPermutationVariable}/>
                     <Python.Call name="énumèrePermutations">
                        <Python.Var name={inputPermutationVariable}/>
                        <Python.Var name={inputCipheredTextVariable}/>
                        <span>…</span>
                     </Python.Call>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                  <ul>{permutations.map(renderPermutationItem)}</ul>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {selectedPermutationKey, permutationInfos, showOnlyFavorited, sortBy} = toolState;
   const {inputPermutation, cipheredText, adfgxAlphabet, bigramAlphabet} = scope;
   const permutationMap = {};
   // showOnlyFavorited disabled the generation of permutations.
   let permutations = [];
   if (!showOnlyFavorited) {
      permutations = generatePermutations(inputPermutation, numbersAlphabet);
      permutations.forEach(function (permutation) {
         permutationMap[permutation.key] = permutation;
      });
   }
   // Add all permutations on which data is explicitly set.
   Object.keys(permutationInfos).forEach(function (key) {
      const infos = permutationInfos[key];
      if (!(key in permutationMap)) {
         // Optionally filter out non-favorited.
         if (showOnlyFavorited && !infos.favorited)
            return;
         permutations.push({
            key: key,
            unqualified: permutationFromString(key),
            favorited: infos.favorited
         });
      } else {
         permutationMap[key].favorited = infos.favorited;
      }
   });
   // Compute stats on each permutation.
   permutations.forEach(function (permutation) {
      const permText = applyPermutation(cipheredText, permutation.qualified);
      const bigrams = bigramsFromCells(permText, adfgxAlphabet);
      permutation.ci = coincidenceIndex(bigrams, bigramAlphabet);
   });
   // Sort the permutations.
   if (sortBy === 'ci') {
      permutations.sort(function (p1, p2) {
         return p1.ci < p2.ci ? 1 : (p1.ci > p2.ci ? -1 :
            comparePermutations(p1.qualified, p2.qualified));
      });
   } else {
      permutations.sort(function (p1, p2) {
         return comparePermutations(p1.qualified, p2.qualified);
      });
   }
   scope.permutations = permutations;
   // Find the selected permutation (use the first one if not found).
   let selectedPermutation = permutations.find(function (p) {
      return p.key == selectedPermutationKey
   });
   if (!selectedPermutation)
      selectedPermutation = permutations[0];
   scope.selectedPermutation = selectedPermutation;
   // Output a qualified permutation.
   scope.outputPermutation = selectedPermutation.qualified;
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
