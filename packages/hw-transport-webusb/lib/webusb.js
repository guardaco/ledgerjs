"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLedgerDevices = exports.isSupported = undefined;

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

exports.requestLedgerDevice = requestLedgerDevice;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ledgerDevices = [{ vendorId: 0x2581, productId: 0x3b7c }, { vendorId: 0x2c97 }];

var isLedgerDevice = function isLedgerDevice(device) {
  return ledgerDevices.some(function (info) {
    return (!info.productId || info.productId === device.productId) && (!info.vendorId || info.vendorId === device.vendorId);
  });
};

function requestLedgerDevice() {
  return _promise2.default.resolve().then(function () {
    return (
      // $FlowFixMe
      navigator.usb.requestDevice({ filters: ledgerDevices })
    );
  });
}

var isSupported = exports.isSupported = function isSupported() {
  return _promise2.default.resolve((typeof navigator === "undefined" ? "undefined" : (0, _typeof3.default)(navigator)) === "object" &&
  // $FlowFixMe
  (0, _typeof3.default)(navigator.usb) === "object");
};

var getLedgerDevices = exports.getLedgerDevices = function getLedgerDevices() {
  return _promise2.default.resolve().then(function () {
    return (
      // $FlowFixMe
      navigator.usb.getDevices()
    );
  }).then(function (devices) {
    return devices.filter(isLedgerDevice);
  });
};
//# sourceMappingURL=webusb.js.map