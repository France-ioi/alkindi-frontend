import React from 'react';
import {connect} from 'react-redux';
import {Alert} from 'react-bootstrap';
import classnames from 'classnames';

import {PureComponent} from '../misc';
import AsyncHelper from '../helpers/async_helper';
import * as api from '../api';

const TestTeamTab = function (self) {
  const setTeam = function (team) {
    self.props.dispatch({type: 'SET_TEAM', team});
  };
  const setRound = function (round) {
    self.props.dispatch({type: 'SET_ROUND', round});
  };
  const setAttempt = function (attempt) {
    self.props.dispatch({type: 'SET_ATTEMPT', attempt});
  };
  const toggleRoundAccess = function () {
    const round = self.props.round;
    setRound({...round, allow_access: !round.allow_access});
  };
  const toggleTeamOk = function () {
    const round = self.props.round;
    setRound({...round, is_team_ok: !round.is_team_ok});
  };
  const setTrainingAttempt = function () {
    const team = self.props.team;
    setTeam({...team, is_locked: true});
    setAttempt({is_started: false, is_training: true, is_successful: false});
  };
  const toggleAttemptStarted = function () {
    const attempt = self.props.attempt;
    if (attempt)
      setAttempt({...attempt, is_started: !attempt.is_started});
  };
  const toggleAttemptSuccessful = function () {
    const attempt = self.props.attempt;
    if (attempt)
      setAttempt({...attempt, is_successful: !attempt.is_successful});
  };
  const setTimedAttempt = function () {
    const team = self.props.team;
    setTeam({...team, is_locked: true}); // normalement déjà fait
    setAttempt({
      is_started: false, is_training: false, is_successful: false,
      ends_at: new Date(Date.now() + 3600000).toISOString()
    });
  };
  const render = function () {
    const boolText = function (b) {
      return (b === undefined) ? 'undefined' : b.toString();
    };
    const {round, attempt} = self.props;
    return (
      <div>
        <hr/>
        <button type="button" className="submit" onClick={toggleRoundAccess}>toggle round access</button>
        &nbsp;
        <button type="button" className="submit" onClick={toggleTeamOk}>toggle team ok</button>
        &nbsp;
        <button type="button" className="submit" onClick={setTrainingAttempt}>training</button>
        <button type="button" className="submit" onClick={toggleAttemptStarted}>toggle started</button>
        <button type="button" className="submit" onClick={toggleAttemptSuccessful}>toggle successful</button>
        <button type="button" className="submit" onClick={setTimedAttempt}>timed</button>
        <ul>
          <li>round access allowed: {boolText(round.allow_access)}</li>
          <li>team is ok for round: {boolText(round.is_team_ok)}</li>
          <li>no attempt: {boolText(attempt === undefined)}</li>
          <li>attempt is training: {attempt && boolText(attempt.is_training)}</li>
          <li>attempt is started: {attempt && boolText(attempt.is_started)}</li>
          <li>attempt is successful: {attempt && boolText(attempt.is_successful)}</li>
        </ul>
      </div>
    );
  };
  return {render};
};

