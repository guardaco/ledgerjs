"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _Transport2 = require("../../hw-transport/lib/Transport");

var _Transport3 = _interopRequireDefault(_Transport2);

var _hidFraming = require("../../devices/lib/hid-framing");

var _hidFraming2 = _interopRequireDefault(_hidFraming);

var _lib = require("../../devices/lib");

var _lib2 = require("../../logs/lib");

var _lib3 = require("../../errors/lib");

var _webusb = require("./webusb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configurationValue = 1;
var endpointNumber = 3;

/**
 * WebUSB Transport implementation
 * @example
 * import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
 * ...
 * TransportWebUSB.create().then(transport => ...)
 */

var TransportWebUSB = function (_Transport) {
  (0, _inherits3.default)(TransportWebUSB, _Transport);

  function TransportWebUSB(device, interfaceNumber) {
    (0, _classCallCheck3.default)(this, TransportWebUSB);

    var _this = (0, _possibleConstructorReturn3.default)(this, (TransportWebUSB.__proto__ || (0, _getPrototypeOf2.default)(TransportWebUSB)).call(this));

    _initialiseProps.call(_this);

    _this.device = device;
    _this.interfaceNumber = interfaceNumber;
    _this.deviceModel = (0, _lib.identifyUSBProductId)(device.productId);
    return _this;
  }

  /**
   * Check if WebUSB transport is supported.
   */


  /**
   * List the WebUSB devices that was previously authorized by the user.
   */


  /**
   * Actively listen to WebUSB devices and emit ONE device
   * that was either accepted before, if not it will trigger the native permission UI.
   *
   * Important: it must be called in the context of a UI click!
   */


  (0, _createClass3.default)(TransportWebUSB, [{
    key: "close",


    /**
     * Release the transport device
     */
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.exchangeBusyPromise;

              case 2:
                _context.next = 4;
                return this.device.releaseInterface(this.interfaceNumber);

              case 4:
                _context.next = 6;
                return this.device.reset();

              case 6:
                _context.next = 8;
                return this.device.close();

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function close() {
        return _ref.apply(this, arguments);
      }

      return close;
    }()

    /**
     * Exchange with the device using APDU protocol.
     * @param apdu
     * @returns a promise of apdu response
     */

  }, {
    key: "setScrambleKey",
    value: function setScrambleKey() {}
  }], [{
    key: "request",


    /**
     * Similar to create() except it will always display the device permission (even if some devices are already accepted).
     */
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var device;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _webusb.requestLedgerDevice)();

              case 2:
                device = _context2.sent;
                return _context2.abrupt("return", TransportWebUSB.open(device));

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function request() {
        return _ref2.apply(this, arguments);
      }

      return request;
    }()

    /**
     * Similar to create() except it will never display the device permission (it returns a Promise<?Transport>, null if it fails to find a device).
     */

  }, {
    key: "openConnected",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var devices;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _webusb.getLedgerDevices)();

              case 2:
                devices = _context3.sent;

                if (!(devices.length === 0)) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", null);

              case 5:
                return _context3.abrupt("return", TransportWebUSB.open(devices[0]));

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function openConnected() {
        return _ref3.apply(this, arguments);
      }

      return openConnected;
    }()

    /**
     * Create a Ledger transport with a USBDevice
     */

  }, {
    key: "open",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(device) {
        var iface, interfaceNumber, transport, onDisconnect;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return device.open();

              case 2:
                if (!(device.configuration === null)) {
                  _context4.next = 5;
                  break;
                }

                _context4.next = 5;
                return device.selectConfiguration(configurationValue);

              case 5:
                _context4.next = 7;
                return device.reset();

              case 7:
                iface = device.configurations[0].interfaces.find(function (_ref5) {
                  var alternates = _ref5.alternates;
                  return alternates.some(function (a) {
                    return a.interfaceClass === 255;
                  });
                });

                if (iface) {
                  _context4.next = 10;
                  break;
                }

                throw new _lib3.TransportInterfaceNotAvailable("No WebUSB interface found for your Ledger device. Please upgrade firmware or contact techsupport.");

              case 10:
                interfaceNumber = iface.interfaceNumber;
                _context4.prev = 11;
                _context4.next = 14;
                return device.claimInterface(interfaceNumber);

              case 14:
                _context4.next = 21;
                break;

              case 16:
                _context4.prev = 16;
                _context4.t0 = _context4["catch"](11);
                _context4.next = 20;
                return device.close();

              case 20:
                throw new _lib3.TransportInterfaceNotAvailable(_context4.t0.message);

              case 21:
                transport = new TransportWebUSB(device, interfaceNumber);

                onDisconnect = function onDisconnect(e) {
                  if (device === e.device) {
                    // $FlowFixMe
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    transport._emitDisconnect(new _lib3.DisconnectedDevice());
                  }
                };
                // $FlowFixMe


                navigator.usb.addEventListener("disconnect", onDisconnect);
                return _context4.abrupt("return", transport);

              case 25:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[11, 16]]);
      }));

      function open(_x) {
        return _ref4.apply(this, arguments);
      }

      return open;
    }()
  }]);
  return TransportWebUSB;
}(_Transport3.default);

