
import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Alert, Button} from 'react-bootstrap';
import Collapse, {Panel} from 'rc-collapse';
import update from 'immutability-helper';
import {takeLatest, select, call, put} from 'redux-saga/effects';

import Tooltip from '../ui/tooltip';
import ManagedProcess from '../managed_process';
import getMessage from '../messages';

export default function (bundle, deps) {

  bundle.use('setActiveTab', 'RefreshButton', 'buildRequest', 'managedRefresh', 'refresh');

  bundle.defineAction('activeTaskChanged', 'ActiveTask.Changed');
  bundle.defineAction('changeActiveAttempt', 'ActiveAttempt.Change');

  bundle.defineSelector('AttemptsTabSelector', function (state, _props) {
    const {now, user, round, round_tasks} = state.response;
    const createAttempt = ManagedProcess.getState(state, 'createAttempt');
    const activeTaskId = 'activeTask' in state
      ? state.activeTask && state.activeTask.id
      : round.task_ids.length > 0 && round.task_ids[0];
    const score = null; // getMaxScore(round_tasks);
    return {now: new Date(now).getTime(), round, round_tasks, score, activeTaskId, createAttempt};
  });

  bundle.addReducer('activeTaskChanged', function (state, action) {
    const activeTask = state.response.round_tasks[action.roundTaskId];
    return ManagedProcess.clearState({...state, activeTask});
  });

  bundle.addSaga(function* () {
    yield takeLatest(deps.changeActiveAttempt, function* (action) {
      const attempt_id = action.id;
      const request = yield select(deps.buildRequest, {attempt_id});
      if (yield call(deps.managedRefresh, request)) {
        yield put({type: deps.setActiveTab, tabKey: 'task'});
      }
    });
  });

  bundle.include(ManagedProcess('createAttempt', 'Attempt.Create', p => function* (action) {
    const {participation_id, api} = yield select(getApiContext);
    let result;
    try {
      result = yield call(api.createAttempt, participation_id, action.roundTaskId);
    } catch (ex) { // ex.err, ex.res
      yield p.failure('server error');
      return;
    }
    if (result.success) {
      yield p.success();
      yield put({type: deps.refresh});
    } else {
      yield p.failure(result.error);
    }
  }));
  function getApiContext (state) {
    const {response, api} = state;
    const {participation_id} = response;
    return {api, participation_id};
  }

  bundle.use('createAttempt');
  bundle.defineView('AttemptsTab', 'AttemptsTabSelector', EpicComponent(self => {

    function onSwitchTab (tabKey) {
      self.props.dispatch({type: deps.setActiveTab, tabKey});
    }

    function onTaskChange (roundTaskId) {
      self.props.dispatch({type: deps.activeTaskChanged, roundTaskId});
    }

    function onAttemptChange (event) {
      const id = event.currentTarget.getAttribute('data-id');
      self.props.dispatch({type: deps.changeActiveAttempt, id});
    }

    function onAddAttempt (event) {
      const roundTaskId = event.currentTarget.getAttribute('data-roundTaskId');
      self.props.dispatch({type: deps.createAttempt, roundTaskId});
    }

    function getTimeElapsed (when) {
      return Math.floor((new Date(when).getTime() - self.props.now) / 60000);
    }

    const renderAttempt = function (attempt, round_task) {
      const {max_score} = round_task;
      const {ordinal, closes_at, score, ratio} = attempt;
      const is_started = !!attempt.started_at;
      const rem_time = is_started && closes_at && getTimeElapsed(closes_at);
      const classes = [
        'row',
        'attempt',
        attempt.is_current && 'attempt-current'
      ];
      return (
        <div key={ordinal} className={classnames(classes)} onClick={onAttemptChange} data-id={attempt.id}>
          <div className="col attempt-icons">
            {is_started && (
              ratio == 0
              ? <span className='attempt-label-unsolved' title="En cours de résolution"><i className="fa fa-eye" aria-hidden="true"></i></span>
              : ratio == 1
                ? <span className='attempt-label-fully_solved' title="Résolu (score maximal)"><i className="fa fa-check-circle" aria-hidden="true"></i></span>
              : <span className='attempt-label-solved' title="Partiellement résolu (score améliorable)"><i className="fa fa-dot-circle-o" aria-hidden="true"></i></span>)}
          </div>
          <div className="col attempt-icons">
            {attempt.is_training && <span className='attempt-label-training' title="Entraînement"><i className="fa fa-key" aria-hidden="true"></i></span>}
          </div>
          <div className="col attempt-details">
            {"Tentative "}
            <span className='attempt-ordinal'>{ordinal}</span>
            {is_started && " démarrée le "}
            {is_started && new Date(attempt.started_at).toLocaleString()}
          </div>
          <div className="col attempt-status">
            {attempt.is_completed
              ? <span className='attempt-label-closed'>{"Terminé"}</span>
              : rem_time && <span><i className="fa fa-clock-o" aria-hidden="true"></i>{"Temps restant : "}{rem_time}{"min"}</span>}
          </div>
          <div className="col attempt-score">
            {score}{' / '}{max_score}
          </div>
        </div>
      );
    };

    function renderCreateAttempt (round_task_id) {
      const {pending, error} = self.props.createAttempt || {};
      return (
        <div>
          <p className="text-center">
            <Button onClick={onAddAttempt} data-roundTaskId={round_task_id}>
              <i className="fa fa-plus"/>
              {" Ajouter une tentative pour ce sujet"}
              {pending &&
                <span>{' '}<i className="fa fa-spinner fa-spin"/></span>}
            </Button>
          </p>
          {/* TODO: add warning if max score reached */}
          {error && <Alert bsStyle='danger'>{getMessage(error)}</Alert>}
        </div>
      );
    }

    function renderHeader_2016R2 () {
      return (
        <div>
          <p>
            {"Avant de commencer, assurez-vous de consulter les explications générales du "}
            <a href="http://concours-alkindi.fr/#/infosTour2" target="_blank">{"fonctionnement du tour 2"}</a>
            {"."}
          </p>
          <p>{"Le 2ème tour est constitué des 8 sujets ci-dessous."}</p>
          <p>{"Certaines fonctionnalités comme l’historique et le récapitulatif des réponses seront activées très prochainement."}</p>
          <p style={{fontWeight: "bold"}}>{"Votre score pour chaque sujet est le score de votre meilleure tentative pour ce sujet."}</p>
        </div>
      );
    }

    self.render = function () {
      const {round, score, round_tasks, activeTaskId} = self.props;
      /* accordéon tasks */
      return (
        <div className="tab-content">
          <div className="pull-right">
            <Tooltip content={<p>Cliquez sur ce bouton pour recharger la situation de vos épreuves.</p>}/>
            {' '}
            <deps.RefreshButton/>
          </div>
          <h1>{round.title}</h1>
          {false && <p>Les épreuves seront accessibles à partir du 16 janvier.</p>}
          {false && renderHeader_2016R2()}
          {true &&
            <p>Les épreuves seront accessibles à partir du 20 mars et se dérouleront sous la surveillance d'un enseignant.</p>}
          {typeof score == 'number' &&
            <p className="team-score">
              Score actuel de l'équipe (meilleur score parmi les épreuves
              en temps limité) : <span className="team-score">{score}</span>.
            </p>}
          <div className="tasks">
            <Collapse accordion={true} activeKey={''+activeTaskId} onChange={onTaskChange}>
              {round.task_ids.map(round_task_id => {
                const round_task = round_tasks[round_task_id];
                // XXX Temporary, best_score should be a property of round_task.
                const best_score = round_task.attempts.reduce(function (acc, elm) {
                  return elm.score ? Math.max(parseFloat(elm.score), acc) : acc; }, 0);
                const header = (
                  <span>
                    <span className="task-score">
                      {best_score}{' / '}{round_task.max_score}
                    </span>
                    <span className="task-title">
                      {round_task.title}
                    </span>
                  </span>);
                return (
                  <Panel key={round_task_id} className="task" header={header}>
                    {round_task.attempts &&
                    <div className="attempts container-fluid">
                      {round_task.attempts.map(attempt => renderAttempt(attempt, round_task))}
                    </div>}
                    {renderCreateAttempt(round_task_id)}
                  </Panel>);
                })}
            </Collapse>
          </div>
        </div>
      );
    };
  }));

};

function getMaxScore (attempts) {
  let max_score;
  attempts.forEach(function (attempt) {
    // The attempt's max_score may be null (no score) or undefined
    // (synthetic attempt).  If there is a score it will be a non-
    // empty string, which is truthy.
    if (!attempt.is_training && attempt.max_score) {
      // Parse max_score as it is a decimal type sent as a string.
      const score = parseInt(attempt.max_score);
      if (max_score === undefined || score > max_score)
        max_score = score;
    }
  });
  return max_score;
}
