import React from 'react';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';

import {PureComponent, at, put} from '../misc';
import Api from '../api';
import Notifier from '../ui/notifier';
import Tooltip from '../ui/tooltip';
import RefreshButton from '../ui/refresh_button';

import PlayFair from '../playfair';
import {makeAlphabet} from '../playfair/utils/cell';

const initialTools = [
  // TextInput
  {
    outputVariable: "texteChiffré"
  },
  // Hints
  {
    outputGridVariable: "lettresGrilleIndices"
  },
  // SubstitutionFromGrid
  {
    editGrid: [[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}]],
    inputGridVariable: 'lettresGrilleIndices',
    outputGridVariable: 'lettresGrilleEditée',
    outputSubstitutionVariable: 'substitutionGénérée'
  },
  // EditSubstitution
  {
    nbLettersPerRow: 29,
    inputCipheredTextVariable: 'texteChiffré',
    inputSubstitutionVariable: 'substitutionGénérée',
    outputSubstitutionVariable: 'substitutionÉditée',
    substitutionEdits: []
  },
  // BigramFrequencyAnalysis
  {
    inputCipheredTextVariable: 'texteChiffré',
    inputSubstitutionVariable: 'substitutionÉditée',
    outputSubstitutionVariable: 'substitutionFréquences',
    substitutionEdits: [],
    editable: false,
    nBigrams: 10
  },
  // ApplySubstitution
  {
    nbLettersPerRow: 29,
    inputTextVariable: 'texteChiffré',
    inputSubstitutionVariable: 'substitutionÉditée',
    outputTextVariable: 'texteDéchiffré'
  }
].map(function (state) {
  return {state};
});

const PlayFairTab = PureComponent(self => {

  const api = Api();
  const notifier = <Notifier api={api}/>;
  const alphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ');

  const getQueryCost = function (query) {
    if (query.type === "grid")
      return 10;
    if (query.type === "alphabet")
      return 10;
    return 0;
  };

  const getHint = function (query, callback) {
    const user_id = self.props.user_id;
    api.getHint(user_id, query).then(
      function () { callback(false); },
      callback
    );
  };

  const changeCrypto = function (func) {
    const {crypto, dispatch} = self.props;
    dispatch({
      type: 'SET_CRYPTO',
      crypto: func(crypto)
    });
  };

  const setToolState = function (id, data) {
    changeCrypto(function (crypto) {
      return {
        ...crypto,
        changed: true,
        tools: at(id, function (tool) { return {...tool, state: data}; })(crypto.tools)
      };
    });
  };

  const saveState = function () {
    const user_id = self.props.user_id;
    const {crypto, dispatch} = self.props;
    const data = {
      title: "Révision du " + new Date().toLocaleString(),
      state: crypto.tools,
      parent_id: crypto.revisionId
    };
    changeCrypto(function (crypto) {
      return {...crypto, changed: false};
    });
    api.storeRevision(user_id, data).then(
      function (result) {
        changeCrypto(function (crypto) {
          return {...crypto,
            changed: false,
            revisionId: result.revision_id
          };
        });
      },
      function () {
        // Reset the changed flag to true as the state was not changed.
        changeCrypto(function (crypto) {
          return {...crypto, changed: true};
        });
      }
    );
  };

  const resetState = function () {
    if (window.confirm("Voulez vous vraiment repartir de zéro ?")) {
      changeCrypto(function (crypto) {
        return {
          ...crypto,
          tools: initialTools,
          revisionId: undefined,
          changed: false
        };
      });
    }
  };

  self.componentWillMount = function () {
    const {revisionId, tools} = self.props.crypto;
    // If the tools are already loaded, do nothing.
    if (tools !== undefined)
      return;
    // Load initial tools if there is no current revision.
    if (revisionId === undefined) {
      changeCrypto(function (crypto) {
        return {...crypto, tools: initialTools};
      });
      return;
    }
    // Load the revision from the backend.
    changeCrypto(function (crypto) {
      return {...crypto, loading: true};
    });
    api.loadRevision(revisionId).then(
      function (result) {
        const revision = result.workspace_revision;
        changeCrypto(function (crypto) {
          return {...crypto, loading: false, tools: revision.state};
        });
      },
      function () {
        changeCrypto(function (crypto) {
          return {...crypto, loading: false};
        });
      }
    );
  };

  const saveStateTooltip = (
    <p>
      Enregistrez de temps en temps votre travail pour ne pas risquer de le
      perdre.
      Chaque version que vous enregistrez sera disponible pour vous et vos
      co-équipiers dans l'onglet Historique.
    </p>
  );

  const resetStateTooltip = (
    <p>
      Cliquez sur ce bouton pour effacer toutes vos modifications mais conserver
      les indices.<br/>
      Vous pourrez toujours restaurer une version précédente depuis l'onglet
      Historique.
    </p>
  );

  self.render = function () {
    const {task, crypto} = self.props;
    const {tools, loading, changed} = crypto;
    if (loading || tools === undefined)
      return (
        <div>
          Chargement en cours, veuillez patienter...
          {notifier}
        </div>);
    const toolStates = tools.map(tool => tool.state);
    const taskApi = {
      alphabet: alphabet,
      score: task.score,
      cipheredText: task.cipher_text,
      hintsGrid: task.hints,
      getQueryCost,
      getHint
    };
    const saveStyle = changed ? 'primary' : 'default';
    return (
      <div>
        <div className="crypto-tab-header" style={{marginBottom: '10px'}}>
          <div className='pull-right'>
            <Tooltip content={<p>Cliquez sur ce bouton pour obtenir les indices demandés par vos co-équipiers depuis le dernier chargement de la page.</p>}/>
            {' '}
            <RefreshButton/>
          </div>
          <Button bsStyle={saveStyle} disabled={!changed} onClick={saveState}>
            <i className="fa fa-save"/>
            {' Enregistrer cette version'}
          </Button>
          <span style={{marginLeft: '10px', marginRight: '40px'}}>
            <Tooltip content={saveStateTooltip}/>
          </span>
          <Button onClick={resetState}>
            <i className="fa fa-eraser"/>
            {' Repartir de zéro'}
          </Button>
          <span style={{marginLeft: '10px'}}>
            <Tooltip content={resetStateTooltip}/>
          </span>
        </div>
        {notifier}
        <PlayFair task={taskApi} toolStates={toolStates} setToolState={setToolState}/>
      </div>
    );
  };

});

const selector = function (state) {
  const {user, task, crypto} = state;
  return {user_id: user.id, task, crypto};
};

export default connect(selector)(PlayFairTab);
