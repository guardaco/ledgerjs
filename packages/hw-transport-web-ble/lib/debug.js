"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logsObservable = exports.logSubject = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
// $FlowFixMe


var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var logSubject = exports.logSubject = new _rxjs.Subject();

var id = 0;

var logsObservable = exports.logsObservable = logSubject.pipe((0, _operators.map)(function (l) {
  return _extends({ id: String(++id), date: new Date() }, l);
}), (0, _operators.shareReplay)(1000));

logsObservable.subscribe(function (e) {
  if (global.__ledgerDebug) {
    global.__ledgerDebug(e.date.toISOString() + " " + e.type + ": " + String(e.message));
  }
});
//# sourceMappingURL=debug.js.map