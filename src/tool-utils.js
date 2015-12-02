
export const withTool = function (selector) {
  return function (state, props) {
    const tool = state.toolMap[props.id];
    return selector(state, props, tool);
  };
};

