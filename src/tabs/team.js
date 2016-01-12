import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';

import {PureComponent} from '../misc';
import Notifier from '../ui/notifier';
import RefreshButton from '../ui/refresh_button';
import Tooltip from '../ui/tooltip';
import AttemptTimeline from '../ui/attempt_timeline';
import {setActiveTab} from '../actions';

const TeamTab = PureComponent(self => {

  const onGoToAttempts = function () {
    self.props.dispatch(setActiveTab('attempts'));
  };

  const onLeaveTeam = function () {
    const user_id = self.props.user.id;
    Alkindi.api.leaveTeam(user_id);
  };

  const onUpdateTeam = function () {
    const user_id = self.props.user.id;
    const data = {is_open: self.state.isOpen};
    Alkindi.api.updateUserTeam(user_id, data);
  };

  const onIsOpenChanged = function (event) {
    self.setState({
      isOpen: event.currentTarget.value === 'true'
    });
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
        <table width="100%">
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

  const renderValidTeam = function () {
    return (
      <div className="section">
        <p>
          La composition de votre équipe respecte les règles du tour
          vous pouvez commencer l'entrainement dans l'onglet Épreuves.
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
          et vous ne pouvez donc pas accéder à l'entrainement.
        </Alert>
      </div>
    );
  };

  self.render = function () {
    const {user, round, team} = self.props;
    const teamUnlocked = !team.is_locked;
    const teamAdmin = teamUnlocked && team.creator.id === user.id;
    const teamInvalid = team.is_invalid.length > 0;
    return (
      <div className="wrapper">
        <div className="pull-right">
          <Tooltip content={<p>Cliquez sur ce bouton pour recharger la situation de votre équipe.</p>}/>
          {' '}
          <RefreshButton/>
        </div>
        <Notifier emitter={Alkindi.api.emitter}/>
        <h1>{round.title}</h1>
        {renderTeamMembers(team)}
        {team.is_invalid
          ? renderInvalidTeam(team.round_access)
          : renderValidTeam()}
        {teamAdmin && renderAdminControls(team)}
        {teamUnlocked && renderLeaveTeam()}
      </div>
    );
  };
}, self => {
  return {
    isOpen: undefined
  };
});

const selector = function (state, _props) {
  const {user, round, team} = state.response;
  return {user, round, team};
};

export default connect(selector)(TeamTab);
