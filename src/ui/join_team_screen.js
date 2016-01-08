import React from 'react';
import {Button} from 'react-bootstrap';

import {PureComponent} from '../misc';
import AlkindiAuthHeader from './auth_header';
import AlkindiLogout from './logout';
import AsyncHelper from '../helpers/async_helper';
import * as api from '../api';

/*

JoinTeamScreen interface:

  user: user object (also passed to the logout button)
  round: round object (if the user can create a team)
  onLogout: called after the user has logged out
  onJoinTeam: called after the user has joined (or created) a team

*/
const JoinTeamScreen = PureComponent(self => {
  const asyncHelper = AsyncHelper(self);
  const onShowJoinTeam = function () {
    self.setState({joinTeam: true});
  };
  const onCreateTeam = function () {
    const user_id = self.props.user.id;
    asyncHelper.beginRequest();
    api.createTeam(user_id, function (err, _result) {
      asyncHelper.endRequest(err);
      if (err) {
        if (err === 'generic')
          asyncHelper.setError("L'action a échouée.");
        return;
      }
      self.props.onJoinTeam();
    });
  };
  const onJoinTeam = function () {
    const user_id = self.props.user.id;
    const data = {code: self.refs.teamCode.value};
    asyncHelper.beginRequest();
    api.joinTeam(user_id, data, function (err, _result) {
      asyncHelper.endRequest(err, function (error) {
        if (error === 'bad code')
          return "Ce code ne vous permet pas de rejoindre une équipe.  Soit le code n'est pas valide, soit le créateur de l'équipe a verrouillé la composition de l'équipe, soit l'équipe a déjà commencé une épreuve et ne peut plus être changée.";
      });
      if (err) return;
      self.props.onJoinTeam();
    });
  };
  const renderJoinTeam = function (explanations) {
    return (
      <div key='join-team'>
        {explanations}
        <div>
          <p className="input">
            <label htmlFor="team-code">Code d'équipe :&nbsp;</label>
            <input type="text" id="team-code" ref="teamCode" />
          </p>
          <p><Button onClick={onJoinTeam}>Rejoindre une équipe</Button></p>
        </div>
      </div>
    );
  };
  self.render = function () {
    const {user, round} = self.props;
    const body = [];
    if (round) {
      // Affichage candidat qualifié qui n'a pas créé ou rejoint une équipe.
      body.push(
        <div key='create-team'>
          <p>
            Vous êtes qualifié pour l'épreuve&nbsp;
              <strong>{round.title}</strong>,
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
        body.push(renderJoinTeam(
          <p>
            Vous avez choisi de rejoindre une équipe existante.
            Pour accéder à la suite du concours, vous devez saisir le code d'équipe qui vous a été communiqué par un camarade.
          </p>
        ));
      }
    } else {
      // Affichage candidat non-qualifié.
      body.push(renderJoinTeam(
        <div>
          <p>
            Votre compte n'est pas rattaché à une qualification au deuxième tour du concours Alkindi. Vous avez deux possibilités pour participer :
          </p>
          <p>
            Si vous vous êtes qualifié(e) lors du premier tour et disposez d'un code de qualification fourni par le coordinateur du concours dans votre établissement,
            allez sur <a href='http://qualification.concours-alkindi.fr'>qualification.concours-alkindi.fr</a> pour le rattacher à votre compte.
          </p>
          <p>
            Si vous n'êtes pas qualifié(e), vous pouvez rejoindre une équipe créée par un(e) camarade qualifié(e) en saisissant ci-dessous le code de cette équipe.
          </p>
        </div>
      ));
    }
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <AlkindiLogout user={user} logoutUrl={Alkindi.config.logout_url} onLogout={this.props.onLogout}/>
        </div>
        <AlkindiAuthHeader/>
        {body}
        {asyncHelper.render()}
      </div>
    );
  };
}, _self => {
  return AsyncHelper.initialState({joinTeam: false});
});

export default JoinTeamScreen;
