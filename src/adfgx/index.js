import React from 'react';
import {Alert, Button} from 'react-bootstrap';

import {PureComponent} from '../misc';

import TextInput from './text_input';
import Hints from './hints';
import EnumeratePermutations from './enumerate_permutations';
import ApplyPermutation from './apply_permutation';
import FrequencyAnalysis from './frequency_analysis';
import ApplySubstitution from './apply_substitution';

import {clearAlphabet, adfgxAlphabet, bigramAlphabet} from './common';

const referenceLetterFrequencies = [
   0.0812034849,
   0.0090109472,
   0.0334497677,
   0.0366833299,
   0.1713957515,
   0.0106596728,
   0.0086628177,
   0.0073654812,
   0.0757827046,
   0.0054442497,
   0.0004856863,
   0.0545455020,
   0.0296764091,
   0.0709375766,
   0.0540474291,
   0.0302070784,
   0.0136181215,
   0.0655187521,
   0.0794667491,
   0.0724311434,
   0.0636770558,
   0.0174208168,
   0.0038646285,
   0.0030803592,
   0.0013644851
];

export const setupTools = function (workspace) {

   const iTextInput = workspace.addTool(TextInput, function (scopes, scope) {
      // Set up the input scope for the tool's compute function.
      // Each scope inherits prototypically from the root scope.
      scope.alphabet = adfgxAlphabet;
      scope.text = scope.cipheredText;
   }, {
      outputTextVariable: "texteChiffré"
   });

   const iHints = workspace.addTool(Hints, function (scopes, scope) {
      // scope.outputPermutation
      // scope.outputSubstitution
   }, {
      outputSubstitutionVariable: "substitutionIndices",
      outputPermutationVariable: "permutationIndices"
   });

   const iEnumeratePermutations = workspace.addTool(EnumeratePermutations, function (scopes, scope) {
      scope.cipheredText = scopes[iTextInput].outputText;
      scope.inputPermutation = scopes[iHints].outputPermutation;
   }, {
      // sortBy may be 'ci' (coincidence index) or 'key' (permutation-as-string)
      useCoincidenceIndex: false,
      sortBy: 'permutation',
      // selectedPermutationKey is a permutation-as-string, e.g. '012345';
      // if undefined (or if the selected permutation is filtered out), the
      // first permutation displayed is selected.
      selectedPermutationKey: undefined,
      // permutationInfos maps a permutation-as-string to a {favorited: bool} object.
      permutationInfos: {},
      // showOnlyFavorited, when true, limits the display to favorited permutations.
      showOnlyFavorited: false,
      inputPermutationVariable: 'permutationIndices',
      inputCipheredTextVariable: 'texteChiffré',
      outputPermutationVariable: 'permutationCourante'
   });

   const iApplyPermutation = workspace.addTool(ApplyPermutation, function (scopes, scope) {
      scope.alphabet = adfgxAlphabet;
      scope.cipheredText = scopes[iTextInput].outputText;
      scope.permutation = scopes[iEnumeratePermutations].outputPermutation;
   }, {
      inputPermutationVariable: 'permutationCourante',
      inputCipheredTextVariable: 'texteChiffré',
      outputTextVariable: 'texteAprèsPermutation'
   });

   const iFrequencyAnalysis = workspace.addTool(FrequencyAnalysis, function (scopes, scope) {
      scope.bigramAlphabet = bigramAlphabet;
      scope.targetAlphabet = clearAlphabet;
      scope.targetFrequencies = referenceLetterFrequencies;
      scope.cipheredText = scopes[iApplyPermutation].outputText;
      scope.permutation = scopes[iEnumeratePermutations].outputPermutation;
      scope.substitution = scopes[iHints].outputSubstitution;
   }, {
      editedPairs: {}, // ex. {'AD': 'E'}
      inputTextVariable: 'texteAprèsPermutation',
      inputPermutationVariable: 'permutationCourante',
      inputSubstitutionVariable: 'substitutionIndices',
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
         adfgxAlphabet,
         bigramAlphabet,
         cipheredText: task.cipher_text,
         hintsGrid: task.hints
      };
      return workspace.render(rootScope);
   };

});

