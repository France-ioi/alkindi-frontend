import React from 'react';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';

import {PureComponent, at, put} from '../misc';
import AsyncHelper from '../helpers/async_helper';
import * as api from '../api';

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
    editable: false
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

  const asyncHelper = AsyncHelper(self);
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
    asyncHelper.beginRequest();
    api.getHint(user_id, query, function (err, result) {
      asyncHelper.endRequest(err);
      callback(err);
      self.props.refresh();
    });
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
    asyncHelper.beginRequest();
    api.storeRevision(user_id, data, function (err, result) {
      asyncHelper.endRequest(err);
      if (err) {
        // Reset the changed flag to true as the state was not changed.
        changeCrypto(function (crypto) {
          return {...crypto, changed: true};
        });
        return;
      }
      changeCrypto(function (crypto) {
        return {...crypto,
          changed: false,
          revisionId: result.revision_id
        };
      });
    });
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
    api.loadRevision(revisionId, function (err, result) {
      if (err) {
        changeCrypto(function (crypto) {
          return {...crypto, loading: false};
        });
        return alert(err); // XXX
      }
      const revision = result.workspace_revision;
      changeCrypto(function (crypto) {
        return {...crypto, loading: false, tools: revision.state};
      });
    });
  };

  self.render = function () {
    const {task, crypto} = self.props;
    const {tools, loading, changed} = crypto;
    if (loading || tools === undefined)
      return (<div>Chargement en cours, veuillez patienter...</div>);
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
        <div className="crypto-tab-header">
          <Button bsStyle={saveStyle} disabled={!changed} onClick={saveState}>Enregistrer cette version</Button>
        </div>
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
