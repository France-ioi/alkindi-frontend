// This file implements the management of the tools in the task tab,
// rather than the server-side workspaces which are sets of revisions.

import React from 'react';
import {EventEmitter} from 'events';

import {at, put} from './misc';

const defaultMergeState = function (state, update) {
  return {...state, ...update};
};

export const WorkspaceManager = function (store) {

  const emitter = new EventEmitter();

  const setWorkspace = function (workspace) {
    store.dispatch({type: 'SET_WORKSPACE', workspace});
  };

  const getWorkspace = function () {
    const state = store.getState();
    return state.workspace || {};
  };

  const isInitialized = function () {
    const workspace = getWorkspace();
    return workspace.tools !== undefined;
  };

  const clear = function () {
    setWorkspace({
      tools: [] // [{mergeState,wire,compute,Component,state}]
    });
  };

  const addTool = function (factory, wire, initialState) {
    const workspace = getWorkspace();
    const i = workspace.tools.length;
    const tool = {};
    tool.mergeState = defaultMergeState;
    factory(tool);
    tool.wire = wire;
    tool.state = initialState;
    tool.setState = setToolState.bind(null, i);
    setWorkspace({
      tools: at(i, put(tool))(workspace.tools),
      changed: true
    });
    return i;
  };

  const setToolState = function (id, update) {
    const workspace = getWorkspace();
    const tools = at(id, function (tool) {
      const state = tool.mergeState(tool.state, update);
      return {...tool, state}
    })(workspace.tools);
    setWorkspace({tools, changed: true});
  };

  const load = function (dump) {
    // Load the tool states from the given dump.
    const workspace = getWorkspace();
    const tools = workspace.tools.map(function (tool, i) {
      return {...tool, state: dump[i]};
    });
    setWorkspace({tools, changed: false});
  };

  const save = function () {
    // Return a dump of the tool states that can be stored and passed to load.
    const workspace = getWorkspace();
    return workspace.tools.map(function (tool) {
      return {state: tool.state};
    });
  };

  const render = function (rootScope) {
    const scopes = [];
    const renderTool = function (tool, i) {
      const {wire, compute, Component, state, setState} = tool;
      const scope = Object.create(rootScope);
      wire(scopes, scope);
      scopes.push(scope);
      compute(state, scope);
      return (<Component key={i} toolState={state} setToolState={setState} scope={scope} />);
    };
    const workspace = getWorkspace();
    return <div>{workspace.tools.map(renderTool)}</div>;
  };

  return {getWorkspace, isInitialized, clear, addTool, load, save, render, emitter};

};
