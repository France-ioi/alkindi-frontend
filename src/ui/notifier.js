import React from 'react';
import {Alert} from 'react-bootstrap';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';
import {Button} from 'react-bootstrap';

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
  'too soon': "Soumission rejetée : trop de soumissions en moins d'une minute.",
  'invalid input': "Le format de votre réponse est invalide.",
  'attempt is closed': "L'épreuve en temps limité est terminée, vous ne pouvez plus soumettre.",
  'too many attempts': "Vous avez atteint le nombre maximum de tentatives en temps limité."
};

const Notifier = PureComponent(self => {

  const begin = function () {
    self.setState({state: 'busy'});
  };

  const endWithServerError = function (err, res) {
    if ('status' in err && err.status === undefined)
      return setError("Le serveur n'a pas pu être contacté, merci de ré-essayer un peu plus tard.");
    if ('status' in err) {
      if (err.status == 403) {
        // Display the login button on 403 errors.
        return setError("Vous êtes déconnecté, reconnectez-vous avant de répéter votre action.", {showLogin: true});
      }
      return setError("Une erreur " + err.status + " est survenue, merci de ré-essayer un peu plus tard.");
    }
    setError("Une erreur indéterminée est survenue, merci de ré-essayer un peu plus tard.");
  };

  const callOnRefresh = function (success) {
    const {onRefresh} = self.props;
    if (typeof onRefresh === 'function')
      onRefresh(success);
  };

  const refresh = function () {
    return Alkindi.refresh().then(function () {
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

  const end = function (res) {
    if (res.req.method === 'GET') {
      // GET requests do not need a success message, and do not need
      // to perform a refresh.
      self.setState({state: 'idle'});
    } else {
      // Automatically refresh after actions.
      refresh();
      self.setState({
        state: 'success',
        message: undefined,
        timeout: setTimer(setIdle)
      });
    }
  };

  const setError = function (message, options) {
    setTimer();
    self.setState({
      state: 'failure',
      message: message,
      timeout: undefined,
      ...options
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

  const onDismiss = function () {
    setTimer();
    self.setState({
      state: 'idle',
      message: undefined,
      timeout: undefined
    });
  };

  const onLogin = function () {
    Alkindi.login().then(onDismiss);
  };

  self.componentWillMount = function () {
    const {emitter} = Alkindi.api;
    emitter.on('begin', begin);
    emitter.on('server_error', endWithServerError);
    emitter.on('backend_error', endWithBackendError);
    emitter.on('end', end);
  };

  self.componentWillUnmount = function () {
    const {emitter} = Alkindi.api;
    emitter.removeListener('begin', begin);
    emitter.removeListener('server_error', endWithServerError);
    emitter.removeListener('backend_error', endWithBackendError);
    emitter.removeListener('end', end);
    setTimer();
  };

  self.render = function () {
    const {state, message, showLogin} = self.state;
    return (
      <div style={{position: 'absolute'}}>
        {state === 'busy' && <Alert bsStyle='info' onDismiss={onDismiss}>Veuillez patienter pendant le traitement de votre action...</Alert>}
        {state === 'success' && <Alert bsStyle='success' onDismiss={onDismiss}>Opération effectuée.</Alert>}
        {state === 'failure' &&
          <Alert bsStyle='warning' onDismiss={onDismiss}>
            <p>{message}</p>
            {showLogin &&
              <p className="text-right">
                <Button onClick={onLogin}>me reconnecter</Button>
              </p>}
          </Alert>}
      </div>
    );
  };

}, self => {
  return {state: 'idle'};
});

const selector = function (state, _props) {
  const {user} = state;
  return {user};
};

export default connect(selector)(Notifier);
