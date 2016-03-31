import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';

import TextDisplay from './text_display';
import TextInput from './text_input';
import FrequencyAnalysis from './frequency_analysis';
import ApplySubstitution from './apply_substitution';

import {cipherAlphabet, clearAlphabet} from './common';

const rateLetters = 0.83;

const referenceLetterFrequencies = [
   {symbol: ' ', proba: 1 - rateLetters},
   {symbol: 'a', proba: 0.0812034849},
   {symbol: 'b', proba: 0.0090109472},
   {symbol: 'c', proba: 0.0334497677},
   {symbol: 'd', proba: 0.0366833299},
   {symbol: 'e', proba: 0.1713957515},
   {symbol: 'f', proba: 0.0106596728},
   {symbol: 'g', proba: 0.0086628177},
   {symbol: 'h', proba: 0.0073654812},
   {symbol: 'i', proba: 0.0757827046},
   {symbol: 'j', proba: 0.0054442497},
   {symbol: 'k', proba: 0.0004856863},
   {symbol: 'l', proba: 0.0545455020},
   {symbol: 'm', proba: 0.0296764091},
   {symbol: 'n', proba: 0.0709375766},
   {symbol: 'o', proba: 0.0540474291},
   {symbol: 'p', proba: 0.0302070784},
   {symbol: 'q', proba: 0.0136181215},
   {symbol: 'r', proba: 0.0655187521},
   {symbol: 's', proba: 0.0794667491},
   {symbol: 't', proba: 0.0724311434},
   {symbol: 'u', proba: 0.0636770558},
   {symbol: 'v', proba: 0.01628},
   {symbol: 'w', proba: 0.00114},
   {symbol: 'x', proba: 0.0038646285},
   {symbol: 'y', proba: 0.0030803592},
   {symbol: 'z', proba: 0.0013644851}
];
// Adjust the probability of letters vs. whitespace.
referenceLetterFrequencies.forEach(function (stat) {
   if (/[a-z]/.test(stat.symbol)) {
      stat.proba = stat.proba * rateLetters;
   }
});
referenceLetterFrequencies.sort(function (s1, s2) {
   const p1 = s1.proba, p2 = s2.proba;
   return p1 > p2 ? -1 : (p1 < p2 ? 1 : 0);
});
"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',.;:!?-+/=()$%&@".split('').forEach(function (c) {
   referenceLetterFrequencies.push({symbol: c, proba: 0});
});

const substRows = [
   referenceLetterFrequencies.slice(0, 27),
   referenceLetterFrequencies.slice(27, 53),
   referenceLetterFrequencies.slice(53, 80),
].map(row => row.map(c => clearAlphabet.ranks[c.symbol]));

export const setupTools = function (workspace) {

   const iTextDisplay = workspace.addTool(TextDisplay, function (scopes, scope) {
      // Set up the input scope for the tool's compute function.
      // Each scope inherits prototypically from the root scope.
      scope.inputText = scope.cipheredText;
      scope.alphabet = cipherAlphabet;
   }, {
      outputTextVariable: "texteChiffré"
   });

   const iTextInput = workspace.addTool(TextInput, function (scopes, scope) {
      scope.inputText = scope.cipheredText;
      scope.alphabet = cipherAlphabet;
   }, {
      inputTextVariable: "texteChiffré",
      outputTextVariable: "texteÉdité",
      text: undefined
   });

   const iFrequencyAnalysis = workspace.addTool(FrequencyAnalysis, function (scopes, scope) {
      scope.bigramAlphabet = cipherAlphabet;
      scope.targetAlphabet = clearAlphabet;
      scope.referenceFrequencies = referenceLetterFrequencies;
      scope.inputText = scopes[iTextInput].outputText;
      scope.substRows = substRows;
   }, {
      editedPairs: {}, // ex. {'01': 'E'}
      inputTextVariable: 'texteÉdité',
      outputSubstitutionVariable: 'substitutionÉditée',
      alwaysSwap: true
   });

   const iApplySubstitution = workspace.addTool(ApplySubstitution, function (scopes, scope) {
      scope.inputText = scopes[iTextDisplay].outputText;
      scope.substitution = scopes[iFrequencyAnalysis].outputSubstitution;
   }, {
      inputTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputClearTextVariable: 'texteDéchiffré'
   });

};

export const getRootScope = function (task) {
   return {
      ...task,
      cipheredText: task.cipher_text
   };
};

