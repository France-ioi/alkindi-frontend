import React from 'react';
import {connect} from 'react-redux';
import EpicComponent from 'epic-component';
import {Button, ButtonGroup} from 'react-bootstrap';

import Notifier from '../ui/notifier';
import Tooltip from '../ui/tooltip';
import RefreshButton from '../ui/refresh_button';
import Tasks from '../tasks';

export const CryptoTab = EpicComponent(self => {


  const resetStateTooltip = (
    <p>
      Cliquez sur ce bouton pour effacer toutes vos modifications mais conserver
      les indices.<br/>
      Vous pourrez toujours restaurer une version précédente depuis l'onglet
      Historique.
    </p>
  );

  const resetState = function () {
    if (window.confirm("Voulez vous vraiment repartir de zéro ?")) {
      setupTaskTools();
    }
  };

  const setupTaskTools = function () {
    const {task, manager} = self.props;
    // XXX move this into manager
    manager.clear();
    Tasks[task.front].setupTools(manager);
    manager.clearChanged();
  };

  const getHint = function (query, callback) {
    const user_id = self.props.user_id;
    self.props.alkindi.api.getHint(user_id, query).then(
      function () { callback(false); },
      callback
    );
  };

  self.componentWillMount = function () {
    // XXX consider moving all of this into the manager.
    const {task, manager, workspace} = self.props;
    if (workspace !== undefined) {
      // If the workspace is already set up, leave it unchanged.
      if (workspace.tools !== undefined) {
        return;
      }
      // If there is a revision that can be loaded, attempt to load it.
      if (workspace.revisionId !== undefined) {
        self.setState({loading: true, broken: false});
        self.props.alkindi.api.loadRevision(workspace.revisionId).then(
          function (result) {
            const revision = result.workspace_revision;
            manager.clear();
            Tasks[task.front].setupTools(manager);
            manager.load(revision.state);
            self.setState({loading: false});
          },
          function (err) {
            self.setState({loading: false, broken: true});
          }
        );
        return;
      }
    }
    // Fall back to clearing the workspace and letting the task set up
    // the tools with their initial state.
    setupTaskTools();
  };

  self.render = function () {
    const {alkindi, user_id, task, workspace} = self.props;
    const {loading, broken} = self.state;
    if (loading || broken) {
      // Keep the same Notifier instance displayed if workspace.tools becomes
      // undefined, otherwise the Notifier will miss the error event.
      // XXX The API error should be move into the global state.
      return (
        <div>
          Chargement en cours, veuillez patienter...
          <Notifier emitter={alkindi.emitter}/>
        </div>);
    }
    const header = (
      <div className="crypto-tab-header" style={{marginBottom: '10px'}}>
        <div className='pull-right'>
          <Tooltip content={<p>Cliquez sur ce bouton pour obtenir les indices demandés par vos coéquipiers depuis le dernier chargement de la page.</p>}/>
          {' '}
          <RefreshButton alkindi={alkindi}/>
        </div>
        <Button onClick={resetState}>
          <i className="fa fa-eraser"/>
          {' Repartir de zéro'}
        </Button>
        <span style={{marginLeft: '10px'}}>
          <Tooltip content={resetStateTooltip}/>
        </span>
      </div>
    );
    const {TabHeader, getRootScope} = Tasks[task.front];
    const rootScope = getRootScope({...task, getHint});
    const tools = alkindi.manager.render(rootScope);
    return (
      <div className="tab-content">
        <Notifier alkindi={alkindi}/>
        <TabHeader task={task}/>
        {header}
        {tools}
      </div>
    );
  };

});

export const selector = function (state) {
  const {workspace} = state;
  return {workspace};
};

export default connect(selector)(CryptoTab);
