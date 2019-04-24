"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeError = exports.deserializeError = exports.createCustomErrorClass = undefined;

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */

var errorClasses = {};

var createCustomErrorClass = exports.createCustomErrorClass = function createCustomErrorClass(name) {
  var C = function CustomError(message, fields) {
    (0, _assign2.default)(this, fields);
    this.name = name;
    this.message = message || name;
    this.stack = new Error().stack;
  };
  // $FlowFixMe
  C.prototype = new Error();

  errorClasses[name] = C;
  // $FlowFixMe we can't easily type a subset of Error for now...
  return C;
};

// inspired from https://github.com/programble/errio/blob/master/index.js
var deserializeError = exports.deserializeError = function deserializeError(object) {
  if ((typeof object === "undefined" ? "undefined" : (0, _typeof3.default)(object)) === "object" && object) {
    try {
      // $FlowFixMe FIXME HACK
      var msg = JSON.parse(object.message);
      if (msg.message && msg.name) {
        object = msg;
      }
    } catch (e) {
      // nothing
    }
    var _constructor = object.name === "Error" ? Error : typeof object.name === "string" ? errorClasses[object.name] || createCustomErrorClass(object.name) : Error;

    var error = (0, _create2.default)(_constructor.prototype);
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        error[prop] = object[prop];
      }
    }
    if (!error.stack && Error.captureStackTrace) {
      Error.captureStackTrace(error, deserializeError);
    }
    return error;
  }
  return new Error(String(object));
};

// inspired from https://github.com/sindresorhus/serialize-error/blob/master/index.js
var serializeError = exports.serializeError = function serializeError(value) {
  if (!value) return value;
  if ((typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value)) === "object") {
    return destroyCircular(value, []);
  }
  if (typeof value === "function") {
    return "[Function: " + (value.name || "anonymous") + "]";
  }
  return value;
};

// https://www.npmjs.com/package/destroy-circular
function destroyCircular(from, seen) {
  var to = {};
  seen.push(from);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(from)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      var value = from[key];
      if (typeof value === "function") {
        continue;
      }
      if (!value || (typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value)) !== "object") {
        to[key] = value;
        continue;
      }
      if (seen.indexOf(from[key]) === -1) {
        to[key] = destroyCircular(from[key], seen.slice(0));
        continue;
      }
      to[key] = "[Circular]";
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (typeof from.name === "string") {
    to.name = from.name;
  }
  if (typeof from.message === "string") {
    to.message = from.message;
  }
  if (typeof from.stack === "string") {
    to.stack = from.stack;
  }
  return to;
}