
let sendTickInterval;

sendTickInterval = setInterval(sendTick, 1000); // XXX

const sendTick = function () {
  store.dispatch({type: 'TICK'});
};

