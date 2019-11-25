"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isSupported = exports.getFirstLedgerDevice = exports.getLedgerDevices = exports.requestLedgerDevice = undefined;

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var requestLedgerDevice = exports.requestLedgerDevice = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var device;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return navigator.usb.requestDevice({ filters: ledgerDevices });

          case 2:
            device = _context.sent;
            return _context.abrupt("return", device);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function requestLedgerDevice() {
    return _ref.apply(this, arguments);
  };
}();

var getLedgerDevices = exports.getLedgerDevices = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var devices;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return navigator.usb.getDevices();

          case 2:
            devices = _context2.sent;
            return _context2.abrupt("return", devices.filter(function (d) {
              return d.vendorId === _lib.ledgerUSBVendorId;
            }));

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function getLedgerDevices() {
    return _ref2.apply(this, arguments);
  };
}();

var getFirstLedgerDevice = exports.getFirstLedgerDevice = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var existingDevices;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return getLedgerDevices();

          case 2:
            existingDevices = _context3.sent;

            if (!(existingDevices.length > 0)) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt("return", existingDevices[0]);

          case 5:
            return _context3.abrupt("return", requestLedgerDevice());

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function getFirstLedgerDevice() {
    return _ref3.apply(this, arguments);
  };
}();

var _lib = require("../../devices/lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ledgerDevices = [{ vendorId: _lib.ledgerUSBVendorId }];
var isSupported = exports.isSupported = function isSupported() {
  return _promise2.default.resolve(!!navigator &&
  // $FlowFixMe
  !!navigator.usb && typeof navigator.usb.getDevices === "function");
};
//# sourceMappingURL=webusb.js.map