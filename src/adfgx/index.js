import React from 'react';
import {Alert, Button} from 'react-bootstrap';

import {PureComponent} from '../misc';

import TextInput from './text_input';
import Hints from './hints';
import EnumeratePermutations from './enumerate_permutations';
import ApplyPermutation from './apply_permutation';
import FrequencyAnalysis from './frequency_analysis';
import ApplySubstitution from './apply_substitution';

import * as cell from '../utils/cell';
import * as bigram from '../utils/cell';

const clearAlphabet = cell.makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ');
const bigramAlphabet = bigram.makeAlphabet('ADFGX');

export const setupTools = function (workspace) {

   const iTextInput = workspace.addTool(TextInput, function (scopes, scope) {
      // Set up the input scope for the tool's compute function.
      // Each scope inherits prototypically from the root scope.
      scope.text = scope.cipheredText;
   }, {
      outputTextVariable: "texteChiffré"
   });

   const iHints = workspace.addTool(Hints, function (scopes, scope) {
      // scope.hintsGrid
   }, {
      outputGridVariable: "lettresGrilleIndices",
      outputPermutationVariable: "permutationIndices"
   });

   const iEnumeratePermutations = workspace.addTool(EnumeratePermutations, function (scopes, scope) {
      scope.cipheredText = scopes[iTextInput].outputText;
      scope.inputPermutation = scopes[iHints].outputPermutation;
   }, {
      // sortBy may be 'ci' (coincidence index) or 'key' (permutation-as-string)
      sortBy: 'ci',
      // selected is a permutation-as-string, e.g. '012345'; if undefined,
      // the first permutation displayed is selected.
      selected: undefined,
      // permutationInfos maps a permutation-as-string to a {favorited: bool} object.
      permutationInfos: {},
      // showOnlyFavorited, when true, limits the display to favorited permutations.
      showOnlyFavorited: false,
      inputPermutationVariable: 'permutationIndices',
      inputCipheredText: 'texteChiffré',
      outputPermutationVariable: 'permutationCourante'
   });

   const iApplyPermutation = workspace.addTool(ApplyPermutation, function (scopes, scope) {
      scope.cipheredText = scopes[iTextInput].outputText;
      scope.permutation = scopes[iEnumeratePermutations].outputPermutation;
   }, {
      outputTextVariable: 'texteAprèsPermutation'
   });

   const iFrequencyAnalysis = workspace.addTool(FrequencyAnalysis, function (scopes, scope) {
      scope.cipheredText = scopes[iApplyPermutation].outputText;
      scope.permutation = scopes[iEnumeratePermutations].outputPermutation;
   }, {
      substitution: {}, // ex. {'AD': 'E'}
      inputTextVariable: 'texteAprèsPermutation',
      inputPermutation: 'permutationCourante',
      outputSubstitutionVariable: 'substitutionÉditée'
   });

   const iApplySubstitution = workspace.addTool(ApplySubstitution, function (scopes, scope) {
      scope.cipheredText = scopes[iApplyPermutation].outputText;
      scope.substitution = scopes[iFrequencyAnalysis].outputSubstitution;
   }, {
      inputTextVariable: 'texteAprèsPermutation',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputClearTextVariable: 'texteDéchiffré'
   });

};

export const TabContent = PureComponent(self => {

   self.render = function () {
      const {workspace, task} = self.props;
      const rootScope = {
         ...task,
         clearAlphabet,
         bigramAlphabet,
         cipheredText: task.cipher_text,
         hintsGrid: task.hints
      };
      return workspace.render(rootScope);
   };

});
