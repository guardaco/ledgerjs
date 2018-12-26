"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.receiveAPDU = undefined;

var _hwTransport = require("@ledgerhq/hw-transport");

var _rxjs = require("rxjs");

var _debug = require("./debug");

var TagId = 0x05;

// operator that transform the input raw stream into one apdu response and finishes


var receiveAPDU = exports.receiveAPDU = function receiveAPDU(rawStream) {
  return _rxjs.Observable.create(function (o) {
    var notifiedIndex = 0;
    var notifiedDataLength = 0;
    var notifiedData = Buffer.alloc(0);

    var sub = rawStream.subscribe({
      complete: function complete() {
        o.error(new _hwTransport.TransportError("Disconnected", "Disconnected"));
        sub.unsubscribe();
      },
      error: function error(e) {
        _debug.logSubject.next({
          type: "ble-error",
          message: "in receiveAPDU " + String(e)
        });
        o.error(e);
        sub.unsubscribe();
      },
      next: function next(value) {
        var tag = value.readUInt8(0);
        var index = value.readUInt16BE(1);
        var data = value.slice(3);

        if (tag !== TagId) {
          o.error(new _hwTransport.TransportError("Invalid tag " + tag.toString(16), "InvalidTag"));
          return;
        }

        if (notifiedIndex !== index) {
          o.error(new _hwTransport.TransportError("BLE: Invalid sequence number. discontinued chunk. Received " + index + " but expected " + notifiedIndex, "InvalidSequence"));
          return;
        }

        if (index === 0) {
          notifiedDataLength = data.readUInt16BE(0);
          data = data.slice(2);
        }
        notifiedIndex++;
        notifiedData = Buffer.concat([notifiedData, data]);
        if (notifiedData.length > notifiedDataLength) {
          o.error(new _hwTransport.TransportError("BLE: received too much data. discontinued chunk. Received " + notifiedData.length + " but expected " + notifiedDataLength, "BLETooMuchData"));
          return;
        }
        if (notifiedData.length === notifiedDataLength) {
          o.next(notifiedData);
          o.complete();
          sub.unsubscribe();
        }
      }
    });

    return function () {
      sub.unsubscribe();
    };
  });
};
//# sourceMappingURL=receiveAPDU.js.map