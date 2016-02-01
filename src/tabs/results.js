import React from 'react';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';

import EpicComponent from 'epic-component';

const ResultsTab = EpicComponent(self => {
  self.render = function () {
    const {participations, user, is_admin} = self.props;
    return (
      <div className="wrapper">
        <h1>Résultats</h1>
        {participations.length == 0 &&
          <p>Vous n'avez pas encore de résultats.</p>}
        {participations.length > 0 && <table className="table results">
          <thead>
            <tr>
              <th>Date</th>
              <th>Épreuve</th>
              <th>Score</th>
              {is_admin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {participations.map(participation =>
              <tr key={participation.id}>
                <td className="colDate">{new Date(participation.created_at).toLocaleString()}</td>
                <td>{participation.round.title}</td>
                <td className="colScore">{participation.score}</td>
                {is_admin &&
                  <td>
                    <a href={'?user_id='+user.id+'&participation_id='+participation.id}
                      className="btn btn-default">
                      <i className="fa fa-arrow-right"/>
                    </a>
                  </td>}
              </tr>)}
          </tbody>
        </table>}
      </div>
    );
  };
});

const selector = function (state, _props) {
  const {participations, user, is_admin} = state.response;
  return {participations, user, is_admin};
};

export default connect(selector)(ResultsTab);
