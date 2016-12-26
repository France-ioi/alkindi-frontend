import React from 'react';
import EpicComponent from 'epic-component';
import {Alert, Button} from 'react-bootstrap';
import {use, defineAction, defineSelector, defineView, addSaga, addReducer} from 'epic-linker';
import {eventChannel, buffers} from 'redux-saga';
import {put, take, select} from 'redux-saga/effects'

export default function* (deps) {

  yield use('refresh');

  /*

  JoinTeamScreen interface:

    user: user object (also passed to the logout button)
    round: round object (if the user can create a team)

  */
  yield defineSelector('JoinTeamScreenSelector', function (state) {
    const {response, qualifyErrorCode} = state;
    const {user, round} = response;
    return {user, round, qualifyErrorCode};
  });

  yield defineView('JoinTeamScreen', 'JoinTeamScreenSelector', EpicComponent(self => {
    let teamCode;  const refTeamCode = function (el) { teamCode = el; };
    let qualCode;  const refQualCode = function (el) { qualCode = el; };
    self.state = {joinTeam: false};
    const onShowJoinTeam = function () {
      self.setState({joinTeam: true});
    };
    const onCreateTeam = function () {
      self.props.dispatch({type: deps.createTeam});
    };
    const onJoinTeam = function () {
      self.props.dispatch({type: deps.joinTeam, code: teamCode.value});
    };
    const onQualify = function () {
      self.props.dispatch({type: deps.qualifyUser, code: qualCode.value});
    };
    const renderNotQualified = function () {
      const {qualifyErrorCode} = self.props;
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
            {qualifyErrorCode &&
              <Alert bsStyle='danger'>
                {qualifyErrorCode === 'update failed' && "Votre session a probablement expirée, rechargez la page pour vous reconnecter."}
                {qualifyErrorCode === 'invalid code' && "Ce code de qualification est invalide."}
                {qualifyErrorCode === 'used code' && "Ce code de qualification est rattaché à un autre utilisateur."}
                {qualifyErrorCode === 'invalid user' && "L'identifiant d'utilisateur est invalide."}
                {qualifyErrorCode === 'already qualified' && "Vous êtes déjà qualifié avec un autre code."}
                {qualifyErrorCode === 'unexpected' && "Une erreur imprévue s'est produite, n'hésites pas à nous contacter."}
              </Alert>}
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
      return (
        <div className="wrapper" style={{position: 'relative'}}>
          {round ? renderQualified(round) : renderNotQualified()}
          {round && renderCreateTeam()}
          {round && joinTeam && renderQualifiedJoinTeam()}
          {!round && renderNotQualifiedJoinTeam()}
        </div>
      );
    };
  }));

  yield defineAction('createTeam', 'CreateTeam');
  yield addSaga(function* () {
    while (true) {
      yield take(deps.createTeam);
      let {api, userId} = yield select(createTeamSelector);
      let result = yield call(api.createTeam, userId);
      if (result.success) {
        // TODO: display a success notification
        yield put({type: deps.refresh});
      } else {
        // TODO: display a failure notification
      }
    }
    function createTeamSelector (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    }
  });

  yield defineAction('joinTeam', 'JoinTeam');
  yield addSaga(function* () {
    while (true) {
      let {code} = yield take(deps.joinTeam);
      let {api, userId} = yield select(joinTeamSelector);
      let result = yield call(api.joinTeam, userId, {code});
      if (result.success) {
        // TODO: display a success notification
        yield put({type: deps.refresh});
      } else {
        // TODO: display a failure notification
      }
    }
    function joinTeamSelector (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    }
  });

  yield defineAction('qualifyUser', 'QualifyUser');
  yield addReducer('qualifyUser', function (state) {
    /* When the user initiates the 'qualify' action, clear any existing
       error condition. */
    return {...state, qualifyError: false};
  });
  yield defineAction('qualifyUserFailed', 'QualifyUser.Failed');
  yield addReducer('qualifyUserFailed', function (state) {
    const {errorCode} = action;
    return {...state, qualifyErrorCode: errorCode};
  });
  yield addSaga(function* () {
    while (true) {
      let {code} = yield take(deps.qualifyUser);
      let {api, userId} = yield select(qualifyUserSelector);
      let result = yield call(api.qualifyUser, userId, {code});
      const {codeStatus, userIDStatus, profileUpdated} = result;
      let errorCode = false;
      if (codeStatus === 'registered' && userIDStatus === 'registered') {
        if (!profileUpdated) {
          errorCode = 'update failed';
        }
      } else {
        if (codeStatus === 'unknown') {
          errorCode = 'invalid code';
        } else if (codeStatus === 'conflict') {
          errorCode = 'used code';
        } else if (userIDStatus === 'unknown') {
          errorCode = 'invalid user';
        } else if (userIDStatus === 'conflict') {
          errorCode = 'already qualified';
        } else {
          errorCode = 'unexpected';
        }
      }
      if (errorCode) {
        yield put({type: qualifyUserFailed, errorCode});
      }
      yield put({type: deps.refresh});
    }
    function qualifyUserSelector (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    }
  });

};