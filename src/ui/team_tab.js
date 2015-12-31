import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';
import * as actions from '../actions';

const TeamTab = PureComponent(self => {
  const onIsOpenChanged = function (event) {
    console.log('isOpen', event.currentTarget, event.currentTarget.value);
    self.setState({
      isOpen: event.currentTarget.value === 'true'
    });
  };
  const onLeaveTeam = function () {
    console.log('leaveTeam');
  };
  const onUpdateTeam = function () {
    console.log('updateTeam', {is_open: self.state.isOpen});
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
        <td>{flags.join(', ')}</td>
        <td>{new Date(member.joined_at).toLocaleString()}</td>
      </tr>);
  }
  self.render = function () {
    const {user, team} = self.props;
    const body = [];
    if (team.creator.id === user.id) {
      body.push(
        <div key='code'>
          <p>Code d'accès de l'équipe : <strong>{team.code}</strong></p>
        </div>);
    }
    body.push(
      <div key='members'>
        <p>Votre équipe est constituée de :</p>
        <table width="100%">
          <tbody>
            <tr>
              <th>Nom</th>
              <th>Statut</th>
              <th>Membre depuis</th>
            </tr>
            {team.members.map(renderMember)}
          </tbody>
        </table>
      </div>);
    if (team.creator.id === user.id) {
      body.push(
        <div key='settings'>
          <p>Vous pouvez modifier les réglages de votre équipe :</p>
          <p>
            <input type="radio" name="team-open" value="true"  id="team-open" checked={self.state.isOpen} onChange={onIsOpenChanged} />
             <label htmlFor="team-open">Permettre à d'autres personnes de rejoindre l'équipe</label>
          </p>
          <p>
            <input type="radio" name="team-open" value="false" id="team-closed" checked={!self.state.isOpen} onChange={onIsOpenChanged} />
             <label htmlFor="team-closed">Bloquer les inscriptions à l'équipe</label>
           </p>
          <button type="submit" className="submit" onClick={onUpdateTeam}>Enregistrer les modifications</button>
        </div>);
    }
    if (!self.props.haveQuestion) {
      body.push(
        <p key='leave'>
          <button type="button" className="submit" onClick={onLeaveTeam}>Quitter l'équipe</button>
        </p>
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

export default TeamTab;
