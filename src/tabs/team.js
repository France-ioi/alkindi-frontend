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
  const setTask = function (task) {
    self.props.dispatch({type: 'SET_TASK', task});
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
    setTask(undefined);
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
    setTask(undefined);
    setAttempt({
      needs_codes: true, is_training: false, is_unsolved: true,
      duration: 60, ends_at: new Date(Date.now() + 3600000).toISOString()
    });
  };
  const toggleTaskAvailable = function () {
    const task = self.props.task;
    setTask(task ? undefined : {});
  };
  const redGreen = function (cond, ifTrue, ifFalse) {
    return (
      <label>
        {cond
        ? <span style={{color: 'red'}}>{ifTrue}</span>
        : <span style={{color: 'green'}}>{ifFalse}</span>}
      </label>
    );
  };
  const render = function () {
    const {team, round, attempt, task, round_has_not_started} = self.props;
    return (
      <div>
        <hr/>
        <ul>
          <li>
            {redGreen(team.is_invalid, 'team is invalid', 'team is valid')}
            <Button onClick={toggleInvalidTeam}>toggle</Button>
          </li>
          <li>
            {redGreen(!attempt, 'no attempt', 'attempt exists')}
            <Button onClick={setTrainingAttempt}>training</Button>
            <Button onClick={setTimedAttempt}>timed</Button>
          </li>
          <li>
            {redGreen(round_has_not_started, 'round has not started', 'round has started')}
            <Button onClick={toggleBeforeRoundStart}>toggle</Button>
          </li>
          {attempt && <li>{attempt.is_training ? 'attempt is training' : 'attempt is timed'}</li>}
          {attempt && <li>
            {redGreen(attempt.needs_codes, 'attempt needs codes', 'attempt is confirmed')}
            <Button onClick={toggleCodesEntered}>toggle</Button>
          </li>}
          {attempt && <li>
            {redGreen(!task, 'task not accessed', 'task accessed')}
            <Button onClick={toggleTaskAvailable}>toggle</Button>
          </li>}
          {attempt && <li>
            {redGreen(attempt.is_unsolved, 'attempt is unresolved', 'attempt was solved')}
            <Button onClick={toggleAttemptResolved}>toggle</Button>
          </li>}
        </ul>
        <p>Team: {JSON.stringify(team)}</p>
        <p>Round: {JSON.stringify(round)}</p>
        <p>Attempt: {JSON.stringify(attempt)}</p>
      </div>
    );
  };
  return {render};
};

