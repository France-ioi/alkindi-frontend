import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
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
  const setQuestion = function (question) {
    self.props.dispatch({type: 'SET_QUESTION', question});
  };
  const toggleBeforeRoundStart = function () {
    const round = self.props.round;
    const training_opens_at =
      (self.props.round_has_not_started ? new Date() : new Date(Date.now() + 600000)).toISOString();
    setRound({...round, training_opens_at});
  };
  const toggleInvalidTeam = function () {
    const team = self.props.team;
    setTeam({...team, is_invalid: !team.is_invalid});
  };
  const setTrainingAttempt = function () {
    const team = self.props.team;
    setTeam({...team, is_locked: true});
    setQuestion(undefined);
    setAttempt({needs_codes: true, is_training: true, is_unsolved: true});
  };
  const toggleCodesEntered = function () {
    const attempt = self.props.attempt;
    if (attempt)
      setAttempt({...attempt, needs_codes: !attempt.needs_codes});
  };
  const toggleAttemptResolved = function () {
    const attempt = self.props.attempt;
    if (attempt)
      setAttempt({...attempt, is_unsolved: !attempt.is_unsolved});
  };
  const setTimedAttempt = function () {
    const team = self.props.team;
    setTeam({...team, is_locked: true}); // normalement déjà fait
    setQuestion(undefined);
    setAttempt({
      needs_codes: true, is_training: false, is_unsolved: true,
      duration: 60, ends_at: new Date(Date.now() + 3600000).toISOString()
    });
  };
  const toggleQuestionAvailable = function () {
    const question = self.props.question;
    setQuestion(question ? undefined : {});
  };
  const redGreen = function (cond, ifTrue, ifFalse) {
    return <label>{cond
      ? <span style={{color: 'red'}}>{ifTrue}</span>
      : <span style={{color: 'green'}}>{ifFalse}</span>}</label>;
  };
  const render = function () {
    const boolText = function (b) {
      return (b === undefined) ? 'undefined' : b.toString();
    };
    const {team, round, attempt, question, round_has_not_started} = self.props;
    return (
      <div>
        <hr/>
        <ul>
          <li>
            {redGreen(team.is_invalid, 'team is invalid', 'team is valid')}
            <button type="button" className="btn btn-primary" onClick={toggleInvalidTeam}>toggle</button>
          </li>
          <li>
            {redGreen(!attempt, 'no attempt', 'attempt exists')}
            <button type="button" className="btn btn-primary" onClick={setTrainingAttempt}>training</button>
            <button type="button" className="btn btn-primary" onClick={setTimedAttempt}>timed</button>
          </li>
          <li>
            {redGreen(round_has_not_started, 'round has not started', 'round has started')}
            <button type="button" className="btn btn-primary" onClick={toggleBeforeRoundStart}>toggle</button>
          </li>
          {attempt && <li>{attempt.is_training ? 'attempt is training' : 'attempt is timed'}</li>}
          {attempt && <li>
            {redGreen(attempt.needs_codes, 'attempt needs codes', 'attempt is confirmed')}
            <button type="button" className="btn btn-primary" onClick={toggleCodesEntered}>toggle</button>
          </li>}
          {attempt && <li>
            {redGreen(!question, 'question not accessed', 'question accessed')}
            <button type="button" className="btn btn-primary" onClick={toggleQuestionAvailable}>toggle</button>
          </li>}
          {attempt && <li>
            {redGreen(attempt.is_unsolved, 'attempt is unresolved', 'attempt was solved')}
            <button type="button" className="btn btn-primary" onClick={toggleAttemptResolved}>toggle</button>
          </li>}
        </ul>
        <p>{JSON.stringify(team)}</p>
      </div>
    );
  };
  return {render};
};

