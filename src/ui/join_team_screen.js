import React from 'react';

import {image_url} from '../assets';
import {PureComponent} from '../misc';
import AlkindiLogout from './logout';

const JoinTeamScreen = PureComponent(self => {
  self.render = function () {
    const {user} = self.props;
    return (
      <div className="wrapper">
        <div id="auth-header">
          <table style={{width:'100%'}}><tbody><tr>
            <td style={{width:'20%'}}><img src={image_url('alkindi-logo.png')}/></td>
            <td>
              <h1 className="general_title">Concours Alkindi</h1>
              <h2 className="general_subtitle">Test alkindi</h2>
            </td>
            <td style={{width:'20%'}}>
              <AlkindiLogout username={user.email}/>
            </td>
          </tr></tbody></table>
        </div>
        <p>Pour accéder à l'inteface du concours, vous devez saisir le code d'équipe qui vous a été communiqué par un cammarade ou votre coordinateur.</p>
        <form method="" action="">
          <p className="input"><label htmlFor="code-equipe">Code d'équipe : </label><input type="text" id="code-equipe"/></p>
          <p><button type="button">Rejoindre une équipe</button></p>
        </form>
      </div>
    );
  };
});

export default JoinTeamScreen;
