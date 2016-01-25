import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import EpicComponent from 'epic-component';

import {at, put} from '../misc';

import {WorkspaceManager} from '../workspace';
import * as Adfgx from '.';

const initialTask = {
   substitution_grid:
      // [[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]],
      [[0, 7, 21, 13, 17], [11, 8, 5, 19, 3], [15, 10, 23, 12, 14], [20, 2, 1, 16, 18], [9, 6, 24, 4, 25]],
   permutation:
      // [null,null,null,null,null],
      [5, 2, 0, 4, 1, 3],
      // [2, 4, 1, 5, 3, 0],
   cipher_text: "GAGGGXAGXXAGGGFXADXDXXXAGDGGDGGAGAXGGGDGXXGAGAAAGGXADGGAXGFGXGFGXAAGFXGADXXXGGGAGDXADGDXXAGGXGAGAAGGAXGGXGXAFGDGGAAXGDXGXAXAAFXGXXGAGXAGDXADXDGAAXXAADGGFGFXAFXXDFFDGXXXAGXGXFDAXADDAGGADDAFDDXFGAXAADDAGADFDXADGGGDFAXXGXAAXDADDDXGXGADDDAAGDADADAGFXXAAGGADXDFDAADADDDGFDADAGFDAAXADDXGDXDFFAXFDGXGDAXGDFGAAFGAGXGAADGFGXGDFAXXDGFDDDAGADXAGXGGDGADFAGDAGADXDFADXDAGGDDDAXDXDDDFADXXADDFAGAAGGDDDXADXXFFDDAGAGDDDDXDADXGXAAXGFFDAGDDDFGAFXXGDAFGFGAXADGDDDGDXGFDXXGFADAGADADDFAFADAAADDDDAAGDDADDGGAXDXXDXXAXGFXDXDADFXAXFGAXAGADXAAGXDXGDFDAAAAAAAGAGGGAXXAAXGGDXGFFAAAAXDDGAXFADXXAXFGXXDXXGGFFDGXFAGAAGAXDFAAXAGXDDADGGFAFAFGDXAXDXGXADGDGDFGAGADXXFDGFDAADGXDXGAXADAXAAAXFGGGAGGGDGDXGDGXGDGAFXGAXGGXFXXAXGAXAGGAGFGGGAFAGGAFXGDADGDGXGAGXXGAAGGXAGGAGAAGGXXDAADXXXGXGDGGGXGGDXXGGAXADGAXXGDXGAXGGFXXDFGGGAAGDGXDGGXXAGDAXGFXXGGGAAAGGXAAAXFGXDGGDAFXXXXGGAGXXGDADDDGAGFADAGAAAXXXADGXXGGGAXXFGGGFGXAAXDAGFGADDFXFDXFDGAAGADGGXXDGXXAGXGGGXGFAFXAXAFGD"
};

/*
LUHYPF
AHVNRLIFTDPKXMOUCBQSJGYEZ
*/

const BareDemo = EpicComponent(self => {

   const getQueryCost = function (query) {
      return 10;
   };

   const getHint = function (query, callback) {
      setTimeout(function () {
         // call props.dispatch with an action to reveal a hint
         callback('not implemented');
      }, 1000);
   };

  const onWorkspaceChanged = function (workspace) {
    self.setState({workspace});
  };

   self.state = {};

   self.render = function () {
      const {task, manager} = self.props;
      const taskApi = {...task, getQueryCost, getHint};
      return manager.render(Adfgx.getRootScope(taskApi));
   };
});

const selector = function (state) {
   const {task, score, workspace} = state;
   return {task, score, workspace};
};

const Demo = DragDropContext(HTML5Backend)(connect(selector)(BareDemo));

const reducer = function (state, action) {
   let newState = state;
   switch (action.type) {
      case '@@redux/INIT':
         return {task: initialTask};
      case 'SET_WORKSPACE':
         return {...state, workspace: action.workspace};
      default:
         throw action;
   }
   return newState;
};

const store = createStore(reducer);

// Workspace setup.
const manager = WorkspaceManager(store);
manager.clear();
Adfgx.setupTools(manager);

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><Demo manager={manager}/></Provider>, container);
