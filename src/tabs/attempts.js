import React from 'react';
import EpicComponent from 'epic-component';
import {Button} from 'react-bootstrap';
import {include, use, defineSelector, defineView, addReducer} from 'epic-linker';

import Tooltip from '../ui/tooltip';
import AttemptTimeline from '../ui/attempt_timeline';

export default function* (deps) {

  yield include(AttemptTimeline);
  yield use('AttemptTimeline');

  yield use('setActiveTab', 'RefreshButton');

  yield defineSelector('AttemptsTabSelector', function (state, _props) {
    const {user, round, tasks} = state.response;
    // const {attempt} = state;
    const score = null; // round.hide_scores ? null : getMaxScore(attempts);
    return {round, tasks, score};
  });

  yield defineView('AttemptsTab', 'AttemptsTabSelector', EpicComponent(self => {

    const accessCodes = {};
    self.state = {access_code: undefined};

    const refAccessCode = function (element) {
      if (element) {
        const user_id = element.getAttribute('data-user_id');
        accessCodes[user_id] = element;
      }
    };

    const clearAccessCode = function () {
      self.setState({access_code: undefined});
    };

    const onSwitchTab = function (tabKey) {
      self.props.dispatch({type: deps.setActiveTab, tabKey});
    };

    const onEnterAccessCode = function (event) {
      const attemptId = self.props.attempt.id;
      const codeUserId = event.currentTarget.getAttribute('data-user_id');
      const element = accessCodes[codeUserId];
      const code = element.value.trim();
      self.props.dispatch({type: deps.enterAccessCode, attemptId, codeUserId, code});
      // SAGA: enterAccessCode ->
      //       old: api.enterAccessCode(user_id, {code: code, user_id: code_user_id})
      //       new: api.enterAccessCode(attempt_id, {code: code, user_id: code_user_id})
    };

    self.render = function () {
      const {round, attempts, codeEntry, score} = self.props;
      return (
        <div className="wrapper">
          <div className="pull-right">
            <Tooltip content={<p>Cliquez sur ce bouton pour recharger la situation de vos épreuves.</p>}/>
            {' '}
            <deps.RefreshButton/>
          </div>
          <h1>{round.title}</h1>
          <p>Les épreuves seront accessibles à partir du 16 janvier.</p>
          {typeof score == 'number' &&
            <p className="team-score">
                Score actuel de l'équipe (meilleur score parmi les épreuves
                en temps limité) : <span className="team-score">{score}</span>.
              </p>}
          {codeEntry && renderCodeEntry()}
          {attempts &&
            <div className="attempts">
              {attempts.map(attempt => <deps.AttemptTimeline key={attempt.ordinal} attempt={attempt}/>)}
            </div>}
        </div>
      );
    };
  }));

  yield addReducer('refresh', function (state) {
    return {...state, accessCode: false};
  });

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
