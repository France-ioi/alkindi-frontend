import React from 'react';
import {Alert} from 'react-bootstrap';

export default AsyncHelper;

function AsyncHelper (self) {
  const beginRequest = function () {
    self.setState({pleaseWait: true, error: false});
  };
  const endRequest = function (err) {
    self.setState({
      pleaseWait: false,
      error: err && 'Une erreur serveur est survenue, merci de ré-essayer un peu plus tard.'
    });
  };
  const render = function () {
    if (self.state.error)
      return (<Alert bsStyle='warning'>{self.state.error}</Alert>);
    if (self.state.pleaseWait)
      return (<Alert bsStyle='success'>Veuillez patienter pendant le traitement de votre requête...</Alert>);
    return false;
  };
  return {beginRequest, endRequest, render};
}

AsyncHelper.initialState = function (state) {
  state.error = false;
  state.pleaseWait = false;
  return state;
};
