import React from 'react';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';

export default React.createClass({
  getInitialState: function () {
    return {selected: 0};
  },
  getDefaultProps: function () {
    return {title: 'bar'};
  },
  propTypes: function () {
    return {title: React.PropTypes.string};
  },
  render: function () {
    return (
      <div>
        <h1>{this.props.title}</h1>
        {this.renderItems()}
        <Button>Boo</Button>
      </div>
    );
  },
  renderItems:  function () {
    var iSelected = this.state.selected, i, j, items = [];
    for (i = 0, j = 10; i < j; i++) {
      var classes = classnames({
        selected: i === iSelected
      });
      items.push(<li key={i} data-value={i} className={classes} onClick={this.onClick}>item {i}</li>);
    }
    return (<ul>{items}</ul>);
  },
  onClick: function (event) {
    var value = event.currentTarget.getAttribute('data-value');
    this.setState({selected: parseInt(value)});
  }
});
