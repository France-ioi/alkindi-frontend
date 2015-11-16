'use strict';

// IE8 compatibility:
require('html5shiv');
require('es5-shim');
require('es5-sham-ie8');
// Use el.getAttribute('data-value') rather than el.dataset.value.

var React = require('react');
var ReactDOM = require('react-dom');
var classnames = require('classnames');
var Button = require('react-bootstrap').Button;
var insertStylesheet = require('insert-stylesheet')

var Home = React.createClass({
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

// Insert stylesheets.
[
  'bootstrap/dist/css/bootstrap.min.css',
  'font-awesome/css/font-awesome.min.css'
].forEach(function (css_path) {
  insertStylesheet('../node_modules/' + css_path);
});
require('./app.css');

// Insert HTML.
var mainElement = document.getElementById('main');
ReactDOM.render(
  <div>
    <Home title="left"/>
    <Home title="right"/>
  </div>, mainElement);
