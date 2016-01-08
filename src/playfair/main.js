import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';

import {PureComponent, at, put} from './utils/generic';
import {makeAlphabet} from './utils/cell';
import {mostFrequentFrench, decodeBigram} from './utils/bigram';

import TextInput from './tools/text_input';
import Hints from './tools/hints';
import SubstitutionFromGrid from './tools/substitution_from_grid';
import BigramFrequencyAnalysis from './tools/bigram_frequency_analysis';
import EditSubstitution from './tools/edit_substitution';
import ApplySubstitution from './tools/apply_substitution';

/*** + demo + ***/

const initialTaskGrid = [
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
   [{q:'unknown'}, {l:11, q:'hint'}, {q:'unknown'}, {q:'unknown'}, {l:10, q:'hint'}],
   [{q:'unknown'}, {l:16, q:'hint'}, {q:'unknown'}, {q:'unknown'}, {l: 4, q:'hint'}],
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
];

const sampleCipheredText = "KQ CVG XSVR ACHZ JDSKQ CBAVHM, AKV TKMV QKAONPXTP, OD CSACQ MT ZTAZQ BONP NI MQUGQTN. BSPV QKAIHVACBQZ, PTSC PCDSVCQZTPL ICKLNADVC PVQ MCK TIEUTQQTYV KCQVTQCK MQ OD YLIVTQFZ. QKKQ KC QNSPZC IDVO PV HTCAF PDNMQ ZMGUKQ. NSSC KQ QNSPZCZQN MP CZQPAT FAVT DZCVPT MPASAZT NLYVCVPXLS. NSSC O FNLSUQZMH HQIPTSGB MQ ALISZMPAO I NSSC MQ TJDVQ KT QVD. OTBV O JFVFTMQV DS RSPY CIPQ OT ZHIQZL AG UYN TQ OD TSDHAVDJYLR AS IDITZIO. TSJZZM FT AKMQ MQ EUJCQXMZTZA P'CKA OIO TJAC OTBV KQO VKALBCK, MF KQO IM CQVACC IJ-ICKYLSC, TZ KQC IUMJGQXNPQ A'PVT MPCZQ ADVAQZT. FT FLAT ZQ MSAQ TP NSIPV TIK CQNFZ TFVDA TB IVUBSHGT M PV CAQZYV. CSVUMH OD BNSTQMBVC KSVNIPAT : FTPZCNQVCKCR KCK KQFNQNCK MQ NSQNT HZQPTA DZCT I TJAC PV, G QDJQ ACHZ, FQF TQ IHOQAUSDMH KQO CSPQTY. CDJQTY ST HNLIBAC IB PTDHZQ LPQTVP TQ MQ UVXPA-PCHE TQ NTQNDVTKMR MJV-ZTGC. KQ ZQCSOQNA LPQTVP KCND NSQNT FKQ. OTBV SLTISDKCB QQ HYN, BNTZRBQ KF HNDRA PTDHZQ IV MQYVYLSC TQ K YSPOCNDDVT CPIQNC-ZAVPF-CBAVHM. KQ ZQCSOQNA LPQTVP ALAC TQZQ IJUVKC ONV XTAZQ QST. FQKD ITPZT IVRT EUJCQXCK, KQL ICHN GZQAJQZY CLNZMPA KQ VPZMNL MQ PLR, YCK IPQNCK KQ TSMQ IB TIMQPNYV. \n254292628";
const sampleHints = [
   ['P', 'B', 'U', 'G', 'H'],
   ['O', 'L', 'S', 'Y', 'K'],
   ['T', 'Q', 'C', 'F', 'E'],
   ['A', 'D', 'I', 'J', 'M'],
   ['N', 'R', 'V', 'X', 'Z']
];

const getHintGrid = function (alphabet, hints, row, col) {
   var letter = hints[row][col];
   return alphabet.ranks[letter];
};

const getHintAlphabet = function (alphabet, hints, rank) {
   for (var row = 0; row < hints.length; row++) {
      for (var col = 0; col < hints[row].length; col++) {
         const curRank = alphabet.ranks[hints[row][col]];
         if (rank === curRank) {
            return {row: row, col: col};
         }
      }
   }
};


/*** - demo - ***/

const selectApp = function (state) {
   const {tools} = state;
   return {tools};
};

