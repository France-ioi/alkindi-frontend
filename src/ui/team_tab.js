import React from 'react';
import {connect} from 'react-redux';
import {Alert} from 'react-bootstrap';
import classnames from 'classnames';

import {PureComponent} from '../misc';
import AsyncHelper from '../helpers/async_helper';
import * as api from '../api';

console.log(AsyncHelper, AsyncHelper.initialState);

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
  const renderMember = function (member) {
    const flags = [];
    if (self.props.team.creator.id === member.user.id)
      flags.push('créateur');
    if (member.is_selected)
      flags.push('qualifié');
    return (
      <tr key={member.user.id}>
        <td>{member.user.username}</td>
        <td>{member.user.lastname}, {member.user.firstname}</td>
        <td>{flags.join(', ')}</td>
        <td>{new Date(member.joined_at).toLocaleString()}</td>
      </tr>);
  }
  self.render = function () {
    const {user, team, round} = self.props;
    if (!user || !team || !round)
      return false;
    const body = [];
    const showAdminControls = !team.is_locked && team.creator.id === user.id;
    body.push(
      <div key='members' className="section">
        <p>Pour pouvoir accéder au sujet du concours, vous devez d'abord former une équipe respectant les règles suivantes :</p>
        <ul>
           <li>L'équipe doit contenir entre {round.min_team_size} et {round.max_team_size} membres.</li>
           <li>Au moins {round.min_team_ratio * 100}% des membres doit avoir été qualifiée suite au premier tour du concours.</li>
        </ul>
        <p>Notez que seules les équipes composées uniquement d'élèves en classe de seconde (générale ou pro) seront classées officiellement.</p>
        <p>Votre équipe est constituée de :</p>
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
      </div>);
    if (showAdminControls) {
      const accessCode = self.state.isOpen && (
        <p>Code d'accès de l'équipe à leur communiquer : <strong>{team.code}</strong></p>
      );
      body.push(
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
          <button type="submit" className="submit" onClick={onUpdateTeam}>Enregistrer les modifications</button>
        </div>);
    }
    if (!team.is_locked) {
      body.push(
        <div key='leave' className="section">
          <p>Vous pouvez quitter l'équipe :</p>
          <p key='leave'>
            <button type="button" className="submit" onClick={onLeaveTeam}>Quitter l'équipe</button>
          </p>
          <Alert bsStyle='success'>
            L'accès au sujet sera ouvert le 9 janvier.
            L'interface sera complétée dans les jours qui précèdent pour vous permettre de valider la composition de votre équipe.
          </Alert>
        </div>
      );
    }
    body.push(<div key='asyncHelper'>{asyncHelper.render()}</div>);
    return (<div className="wrapper">{body}</div>);
  };
}, self => {
  return AsyncHelper.initialState({
    joinTeam: false,
    isOpen: self.props.team.is_open,
  });
});

const selector = function (state, props) {
  const {user, team, round} = state;
  return {user, team, round};
};

export default connect(selector)(TeamTab);
