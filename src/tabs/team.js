import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';

import {PureComponent} from '../misc';
import Notifier from '../ui/notifier';
import RefreshButton from '../ui/refresh_button';
import Tooltip from '../ui/tooltip';
import AttemptTimeline from '../ui/attempt_timeline';

const TeamTab = PureComponent(self => {

  const api = Alkindi.api;

  const onRefresh = function () {
    const {team} = self.props;
    Alkindi.refresh();
    self.setState({refreshing: true});
    api.listTeamAttempts(team.id).then(
      function (result) {
        self.setState({
          refreshing: false,
          attempts: result.attempts
        });
      },
      function () {
        self.setState({refreshing: false});
      });
  };

  const onIsOpenChanged = function (event) {
    self.setState({
      isOpen: event.currentTarget.value === 'true'
    });
  };
  const onLeaveTeam = function () {
    const user_id = self.props.user.id;
    api.leaveTeam(user_id);
  };
  const onUpdateTeam = function () {
    const user_id = self.props.user.id;
    const data = {is_open: self.state.isOpen};
    api.updateUserTeam(user_id, data);
  };
  const onStartAttempt = function () {
    const user_id = self.props.user.id;
    api.startAttempt(user_id);
  };
  const onCancelAttempt = function () {
    const user_id = self.props.user.id;
    api.cancelAttempt(user_id).then(function () {
      self.setState({access_code: undefined});
    });
  }
  const onRevealAccessCode = function () {
    const user_id = self.props.user.id;
    api.getAccessCode(user_id).then(function (result) {
      self.setState({access_code: result.code});
    });
  };
  const onEnterAccessCode = function (event) {
    const user_id = self.props.user.id;
    const code_user_id = event.currentTarget.getAttribute('data-user_id');
    const element = self.refs['access_code_' + code_user_id];
    const code = element.value;
    element.value = '';
    api.enterAccessCode(user_id, {code: code, user_id: code_user_id});
  };
  const onAccessTask = function () {
    const {user, team, attempt} = self.props;
    // If the team is already locked, no confirmation is asked.
    if (!team.is_locked && !window.confirm("Confirmez-vous définitivement la composition de votre équipe ?"))
      return;
    if (!attempt.is_training && !confirm("Voulez vous vraiment démarrer le sujet en temps limité ?  Vous aurez 60 minutes pour le resoudre."))
      return;
    api.assignAttemptTask(user.id);
  };
  const onResetHints = function () {
    const user_id = self.props.user.id;
    if (window.confirm("Voulez vous vraiment effacer tous les indices ?  Assurez-vous de prévenir vos coéquipiers.")) {
      api.resetHints(user_id);
    }
  };
  const onResetToTraining = function () {
    const team_id = self.props.team.id;
    api.resetTeamToTraining(team_id);
  };

  const clearAccessCode = function () {
    self.setState({access_code: undefined});
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
        <p>Pour autoriser l'accès au sujet, vous devez saisir des codes de
           lancement.</p>
        <p>Voici la composition de votre équipe :</p>
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
             ? <td className="access-code">
                 <input type="text" ref={'access_code_'+user_id} />
                 <Button bsSize="small" onClick={onEnterAccessCode} data-user_id={user_id}>
                   <i className="fa fa-check"/> valider
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
            {isOpen && <p>Code d'accès de l'équipe à leur communiquer : <strong>{team.code}</strong></p>}
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
    // KEEP
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
    const {round} = self.props;
    const message = (
      <p>
        {'Vous avez résolu le sujet d\'entrainement et pouvez faire jusqu\'à '}
        {round.max_attempts}
        {' tentatives en temps limité.'}
      </p>
    );
    return renderStartAttempt(message);
  };
  const renderEnterCodes = function (attempt) {
    return (
      attempt.is_training
      ? <div className="section">
          <p>Lorsque vous aurez saisi au moins 1 code d'accès vous pourrez
             accéder au sujet d'entrainement.</p>
          <p><strong>
             Notez que pour accéder au sujet en temps limité, il faudra saisir
             plus de 50% des codes.</strong></p>
        </div>
      : <div className="section">
          <p>Lorsque vous aurez saisi plus de 50% des codes vous pourrez
             accéder au sujet, vous aurez alors {attempt.duration} minutes
             pour le résoudre.
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
  const renderUnlockTask = function () {
    const {team, attempt} = self.props;
    return (
      <div className="section">
        <p>
          Les membres de votre équipe ont donné leur accord pour accéder au sujet,
          vous pouvez maintenant le déverouiller en cliquant.
        </p>
        {!team.is_locked &&
          <p>
            <strong>Attention</strong>, après avoir accédé au sujet vous ne pourrez
            plus changer la composition de votre équipe pendant le reste du concours.
          </p>}
        <p className="text-center">
          <Button bsStyle="primary" bsSize="large" onClick={onAccessTask}>
            accéder au sujet <i className="fa fa-arrow-right"/>
          </Button>
        </p>
      </div>
    );
  };
  const renderLateEnterCode = function () {
    return (
      <div className="section">
        <p>Au moins l'un des membres de votre équipe a déjà saisi son code de
           lancement, et a ouvert l'accès au sujet d'entrainement.
        </p>
        <p><strong>
          Pour accéder au sujet en temps limité, il faudra saisir plus
          de 50% des codes de lancement.</strong></p>
        <p>Le sujet d'entrainement est visible dans l'onglet Sujet.</p>
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
    const now = Date.now();
    const closes_at = new Date(attempt.closes_at);
    if (now <= closes_at) {
      return (
        <div className="section">
          <Alert bsStyle='success'>
            Votre tentative en temps limité se termine le {closes_at.toLocaleString()}.
          </Alert>
        </div>
      );
    } else {
      const {round} = self.props;
      return (
        <div className="section">
          <Alert bsStyle='danger'>
            Votre tentative en temps limité s'est terminée le {closes_at.toLocaleString()}.
          </Alert>
          <p>
            {'Vous pouvez revenir au sujet d\'entrainement et recommencer une'}
            {'tentative en temps limité, dans la limite de '}
            {round.max_attempts}
            {' autorisées.'}
          </p>
          <p className="text-center">
            <Button onClick={onResetToTraining}>
               <i className="fa fa-arrow-left"/> retour à l'entrainement
            </Button>
          </p>
        </div>
      );
    }
  };
  const renderResetHints = function () {
    return (
      <div className="section">
        <p>
          Pendant le sujet d'entrainement uniquement, vous pouvez effacer tous
          les indices que vous avez demandés en cliquant le bouton ci-dessous.
          Attention, cela affectera tous vos coéquipiers.
        </p>
        <p className="text-center">
          <Button onClick={onResetHints}>
            réinitialiser les indices <i className="fa fa-history"/>
          </Button>
        </p>
      </div>
    );
  };

  self.componentWillMount = function () {
    onRefresh();
    Alkindi.api.emitter.on('refresh', clearAccessCode);
  };
  self.componentWillUnmount = function () {
    Alkindi.api.emitter.removeListener('refresh', clearAccessCode);
  };
  self.render = function () {
    const {user, team, round, attempt, task, round_has_not_started} = self.props;
    const {attempts} = self.state;
    const haveAttempt = attempt !== undefined;
    const haveTask = task !== undefined;
    const showAdminControls = !haveAttempt && !team.is_locked && team.creator.id === user.id;
    const canLeaveTeam = !haveAttempt && !team.is_locked;
    const canCancelAttempt = haveAttempt && !haveTask;
    const showOwnAccessCode = haveAttempt && !team.members.find(function (member) {
      return member.access_code && member.user_id === user.id;
    });
    // Conditions in the decision tree are ordered so leftmost-innermost
    // traversal corresponds to chronological order.
    return (
      <div className="wrapper">
        <div className="pull-right">
          <Tooltip content={<p>Cliquez sur ce bouton pour recharger la situation de votre équipe.</p>}/>
          {' '}
          <RefreshButton refresh={onRefresh}/>
        </div>
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
             ? (round_has_not_started
                ? (attempt.needs_codes
                   ? renderTooEarly(round)
                   : renderCodesEnteredEarly(round))
                : (attempt.needs_codes
                   ? renderEnterCodes(attempt)
                   : (task === undefined
                      ? renderUnlockTask()
                      : (<div>
                          {showOwnAccessCode && renderLateEnterCode()}
                          {(attempt.is_unsolved
                            ? renderTrainingInProgress()
                            : renderStartTimedAttempt())}
                         </div>))))
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
        {task !== undefined && attempt.is_training && renderResetHints()}
        <Notifier emitter={api.emitter}/>
        {attempts &&
          <div className="attempts">
            {attempts.map(attempt => <AttemptTimeline key={attempt.ordinal} attempt={attempt} round={round} team={team}/>)}
          </div>}
      </div>
    );
  };
}, self => {
  return {
    joinTeam: false,
    isOpen: self.props.team.is_open
  };
});

const selector = function (state, _props) {
  const {user, team, round, attempt, task, round_has_not_started} = state;
  return {user, team, round, attempt, task, round_has_not_started};
};

export default connect(selector)(TeamTab);
