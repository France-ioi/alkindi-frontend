import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';

import {PureComponent, at, put} from '../misc';

import {Workspace} from '../workspace';
import * as Adfgx from '.';

const initialTask = {
   hints: "PF   \n     \n     \n     \n     ",
   cipher_text: "XFDAFFFDFGAGGGGFGGFXFFDXFGAFDGAFXDDXGGDXAGFGAXDFFAXGFDFGDDFAFFFAGXGFGFGGAGGFAFXADGDXXADXXGFGFFDDDFFFGDDFFDGFADFFGGGDFGGDGFFDDGXXFFDDAGFGDGFGXGFXFDFXFXDXDFXGDXXGDFXGFGFFGDAGFGFFFGGGFDDGFXDFFDDFDGDAXGGDXGDFADFFGGFFGGDGGDFFDGFGDGGXGGAFGDFDDFGGDGXGDGXADGXXXGFFAFGDGGGDFDFGDFGFXXAAGDXXGGDXFGDGFXDXDXXDXFFGADGDGGGFFXFGFFFFXXGFDXDAXGAGFGFXFAFFADGGAGGAGGFFAGAFFFFXDXDDGDXGDDAXDDFDADAFAFGGXFFGDDFAFGFXGFDFGFAAXADFFADDGAGFGFAGGDAGAFFFXDXFFGGFGXFFGDDXFDGFFFGXGDFGXDGXDGXDGAFDXXDGGFXDDGXADDGAGAFGFGGDXXGFGGXGDDDXXXXGDFDXFDDFGDDFGDXFGDGAFXAFDADFFFDGFFFFFDAGXXDDFFDXGFGDAFAGGGGGGDXFGFXFFFGFGGFGFDGXGADXFGGDGFXDAFDDXAFFXXXDAFFDFGDDFFFGGFFGGFGFDAAAAFGAXGFDFAAGFDGFFFAFDGGDGAGDDDADGGDGGFFDDAGFDDXGGGDXFGDFDFDXDDFGFGXFDGGFXGDGGADDGAGAFAXDXFDXGXGAGFFAXAFXGFGGGFFXADXXGGGAFFGDXFGFDXFGGDDAFGDFGXFDAGGDFDDDXDFXDDXFXXGGFGGDDFGXGXFFFDGFAFFFGXXDFDADAGXDFFGDGGGDAFDAFGDDXXXFFGFGFDFFADFFFFFXDAXGAGAFAXAGFAGGADFFFFAADADFGFXAFFGGFFFGXGFGFFFAGAAFXGDGFGDDDGGGDFDXFAAFFGXDGDFFFGFXDXAFAXGGDDFGFGGGADGFAG"
};

const BareDemo = PureComponent(self => {

   const getQueryCost = function (query) {
      return 10;
   };

   const getHint = function (query, callback) {
      setTimeout(function () {
         // call props.dispatch with an action to reveal a hint
         callback('not implemented');
      }, 1000);
   };

   self.render = function () {
      const {task, workspace} = self.props;
      const taskApi = {...task, getQueryCost, getHint};
      return (<Adfgx.TabContent task={taskApi} workspace={workspace}/>);
   };
});

const selector = function (state) {
   const {task, score, workspace} = state;
   return {task, score, workspace};
};

const Demo = connect(selector)(BareDemo);

const reducer = function (state, action) {
   let newState = state;
   switch (action.type) {
      case '@@redux/INIT':
         return {task: initialTask};
      case 'SET_WORKSPACE':
         return {...state, workspace: {...state.workspace, ...action.workspace}};
      default:
         throw action;
   }
   return newState;
};

const store = createStore(reducer);

// Workspace setup.
const getWorkspace = function (callback) {
   return store.getState().workspace;
};
const setWorkspace = function (workspace) {
   store.dispatch({type: 'SET_WORKSPACE', workspace});
};
const workspace = Workspace(getWorkspace, setWorkspace);
workspace.clear();
Adfgx.setupTools(workspace);

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><Demo/></Provider>, container);
