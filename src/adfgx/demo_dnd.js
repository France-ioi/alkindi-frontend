
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import EpicComponent from 'epic-component';
import {DragSource, DropTarget, DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import range from 'node-range';
import flow from 'lodash/function/flow';
import classnames from 'classnames';

import * as Bigram from 'alkindi-tools/lib/utils/bigram';

import {put, at} from './funtools';
import TextInput from './tools/text_input';

const getTools = function () {

  const tools = [];
  const defaultMergeState = function (state, update) {
    return {...state, ...update};
  };
  const addTool = function (tools, spec) {
    const {factory, getScope} = spec;
    const tool = {};
    tool.mergeState = defaultMergeState;
    factory(tool);
    tool.getScope = getScope;
    tools.push(tool)
  };
  addTool(tools, {
    factory: TextInput,
    getScope: function (task, _toolState, _scopes) {
      let {alphabet, cipheredText} = task;
      return {alphabet, text: cipheredText};
    }
  });
  /*
  addTool(tools, {
    factory: Hints,
    getScope: function (task, _toolState, scopes) {
      const {alphabet, hintsGrid, score, getQueryCost, getHint} = task;
      return {alphabet, hintsGrid, score, getQueryCost, getHint};
    }
  });
  */

  return tools;
};

export const Tools = EpicComponent(self => {

  const tools = getTools();

  const setToolState = function (id, update) {
    const tool = tools[id];
    const toolState = self.props.toolStates[id];
    const newState = tool.mergeState(toolState, update);
    self.props.setToolState(id, newState);
  };
  for (var i = 0; i < tools.length; i++) {
    tools[i].setState = setToolState.bind(null, i);
  }

  self.render = function () {
    const {task, toolStates} = self.props;
    const scopes = [];
    const renderTool = function (tool, i) {
      const toolState = toolStates[i];
      const scope = tool.getScope(task, toolState, scopes);
      tool.compute(toolState, scope);
      scopes.push(scope);
      const {Component, setState} = tool;
      return (<Component key={i} toolState={toolState} scope={scope} setToolState={setState} />);
    };
    return <div>{tools.map(renderTool)}</div>;
  };

});


// D&D demo

const sourceSpec = {
  beginDrag: function (props) {
    const {i} = props;
    return {i};
  }
};

function sourceCollect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

const targetSpec = {
  drop: function (props, monitor, component) {
    const item = monitor.getItem();
    props.onDrop(item.i, props.i);
  }
}

const targetCollect = function (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
};

const Slot = flow(
  DragSource('letter', sourceSpec, sourceCollect),
  DropTarget('letter', targetSpec, targetCollect)
)(EpicComponent(self => {
  self.render = function () {
    const {i, c, isDragging, connectDropTarget, connectDragSource} = this.props;
    const classes = ['slot', isDragging && 'slot-dragging']
    return connectDropTarget(connectDragSource(<div className={classnames(classes)}>{c}</div>));
  };
}));

const selector = function (state, props) {
  const {slots, toolStates} = state;
  return {slots, toolStates};
};

const App = DragDropContext(HTML5Backend)(connect(selector)(EpicComponent(self => {

  const alphabet = Bigram.makeAlphabet('ADFGX');

  const onDrop = function (src, dst) {
    self.props.dispatch({type: 'SWAP', src, dst});
  };
  self.render = function () {
    const {slots, toolStates} = self.props;
    const taskApi = {alphabet};
    const n_slots = 25;
    return (
        <div>
          <Tools task={taskApi} toolStates={toolStates}/>
          <div>{slots.map(function (c, i) {
            return <Slot key={i} i={i} c={c} onDrop={onDrop}/>;
          })}</div>
        </div>);
  };
})));

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVXYZ'.split('');
function reducer (state, action) {
  switch (action.type) {
    case '@@redux/INIT':
      return {
        slots: range(0,25).map(i => ALPHABET[i]),
        task: {},
        toolStates: [{}]
      };
    case 'SWAP':
      {
        const slots = state.slots;
        const srcVal = slots[action.src];
        const dstVal = slots[action.dst];
        return {...state, slots:
           at(action.src, put(dstVal))
          (at(action.dst, put(srcVal))(state.slots))};
      }
  }
  return state;
}

window.React = React;
const store = createStore(reducer);
store.dispatch({type: 'INIT'});
const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><App/></Provider>, container);
