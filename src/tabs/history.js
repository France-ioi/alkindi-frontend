import React from 'react';
import {connect} from 'react-redux';
import EpicComponent from 'epic-component';
import {createSelector} from 'reselect';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';
import memoize from 'memoizejs';

import {toMap} from '../misc';
import Notifier from '../ui/notifier';
import Tooltip from '../ui/tooltip';
import RefreshButton from '../ui/refresh_button';

const HistoryTab = EpicComponent(self => {

  const api = Alkindi.api;

  const onLoadRevision = memoize(function (revisionId) {
    return function () {
      const {cryptoChanged} = self.props;
      if (cryptoChanged) {
        if (!confirm("Vous allez perdre vos changements dans l'onglet Cryptanalyse si vous continuer."))
          return;
      }
      self.props.dispatch({type: 'USE_REVISION', revisionId});
    };
  });

  const onRefresh = function () {
    const {attempt_id} = self.props;
    Alkindi.refresh({history: attempt_id});
  };

  const renderRevisions = function (revisions) {
    const {currentRevisionId, cryptoChanged} = self.props;
    const users = toMap(self.props.users);
    const workspaces = toMap(self.props.workspaces);
    const renderRevisionRow = function (revision) {
      const workspace = workspaces[revision.workspace_id];
      const creator = users[revision.creator_id];
      const isCurrent = currentRevisionId === revision.id;
      const isModified = isCurrent && cryptoChanged;
      const classes = [
        isCurrent && 'revision-isCurrent',
        isModified && 'revision-isModified'
      ];
      return (
        <tr key={workspace.id+'.'+revision.id} className={classnames(classes)}>
          <td>
            {isCurrent &&
              (isModified
                ? <Tooltip content={<p>Cette version a été chargée dans l'onglet cryptanalyse, puis modifiée.</p>}>
                    <i className="fa fa-save"/>
                  </Tooltip>
                : <Tooltip content={<p>Cette version est chargée dans l'onglet cryptanalyse.</p>}>
                    <i className="fa fa-asterisk"/>
                  </Tooltip>)}
          </td>
          <td>{new Date(revision.created_at).toLocaleString()}</td>
          <td>{creator.username}</td>
          <td>
            <Button onClick={onLoadRevision(revision.id)}>
              <i className="fa fa-code-fork"/>
              {' recharger'}
            </Button>
          </td>
        </tr>
      );
    };
    return (
      <table className="revision-list">
        <thead>
          <tr>
            <th></th>
            <th>Date d'enregistrement</th>
            <th>Auteur</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {revisions.map(renderRevisionRow)}
        </tbody>
      </table>
    );
  };

  self.componentWillMount = function () {
    onRefresh();
  };

  self.render = function () {
    const {revisions} = self.props;
    return (
      <div>
        <div style={{marginBottom: '10px'}}>
          <div className='pull-right'>
            <Tooltip content={<p>Cliquez sur ce bouton pour mettre à jour la liste des versions enregistrées par votre équipe.</p>}/>
            {' '}
            <RefreshButton refresh={onRefresh}/>
          </div>
        </div>
        <Notifier emitter={api.emitter}/>
        <p>
          Ci-dessous, vous pouvez trouver toutes les versions précédemment
          enregistrées par vous et vos coéquipiers.
        </p>
        <p>
          Vous pouvez à tout moment recharger n'importe-laquelle de ces
          versions pour en repartir.
          Elle ne sera pas modifiée, mais sera copiée si vous faites des
          changements et les enregistrez.
        </p>
        {revisions === undefined
          ? <p>Chargement en cours...</p>
          : (revisions.length == 0
             ? <p className="noRowsMessage">Vous n'avez pas enregistré de version pour cette épreuve.</p>
            : renderRevisions(revisions))}
      </div>
    );
  };
});

const selector = function (state) {
  const {workspace, attempt} = state;
  const {revisions, users, workspaces} = state.response;
  return {
    attempt_id: attempt.id,
    cryptoChanged: workspace.changed,
    currentRevisionId: workspace.revisionId,
    revisions, users, workspaces
  };
};

export default connect(selector)(HistoryTab);
