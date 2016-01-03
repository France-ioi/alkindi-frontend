import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';
import * as api from '../api';

const TeamTab = PureComponent(self => {
  const onIsOpenChanged = function (event) {
    self.setState({
      isOpen: event.currentTarget.value === 'true'
    });
  };
  const onLeaveTeam = function () {
    const user_id = self.props.user.id;
    api.leaveTeam(user_id, function (err, result) {
      if (err) return alert(err); // XXX error handling
      self.props.reseed();
    });
  };
  const onUpdateTeam = function () {
    const user_id = self.props.user.id;
    const data = {is_open: self.state.isOpen};
    api.updateUserTeam(user_id, data, function (err, result) {
      if (err) return alert(err); // XXX error handling
      self.props.reseed();
    });
  };
  const renderMember = function (member) {
    const flags = [];
    if (self.props.team.creator.id === member.user.id)
      flags.push('créateur');
    if (member.is_selected)
      flags.push('sélectionné');
    return (
      <tr key={member.user.id}>
        <td>{member.user.username}</td>
        <td>{member.user.lastname}, {member.user.firstname}</td>
        <td>{flags.join(', ')}</td>
        <td>{new Date(member.joined_at).toLocaleString()}</td>
      </tr>);
  }
  self.render = function () {
    const {user, team} = self.props;
    if (!user || !team)
      return false;
    const body = [];
    const showAdminControls = !team.is_locked && team.creator.id === user.id;
    if (showAdminControls) {
      body.push(
        <div key='code' className="section">
          <p>Code d'accès de l'équipe : <strong>{team.code}</strong></p>
        </div>);
    }
    body.push(
      <div key='members' className="section">
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
      body.push(
        <div key='settings' className="section">
          <p>Vous pouvez modifier les réglages de votre équipe :</p>
          <p>
            <input type="radio" name="team-open" value="true"  id="team-open" checked={self.state.isOpen} onChange={onIsOpenChanged} />
             <label htmlFor="team-open">Permettre à d'autres personnes de rejoindre ou de quitter l'équipe</label>
          </p>
          <p>
            <input type="radio" name="team-open" value="false" id="team-closed" checked={!self.state.isOpen} onChange={onIsOpenChanged} />
             <label htmlFor="team-closed">Verrouiller la composition de l'équipe</label>
           </p>
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
        </div>
      );
    }
    return (<div className="wrapper">{body}</div>);
  };
}, self => {
  return {
    joinTeam: false,
    isOpen: self.props.team.is_open
  };
});

const selector = function (state, props) {
  const {user, team} = state;
  return {user, team};
};

export default connect(selector)(TeamTab);
