export function updateTool (toolId, data) {
  return {
    type: 'UPDATE_TOOL',
    id: toolId,
    data: data
  };
}

export function updateToolState (toolId, state) {
  return updateTool(toolId, {state: state});
}

export function removeTool (toolId) {
  return {
    type: 'REMOVE_TOOL',
    id: toolId
  };
}