const TeamTab = PureComponent(self => {
  const asyncHelper = AsyncHelper(self);
  const refresh = function () {
    self.setState({access_code: undefined});
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
    api.leaveTeam(user_id, function (err, _result) {
      asyncHelper.endRequest(err);
      if (err) return;
      refresh();
    });
  };
  const onUpdateTeam = function () {
    const user_id = self.props.user.id;
    const data = {is_open: self.state.isOpen};
    asyncHelper.beginRequest();
    api.updateUserTeam(user_id, data, function (err, _result) {
      asyncHelper.endRequest(err);
      if (err) return;
      refresh();
    });
  };
  const onStartAttempt = function () {
    const user_id = self.props.user.id;
    asyncHelper.beginRequest();
    api.startAttempt(user_id, function (err, _result) {
      asyncHelper.endRequest(err);
      if (err) return;
      refresh();
    });
  };
  const onCancelAttempt = function () {
    const user_id = self.props.user.id;
    asyncHelper.beginRequest();
    api.cancelAttempt(user_id, function (err, _result) {
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
      self.setState({access_code: result.code});
    });
  };
  const onEnterAccessCode = function (event) {
    const user_id = self.props.user.id;
    const code_user_id = event.currentTarget.getAttribute('data-user_id');
    const element = self.refs['access_code_' + code_user_id];
    const code = element.value;
    element.value = '';
    asyncHelper.beginRequest();
    api.enterAccessCode(user_id, {code: code, user_id: code_user_id}, function (err, _result) {
      asyncHelper.endRequest(err, function (error) {
        if (error === 'bad code')
          return "Le code que vous avez saisi est incorrect.";
      });
      if (err) return;
      refresh();
    });
  };
  const onAccessTask = function () {
    const user_id = self.props.user.id;
    asyncHelper.beginRequest();
    api.assignAttemptTask(user_id, function (err, _result) {
      asyncHelper.endRequest(err, function (error) {
        if (error === 'already have a task') {
          refresh();
          return false;
        }
        if (error === 'training is not open')
          return "L'épreuve n'est pas encore ouverte.";
      });
      if (err) return;
      refresh();
    });
  };
  const renderRefreshButton = function () {
    return (
      <div className='pull-right'>
        <Button bsStyle='primary' onClick={refresh}>
          <i className="fa fa-refresh"/>
        </Button>
      </div>
    );
  };
  const renderRoundPrelude = function (round) {
    return (
      <div>
        <p>Pour pouvoir accéder au sujet du concours, vous devez d'abord former une équipe respectant les règles suivantes :</p>
        <ul>
           <li>L'équipe doit contenir entre {round.min_team_size} et {round.max_team_size} membres.</li>
           <li>Au moins {round.min_team_ratio * 100}% des membres doivent avoir été qualifiés suite au premier tour du concours.</li>
        </ul>
        <p>Notez que seules les équipes composées uniquement d'élèves en classe de seconde (générale ou pro) seront classées officiellement.</p>
        <p>Votre équipe est constituée de :</p>
      </div>
    );
  };
  const renderAttemptPrelude = function (_attempt) {
    return (
      <div>
        <p>La moitié au moins des membres de l'équipe doit fournir son code de
           lancement pour autoriser l'accès au sujet.</p>
      </div>
    );
  };
  const renderTeamMembers = function (team, haveAttempt) {
    const renderMember = function (member) {
      const user_id = member.user_id;
      const flags = [];
      if (team.creator.id === user_id)
        flags.push('créateur');
      if (member.is_qualified)
        flags.push('qualifié');
      return (
        <tr key={member.user.id}>
          <td>{member.user.username}</td>
          <td>{member.user.lastname}, {member.user.firstname}</td>
          <td>{flags.join(', ')}</td>
          <td>{new Date(member.joined_at).toLocaleString()}</td>
          {haveAttempt &&
            (member.access_code === undefined
             ? <td className="unlock-code">
                 <input type="text" ref={'access_code_'+user_id} />
                 <Button bsSize="small" onClick={onEnterAccessCode} data-user_id={user_id}>
                   <i className="fa fa-check"/>
                 </Button>
               </td>
             : <td className="unlocked-code">{member.access_code}</td>)}
        </tr>);
    };
    return (
      <div className="section">
        <table width="100%">
          <tbody>
            <tr>
              <th>Login</th>
              <th>Nom, prénom</th>
              <th>Statut</th>
              <th>Membre depuis</th>
              {haveAttempt && <th>Code de lancement du sujet</th>}
            </tr>
            {team.members.map(renderMember)}
          </tbody>
        </table>
      </div>
    );
  };
  const renderLeaveTeam = function () {
    return (
      <div className="section">
        <p>Vous pouvez quitter l'équipe :</p>
        <p className="text-center">
          <Button onClick={onLeaveTeam}>
            <i className="fa fa-arrow-left"/> quitter l'équipe
          </Button>
        </p>
      </div>
    );
  };
  const renderAdminControls = function (team) {
    const {isOpen} = self.state;
    return (
      <div className="section">
        <p>Vous pouvez modifier les réglages de votre équipe :</p>
        <div>
          <input type="radio" name="team-open" value="true"  id="team-open" checked={self.state.isOpen} onChange={onIsOpenChanged} />
          <div className={classnames(['radio-label', isOpen && 'radio-checked'])}>
            <label htmlFor="team-open">Permettre à d'autres personnes de rejoindre l'équipe</label>
            {isOpen && <p>Code d'accès de l'équipe à leur communiquer : <strong>{team.code}</strong></p>}
          </div>
        </div>
        <div>
          <input type="radio" name="team-open" value="false" id="team-closed" checked={!self.state.isOpen} onChange={onIsOpenChanged} />
          <div className={classnames(['radio-label', isOpen || 'radio-checked'])}>
            <label htmlFor="team-closed">Empêcher d'autres personnes de rejoindre l'équipe</label>
          </div>
        </div>
        <p className="text-center">
          <Button onClick={onUpdateTeam}>
            <i className="fa fa-save"/> enregistrer les modifications
          </Button>
        </p>
      </div>
    );
  };
  const renderOwnAccessCode = function () {
    const {access_code} = self.state;
    return (
      <div>
        <p>
          Votre code de lancement personnel pour ce sujet est :
        </p>
        <p className="access-code-block">
          <span className="access-code">
            {access_code === undefined
             ? <Button bsSize="large" onClick={onRevealAccessCode}>
                 <i className="fa fa-unlock-alt"/> révéler
               </Button>
             : <span className="code">{access_code}</span>}
          </span>
        </p>
      </div>
    );
  };
  const renderCancelAttempt = function (cancelThis, goBackToThat) {
    return (
      <div>
        <p>Vous pouvez annuler la procédure d'accès à {cancelThis} et
           revenir à {goBackToThat}.</p>
        <p className="text-center">
          <Button onClick={onCancelAttempt}>
            <i className="fa fa-arrow-left"/> annuler
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
      <div className="section">
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
        <p className="text-center">
          <Button bsStyle="primary" bsSize="large" onClick={onStartAttempt}>
            démarrer <i className="fa fa-arrow-right"/>
          </Button>
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
      <div className="section">
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
  const renderUnlockTask = function (attempt) {
    const notice = attempt.is_training &&
      (<p>
        <strong>Attention</strong>, après avoir accédé au sujet vous ne pourrez
        plus changer la composition de votre équipe pendant le reste du concours.
      </p>);
    return (
      <div className="section">
        <p>
          Les membres de votre équipe ont donné leur accord pour accéder au sujet,
          vous pouvez maintenant le déverouiller en cliquant.
        </p>
        <p className="text-center">
          <Button bsStyle="primary" bsSize="large" onClick={onAccessTask}>
            accéder au sujet <i className="fa fa-arrow-right"/>
          </Button>
        </p>
        {notice}
      </div>
    );
  };
  const renderTrainingInProgress = function () {
    return (
      <div className="section">
        <p>Le sujet d'entrainement est visible dans l'onglet Sujet.</p>
      </div>
    );
  };
  const renderTimedAttemptInProgress = function (attempt) {
    // TODO: changer bsStyle en fonction du temps qui reste.
    return (
      <div className="section">
        <Alert bsStyle='success'>
          Votre tentative en temps limité se termine le {new Date(attempt.ends_at).toLocaleString()}.
        </Alert>
      </div>
    );
  };
  const testing = false && TestTeamTab(self);
  self.render = function () {
    const {user, team, round, attempt, task, round_has_not_started} = self.props;
    if (!user || !team || !round)
      return false;
    const haveAttempt = attempt !== undefined;
    const haveTask = task !== undefined;
    const showAdminControls = !haveAttempt && !team.is_locked && team.creator.id === user.id;
    const canLeaveTeam = !haveAttempt && !team.is_locked;
    const canCancelAttempt = haveAttempt && !haveTask;
    const showOwnAccessCode = canCancelAttempt && attempt.needs_codes;
    // Conditions in the decision tree are ordered so leftmost-innermost
    // traversal corresponds to chronological order.
    return (
      <div className="wrapper">
        {renderRefreshButton()}
        <h1>{round.title}</h1>
        {attempt === undefined
         ? renderRoundPrelude(round)
         : (attempt.needs_codes && renderAttemptPrelude(attempt))}
        {renderTeamMembers(team, haveAttempt)}
        {showOwnAccessCode && renderOwnAccessCode()}
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
                   ? (task === undefined
                      ? (round_has_not_started
                         ? renderCodesEnteredEarly(round)
                         : renderUnlockTask(attempt))
                      : renderTrainingInProgress())
                   : renderStartTimedAttempt()))
             : (attempt.needs_codes
                ? renderEnterCodes(attempt)
                : (task === undefined
                   ? renderUnlockTask(attempt)
                   : renderTimedAttemptInProgress(attempt))))
        }
        {showAdminControls && renderAdminControls(team)}
        {canLeaveTeam && renderLeaveTeam()}
        {canCancelAttempt &&
         (attempt.is_training
          ? renderCancelAttempt("l'entrainement", "l'étape de constitution de l'équipe")
          : renderCancelAttempt("l'épreuve en temps limité", "l'entrainement"))}
        {asyncHelper.render()}
        {testing && testing.render()}
      </div>
    );
  };
}, self => {
  return AsyncHelper.initialState({
    joinTeam: false,
    isOpen: self.props.team.is_open
  });
});

const selector = function (state, _props) {
  const {user, team, round, attempt, task, round_has_not_started} = state;
  return {user, team, round, attempt, task, round_has_not_started};
};

export default connect(selector)(TeamTab);