import React from 'react';

import {PureComponent} from '../misc';
import {asset_url} from '../assets';

export default PureComponent(self => {
  self.render = function () {
    return (
        <div id="auth-header">
          <table style={{width:'100%'}}><tbody><tr>
            <td style={{width:'20%'}}><img src={asset_url('images/alkindi-logo.png')}/></td>
            <td>
              <h1 className="general_title">Concours Alkindi</h1>
              <h2 className="general_subtitle">Plateforme du concours</h2>
            </td>
          </tr></tbody></table>
        </div>
    );
  };
});
