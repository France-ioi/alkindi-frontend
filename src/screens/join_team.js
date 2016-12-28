import React from 'react';
import EpicComponent from 'epic-component';
import {Alert, Button} from 'react-bootstrap';
import {use, defineAction, defineSelector, defineView, addSaga, addReducer} from 'epic-linker';
import {eventChannel, buffers} from 'redux-saga';
import {call, put, take, select} from 'redux-saga/effects'

import AuthHeader from './ui/auth_header';

export default function* (deps) {

  yield use('refresh', 'LogoutButton');

  /*

  JoinTeamScreen interface:

    user: user object (also passed to the logout button)
    round: round object (if the user can create a team)

  */
  yield defineSelector('JoinTeamScreenSelector', function (state) {
    const {response, addBadge, createTeam} = state;
    const {user, round} = response;
    return {user, round, addBadge, createTeam};
  });

  yield defineView('JoinTeamScreen', 'JoinTeamScreenSelector', EpicComponent(self => {
    self.state = {joinTeam: false, qualCode: ''};
    let teamCode;  const refTeamCode = function (el) { teamCode = el; };
    const onQualCodeChanged = function (event) {
      self.setState({qualCode: event.target.value});
    };
    const onShowJoinTeam = function () {
      self.setState({joinTeam: true});
    };
    const onCreateTeam = function () {
      self.props.dispatch({type: deps.createTeam});
    };
    const onJoinTeam = function () {
      self.props.dispatch({type: deps.joinTeam, code: teamCode.value});
    };
    const onAddBadge = function () {
      self.props.dispatch({type: deps.addBadge, code: self.state.qualCode});
    };
    const renderNotQualified = function () {
      const {pending, error} = self.props.addBadge || {};
      const {qualCode} = self.state;
      return (
        <div className="section">
          <p>
            Votre compte n'est pas rattaché à une qualification au deuxième tour du concours Alkindi. Vous avez deux possibilités pour participer :
          </p>
          <h2>Si vous êtes qualifié(e)</h2>
          <p>
            Si vous vous êtes qualifié(e) lors du premier tour et disposez d'un
            code de qualification fourni par le coordinateur du concours dans
            votre établissement, saisissez-le pour le rattacher à votre compte.
          </p>
          <div>
            <p className="input">
              <label htmlFor="qual-code">{'Code de qualification : '}</label>
              <input type="text" id="qual-code" value={qualCode} onChange={onQualCodeChanged} />
            </p>
            <p>
              <Button onClick={onAddBadge} disabled={pending || qualCode === ''}>
                {'Valider ma qualification'}
                {pending &&
                  <span>{' '}<i className="fa fa-spinner fa-spin"/></span>}
              </Button>
            </p>
            {error &&
              <Alert bsStyle='danger'>
                {error === 'server error' && "Le serveur n'a pas pu être contacté, merci de ré-essayer dans quelques minutes."}
                {error === 'update failed' && "Votre session a probablement expirée, rechargez la page pour vous reconnecter."}
                {error === 'invalid code' && "Ce code de qualification est invalide."}
                {error === 'used code' && "Ce code de qualification est rattaché à un autre utilisateur."}
                {error === 'invalid user' && "L'identifiant d'utilisateur est invalide."}
                {error === 'already qualified' && "Vous êtes déjà qualifié avec un autre code."}
                {error === 'unexpected' && "Une erreur imprévue s'est produite, n'hésitez pas à nous contacter."}
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
      const {round, createTeam} = self.props;
      if (!round.is_registration_open) {
        return (
          <div className="section">
            <p>La période de formation des équipes n'est pas encore ouverte.</p>
            <p>Elle commencera le {new Date(round.registration_opens_at).toLocaleString()}.</p>
          </div>
        );
      }
      return (
        <div className="section">
          <p>Pour participer aux prochaines épreuves du concours, vous devez être membre d'une équipe, soit en créant une équipe, soit en rejoignant une équipe existante.</p>
          <p>Choisissez ce que vous voulez faire : </p>
          <div className="bloc-boutons">
            <button type="button" className="tabButton selected" onClick={onCreateTeam}>Créer une équipe</button>
            <button type="button" className="tabButton" onClick={onShowJoinTeam}>Rejoindre une équipe</button>
          </div>
          {createTeam && createTeam.success &&
            <Alert bsStyle='success'>TODO</Alert>}
          {createTeam && !createTeam.success &&
            <Alert bsStyle='danger'>
              {createTeam.error === "registration is closed" &&
                "La période d'enregistrement est fermée."}
            </Alert>}
        </div>
      );
    };
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
        <div>
          <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
            <deps.LogoutButton/>
          </div>
          <AuthHeader/>
          <div className="wrapper" style={{position: 'relative'}}>
            {round ? renderQualified(round) : renderNotQualified()}
            {round && renderCreateTeam()}
            {round && joinTeam && renderQualifiedJoinTeam()}
            {!round && renderNotQualifiedJoinTeam()}
          </div>
        </div>
      );
    };
  }));

  yield defineAction('createTeam', 'CreateTeam');
  yield defineAction('createTeamFailed', 'CreateTeam.Failed');
  yield addReducer('createTeamFailed', function (state, action) {
    return {...state, createTeam: action.result};
  });
  yield addSaga(function* () {
    while (true) {
      yield take(deps.createTeam);
      try {
        let {api, userId} = yield select(createTeamSelector);
        let result = yield call(api.createTeam, userId);
        if (!result.success) {
          yield put({type: deps.createTeamFailed, result});
        } else {
          // TODO: display a success notification popup
          yield put({type: deps.refresh});
        }
      } catch (err) {
        // XXX handle backend communication error
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

  yield defineAction('addBadge', 'AddBadge');
  yield defineAction('addBadgeFailed', 'AddBadge.Failed');
  yield defineAction('addBadgeSucceeded', 'AddBadge.Succeeded');

  yield addReducer('addBadge', function (state, _action) {
    return {...state, addBadge: {pending: true}};
  });

  yield addReducer('addBadgeFailed', function (state, action) {
    const {errorCode} = action;
    return {...state, addBadge: {error: errorCode}};
  });

  yield addReducer('addBadgeSucceeded', function (state, action) {
    return {...state, addBadge: undefined};
  });

  yield addSaga(function* () {
    while (true) {
      let {code} = yield take(deps.addBadge);
      let {api, userId} = yield select(addBadgeSelector);
      let result;
      try {
        result = yield call(api.addBadge, userId, {code});
      } catch (err) {
        yield put({type: deps.addBadgeFailed, errorCode: 'server error'});
        continue;
      }
      const {success, profileUpdated, error} = result;
      let errorCode = false;
      if (success) {
        if (!profileUpdated) {
          errorCode = 'update failed';
        } else {
          yield put({type: deps.addBadgeSucceeded});
        }
      } else {
        if (/already registered/.test(error)) {
          errorCode = 'used code';
        } else if (/error_badge_code_invalid/.test(error)) {
          errorCode = 'invalid code';
        } else {
          errorCode = 'unexpected';
        }
        // 'invalid user';
        // 'already qualified'
        // 'unexpected'
      }
      if (errorCode) {
        yield put({type: deps.addBadgeFailed, errorCode});
      }
      yield put({type: deps.refresh});
    }
    function addBadgeSelector (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    }
  });

};