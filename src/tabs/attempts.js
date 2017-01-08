import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Button,} from 'react-bootstrap';
import Collapse, {Panel} from 'rc-collapse';
import {include, use, defineAction, defineSelector, defineView, addReducer} from 'epic-linker';

import Tooltip from '../ui/tooltip';
import AttemptTimeline from '../ui/attempt_timeline';

export default function* (deps) {

  yield include(AttemptTimeline);
  yield use('AttemptTimeline');

  yield use('setActiveTab', 'RefreshButton');

  yield defineAction('activeTaskChanged', 'ActiveTask.Changed');

  yield defineSelector('AttemptsTabSelector', function (state, _props) {
    const {now, user, round} = state.response;
    const activeTaskId = 'activeTask' in state
      ? state.activeTask && state.activeTask.id
      : round.tasks.length > 0 && round.tasks[0].id;
    // const {attempt} = state;
    const score = null; // round.hide_scores ? null : getMaxScore(attempts);
    return {now: new Date(now).getTime(), round, score, activeTaskId};
  });

  yield addReducer('activeTaskChanged', function (state, action) {
    const activeTask = findActiveTaskByKey(state.response.round.tasks, action.key);
    return {...state, activeTask};
  });
  function findActiveTaskByKey (tasks, key) {
    for (let task of tasks) {
      // Use of == to compare task.id (integer) and key (string).
      if (task.id == key) {
        return task;
      }
    }
    return false;
  }

  yield defineView('AttemptsTab', 'AttemptsTabSelector', EpicComponent(self => {

    function onSwitchTab (tabKey) {
      self.props.dispatch({type: deps.setActiveTab, tabKey});
    }

    function onTaskChange (key) {
      self.props.dispatch({type: deps.activeTaskChanged, key});
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
        <div key={ordinal} className={classnames(classes)}>
          <div className="col">
            {is_started && (
              ratio == 0
              ? <span className='attempt-label-unsolved attempt-tag'><i className="fa fa-eye" aria-hidden="true"></i> {"En cours de résolution"}</span>
              : ratio == 1
                ? <span className='attempt-label-fully_solved attempt-tag'><i className="fa fa-check-circle" aria-hidden="true"></i> {"Résolu (score maximal)" /* icone check vert */}</span>
              : <span className='attempt-label-solved attempt-tag'><i className="fa fa-dot-circle-o" aria-hidden="true"></i> {"Partiellement résolu (score améliorable)" /* icone orange */}</span>)}
          </div>
          <div className="col">
            {attempt.is_training && <span className='attempt-label-training attempt-tag'><i className="fa fa-key" aria-hidden="true"></i> {"Entraînement"}</span>}
          </div>
          <div className="col">
            {"Tentative "}
            <span className='attempt-ordinal'>{ordinal}</span>
            {is_started && " démarrée "}
            {is_started && new Date(attempt.started_at).toLocaleString()}
          </div>
          <div className="col">
            {attempt.is_completed
              ? <span className='attempt-label-closed attempt-tag'>{"Terminé"}</span>
              : rem_time && <span><i className="fa fa-clock-o" aria-hidden="true"></i>{"Temps restant : "}{rem_time}{"min"}</span>}
          </div>
          <div className="col">
            {score}{' / '}{max_score}
          </div>
        </div>
      );
    };

    self.render = function () {
      const {round, score, activeTaskId} = self.props;
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
          {typeof score == 'number' &&
            <p className="team-score">
              Score actuel de l'équipe (meilleur score parmi les épreuves
              en temps limité) : <span className="team-score">{score}</span>.
            </p>}
          <div className="tasks">
            <Collapse accordion={true} activeKey={''+activeTaskId} onChange={onTaskChange}>
              {round.tasks.map(round_task => {
                const header = (
                  <span className="task-title">
                    {round_task.task.title}
                  </span>);
                return (
                  <Panel key={round_task.id} className="task" header={header}>
                    {round_task.attempts &&
                    <div className="attempts">
                      {round_task.attempts.map(attempt => renderAttempt(attempt, round_task))}
                    </div>}
                    <Button>{"Ajouter une tentative pour ce sujet"}</Button>
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
