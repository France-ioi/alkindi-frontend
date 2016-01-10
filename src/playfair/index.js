import React from 'react';
import {PureComponent} from './utils/generic';
import {mostFrequentFrench, decodeBigram} from './utils/bigram';
import {Button} from 'react-bootstrap';

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

export const Answer = PureComponent(self => {

   let address, number1, number2;
   const refAddress = el => { address = el; };
   const refNumber1 = el => { number1 = el; };
   const refNumber2 = el => { number2 = el; };

   const onSubmit = function () {
      self.props.submit({
         a: address.value, n1: number1.value, n2: number2.value
      });
   };

   self.render = function () {
      return (
        <div className='section playfair-answer'>
          <p className="input">
            <label htmlFor="answer-a">{'Adresse : '}</label>
            <input type="text" id="answer-a" ref={refAddress} />
          </p>
          <p className="input">
            <label htmlFor="answer-n1">{'Nombre 1 : '}</label>
            <input type="text" id="answer-n1" ref={refNumber1} />
          </p>
          <p className="input">
            <label htmlFor="answer-n2">{'Nombre 2 : '}</label>
            <input type="text" id="answer-n2" ref={refNumber2} />
          </p>
          <p><Button onClick={onSubmit}>Soumettre</Button></p>
        </div>
      );
   };

});

export default PlayFair;
