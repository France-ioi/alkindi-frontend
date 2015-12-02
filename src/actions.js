export function updateTool (toolId, data) {
  return {
    type: 'UPDATE_TOOL',
    id: toolId,
    data: data
  };
}

export function removeTool (toolId) {
  return {
    type: 'REMOVE_TOOL',
    id: toolId
  };
}
