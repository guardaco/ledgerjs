"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


/**
 * A Log object
 */
var id = 0;
var subscribers = [];

/**
 * log something
 * @param type a namespaced identifier of the log (it is not a level like "debug", "error" but more like "apdu-in", "apdu-out", etc...)
 * @param message a clear message of the log associated to the type
 */
var log = exports.log = function log(type, message, data) {
  var obj = { type: type, id: String(++id), date: new Date() };
  if (message) obj.message = message;
  if (data) obj.data = data;
  dispatch(obj);
};

/**
 * listen to logs.
 * @param cb that is called for each future log() with the Log object
 * @return a function that can be called to unsubscribe the listener
 */
var listen = exports.listen = function listen(cb) {
  subscribers.push(cb);
  return function () {
    var i = subscribers.indexOf(cb);
    if (i !== -1) {
      // equivalent of subscribers.splice(i, 1) // https://twitter.com/Rich_Harris/status/1125850391155965952
      subscribers[i] = subscribers[subscribers.length - 1];
      subscribers.pop();
    }
  };
};

function dispatch(log) {
  for (var i = 0; i < subscribers.length; i++) {
    try {
      subscribers[i](log);
    } catch (e) {
      console.error(e);
    }
  }
}

// for debug purpose
global.__ledgerLogsListen = listen;