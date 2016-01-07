import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';

import {PureComponent} from './utils';
import TextInput from './tools/text_input';
import Hints from './tools/hints';
import SubstitutionFromGrid from './tools/substitution_from_grid';
import {at, put} from './tools';

const selectApp = function (state) {
   const {tools} = state;
   return {tools};
};

const App = connect(selectApp)(PureComponent(self => {

   const setToolState = function (id, data) {
      self.props.dispatch({type: 'SET_TOOL_STATE', id: id, data: data});
   };

   self.render = function () {
      const {tools} = self.props;
      const renderTool = function (tool, i) {
         const {Component, state, scope} = tool;
         return (<Component key={i} toolState={state} scope={scope} setToolState={setToolState.bind(null, i)} />);
      };
      return <div>{tools.map(renderTool)}</div>;
   };

}));

const initialState = {
   tools: [],
   score: 500,
   hintsGrid: playFair.initialTaskGrid
};

const recompute = function (state) {
   const {score, hintsGrid, tools} = state;
   const {alphabet} = playFair;
   const newTools = [];
   for (let pc = 0; pc < tools.length; pc += 1) {
      const tool = tools[pc];
      const scope = tool.temporaryGetScope(state, newTools);
      tool.compute(tool.state, scope);
      newTools.push({...tool, scope});
   }
   return {...state, tools: newTools};
};

const defaultMergeState = function (state, update) {
   return {...state, ...update};
};

const reduceAddTool = function (state, factory, initialState, temporaryGetScope) {
   const newTools = state.tools.slice();
   const tool = {};
   tool.mergeState = defaultMergeState;
   factory(tool);
   tool.temporaryGetScope = temporaryGetScope;
   tool.state = tool.mergeState(tool.state, initialState);
   newTools.push(tool);
   return {...state, tools: newTools};
};

const reduceSetToolState = function (state, id, data) {
   return {
      ...state,
      tools:
         at(id, tool => {
            return {...tool, state: tool.mergeState(tool.state, data)};
         })(state.tools)
   };
}

const reduceRevealHint = function (state, row, col, hint, cost) {
   let {score, hintsGrid} = state;
   return {
      ...state,
      hintsGrid: at(row, at(col, put(hint)))(hintsGrid),
      score: score - cost
   };
};

const reducer = function (state, action) {
   let newState = state;
   switch (action.type) {
      case '@@redux/INIT':
      case 'INIT':
         newState = initialState;
         break;
      case 'ADD_TOOL':
         newState = reduceAddTool(state, action.factory, action.toolState, action.temporaryGetScope);
         break;
      case 'SET_TOOL_STATE':
         newState = reduceSetToolState(state, action.id, action.data);
         break;
      case 'REVEAL_HINT':
         newState = reduceRevealHint(state, action.row, action.col, action.hint, action.cost);
         break;
      default:
         console.log('dropped action', action);
         return state;
   }
   if (newState !== state)
      return recompute(newState);
};

const store = createStore(reducer);

store.dispatch({
   type: 'ADD_TOOL',
   factory: TextInput,
   toolState: {
      outputVariable: "texteChiffré"
   },
   temporaryGetScope: function (state, tools) {
      return {
         alphabet: playFair.alphabet,
         text: playFair.sampleCipheredText
      };
   }
});

store.dispatch({
   type: 'ADD_TOOL',
   factory: Hints,
   toolState: {
      outputGridVariable: "lettresGrilleIndice"
   },
   temporaryGetScope: function (state, tools) {
      const {hintsGrid, score} = state;
      const getQueryCost = function (query) {
         if (query.type === "grid")
            return 10;
         if (query.type === "alphabet")
            return 10;
         return 0;
      };
      const getHint = function (query, callback) {
         setTimeout(function () {
            const cost = getQueryCost(query);
            let hint;
            if (query.type == "grid") {
               const {row, col} = query;
               const hint = {l: playFair.getHintGrid(playFair.sampleHints, row, col), q: 'hint'};
               store.dispatch({type: 'REVEAL_HINT', row, col, hint, cost});
               callback(false);
            } else {
               const {rank} = query;
               const {row, col} = playFair.getHintAlphabet(playFair.sampleHints, rank);
               const hint = {l: rank, q: 'hint'};
               store.dispatch({type: 'REVEAL_HINT', row, col, hint, cost});
               callback(false);
            }
         }, 1000);
      };
      return {alphabet: playFair.alphabet, getQueryCost, getHint, hintsGrid, score};
   }
})

store.dispatch({
   type: 'ADD_TOOL',
   factory: SubstitutionFromGrid,
   toolState: {
      inputGridVariable: 'lettresGrilleIndice',
      outputGridVariable: 'lettresGrilleEditée',
      outputSubstitutionVariable: 'substitutionDépart'
   },
   temporaryGetScope: function (state, tools) {
      return {
         alphabet: playFair.alphabet,
         inputGrid: tools[1].scope.outputGrid
      };
   }
});

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><App/></Provider>, container);
