import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {bigramsFromText, coincidenceIndex, generatePermutations,
        comparePermutations, permutationFromString, applyPermutation,
        numbersAlphabet} from './common';

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
            <tr key={i} className={classnames(classes)} data-key={permutation.key} onClick={onSelectPermutation}>
               <td>{permutation.key}</td>
               <td>{permutation.ci.toFixed(3)}</td>
               <td>{permutation.favorited ? '*' : ' '}</td>
            </tr>
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
               <table className='adfgx-table adfgx-table-scroll-body'>
                  <thead>
                     <tr>
                        <th>permutation</th>
                        <th>coïncidence (i)</th>
                        <th>retenue</th>
                     </tr>
                  </thead>
                  <tbody>
                     {permutations.map(renderPermutationItem)}
                  </tbody>
               </table>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {selectedPermutationKey, permutationInfos, showOnlyFavorited, sortBy} = toolState;
   const {inputPermutation, cipheredText, bigramAlphabet} = scope;
   // showOnlyFavorited disabled the generation of permutations.
   let permutations = [];  // {key,qualified,favorited}
   const permutationMap = {};  // key → {key,qualified,favorited}
   if (!showOnlyFavorited) {
      permutations = generatePermutations(inputPermutation, numbersAlphabet);
      permutations.forEach(function (permutation) {
         permutationMap[permutation.key] = permutation;
      });
   }
   // Add all favorited permutations.
   Object.keys(permutationInfos).forEach(function (key) {
      const infos = permutationInfos[key];
      if (key in permutationMap) {
         // Permutation was generated above, just fill in favorited flag.
         permutationMap[key].favorited = infos.favorited;
      } else {
         // Filter out non-favorited (avoids having de-favorited permutations
         // stick around after the user has obtained hints).
         if (!infos.favorited)
            return;
         // Add the permutation to the output.
         permutations.push({
            key: key,
            qualified: permutationFromString(key),
            favorited: infos.favorited
         });
      }
   });
   // Compute stats on each permutation.
   permutations.forEach(function (permutation) {
      const permText = applyPermutation(cipheredText, permutation.qualified);
      const bigramText = bigramsFromText(permText);
      permutation.ci = coincidenceIndex(bigramText);
   });
   // Sort the permutations.
   if (sortBy === 'ci') {
      permutations.sort(function (p1, p2) {
         const result = p1.ci < p2.ci ? 1 : (p1.ci > p2.ci ? -1 :
            comparePermutations(p1.qualified, p2.qualified));
         return result;
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
   if (selectedPermutation)
      scope.outputPermutation = selectedPermutation.qualified;
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
