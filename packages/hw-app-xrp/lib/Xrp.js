"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bip32Path = require("bip32-path");

var _bip32Path2 = _interopRequireDefault(_bip32Path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Ripple API
 *
 * @example
 * import Xrp from "@ledgerhq/hw-app-xrp";
 * const xrp = new Xrp(transport);
 */
var Xrp = function () {
  function Xrp(transport) {
    var scrambleKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "XRP";

    _classCallCheck(this, Xrp);

    this.transport = transport;
    transport.decorateAppAPIMethods(this, ["getAddress", "signTransaction", "getAppConfiguration"], scrambleKey);
  }

  /**
   * get Ripple address for a given BIP 32 path.
   *
   * @param path a path in BIP 32 format
   * @param display optionally enable or not the display
   * @param chainCode optionally enable or not the chainCode request
   * @param ed25519 optionally enable or not the ed25519 curve (secp256k1 is default)
   * @return an object with a publicKey, address and (optionally) chainCode
   * @example
   * const result = await xrp.getAddress("44'/144'/0'/0/0");
   * const { publicKey, address } = result;
   */


  _createClass(Xrp, [{
    key: "getAddress",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(path, display, chainCode, ed25519) {
        var bipPath, curveMask, cla, ins, p1, p2, data, response, result, publicKeyLength, addressLength;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                bipPath = _bip32Path2.default.fromString(path).toPathArray();
                curveMask = ed25519 ? 0x80 : 0x40;
                cla = 0xe0;
                ins = 0x02;
                p1 = display ? 0x01 : 0x00;
                p2 = curveMask | (chainCode ? 0x01 : 0x00);
                data = Buffer.alloc(1 + bipPath.length * 4);


                data.writeInt8(bipPath.length, 0);
                bipPath.forEach(function (segment, index) {
                  data.writeUInt32BE(segment, 1 + index * 4);
                });

                _context.next = 11;
                return this.transport.send(cla, ins, p1, p2, data);

              case 11:
                response = _context.sent;
                result = {};
                publicKeyLength = response[0];
                addressLength = response[1 + publicKeyLength];


                result.publicKey = response.slice(1, 1 + publicKeyLength).toString("hex");

                result.address = response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString("ascii");

                if (chainCode) {
                  result.chainCode = response.slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32).toString("hex");
                }

                return _context.abrupt("return", result);

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAddress(_x2, _x3, _x4, _x5) {
        return _ref.apply(this, arguments);
      }

      return getAddress;
    }()

    /**
     * sign a Ripple transaction with a given BIP 32 path
     *
     * @param path a path in BIP 32 format
     * @param rawTxHex a raw transaction hex string
     * @param ed25519 optionally enable or not the ed25519 curve (secp256k1 is default)
     * @return a signature as hex string
     * @example
     * const signature = await xrp.signTransaction("44'/144'/0'/0/0", "12000022800000002400000002614000000001315D3468400000000000000C73210324E5F600B52BB3D9246D49C4AB1722BA7F32B7A3E4F9F2B8A1A28B9118CC36C48114F31B152151B6F42C1D61FE4139D34B424C8647D183142ECFC1831F6E979C6DA907E88B1CAD602DB59E2F");
     */

  }, {
    key: "signTransaction",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(path, rawTxHex, ed25519) {
        var bipPath, rawTx, curveMask, apdus, offset, _loop, response, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _apdu;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                bipPath = _bip32Path2.default.fromString(path).toPathArray();
                rawTx = new Buffer(rawTxHex, "hex");
                curveMask = ed25519 ? 0x80 : 0x40;
                apdus = [];
                offset = 0;

                _loop = function _loop() {
                  var maxChunkSize = offset === 0 ? 150 - 1 - bipPath.length * 4 : 150;
                  var chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize;

                  var apdu = {
                    cla: 0xe0,
                    ins: 0x04,
                    p1: offset === 0 ? 0x00 : 0x80,
                    p2: curveMask,
                    data: offset === 0 ? Buffer.alloc(1 + bipPath.length * 4 + chunkSize) : Buffer.alloc(chunkSize)
                  };

                  if (offset === 0) {
                    apdu.data.writeInt8(bipPath.length, 0);
                    bipPath.forEach(function (segment, index) {
                      apdu.data.writeUInt32BE(segment, 1 + index * 4);
                    });
                    rawTx.copy(apdu.data, 1 + bipPath.length * 4, offset, offset + chunkSize);
                  } else {
                    rawTx.copy(apdu.data, 0, offset, offset + chunkSize);
                  }

                  apdus.push(apdu);
                  offset += chunkSize;
                };

                while (offset !== rawTx.length) {
                  _loop();
                }

                response = Buffer.alloc(0);
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context2.prev = 11;
                _iterator = apdus[Symbol.iterator]();

              case 13:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context2.next = 21;
                  break;
                }

                _apdu = _step.value;
                _context2.next = 17;
                return this.transport.send(_apdu.cla, _apdu.ins, _apdu.p1, _apdu.p2, _apdu.data);

              case 17:
                response = _context2.sent;

              case 18:
                _iteratorNormalCompletion = true;
                _context2.next = 13;
                break;

              case 21:
                _context2.next = 27;
                break;

              case 23:
                _context2.prev = 23;
                _context2.t0 = _context2["catch"](11);
                _didIteratorError = true;
                _iteratorError = _context2.t0;

              case 27:
                _context2.prev = 27;
                _context2.prev = 28;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 30:
                _context2.prev = 30;

                if (!_didIteratorError) {
                  _context2.next = 33;
                  break;
                }

                throw _iteratorError;

              case 33:
                return _context2.finish(30);

              case 34:
                return _context2.finish(27);

              case 35:
                return _context2.abrupt("return", response.slice(0, response.length - 2).toString("hex"));

              case 36:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[11, 23, 27, 35], [28,, 30, 34]]);
      }));

      function signTransaction(_x6, _x7, _x8) {
        return _ref2.apply(this, arguments);
      }

      return signTransaction;
    }()

    /**
     * get the version of the Ripple app installed on the hardware device
     *
     * @return an object with a version
     * @example
     * const result = await xrp.getAppConfiguration();
     *
     * {
     *   "version": "1.0.3"
     * }
     */

  }, {
    key: "getAppConfiguration",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var response, result;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.transport.send(0xe0, 0x06, 0x00, 0x00);

              case 2:
                response = _context3.sent;
                result = {};

                result.version = "" + response[1] + "." + response[2] + "." + response[3];
                return _context3.abrupt("return", result);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getAppConfiguration() {
        return _ref3.apply(this, arguments);
      }

      return getAppConfiguration;
    }()
  }]);

  return Xrp;
}();

exports.default = Xrp;
//# sourceMappingURL=Xrp.js.map