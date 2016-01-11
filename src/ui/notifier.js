import React from 'react';
import {Alert} from 'react-bootstrap';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';

const ErrorMessages = {
  'already in a team': "Vous êtes déjà dans une équipe.",
  'not qualified for any round': "Vous n'êtes pas qualifié.",
  'unknown access code': "Le code d'accès saisi n'est pas valide.",
  'unknown team code': "Le code d'équipe saisi n'est pas valide.",
  'team is locked': "L'équipe a déjà commencée une épreuve et ne peut plus être changée.",
  'team is closed': "Le créateur de l'équipe a verrouillé la composition de l'équipe.",
  'registration is closed': "L'enregistrement pour ce tour n'est pas encore ouvert.",
  'already have a task': "Votre équipe a déjà accès au sujet.",
  'training is not open': "L'épreuve n'est pas encore ouverte.",
  'unknown qualification code': "Le code de qualification que vous avez entré est incorrect.",
  'must pass training': "Votre équipe a déjà débloqué le sujet, vous pouvez y accéder.",
  'too soon': "Soumission rejetée : trop de soumissions en moins d'une minute"
};

const Notifier = PureComponent(self => {

  const begin = function () {
    self.setState({state: 'busy'});
  };

  const endWithServerError = function (err, res) {
    if ('status' in err && err.status === undefined)
      return setError("Le serveur n'a pas pu être contacté, merci de ré-essayer un peu plus tard.");
    if ('status' in err)
      return setError("Une erreur " + err.status + " est survenue, merci de ré-essayer un peu plus tard.");
    setError("Une erreur indéterminée est survenue, merci de ré-essayer un peu plus tard.");
  };

  const callOnRefresh = function (success) {
    const {onRefresh} = self.props;
    if (typeof onRefresh === 'function')
      onRefresh(succes);
  }

  const refresh = function () {
    const {user, refresh} = self.props;
    if (user === undefined)
      return callOnRefresh(false)
    return self.props.refresh(user.id).then(function () {
      callOnRefresh(true);
    }, function () {
      callOnRefresh(false);
    });
  }

  const endWithBackendError = function (result) {
    const code = result.error;
    refresh();
    return setError(ErrorMessages[code] || code);
  };

  const end = function (options) {
    if (options.method === 'GET') {
      // GET requests do not need a success message, and do not need
      // to perform a refresh.
      self.setState({state: 'idle'});
    } else {
      if (options.refresh)
        refresh();
      self.setState({
        state: 'success',
        message: undefined,
        timeout: setTimer(setIdle)
      });
    }
  };

  const setError = function (message) {
    setTimer();
    self.setState({
      state: 'failure',
      message: message,
      timeout: undefined
    });
  };

  const setIdle = function () {
    setTimer();
    self.setState({
      state: 'idle',
      message: undefined
    });
  };

  const setTimer = function (callback) {
    if (self.state.timeout !== undefined)
      clearTimeout(self.state.timeout);
    if (callback === undefined)
      return undefined;
    return setTimeout(function () {
      self.setState({
        state: 'idle',
        message: undefined
      });
    }, 1000);
  };

  const dismiss = function () {
    setTimer();
    self.setState({
      state: 'idle',
      message: undefined,
      timeout: undefined
    });
  };

  self.props.api.$setHelper({begin, endWithServerError, endWithBackendError, end});

  self.componentWillUnmount = function () {
    setTimer();
  };

  self.render = function () {
    const {state, message} = self.state;
    return (
      <div style={{position: 'absolute'}}>
        {state === 'failure' && <Alert bsStyle='warning' onDismiss={dismiss}>{message}</Alert>}
        {state === 'success' && <Alert bsStyle='success' onDismiss={dismiss}>Opération effectuée.</Alert>}
        {state === 'busy' && <Alert bsStyle='info' onDismiss={dismiss}>Veuillez patienter pendant le traitement de votre action...</Alert>}
      </div>
      );
  };

}, self => {
  return {state: 'idle'};
});

const selector = function (state, _props) {
  const {refresh, user} = state;
  return {refresh, user};
};

export default connect(selector)(Notifier);
