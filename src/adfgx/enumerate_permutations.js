import React from 'react';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {generatePermutations, comparePermutations, permutationFromString,
   applyPermutation, numbersAlphabet} from '../utils/permutation';
import {bigramsFromCells} from '../utils/bigram';
import {makeAlphabet, coincidenceIndex} from '../utils/cell';
import {makeAlphabet as makeBigramAlphabet} from '../utils/bigram';

const adfgxAlphabet = makeAlphabet('ADFGX');
const bigramAlphabet = makeBigramAlphabet('ADFGX');
      console.log(bigramAlphabet);

export const Component = EpicComponent(self => {

   const renderPermutationItem = function (permutation, i) {
      return (
         <li key={i}>
            <span>{permutation.key}</span>
            {' '}
            <span>{permutation.ci.toFixed(3)}</span>
            {' '}
            <span>{permutation.favorited ? '*' : ' '}</span>
         </li>
      );
   };

   self.render = function() {
      const {selected, permutationData, showOnlyFavorited,
         inputPermutationVariable, inputCipheredText, outputPermutationVariable} = self.props.toolState;
      const {selectedPermutation, permutations} = self.props.scope;
      const inputVars = [
         {label: "Permutation", name: inputPermutationVariable},
         {label: "Texte chiffré", name: inputCipheredText}
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
                        <Python.Var name={inputCipheredText}/>
                     </Python.Call>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <ul>{permutations.map(renderPermutationItem)}</ul>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {selected, permutationInfos, showOnlyFavorited, sortBy} = toolState;
   const {inputPermutation, cipheredText} = scope;
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
      const permText = applyPermutation(cipheredText, permutation.unqualified);
      const bigrams = bigramsFromCells(permText, adfgxAlphabet);
      permutation.ci = coincidenceIndex(bigrams, bigramAlphabet);
   });
   // Sort the permutations.
   if (sortBy === 'ci') {
      permutations.sort(function (p1, p2) {
         return p1.ci < p2.ci ? 1 : (p1.ci > p2.ci ? -1 : 0);
      });
   } else {
      permutations.sort(function (p1, p2) {
         return comparePermutations(p1.unqualified, p2.unqualified);
      });
   }
   scope.permutations = permutations;
   // Find the selected permutation (use the first one if not found).
   let selectedPermutation = permutations.find(function (p) {
      return p.key == selected
   });
   if (!selectedPermutation)
      selectedPermutation = permutations[0];
   scope.selectedPermutation = selectedPermutation;
   // Output a qualified permutation.
   scope.outputPermutation = selectedPermutation.unqualified.map(function (dstPos, iPos) {
      return {dstPos, q: inputPermutation[iPos].q};
   });
   // TODO: compute stats on inputCipheredText
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