const TeamTab = PureComponent(self => {
  const asyncHelper = AsyncHelper(self);
  const refresh = function () {
    self.props.reseed();
  };
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
      refresh();
    });
  };
  const onUpdateTeam = function () {
    const user_id = self.props.user.id;
    const data = {is_open: self.state.isOpen};
    asyncHelper.beginRequest();
    api.updateUserTeam(user_id, data, function (err, result) {
      asyncHelper.endRequest(err);
      if (err) return;
      refresh();
    });
  };
  const onStartAttempt = function () {
    const user_id = self.props.user.id;
    asyncHelper.beginRequest();
    api.startAttempt(user_id, function (err, result) {
      asyncHelper.endRequest(err);
      if (err) return;
      refresh();
    });
  };
  const onCancelAttempt = function () {
    const user_id = self.props.user.id;
    asyncHelper.beginRequest();
    api.cancelAttempt(user_id, function (err, result) {
      asyncHelper.endRequest(err);
      if (err) return;
      self.setState({access_code: undefined});
      refresh();
    });
  }
  const onRevealAccessCode = function () {
    const user_id = self.props.user.id;
    asyncHelper.beginRequest();
    api.getAccessCode(user_id, function (err, result) {
      asyncHelper.endRequest(err);
      if (err) return;
      self.setState({access_code: result.body.code});
    });
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
  const renderTeamMembers = function (team, codeEntry) {
    const renderMember = function (member) {
      const flags = [];
      if (team.creator.id === member.user.id)
        flags.push('créateur');
      if (member.is_qualified)
        flags.push('qualifié');
      return (
        <tr key={member.user.id}>
          <td>{member.user.username}</td>
          <td>{member.user.lastname}, {member.user.firstname}</td>
          <td>{flags.join(', ')}</td>
          <td>{new Date(member.joined_at).toLocaleString()}</td>
          {codeEntry &&
            (member.access_code === undefined
             ? <td className="unlock-code">
                 <input type="text"/>
                 <Button bsSize="small">
                   <i className="fa fa-check"/>
                 </Button>
               </td>
             : <td className="unlocked-code">{member.access_code}</td>)}
        </tr>);
    // TODO: codeEntry
    //       ? needs_codes
    //         ? display input box, button
    //         : display entered code
    //       : no code column
    };
    return (
      <div className="section">
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
      <div className="section">
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
  const renderCodeEntry = function () {
    const {access_code} = self.state;
    return (
      <div>
        <p>
          Votre code de lancement personnel vous permet d'autoriser le reste
          de votre équipe à accéder à l'épreuve:
        </p>
        <p className="access-code-block">
          <span className="access-code">
            {access_code === undefined
             ? <Button bsSize="large" onClick={onRevealAccessCode}>
                 <i className="fa fa-unlock-alt"></i> révéler
               </Button>
             : <span className="code">{access_code}</span>}
          </span>
          <Button bsSize="large" onClick={onCancelAttempt}>
            <i className="fa fa-times"></i> annuler
          </Button>
        </p>
      </div>
    );
  };
  const renderTooEarly = function (round) {
    return (
      <div className="section">
        <Alert bsStyle='success'>
          L'accès au sujet sera ouvert le {new Date(round.training_opens_at).toLocaleString()}.
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
      <div className="section">
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
  const renderEnterCodes = function (attempt) {
    return (
      <div className="section">
        <p>
          Lorsque vous aurez saisi plus de 50% des codes vous pourrez accéder
          au sujet
            {attempt.is_training
             ? <span> d'entrainement</span>
             : <span>, vous aurez alors {attempt.duration} minutes pour le résoudre</span>}.
        </p>
      </div>
    );
  };
  const renderCodesEnteredEarly = function (round) {
    return (
      <div key='tooEarly' className="section">
        <p>
          Les membres de votre équipe ont donné leur accord pour accéder au sujet,
          vous êtes prêts à commencer dès l'ouverture de l'épreuve.
        </p>
        <Alert bsStyle='success'>
          L'accès au sujet sera ouvert le {new Date(round.training_opens_at).toLocaleString()}.
        </Alert>
      </div>
    );
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
        <p>Le sujet d'entrainement est visible dans l'onglet Sujet.</p>
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
    const {user, team, round, attempt, question, round_has_not_started} = self.props;
    if (!user || !team || !round)
      return false;
    const codeEntry = attempt !== undefined;
    const showAdminControls = !codeEntry && !team.is_locked && team.creator.id === user.id;
    const canLeaveTeam = !codeEntry && !team.is_locked;
    // Conditions in the decision tree are ordered so leftmost-innermost
    // traversal corresponds to chronological order.
    return (
      <div className="wrapper">
        <div className='pull-right'>
          <button className='btn btn-primary' onClick={refresh}>
            <i className="fa fa-refresh"></i>
          </button>
        </div>
        <h1 key='title'>{round.title}</h1>
        {attempt === undefined && renderRoundPrelude(round)}
        {renderTeamMembers(team, codeEntry)}
        {codeEntry && renderCodeEntry()}
        {showAdminControls && renderAdminControls(team)}
        {canLeaveTeam && renderLeaveTeam()}
        {attempt === undefined
          ? <div>
              {round_has_not_started && renderTooEarly(round)}
              {team.is_invalid
               ? renderBadTeam()
               : renderStartTraining()}
            </div>
          : (attempt.is_training
             ? (attempt.needs_codes
                ? (round_has_not_started
                   ? renderTooEarly(round)
                   : renderEnterCodes(attempt))
                : (attempt.is_unsolved
                   ? (question === undefined
                      ? (round_has_not_started
                         ? renderCodesEnteredEarly(round)
                         : renderUnlockQuestion(attempt))
                      : renderTrainingInProgress())
                   : renderStartTimedAttempt()))
             : (attempt.needs_codes
                ? renderEnterCodes(attempt)
                : (question === undefined
                   ? renderUnlockQuestion(attempt)
                   : renderTimedAttemptInProgress(attempt))))
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
  const {user, team, round, attempt, question, round_has_not_started} = state;
  return {user, team, round, attempt, question, round_has_not_started};
};

export default connect(selector)(TeamTab);
