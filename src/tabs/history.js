import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {PureComponent} from '../misc';

const HistoryTabSelector = createSelector(
  function (state) {
    return state.historyTab;
  },
  function (historyTab) {
    return historyTab;
  }
);

const HistoryTab = PureComponent(self => {
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
  self.render = function () {
    const {workspaces, currentWorkspace, allVersions} = self.props;
    const workspacesSection = renderWorkspacesTable(workspaces, currentWorkspace);
    const versionsSection =
      currentWorkspace === undefined ?
        renderAllVersions(allVersions) :
        renderWorkspace(currentWorkspace);
    return (
      <div className="wrapper">
        {workspacesSection}
        {versionsSection}
      </div>
    );
  };
}, _self => {
  return {};
});

export default connect(HistoryTabSelector)(HistoryTab);