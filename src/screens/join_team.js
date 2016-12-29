import React from 'react';
import EpicComponent from 'epic-component';
import {Alert, Button} from 'react-bootstrap';
import {use, include, defineAction, defineSelector, defineView, addSaga, addReducer} from 'epic-linker';
import {eventChannel, buffers} from 'redux-saga';
import {call, put, take, select} from 'redux-saga/effects'

import AuthHeader from '../ui/auth_header';
import {default as ManagedProcess, getManagedProcessState} from '../managed_process';
import getMessage from '../messages';

export default function* (deps) {

  yield use('refresh', 'LogoutButton');

  /*

  JoinTeamScreen interface:

    user: user object (also passed to the logout button)
    round: round object (if the user can create a team)

  */
  yield defineSelector('JoinTeamScreenSelector', function (state) {
    const {user, round} = state.response;
    const addBadge = getManagedProcessState(state, 'addBadge');
    const joinTeam = getManagedProcessState(state, 'joinTeam');
    const createTeam = getManagedProcessState(state, 'createTeam');
    return {user, round, addBadge, joinTeam, createTeam};
  });

  yield defineView('JoinTeamScreen', 'JoinTeamScreenSelector', EpicComponent(self => {
    self.state = {joinTeam: false, teamCode: '', qualCode: ''};
    const onTeamCodeChanged = function (event) {
      self.setState({teamCode: event.target.value});
    };
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
      self.props.dispatch({type: deps.joinTeam, code: self.state.teamCode});
    };
    const onAddBadge = function () {
      self.props.dispatch({type: deps.addBadge, code: self.state.qualCode});
    };
    const renderNotQualified = function () {
      const {pending, error} = self.props.addBadge;
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
            {error && <Alert bsStyle='danger'>{getMessage(error)}</Alert>}
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
      const {pending, error, success} = createTeam;
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
            <button type="button" className="tabButton selected" onClick={onCreateTeam}>
              {'Créer une équipe'}
              {pending &&
                  <span>{' '}<i className="fa fa-spinner fa-spin"/></span>}
            </button>
            <button type="button" className="tabButton" onClick={onShowJoinTeam}>Rejoindre une équipe</button>
          </div>
          {success && <Alert bsStyle='success'>{'Équipe créée'}</Alert>}
          {error && <Alert bsStyle='danger'>{getMessage(error)}</Alert>}
        </div>
      );
    };
    const renderJoinTeam = function (explanations) {
      const {teamCode} = self.state;
      const {pending, error} = self.props.joinTeam;
      return (
        <div className="section">
          {explanations}
          <div>
            <p className="input">
              <label htmlFor="team-code">Code d'équipe :&nbsp;</label>
              <input type="text" id="team-code" value={teamCode} onChange={onTeamCodeChanged}/>
            </p>
            <p>
              <Button onClick={onJoinTeam} disabled={pending || teamCode === ''}>
                {'Rejoindre une équipe'}
                {pending &&
                  <span>{' '}<i className="fa fa-spinner fa-spin"/></span>}
              </Button>
            </p>
            {error && <Alert bsStyle='danger'>{getMessage(error)}</Alert>}
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

  yield include(ManagedProcess('createTeam', 'Team.Create', p => function* () {
    const {api, userId} = yield select(function (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    });
    let result;
    try {
      result = yield call(api.createTeam, userId);
    } catch (ex) {
      yield p.failure('server error');
      return;
    }
    if (result.success) {
      yield p.success();
      yield put({type: deps.refresh});
    } else {
      yield p.failure(result.error);
    }
  }));
  yield use('createTeam');

  yield include(ManagedProcess('joinTeam', 'Team.Join', p => function* (action) {
    const {code} = action;
    let {api, userId} = yield select(function (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    });
    let result;
    try {
      result = yield call(api.joinTeam, userId, {code});
    } catch (ex) {
      yield p.failure('server error');
      return;
    }
    if (result.success) {
      yield p.success();
      yield put({type: deps.refresh});
    } else {
      yield p.failure(result.error);
    }
  }));
  yield use('joinTeam');

  yield include(ManagedProcess('addBadge', 'User.AddBadge', p => function* (action) {
    const {code} = action;
    const {api, userId} = yield select(function (state) {
      const {api, response} = state;
      const userId = response.user.id;
      return {api, userId};
    });
    let result;
    try {
      result = yield call(api.addBadge, userId, {code});
    } catch (err) {
      yield p.failure('server error');
      return;
    }
    const {success, profileUpdated, error} = result;
    let errorCode = false;
    if (success) {
      if (!profileUpdated) {
        errorCode = 'update failed';
      }
    } else {
      if (/already registered/.test(error)) {
        errorCode = 'used qualification code';
      } else if (/error_badge_code_invalid/.test(error)) {
        errorCode = 'bad qualification code';
      } else {
        errorCode = 'unexpected';
      }
      // 'invalid user';
      // 'already qualified'
      // 'unexpected'
    }
    yield errorCode ? p.failure(errorCode) : p.success();
    yield put({type: deps.refresh});
  }));
  yield use('addBadge');

};