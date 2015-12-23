import React from 'react';

import {PureComponent} from '../misc';
import {image_url} from '../assets';
import AlkindiAuthHeader from './auth_header';
import AlkindiLogout from './logout';

const JoinTeamScreen = PureComponent(self => {
  self.render = function () {
    const {user} = self.props;
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <AlkindiLogout username={user.email} onLogout={this.props.onLogout}/>
        </div>
        <AlkindiAuthHeader/>
        <p>Pour accéder à l'inteface du concours, vous devez saisir le code d'équipe qui vous a été communiqué par un camarade ou votre coordinateur.</p>
        <form method="" action="">
          <p className="input"><label htmlFor="code-equipe">Code d'équipe :&nbsp;</label><input type="text" id="code-equipe"/></p>
          <p><button type="button">Rejoindre une équipe</button></p>
        </form>
      </div>
    );
  };
});

export default JoinTeamScreen;
