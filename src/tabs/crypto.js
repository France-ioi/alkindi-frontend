import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {PureComponent} from '../misc';
import * as actions from '../actions';
import * as PlayFair from './playfair';

const CryptanalysisTab = PureComponent(self => {

  const api = Alkindi.api;

  const changeCrypto = function (func) {
    const {crypto, dispatch} = self.props;
    dispatch({
      type: 'SET_CRYPTO',
      crypto: func(crypto)
    });
  };

  const getToolState = function (i) {
    return self.props.crypto.tools[i].state
  };

  const setToolState = function (i, data) {
    changeCrypto(function (crypto) {
      return {
        ...crypto,
        changed: true,
        tools: at(i, function (tool) { return {...tool, state: data}; })(crypto.tools)
      };
    });
  };

  const saveState = function () {
    const user_id = self.props.user_id;
    const {crypto, dispatch} = self.props;
    const {changed} = crypto;
    if (!changed) {
      alert("Aucune modification à enregistrer.  Notez que les demandes d'indices n'ont pas besoin d'être enregistrées.");
      return;
    }
    const data = {
      title: "Révision du " + new Date().toLocaleString(),
      state: crypto.tools,
      parent_id: crypto.revisionId
    };
    changeCrypto(function (crypto) {
      return {...crypto, changed: false};
    });
    api.storeRevision(user_id, data).then(
      function (result) {
        changeCrypto(function (crypto) {
          return {...crypto,
            changed: false,
            revisionId: result.revision_id
          };
        });
      },
      function () {
        // Reset the changed flag to true as the state was not changed.
        changeCrypto(function (crypto) {
          return {...crypto, changed: true};
        });
      }
    );
  };

  const resetState = function () {
    if (window.confirm("Voulez vous vraiment repartir de zéro ?")) {
      changeCrypto(function (crypto) {
        return {
          ...crypto,
          tools: initialTools,
          revisionId: undefined,
          changed: false
        };
      });
    }
  };

  const getHint = function (query, callback) {
    const user_id = self.props.user_id;
    api.getHint(user_id, query).then(
      function () { callback(false); },
      callback
    );
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

  // Create the workspace.
  const workspace = Workspace({getToolState, setToolState});
  PlayFair.setupTools(workspace.addTool);

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
    api.loadRevision(revisionId).then(
      function (result) {
        const revision = result.workspace_revision;
        changeCrypto(function (crypto) {
          return {...crypto, loading: false, tools: revision.state};
        });
      },
      function () {
        changeCrypto(function (crypto) {
          return {...crypto, loading: false};
        });
      }
    );
  };

  self.render = function () {
    const {user_id, task, crypto} = self.props;
    const {tools, loading, changed} = crypto;
    if (loading || tools === undefined)
      return (
        <div>
          Chargement en cours, veuillez patienter...
          <Notifier emitter={api.emitter}/>
        </div>);
    const saveStyle = changed ? 'primary' : 'default';
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
    const taskApi = {...task, getHint};
    return (
      <div>
        <Notifier emitter={api.emitter}/>
        <PlayFair.TabContent header={header} task={taskApi} workspace={workspace} user_id={user_id}/>
      </div>
    );
  };

});

const tabSelector = function (state) {
  const {crypto, response} = state;
  const {user, task} = response;
  return {user_id: user.id, task, crypto};
};

export default connect(selector)(CryptanalysisTab);
