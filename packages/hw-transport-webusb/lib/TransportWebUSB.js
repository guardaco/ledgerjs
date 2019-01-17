"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

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

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

var _webusb = require("./webusb");

var _hidFraming = require("./hid-framing");

var _hidFraming2 = _interopRequireDefault(_hidFraming);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configurationValue = 1;

var interfaceNumber = 2;
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

  function TransportWebUSB(device) {
    (0, _classCallCheck3.default)(this, TransportWebUSB);

    var _this = (0, _possibleConstructorReturn3.default)(this, (TransportWebUSB.__proto__ || (0, _getPrototypeOf2.default)(TransportWebUSB)).call(this));

    _initialiseProps.call(_this);

    _this.device = device;
    return _this;
  }

  (0, _createClass3.default)(TransportWebUSB, [{
    key: "close",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.device.releaseInterface(interfaceNumber);

              case 2:
                _context.next = 4;
                return this.device.reset();

              case 4:
                _context.next = 6;
                return this.device.close();

              case 6:
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
  }, {
    key: "setScrambleKey",
    value: function setScrambleKey() {}

    // $FlowFixMe

  }], [{
    key: "open",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(device) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return device.open();

              case 2:
                if (!(device.configuration === null)) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 5;
                return device.selectConfiguration(configurationValue);

              case 5:
                _context2.next = 7;
                return device.reset();

              case 7:
                _context2.next = 9;
                return device.claimInterface(interfaceNumber);

              case 9:
                return _context2.abrupt("return", new TransportWebUSB(device));

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function open(_x) {
        return _ref2.apply(this, arguments);
      }

      return open;
    }()
  }]);
  return TransportWebUSB;
}(_hwTransport2.default);

TransportWebUSB.isSupported = _webusb.isSupported;
TransportWebUSB.list = _webusb.getLedgerDevices;

TransportWebUSB.listen = function (observer) {
  var unsubscribed = false;
  (0, _webusb.requestLedgerDevice)().then(function (device) {
    if (!unsubscribed) {
      observer.next({ type: "add", descriptor: device, device: device });
      observer.complete();
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

  this.exchange = function (apdu) {
    return _this2.atomic((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
      var debug, channel, packetSize, framing, blocks, i, result, acc, r;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              debug = _this2.debug, channel = _this2.channel, packetSize = _this2.packetSize;

              if (debug) {
                debug("=>" + apdu.toString("hex"));
              }

              framing = (0, _hidFraming2.default)(channel, packetSize);

              // Write...

              blocks = framing.makeBlocks(apdu);
              i = 0;

            case 5:
              if (!(i < blocks.length)) {
                _context3.next = 11;
                break;
              }

              _context3.next = 8;
              return _this2.device.transferOut(endpointNumber, blocks[i]);

            case 8:
              i++;
              _context3.next = 5;
              break;

            case 11:

              // Read...
              result = void 0;
              acc = void 0;

            case 13:
              if (result = framing.getReducedResult(acc)) {
                _context3.next = 20;
                break;
              }

              _context3.next = 16;
              return _this2.device.transferIn(endpointNumber, packetSize);

            case 16:
              r = _context3.sent;

              acc = framing.reduceResponse(acc, Buffer.from(r.data.buffer));
              _context3.next = 13;
              break;

            case 20:

              if (debug) {
                debug("<=" + result.toString("hex"));
              }
              return _context3.abrupt("return", result);

            case 22:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, _this2);
    })));
  };

  this.atomic = function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(f) {
      var resolveBusy, busyPromise, res;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!_this2.busy) {
                _context4.next = 2;
                break;
              }

              throw new _hwTransport.TransportError("Transport race condition", "RaceCondition");

            case 2:
              resolveBusy = void 0;
              busyPromise = new _promise2.default(function (r) {
                resolveBusy = r;
              });

              _this2.busy = busyPromise;
              _context4.prev = 5;
              _context4.next = 8;
              return f();

            case 8:
              res = _context4.sent;
              return _context4.abrupt("return", res);

            case 10:
              _context4.prev = 10;

              if (resolveBusy) resolveBusy();
              _this2.busy = null;
              return _context4.finish(10);

            case 14:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, _this2, [[5,, 10, 14]]);
    }));

    return function (_x2) {
      return _ref4.apply(this, arguments);
    };
  }();
};

exports.default = TransportWebUSB;
//# sourceMappingURL=TransportWebUSB.js.map