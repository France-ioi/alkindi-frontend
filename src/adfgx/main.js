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
   // p. dech. 631524 (ch. LUHYPF)
   // subst. par freq. EATISNRUOLDCVMPFBXGHQJYZK
   // grille: AHVNR LIFTD PKXMO UCBQS JGYEZ
   // texte: NOTREPLANCOMMENCEDEFACONFORMIDABLEETJETI…
   substitution_grid: [[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]],
   permutation: [null, null, null, null, null, null],
   hints: {
      substitution_grid: [[0, 7, 21, 13, 17], [11, 8, 5, 19, 3], [15, 10, 22, 12, 14], [20, 2, 1, 16, 18], [9, 6, 23, 4, 24]],
      permutation: [5, 2, 0, 4, 1, 3],
   },
   cipher_text: "GAGGGXAGXXAGGGFXADXDXXXAGDGGDGGAGAXGGGDGXXGAGAAAGGXADGGAXGFGXGFGXAAGFXGADXXXGGGAGDXADGDXXAGGXGAGAAGGAXGGXGXAFGDGGAAXGDXGXAXAAFXGXXGAGXAGDXADXDGAAXXAADGGFGFXAFXXDFFDGXXXAGXGXFDAXADDAGGADDAFDDXFGAXAADDAGADFDXADGGGDFAXXGXAAXDADDDXGXGADDDAAGDADADAGFXXAAGGADXDFDAADADDDGFDADAGFDAAXADDXGDXDFFAXFDGXGDAXGDFGAAFGAGXGAADGFGXGDFAXXDGFDDDAGADXAGXGGDGADFAGDAGADXDFADXDAGGDDDAXDXDDDFADXXADDFAGAAGGDDDXADXXFFDDAGAGDDDDXDADXGXAAXGFFDAGDDDFGAFXXGDAFGFGAXADGDDDGDXGFDXXGFADAGADADDFAFADAAADDDDAAGDDADDGGAXDXXDXXAXGFXDXDADFXAXFGAXAGADXAAGXDXGDFDAAAAAAAGAGGGAXXAAXGGDXGFFAAAAXDDGAXFADXXAXFGXXDXXGGFFDGXFAGAAGAXDFAAXAGXDDADGGFAFAFGDXAXDXGXADGDGDFGAGADXXFDGFDAADGXDXGAXADAXAAAXFGGGAGGGDGDXGDGXGDGAFXGAXGGXFXXAXGAXAGGAGFGGGAFAGGAFXGDADGDGXGAGXXGAAGGXAGGAGAAGGXXDAADXXXGXGDGGGXGGDXXGGAXADGAXXGDXGAXGGFXXDFGGGAAGDGXDGGXXAGDAXGFXXGGGAAAGGXAAAXFGXDGGDAFXXXXGGAGXXGDADDDGAGFADAGAAAXXXADGXXGGGAXXFGGGFGXAAXDAGFGADDFXFDXFDGAAGADGGXXDGXXAGXGGGXGFAFXAXAFGD"
};

const findInGrid = function (grid, rank) {
   for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
         if (grid[row][col] === rank) {
            return {row, col};
         }
      }
   }
};

const BareDemo = EpicComponent(self => {

   const getQueryCost = function (query) {
      if (query.type === 'subst-decipher') {
         return 35;
      } else if (query.type === 'subst-cipher') {
         return 50;
      } else if (query.type === 'perm-decipher') {
         return 200;
      } else if (query.type === 'perm-cipher') {
         return 200;
      } else {
         return 1000;
      }
   };

   const getHint = function (query, callback) {
      setTimeout(function () {
         const {task} = self.props;
         const {hints} = task;
         let newTask = task;
         if (query.type === 'subst-decipher') {
            const {row, col} = query;
            newTask = {...task, substitution_grid: at(row, at(col, put(hints.substitution_grid[row][col])))(task.substitution_grid)};
         } else if (query.type === 'subst-cipher') {
            const {row, col} = findInGrid(hints.substitution_grid, query.rank);
            newTask = {...task, substitution_grid: at(row, at(col, put(hints.substitution_grid[row][col])))(task.substitution_grid)};
         } else if (query.type === 'perm-decipher') {
            const {line} = query;
            newTask = {...task, permutation: at(line, put(hints.permutation[line]))(task.permutation)};
         } else if (query.type === 'perm-cipher') {
            const line = hints.permutation.indexOf(query.line);
            newTask = {...task, permutation: at(line, put(hints.permutation[line]))(task.permutation)};
         } else {
            console.log(query);
            return callback('error');
         }
         self.props.dispatch({type: 'SET_TASK', task: newTask});
         callback();
      }, 200);
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
      case 'SET_TASK':
         return {...state, task: action.task};
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
