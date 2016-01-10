import React from 'react';

import {PureComponent} from '../misc';
import AuthHeader from '../ui/auth_header';
import {Button} from 'react-bootstrap';

const LoginScreen = PureComponent(self => {
  let loginWindow;
  const login = function () {
    if (loginWindow !== undefined) {
      loginWindow.close();
      loginWindow = undefined;
    }
    const {loginUrl} = self.props;
    loginWindow = window.open(loginUrl, "alkindi:login",
      "height=555, width=510, toolbar=yes, menubar=yes, scrollbars=no, resizable=no, location=no, directories=no, status=no");
  };
  const messageListener = function (event) {
    // TODO: understand why event.isTrusted is false on Firefox.
    const message = JSON.parse(event.data);
    if (message.action === 'afterLogin')
      self.props.onLogin(message.user_id);
  };
  self.componentDidMount = function () {
    window.addEventListener('message', messageListener);
  };
  self.componentWillUnmount = function () {
    window.removeEventListener('message', messageListener);
  };
  self.render = function () {
    return (
      <div className="wrapper">
        <AuthHeader/>
        <div class="section">
          <p>Bienvenue sur la plateforme du 2e tour du concours Alkindi.</p>
        </div>
        <div class="section">
          <h2>Si vous avez déjà créé votre compte</h2>
          <p>Authentifiez-vous auprès de la plateforme France-ioi en cliquant
             sur le bouton ci-dessous.</p>
          <p><Button onClick={login}>se connecter</Button></p>
        </div>
        <div class="section">
          <h2>Sinon, deux cas sont possibles :</h2>
          <div class="section">
            <h3>Vous êtes qualifié(e) suite au premier tour et disposez d'un code de qualification</h3>
            <p>
              {'Commencez par valider votre code de qualification et créer un compte France-ioi sur '}
              <a href="http://qualification.concours-alkindi.fr" target="new">
                {'qualification.concours-alkindi.fr'}
              </a>
              {', puis revenez vous connecter sur cette page.'}
            </p>
          </div>
          <div class="section">
            <h3>Vous n'êtes pas qualifié(e) ou n'aviez pas participé</h3>
            <p>Vous pouvez rejoindre une équipe si vous avez un(e) camarade qualifié(e) qui vous y invite (la moitié au moins de l'équipe doit être qualifiée).</p>
            <p>Pour cela, cliquez sur le bouton suivant pour créez un compte.</p>
            <p><Button onClick={login}>se connecter</Button></p>
            <p>Choisissez "Mot de passe" dans la première popup, puis "Créer un compte", et choisissez un login et un mot de passe pour vous authentifier.</p>
            <p>Une fois connecté, vous pourrez rejoindre une équipe en fournissant le code transmis par vos camarades.</p>
          </div>
        </div>
      </div>
    );
  };
});

export default LoginScreen;
