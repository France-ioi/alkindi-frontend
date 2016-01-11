import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';

import {PureComponent, toMap} from '../misc';
import Notifier from '../ui/notifier';
import Tooltip from '../ui/tooltip';
import {RefreshButton} from '../ui/refresh_button';

const HistoryTab = PureComponent(self => {

  const api = Alkindi.api;

  const addHandlers = function (revisions) {
    revisions.forEach(function (revision) {
      revision.load = function () {
        const {cryptoChanged} = self.props;
        if (cryptoChanged) {
          if (!confirm("Vous allez perdre vos changements dans l'onglet Cryptanalyse si vous continuer."))
            return;
        }
        self.props.dispatch({
          type: 'USE_REVISION',
          revision_id: revision.id
        });
      };
    });
  };

  const onRefresh = function () {
    const {attempt} = self.props;
    self.setState({refreshing: true});
    api.listAttemptRevisions(attempt.id).then(
      function (result) {
        addHandlers(result.revisions);
        self.setState({
          refreshing: false,
          revisions: result.revisions,
          users: toMap(result.users),
          workspaces: toMap(result.workspaces),
          attempts: toMap(result.attempts)
        });
      },
      function () {
        self.setState({refreshing: false});
      });
  };

  const renderRevisions = function (revisions) {
    const {users, workspaces, attempts} = self.state;
    const {currentRevisionId, cryptoChanged} = self.props;
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
            <Button onClick={revision.load}>
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
    const {revisions, refreshing} = self.state;
    const {crytoChanged} = self.props;
    return (
      <div>
        <div style={{marginBottom: '10px'}}>
          <div className='pull-right'>
            <Tooltip content={<p>Cliquez sur ce bouton pour mettre à jour la liste des versions enregistrées par votre équipe.</p>}/>
            {' '}
            <RefreshButton refresh={onRefresh} refreshing={refreshing}/>
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
}, _self => {
  return {
    refreshing: true,
    revisions: undefined
  };
});

const selector = function (state) {
  const {crypto} = state;
  return {
    cryptoChanged: crypto.changed,
    currentRevisionId: crypto.revisionId
  };
};

export default connect(selector)(HistoryTab);