export const TabHeader = EpicComponent(self => {
   self.render = function () {
      return (
         <div>
            <p>
               Attention, <strong>l'onglet sujet contient des informations essentielles</strong>,
               lisez-le attentivement.
            </p>
            <p>
               Voici ci-dessous des outils pour vous aider à déchiffrer le message.
               Leur documentation est fournie dans l'onglet sujet.
            </p>
            <p>
               Pensez à enregistrer régulièrement avec le bouton en haut de la page,
               pour ne pas risquer de perdre votre travail.
            </p>
            <p>
               Pendant la première heure et demie, soumettez dans l'onglet réponses
               à chaque fois que vous pensez avoir déchiffré une information
               de plus parmi les 8 à fournir, car le temps compte.
            </p>
         </div>);
   };
});

export const AnswerDialog = EpicComponent(self => {

   let input1, input2;
   const refInput1 = el => { input1 = el; };
   const refInput2 = el => { input2 = el; };

   const onSubmit = function () {
      self.props.submit({input1: input1.value, input2: input2.value});
   };

   self.componentDidMount = function () {
      // When the component mounts, select the first input box.
      input1 && input1.focus();
   };

   self.render = function () {
      const {task, answers, feedback, onSuccess} = self.props;
      return (
         <div className='task-answer-dialog'>
            {task.expectedAnswer
             ? <div className='section'>
                  <p>Le tour est terminé, voici la réponse qui était attendue
                     pour obtenir le maximum de points :</p>
                  <pre>{task.expectedAnswer.join('\n')}</pre>
               </div>
             : <div className='section'>
                  <p>
                     Entrez ci-dessous les deux parties de votre réponse, puis
                     cliquez sur le bouton Soumettre pour l'enregistrer.
                  </p>
                  <p>
                     Vous pouvez soumettre plusieurs réponses. La seule limite est
                     que vous ne pouvez pas soumettre plus de deux fois en moins
                     d'une minute.
                  </p>
                  <p className="input">
                     <label htmlFor="answer-1">{'Les 7 premières lignes du texte déchiffré : '}</label>
                     <textarea id="answer-1" ref={refInput1} style={{height: '146px', width: '400px', verticalAlign: 'top'}}></textarea>
                     <label htmlFor="answer-2">{'Le numéro fourni sur la dernière ligne, une fois déchiffré, en chiffres : '}</label>
                     <input type="text" id="answer-2" ref={refInput2} style={{width: '300px', verticalAlign: 'top'}} />
                  </p>
                  <p><Button onClick={onSubmit}>Soumettre</Button></p>
               </div>}
            {feedback && <Feedback feedback={feedback} onSuccess={onSuccess}/>}
            <div className='section'>
               {answers}
            </div>
            <div className='section'>
               <p>
                  Les 7 informations fournies au début du texte sont à fournir en un seul bloc sur 7 lignes. Mettez toujours les 7 lignes du début du texte déchiffré, sans retirer les lignes qui ne sont pas encore correctement déchiffrées.
               </p>
               <p>
                  Chaque ligne sera notée individuellement lors du calcul du score après la clôture du concours. Les éventuelles différences d'espaces seront ignorées lors de la comparaison entre les réponses fournies et celles attendues.
               </p>
               <p>
                  Chaque information correcte rapportera 200 points, donc le score maximum possible pour ce tour est de 1600 points.
               </p>
               <p>
                  Votre score sera celui de la toute dernière réponse que vous avez fournie.
               </p>
               <p>
                  En cas d'ex-aequo, les réponses fournies lors de la première heure et demie seront prise en compte comme expliqué dans le <a href="http://concours-alkindi.fr/#/pageManual" target="_blank">manuel du concours</a>
               </p>
            </div>
         </div>
      );
   };

});


export const Answer = EpicComponent(self => {
   self.render = function () {
      const {answer} = self.props;
      const {input1, input2} = answer;
      return (
         <div>
            <span><pre>{input1}{'\n'}{input2}</pre></span>
         </div>
      );
   };
});


export const Feedback = EpicComponent(self => {
   self.render = function () {
      const {feedback, onSuccess} = self.props;
      return (
         <div>
            <p>Votre réponse a bien été enregistrée.</p>
         </div>
      );
   };
});


