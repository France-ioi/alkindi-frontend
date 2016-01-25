import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';

import TextInput from './text_input';
import Hints from './hints';
import EnumeratePermutations from './enumerate_permutations';
import ApplyPermutation from './apply_permutation';
import FrequencyAnalysis from './frequency_analysis';
import ApplySubstitution from './apply_substitution';

import {clearAlphabet, adfgxAlphabet, bigramAlphabet} from './common';
import {asset_url} from '../assets';

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

export const getRootScope = function (task) {
   return {
      ...task,
      clearAlphabet,
      adfgxAlphabet,
      bigramAlphabet,
      cipheredText: task.cipher_text,
      substitutionGridHints: task.substitution_grid,
      permutationHints: task.permutation
   };
};

export const AnswerDialog = EpicComponent(self => {

   let city, metal1, metal2, metal3;
   const refCity = el => { city = el; };
   const refMetal1 = el => { metal1 = el; };
   const refMetal2 = el => { metal2 = el; };
   const refMetal3 = el => { metal3 = el; };

   const onSubmit = function () {
      self.props.submit({
         c: city.value, m1: metal1.value, m2: metal2.value, m3: metal3.value
      });
   };

   self.componentDidMount = function () {
      // When the component mounts, select the first input box.
      city && city.focus();
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


export const Answer = EpicComponent(self => {

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


export const Feedback = EpicComponent(self => {

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
             : (feedback.metals
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


export const Task = EpicComponent(self => {

   self.render = function () {
      const {task} = self.props;
      const lines = task.cipher_text.match(/.{1,40}/g);
      return (<div>

   <p>
   Après avoir déchiffré le message du tour précédent, votre amie Alice a trouvé un nouveau message, chiffré différemment. Allez lire la <a href="http://concours-alkindi.fr/#/pageBD" target="_blank">bande dessinée</a> de la suite de son aventure quand vous avez un peu de temps.
   </p>
   <p>
   Voici le texte du message :
   </p>
   <div className="y-scrollBloc adfgx-text" style={{width:'480px',margin:'0 auto 15px'}}>
      {lines.map((line, i) => <div key={i} className="adfgx-line">{line}</div>)}
   </div>

   <p>
      Votre but est de l'aider à déchiffrer ce texte. Vous devez y trouver le nom d'une ville et trois noms de métaux.
   </p>
   <p>
      Comme pour le tour précédent, vous disposez d'outils pour vous aider et pouvez obtenir des indices.
   </p>
   <p>
      Il n'y a plus d'entraînement cette fois, mais vous pouvez effectuer autant de tentatives en temps limité que vous le souhaitez. Pour chaque tentative, vous disposez d'1h30 pour tenter de déchiffrer le message en utilisant le moins d'indices possible.
   </p>
   <p>
      Comme pour le tour précédent, votre score sera le meilleur score parmi toutes vos tentatives en temps limité.
   </p>

   <h2>Méthode de chiffrement ADFGX</h2>

   <p>
      Votre amie a reconnu la méthode utilisée pour chiffrer le message. Il s'agit du chiffrement ADFGX. Vous ne disposez pas de la clé.
   </p>
   <p>
      Pour chiffrer et déchiffrer un message avec la méthode ADFGX on doit se munir :
   </p>
   <ol>
      <li>
         <p>d'une grille secrète (la clé-grille) : on place toutes les lettres de l'alphabet sauf W dans une grille 5x5 pour laquelle les lignes et les colonnes portent des étiquettes A, D, F, G et X, par exemple :</p>
         <p className="text-center"><img src={asset_url("adfgx/grille_1.png")} style={{width:'280px'}} title=""/></p>
      </li>
      <li>
         <p>d'une permutation secrète (la clé-permutation) : en mathématiques une permutation de taille n est une façon de réordonner n objets. Voici un exemple de permutation de taille 6 :</p>
         <p className="text-center"><img src={asset_url("adfgx/permutation_1.png")} style={{width:'400px'}} title=""/></p>
         <p>Cette permutation est notée en mathématiques :</p>
         <p className="text-center"><img src={asset_url("adfgx/permutation_maths.png")} style={{width:'150px'}} title=""/></p>
         <p>En informatique, on la note [4,1,5,2,3,6]. Nous utiliserons la notation informatique dans les outils.</p>
      </li>
   </ol>
   <h2>Étapes du chiffrement</h2>
   <p>Voici les étapes successives du chiffrement, que nous allons illustrer sur le message &laquo;à Georges Painvin !&raquo; :</p>
   <ol>
      <li>
         <p>Le message est converti en majuscules et les accents retirés. Les espaces et les signes de ponctuation sont supprimés. Tous les W sont remplacés par des V.</p>
         <p>Notre message devient : &laquo;AGEORGESPAINVIN&raquo; </p>
      </li>
      <li>
         <p>On s'assure que le message a bien un nombre de lettres multiple de 3 en ajoutant des lettres à la fin si nécessaire. Dans cette épreuve le message aura toujours un nombre de lettres multiple de 3.</p>
         <p>Notre message reste &laquo;AGEORGESPAINVIN&raquo; </p>
      </li>
      <li>
         <p>On cherche chaque lettre du message dans la grille et on la remplace par deux lettres : l'étiquette de sa ligne puis l'étiquette de sa colonne dans la grille.</p>
         <p>Par exemple, dans la grille ci-dessous O est chiffré par DF :</p>
         <p className="text-center"><img src={asset_url("adfgx/grille_2.png")} title=""/></p>
         <p>En appliquant cette procédure sur toutes les lettres de notre message &laquo;AGEORGESPAINVIN&raquo;, il devient &nbsp;&laquo;XXFGADDFAFFGADFADGXXDDXGXDDDXG&raquo;. On appelle ce nouveau texte le message intermédiaire.</p>
      </li>
      <li>
         <p>On écrit les lettres du message intermédiaire, qui sont uniquement des A, D, F, G et X sur six lignes comme ci-dessous : XXFGAD va sur la première colonne, DFAFFG sur la deuxième et ainsi de suite.</p>
         <p style={{textAlign:'center',fontFamily:'monospace',fontSize:'20px'}}>
            X &nbsp;D &nbsp;A &nbsp;X &nbsp;X<br/>
            X &nbsp;F &nbsp;D &nbsp;X &nbsp;D<br/>
            F &nbsp;A &nbsp;F &nbsp;D &nbsp;D<br/>
            G &nbsp;F &nbsp;A &nbsp;D &nbsp;D<br/>
            A &nbsp;F &nbsp;D &nbsp;X &nbsp;X<br/>
            D &nbsp;G &nbsp;G &nbsp;G &nbsp;G
         </p>
      </li>
      <li>
         <p>On applique notre permutation en l'inscrivant sur le côté des lignes à gauche, puis en triant les lignes selon ces valeurs. Ainsi pour la permutation [4, 1, 5, 2, 3 6], la 1ère ligne va à la 4e position, la ligne 2 va à la 1ère position, la ligne 3 à la 5e position, la 4e à la 2e position et la 5e à la 3e position, tandis que la 6e reste sur place</p>
         <p className="text-center"><img src={asset_url("adfgx/permutation_2.png")} title=""/></p>
      </li>
      <li>
         <p>
         On lit ensuite le message ligne par ligne dans la grille obtenue, à droite.<br/>
         Dans notre exemple on lit donc la 1e ligne XFDXD, puis GFADD, AFDXX, XDAXX, FAFDD et enfin DGGGG, ce qui donne le message chiffré : &laquo;XFDXDGFADDAFDXXXDAXXFAFDDDGGGG&raquo;.</p>
      </li>
   </ol>
   <h2>Déchiffrement</h2>
   <p>Pour déchiffrer un message chiffré par ADFGX lorsque l'on dispose de la clé, il faut effectuer les étapes inverses :</p>
   <ol>
      <li>
         <p>découper le message en 6 lignes de longueur égale ;</p>
      </li>
      <li>
         <p>permuter les lignes en appliquant la permutation inverse de celle utilisée pour chiffrer. Par exemple la permutation inverse de [4,1,5,2,3,6] est [2,4,5,1,3,6] ;</p>
         <p>
         Pour calculer l’inverse d’une permutation, on l’écrit sous la notation mathématique, on échange la rangée de haut et celle de bas et ensuite on trie les colonnes dans l’ordre des valeurs de la rangée qui est maintenant en haut. Par exemple quand on échange la rangée de haut et de bas pour [4,1,5,2,3,6] on trouve
         </p>
         <p className="text-center"><img src={asset_url("adfgx/permutation_maths_2.png")} style={{width:'150px'}} title=""/></p>
         <p>
         et quand on trie les colonnes dans l’ordre des valeurs de la première rangée, on obtient la permutation inverse :
         </p>
         <p className="text-center"><img src={asset_url("adfgx/permutation_maths_3.png")} style={{width:'150px'}} title=""/></p>
         <p>
            ou [2,4,5,1,3,6] en notation informatique ;
         </p>
      </li>
      <li>
         <p>lire le texte colonne par colonne, ce qui donne le texte intermédiaire ;</p>
      </li>
      <li>
         <p>déchiffrer chaque paire de lettres du texte intermédiaire en utilisant la grille. Par exemple DF donne O dans notre exemple.</p>
      </li>
   </ol>

      </div>);
   };

});
