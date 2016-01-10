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
