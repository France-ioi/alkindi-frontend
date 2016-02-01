import React from 'react';
import EpicComponent from 'epic-component';
import {Alert, Button} from 'react-bootstrap';

import {makeAlphabet} from '../utils/cell';
import {mostFrequentFrench, decodeBigram} from '../utils/bigram';

import TextInput from './text_input';
import Hints from './hints';
import SubstitutionFromGrid from './substitution_from_grid';
import BigramFrequencyAnalysis from './bigram_frequency_analysis';
import EditSubstitution from './edit_substitution';
import ApplySubstitution from './apply_substitution';

// PlayFair default wiring.
export const setupTools = function (workspace) {

   const iTextInput = workspace.addTool(TextInput, function (scopes, scope) {
      scope.text = scope.cipheredText;
   }, {
      outputVariable: "texteChiffré"
   });

   const iHints = workspace.addTool(Hints, function (scopes, scope) {
   }, {
      outputGridVariable: "lettresGrilleIndices"
   });

   const iSubstitutionFromGrid = workspace.addTool(SubstitutionFromGrid, function (scopes, scope) {
      scope.inputGrid = scopes[iHints].outputGrid;
   }, {
      editGrid: [[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}]],
      inputGridVariable: 'lettresGrilleIndices',
      outputGridVariable: 'lettresGrilleEditée',
      outputSubstitutionVariable: 'substitutionGénérée'
   });

   const iEditSubstitution = workspace.addTool(EditSubstitution, function (scopes, scope) {
      scope.inputCipheredText = scopes[iTextInput].output;
      scope.inputSubstitution = scopes[iSubstitutionFromGrid].outputSubstitution;
   }, {
      nbLettersPerRow: 29,
      inputCipheredTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionGénérée',
      outputSubstitutionVariable: 'substitutionÉditée',
      substitutionEdits: []
   });

   workspace.addTool(BigramFrequencyAnalysis, function (scopes, scope) {
      scope.inputCipheredText = scopes[iTextInput].output;
      scope.mostFrequentFrench = mostFrequentFrench.map(decodeBigram.bind(null, scope.alphabet));
      scope.inputSubstitution = scopes[iEditSubstitution].outputSubstitution;
   }, {
      inputCipheredTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputSubstitutionVariable: 'substitutionFréquences',
      substitutionEdits: [],
      editable: false,
      nBigrams: 10
   });

   workspace.addTool(ApplySubstitution, function (scopes, scope) {
      scope.inputText = scopes[iTextInput].output;
      scope.inputSubstitution = scopes[iEditSubstitution].outputSubstitution;
   }, {
      nbLettersPerRow: 29,
      inputTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputTextVariable: 'texteDéchiffré'
   });

};

const alphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ');

const getQueryCost = function (query) {
   return 50;
};


export const getRootScope = function (task) {
   return {
      ...task,
      alphabet,
      getQueryCost,
      cipheredText: task.cipher_text,
      hintsGrid: task.hints
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
               {'Voici ci-dessous des outils pour vous aider à déchiffrer le message, '}
               {'leur documentation est '}
               <a href="http://concours-alkindi.fr/docs/tour2-outils.pdf" title="documentation des outils au format .PDF" target="new">
                  {'disponible en téléchargement '}
                  <i className="fa fa-download"/>
               </a>.</p>
            <p>Une fois que vous avez déchiffré le message, entrez votre réponse dans l'onglet Réponses.</p>
         </div>);
   };
});

