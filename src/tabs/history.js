import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {PureComponent} from '../misc';
import Api from '../api';
import Notifier from '../ui/notifier';
import Tooltip from '../ui/tooltip';
import RefreshButton from '../ui/refresh_button';

const HistoryTab = PureComponent(self => {

  const api = Api();
  const notifier = <Notifier api={api}/>;

  self.componentWillMount = function () {
    const {attempt} = self.props;
    api.listAttemptRevisions(attempt.id).then(
      function (revisions) {
        self.setState({revisions: revisions});
      });
  };


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
  const renderAllVersions = function (versions) {
    return (
      <table className="session-list">
        <thead>
          <tr>
            <th>Modifié</th>
            <th>Auteur</th>
            <th>Espace de travail</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {versions.map(function (version) {
            return (
              <tr key={version.workspace.id+'.'+version.id}>
                <td>{new Date(version.updatedAt).toString()}</td>
                <td>{version.owner.fullname}</td>
                <td>{version.workspace.title}</td>
                <td><button type="button">utiliser</button></td>
              </tr>);
          })}
        </tbody>
      </table>
    );
  };
*/
  self.render = function () {
    const {revisions} = self.state;
    return (
      <div>
        <div style={{marginBottom: '10px'}}>
          <div className='pull-right'>
            <Tooltip content={<p>Cliquez sur ce bouton pour mettre à jour la liste des versions enregistrées par votre équipe.</p>}/>
            {' '}
            <RefreshButton/>
          </div>
        </div>
        {notifier}
        {revisions ? JSON.stringify(revisions) : <p>Chargement en cours...</p>}
      </div>
    );
  };
}, _self => {
  return {
    revisions: undefined
  };
});

export default HistoryTab;
