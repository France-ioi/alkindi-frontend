
export function updateToolState (toolId, state) {
  return {
    type: 'UPDATE_TOOL',
    id: toolId,
    data: {
      state: state
    }
  };
}

export function removeTool (toolId) {
  return {
    type: 'REMOVE_TOOL',
    id: toolId
  };
}
