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
  self.render = function () {
    const {user, team} = self.props;
    const body = [];
    if (!team && user.isSelected) {
      // Affichage candidat qualifié s'il n'a pas créé ou rejoint une équipe.
      body.push(
        <div key='no-team'>
          <p>Pour participer aux prochaines épreuves du concours, vous devez être membre d'une équipe, soit en créant une équipe, soit en rejoignant une équipe existante.</p>
          <p>Choisissez ce que vous voulez faire : </p>
          <div className="bloc-boutons">
            <button type="button" className="tabButton selected" onClick={onCreateTeam}>Créer une équipe</button>
            <button type="button" className="tabButton" onClick={onShowJoinTeam}>Rejoindre une équipe</button>
          </div>
        </div>);
      if (self.state.joinTeam) {
        body.push(
          <div key='join-team'>
            <p>Vous avez choisi de rejoindre une équipe existante. Pour accéder à la suite du concours, vous devez saisir le code d'équipe qui vous a été communiqué par un camarade ou votre coordinateur.</p>
            <p className="input"><label htmlFor="code-equipe">Code d'équipe : </label><input ref='teamCode' type="password" id="code-equipe"/></p>
            <p><button type="button" className="submit" onClick={onJoinTeam}>Rejoindre l'équipe</button></p>
          </div>);
      }
    }
    if (team) {
      if (team.creator.id === user.id) {
        body.push(
          <div key='code'>
            <p>Code d'accès de l'équipe : <strong>{team.code}</strong></p>
          </div>);
        body.push(
          <div key='settings'>
            <p>Vous pouvez modifier les réglages de votre équipe :</p>
            <p><input type="radio" name="team-open" id="team-open" checked={team.isOpen} /> <label htmlFor="team-open">Permettre à d'autres personnes de rejoindre l'équipe</label></p>
            <p><input type="radio" name="team-open" id="team-closed" checked={!team.isOpen} /> <label htmlFor="team-closed">Bloquer les inscriptions à l'équipe</label></p>
            <button type="submit" className="submit">Enregistrer les modifications</button>
          </div>);
      }
      const renderMember = function (member) {
        const flags = [];
        if (team.creator.id === member.id)
          flags.push('créateur');
        if (member.isSelected)
          flags.push('sélectionné');
        return (
          <tr key={member.id}>
            <td>{member.username}</td>
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
    }
    return (<div className="wrapper">{body}</div>);
  };
}, self => {
  return {
    joinTeam: false
  };
});

export default TeamTab;
