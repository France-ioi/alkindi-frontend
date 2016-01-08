import React from 'react';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';
import AsyncHelper from '../helpers/async_helper';
import * as api from '../api';

import PlayFair from '../playfair';
import {makeAlphabet} from '../playfair/utils/cell';

const initialToolStates = [
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
];

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

  const setToolState = function (id, data) {
    alert('not implemented');
  };

  const saveState = function () {
    alert('not implemented');
  };

  self.render = function () {
    const {task} = self.props;
    const taskApi = {
      score: 500,
      alphabet: alphabet,
      cipheredText: task.cipher_text,
      hintsGrid: task.hints,
      getQueryCost,
      getHint
    };
    const changed = false;
    const saveStyle = changed ? 'primary' : 'default';
    return (
      <div>
        <div className="crypto-tab-header">
          <Button bsStyle={saveStyle} disabled={!changed} onClick={saveState}>Enregistrer cette version</Button>
        </div>
        <PlayFair task={taskApi} toolStates={initialToolStates} setToolState={setToolState}/>
      </div>
    );
  };

});

const selector = function (state) {
  const {user, task} = state;
  return {user_id: user.id, task};
};

export default connect(selector)(PlayFairTab);
