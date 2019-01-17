"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _debug = require("./debug");

var _sendAPDU = require("./sendAPDU");

var _receiveAPDU = require("./receiveAPDU");

var _monitorCharacteristic = require("./monitorCharacteristic");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ServiceUuid = "d973f2e0-b19e-11e2-9e96-0800200c9a66";
/* eslint-disable prefer-template */

var WriteCharacteristicUuid = "d973f2e2-b19e-11e2-9e96-0800200c9a66";
var NotifyCharacteristicUuid = "d973f2e1-b19e-11e2-9e96-0800200c9a66";

var requiresBluetooth = function requiresBluetooth() {
  // $FlowFixMe
  var _navigator = navigator,
      bluetooth = _navigator.bluetooth;

  if (typeof bluetooth === "undefined") {
    throw new Error("web bluetooth not supported");
  }
  return bluetooth;
};

var availability = function availability() {
  return _rxjs.Observable.create(function (observer) {
    var bluetooth = requiresBluetooth();
    var onAvailabilityChanged = function onAvailabilityChanged(e) {
      observer.next(e.value);
    };
    bluetooth.addEventListener("availabilitychanged", onAvailabilityChanged);
    var unsubscribed = false;
    bluetooth.getAvailability().then(function (available) {
      if (!unsubscribed) {
        observer.next(available);
      }
    });
    return {
      unsubscribe: function unsubscribe() {
        unsubscribed = true;
        bluetooth.removeEventListener("availabilitychanged", onAvailabilityChanged);
      }
    };
  });
};

var transportsCache = {};

/**
 * react-native bluetooth BLE implementation
 * @example
 * import BluetoothTransport from "@ledgerhq/hw-transport-web-ble";
 */

