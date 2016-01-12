import React from 'react';
import {PureComponent} from './utils/generic';
import {mostFrequentFrench, decodeBigram} from './utils/bigram';
import {Alert, Button} from 'react-bootstrap';

import TextInput from './tools/text_input';
import Hints from './tools/hints';
import SubstitutionFromGrid from './tools/substitution_from_grid';
import BigramFrequencyAnalysis from './tools/bigram_frequency_analysis';
import EditSubstitution from './tools/edit_substitution';
import ApplySubstitution from './tools/apply_substitution';

const getTools = function () {

  const tools = [];
  const defaultMergeState = function (state, update) {
    return {...state, ...update};
  };
  const addTool = function (tools, spec) {
    const {factory, initialState, getScope} = spec;
    const tool = {};
    tool.mergeState = defaultMergeState;
    factory(tool);
    tool.getScope = getScope;
    tools.push(tool)
  };
  addTool(tools, {
    factory: TextInput,
    getScope: function (task, _toolState, scopes) {
      let {alphabet, cipheredText} = task;
      return {alphabet, text: cipheredText};
    }
  });
  addTool(tools, {
    factory: Hints,
    getScope: function (task, _toolState, scopes) {
      const {alphabet, hintsGrid, score, getQueryCost, getHint} = task;
      return {alphabet, hintsGrid, score, getQueryCost, getHint};
    }
  });
  addTool(tools, {
    factory: SubstitutionFromGrid,
    getScope: function (task, _toolState, scopes) {
      const {alphabet} = task;
      return {
        alphabet: alphabet,
        inputGrid: scopes[1].outputGrid
      };
    }
  });
  addTool(tools, {
    factory: EditSubstitution,
    getScope: function (task, _toolState, scopes) {
      const {alphabet} = task;
      return {
        alphabet: alphabet,
        inputCipheredText: scopes[0].output,
        inputSubstitution: scopes[2].outputSubstitution
      };
    }
  });
  addTool(tools, {
    factory: BigramFrequencyAnalysis,
    getScope: function (task, _toolState, scopes) {
      const {alphabet} = task;
      const decodedMostFrequentFrench = mostFrequentFrench.map(decodeBigram.bind(null, alphabet));
      return {
        alphabet: alphabet,
        inputCipheredText: scopes[0].output,
        mostFrequentFrench: decodedMostFrequentFrench,
        inputSubstitution: scopes[3].outputSubstitution
      };
    }
  });
  addTool(tools, {
    factory: ApplySubstitution,
    getScope: function (task, _toolState, scopes) {
      const {alphabet} = task;
      return {
        alphabet: alphabet,
        inputText: scopes[0].output,
        inputSubstitution: scopes[3].outputSubstitution
      };
    }
  });

  return tools;
};

export const PlayFair = PureComponent(self => {

  const tools = getTools();

  const setToolState = function (id, update) {
    const tool = tools[id];
    const toolState = self.props.toolStates[id];
    const newState = tool.mergeState(toolState, update);
    self.props.setToolState(id, newState);
  };
  for (var i = 0; i < tools.length; i++) {
    tools[i].setState = setToolState.bind(null, i);
  }

  self.render = function () {
    const {task, toolStates} = self.props;
    const scopes = [];
    const renderTool = function (tool, i) {
      const toolState = toolStates[i];
      const scope = tool.getScope(task, toolState, scopes);
      tool.compute(toolState, scope);
      scopes.push(scope);
      const {Component, setState} = tool;
      return (<Component key={i} toolState={toolState} scope={scope} setToolState={setState} />);
    };
    return <div>{tools.map(renderTool)}</div>;
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

  self.render = function () {
    const {feedback, onSuccess} = self.props;
    return (
      <div className='playfair-feedback'>
        {feedback.address
         ? (feedback.numbers
            ? <div>
                <Alert bsStyle='success'>
                  Félicitations, vos réponses sont correctes !
                </Alert>
                <p>
                  Vous avez atteint le score maximum que vous pouvez obtenir à
                  cette épreuve, compte tenu des indices que vous avez obtenus.
                </p>
                <p className="text-center">
                  <Button bsStyle="primary" bsSize="large" onClick={onSuccess}>
                    <i className="fa fa-left-arrow"/> retour aux épreuves
                  </Button>
                </p>
              </div>
            : <Alert bsStyle='warning'>L'adresse est la bonne, mais au moins un des deux nombres est faux.</Alert>)
         : (feedback.numbers
            ? <Alert bsStyle='warning'>Les deux nombres sont les bons, mais l'adresse est fausse.</Alert>
            : <Alert bsStyle='danger'>Ni l'adresse ni les nombres ne sont les bons.</Alert>)}
      </div>
    );
  };

});

export default PlayFair;
