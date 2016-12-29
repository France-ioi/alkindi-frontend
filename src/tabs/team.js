
import {use, defineAction, defineSelector, defineView, addReducer, addSaga} from 'epic-linker';
import React from 'react';
import EpicComponent from 'epic-component';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import {call, put, take, select} from 'redux-saga/effects'

import Tooltip from '../ui/tooltip';

export default function* (deps) {

  yield use('setActiveTab', 'RefreshButton', 'refresh');

  yield defineSelector('TeamTabSelector', function (state, _props) {
    const {leaveTeam} = state;
    const {user, round, team} = state.response;
    const allowTeamChanges = round.allow_team_changes;
    const teamHasCode = team.code !== null;
    const teamUnlocked = allowTeamChanges && !team.is_locked;
    const teamAdmin = team.creator.id === user.id;
    const teamInvalid = team.is_invalid;
    const haveAttempts = !!state.response.attempts;
    return {
      round, team, haveAttempts, leaveTeam,
      allowTeamChanges, teamHasCode, teamUnlocked, teamAdmin, teamInvalid};
  });

  yield defineView('TeamTab', 'TeamTabSelector', EpicComponent(self => {

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
          <p>Notez que seules les équipes composées uniquement d'élèves en classe de seconde (générale ou pro) seront classées officiellement.</p>
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
          {error && <Alert bsStyle='danger'>{error}</Alert>}
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
              <i className="fa fa-save"/> enregistrer les modifications
            </Button>
          </p>
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
        <div className="wrapper">
          <div className="pull-right">
            <Tooltip content={<p>Cliquez sur ce bouton pour recharger la situation de votre équipe.</p>}/>
            {' '}
            <deps.RefreshButton/>
          </div>
          <h1>{round.title}</h1>
          {renderRoundPrelude(round)}
          {false && renderTeamQualified()}
          {renderTeamMembers(team)}
          {teamInvalid
            ? renderInvalidTeam(team.round_access)
            : haveAttempts && renderValidTeam()}
          {teamHasCode && (team.is_open ? renderTeamCode(team) : renderTeamClosed())}
          {teamHasCode && teamAdmin && renderAdminControls(team)}
          {allowTeamChanges && teamUnlocked && renderLeaveTeam()}
        </div>
      );
    };

  }));

  //
  // Leaving the team
  //

  yield defineAction('leaveTeam', 'Team.Leave');
  yield defineAction('leaveTeamSucceeded', 'Team.Leave.Succeeded');
  yield defineAction('leaveTeamFailed', 'Team.Leave.Failed');
  yield addReducer('leaveTeam', function (state, _action) {
    return {...state, leaveTeam: {pending: true}};
  });
  yield addReducer('leaveTeamFailed', function (state, action) {
    const {error} = action;
    return {...state, leaveTeam: {error}};
  });
  yield addReducer('leaveTeamSucceeded', function (state, action) {
    return {...state, leaveTeam: undefined};
  });
  yield addSaga(function* () {
    while (true) {
      yield take(deps.leaveTeam);
      let {api, userId} = yield select(leaveTeamSelector);
      let result = yield call(api.leaveTeam, userId);
      if (result.success) {
        yield put({type: deps.leaveTeamSucceeded});
        yield put({type: deps.refresh});
      } else {
        yield put({type: deps.leaveTeamFailed, error: result.error});
      }
    }
    function leaveTeamSelector (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    }
  });

  //
  // Updating the team's setting(s)
  //

  yield defineAction('updateTeam', 'Team.Update');
  yield defineAction('updateTeamSucceeded', 'Team.Update.Succeeded');
  yield defineAction('updateTeamFailed', 'Team.Update.Failed');
  yield addReducer('updateTeam', function (state, _action) {
    return {...state, updateTeam: {pending: true}};
  });
  yield addReducer('updateTeamFailed', function (state, action) {
    const {error} = action;
    return {...state, updateTeam: {error}};
  });
  yield addReducer('updateTeamSucceeded', function (state, action) {
    return {...state, updateTeam: undefined};
  });
  yield addSaga(function* () {
    while (true) {
      const {isOpen} = yield take(deps.updateTeam);
      let {api, userId} = yield select(updateTeamSelector);
      let result = yield call(api.updateUserTeam, userId, {is_open: isOpen});
      if (result.success) {
        yield put({type: deps.updateTeamSucceeded});
        yield put({type: deps.refresh});
      } else {
        yield put({type: deps.updateTeamFailed, error: result.error});
      }
    }
    function updateTeamSelector (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    }
  });

};