const TeamTab = PureComponent(self => {
  const asyncHelper = AsyncHelper(self);
  const onIsOpenChanged = function (event) {
    self.setState({
      isOpen: event.currentTarget.value === 'true'
    });
  };
  const onLeaveTeam = function () {
    const user_id = self.props.user.id;
    asyncHelper.beginRequest();
    api.leaveTeam(user_id, function (err, result) {
      asyncHelper.endRequest(err);
      if (err) return;
      self.props.reseed();
    });
  };
  const onUpdateTeam = function () {
    const user_id = self.props.user.id;
    const data = {is_open: self.state.isOpen};
    asyncHelper.beginRequest();
    api.updateUserTeam(user_id, data, function (err, result) {
      asyncHelper.endRequest(err);
      if (err) return;
      self.props.reseed();
    });
  };
  const onStartAttempt = function () {
    return;
  };
  const renderRoundPrelude = function (round) {
    return (
      <div key='roundPrelude'>
        <p>Pour pouvoir accéder au sujet du concours, vous devez d'abord former une équipe respectant les règles suivantes :</p>
        <ul>
           <li>L'équipe doit contenir entre {round.min_team_size} et {round.max_team_size} membres.</li>
           <li>Au moins {round.min_team_ratio * 100}% des membres doit avoir été qualifiée suite au premier tour du concours.</li>
        </ul>
        <p>Notez que seules les équipes composées uniquement d'élèves en classe de seconde (générale ou pro) seront classées officiellement.</p>
      </div>
    );
  };
  const renderTeamMembers = function (team, attempt) {
    const codeEntry = attempt !== undefined && !attempt.is_started;
    // TODO: if codeEntry, display own code
    const renderMember = function (member) {
      const flags = [];
      if (team.creator.id === member.user.id)
        flags.push('créateur');
      if (member.is_selected)
        flags.push('qualifié');
      return (
        <tr key={member.user.id}>
          <td>{member.user.username}</td>
          <td>{member.user.lastname}, {member.user.firstname}</td>
          <td>{flags.join(', ')}</td>
          <td>{new Date(member.joined_at).toLocaleString()}</td>
          {codeEntry && <td><input type="text"/></td>}
        </tr>);
    };
    return (
      <div key='teamMembers' className="section">
        <p>Votre équipe est constituée de :</p>
        <table width="100%">
          <tbody>
            <tr>
              <th>Login</th>
              <th>Nom, prénom</th>
              <th>Statut</th>
              <th>Membre depuis</th>
              {codeEntry && <th>Code</th>}
            </tr>
            {team.members.map(renderMember)}
          </tbody>
        </table>
      </div>
    );
    // TODO: add button to save input codes
  };
  const renderLeaveTeam = function (team) {
    return (
      <div key='leave' className="section">
        <p>Vous pouvez quitter l'équipe :</p>
        <p>
          <button type="button" className="submit" onClick={onLeaveTeam}>Quitter l'équipe</button>
        </p>
      </div>
    );
  };
  const renderAdminControls = function (team) {
    const accessCode = self.state.isOpen && (
      <p>Code d'accès de l'équipe à leur communiquer : <strong>{team.code}</strong></p>
    );
    return (
      <div key='settings' className="section">
        <p>Vous pouvez modifier les réglages de votre équipe :</p>
        <div>
          <input type="radio" name="team-open" value="true"  id="team-open" checked={self.state.isOpen} onChange={onIsOpenChanged} />
          <div className={classnames(['radio-label', self.state.isOpen && 'radio-checked'])}>
            <label htmlFor="team-open">Permettre à d'autres personnes de rejoindre l'équipe</label>
            {accessCode}
          </div>
        </div>
        <div>
          <input type="radio" name="team-open" value="false" id="team-closed" checked={!self.state.isOpen} onChange={onIsOpenChanged} />
          <div className={classnames(['radio-label', self.state.isOpen || 'radio-checked'])}>
            <label htmlFor="team-closed">Empêcher d'autres personnes de rejoindre l'équipe</label>
          </div>
         </div>
        <button type="button" className="submit" onClick={onUpdateTeam}>Enregistrer les modifications</button>
      </div>
    );
  };
  const renderTooEarly = function (round) {
    return (
      <div key='tooEarly' className="section">
        <Alert bsStyle='success'>
          L'accès au sujet sera ouvert le {round.access_from}.
          Vous pouvez dès maintenant valider la composition de votre équipe.
        </Alert>
      </div>
    );
  };
  const renderBadTeam = function () {
    return (
      <div key='badTeam' className="section">
        <Alert bsStyle='warning'>
          La composition de votre équipe ne respecte pas les règles du tour
          et vous ne pouvez donc pas accéder à l'entrainement.
        </Alert>
      </div>
    );
  };
  const renderStartAttempt = function (message) {
    return (
      <div key='startAttempt' className="section">
        {message}
        <p>
          <button type="button" className="btn btn-primary" onClick={onStartAttempt}>Démarrer</button>
        </p>
      </div>
    );
  };
  const renderStartTraining = function () {
    const message = (
      <p>La composition de votre équipe vous permet d'accéder à l'entrainement.</p>
    );
    return renderStartAttempt(message);
  };
  const renderStartTimedAttempt = function () {
    const message = (
      <p>Vous avez résolu le sujet d'entrainement et pouvez faire une tentative en temps limité.</p>
    );
    return renderStartAttempt(message);
  };
  const renderUnlockQuestion = function (attempt) {
    const notice = attempt.is_training &&
      (<p>
        Attention, après avoir accédé au sujet vous ne pourrez plus changer la
        composition de votre équipe pendant le reste du concours.
      </p>);
    return (
      <div key='unlockQuestion' className="section">
        <p>
          Les membres de votre équipe ont donné leur accord pour accéder au sujet,
          vous pouvez maintenant le déverouiller en cliquant.
        </p>
        <p><button>Accéder au sujet</button></p>
        {notice}
      </div>
    );
  };
  const renderTrainingInProgress = function (attempt) {
    return (
      <div key='trainingInProgress' className="section">
        <p>Le sujet d'entrainement est visible dans l'onglet sujet.</p>
      </div>
    );
  };
  const renderTimedAttemptDuration = function (attempt) {
    return (
      <div key='timedAttemptDuration' className="section">
        <p>
          Lorsque vous aurez saisi plus de 50% des codes vous pourrez accéder
          au sujet, vous aurez alors 1 heure pour le résoudre.
        </p>
      </div>
    );
  };
  const renderTimedAttemptInProgress = function (attempt) {
    // TODO: changer bsStyle en fonction du temps qui reste.
    return (
      <div key='timedAttemptInProgress' className="section">
        <Alert bsStyle='success'>
          Votre tentative en temps limité se termine le {new Date(attempt.ends_at).toLocaleString()}.
        </Alert>
      </div>
    );
  };
  const testing = TestTeamTab(self);
  self.render = function () {
    const {user, team, round, attempt} = self.props;
    if (!user || !team || !round)
      return false;
    const body = [];
    const showAdminControls = !team.is_locked && team.creator.id === user.id;
    return (
      <div className="wrapper">
        <h1 key='title'>{round.title}</h1>
        {attempt === undefined && renderRoundPrelude(round)}
        {renderTeamMembers(team, attempt)}
        {showAdminControls && renderAdminControls(team)}
        {team.is_locked || renderLeaveTeam()}
        {attempt === undefined
          ? <div>
              {round.allow_access || renderTooEarly(round)}
              {round.is_team_ok ? renderStartTraining() : renderBadTeam()}
            </div>
          : (attempt.is_training
             ? (attempt.is_started
                ? (attempt.is_successful
                   ? renderStartTimedAttempt()
                   : renderTrainingInProgress())
                : (round.allow_access
                   ? renderUnlockQuestion(attempt)
                   : renderTooEarly(round)))
             : (attempt.is_started
                ? renderTimedAttemptInProgress(attempt)
                : renderTimedAttemptDuration(attempt)))
        }
        {asyncHelper.render()}
        {testing.render()}
      </div>
    );
  };
}, self => {
  return AsyncHelper.initialState({
    joinTeam: false,
    isOpen: self.props.team.is_open,
  });
});

const selector = function (state, props) {
  const {user, team, round, attempt} = state;
  return {user, team, round, attempt};
};

export default connect(selector)(TeamTab);