TransportWebUSB.isSupported = _webusb.isSupported;
TransportWebUSB.list = _webusb.getLedgerDevices;

TransportWebUSB.listen = function (observer) {
  var unsubscribed = false;
  (0, _webusb.getFirstLedgerDevice)().then(function (device) {
    if (!unsubscribed) {
      var deviceModel = (0, _lib.identifyUSBProductId)(device.productId);
      observer.next({ type: "add", descriptor: device, deviceModel: deviceModel });
      observer.complete();
    }
  }, function (error) {
    if (window.DOMException && error instanceof window.DOMException && error.code === 18) {
      observer.error(new _lib3.TransportWebUSBGestureRequired(error.message));
    } else {
      observer.error(new _lib3.TransportOpenUserCancelled(error.message));
    }
  });
  function unsubscribe() {
    unsubscribed = true;
  }
  return { unsubscribe: unsubscribe };
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.channel = Math.floor(Math.random() * 0xffff);
  this.packetSize = 64;
  this._disconnectEmitted = false;

  this._emitDisconnect = function (e) {
    if (_this2._disconnectEmitted) return;
    _this2._disconnectEmitted = true;
    _this2.emit("disconnect", e);
  };

  this.exchange = function (apdu) {
    return _this2.exchangeAtomicImpl((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
      var channel, packetSize, framing, blocks, i, result, acc, r, buffer;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              channel = _this2.channel, packetSize = _this2.packetSize;

              (0, _lib2.log)("apdu", "=> " + apdu.toString("hex"));

              framing = (0, _hidFraming2.default)(channel, packetSize);

              // Write...

              blocks = framing.makeBlocks(apdu);
              i = 0;

            case 5:
              if (!(i < blocks.length)) {
                _context5.next = 12;
                break;
              }

              (0, _lib2.log)("hid-frame", "=> " + blocks[i].toString("hex"));
              _context5.next = 9;
              return _this2.device.transferOut(endpointNumber, blocks[i]);

            case 9:
              i++;
              _context5.next = 5;
              break;

            case 12:

              // Read...
              result = void 0;
              acc = void 0;

            case 14:
              if (result = framing.getReducedResult(acc)) {
                _context5.next = 23;
                break;
              }

              _context5.next = 17;
              return _this2.device.transferIn(endpointNumber, packetSize);

            case 17:
              r = _context5.sent;
              buffer = Buffer.from(r.data.buffer);

              (0, _lib2.log)("hid-frame", "<= " + buffer.toString("hex"));
              acc = framing.reduceResponse(acc, buffer);
              _context5.next = 14;
              break;

            case 23:

              (0, _lib2.log)("apdu", "<= " + result.toString("hex"));
              return _context5.abrupt("return", result);

            case 25:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, _this2);
    }))).catch(function (e) {
      if (e && e.message && e.message.includes("disconnected")) {
        _this2._emitDisconnect(e);
        throw new _lib3.DisconnectedDeviceDuringOperation(e.message);
      }
      throw e;
    });
  };
};

exports.default = TransportWebUSB;
//# sourceMappingURL=TransportWebUSB.js.map