// Workspace: tools set up in the task tab, not the same as server-side
// workspaces which are sets of revisions.

import React from 'react';

const defaultMergeState = function (state, update) {
  return {...state, ...update};
};

export const Workspace = function (stateStore) {

  const {getToolState, setToolState} = stateStore;
  const tools = []; // [{mergeState,wire,compute,Component}]
  const initialTools = []; // {state: (initial tool state)}

  const addTool = function (factory, wire, initialState) {
    const i = tools.length;
    const tool = {};
    tool.mergeState = defaultMergeState;
    factory(tool);
    tool.wire = wire;
    tool.setState = function (update) {
      const toolState = stateStore.getToolState(i);
      const newState = tool.mergeState(toolState, update);
      stateStore.setToolState(i, newState);
    }
    tools.push(tool);
    initialTools.push({state: initialState});
    return i;
  };

  const render = function (rootScope) {
    const scopes = [];
    const renderTool = function (tool, i) {
      const {wire, compute, Component, setState} = tool;
      const toolState = stateStore.getToolState(i);
      const scope = Object.create(rootScope);
      wire(scopes, scope);
      scopes.push(scope);
      compute(toolState, scope);
      return (<Component key={i} toolState={toolState} setToolState={setState} scope={scope} />);
    };
    return <div>{tools.map(renderTool)}</div>;
  };

  return {
    addTool,
    render,
    initialTools
  };

};

export default Workspace;