const App = connect(selectApp)(PureComponent(self => {

   const setToolState = function (id, data) {
      self.props.dispatch({type: 'SET_TOOL_STATE', id: id, data: data});
   };

   const setters = [];
   const setter = function (i) {
      if (!(i in setters))
         setters[i] = setToolState.bind(null, i);
      return setters[i];
   };

   self.render = function () {
      const {tools} = self.props;
      const renderTool = function (tool, i) {
         const {Component, state, scope} = tool;
         return (<Component key={i} toolState={state} scope={scope} setToolState={setter(i)} />);
      };
      return <div>{tools.map(renderTool)}</div>;
   };

}));

const recompute = function (state) {
   const {tools} = state;
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
      score: score - cost,
      hintsGrid: at(row, at(col, put(hint)))(hintsGrid)
   };
};

const reducer = function (state, action) {
   let newState = state;
   switch (action.type) {
      case '@@redux/INIT':
         return {};
      case 'INIT':
         newState = action.state;
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
         throw action;
   }
   if (newState !== state)
      return recompute(newState);
};

const store = createStore(reducer);

//
// Tools setup
//

const alphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ')
store.dispatch({
   type: 'INIT',
   state: {
      tools: [],
      score: 500,
      hintsGrid: initialTaskGrid,
      alphabet: alphabet
   }
});


store.dispatch({
   type: 'ADD_TOOL',
   factory: TextInput,
   toolState: {
      outputVariable: "texteChiffré"
   },
   temporaryGetScope: function (state, _tools) {
      return {
         alphabet: state.alphabet,
         text: sampleCipheredText
      };
   }
});

store.dispatch({
   type: 'ADD_TOOL',
   factory: Hints,
   toolState: {
      outputGridVariable: "lettresGrilleIndices"
   },
   temporaryGetScope: function (state, _tools) {
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
            if (query.type == "grid") {
               const {row, col} = query;
               const hint = {l: getHintGrid(alphabet, sampleHints, row, col), q: 'hint'};
               store.dispatch({type: 'REVEAL_HINT', row, col, hint, cost});
               callback(false);
            } else {
               const {rank} = query;
               const {row, col} = getHintAlphabet(alphabet, sampleHints, rank);
               const hint = {l: rank, q: 'hint'};
               store.dispatch({type: 'REVEAL_HINT', row, col, hint, cost});
               callback(false);
            }
         }, 1000);
      };
      return {alphabet: state.alphabet, getQueryCost, getHint, hintsGrid, score};
   }
})

store.dispatch({
   type: 'ADD_TOOL',
   factory: SubstitutionFromGrid,
   toolState: {
      inputGridVariable: 'lettresGrilleIndices',
      outputGridVariable: 'lettresGrilleEditée',
      outputSubstitutionVariable: 'substitutionGénérée'
   },
   temporaryGetScope: function (state, tools) {
      return {
         alphabet: state.alphabet,
         inputGrid: tools[1].scope.outputGrid
      };
   }
});

store.dispatch({
   type: 'ADD_TOOL',
   factory: EditSubstitution,
   toolState: {
      inputCipheredTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionGénérée',
      outputSubstitutionVariable: 'substitutionÉditée',
      substitutionEdits: []
   },
   temporaryGetScope: function (state, tools) {
      return {
         alphabet: state.alphabet,
         inputCipheredText: tools[0].scope.output,
         inputSubstitution: tools[2].scope.outputSubstitution
      };
   }
});

const decodedMostFrequentFrench = mostFrequentFrench.map(decodeBigram.bind(null, alphabet));
store.dispatch({
   type: 'ADD_TOOL',
   factory: BigramFrequencyAnalysis,
   toolState: {
      inputCipheredTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputSubstitutionVariable: 'substitutionFréquences',
      substitutionEdits: [],
      editable: false
   },
   temporaryGetScope: function (state, tools) {
      return {
         alphabet: state.alphabet,
         inputCipheredText: tools[0].scope.output,
         mostFrequentFrench: decodedMostFrequentFrench,
         inputSubstitution: tools[3].scope.outputSubstitution
      };
   }
});

store.dispatch({
   type: 'ADD_TOOL',
   factory: ApplySubstitution,
   toolState: {
      inputTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputTextVariable: 'texteDéchiffré'
   },
   temporaryGetScope: function (state, tools) {
      return {
         alphabet: state.alphabet,
         inputText: tools[0].scope.output,
         inputSubstitution: tools[3].scope.outputSubstitution
      };
   }
});

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><App/></Provider>, container);
