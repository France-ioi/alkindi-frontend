/*

  This file implements a generic client API to the application, leveraging
  mechanisms provided by redux and epic-linker.

  ## Dispatching an action

    appWindow.postMessage({dispatch: {type: 'Action.Type', …}});

  ## Invoking a selector

    appWindow.postMessage({select: 'selectorName', template: {…}});

  The value returned by the selector will be posted back as property 'result'
  of the template object.

*/

import {addSaga} from 'epic-linker';
import {eventChannel, buffers} from 'redux-saga';
import {put, take, select} from 'redux-saga/effects'

export default function* (deps) {

  /* Event channel holding an expanding buffer of window message. */
  const messageChannel = eventChannel(function (listener) {
    const onMessage = function (event) {
      const {source, data} = event;
      const message = JSON.parse(data);
      if (typeof message === 'object') {
        listener({source, message});
      }
    };
    window.addEventListener('message', onMessage);
    return function () {
      window.removeEventListener('message', onMessage);
    };
  }, buffers.expanding(1));

  yield addSaga(function* () {
    while (true) {
      let {source, message} = yield take(messageChannel);
      if (typeof message.dispatch === 'object') {
        /* Dispatch an action. */
        yield put(message.dispatch);
        continue;
      }
      if (typeof message.select === 'string') {
        /* Call a selector. */
        const selector = deps.get(message.select);
        if (typeof selector === 'function') {
          const result = yield select(selector);
          source.postMessage({...message.template, result});
        } else {
          source.postMessage({...message.template, error: 'bad selector'});
        }
        continue;
      }
    }
  });

};