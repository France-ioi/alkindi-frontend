import React from 'react';
import {connect} from 'react-redux';
import EpicComponent from 'epic-component';
import {Button, ButtonGroup} from 'react-bootstrap';

import Notifier from '../ui/notifier';
import Tooltip from '../ui/tooltip';
import RefreshButton from '../ui/refresh_button';
import Tasks from '../tasks';

export const CryptoTab = EpicComponent(self => {

  const saveState = function () {
    const {user_id, crypto, manager} = self.props;
    // Silently ignore the request if a save operation is pending.
    if (crypto.saving)
      return;
    // Remind the user that there are no changes that need to be saved.
    if (!crypto.changed) {
      alert("Aucune modification à enregistrer.  Notez que les demandes d'indices n'ont pas besoin d'être enregistrées.");
      return;
    }
    const data = {
      title: "Révision du " + new Date().toLocaleString(),
      state: manager.save(),
      parent_id: crypto.revisionId
    };
    self.props.dispatch({type: 'CRYPTO:SAVE:BEGIN'});
    self.props.api.storeRevision(user_id, data).then(
      function (result) {
        self.props.dispatch({type: 'CRYPTO:SAVE:DONE', revisionId: result.revision_id});
      },
      function () {
        // Reset the changed flag to true as the state was not changed.
        self.props.dispatch({type: 'CRYPTO:SAVE:ERROR'});
      }
    );
  };

  const resetState = function () {
    if (window.confirm("Voulez vous vraiment repartir de zéro ?")) {
      self.props.dispatch({type: 'CRYPTO:RESET'});
    }
  };

  const getHint = function (query, callback) {
    const user_id = self.props.user_id;
    self.props.api.getHint(user_id, query).then(
      function () { callback(false); },
      callback
    );
  };

  const getQueryCost = function (query) {
    return 300;
  };

  const saveStateTooltip = (
    <p>
      Enregistrez de temps en temps votre travail pour ne pas risquer de le
      perdre.
      Chaque version que vous enregistrez sera disponible pour vous et vos
      coéquipiers dans l'onglet Historique.
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

  const onWorkspaceChanged = function (workspace) {
    self.setState({workspace});
  };

  self.state = {
    loading: true,
    workspace: undefined
  };

  self.componentWillMount = function () {
    const {task, manager, revisionId} = self.props;
    const {workspace} = self.state;
    manager.emitter.on('changed', onWorkspaceChanged);
    // If we have a workspace, leave it unchanged.
    if (crypto.workspace !== undefined) {
      self.setState({loading: false});
      return;
    }
    // If there is no current revision, set up the task.
    if (revisionId === undefined) {
      manager.clear();
      Tasks[task.front].setupTools(manager);
      self.setState({loading: false});
      return;
    }
    // Load the revision from the backend.
    self.props.api.loadRevision(revisionId).then(
      function (result) {
        const revision = result.workspace_revision;
        manager.clear();
        Tasks[task.front].setupTools(manager);
        manager.load(revision.state);
        self.setState({loading: false});
      },
      function () {
        self.setState({loading: false});
      }
    );
  };

  self.componentWillUnmount = function () {
    const {manager} = self.props;
    manager.emitter.removeListener('changed', onWorkspaceChanged);
  };

  self.render = function () {
    const {api, user_id, task, crypto, manager} = self.props;
    const {loading, workspace} = self.state;
    if (loading || workspace === undefined)
      return (
        <div>
          Chargement en cours, veuillez patienter...
          <Notifier emitter={api.emitter}/>
        </div>);
    const saveStyle = crypto.changed ? 'primary' : 'default';
    const header = (
      <div className="crypto-tab-header" style={{marginBottom: '10px'}}>
        <div className='pull-right'>
          <Tooltip content={<p>Cliquez sur ce bouton pour obtenir les indices demandés par vos coéquipiers depuis le dernier chargement de la page.</p>}/>
          {' '}
          <RefreshButton/>
        </div>
        <Button bsStyle={saveStyle} onClick={saveState}>
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
    );
    const rootScope = Tasks[task.front].getRootScope({...task, getHint, getQueryCost});
    return (
      <div>
        <Notifier emitter={api.emitter}/>
        {header}
        {manager.render(rootScope)}
      </div>
    );
  };

});

export const selector = function (state) {
  const {crypto} = state;
  return {crypto};
};

export default connect(selector)(CryptoTab);
