import React from 'react';
import EpicComponent from 'epic-component';

import alkindiLogo from '../../assets/alkindi-logo.png';

export default EpicComponent(self => {
  self.render = function () {
    return (
        <div id="auth-header">
          <table className="table" style={{width:'100%'}}><tbody><tr>
            <td style={{width:'20%'}}><img src={alkindiLogo}/></td>
            <td>
              <h1 className="general_title">Concours Alkindi</h1>
              <h2 className="general_subtitle">Plateforme du concours</h2>
            </td>
          </tr></tbody></table>
        </div>
    );
  };
});
