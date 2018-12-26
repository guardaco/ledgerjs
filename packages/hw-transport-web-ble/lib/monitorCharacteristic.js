"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.monitorCharacteristic = undefined;

var _rxjs = require("rxjs");

var _debug = require("./debug");

var monitorCharacteristic = exports.monitorCharacteristic = function monitorCharacteristic(characteristic) {
  return _rxjs.Observable.create(function (o) {
    _debug.logSubject.next({
      type: "verbose",
      message: "start monitor " + characteristic.uuid
    });

    function onCharacteristicValueChanged(event) {
      var characteristic = event.target;
      if (characteristic.value) {
        o.next(Buffer.from(characteristic.value.buffer));
      }
    }

    characteristic.startNotifications().then(function () {
      characteristic.addEventListener("characteristicvaluechanged", onCharacteristicValueChanged);
    });

    return function () {
      _debug.logSubject.next({
        type: "verbose",
        message: "end monitor " + characteristic.uuid
      });
      characteristic.stopNotifications();
    };
  });
};
//# sourceMappingURL=monitorCharacteristic.js.map