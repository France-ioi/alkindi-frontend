
import {eventChannel, END} from 'redux-saga';
import {takeEvery, takeLatest, put, call, select, take} from 'redux-saga/effects';

export default function (bundle, deps) {

  bundle.use('refreshCompleted');

  bundle.defineAction('countdownStarted', 'Countdown.Started');
  bundle.defineAction('countdownTicked', 'Countdown.Ticked');

  function countdownChannel (millis) {
    return eventChannel(function (emitter) {
      const interval = setInterval(function () {
        millis -= 1000;
        if (millis > 0) {
          emitter(millis);
        } else {
          emitter(END); /* closes the channel */
          clearInterval(interval);
        }
      }, 1000);
      return function () {
        clearInterval(interval);
      };
    });
  }

  bundle.addSaga(function* () {
    yield takeEvery(deps.refreshCompleted, function* (action) {
      const {response} = action;
      if (response && response.countdown) {
        yield put({type: deps.countdownStarted, deadline: response.countdown});
      }
    });
    yield takeLatest(deps.countdownStarted, function* (action) {
      const {deadline} = action;
      let countdown = yield call(computeCountdown, deadline);
      const chan = yield call(countdownChannel, countdown + 30);
      let prevNow;
      while (true) {
        countdown = yield take(chan);
        /* Trigger a refresh if the clock jumps by over 30 seconds. */
        let now = Date.now();
        if (prevNow && Math.abs(now - prevNow) > 30000) {
          self.props.dispatch({type: deps.refresh});
          return;
        }
        /* Compute the new countdown (adjusted by the time delta w/ server). */
        /* Update the countdown. */
        yield put({type: deps.countdownTicked, countdown});
        /*
        // TODO: Switch to 'attempts' tab when the countdown elapses.
        if (countdown < 0) {
          ...
          newState = reduceSetActiveTab(newState, 'attempts');
          setTimeout(Alkindi.refresh, 0);
        }
        */
        prevNow = now;
      }
    });
  });

  function* computeCountdown (deadline) {
    deadline = new Date(deadline).getTime();
    const now = Date.now();
    return yield select(function (state) {
      const {timeDelta, response} = state;
      return deadline - now + (timeDelta || 0);
    });
  }

  bundle.addReducer('countdownTicked', function (state, action) {
    const {countdown} = action;
    return {...state, countdown};
  });

};
