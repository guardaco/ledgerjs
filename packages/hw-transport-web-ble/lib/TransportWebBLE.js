"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _debug = require("./debug");

var _sendAPDU = require("./sendAPDU");

var _receiveAPDU = require("./receiveAPDU");

var _monitorCharacteristic = require("./monitorCharacteristic");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable prefer-template */

var ServiceUuid = "d973f2e0-b19e-11e2-9e96-0800200c9a66";
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
  _inherits(BluetoothTransport, _Transport);

  _createClass(BluetoothTransport, null, [{
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
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(deviceOrId) {
        var device, bluetooth, service, _ref2, _ref3, writeC, notifyC, notifyObservable, notif, transport, onDisconnect;

        return regeneratorRuntime.wrap(function _callee$(_context) {
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
                return Promise.all([service.getCharacteristic(WriteCharacteristicUuid), service.getCharacteristic(NotifyCharacteristicUuid)]);

              case 21:
                _ref2 = _context.sent;
                _ref3 = _slicedToArray(_ref2, 2);
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

    _classCallCheck(this, BluetoothTransport);

    var _this = _possibleConstructorReturn(this, (BluetoothTransport.__proto__ || Object.getPrototypeOf(BluetoothTransport)).call(this));

    _this.mtuSize = 20;
    _this.notYetDisconnected = true;

    _this.exchange = function (apdu) {
      return _this.atomic(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var debug, msgIn, data, msgOut;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(buffer) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(f) {
        var resolveBusy, busyPromise, res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
                busyPromise = new Promise(function (r) {
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

  _createClass(BluetoothTransport, [{
    key: "setScrambleKey",
    value: function setScrambleKey() {}
  }, {
    key: "close",
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
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
  return Promise.resolve().then(requiresBluetooth).then(function () {
    return true;
  }, function () {
    return false;
  });
};

BluetoothTransport.observeAvailability = function (observer) {
  return availability.subscribe(observer);
};

BluetoothTransport.list = function () {
  return Promise.resolve([]);
};

BluetoothTransport.disconnect = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(id) {
    var transport;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
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