export const Task = EpicComponent(self => {
   self.render = function () {
      const {task, assetUrl} = self.props;
      return (<div>
         <p>
            Votre but est de l'aider à déchiffrer ce texte. Vous devrez y trouver sept informations différentes.
         </p>
         <p>
            Les sept premières informations sont le contenu exact de chacune des 7 premières lignes du texte, une fois déchiffré.
         </p>
         <p>
            La huitième information est un numéro de téléphone, fourni sur la dernière ligne du texte.
         </p>
         <h2>Méthode de chiffrement : substitution</h2>
         <p>
            La méthode utilisée est un chiffrement par substitution, où sauf pour les retours à la ligne, chacun des caractères du texte d'origine a été remplacé par deux chiffres.
         </p>
         <p>
            Tous les caractères du texte sont des lettres minuscules non accentuées, des lettres majuscules non accentuées, des chiffres, des espaces et des caractères spéciaux parmi ' , . ; : ! ? - + / = ( ) $ % & et @, soit 80 caractères différents possibles (pas forcément tous présents dans le texte), remplacés par les chaînes "01" à "80" selon une substitution que vous devez trouvez.
         </p>
         <p>
            Avant le chiffrement du texte complet, le numéro de téléphone fourni sur la dernière ligne a subi un premier chiffrement utilisant une méthode que vous devrez déterminer vous-mêmes, sans outil supplémentaire.
         </p>

         <h2>Outils</h2>
         <p>
            Les outils pour ce sujet sont assez basiques :
         </p>
         <ol>
            <li>
               <p>Un outil qui affiche le texte d'origine</p>
            </li>

            <li>
               <p>Un outil qui permet d'éditer le texte d'origine.</p>
               <p>
                  Vous pouvez éditer directement le contenu, il s'agit d'une simple zone de texte. Vous pouvez ainsi ajouter ou supprimer du texte. Éditer le texte permet de choisir sur quelle partie du texte l'outil suivant s'applique.
               </p>
               <p>
                  Si le texte modifié contient autre chose que des paires de chiffres entre "01" et "80", des retours à la ligne et des espaces, un message d'erreur sera affiché, indiquant où se trouve l'erreur.
               </p>
               <p>
                  Il est possible de revenir à tout moment au texte d'origine en cliquant sur le bouton "réinitaliser avec texteChiffré"
               </p>
            </li>
            <li><p>Un outil qui analyse les fréquences du texte modifié et permet d'éditer la substitution</p>
               <p>
                  Cet outil analyse la fréquence de chaque bigramme entre "01" et "80" dans le texte édité dans l'outil précédent.
               </p>
               <p>
                  Les bigrammes sont représentés sur trois lignes dans l'ordre de leur fréquence décroissante, indépendamment du symbole qu'ils représentent.
               </p>
               <p>
                Ils sont mis en correspondance avec les symboles possibles du texte d'origine :
               </p>
               <ul>
                   <li>
                      <p>première ligne : l'espace et toutes les lettres minuscules par ordre décroissant de leur fréquence en langue française.</p>
                   </li>
                   <li>
                      <p>deuxième ligne : toutes les lettres majuscules, par ordre alphabétique.</p>
                   </li>
                   <li>
                      <p>troisième ligne : les chiffres de 0 à 9, et autres symboles.</p>
                   </li>
               </ul>
               <p>
                  Une barre noire au dessus de chaque bigramme représente la fréquence de ce bigramme dans le texte édité.
               </p>
               <p>
                  Sur la première ligne uniquement, une barre noire en dessous de l'espace et de chaque lettre minuscule représente sa fréquence dans la langue française.
               </p>
               <p>
                  Les symboles autres que les lettres minuscules ne sont pas triés par fréquence et n'ont pas de barre noire en dessous, car leur fréquence en langue française n'est pas significative pour ce sujet.
               </p>
               <p>
                  Vous pouvez glisser chaque bigramme vers le symbole qui vous semble correspondre parmi les trois lignes de symboles. Les bigrammes ainsi déplacés sont représentés sur fond gris foncé.
               </p>
               <p>
                  <strong>Attention :</strong> si vous cliquez sur "réinitialiser", toutes vos modifications seront perdues. De même, si vous modifiez le texte édité, la substitution sera modifiée automatiquement.
               </p>
            </li>
            <li>
               <p>
                  Un outil d'affichage du texte après application de la substitution.
               </p>
               <p>
                  Dans cet outil on applique la substitution de l'outil précédent sur le texte d'origine (et non le texte édité), et affiche le résultat.
               </p>
               <p>
                  Les caractères correspondant à des parties modifiées de la substitution sont représentés sur fond gris.
               </p>
            </li>
         </ol>
      </div>);
   };
});
