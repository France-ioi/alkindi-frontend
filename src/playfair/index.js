import React from 'react';
import {Alert, Button} from 'react-bootstrap';

import {PureComponent} from '../misc';
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

  const iHints = addTool(Hints, function (scopes, scope) {
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


const TabContent = PureComponent(self => {

  const getQueryCost = function (query) {
    if (query.type === "grid")
      return 10;
    if (query.type === "alphabet")
      return 10;
    return 0;
  };

  const alphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ');

  self.render = function () {
    const {header, workspace, task} = header;
    const rootScope = {
      alphabet: alphabet,
      score: task.score,
      cipheredText: task.cipher_text,
      hintsGrid: task.hints,
      getQueryCost: getQueryCost,
      getHint: task.getHint
    };
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
        {header}
        {workspace.render(rootScope)}
      </div>
    );
  };

});


export const AnswerDialog = PureComponent(self => {

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


export const Answer = PureComponent(self => {

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


export const Feedback = PureComponent(self => {

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
