// Workspace: tools set up in the task tab, not the same as server-side
// workspaces which are sets of revisions.

import React from 'react';

import {at, put} from './misc';

const defaultMergeState = function (state, update) {
  return {...state, ...update};
};

export const Workspace = function (getWorkspace, setWorkspace) {

  // Calls to addTool do not use setWorkspace and must be done before
  // attempting to render the workspace.
  // This is only okay for statically wired tools.
  const addTool = function (factory, wire, initialState) {
    const workspace = getWorkspace();
    const i = workspace.tools.length;
    const tool = {};
    tool.mergeState = defaultMergeState;
    factory(tool);
    tool.wire = wire;
    tool.state = initialState;
    tool.setState = setToolState.bind(null, i);
    setWorkspace({...workspace, tools: at(i, put(tool))(workspace.tools)});
    return i;
  };

  const setToolState = function (id, update) {
    const workspace = getWorkspace();
    const tools = at(id, function (tool) {
      const state = tool.mergeState(tool.state, update);
      return {...tool, state}
    })(workspace.tools);
    setWorkspace({...workspace, tools});
  };

  const load = function (dump) {
    // Load the tool states from the given dump.
    const workspace = getWorkspace();
    const tools = workspace.tools.map(function (tool, i) {
      return {...tool, state: dump[i]};
    });
    setWorkspace({...workspace, tools});
  };

  const save = function () {
    // Return a dump of the tool states that can be stored and passed to load.
    const workspace = getWorkspace();
    return workspace.tools.map(function (tool) {
      return {state: tool.state};
    });
  };

  const render = function (rootScope) {
    const workspace = getWorkspace();
    const scopes = [];
    const renderTool = function (tool, i) {
      const {wire, compute, Component, state, setState} = tool;
      const scope = Object.create(rootScope);
      wire(scopes, scope);
      scopes.push(scope);
      compute(state, scope);
      return (<Component key={i} toolState={state} setToolState={setState} scope={scope} />);
    };
    return <div>{workspace.tools.map(renderTool)}</div>;
  };

  return {
    tools: [], // [{mergeState,wire,compute,Component,state}]
    initialTools: [], // {state: (initial tool state)}
    load, save, addTool, render
  };
};

export default Workspace;
