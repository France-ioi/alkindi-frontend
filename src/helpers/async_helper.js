import React from 'react';
import {Alert} from 'react-bootstrap';

export default AsyncHelper;

function AsyncHelper (self) {
  const beginRequest = function () {
    self.setState({pleaseWait: true, error: false});
  };
  const endRequest = function (err, appErrorHandler) {
    if (err) {
      if ('success' in err) {
        if (typeof appErrorHandler === 'function') {
          const message = appErrorHandler(err.error);
          if (message === false) {
            self.setState({pleaseWait: false});
            return;
          }
          if (typeof message === 'string')
            return setError(message);
        }
        const details =
          'error' in err ? ("  Erreur: " + err.error + ".") : "";
        setError("L'action a échouée, rafraichissez la page et ré-essayez." + details);
      } else {
        if ('status' in err && err.status === undefined) {
          setError("Le serveur n'a pas pu être contacté, merci de ré-essayer un peu plus tard.");
        } else if ('status' in err) {
          setError("Une erreur " + err.status + " est survenue, merci de ré-essayer un peu plus tard.");
        } else {
          setError("Une erreur indéterminée est survenue, merci de ré-essayer un peu plus tard.");
        }
      }
      return;
    }
    self.setState({pleaseWait: false});
  };
  const setError = function (err) {
    self.setState({pleaseWait: false, error: err});
  };
  const render = function () {
    if (self.state.error)
      return (<Alert bsStyle='warning'>{self.state.error}</Alert>);
    if (self.state.pleaseWait)
      return (<Alert bsStyle='success'>Veuillez patienter pendant le traitement de votre requête...</Alert>);
    return false;
  };
  return {beginRequest, endRequest, setError, render};
}

AsyncHelper.initialState = function (state) {
  state.error = false;
  state.pleaseWait = false;
  return state;
};
