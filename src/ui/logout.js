import React from 'react';

import {PureComponent} from '../misc';

let AlkindiLogout = PureComponent(self => {
  self.render = function () {
    return (
      <form id="logout" action={Alkindi.logout_url} method="POST">
        <button type='submit'>déconnexion</button>
      </form>
    );
  };
});

export default AlkindiLogout;
