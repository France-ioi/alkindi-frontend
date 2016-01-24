import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Button} from 'react-bootstrap';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {bigramsFromText, coincidenceIndex, generatePermutations,
        comparePermutations, permutationFromString, applyPermutation,
        numbersAlphabet, getInversePermutation, renderPermutation} from './common';

export const Component = EpicComponent(self => {

   let tbody, tr;

   const refTbody = function (element) {
      tbody = element;
      jumpToTr();
   };
   const refTr = function (element) {
      tr = element;
      jumpToTr();
   };
   const jumpToTr = function () {
      if (!tbody || !tr)
         return;
      const trTop = tr.offsetTop;
      const trBottom = trTop + tr.offsetHeight;
      const tbodyTop = tbody.scrollTop;
      const tbodyBottom = tbodyTop + tbody.offsetHeight;
      if (trTop > tbodyBottom || trBottom <= tbodyTop + 27)
         tbody.scrollTop = tr.offsetTop - 27;
   };

   const onSelectPermutation = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      self.props.setToolState({selectedPermutationKey: key})
   };

   const onSetSortBy = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      console.log('sortBy', key);
      self.props.setToolState({sortBy: key});
   };

   const onToggleFavorited = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      const infos = self.props.toolState.permutationInfos;
      const value = {...infos[key], favorited: key in infos ? !infos[key].favorited : true};
      self.props.setToolState({
         permutationInfos: {...infos, [key]: value}});
      event.stopPropagation();
   };

   const onToggleShowOnlyFavorited = function (event) {
      const {showOnlyFavorited} = self.props.toolState;
      self.props.setToolState({showOnlyFavorited: !showOnlyFavorited});
   };

   self.render = function() {
      const {selectedPermutationKey, permutationData, showOnlyFavorited, useCoincidenceIndex, sortBy,
         inputPermutationVariable, inputCipheredTextVariable, outputPermutationVariable} = self.props.toolState;
      const {selectedPermutation, permutations, prevPermutation, nextPermutation} = self.props.scope;
      const renderPermutationItem = function (permutation, i) {
         const isSelected = selectedPermutation === permutation;
         const classes = ['adfgx-perm', isSelected && 'adfgx-perm-selected'];
         const favoritedClasses = ['fa', permutation.favorited ? 'fa-toggle-on' : 'fa-toggle-off'];
         return (
            <tr key={i} className={classnames(classes)} data-key={permutation.key} onClick={onSelectPermutation} ref={isSelected&&refTr}>
               <td className='adfgx-col-l'>{renderPermutation(permutation.qualified)}</td>
               <td className='adfgx-col-l'>{renderPermutation(permutation.inverse)}</td>
               {useCoincidenceIndex && <td className='adfgx-col-m'>{permutation.ci.toFixed(3)}</td>}
               <td className='adfgx-col-s' onClick={onToggleFavorited} data-key={permutation.key}><i className={classnames(favoritedClasses)}/></td>
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
                        <th className={classnames(['adfgx-col-l', 'adfgx-col-sort', sortBy==='permutation'&&'adfgx-col-sort-key'])} onClick={onSetSortBy} data-key='permutation'>permutation</th>
                        <th className={classnames(['adfgx-col-l', 'adfgx-col-sort', sortBy==='inverse'&&'adfgx-col-sort-key'])} onClick={onSetSortBy} data-key='inverse'>inverse</th>
                        {useCoincidenceIndex && <th className={classnames(['adfgx-col-m', 'adfgx-col-sort', sortBy==='ci'&&'adfgx-col-sort-key'])} onClick={onSetSortBy} data-key='ci'>coïncidence (i)</th>}
                        <th className='adfgx-col-s'>retenue</th>
                     </tr>
                  </thead>
                  <tbody ref={refTbody}>
                     {permutations.map(renderPermutationItem)}
                  </tbody>
               </table>
               <Button onClick={onToggleShowOnlyFavorited}>
                  <i className={classnames(['fa', 'fa-toggle-' + (showOnlyFavorited ? 'on' : 'off')])}/>
                  {' retenues uniquement'}
               </Button>
               <Button onClick={onSelectPermutation} disabled={!prevPermutation} data-key={prevPermutation&&prevPermutation.key}>
                  <i className={classnames(['fa', 'fa-arrow-up'])}/>
                  {' permutation précédente'}
               </Button>
               <Button onClick={onSelectPermutation} disabled={!nextPermutation} data-key={nextPermutation&&nextPermutation.key}>
                  <i className={classnames(['fa', 'fa-arrow-down'])}/>
                  {' permutation suivante'}
               </Button>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {selectedPermutationKey, permutationInfos, showOnlyFavorited, useCoincidenceIndex, sortBy} = toolState;
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
            qualified: permutationFromString(key, inputPermutation),
            favorited: infos.favorited
         });
      }
   });
   // Compute stats and inverse on each permutation.
   permutations.forEach(function (permutation) {
      const permText = applyPermutation(cipheredText, permutation.qualified);
      const bigramText = bigramsFromText(permText);
      if (useCoincidenceIndex)
         permutation.ci = coincidenceIndex(bigramText);
      permutation.inverse = getInversePermutation(permutation.qualified);
   });
   // Sort the permutations.
   if (useCoincidenceIndex && sortBy === 'ci') {
      permutations.sort(function (p1, p2) {
         const result = p1.ci < p2.ci ? 1 : (p1.ci > p2.ci ? -1 :
            comparePermutations(p1.qualified, p2.qualified));
         return result;
      });
   } else if (sortBy === 'inverse') {
      permutations.sort(function (p1, p2) {
         return comparePermutations(p1.inverse, p2.inverse);
      });
   } else {
      permutations.sort(function (p1, p2) {
         return comparePermutations(p1.qualified, p2.qualified);
      });
   }
   scope.permutations = permutations;
   // Find the selected permutation (use the first one if not found).
   let selectedPermutationIndex = permutations.findIndex(function (p) {
      return p.key == selectedPermutationKey;
   });
   if (selectedPermutationIndex === -1)
      selectedPermutationIndex = 0;
   if (selectedPermutationIndex !== 0)
      scope.prevPermutation = permutations[selectedPermutationIndex - 1];
   if (selectedPermutationIndex + 1 !== permutations.length)
      scope.nextPermutation = permutations[selectedPermutationIndex + 1];
   const selectedPermutation = permutations[selectedPermutationIndex];
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
