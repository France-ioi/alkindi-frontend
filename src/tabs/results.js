import React from 'react';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';
import classnames from 'classnames';

import EpicComponent from 'epic-component';

const ResultsTab = EpicComponent(self => {

  const locationSearchAsObject = function () {
    return window.location.search.substring(1).split("&").reduce(function(result, value) {
      const parts = value.split('=');
      if (parts[0] !== "") {
        result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
      }
      return result;
    }, {})
  };

  const onSetParticipation = function (event) {
    const search = locationSearchAsObject();
    search.participation_id = event.currentTarget.getAttribute('data-id');
    const searchParts = [];
    Object.keys(search).forEach(function (key) {
      searchParts.push([
        encodeURIComponent(key),
        encodeURIComponent(search[key])].join('='));
    });
    const url = window.location.origin + window.location.pathname + '?' + searchParts.join('&');
    history.replaceState({}, "", url);
    self.props.alkindi.refresh();
  };

  self.render = function () {
    const {participations, user, roundId} = self.props;
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
              {false && <th>État</th>}
              <th>Score</th>
              {<th></th>}
            </tr>
          </thead>
          <tbody>
            {participations.map(participation =>
              <tr key={participation.id}>
                <td className="colDate">{new Date(participation.created_at).toLocaleString()}</td>
                <td>
                  {roundId === participation.round.id
                    ? <strong>{participation.round.title}</strong>
                    : <span>{participation.round.title}</span>}
                </td>
                {false && <td>{participation.round.status}</td>}
                <td className="colScore">{participation.score}</td>
                <td>
                  <Button onClick={onSetParticipation} data-id={participation.id}>
                    <i className="fa fa-arrow-right"/>
                  </Button>
                </td>
              </tr>)}
          </tbody>
        </table>}
      </div>
    );
  };
});

const selector = function (state, _props) {
  const {participations, user, round} = state.response;
  return {participations, user, roundId: round.id};
};

export default connect(selector)(ResultsTab);
