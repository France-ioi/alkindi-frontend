
import React from 'react';
import EpicComponent from 'epic-component';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import {call, put, take, select} from 'redux-saga/effects'

import {default as ManagedProcess, getManagedProcessState} from '../managed_process';
import Tooltip from '../ui/tooltip';
import getMessage from '../messages';

export default function (bundle, deps) {

  bundle.use('setActiveTab', 'RefreshButton', 'refresh');

  bundle.defineSelector('TeamTabSelector', function (state, _props) {
    const {user, round, team} = state.response;
    if (!team) {
      return {};
    }
    const allowTeamChanges = round.allow_team_changes;
    const teamHasCode = team.code !== null;
    const teamUnlocked = allowTeamChanges && !team.is_locked;
    const teamAdmin = team.creator.id === user.id;
    const teamInvalid = team.is_invalid;
    const haveAttempts = !!state.response.attempts;
    const leaveTeam = getManagedProcessState(state, 'leaveTeam');
    const updateTeam = getManagedProcessState(state, 'updateTeam');
    return {
      round, team, haveAttempts, leaveTeam, updateTeam,
      allowTeamChanges, teamHasCode, teamUnlocked, teamAdmin, teamInvalid};
  });

  bundle.defineView('TeamTab', 'TeamTabSelector', EpicComponent(self => {

    const onGoToAttempts = function () {
      self.props.dispatch({type: deps.setActiveTab, tabKey: 'attempts'});
    };

    const onLeaveTeam = function () {
      self.props.dispatch({type: deps.leaveTeam});
    };

    const onUpdateTeam = function () {
      const {isOpen} = self.state;
      self.props.dispatch({type: deps.updateTeam, isOpen});
    };

    const onIsOpenChanged = function (event) {
      self.setState({
        isOpen: event.currentTarget.value === 'true'
      });
    };

    const renderTeamQualified = function () {
      return (
        <p>
          Félicitations, votre équipe est qualifiée grâce à sa participation
          au tour précédent.
        </p>
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
          {false && <p>Notez que seules les équipes composées uniquement d'élèves en classe de seconde (générale ou pro) seront classées officiellement.</p>}
          <p>Notez que seules les équipes composées uniquement d'élèves
             en classes de quatrième, troisième et seconde (générale ou pro)
             seront classées officiellement.
          </p>
        </div>
      );
    };

    const renderTeamMembers = function (team) {
      const renderMember = function (member) {
        const user_id = member.user_id;
        const flags = [];
        if (team.creator.id === user_id)
          flags.push('créateur');
        if (member.is_qualified)
          flags.push('qualifié');
        return (
          <tr key={user_id}>
            <td>{member.user.username}</td>
            <td>{member.user.lastname}, {member.user.firstname}</td>
            <td>{flags.join(', ')}</td>
            <td>{new Date(member.joined_at).toLocaleString()}</td>
          </tr>);
      };
      return (
        <div className="section">
          <p>Votre équipe est constituée de :</p>
          <table className="table">
            <tbody>
              <tr>
                <th>Login</th>
                <th>Nom, prénom</th>
                <th>Statut</th>
                <th>Membre depuis</th>
              </tr>
              {team.members.map(renderMember)}
            </tbody>
          </table>
        </div>
      );
    };

    const renderLeaveTeam = function () {
      const {pending, error} = self.props.leaveTeam || {};
      return (
        <div className="section">
          <p>Vous pouvez quitter l'équipe :</p>
          <p className="text-center">
            <Button onClick={onLeaveTeam}>
              <i className="fa fa-arrow-left"/> quitter l'équipe
              {pending &&
                <span>{' '}<i className="fa fa-spinner fa-spin"/></span>}
            </Button>
          </p>
          {error && <Alert bsStyle='danger'>{getMessage(error)}</Alert>}
        </div>
      );
    };

    const renderTeamCode = function (team) {
      return (
        <div className="section">
          <p>
            Voici le code à transmettre aux autres personnes que vous
            souhaitez inviter dans l'équipe :
          </p>
          <p className="text-center">
              <span className="team-code">{team.code}</span>
          </p>
        </div>
      );
    };

    const renderTeamClosed = function () {
      return (
        <div className="section">
          <p>
            Le créateur de l'équipe a fermé l'accès à l'équipe et aucune
            nouvelle personne ne peut la rejoindre.
          </p>
        </div>
      );
    };

    const renderAdminControls = function (team) {
      const {pending, error} = self.props.updateTeam || {};
      const {isOpen} = self.state;
      return (
        <div className="section">
          <p>Vous pouvez modifier les réglages de votre équipe :</p>
          <div>
            <input type="radio" name="team-open" value="true"  id="team-open" checked={self.state.isOpen} onChange={onIsOpenChanged} />
            <div className={classnames(['radio-label', isOpen && 'radio-checked'])}>
              <label htmlFor="team-open">Permettre à d'autres personnes de rejoindre l'équipe</label>
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
              <i className="fa fa-save"/>
              {' enregistrer les modifications'}
              {pending &&
                <span>{' '}<i className="fa fa-spinner fa-spin"/></span>}
            </Button>
          </p>
          {error && <Alert bsStyle='danger'>{getMessage(error)}</Alert>}
        </div>
      );
    };

    const renderValidTeam = function () {
      return (
        <div className="section">
          <p>
            La composition de votre équipe respecte les règles du tour,
            vous pouvez accéder aux épreuves.
          </p>
          <p className="text-center">
            <Button bsStyle="primary" bsSize="large" onClick={onGoToAttempts}>
              accéder aux épreuves <i className="fa fa-arrow-right"/>
            </Button>
          </p>
        </div>
      );
    };

    const renderInvalidTeam = function (causes) {
      return (
        <div className="section">
          <Alert bsStyle='warning'>
            La composition de votre équipe ne respecte pas les règles du tour
            et vous ne pouvez donc pas accéder aux épreuves.
          </Alert>
        </div>
      );
    };

    self.state = {
      isOpen: self.props.team.is_open
    };

    self.render = function () {
      const {
        round, team, haveAttempts,
        allowTeamChanges,
        teamHasCode, teamUnlocked, teamAdmin, teamInvalid} = self.props;
      return (
        <div className="tab-content">
          <div className="pull-right">
            <Tooltip content={<p>Cliquez sur ce bouton pour recharger la situation de votre équipe.</p>}/>
            {' '}
            <deps.RefreshButton/>
          </div>
          <h1>{round.title}</h1>
          {teamUnlocked && renderRoundPrelude(round)}
          {false && renderTeamQualified()}
          {renderTeamMembers(team)}
          {teamInvalid
            ? renderInvalidTeam(team.round_access)
            : haveAttempts && renderValidTeam()}
          {teamUnlocked || <p>La composition de l'équipe est définitive.</p>}
          {teamUnlocked && teamHasCode && (team.is_open ? renderTeamCode(team) : renderTeamClosed())}
          {teamUnlocked && teamHasCode && teamAdmin && renderAdminControls(team)}
          {allowTeamChanges && teamUnlocked && renderLeaveTeam()}
        </div>
      );
    };

  }));

  //
  // Leaving the team
  //

  bundle.include(ManagedProcess('leaveTeam', 'Team.Leave', p => function* () {
    const {api, userId} = yield select(function (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    });
    let result;
    try {
      result = yield call(api.leaveTeam, userId);
    } catch (ex) {
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
  bundle.use('leaveTeam');

  //
  // Updating the team's setting(s)
  //

  bundle.include(ManagedProcess('updateTeam', 'Team.Update', p => function* (action) {
    const {isOpen} = action;
    const {api, userId} = yield select(function (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    });
    let result;
    try {
      result = yield call(api.updateUserTeam, userId, {is_open: isOpen});
    } catch (ex) {
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
  bundle.use('updateTeam');

};