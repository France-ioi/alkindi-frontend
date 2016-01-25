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
   substitution_grid: [[13,1,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]],
   permutation: [null,null,null,null,null],
   cipher_text: "AAGAXADFGFAAFFFGGFAADAFAXXGGADAGDXFXXAGFAFFAAFAGDFXAFGDXFAGAAAGAFGXXXXAFXAAFDDDDAAFFFAFXDFAFGFFFGGFDFXFAFFXAGADDADGAFXAXAXFXAXDXFXADFGXXFADXADGFFDADXAADAXAGXADFXAAFXFFXAAFXFDFXGGXAXAFAADXFDADFDXGAXFAGAFAFGAAGDFDGADFDGFADAAGAAFFAFFDXXDXFXAGFFAADFAAXAADGFDGXFAFFXFFFGFFXAAFAFFGDADDDDAXAFXADAAXFGAFAADDGFFFAAGAGGXAAXAFXXAAGDAFAFDFFAFFXAFAFGGDAAXFDFFGAAGGDXAFGXAGDAFFFAAFFXAAFGAFAAFXFAAFFXGAAAFADAFFGFDAADXAFDFAAGDFGDGDFAGADDAFGAAFGAAXAXGAAXAFFDAXDGAAAAXAADADGAXADFXFAAXGFXADFADAGDXAAFAXGGFDGXDAAXFGAFFAGFXAGAXXAAGXXADAGGAXDXXGDDAAXXXGXGDGDXADGXGGFADDDGDXXDXDGDAGGDDDXAAGXGXXXADGADDAFDGGXDDADAGDDDGAGDDAXXGGGXDGXDAGDGXGXGXGXGGXADAXGXDDDGDXDGGGADGDGDADXGDXAXDDAGGDDXGXGXAAXGGAXFDGGGGDFDDGAXAAGADXDDDDGGDAGAGADGDAGAADGXGGXDDADAXDGDAXDXAXGGDXXDDFXGFAGFGDXGGXXXGGADGXXGGGAGAGXDDDDXDAXDAXXXDDDXAXADAGDDXGDXFXXGGGXGXXGAGFDGXDGXDAAFXADDAADXAAGGXDAXXXDXDDDXXAGGXAFGAGDGXXGXGDXXAADAADGXGXGXGDDFDXDXXGXAGXXGFDGXXXXXAXGXADADAAGDXAGXXAAXAGAAXXGXGGXDXXXDDXDGDAGDXADXXGXDAGDXADGXXGXGGXAAAFAXAADGXAGGGXADDGGDXXDXGGGAGDGFXDXADGDGXGGDGXDGXAA"
};

/*
RZETKY

  a d f g x
a M A H P E
d T X Y R J
f Q S G I N
g C B K U V
x O L F D Z

"Mes félicitations pour ce que vous avez realisé sans accroc dans cette partie initiale du plan. Voici la marche à suivre afin que le plan aboutisse et envisager la suite avec sérénité. L'étape suivante consiste à augmenter de façon artificielle le coût financier de certains métaux de terre rare aussi vite que possible et sans délais ou nuisances. Nous avons entériné la liste suivante de métaux de terre rare : le terbium, le  neodyme et le  gadolinium. Le meilleur endroit pour agir se situe à la bourse de Barcelone. Hâtez-vous aussitôt pour aller acheter plein de ces actions en prévision de la hausse de l'indice du marché."
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

   self.componentWillMount = function () {
      self.props.manager.emitter.on('changed', onWorkspaceChanged);
   };

   self.componentWillUnmount = function () {
      self.props.manager.emitter.removeListener('changed', onWorkspaceChanged);
   };

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
      default:
         throw action;
   }
   return newState;
};

const store = createStore(reducer);

// Workspace setup.
const manager = WorkspaceManager();
manager.clear();
Adfgx.setupTools(manager);

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><Demo manager={manager}/></Provider>, container);
