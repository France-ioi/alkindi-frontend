
import React from 'react';
import EpicComponent from 'epic-component';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';
import memoize from 'memoizejs';

import {toMap} from '../misc';
import Tooltip from '../ui/tooltip';

const RevisionRow = EpicComponent(self => {

  function onLoad () {
    self.props.onLoad(self.props.revision.id);
  }

  self.render = function () {
    const {revision, creator, isCurrent, isModified, score} = self.props;
    const classes = [
      isCurrent && 'revision-isCurrent',
      isModified && 'revision-isModified'
    ];
    return (
      <tr key={revision.id} className={classnames(classes)}>
        <td>
          {isCurrent &&
            (isModified
              ? <Tooltip content={<p>Cette version a été chargée dans l'onglet Résoudre, puis modifiée.</p>}>
                  <i className="fa fa-save"/>
                </Tooltip>
              : <Tooltip content={<p>Cette version est chargée dans l'onglet Résoudre.</p>}>
                  <i className="fa fa-asterisk"/>
                </Tooltip>)}
        </td>
        <td>{new Date(revision.created_at).toLocaleString()}</td>
        <td>{creator.username}</td>
        <td className="colScore">{score !== null && score}</td>
        <td>
          <Button onClick={onLoad}>
            <i className="fa fa-code-fork"/>
            {' recharger'}
          </Button>
        </td>
      </tr>
    );
  };

});

const HistoryTabView = deps => EpicComponent(self => {

  function onLoadRevision (revisionId) {
    const {cryptoChanged} = self.props;
    if (cryptoChanged) {
      if (!confirm("Vous allez perdre vos changements dans l'onglet Résoudre si vous continuez."))
        return;
    }
    self.props.dispatch({type: deps.loadRevision, revisionId});
  }

  const renderRevisions = function (revisions) {
    const {currentRevisionId, cryptoChanged} = self.props;
    const users = toMap(self.props.users);
    return (
      <table className="table revision-list">
        <thead>
          <tr>
            <th></th>
            <th>Date d'enregistrement</th>
            <th>Auteur</th>
            <th style={{width: '64px'}}>Score</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {revisions.map(function (revision) {
            const creator = users[revision.creator_id];
            const isCurrent = currentRevisionId === revision.id;
            const isModified = isCurrent && cryptoChanged;
            return <RevisionRow key={revision.id} revision={revision} creator={creator} score={revision.score} isCurrent={isCurrent} isModified={isModified} onLoad={onLoadRevision}/>;
          })}
        </tbody>
      </table>
    );
  };

  self.render = function () {
    const {revisions} = self.props;
    return (
      <div className="tab-content">
        <div style={{marginBottom: '10px'}}>
          <div className='pull-right'>
            <Tooltip content={<p>Cliquez sur ce bouton pour mettre à jour la liste des versions enregistrées par votre équipe.</p>}/>
            {' '}
            <deps.RefreshButton/>
          </div>
        </div>
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
        <p>
          Les enregistrements indiquant un score ont été faits automatiquement
          lors de la soumission d'une réponse.
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

function HistoryTabSelector (state, props) {
  const {revision, response} = state;
  const {revisions, users} = response;
  const cryptoChanged = false; // XXX TODO: lib must signal when workspace has unsaved changes
  return {
    cryptoChanged,
    currentRevisionId: revision.revisionId,
    revisions,
    users
  };
  return {};
};

export default function (bundle, deps) {

  bundle.defineView('HistoryTab', HistoryTabSelector, HistoryTabView(
    bundle.pack('RefreshButton', 'loadRevision')));

};
