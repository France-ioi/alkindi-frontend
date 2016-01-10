import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button} from 'react-bootstrap';
import {Promise} from 'es6-promise';
import classnames from 'classnames';

import {PureComponent} from '../misc';
import Api from '../api';
import Notifier from '../ui/notifier';
import Tooltip from '../ui/tooltip';
import {RefreshButton} from '../ui/refresh_button';

const HistoryTab = PureComponent(self => {

  const api = Api();
  const notifier = <Notifier api={api}/>;

  const toMap = function (items) {
    const map = {};
    items.map(item => { map[item.id] = item; });
    return map;
  };

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

  self.componentWillMount = function () {
    onRefresh();
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
  }


  // listAttemptRevisions

/*
  const workspaceListHead = (
    <thead>
      <tr>
        <th rowSpan='2'>Espace de travail</th>
        <th colSpan='2'>Version la plus récente</th>
        <th rowSpan='2'></th>
      </tr>
      <tr>
        <th>date</th>
        <th>auteur</th>
      </tr>
    </thead>);
  const renderWorkspacesTable = function (workspaces, currentWorkspace) {
    const workspaceRows = workspaces.map(function (workspace) {
      const latestVersion = workspace.versions[0];
      const rowClass = (workspace === currentWorkspace) ? 'selected' : '';
      return (
        <tr className={rowClass}>
          <td>{workspace.title}</td>
          <td style={{width:'20%'}}>{latestVersion.updatedAt}</td>
          <td style={{width:'20%'}}>{latestVersion.owner.fullname}</td>
          <td><button type="button">utiliser</button></td>
        </tr>
      );
    });
    workspaceRows.push(
      <tr className={currentWorkspace===undefined?'selected':''}>
        <td colSpan="4"><button type="button">afficher toutes les versions</button></td>
      </tr>
    );
    return (
      <table className="workspace-list">
        {workspaceListHead}
        <tbody>
          {workspaceRows}
        </tbody>
      </table>);
  };
  const renderWorkspace = function (workspace) {
    return (
      <div>
        <div key='rename'>
          <p>
            <label htmlFor="workspace-name">Modifier le nom de l'espace de travail : </label>
            <input type="text" value={workspace.title} />
          </p>
          <button type="button">Enregistrer le nom</button>
        </div>
        <table className="session-list">
          <thead>
            <tr>
              <th>Modifié</th>
              <th>Auteur</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {workspace.versions.map(function (version) {
              return (
                <tr key={version.id}>
                  <td>{JSON.stringify(version)}</td>
                </tr>);
            })}
          </tbody>
        </table>
      </div>);
  };
*/
  const renderRevisions = function (revisions) {
    const {users, workspaces, attempts} = self.state;
    const {currentRevisionId, cryptoChanged} = self.props;
    const renderRevisionRow = function (revision) {
      const workspace = workspaces[revision.workspace_id];
      const creator = users[revision.creator_id];
      const isCurrent = currentRevisionId === revision.id;
      const isModified = isCurrent && cryptoChanged;
      console.log(revision.id, isCurrent, isModified);
      const classes = [
        isCurrent && 'revision-isCurrent',
        isModified && 'revision-isModified'
      ];
      return (
        <tr key={workspace.id+'.'+revision.id} className={classnames(classes)}>
          <td>
            {' '}
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
            <Button onClick={revision.load}>utiliser</Button>
          </td>
        </tr>
      );
    };
    return (
      <table className="revision-list">
        <thead>
          <tr>
            <th></th>
            <th>Modifié</th>
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
        {notifier}
        {revisions === undefined
          ? <p>Chargement en cours...</p>
          : renderRevisions(revisions)}
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
