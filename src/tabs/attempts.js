import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Button} from 'react-bootstrap';
import {include, use, defineSelector, defineView, addReducer} from 'epic-linker';

import Tooltip from '../ui/tooltip';
import AttemptTimeline from '../ui/attempt_timeline';

export default function* (deps) {

  yield include(AttemptTimeline);
  yield use('AttemptTimeline');

  yield use('setActiveTab', 'RefreshButton');

  yield defineSelector('AttemptsTabSelector', function (state, _props) {
    const {user, round} = state.response;
    // const {attempt} = state;
    const score = null; // round.hide_scores ? null : getMaxScore(attempts);
    return {round, score};
  });

  yield defineView('AttemptsTab', 'AttemptsTabSelector', EpicComponent(self => {

    const onSwitchTab = function (tabKey) {
      self.props.dispatch({type: deps.setActiveTab, tabKey});
    };

    const renderAttempt = function (attempt) {
      const {ordinal, duration} = attempt;
      const is_started = attempt.started_at !== null;
      const is_timed = typeof duration === 'number';
      const classes = [
        'attempt',
        attempt.is_current && 'attempt-current',
        attempt.is_training && 'attempt-training',
        is_started && 'attempt-started',
        is_timed && 'attempt-timed',
        attempt.is_closed && 'attempt-closed',
        attempt.is_fully_solved && 'attempt-fully_solved',
        attempt.is_unsolved && 'attempt-unsolved'
      ];
      return (
        <div key={ordinal} className={classnames(classes)}>
          <span className='attempt-ordinal'>{ordinal}</span>
          {attempt.is_training
            ? <span className='attempt-label-training'>{"Entraînement"}</span>
            : is_timed
              ? <span className='attempt-label-timed'>{"Temps limité "}{duration}{"min"}</span>
              : <span className='attempt-label-untimed'>{"Sans limite de temps"}</span>}
          {attempt.is_timed && attempt.is_closed &&
            <span className='attempt-label-closed'>{"Terminé"}</span>}
          {attempt.is_started
            ? attempt.is_fully_solved
              ? <span className='attempt-label-fully_solved'>{"Résolu, score maximal"}</span>
              : attempt.is_unsolved
                ? <span className='attempt-label-unsolved'>{"En cours de résolution"}</span>
                : <span className='attempt-label-solved'>{"Partiellement résolu (score améliorable)"}</span>
            : <span className='attempt-label-not_started'>{"Pas démarré"}</span>}
          <Button>{"Ajouter une tentative pour ce sujet"}</Button>
        </div>
      );
    };

    self.render = function () {
      const {round, score} = self.props;
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
            {round.tasks.map(round_task =>
              <div className="task" key={round_task.id}>
                <div className="task-title">
                  {round_task.task.title}
                </div>
                {round_task.attempts &&
                <div className="attempts">
                  {round_task.attempts.map(renderAttempt)}
                </div>}
              </div>)}
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
