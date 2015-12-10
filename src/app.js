'use strict';

// IE8 compatibility:
require('html5shiv');
require('es5-shim');
require('es5-sham-ie8');
// Use el.getAttribute('data-value') rather than el.dataset.value.

import React from 'react';
React; // silence eslint no-unused-vars
import ReactDOM from 'react-dom';
import insertStylesheet from 'insert-stylesheet';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {Tool, newTool} from './tool';
import * as values from './values';
import * as alphabets from './alphabets';
import reducer from './reducer';
import {toChar} from './alpha';
import TextInput from './tools/text-input';
import TextDisplay from './tools/text-display';

// Insert stylesheets.
[
  'bootstrap/dist/css/bootstrap.min.css',
  'font-awesome/css/font-awesome.min.css'
].forEach(function (css_path) {
  insertStylesheet('../node_modules/' + css_path);
});
require('./app.css');

// Create the global state store.
let store = createStore(reducer);

// Dispatch some actions to set up the initial state.
[
  {
    type: 'ADD_TOOL',
    toolType: 'TextInput',
    toolState: {
      alphabetName: 'letters',
      input: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies vel massa in aliquam. Integer vel venenatis dui, non rutrum justo.Mauris sed eros fringilla ex fringilla dapibus. Vivamus tincidunt venenatis sapien eget mattis. Integer molestie pretium ante ac finibus. Donec non nisi dignissim, bibendum nisi sed, sodales magna. Sed vel massa non libero interdum convallis vitae eu leo. Phasellus consequat tellus nec arcu blandit, dignissim faucibus orci malesuada. Mauris tempus ligula vel purus pellentesque, ac ultricies urna porttitor. Nulla facilisi. Cras maximus lorem quis ipsum luctus, eu cursus nulla efficitur. Fusce accumsan porta vestibulum.".toUpperCase(),
      outputVarName: 'long_text',
      canRemove: false,
      configuring: false
    }
  },
  {
    type: 'ADD_TOOL',
    toolType: 'TextInput',
    toolState: {
      alphabetName: 'letters',
      input: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
      outputVarName: 'short_text',
      canRemove: false,
      configuring: false,
      collapsed: true
    }
  },
  {
    type: 'ADD_TOOL',
    toolType: 'SubstitutionInputApply',
    toolState: {
      alphabetName: 'letters',
      initializer: {type: 'shuffle'},
      pairs: undefined,
      inputVarName: 'short_text',
      outputVarName: 'ciphertext',
      configuring: false
    }
  },
  {
    type: 'ADD_TOOL',
    toolType: 'TextDisplay',
    toolState: {
      inputVarName: 'ciphertext',
      configuring: false
    }
  }
].forEach(function (action) { store.dispatch(action); });

const appSelector = function (state) {
  const {toolOrder, toolPointer} = state;
  return {
    toolOrder, toolPointer
  };
};

let App = connect(appSelector)(React.createClass({
  render: function () {
    const toolPointer = this.props.toolPointer;
    const tools = this.props.toolOrder.map(id => {
      return <div key={id} className='clearfix'><Tool id={id}/></div>;
    });
    const adders = ['TextDisplay', 'TextInput', 'SubstitutionInput', 'SubstitutionInputApply'].map(name => {
      return (
        <Button key={'+'+name} onClick={this.addTool} data-tooltype={name} >
          <i className="fa fa-plus"/> {name}
        </Button>);
    });
    return (
      <div>
        <p>PC = {toolPointer}</p>
        {tools}
        <ButtonGroup>{adders}</ButtonGroup>
      </div>);
  },
  addTool: function (event) {
    const toolType = event.currentTarget.getAttribute('data-tooltype');
    this.props.dispatch({type: 'ADD_TOOL', toolType});
  }
}));

function autoStepCallback () {
  const state = store.getState();
  if (!state.autoRefresh || state.toolPointer === undefined)
    return;
  store.dispatch({type: 'STEP'});
}

const autoStepInterval = setInterval(autoStepCallback, 100);

// Insert HTML.
const mainElement = document.getElementById('main');
ReactDOM.render(<Provider store={store}><App/></Provider>, mainElement);
