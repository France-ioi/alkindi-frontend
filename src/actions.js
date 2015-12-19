export function addTool (toolType) {
  return {
    type: 'ADD_TOOL',
    toolType
  };
}

export function updateTool (toolId, stateUpdate) {
  return {
    type: 'UPDATE_TOOL',
    toolId,
    toolStateUpdate: stateUpdate
  };
}

export function removeTool (toolId) {
  return {
    type: 'REMOVE_TOOL',
    toolId
  };
}

export function setActiveTab (tabKey) {
  return {
    type: 'SET_ACTIVE_TAB',
    tabKey
  };
}