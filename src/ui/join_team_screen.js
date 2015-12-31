import React from 'react';

import {PureComponent} from '../misc';
import {image_url} from '../assets';
import AlkindiAuthHeader from './auth_header';
import AlkindiLogout from './logout';
import * as api from '../api';

const JoinTeamScreen = PureComponent(self => {
  const onCreateTeam = function () {
    const user_id = self.props.user.id;
    api.createTeam(user_id, function (result) {
      console.log('createTeam', result);
    });
  };
  const onJoinTeam = function () {
    const user_id = self.props.user.id;
    const data = {code: self.refs.teamCode.value};
    api.joinTeam(user_id, data, function (result) {
      console.log('joinTeam', result);
    });
  };
  const onShowJoinTeam = function () {
    self.setState({joinTeam: true});
  };
  self.render = function () {
    const {user} = self.props;
    const {username, accessible_round} = user;
    const body = [];
    if (accessible_round) {
      // Affichage candidat qualifié s'il n'a pas créé ou rejoint une équipe.
      body.push(
        <div key='create-team'>
          <p>
            Vous êtes qualifié pour l'épreuve&nbsp;
              <strong>{accessible_round.title}</strong>,
            félicitations !
          </p>
          <p>Pour participer aux prochaines épreuves du concours, vous devez être membre d'une équipe, soit en créant une équipe, soit en rejoignant une équipe existante.</p>
          <p>Choisissez ce que vous voulez faire : </p>
          <div className="bloc-boutons">
            <button type="button" className="tabButton selected" onClick={onCreateTeam}>Créer une équipe</button>
            <button type="button" className="tabButton" onClick={onShowJoinTeam}>Rejoindre une équipe</button>
          </div>
        </div>
      );
      if (self.state.joinTeam) {
        body.push(
          <div key='join-team'>
            <p>
              Vous avez choisi de rejoindre une équipe existante.
              Pour accéder à la suite du concours, vous devez saisir le code d'équipe qui vous a été communiqué par un camarade ou votre coordinateur.
            </p>
            <p className="input">
              <label htmlFor="team-code">Code d'équipe :&nbsp;</label>
              <input type="text" id="team-code" ref="teamCode" />
            </p>
            <p><button type="button" onClick={onJoinTeam}>Rejoindre une équipe</button></p>
          </div>
        );
      }
    } else {
      body.push(
        <div key='join-team'>
          <p>
            Pour accéder à la suite du concours, vous devez saisir le code d'équipe qui vous a été communiqué par un camarade ou votre coordinateur.
          </p>
          <div>
            <p className="input">
              <label htmlFor="team-code">Code d'équipe :&nbsp;</label>
              <input type="text" id="team-code" ref="teamCode" />
            </p>
            <p><button type="button" onClick={onJoinTeam}>Rejoindre une équipe</button></p>
          </div>
        </div>
      );
    }
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <AlkindiLogout username={username} logoutUrl={Alkindi.config.logout_url} onLogout={this.props.onLogout}/>
        </div>
        <AlkindiAuthHeader/>
        {body}
      </div>
    );
  };
}, self => {
  return {joinTeam: false};
});

export default JoinTeamScreen;
