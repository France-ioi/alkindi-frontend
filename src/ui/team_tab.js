import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';
import * as actions from '../actions';

const TeamTab = PureComponent(self => {
  function onCreateTeam () {
    // TODO: interact with server
    // for now: dispatch a SET_TEAM event
  }
  function onShowJoinTeam () {
    self.setState({joinTeam: true});
  }
  function onJoinTeam () {
    // TODO: interact with server
    // self.refs.teamCode
    // for now: dispatch a SET_TEAM event
  }
  function isOpenChanged () {
    // TODO
  }
  self.render = function () {
    const {user, team} = self.props;
    const body = [];
    if (team.creator.id === user.id) {
      body.push(
        <div key='code'>
          <p>Code d'accès de l'équipe : <strong>{team.code}</strong></p>
        </div>);
      body.push(
        <div key='settings'>
          <p>Vous pouvez modifier les réglages de votre équipe :</p>
          <p><input type="radio" name="team-open" id="team-open" checked={team.isOpen} onChange={isOpenChanged} /> <label htmlFor="team-open">Permettre à d'autres personnes de rejoindre l'équipe</label></p>
          <p><input type="radio" name="team-open" id="team-closed" checked={!team.isOpen} onChange={isOpenChanged} /> <label htmlFor="team-closed">Bloquer les inscriptions à l'équipe</label></p>
          <button type="submit" className="submit">Enregistrer les modifications</button>
        </div>);
    }
    const renderMember = function (member) {
      const flags = [];
      if (team.creator.id === member.user.id)
        flags.push('créateur');
      if (member.isSelected)
        flags.push('sélectionné');
      return (
        <tr key={member.user.id}>
          <td>{member.user.fullname}</td>
          <td>{member.user.email}</td>
          <td>{flags.join(', ')}</td>
          <td>{member.joinDate}</td>
        </tr>);
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
    if (!self.props.haveQuestion) {
      if (team.creator.id === user.id) {
        if (team.members.length === 1) {
          body.push(<p key='dissolve'><button type="button" className="submit">Dissoudre l'équipe</button></p>);
        } else {
          body.push(<p key='dissolve'>D'autres membres ont rejoint l'équipe, vous ne pouvez plus la dissoudre.</p>);
        }
      } else {
        body.push(<p key='leave'><button type="button" className="submit">Quitter l'équipe</button></p>);
      }
    }
    return (<div className="wrapper">{body}</div>);
  };
}, self => {
  return {
    joinTeam: false
  };
});

export default TeamTab;