export const AnswerDialog = EpicComponent(self => {

   let address, number1, number2;
   const refAddress = el => { address = el; };
   const refNumber1 = el => { number1 = el; };
   const refNumber2 = el => { number2 = el; };

   const onSubmit = function () {
      self.props.submit({
         a: address.value, n1: number1.value, n2: number2.value
      });
   };

   self.componentDidMount = function () {
      // When the component mounts, select the first input box.
      address && address.focus();
   };


   self.render = function () {
      const {answers, feedback, onSuccess} = self.props;
      return (
         <div className='playfair-answer-dialog'>
            <div className='section'>
               <p>
                  Entrez ci-dessous les trois parties de votre réponse, puis
                  cliquez sur le bouton Soumettre pour connaître le score obtenu.
               </p>
               <p>
                  Vous pouvez soumettre plusieurs réponses. La seule limite est
                  que vous ne pouvez pas soumettre plus de deux fois en moins
                  d'une minute.
               </p>
               <p className="input">
                  <label htmlFor="answer-a">{'Adresse : '}</label>
                  <input type="text" id="answer-a" ref={refAddress} />
                  <span>{' (le numéro doit être en chiffres ; par exemple : 125 RUE DE LA PAIX)'}</span>
               </p>
               <p className="input">
                  <label htmlFor="answer-n1">{'Nombre 1 : '}</label>
                  <input type="text" id="answer-n1" ref={refNumber1} />
                  <span>{' (il doit contenir 2 chiffres)'}</span>
               </p>
               <p className="input">
                  <label htmlFor="answer-n2">{'Nombre 2 : '}</label>
                  <input type="text" id="answer-n2" ref={refNumber2} />
                  <span>{' (il doit contenir 3 chiffres)'}</span>
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
                  minuscules/majuscules, de W à la place de V ou vice-versa,
                  et de X en trop ou manquants sont ignorées lors de la
                  comparaison entre l'adresse fournie et celle attendue.
               </p>
               <p>Le score est calculé comme suit :</p>
               <ul>
                  <li>vous partez d'un capital de 500 points ;</li>
                  <li>10 points sont retirés de ce capital pour chaque indice
                      demandé avant votre réponse ;</li>
                  <li>si vous avez à la fois la bonne adresse et les deux nombres,
                     votre score est égal au capital restant ;</li>
                  <li>si vous n'avez que l'adresse, ou bien que les deux nombres,
                      votre score est égal à la moitié du capital restant.</li>
               </ul>
               <p>Autres remarques sur les scores :</p>
               <ul>
                  <li>le score de l'équipe pour un sujet est le meilleur score
                      parmi toutes les soumissions ;</li>
                  <li>obtenir un score non nul à l'entraînement permettra à
                      l'équipe d'accéder aux sujets en temps limité ;</li>
                  <li>le score du tour est le meilleur score obtenu parmi les
                      trois sujets en temps limité</li>
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
         <div className='playfair-answer'>
            <span className='playfair-address'>{answer.a}</span>{' • '}
            <span className='playfair-number1'>{answer.n1}</span>{' • '}
            <span className='playfair-number2'>{answer.n2}</span>
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
         <div className='playfair-feedback'>
            {feedback.address
             ? (feedback.numbers
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
                           <p>L'adresse est la bonne, mais au moins un des deux nombres est faux.</p>
                           {halfScore}
                        </Alert>
                     </div>)
             : (feedback.numbers
                  ? <div>
                        <Alert bsStyle='warning'>
                           <p>Les deux nombres sont les bons, mais l'adresse est fausse.</p>
                           {halfScore}
                        </Alert>
                     </div>
                  : <Alert bsStyle='danger'>Ni l'adresse ni les nombres ne sont les bons.</Alert>)}
         </div>
      );
   };

});


export const Task = EpicComponent(self => {

   self.render = function () {
      const {task} = self.props;
      const lines = task.cipher_text.match(/.{1,40}/g);
      return (
         <div className="playfair-task">
            <div className="playfair-annonces">
               <p className="playfair-title">Annonces :</p>
               <ul>
                  <li>Le concours est prolongé jusqu'au samedi 23 janvier à 20h</li>
               </ul>
            </div>
            <p>
               {"Votre amie Alice a récupéré une pochette contenant un message chiffré (allez lire la" }
               <a href="http://concours-alkindi.fr/#/pageBD" title="bande dessinée d'introduction du concours" target="new">
                  {" bande dessinée de son aventure"}
               </a>
               {" quand vous avez un peu de temps). "}
               {"Voici le texte du message :"}
            </p>
            <div className="y-scrollBloc playfair-text" style={{width:'480px',margin:'0 auto 15px'}}>
               {lines.map((line, i) => <div key={i} className="playfair-line">{line}</div>)}
            </div>
            <p>{"Votre but est de l’aider à déchiffrer ce texte. Vous devez y trouver une adresse et deux nombres à calculer pour accéder à un coffre."}</p>
            <p>{"Alice a remarqué plusieurs éléments qui vont vous aider :"}</p>
            <p><strong>{"Prénom :"}</strong>{" sur la pochette se trouve le prénom du destinataire du message : <strong>${firstname}</strong>. Notez que ce prénom n’est probablement pas présent dans le message, mais pourra vous être utile."}</p>
            <p><strong>{"Type de chiffrement :"}</strong>{" il s’agit du chiffrement appelé Playfair, qui est décrit plus bas."}</p>
            <p><strong>{"Outils :"}</strong>{" dans l’onglet “cryptanalyse” accessible en haut de votre interface, vous disposez d’outils pour vous aider à déchiffrer le message (voir lien vers la documentation en haut de cette page)."}</p>
            <p><strong>{"Indices :"}</strong>{" le deuxième de ces outils permet d’obtenir des indices. Chaque indice retire 10 points au score que vous obtiendrez après avoir résolu le sujet. Initialement vous avez un capital de 500 points. Il est difficile de réussir sans indices, donc n’hésitez pas à en demander quelques-uns en les choisissant bien. Assurez-vous cependant que votre équipe est d’accord sur votre stratégie avant de demander des indices."}</p>
            <p><strong>{"Entraînement et tentatives :"}</strong>{" au départ vous avez un sujet d’entraînement à résoudre sans limite de temps. Le score obtenu sur ce sujet ne compte pas (c’est seulement pour vous donner une indication). Une fois résolu, vous aurez 3 tentatives pour résoudre en 1 heure à chaque fois un sujet avec un message un peu différent, chiffré selon le même principe, mais une clé différente (la grille Playfair) et bien sûr une adresse et des nombres à trouver différents. À chaque tentative, vous repartez d’une grille presque vide et d’un capital de 500 points."}</p>
            <p><strong>{"La méthode de chiffrement de Playfair :"}</strong>{" voici quelques explications sur les points importants de la méthode qui a été utilisée pour chiffrer le message."}</p>
            <ol className="clearfix">
               <li><p>{"Le message a été converti en majuscules et les accents retirés, alors que les espaces et les signes de ponctuation sont laissés tels quels."}</p></li>
               <li><p>{"Tous les W du message ont été remplacés par des V."}</p></li>
               <li>
                  <p>{"Le texte a ensuite été découpé en paires de lettres successives, appelées <strong>bigrammes</strong>. Ainsi le texte “MON TEXTE” est découpé en 4 bigrammes, “MO”, “NT, “EX”, “TE”."}</p>
                  <p>{"Pour éviter des bigrammes consitués de deux fois la même lettre, des X sont insérés dans le texte entre certaines lettres doubles. Ainsi, le texte “BELLE” devient “BE”, “LX”, “LE”. Par contre le texte “ELLE” devient “EL” “LE” car les deux L ne tombent pas dans le même bigramme donc il n’est pas utile d’insérer un X.."}</p>
               </li>
               <li>
                  <p>{"Une grille de 5x5 cases a été remplie avec les lettres de l’alphabet sauf le W. Dans notre cas, considérez que les lettres ont été placées au hasard."}</p>
               </li>
               <li>
                  <p>{"Chaque bigramme du texte est remplacé par un bigramme chiffré en utilisant la position des lettres de l’alphabet dans la grille. Par exemple pour “MO”, on a trois cas possibles :"}</p>
                  <ol>
                     <li>
                     <p>{"si le M et le O ne sont ni sur la même ligne, ni sur la même colonne :"}</p>
                     <table className="playfair-outer"><tbody>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td colSpan='4' rowSpan='2' className="playfair-redBorder">
                              <table><tbody>
                                 <tr>
                                    <td className="playfair-background">O</td>
                                    <td></td>
                                    <td></td>
                                    <td>R</td>
                                 </tr>
                                 <tr>
                                    <td>C</td>
                                    <td></td>
                                    <td></td>
                                    <td className="playfair-background">M</td>
                                 </tr>
                              </tbody></table>
                           </td>
                        </tr>
                        <tr>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                     </tbody></table>
                     <p>{"Les deux lettres définissent alors les deux coins d’un rectangle, représenté en rouge dans l’exemple de grille (incomplète) ci-contre. Pour chiffrer “MO”, on remplace alors le M et le O par les lettres situées aux 2 autres coins du rectangle, en prenant pour chaque lettre du bigramme d’origine la lettre du coin situé sur la même ligne, donc C pour M et R pour O dans notre exemple. Le bigramme “MO” est donc chiffré en “CR” pour cet exemple de grille. Le bigramme “RC” est chiffré “OM”, etc."}</p>
                     <p>{"Pour déchiffrer un bigramme de ce type, on fait exactement la même chose. Déchiffrer “CR” donne “MO”."}</p>
                  </li>
                  <li>
                     <p>{"Si le M et le O sont sur la même ligne."}</p>
                     <table className="playfair-outer"><tbody>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td>{"S"}</td>
                           <td></td>
                           <td className="playfair-background">{"O"}</td>
                           <td>{"T"}</td>
                           <td className="playfair-background">{"M"}</td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                     </tbody></table>
                     <p>{"Chaque lettre du bigramme est alors remplacée par la lettre qui se trouve juste à sa droite sur la même ligne, ou bien si l’on est sur la dernière colonne, la lettre qui se trouve à la première colonne de la même ligne."}</p>
                     <p>{"Ainsi pour l’exemple (incomplet) de grille ci-contre, le bigramme “MO” serait chiffré en “ST”"}</p>
                     <p>{"Pour déchiffrer un bigramme, il faut faire le contraire et prendre la lettre à gauche de chaque lettre. “ST” redevient alors “MO”."}</p>
                  </li>
                  <li>
                     <p>{"Si le M et le O sont sur la même colonne."}</p>
                     <table className="playfair-outer"><tbody>
                        <tr>
                           <td></td>
                           <td></td>
                           <td>{"K"}</td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td className="playfair-background">{"M"}</td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td>{"T"}</td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td className="playfair-background">{"O"}</td>
                           <td></td>
                           <td></td>
                        </tr>
                     </tbody></table>
                     <p>{"Le principe est similaire, sauf que pour chiffrer chaque lettre du bigramme, on prend la lettre juste en dessous (ou sur la première ligne si on est déjà en bas), et pour déchiffrer, on fait l’inverse."}</p>
                     <p>{"Dans l’exemple (incomplet) de grille ci-contre, le bigramme “MO” est chiffré en “TK”."}</p>
                  </li>
                  </ol>
               </li>
            </ol>
            <p>{"Voilà, vous avez toutes les informations utiles en votre possession. À vous de jouer. Bonne chance !"}</p>
         </div>);
   };

});