var BluetoothTransport = function (_Transport) {
  (0, _inherits3.default)(BluetoothTransport, _Transport);
  (0, _createClass3.default)(BluetoothTransport, null, [{
    key: "listen",


    /**
     * TODO could add this concept in all transports
     * observe event with { available: bool, type: string } // available is generic, type is specific
     * an event is emit once and then each time it changes
     */
    value: function listen(observer) {
      _debug.logSubject.next({
        type: "verbose",
        message: "listen..."
      });

      var unsubscribed = void 0;

      var bluetooth = requiresBluetooth();

      bluetooth.requestDevice({
        filters: [{
          services: [ServiceUuid]
        }]
      }).then(function (device) {
        if (!unsubscribed) {
          observer.next({ type: "add", descriptor: device, device: device });
          observer.complete();
        }
      });
      function unsubscribe() {
        unsubscribed = true;
      }
      return { unsubscribe: unsubscribe };
    }
  }, {
    key: "open",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(deviceOrId) {
        var device, bluetooth, service, _ref2, _ref3, writeC, notifyC, notifyObservable, notif, transport, onDisconnect;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                device = void 0;

                if (!(typeof deviceOrId === "string")) {
                  _context.next = 11;
                  break;
                }

                if (!transportsCache[deviceOrId]) {
                  _context.next = 5;
                  break;
                }

                _debug.logSubject.next({
                  type: "verbose",
                  message: "Transport in cache, using that."
                });
                return _context.abrupt("return", transportsCache[deviceOrId]);

              case 5:
                bluetooth = requiresBluetooth();

                // TODO instead we should "query" the device by its ID

                _context.next = 8;
                return bluetooth.requestDevice({
                  filters: [{
                    services: [ServiceUuid]
                  }]
                });

              case 8:
                device = _context.sent;
                _context.next = 12;
                break;

              case 11:
                device = deviceOrId;

              case 12:
                if (device.gatt.connected) {
                  _context.next = 16;
                  break;
                }

                _debug.logSubject.next({
                  type: "verbose",
                  message: "not connected. connecting..."
                });
                _context.next = 16;
                return device.gatt.connect();

              case 16:
                _context.next = 18;
                return device.gatt.getPrimaryService(ServiceUuid);

              case 18:
                service = _context.sent;
                _context.next = 21;
                return _promise2.default.all([service.getCharacteristic(WriteCharacteristicUuid), service.getCharacteristic(NotifyCharacteristicUuid)]);

              case 21:
                _ref2 = _context.sent;
                _ref3 = (0, _slicedToArray3.default)(_ref2, 2);
                writeC = _ref3[0];
                notifyC = _ref3[1];
                notifyObservable = (0, _monitorCharacteristic.monitorCharacteristic)(notifyC).pipe((0, _operators.tap)(function (value) {
                  _debug.logSubject.next({
                    type: "ble-frame-read",
                    message: value.toString("hex")
                  });
                }), (0, _operators.share)());
                notif = notifyObservable.subscribe();
                transport = new BluetoothTransport(device, writeC, notifyObservable);


                transportsCache[transport.id] = transport;

                onDisconnect = function onDisconnect(e) {
                  delete transportsCache[transport.id];
                  transport.notYetDisconnected = false;
                  notif.unsubscribe();
                  device.removeEventListener("gattserverdisconnected", onDisconnect);
                  _debug.logSubject.next({
                    type: "verbose",
                    message: "BleTransport(" + transport.id + ") disconnected"
                  });
                  transport.emit("disconnect", e);
                };

                device.addEventListener("gattserverdisconnected", onDisconnect);

                return _context.abrupt("return", transport);

              case 32:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function open(_x) {
        return _ref.apply(this, arguments);
      }

      return open;
    }()
  }]);

  function BluetoothTransport(device, writeCharacteristic, notifyObservable) {
    var _this2 = this;

    (0, _classCallCheck3.default)(this, BluetoothTransport);

    var _this = (0, _possibleConstructorReturn3.default)(this, (BluetoothTransport.__proto__ || (0, _getPrototypeOf2.default)(BluetoothTransport)).call(this));

    _this.mtuSize = 20;
    _this.notYetDisconnected = true;

    _this.exchange = function (apdu) {
      return _this.atomic((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var debug, msgIn, data, msgOut;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                debug = _this.debug;
                msgIn = apdu.toString("hex");

                if (debug) debug("=> " + msgIn); // eslint-disable-line no-console
                _debug.logSubject.next({ type: "ble-apdu-write", message: msgIn });

                _context2.next = 7;
                return (0, _rxjs.merge)(_this.notifyObservable.pipe(_receiveAPDU.receiveAPDU), (0, _sendAPDU.sendAPDU)(_this.write, apdu, _this.mtuSize)).toPromise();

              case 7:
                data = _context2.sent;
                msgOut = data.toString("hex");

                _debug.logSubject.next({ type: "ble-apdu-read", message: msgOut });
                if (debug) debug("<= " + msgOut); // eslint-disable-line no-console

                return _context2.abrupt("return", data);

              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2["catch"](0);

                _debug.logSubject.next({
                  type: "ble-error",
                  message: "exchange got " + String(_context2.t0)
                });
                if (_this.notYetDisconnected) {
                  // in such case we will always disconnect because something is bad.
                  _this.device.gatt.disconnect();
                }
                throw _context2.t0;

              case 19:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, _this2, [[0, 14]]);
      })));
    };

    _this.write = function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(buffer) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _debug.logSubject.next({
                  type: "ble-frame-write",
                  message: buffer.toString("hex")
                });
                _context3.next = 3;
                return _this.writeCharacteristic.writeValue(buffer);

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function (_x2) {
        return _ref5.apply(this, arguments);
      };
    }();

    _this.atomic = function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(f) {
        var resolveBusy, busyPromise, res;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!_this.busy) {
                  _context4.next = 2;
                  break;
                }

                throw new _hwTransport.TransportError("Transport race condition", "RaceCondition");

              case 2:
                resolveBusy = void 0;
                busyPromise = new _promise2.default(function (r) {
                  resolveBusy = r;
                });

                _this.busy = busyPromise;
                _context4.prev = 5;
                _context4.next = 8;
                return f();

              case 8:
                res = _context4.sent;
                return _context4.abrupt("return", res);

              case 10:
                _context4.prev = 10;

                if (resolveBusy) resolveBusy();
                _this.busy = null;
                return _context4.finish(10);

              case 14:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, _this2, [[5,, 10, 14]]);
      }));

      return function (_x3) {
        return _ref6.apply(this, arguments);
      };
    }();

    _this.id = device.id;
    _this.device = device;
    _this.writeCharacteristic = writeCharacteristic;
    _this.notifyObservable = notifyObservable;

    _debug.logSubject.next({
      type: "verbose",
      message: "BleTransport(" + String(_this.id) + ") new instance"
    });
    return _this;
  }

  (0, _createClass3.default)(BluetoothTransport, [{
    key: "setScrambleKey",
    value: function setScrambleKey() {}
  }, {
    key: "close",
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this.busy) {
                  _context5.next = 3;
                  break;
                }

                _context5.next = 3;
                return this.busy;

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function close() {
        return _ref7.apply(this, arguments);
      }

      return close;
    }()
  }]);
  return BluetoothTransport;
}(_hwTransport2.default);

BluetoothTransport.isSupported = function () {
  return _promise2.default.resolve().then(requiresBluetooth).then(function () {
    return true;
  }, function () {
    return false;
  });
};

BluetoothTransport.observeAvailability = function (observer) {
  return availability.subscribe(observer);
};

BluetoothTransport.list = function () {
  return _promise2.default.resolve([]);
};

BluetoothTransport.disconnect = function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(id) {
    var transport;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _debug.logSubject.next({
              type: "verbose",
              message: "user disconnect(" + id + ")"
            });
            transport = transportsCache[id];

            if (transport) {
              transport.device.gatt.disconnect();
            }

          case 3:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function (_x4) {
    return _ref8.apply(this, arguments);
  };
}();

exports.default = BluetoothTransport;
//# sourceMappingURL=TransportWebBLE.js.map