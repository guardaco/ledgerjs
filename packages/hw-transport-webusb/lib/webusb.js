"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.requestLedgerDevice = requestLedgerDevice;
var ledgerDevices = [{ vendorId: 0x2581, productId: 0x3b7c }, { vendorId: 0x2c97 }];

var isLedgerDevice = function isLedgerDevice(device) {
  return ledgerDevices.some(function (info) {
    return (!info.productId || info.productId === device.productId) && (!info.vendorId || info.vendorId === device.vendorId);
  });
};

function requestLedgerDevice() {
  return Promise.resolve().then(function () {
    return (
      // $FlowFixMe
      navigator.usb.requestDevice({ filters: ledgerDevices })
    );
  });
}

var isSupported = exports.isSupported = function isSupported() {
  return Promise.resolve((typeof navigator === "undefined" ? "undefined" : _typeof(navigator)) === "object" &&
  // $FlowFixMe
  _typeof(navigator.usb) === "object");
};

var getLedgerDevices = exports.getLedgerDevices = function getLedgerDevices() {
  return Promise.resolve().then(function () {
    return (
      // $FlowFixMe
      navigator.usb.getDevices()
    );
  }).then(function (devices) {
    return devices.filter(isLedgerDevice);
  });
};
//# sourceMappingURL=webusb.js.map