export const AnswerDialog = PureComponent(self => {

   let city, metal1, metal2, metal3;
   const refCity = el => { city = el; };
   const refMetal1 = el => { metal1 = el; };
   const refMetal2 = el => { metal2 = el; };
   const refMetal3 = el => { metal3 = el; };

   const onSubmit = function () {
      self.props.submit({
         a: city.value, n1: refMetal1.value, n2: refMetal2.value, n3: refMetal3.value
      });
   };

   self.componentDidMount = function () {
      // When the component mounts, select the first input box.
      address && address.focus();
   };


   self.render = function () {
      const {answers, feedback, onSuccess} = self.props;
      return (
         <div className='adfgx-answer-dialog'>
            <div className='section'>
               <p>
                  Entrez ci-dessous les quatre parties de votre réponse, puis
                  cliquez sur le bouton Soumettre pour connaître le score obtenu.
               </p>
               <p>
                  Vous pouvez soumettre plusieurs réponses. La seule limite est
                  que vous ne pouvez pas soumettre plus de deux fois en moins
                  d'une minute.
               </p>
               <p className="input">
                  <label htmlFor="answer-c">{'Ville : '}</label>
                  <input type="text" id="answer-c" ref={refCity} />
               </p>
               <p className="input">
                  <label htmlFor="answer-m1">{'Métal 1 : '}</label>
                  <input type="text" id="answer-m1" ref={refMetal1} />
               </p>
               <p className="input">
                  <label htmlFor="answer-m2">{'Métal 2 : '}</label>
                  <input type="text" id="answer-m2" ref={refMetal2} />
               </p>
               <p className="input">
                  <label htmlFor="answer-m3">{'Métal 3 : '}</label>
                  <input type="text" id="answer-m3" ref={refMetal3} />
               </p>
               <p><Button onClick={onSubmit}>Soumettre</Button></p>
            </div>
            {feedback && <Feedback feedback={feedback} onSuccess={onSuccess}/>}
            <div className='section'>
               {answers}
            </div>
            <div className='section'>
               <p>
                  Remarque : les différences d'espaces, d'accents, de
                  minuscules/majuscules, de W à la place de V ou vice-versa sont ignorées lors de la
                  comparaison entre les réponses fournies et celles attendues.
                  L'ordre des trois métaux n'a pas d'importance.
               </p>
               <p>Le score est calculé comme suit :</p>
               <ul>
                  <li>vous partez d'un capital de 1000 points ;</li>
                  <li>300 points sont retirés de ce capital pour chaque indice
                      demandé avant votre réponse ;</li>
                  <li>si vous avez à la fois la bonne ville et les trois métaux,
                     votre score est égal au capital restant ;</li>
                  <li>si vous n'avez que la ville, ou bien que les trois métaux,
                      votre score est égal à la moitié du capital restant.</li>
               </ul>
               <p>Autres remarques sur les scores :</p>
               <ul>
                  <li>le score de l'équipe pour un sujet est le meilleur score
                      parmi toutes les soumissions ;</li>
                  <li>le score du tour est le meilleur score obtenu parmi les
                      sujets en temps limité</li>
               </ul>
            </div>
         </div>
      );
   };

});


export const Answer = PureComponent(self => {

   self.render = function () {
      const {answer} = self.props;
      return (
         <div className='adfgx-answer'>
            <span className='adfgx-city'>{answer.c}</span>{' • '}
            <span className='adfgx-metal1'>{answer.m1}</span>{' • '}
            <span className='adfgx-metal2'>{answer.m2}</span>{' • '}
            <span className='adfgx-metal3'>{answer.m3}</span>
         </div>
      );
   };

});


export const Feedback = PureComponent(self => {

   const fullScore = <p>Votre score est la totalité de vos points disponibles.</p>;
   const halfScore = <p>Votre score est égal à la moitié de vos points disponibles.</p>;

   self.render = function () {
      const {feedback, onSuccess} = self.props;
      return (
         <div className='adfgx-feedback'>
            {feedback.city
             ? (feedback.metals
                  ? <div>
                        <Alert bsStyle='success'>
                           <p>Félicitations, vos réponses sont correctes !</p>
                           {fullScore}
                        </Alert>
                        <p><strong>
                           Vous avez atteint le score maximum que vous pouvez obtenir à
                           cette épreuve, compte tenu des indices que vous avez obtenus.
                        </strong></p>
                        <p className="text-center">
                           <Button bsStyle="primary" bsSize="large" onClick={onSuccess}>
                              <i className="fa fa-left-arrow"/> retour aux épreuves
                           </Button>
                        </p>
                     </div>
                  : <div>
                        <Alert bsStyle='warning'>
                           <p>La ville est la bonne, mais au moins un des trois métaux est faux.</p>
                           {halfScore}
                        </Alert>
                     </div>)
             : (feedback.numbers
                  ? <div>
                        <Alert bsStyle='warning'>
                           <p>Les trois métaux sont les bons, mais la ville est fausse.</p>
                           {halfScore}
                        </Alert>
                     </div>
                  : <Alert bsStyle='danger'>Ni la ville ni les métaux ne sont les bons.</Alert>)}
         </div>
      );
   };

});
