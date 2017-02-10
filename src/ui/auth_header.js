import React from 'react';
import EpicComponent from 'epic-component';

export default deps => EpicComponent(self => {
  self.render = function () {
    return (
        <div id="auth-header">
          <table className="table" style={{width:'100%'}}><tbody><tr>
            <td style={{width:'20%'}}><img src={deps.assetUrl('alkindi-logo.png')}/></td>
            <td>
              <h1 className="general_title">Concours Alkindi</h1>
              <h2 className="general_subtitle">Plateforme du concours</h2>
            </td>
          </tr></tbody></table>
        </div>
    );
  };
});
