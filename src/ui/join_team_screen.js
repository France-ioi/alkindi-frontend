import React from 'react';
import {Alert} from 'react-bootstrap';

import {PureComponent} from '../misc';
import {image_url} from '../assets';
import AlkindiAuthHeader from './auth_header';
import AlkindiLogout from './logout';
import * as api from '../api';

/*

JoinTeamScreen interface:

  user: user object (also passed to the logout button)
  round: round object (if the user can create a team)
  onLogout: called after the user has logged out
  onJoinTeam: called after the user has joined (or created) a team

*/
const JoinTeamScreen = PureComponent(self => {
  const beginRequest = function () {
    self.setState({pleaseWait: true, error: false});
  };
  const endRequest = function (err) {
    self.setState({
      pleaseWait: false,
      error: err && 'Une erreur serveur est survenue, merci de ré-essayer un peu plus tard.'
    });
  };
  const onShowJoinTeam = function () {
    self.setState({joinTeam: true});
  };
  const onCreateTeam = function () {
    const user_id = self.props.user.id;
    beginRequest();
    api.createTeam(user_id, function (err, res) {
      endRequest(err);
      if (err) return;
      self.props.onJoinTeam();
    });
  };
  const onJoinTeam = function () {
    const user_id = self.props.user.id;
    const data = {code: self.refs.teamCode.value};
    beginRequest();
    api.joinTeam(user_id, data, function (err, res) {
      endRequest(err);
      if (err) return;
      if (res.body.success)
        self.props.onJoinTeam();
      else
        self.setState({error: "Désolé, ce code ne vous permet pas de rejoindre une équipe.  Soit le code n'est pas valide, soit le créateur de l'équipe a vérouillé la composition de l'équipe, soit l'équipe a déjà commencé une épreuve et ne peut plus être changée."});
    });
  };
  self.render = function () {
    const {user, round} = self.props;
    const body = [];
    if (round) {
      // Affichage candidat qualifié s'il n'a pas créé ou rejoint une équipe.
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
            Votre compte n'est pas rattaché à une qualification au deuxième tour du concours Alkindi. Vous avez deux possibilités pour participer :
          </p>
          <p>
            Si vous vous êtes qualifié(e) lors du premier tour et disposez d'un code de qualification fourni par le coordinateur du concours dans votre établissement,
            allez sur <a href='http://qualification.concours-alkindi.fr'>qualification.concours-alkindi.fr</a> pour le rattacher à votre compte.            
          </p>
          <p>
            Si vous n'êtes pas qualifié(e), vous pouvez rejoindre une équipe créée par un(e) camarade qualifié(e) en saisissant ci-dessous le code de cette équipe.
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
    if (self.state.pleaseWait)
      body.push(<div key='pleaseWait'><Alert bsStyle='success'>Veuillez patienter pendant le traitement de votre requête...</Alert></div>);
    if (self.state.error)
      body.push(<div key='error'><Alert bsStyle='warning'>{self.state.error}</Alert></div>);
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <AlkindiLogout user={user} logoutUrl={Alkindi.config.logout_url} onLogout={this.props.onLogout}/>
        </div>
        <AlkindiAuthHeader/>
        {body}
      </div>
    );
  };
}, self => {
  return {joinTeam: false, error: false, pleaseWait: false};
});

export default JoinTeamScreen;
