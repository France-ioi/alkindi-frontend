export function updateTool (toolId, stateUpdate) {
  return {
    type: 'UPDATE_TOOL',
    toolId: toolId,
    toolStateUpdate: stateUpdate
  };
}

export function removeTool (toolId) {
  return {
    type: 'REMOVE_TOOL',
    toolId: toolId
  };
}
