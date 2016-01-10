import React from 'react';
import {Alert} from 'react-bootstrap';

import {PureComponent} from '../misc';

export default AsyncHelper;

const ErrorMessages = {
  'already in a team': "Vous êtes déjà dans une équipe.",
  'not qualified for any round': "Vous n'êtes pas qualifié.",
  'unknown team code': "Le code d'équipe saisi n'est pas valide.",
  'team is locked': "L'équipe a déjà commencée une épreuve et ne peut plus être changée.",
  'team is closed': "Le créateur de l'équipe a verrouillé la composition de l'équipe.",
  'registration is closed': "L'enregistrement pour ce tour n'est pas encore ouvert.",
  'already have a task': "Votre équipe a déjà accès au sujet.",
  'training is not open': "L'épreuve n'est pas encore ouverte.",
  'unknown qualification code': "Le code de qualification que vous avez entré est incorrect."
};

const AsyncHelper = PureComponent(self => {

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

  const endWithBackendError = function (result) {
    const code = result.error;
    self.props.refresh();
    return setError(ErrorMessages[code] || code);
  };

  const end = function (options) {
    if (options.refresh)
      self.props.refresh();
    self.setState({
      state: 'success',
      message: undefined,
      timeout: setTimer(setIdle)
    });
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

  self.props.api.$setHelper({begin, endWithServerError, endWithBackendError, end});

  self.render = function () {
    const {state, message} = self.state;
    if (state === 'failure')
      return (<Alert bsStyle='warning'>{message}</Alert>);
    if (state === 'success')
      return (<Alert bsStyle='success'>Opération effectuée.</Alert>);
    if (state === 'busy')
      return (<Alert bsStyle='info'>Veuillez patienter pendant le traitement de votre action...</Alert>);
    return false;
  };

}, self => {
  return {state: 'idle'};
});

export default AsyncHelper;
