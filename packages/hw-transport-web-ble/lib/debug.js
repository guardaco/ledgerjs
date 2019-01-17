"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logsObservable = exports.logSubject = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logSubject = exports.logSubject = new _rxjs.Subject();
// $FlowFixMe


var id = 0;

var logsObservable = exports.logsObservable = logSubject.pipe((0, _operators.map)(function (l) {
  return (0, _extends3.default)({ id: String(++id), date: new Date() }, l);
}), (0, _operators.shareReplay)(1000));

logsObservable.subscribe(function (e) {
  if (global.__ledgerDebug) {
    global.__ledgerDebug(e.date.toISOString() + " " + e.type + ": " + String(e.message));
  }
});
//# sourceMappingURL=debug.js.map