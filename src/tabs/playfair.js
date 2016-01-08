import React from 'react';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';

import {PureComponent, at, put} from '../misc';
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
    const {toolStates} = self.state;
    self.setState({
      changed: true,
      toolStates: at(id, put(data))(toolStates)
    });
  };

  const saveState = function () {
    const user_id = self.props.user_id;
    const {toolStates, parentRevisionId} = self.state;
    const state = toolStates.map(function (toolState) {
      return {state: toolState};
    });
    asyncHelper.beginRequest();
    const title = "Révision du " + new Date().toLocaleString();
    const data = {title, state, parent_id: parentRevisionId};
    self.setState({changed: false});
    api.storeRevision(user_id, data, function (err, result) {
      asyncHelper.endRequest(err);
      if (err) {
        self.setState({changed: true});
        return;
      }
      self.setState({
        parentRevisionId: result.revision_id
      });
    });
  };

  self.componentWillMount = function () {
    const {my_latest_revision_id} = self.props;
    if (my_latest_revision_id === null) {
      self.setState({toolStates: initialToolStates});
      return;
    }
    self.setState({loading: true});
    api.loadRevision(my_latest_revision_id, function (err, result) {
      self.setState({loading: false});
      if (err) return alert(err); // XXX
      const revision = result.workspace_revision;
      const toolStates = revision.state.map(tool => tool.state);
      self.setState({toolStates: toolStates});
    });
  }

  self.render = function () {
    if (self.state.loading)
      return (<div>Chargement en cours, veuillez patienter...</div>);
    const {task} = self.props;
    const {toolStates, changed} = self.state;
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

}, _self => {
  return {
    loading: false,
    toolStates: undefined,
    changed: false,
    parentRevisionId: undefined
  }
});

const selector = function (state) {
  const {user, task, my_latest_revision_id} = state;
  return {user_id: user.id, task, my_latest_revision_id};
};

export default connect(selector)(PlayFairTab);
