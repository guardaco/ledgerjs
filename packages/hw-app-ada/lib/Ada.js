"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /********************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   Ledger Node JS API
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   (c) 2016-2017 Ledger
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *      http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      ********************************************************************************/


var _nodeInt = require("node-int64");

var _nodeInt2 = _interopRequireDefault(_nodeInt);

var _hwTransport = require("@ledgerhq/hw-transport");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CLA = 0x80;

var INS_GET_PUBLIC_KEY = 0x01;
var INS_SET_TX = 0x02;
var INS_SIGN_TX = 0x03;
var INS_APP_INFO = 0x04;

var P1_FIRST = 0x01;
var P1_NEXT = 0x02;
var P1_LAST = 0x03;

var P2_SINGLE_TX = 0x01;
var P2_MULTI_TX = 0x02;

var MAX_APDU_SIZE = 64;
var OFFSET_CDATA = 5;
var MAX_ADDR_PRINT_LENGTH = 12;
var INDEX_MAX = 0xffffffff;

var INDEX_NAN = 0x5003;
var INDEX_MAX_EXCEEDED = 0x5302;

/**
 * Cardano ADA API
 *
 * @example
 * import Ada from "@ledgerhq/hw-app-ada";
 * const ada = new Ada(transport);
 */

var Ada = function () {
  function Ada(transport) {
    var scrambleKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ADA";

    _classCallCheck(this, Ada);

    this.transport = transport;
    this.methods = ["isConnected", "getWalletRecoveryPassphrase", "getWalletPublicKeyWithIndex", "signTransaction"];
    this.transport.decorateAppAPIMethods(this, this.methods, scrambleKey);
  }

  /**
   * Checks if the device is connected and if so, returns an object
   * containing the app version.
   *
   * @returns {Promise<{major:number, minor:number, patch:number}>} Result object containing the application version number.
   *
   * @example
   * const { major, minor, patch } = await ada.isConnected();
   * console.log(`App version ${major}.${minor}.${patch}`);
   *
   */


  _createClass(Ada, [{
    key: "isConnected",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var response, _response, major, minor, patch;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.transport.send(CLA, INS_APP_INFO, 0x00, 0x00);

              case 2:
                response = _context.sent;
                _response = _slicedToArray(response, 3), major = _response[0], minor = _response[1], patch = _response[2];
                return _context.abrupt("return", { major: major, minor: minor, patch: patch });

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function isConnected() {
        return _ref.apply(this, arguments);
      }

      return isConnected;
    }()

    /**
     * @description Get the root extended public key of the wallet,
     * also known as the wallet recovery passphrase.
     * BIP 32 Path M 44' /1815'
     * 32 Byte Public Key
     * 32 Byte Chain Code
     *
     * @return {Promise<{ publicKey:string, chainCode:string }>} The result object containing the root wallet public key and chaincode.
     *
     * @example
     * const { publicKey, chainCode } = await ada.getWalletRecoveryPassphrase();
     * console.log(publicKey);
     * console.log(chainCode);
     *
     */

  }, {
    key: "getWalletRecoveryPassphrase",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var response, _response2, publicKeyLength, publicKey, chainCode;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.transport.send(CLA, INS_GET_PUBLIC_KEY, 0x01, 0x00);

              case 2:
                response = _context2.sent;
                _response2 = _slicedToArray(response, 1), publicKeyLength = _response2[0];
                publicKey = response.slice(1, 1 + publicKeyLength).toString("hex");
                chainCode = response.slice(1 + publicKeyLength, 1 + publicKeyLength + 32).toString("hex");
                return _context2.abrupt("return", { publicKey: publicKey, chainCode: chainCode });

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getWalletRecoveryPassphrase() {
        return _ref2.apply(this, arguments);
      }

      return getWalletRecoveryPassphrase;
    }()

    /**
     * @description Get a public key from the specified BIP 32 index.
     * The BIP 32 index is from the path at `44'/1815'/0'/[index]`.
     *
     * @param {number} index The index to retrieve.
     * @return {Promise<{ publicKey:string }>} The public key for the given index.
     *
     * @throws 5201 - Non-hardened index passed in, Index < 0x80000000
     * @throws 5202 - Invalid header
     * @throws 5003 - Index not a number
     *
     * @example
     * const { publicKey } = await ada.getWalletPublicKeyWithIndex(0xC001CODE);
     * console.log(publicKey);
     *
     */

  }, {
    key: "getWalletPublicKeyWithIndex",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(index) {
        var data, response, _response3, publicKeyLength, publicKey;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!isNaN(index)) {
                  _context3.next = 2;
                  break;
                }

                throw new _hwTransport.TransportStatusError(INDEX_NAN);

              case 2:
                data = Buffer.alloc(4);

                data.writeUInt32BE(index, 0);

                _context3.next = 6;
                return this.transport.send(CLA, INS_GET_PUBLIC_KEY, 0x02, 0x00, data);

              case 6:
                response = _context3.sent;
                _response3 = _slicedToArray(response, 1), publicKeyLength = _response3[0];
                publicKey = response.slice(1, 1 + publicKeyLength).toString("hex");
                return _context3.abrupt("return", { publicKey: publicKey });

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getWalletPublicKeyWithIndex(_x2) {
        return _ref3.apply(this, arguments);
      }

      return getWalletPublicKeyWithIndex;
    }()

    /**
     * @description Signs a hex encoded transaction with the given indexes.
     * The transaction is hased using Blake2b on the Ledger device.
     * Then, signed by the private key derived from each of the passed in indexes at
     * path 44'/1815'/0'/[index].
     *
     * @param {string} txHex The transaction to be signed.
     * @param {number[]} indexes The indexes of the keys to be used for signing.
     * @return {Array.Promise<{ digest:string }>} An array of result objects containing a digest for each of the passed in indexes.
     *
     * @throws 5001 - Tx > 1024 bytes
     * @throws 5301 - Index < 0x80000000
     * @throws 5302 - Index > 0xFFFFFFFF
     * @throws 5003 - Index not a number
     *
     * @example
     * const transaction = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0';
     * const { digest } = await ada.signTransaction(transaction, [0xF005BA11]);
     * console.log(`Signed successfully: ${digest}`);
     *
     */

  }, {
    key: "signTransaction",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(txHex, indexes) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.setTransaction(txHex);

              case 2:
                return _context4.abrupt("return", this.signTransactionWithIndexes(indexes));

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function signTransaction(_x3, _x4) {
        return _ref4.apply(this, arguments);
      }

      return signTransaction;
    }()

    /**
     * Set the transaction.
     *
     * @param {string} txHex The transaction to be set.
     * @return Promise<{ inputs?: string, outputs?: string, txs?: Array<{ address: string, amount: string }> }>  The response from the device.
     * @private
     */

  }, {
    key: "setTransaction",
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(txHex) {
        var rawTx, chunkSize, response, i, chunk, p2, p1, res, _res, _inputs, _outputs, _txs, offset, _i, _address, _amount;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                rawTx = Buffer.from(txHex, "hex");
                chunkSize = MAX_APDU_SIZE - OFFSET_CDATA;
                response = {};
                i = 0;

              case 4:
                if (!(i < rawTx.length)) {
                  _context5.next = 16;
                  break;
                }

                chunk = rawTx.slice(i, i + chunkSize);
                p2 = rawTx.length < chunkSize ? P2_SINGLE_TX : P2_MULTI_TX;
                p1 = P1_NEXT;


                if (i === 0) {
                  p1 = P1_FIRST;
                } else if (i + chunkSize >= rawTx.length) {
                  p1 = P1_LAST;
                }

                _context5.next = 11;
                return this.transport.send(CLA, INS_SET_TX, p1, p2, chunk);

              case 11:
                res = _context5.sent;


                if (res.length > 4) {
                  _res = _slicedToArray(res, 2), _inputs = _res[0], _outputs = _res[1];
                  _txs = [];
                  offset = 2;

                  for (_i = 0; _i < _outputs; _i++) {
                    _address = res.slice(offset, offset + MAX_ADDR_PRINT_LENGTH).toString();

                    offset += MAX_ADDR_PRINT_LENGTH;
                    _amount = new _nodeInt2.default(res.readUInt32LE(offset + 4), res.readUInt32LE(offset)).toOctetString();

                    _txs.push({ address: _address, amount: _amount });
                    offset += 8;
                  }

                  response = { inputs: _inputs, outputs: _outputs, txs: _txs };
                }

              case 13:
                i += chunkSize;
                _context5.next = 4;
                break;

              case 16:
                return _context5.abrupt("return", response);

              case 17:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function setTransaction(_x5) {
        return _ref5.apply(this, arguments);
      }

      return setTransaction;
    }()

    /**
     * Sign the set transaction with the given indexes.
     * Note that setTransaction must be called prior to this being called.
     *
     * @param {number[]} indexes The indexes of the keys to be used for signing.
     * @returns {Array.Promise<Object>} An array of result objects containing a digest for each of the passed in indexes.
     * @private
     */

  }, {
    key: "signTransactionWithIndexes",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(indexes) {
        var response, i, data, res, _digest;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                response = [];
                i = 0;

              case 2:
                if (!(i < indexes.length)) {
                  _context6.next = 17;
                  break;
                }

                if (!isNaN(indexes[i])) {
                  _context6.next = 5;
                  break;
                }

                throw new _hwTransport.TransportStatusError(INDEX_NAN);

              case 5:
                if (!(indexes[i] > INDEX_MAX)) {
                  _context6.next = 7;
                  break;
                }

                throw new _hwTransport.TransportStatusError(INDEX_MAX_EXCEEDED);

              case 7:
                data = Buffer.alloc(4);

                data.writeUInt32BE(indexes[i], 0);

                _context6.next = 11;
                return this.transport.send(CLA, INS_SIGN_TX, 0x00, 0x00, data);

              case 11:
                res = _context6.sent;
                _digest = res.slice(0, res.length - 2).toString("hex");


                response.push({ digest: _digest });

              case 14:
                i++;
                _context6.next = 2;
                break;

              case 17:
                return _context6.abrupt("return", response);

              case 18:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function signTransactionWithIndexes(_x6) {
        return _ref6.apply(this, arguments);
      }

      return signTransactionWithIndexes;
    }()
  }]);

  return Ada;
}();

exports.default = Ada;