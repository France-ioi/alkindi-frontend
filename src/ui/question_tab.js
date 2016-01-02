import React from 'react';

import {PureComponent} from '../misc';
import * as actions from '../actions';
import * as api from '../api';

const QuestionTab = PureComponent(self => {
  const renderQuestion = function () {
    return (
      <div>
        *** afficher le sujet ici ***
      </div>);
  };
  const renderQuestionAccess = function () {
    const {round, question} = self.props.user;
    const items = [];
    let canAccessQuestion = true;
    items.push(<h1 key='title'>{round.title}</h1>);
    items.push(
      <p key='prelude'>
        Cet onglet vous permettra de révéler le sujet de l'épreuve.
        Il faudra que chaque membre de l'équipe ait donné son accour pour à accéder au sujet.
        Pour cela, un membre peut saisir son code d'accès personnel lui-même dans le tableau.
        Il peut aussi communiquer son code à un autre membre de l'équipe pour qu'il le saisisse.
      </p>
    );

    items.push(
      <p key='access_span'>
        L'accès au sujet de l'épreuve est possible du <strong>{round.access_from}</strong> au <strong>{round.access_until}</strong>.
      </p>);
    if (question.round_closed) {
      items.push(<p key='round_closed'>L'épreuve est actuellement fermée.</p>);
      canAccessQuestion = false;
    }

    items.push(
      <p key='team_constraints'>
        Pour accéder au sujet votre équipe doit contenir
        entre <strong>{round.min_team_size}</strong> et <strong>{round.max_team_size}</strong> membres,
        et au moins <strong>{round.min_team_ratio * 100}%</strong> doivent avoir été sélectionnés.
      </p>);
    if (question.team_too_small) {
      items.push(<p key='team_too_small'>Votre équipe ne contient pas assez de membres.</p>);
      canAccessQuestion = false;
    }
    if (question.team_too_large) {
      items.push(<p key='team_too_large'>Votre équipe contient trop de membres.</p>);
      canAccessQuestion = false;
    }
    if (question.not_enough_selected_users) {
      items.push(<p key='not_enough_selected_users'>Votre équipe ne contient pas assez de membres sélectionnés.</p>);
      canAccessQuestion = false;
    }

    if (self.state.code === undefined)
      items.push(<p key='access_code'>Mon code d'acces personnel : <strong>{self.state.code}</strong></p>);

    // *** afficher le code de déblocage de l'utilisateur ***
    // *** afficher le tableau (membre, code)             ***

    if (canAccessQuestion)
      items.push(<p key='access_granted'>*** TODO: afficher un bouton pour révéler le sujet ***</p>);
    else
      items.push(<p key='access_denied'>Vous ne pouvez pas accéder au sujet.</p>);

    return (<div>{items}</div>);
  };
  self.render = function () {
    const {question} = self.props.user;
    if (question === undefined)
      return false;
    if ('id' in question)
      return renderQuestion();
    else
      return renderQuestionAccess()
  };
}, self => {
  return {};
});

export default QuestionTab;
