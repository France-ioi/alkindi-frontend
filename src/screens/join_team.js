import React from 'react';
import {Alert, Button} from 'react-bootstrap';

import {PureComponent} from '../misc';
import AsyncHelper from '../helpers/async_helper';
import Api from '../api';
import AlkindiAuthHeader from '../ui/auth_header';
import AlkindiLogout from '../ui/logout';

/*

JoinTeamScreen interface:

  user: user object (also passed to the logout button)
  round: round object (if the user can create a team)
  refresh: callback to reload the user and round from the server
  onLogout: called after the user has logged out

*/
const JoinTeamScreen = PureComponent(self => {
  const refresh = function () {
    self.props.refresh();
  };
  const api = Api();
  const asyncHelper = <AsyncHelper api={api} refresh={refresh}/>;
  let teamCode;  const refTeamCode = function (el) { teamCode = el; };
  let qualCode;  const refQualCode = function (el) { qualCode = el; };
  const onShowJoinTeam = function () {
    self.setState({joinTeam: true});
  };
  const onQualify = function () {
    const user_id = self.props.user.id;
    const data = {code: qualCode.value};
    self.setState({qualifyError: undefined});
    api.qualifyUser(user_id, data).then(function (result) {
      const {codeStatus, userIDStatus, profileUpdated} = result;
      if (codeStatus === 'registered' && userIDStatus === 'registered') {
        if (!profileUpdated) {
          self.setState({qualifyError: "Votre session a expirée, rechargez la page pour vous reconnecter."});
          return;
        }
        return; // OK
      }
      if (codeStatus === 'unknown') {
        self.setState({qualifyError: "Ce code de qualification est invalide."});
        return;
      }
      if (codeStatus === 'conflict') {
        self.setState({qualifyError: "Ce code de qualification est rattaché à un autre utilisateur."});
        return;
      }
      if (userIDStatus === 'unknown') {
        self.setState({qualifyError: "L'identifiant d'utilisateur est invalide."});
        return;
      }
      if (userIDStatus === 'conflict') {
        self.setState({qualifyError: "Vous êtes déjà qualifié avec un autre code."});
        return;
      }
      self.setState({qualifyError: "Une erreur imprévue s'est produite, n'hésites pas à nous contacter."});
    });
  };
  const onCreateTeam = function () {
    const user_id = self.props.user.id;
    api.createTeam(user_id);
  };
  const onJoinTeam = function () {
    const user_id = self.props.user.id;
    const data = {code: teamCode.value};
    api.joinTeam(user_id, data);
  };
  const renderNotQualified = function () {
    const {qualifyError} = self.state;
    return (
      <div className="section">
        <p>
          Votre compte n'est pas rattaché à une qualification au deuxième tour du concours Alkindi. Vous avez deux possibilités pour participer :
        </p>
        <h2>Si vous êtes qualifié(e)</h2>
        <p>
          Si vous vous êtes qualifié(e) lors du premier tour et disposez d'un code de qualification fourni par le coordinateur du concours dans votre établissement,
          saisissez-le pour le rattacher à votre compte.
        </p>
        <div>
          <p className="input">
            <label htmlFor="qual-code">{'Code de qualification : '}</label>
            <input type="text" id="qual-code" ref={refQualCode} />
          </p>
          <p><Button onClick={onQualify}>Valider ma qualification</Button></p>
          {qualifyError && <Alert bsStyle='danger'>{qualifyError}</Alert>}
        </div>
      </div>
    );
  };
  const renderQualified = function (round) {
    return (
      <div className="section">
        <p>
          Vous êtes qualifié pour l'épreuve&nbsp;
            <strong>{round.title}</strong>,
          félicitations !
        </p>
      </div>
    );
  };
  const renderCreateTeam = function () {
    return (
      <div className="section">
        <p>Pour participer aux prochaines épreuves du concours, vous devez être membre d'une équipe, soit en créant une équipe, soit en rejoignant une équipe existante.</p>
        <p>Choisissez ce que vous voulez faire : </p>
        <div className="bloc-boutons">
          <button type="button" className="tabButton selected" onClick={onCreateTeam}>Créer une équipe</button>
          <button type="button" className="tabButton" onClick={onShowJoinTeam}>Rejoindre une équipe</button>
        </div>
      </div>
    );
  }
  const renderJoinTeam = function (explanations) {
    return (
      <div className="section">
        {explanations}
        <div>
          <p className="input">
            <label htmlFor="team-code">Code d'équipe :&nbsp;</label>
            <input type="text" id="team-code" ref={refTeamCode} />
          </p>
          <p><Button onClick={onJoinTeam}>Rejoindre une équipe</Button></p>
        </div>
      </div>
    );
  };
  const renderQualifiedJoinTeam = function () {
    return renderJoinTeam(
      <p>
        Vous avez choisi de rejoindre une équipe existante.
        Pour accéder à la suite du concours, vous devez saisir le code d'équipe qui vous a été communiqué par un camarade.
      </p>
    );
  };
  const renderNotQualifiedJoinTeam = function () {
    return renderJoinTeam(
      <div>
        <h2>Si vous n'êtes pas qualifié(e)</h2>
        <p>
          Si vous n'êtes pas qualifié(e), vous pouvez rejoindre une équipe créée par un(e) camarade qualifié(e) en saisissant
          ci-dessous le code de cette équipe.
        </p>
      </div>
    );
  };
  self.render = function () {
    const {user, round} = self.props;
    const {joinTeam} = self.state;
    const body = [];
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <AlkindiLogout user={user} logoutUrl={self.props.logoutUrl} onLogout={this.props.onLogout}/>
        </div>
        <AlkindiAuthHeader/>
        {round ? renderQualified(round) : renderNotQualified()}
        {round && renderCreateTeam()}
        {round && joinTeam && renderQualifiedJoinTeam()}
        {!round && renderNotQualifiedJoinTeam()}
        {asyncHelper}
      </div>
    );
  };
}, _self => {
  return {joinTeam: false};
});

export default JoinTeamScreen;
