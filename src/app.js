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
