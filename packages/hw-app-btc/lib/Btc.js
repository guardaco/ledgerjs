"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require("./utils");

var _createHash = require("create-hash");

var _createHash2 = _interopRequireDefault(_createHash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO future refactoring
// - drop utils.js & refactoring with async/await style
// - try to avoid every place we do hex<>Buffer conversion. also accept Buffer as func parameters (could accept both a string or a Buffer in the API)
// - there are redundant code across apps (see Eth vs Btc). we might want to factorize it somewhere. also each app apdu call should be abstracted it out as an api
var MAX_SCRIPT_BLOCK = 50;
var DEFAULT_VERSION = 1;
var DEFAULT_LOCKTIME = 0;
var DEFAULT_SEQUENCE = 0xffffffff;
var SIGHASH_ALL = 1;
var OP_DUP = 0x76;
var OP_HASH160 = 0xa9;
var HASH_SIZE = 0x14;
var OP_EQUALVERIFY = 0x88;
var OP_CHECKSIG = 0xac;
/**
 * Bitcoin API.
 *
 * @example
 * import Btc from "@ledgerhq/hw-app-btc";
 * const btc = new Btc(transport)
 */

var Btc = function () {
  function Btc(transport) {
    var scrambleKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "BTC";
    (0, _classCallCheck3.default)(this, Btc);

    this.transport = transport;
    transport.decorateAppAPIMethods(this, ["getWalletPublicKey", "signP2SHTransaction", "signMessageNew", "createPaymentTransactionNew"], scrambleKey);
  }

  (0, _createClass3.default)(Btc, [{
    key: "hashPublicKey",
    value: function hashPublicKey(buffer) {
      return (0, _createHash2.default)("rmd160").update((0, _createHash2.default)("sha256").update(buffer).digest()).digest();
    }
  }, {
    key: "getWalletPublicKey_private",
    value: function getWalletPublicKey_private(path, verify, segwit) {
      var paths = (0, _utils.splitPath)(path);
      var p1 = 0x00;
      var p2 = 0x00;
      if (verify === true) {
        p1 = 0x01;
      }
      if (segwit == true) {
        p2 = 0x01;
      }
      var buffer = Buffer.alloc(1 + paths.length * 4);
      buffer[0] = paths.length;
      paths.forEach(function (element, index) {
        buffer.writeUInt32BE(element, 1 + 4 * index);
      });
      return this.transport.send(0xe0, 0x40, p1, p2, buffer).then(function (response) {
        var publicKeyLength = response[0];
        var addressLength = response[1 + publicKeyLength];
        var publicKey = response.slice(1, 1 + publicKeyLength).toString("hex");
        var bitcoinAddress = response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString("ascii");
        var chainCode = response.slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32).toString("hex");
        return { publicKey: publicKey, bitcoinAddress: bitcoinAddress, chainCode: chainCode };
      });
    }

    /**
     * @param path a BIP 32 path
     * @param segwit use segwit
     * @example
     * btc.getWalletPublicKey("44'/0'/0'/0").then(o => o.bitcoinAddress)
     */

  }, {
    key: "getWalletPublicKey",
    value: function getWalletPublicKey(path) {
      var verify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var segwit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      return this.getWalletPublicKey_private(path, verify, segwit);
    }
  }, {
    key: "getTrustedInputRaw",
    value: function getTrustedInputRaw(transactionData, indexLookup) {
      var data = void 0;
      var firstRound = false;
      if (typeof indexLookup === "number") {
        firstRound = true;
        var prefix = Buffer.alloc(4);
        prefix.writeUInt32BE(indexLookup, 0);
        data = Buffer.concat([prefix, transactionData], transactionData.length + 4);
      } else {
        data = transactionData;
      }
      return this.transport.send(0xe0, 0x42, firstRound ? 0x00 : 0x80, 0x00, data).then(function (trustedInput) {
        return trustedInput.slice(0, trustedInput.length - 2).toString("hex");
      });
    }
  }, {
    key: "getTrustedInput",
    value: function getTrustedInput(indexLookup, transaction) {
      var _this = this;

      var additionals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var inputs = transaction.inputs,
          outputs = transaction.outputs,
          locktime = transaction.locktime;

      if (!outputs || !locktime) {
        throw new Error("getTrustedInput: locktime & outputs is expected");
      }
      var isDecred = additionals.includes("decred");
      var processScriptBlocks = function processScriptBlocks(script, sequence) {
        var scriptBlocks = [];
        var offset = 0;
        while (offset !== script.length) {
          var blockSize = script.length - offset > MAX_SCRIPT_BLOCK ? MAX_SCRIPT_BLOCK : script.length - offset;
          if (offset + blockSize !== script.length) {
            scriptBlocks.push(script.slice(offset, offset + blockSize));
          } else {
            scriptBlocks.push(Buffer.concat([script.slice(offset, offset + blockSize), sequence]));
          }
          offset += blockSize;
        }

        // Handle case when no script length: we still want to pass the sequence
        // relatable: https://github.com/LedgerHQ/ledger-live-desktop/issues/1386
        if (script.length === 0) {
          scriptBlocks.push(sequence);
        }

        return (0, _utils.eachSeries)(scriptBlocks, function (scriptBlock) {
          return _this.getTrustedInputRaw(scriptBlock);
        });
      };

      var processWholeScriptBlock = function processWholeScriptBlock(script, sequence) {
        return _this.getTrustedInputRaw(Buffer.concat([script, sequence]));
      };

      var processInputs = function processInputs() {
        return (0, _utils.eachSeries)(inputs, function (input) {
          var data = Buffer.concat([input.prevout, isDecred ? Buffer.from([0x00]) : Buffer.alloc(0), //tree
          _this.createVarint(input.script.length)]);
          return _this.getTrustedInputRaw(data).then(function () {
            // iteration (eachSeries) ended
            // TODO notify progress
            // deferred.notify("input");
            return isDecred ? processWholeScriptBlock(input.script, input.sequence) : processScriptBlocks(input.script, input.sequence);
          });
        }).then(function () {
          var data = _this.createVarint(outputs.length);
          return _this.getTrustedInputRaw(data);
        });
      };

      var processOutputs = function processOutputs() {
        return (0, _utils.eachSeries)(outputs, function (output) {
          var data = output.amount;
          data = Buffer.concat([data, isDecred ? Buffer.from([0x00, 0x00]) : Buffer.alloc(0), //Version script
          _this.createVarint(output.script.length), output.script]);
          return _this.getTrustedInputRaw(data).then(function () {
            // iteration (eachSeries) ended
            // TODO notify progress
            // deferred.notify("output");
          });
        }).then(function () {
          //Add expiry height for decred
          var finalData = isDecred ? Buffer.concat([locktime, Buffer.from([0x00, 0x00, 0x00, 0x00])]) : locktime;
          return _this.getTrustedInputRaw(finalData);
        });
      };

      var data = Buffer.concat([transaction.version, transaction.timestamp || Buffer.alloc(0), this.createVarint(inputs.length)]);
      return this.getTrustedInputRaw(data, indexLookup).then(processInputs).then(processOutputs);
    }
  }, {
    key: "getTrustedInputBIP143",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(indexLookup, transaction) {
        var additionals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var isDecred, sha, hash, data, outputs, locktime;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (transaction) {
                  _context.next = 2;
                  break;
                }

                throw new Error("getTrustedInputBIP143: missing tx");

              case 2:
                isDecred = additionals.includes("decred");

                if (!isDecred) {
                  _context.next = 5;
                  break;
                }

                throw new Error("Decred does not implement BIP143");

              case 5:
                sha = (0, _createHash2.default)("sha256");

                sha.update(this.serializeTransaction(transaction, true));
                hash = sha.digest();

                sha = (0, _createHash2.default)("sha256");
                sha.update(hash);
                hash = sha.digest();
                data = Buffer.alloc(4);

                data.writeUInt32LE(indexLookup, 0);
                outputs = transaction.outputs, locktime = transaction.locktime;

                if (!(!outputs || !locktime)) {
                  _context.next = 16;
                  break;
                }

                throw new Error("getTrustedInputBIP143: locktime & outputs is expected");

              case 16:
                if (outputs[indexLookup]) {
                  _context.next = 18;
                  break;
                }

                throw new Error("getTrustedInputBIP143: wrong index");

              case 18:
                hash = Buffer.concat([hash, data, outputs[indexLookup].amount]);
                _context.next = 21;
                return hash.toString("hex");

              case 21:
                return _context.abrupt("return", _context.sent);

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getTrustedInputBIP143(_x5, _x6) {
        return _ref.apply(this, arguments);
      }

      return getTrustedInputBIP143;
    }()
  }, {
    key: "getVarint",
    value: function getVarint(data, offset) {
      if (data[offset] < 0xfd) {
        return [data[offset], 1];
      }
      if (data[offset] === 0xfd) {
        return [(data[offset + 2] << 8) + data[offset + 1], 3];
      }
      if (data[offset] === 0xfe) {
        return [(data[offset + 4] << 24) + (data[offset + 3] << 16) + (data[offset + 2] << 8) + data[offset + 1], 5];
      }

      throw new Error("getVarint called with unexpected parameters");
    }
  }, {
    key: "startUntrustedHashTransactionInputRaw",
    value: function startUntrustedHashTransactionInputRaw(newTransaction, firstRound, transactionData) {
      var bip143 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var overwinter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var additionals = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

      var p2 = bip143 ? additionals.includes("sapling") ? 0x05 : overwinter ? 0x04 : 0x02 : 0x00;
      return this.transport.send(0xe0, 0x44, firstRound ? 0x00 : 0x80, newTransaction ? p2 : 0x80, transactionData);
    }
  }, {
    key: "startUntrustedHashTransactionInput",
    value: function startUntrustedHashTransactionInput(newTransaction, transaction, inputs) {
      var bip143 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var _this2 = this;

      var overwinter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var additionals = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

      var data = Buffer.concat([transaction.version, transaction.timestamp || Buffer.alloc(0), transaction.nVersionGroupId || Buffer.alloc(0), this.createVarint(transaction.inputs.length)]);
      return this.startUntrustedHashTransactionInputRaw(newTransaction, true, data, bip143, overwinter, additionals).then(function () {
        var i = 0;
        var isDecred = additionals.includes("decred");
        return (0, _utils.eachSeries)(transaction.inputs, function (input) {
          var prefix = void 0;
          if (bip143) {
            prefix = Buffer.from([0x02]);
          } else {
            if (inputs[i].trustedInput) {
              prefix = Buffer.from([0x01, inputs[i].value.length]);
            } else {
              prefix = Buffer.from([0x00]);
            }
          }
          data = Buffer.concat([prefix, inputs[i].value, isDecred ? Buffer.from([0x00]) : Buffer.alloc(0), _this2.createVarint(input.script.length)]);
          return _this2.startUntrustedHashTransactionInputRaw(newTransaction, false, data, bip143, overwinter, additionals).then(function () {
            var scriptBlocks = [];
            var offset = 0;
            if (input.script.length === 0) {
              scriptBlocks.push(input.sequence);
            } else {
              while (offset !== input.script.length) {
                var blockSize = input.script.length - offset > MAX_SCRIPT_BLOCK ? MAX_SCRIPT_BLOCK : input.script.length - offset;
                if (offset + blockSize !== input.script.length) {
                  scriptBlocks.push(input.script.slice(offset, offset + blockSize));
                } else {
                  scriptBlocks.push(Buffer.concat([input.script.slice(offset, offset + blockSize), input.sequence]));
                }
                offset += blockSize;
              }
            }
            return (0, _utils.eachSeries)(scriptBlocks, function (scriptBlock) {
              return _this2.startUntrustedHashTransactionInputRaw(newTransaction, false, scriptBlock, bip143, overwinter, additionals);
            }).then(function () {
              i++;
            });
          });
        });
      });
    }
  }, {
    key: "provideOutputFullChangePath",
    value: function provideOutputFullChangePath(path) {
      var paths = (0, _utils.splitPath)(path);
      var buffer = Buffer.alloc(1 + paths.length * 4);
      buffer[0] = paths.length;
      paths.forEach(function (element, index) {
        buffer.writeUInt32BE(element, 1 + 4 * index);
      });
      return this.transport.send(0xe0, 0x4a, 0xff, 0x00, buffer);
    }
  }, {
    key: "hashOutputFull",
    value: function hashOutputFull(outputScript) {
      var _this3 = this;

      var additionals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var offset = 0;
      var p1 = 0x80;
      var isDecred = additionals.includes("decred");
      ///WARNING: Decred works only with one call (without chunking)
      //TODO: test without this for Decred
      if (isDecred) {
        return this.transport.send(0xe0, 0x4a, p1, 0x00, outputScript);
      }
      return (0, _utils.asyncWhile)(function () {
        return offset < outputScript.length;
      }, function () {
        var blockSize = offset + MAX_SCRIPT_BLOCK >= outputScript.length ? outputScript.length - offset : MAX_SCRIPT_BLOCK;
        var p1 = offset + blockSize === outputScript.length ? 0x80 : 0x00;
        var data = outputScript.slice(offset, offset + blockSize);

        return _this3.transport.send(0xe0, 0x4a, p1, 0x00, data).then(function () {
          offset += blockSize;
        });
      });
    }
  }, {
    key: "signTransaction",
    value: function signTransaction(path) {
      var lockTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_LOCKTIME;
      var sigHashType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : SIGHASH_ALL;
      var expiryHeight = arguments[3];
      var additionals = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

      var isDecred = additionals.includes("decred");
      var paths = (0, _utils.splitPath)(path);
      var offset = 0;
      var pathsBuffer = Buffer.alloc(paths.length * 4);
      paths.forEach(function (element) {
        pathsBuffer.writeUInt32BE(element, offset);
        offset += 4;
      });
      var lockTimeBuffer = Buffer.alloc(4);
      lockTimeBuffer.writeUInt32BE(lockTime, 0);
      var buffer = isDecred ? Buffer.concat([Buffer.from([paths.length]), pathsBuffer, lockTimeBuffer, expiryHeight || Buffer.from([0x00, 0x00, 0x00, 0x00]), Buffer.from([sigHashType])]) : Buffer.concat([Buffer.from([paths.length]), pathsBuffer, Buffer.from([0x00]), lockTimeBuffer, Buffer.from([sigHashType])]);
      if (expiryHeight && !isDecred) {
        buffer = Buffer.concat([buffer, expiryHeight]);
      }
      return this.transport.send(0xe0, 0x48, 0x00, 0x00, buffer).then(function (result) {
        if (result.length > 0) {
          result[0] = 0x30;
          return result.slice(0, result.length - 2);
        }
        return result;
      });
    }

    /**
     * You can sign a message according to the Bitcoin Signature format and retrieve v, r, s given the message and the BIP 32 path of the account to sign.
     * @example
     btc.signMessageNew_async("44'/60'/0'/0'/0", Buffer.from("test").toString("hex")).then(function(result) {
       var v = result['v'] + 27 + 4;
       var signature = Buffer.from(v.toString(16) + result['r'] + result['s'], 'hex').toString('base64');
       console.log("Signature : " + signature);
     }).catch(function(ex) {console.log(ex);});
     */

  }, {
    key: "signMessageNew",
    value: function signMessageNew(path, messageHex) {
      var _this4 = this;

      var paths = (0, _utils.splitPath)(path);
      var message = new Buffer(messageHex, "hex");
      var offset = 0;
      var toSend = [];

      var _loop = function _loop() {
        var maxChunkSize = offset === 0 ? MAX_SCRIPT_BLOCK - 1 - paths.length * 4 - 4 : MAX_SCRIPT_BLOCK;
        var chunkSize = offset + maxChunkSize > message.length ? message.length - offset : maxChunkSize;
        var buffer = new Buffer(offset === 0 ? 1 + paths.length * 4 + 2 + chunkSize : chunkSize);
        if (offset === 0) {
          buffer[0] = paths.length;
          paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
          });
          buffer.writeUInt16BE(message.length, 1 + 4 * paths.length);
          message.copy(buffer, 1 + 4 * paths.length + 2, offset, offset + chunkSize);
        } else {
          message.copy(buffer, 0, offset, offset + chunkSize);
        }
        toSend.push(buffer);
        offset += chunkSize;
      };

      while (offset !== message.length) {
        _loop();
      }
      return (0, _utils.foreach)(toSend, function (data, i) {
        return _this4.transport.send(0xe0, 0x4e, 0x00, i === 0 ? 0x01 : 0x80, data);
      }).then(function () {
        return _this4.transport.send(0xe0, 0x4e, 0x80, 0x00, Buffer.from([0x00])).then(function (response) {
          var v = response[0] - 0x30;
          var r = response.slice(4, 4 + response[3]);
          if (r[0] === 0) {
            r = r.slice(1);
          }
          r = r.toString("hex");
          var offset = 4 + response[3] + 2;
          var s = response.slice(offset, offset + response[offset - 1]);
          if (s[0] === 0) {
            s = s.slice(1);
          }
          s = s.toString("hex");
          return { v: v, r: r, s: s };
        });
      });
    }

    /**
     * To sign a transaction involving standard (P2PKH) inputs, call createPaymentTransactionNew with the following parameters
     * @param inputs is an array of [ transaction, output_index, optional redeem script, optional sequence ] where
     *
     * * transaction is the previously computed transaction object for this UTXO
     * * output_index is the output in the transaction used as input for this UTXO (counting from 0)
     * * redeem script is the optional redeem script to use when consuming a Segregated Witness input
     * * sequence is the sequence number to use for this input (when using RBF), or non present
     * @param associatedKeysets is an array of BIP 32 paths pointing to the path to the private key used for each UTXO
     * @param changePath is an optional BIP 32 path pointing to the path to the public key used to compute the change address
     * @param outputScriptHex is the hexadecimal serialized outputs of the transaction to sign
     * @param lockTime is the optional lockTime of the transaction to sign, or default (0)
     * @param sigHashType is the hash type of the transaction to sign, or default (all)
     * @param segwit is an optional boolean indicating wether to use segwit or not
     * @param initialTimestamp is an optional timestamp of the function call to use for coins that necessitate timestamps only, (not the one that the tx will include)
     * @param additionals list of additionnal options
     * - "abc" for bch
     * - "gold" for btg
     * - "bipxxx" for using BIPxxx
     * - "sapling" to indicate a zec transaction is supporting sapling (to be set over block 419200)
     * @param expiryHeight is an optional Buffer for zec overwinter / sapling Txs
     * @return the signed transaction ready to be broadcast
     * @example
    btc.createPaymentTransactionNew(
     [ [tx1, 1] ],
     ["0'/0/0"],
     undefined,
     "01905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac"
    ).then(res => ...);
     */

  }, {
    key: "createPaymentTransactionNew",
    value: function createPaymentTransactionNew(inputs, associatedKeysets, changePath, outputScriptHex) {
      var lockTime = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : DEFAULT_LOCKTIME;
      var sigHashType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : SIGHASH_ALL;
      var segwit = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
      var initialTimestamp = arguments[7];

      var _this5 = this;

      var additionals = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : [];
      var expiryHeight = arguments[9];

      var isDecred = additionals.includes("decred");
      var hasTimestamp = initialTimestamp !== undefined;
      var startTime = Date.now();
      var sapling = additionals.includes("sapling");
      var useBip143 = segwit || !!additionals && (additionals.includes("abc") || additionals.includes("gold") || additionals.includes("bip143")) || !!expiryHeight && !isDecred;
      // Inputs are provided as arrays of [transaction, output_index, optional redeem script, optional sequence]
      // associatedKeysets are provided as arrays of [path]
      var nullScript = Buffer.alloc(0);
      var nullPrevout = Buffer.alloc(0);
      var defaultVersion = Buffer.alloc(4);
      !!expiryHeight && !isDecred ? defaultVersion.writeUInt32LE(sapling ? 0x80000004 : 0x80000003, 0) : defaultVersion.writeUInt32LE(1, 0);
      var trustedInputs = [];
      var regularOutputs = [];
      var signatures = [];
      var publicKeys = [];
      var firstRun = true;
      var resuming = false;
      var targetTransaction = {
        inputs: [],
        version: defaultVersion,
        timestamp: Buffer.alloc(0)
      };
      var getTrustedInputCall = useBip143 ? this.getTrustedInputBIP143.bind(this) : this.getTrustedInput.bind(this);
      var outputScript = Buffer.from(outputScriptHex, "hex");

      return (0, _utils.foreach)(inputs, function (input) {
        return (0, _utils.doIf)(!resuming, function () {
          return getTrustedInputCall(input[1], input[0], additionals).then(function (trustedInput) {
            var sequence = Buffer.alloc(4);
            sequence.writeUInt32LE(input.length >= 4 && typeof input[3] === "number" ? input[3] : DEFAULT_SEQUENCE, 0);
            trustedInputs.push({
              trustedInput: true,
              value: Buffer.from(trustedInput, "hex"),
              sequence: sequence
            });
          });
        }).then(function () {
          var outputs = input[0].outputs;

          var index = input[1];
          if (outputs && index <= outputs.length - 1) {
            regularOutputs.push(outputs[index]);
          }
        }).then(function () {
          if (!!expiryHeight && !isDecred) {
            targetTransaction.nVersionGroupId = Buffer.from(sapling ? [0x85, 0x20, 0x2f, 0x89] : [0x70, 0x82, 0xc4, 0x03]);
            targetTransaction.nExpiryHeight = expiryHeight;
            // For sapling : valueBalance (8), nShieldedSpend (1), nShieldedOutput (1), nJoinSplit (1)
            // Overwinter : use nJoinSplit (1)
            targetTransaction.extraData = Buffer.from(sapling ? [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] : [0x00]);
          } else if (isDecred) {
            targetTransaction.nExpiryHeight = expiryHeight;
          }
        });
      }).then(function () {
        for (var i = 0; i < inputs.length; i++) {
          var _sequence = Buffer.alloc(4);
          _sequence.writeUInt32LE(inputs[i].length >= 4 && typeof inputs[i][3] === "number" ? inputs[i][3] : DEFAULT_SEQUENCE, 0);
          targetTransaction.inputs.push({
            script: nullScript,
            prevout: nullPrevout,
            sequence: _sequence
          });
        }
      }).then(function () {
        return (0, _utils.doIf)(!resuming, function () {
          return (
            // Collect public keys
            (0, _utils.foreach)(inputs, function (input, i) {
              return _this5.getWalletPublicKey_private(associatedKeysets[i], false, false);
            }).then(function (result) {
              for (var index = 0; index < result.length; index++) {
                publicKeys.push(_this5.compressPublicKey(Buffer.from(result[index].publicKey, "hex")));
              }
            })
          );
        });
      }).then(function () {
        if (hasTimestamp) {
          targetTransaction.timestamp = Buffer.alloc(4);
          targetTransaction.timestamp.writeUInt32LE(Math.floor(initialTimestamp + (Date.now() - startTime) / 1000), 0);
        }
      }).then(function () {
        return (0, _utils.doIf)(useBip143, function () {
          return (
            // Do the first run with all inputs
            _this5.startUntrustedHashTransactionInput(true, targetTransaction, trustedInputs, true, !!expiryHeight, additionals).then(function () {
              return (0, _utils.doIf)(!resuming && typeof changePath != "undefined", function () {
                // $FlowFixMe
                return _this5.provideOutputFullChangePath(changePath);
              }).then(function () {
                return _this5.hashOutputFull(outputScript);
              });
            })
          );
        });
      }).then(function () {
        return (0, _utils.doIf)(!!expiryHeight && !isDecred, function () {
          return _this5.signTransaction("", undefined, SIGHASH_ALL, expiryHeight);
        });
      }).then(function () {
        return (
          // Do the second run with the individual transaction
          (0, _utils.foreach)(inputs, function (input, i) {
            var script = inputs[i].length >= 3 && typeof inputs[i][2] === "string" ? Buffer.from(inputs[i][2], "hex") : !segwit ? regularOutputs[i].script : Buffer.concat([Buffer.from([OP_DUP, OP_HASH160, HASH_SIZE]), _this5.hashPublicKey(publicKeys[i]), Buffer.from([OP_EQUALVERIFY, OP_CHECKSIG])]);
            var pseudoTX = (0, _assign2.default)({}, targetTransaction);
            var pseudoTrustedInputs = useBip143 ? [trustedInputs[i]] : trustedInputs;
            if (useBip143) {
              pseudoTX.inputs = [(0, _extends3.default)({}, pseudoTX.inputs[i], { script: script })];
            } else {
              pseudoTX.inputs[i].script = script;
            }
            return _this5.startUntrustedHashTransactionInput(!useBip143 && firstRun, pseudoTX, pseudoTrustedInputs, useBip143, !!expiryHeight && !isDecred, additionals).then(function () {
              return (0, _utils.doIf)(!useBip143, function () {
                return (0, _utils.doIf)(!resuming && typeof changePath != "undefined", function () {
                  // $FlowFixMe
                  return _this5.provideOutputFullChangePath(changePath);
                }).then(function () {
                  return _this5.hashOutputFull(outputScript, additionals);
                });
              });
            }).then(function () {
              return _this5.signTransaction(associatedKeysets[i], lockTime, sigHashType, expiryHeight, additionals);
            }).then(function (signature) {
              signatures.push(signature);
              targetTransaction.inputs[i].script = nullScript;
              if (firstRun) {
                firstRun = false;
              }
            });
          })
        );
      }).then(function () {
        // Populate the final input scripts
        for (var _i = 0; _i < inputs.length; _i++) {
          if (segwit) {
            targetTransaction.witness = Buffer.alloc(0);
            targetTransaction.inputs[_i].script = Buffer.concat([Buffer.from("160014", "hex"), _this5.hashPublicKey(publicKeys[_i])]);
          } else {
            var signatureSize = Buffer.alloc(1);
            var keySize = Buffer.alloc(1);
            signatureSize[0] = signatures[_i].length;
            keySize[0] = publicKeys[_i].length;
            targetTransaction.inputs[_i].script = Buffer.concat([signatureSize, signatures[_i], keySize, publicKeys[_i]]);
          }
          var offset = useBip143 ? 0 : 4;
          targetTransaction.inputs[_i].prevout = trustedInputs[_i].value.slice(offset, offset + 0x24);
        }

        var lockTimeBuffer = Buffer.alloc(4);
        lockTimeBuffer.writeUInt32LE(lockTime, 0);

        var result = Buffer.concat([_this5.serializeTransaction(targetTransaction, false, targetTransaction.timestamp, additionals), outputScript]);

        if (segwit && !isDecred) {
          var witness = Buffer.alloc(0);
          for (var i = 0; i < inputs.length; i++) {
            var tmpScriptData = Buffer.concat([Buffer.from("02", "hex"), Buffer.from([signatures[i].length]), signatures[i], Buffer.from([publicKeys[i].length]), publicKeys[i]]);
            witness = Buffer.concat([witness, tmpScriptData]);
          }
          result = Buffer.concat([result, witness]);
        }
        if (expiryHeight) {
          result = Buffer.concat([result, targetTransaction.nExpiryHeight || Buffer.alloc(0), targetTransaction.extraData || Buffer.alloc(0)]);
        }

        result = Buffer.concat([result, lockTimeBuffer]);

        if (isDecred) {
          var decredWitness = Buffer.from([targetTransaction.inputs.length]);
          inputs.forEach(function (input, inputIndex) {
            decredWitness = Buffer.concat([decredWitness, Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), Buffer.from([0x00, 0x00, 0x00, 0x00]), //Block height
            Buffer.from([0xff, 0xff, 0xff, 0xff]), //Block index
            Buffer.from([targetTransaction.inputs[inputIndex].script.length]), targetTransaction.inputs[inputIndex].script]);
          });

          result = Buffer.concat([result, decredWitness]);
        }

        return result.toString("hex");
      });
    }

    /**
     * To obtain the signature of multisignature (P2SH) inputs, call signP2SHTransaction_async with the folowing parameters
     * @param inputs is an array of [ transaction, output_index, redeem script, optional sequence ] where
     * * transaction is the previously computed transaction object for this UTXO
     * * output_index is the output in the transaction used as input for this UTXO (counting from 0)
     * * redeem script is the mandatory redeem script associated to the current P2SH input
     * * sequence is the sequence number to use for this input (when using RBF), or non present
     * @param associatedKeysets is an array of BIP 32 paths pointing to the path to the private key used for each UTXO
     * @param outputScriptHex is the hexadecimal serialized outputs of the transaction to sign
     * @param lockTime is the optional lockTime of the transaction to sign, or default (0)
     * @param sigHashType is the hash type of the transaction to sign, or default (all)
     * @return the signed transaction ready to be broadcast
     * @example
    btc.signP2SHTransaction(
    [ [tx, 1, "52210289b4a3ad52a919abd2bdd6920d8a6879b1e788c38aa76f0440a6f32a9f1996d02103a3393b1439d1693b063482c04bd40142db97bdf139eedd1b51ffb7070a37eac321030b9a409a1e476b0d5d17b804fcdb81cf30f9b99c6f3ae1178206e08bc500639853ae"] ],
    ["0'/0/0"],
    "01905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac"
    ).then(result => ...);
     */

  }, {
    key: "signP2SHTransaction",
    value: function signP2SHTransaction(inputs, associatedKeysets, outputScriptHex) {
      var lockTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_LOCKTIME;
      var sigHashType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : SIGHASH_ALL;

      var _this6 = this;

      var segwit = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      var transactionVersion = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : DEFAULT_VERSION;

      // Inputs are provided as arrays of [transaction, output_index, redeem script, optional sequence]
      // associatedKeysets are provided as arrays of [path]
      var nullScript = Buffer.alloc(0);
      var nullPrevout = Buffer.alloc(0);
      var defaultVersion = Buffer.alloc(4);
      defaultVersion.writeUInt32LE(transactionVersion, 0);
      var trustedInputs = [];
      var regularOutputs = [];
      var signatures = [];
      var firstRun = true;
      var resuming = false;
      var targetTransaction = {
        inputs: [],
        version: defaultVersion
      };

      var getTrustedInputCall = segwit ? this.getTrustedInputBIP143.bind(this) : this.getTrustedInput.bind(this);
      var outputScript = Buffer.from(outputScriptHex, "hex");

      return (0, _utils.foreach)(inputs, function (input) {
        return (0, _utils.doIf)(!resuming, function () {
          return getTrustedInputCall(input[1], input[0]).then(function (trustedInput) {
            var sequence = Buffer.alloc(4);
            sequence.writeUInt32LE(input.length >= 4 && typeof input[3] === "number" ? input[3] : DEFAULT_SEQUENCE, 0);
            trustedInputs.push({
              trustedInput: false,
              value: segwit ? Buffer.from(trustedInput, "hex") : Buffer.from(trustedInput, "hex").slice(4, 4 + 0x24),
              sequence: sequence
            });
          });
        }).then(function () {
          var outputs = input[0].outputs;

          var index = input[1];
          if (outputs && index <= outputs.length - 1) {
            regularOutputs.push(outputs[index]);
          }
        });
      }).then(function () {
        // Pre-build the target transaction
        for (var i = 0; i < inputs.length; i++) {
          var _sequence2 = Buffer.alloc(4);
          _sequence2.writeUInt32LE(inputs[i].length >= 4 && typeof inputs[i][3] === "number" ? inputs[i][3] : DEFAULT_SEQUENCE, 0);
          targetTransaction.inputs.push({
            script: nullScript,
            prevout: nullPrevout,
            sequence: _sequence2
          });
        }
      }).then(function () {
        return (0, _utils.doIf)(segwit, function () {
          return (
            // Do the first run with all inputs
            _this6.startUntrustedHashTransactionInput(true, targetTransaction, trustedInputs, true).then(function () {
              return _this6.hashOutputFull(outputScript);
            })
          );
        });
      }).then(function () {
        return (0, _utils.foreach)(inputs, function (input, i) {
          var script = inputs[i].length >= 3 && typeof inputs[i][2] === "string" ? Buffer.from(inputs[i][2], "hex") : regularOutputs[i].script;
          var pseudoTX = (0, _assign2.default)({}, targetTransaction);
          var pseudoTrustedInputs = segwit ? [trustedInputs[i]] : trustedInputs;
          if (segwit) {
            pseudoTX.inputs = [(0, _extends3.default)({}, pseudoTX.inputs[i], { script: script })];
          } else {
            pseudoTX.inputs[i].script = script;
          }
          return _this6.startUntrustedHashTransactionInput(!segwit && firstRun, pseudoTX, pseudoTrustedInputs, segwit).then(function () {
            return (0, _utils.doIf)(!segwit, function () {
              return _this6.hashOutputFull(outputScript);
            });
          }).then(function () {
            return _this6.signTransaction(associatedKeysets[i], lockTime, sigHashType).then(function (signature) {
              signatures.push(segwit ? signature.toString("hex") : signature.slice(0, signature.length - 1).toString("hex"));
              targetTransaction.inputs[i].script = nullScript;
              if (firstRun) {
                firstRun = false;
              }
            });
          });
        });
      }).then(function () {
        return signatures;
      });
    }
  }, {
    key: "compressPublicKey",
    value: function compressPublicKey(publicKey) {
      var prefix = (publicKey[64] & 1) !== 0 ? 0x03 : 0x02;
      var prefixBuffer = Buffer.alloc(1);
      prefixBuffer[0] = prefix;
      return Buffer.concat([prefixBuffer, publicKey.slice(1, 1 + 32)]);
    }
  }, {
    key: "createVarint",
    value: function createVarint(value) {
      if (value < 0xfd) {
        var _buffer = Buffer.alloc(1);
        _buffer[0] = value;
        return _buffer;
      }
      if (value <= 0xffff) {
        var _buffer2 = Buffer.alloc(3);
        _buffer2[0] = 0xfd;
        _buffer2[1] = value & 0xff;
        _buffer2[2] = value >> 8 & 0xff;
        return _buffer2;
      }
      var buffer = Buffer.alloc(5);
      buffer[0] = 0xfe;
      buffer[1] = value & 0xff;
      buffer[2] = value >> 8 & 0xff;
      buffer[3] = value >> 16 & 0xff;
      buffer[4] = value >> 24 & 0xff;
      return buffer;
    }

    /**
     * For each UTXO included in your transaction, create a transaction object from the raw serialized version of the transaction used in this UTXO.
     * @example
    const tx1 = btc.splitTransaction("01000000014ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a47304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f57c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff0281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88aca0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac00000000");
     */

  }, {
    key: "splitTransaction",
    value: function splitTransaction(transactionHex) {
      var isSegwitSupported = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var hasTimestamp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var hasExtraData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var additionals = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

      var inputs = [];
      var outputs = [];
      var witness = false;
      var offset = 0;
      var timestamp = Buffer.alloc(0);
      var nExpiryHeight = Buffer.alloc(0);
      var nVersionGroupId = Buffer.alloc(0);
      var extraData = Buffer.alloc(0);
      var isDecred = additionals.includes("decred");
      var transaction = Buffer.from(transactionHex, "hex");
      var version = transaction.slice(offset, offset + 4);
      var overwinter = version.equals(Buffer.from([0x03, 0x00, 0x00, 0x80])) || version.equals(Buffer.from([0x04, 0x00, 0x00, 0x80]));
      offset += 4;
      if (!hasTimestamp && isSegwitSupported && transaction[offset] === 0 && transaction[offset + 1] !== 0) {
        offset += 2;
        witness = true;
      }
      if (hasTimestamp) {
        timestamp = transaction.slice(offset, 4 + offset);
        offset += 4;
      }
      if (overwinter) {
        nVersionGroupId = transaction.slice(offset, 4 + offset);
        offset += 4;
      }
      var varint = this.getVarint(transaction, offset);
      var numberInputs = varint[0];
      offset += varint[1];
      for (var i = 0; i < numberInputs; i++) {
        var _prevout = transaction.slice(offset, offset + 36);
        offset += 36;
        varint = this.getVarint(transaction, offset);
        offset += varint[1];
        var _script = transaction.slice(offset, offset + varint[0]);
        offset += varint[0];
        var _sequence3 = transaction.slice(offset, offset + 4);
        offset += 4;
        inputs.push({ prevout: _prevout, script: _script, sequence: _sequence3 });
      }
      varint = this.getVarint(transaction, offset);
      var numberOutputs = varint[0];
      offset += varint[1];
      for (var _i2 = 0; _i2 < numberOutputs; _i2++) {
        var _amount = transaction.slice(offset, offset + 8);
        offset += 8;

        if (isDecred) {
          //Script version
          offset += 2;
        }

        varint = this.getVarint(transaction, offset);
        offset += varint[1];
        var _script2 = transaction.slice(offset, offset + varint[0]);
        offset += varint[0];
        outputs.push({ amount: _amount, script: _script2 });
      }
      var witnessScript = void 0,
          locktime = void 0;
      if (witness) {
        witnessScript = transaction.slice(offset, -4);
        locktime = transaction.slice(transaction.length - 4);
      } else {
        locktime = transaction.slice(offset, offset + 4);
      }
      offset += 4;
      if (overwinter || isDecred) {
        nExpiryHeight = transaction.slice(offset, offset + 4);
        offset += 4;
      }
      if (hasExtraData) {
        extraData = transaction.slice(offset);
      }

      return {
        version: version,
        inputs: inputs,
        outputs: outputs,
        locktime: locktime,
        witness: witnessScript,
        timestamp: timestamp,
        nVersionGroupId: nVersionGroupId,
        nExpiryHeight: nExpiryHeight,
        extraData: extraData
      };
    }

    /**
    @example
    const tx1 = btc.splitTransaction("01000000014ea60aeac5252c14291d428915bd7ccd1bfc4af009f4d4dc57ae597ed0420b71010000008a47304402201f36a12c240dbf9e566bc04321050b1984cd6eaf6caee8f02bb0bfec08e3354b022012ee2aeadcbbfd1e92959f57c15c1c6debb757b798451b104665aa3010569b49014104090b15bde569386734abf2a2b99f9ca6a50656627e77de663ca7325702769986cf26cc9dd7fdea0af432c8e2becc867c932e1b9dd742f2a108997c2252e2bdebffffffff0281b72e00000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88aca0860100000000001976a9144533f5fb9b4817f713c48f0bfe96b9f50c476c9b88ac00000000");
    const outputScript = btc.serializeTransactionOutputs(tx1).toString('hex');
    */

  }, {
    key: "serializeTransactionOutputs",
    value: function serializeTransactionOutputs(_ref2) {
      var _this7 = this;

      var outputs = _ref2.outputs;

      var outputBuffer = Buffer.alloc(0);
      if (typeof outputs !== "undefined") {
        outputBuffer = Buffer.concat([outputBuffer, this.createVarint(outputs.length)]);
        outputs.forEach(function (output) {
          outputBuffer = Buffer.concat([outputBuffer, output.amount, _this7.createVarint(output.script.length), output.script]);
        });
      }
      return outputBuffer;
    }

    /**
     */

  }, {
    key: "serializeTransaction",
    value: function serializeTransaction(transaction, skipWitness, timestamp) {
      var _this8 = this;

      var additionals = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

      var isDecred = additionals.includes("decred");
      var inputBuffer = Buffer.alloc(0);
      var useWitness = typeof transaction["witness"] != "undefined" && !skipWitness;
      transaction.inputs.forEach(function (input) {
        inputBuffer = isDecred ? Buffer.concat([inputBuffer, input.prevout, Buffer.from([0x00]), //tree
        input.sequence]) : Buffer.concat([inputBuffer, input.prevout, _this8.createVarint(input.script.length), input.script, input.sequence]);
      });

      var outputBuffer = this.serializeTransactionOutputs(transaction);
      if (typeof transaction.outputs !== "undefined" && typeof transaction.locktime !== "undefined") {
        outputBuffer = Buffer.concat([outputBuffer, useWitness && transaction.witness || Buffer.alloc(0), transaction.locktime, transaction.nExpiryHeight || Buffer.alloc(0), transaction.extraData || Buffer.alloc(0)]);
      }

      return Buffer.concat([transaction.version, timestamp ? timestamp : Buffer.alloc(0), transaction.nVersionGroupId || Buffer.alloc(0), useWitness ? Buffer.from("0001", "hex") : Buffer.alloc(0), this.createVarint(transaction.inputs.length), inputBuffer, outputBuffer]);
    }

    /**
     */

  }, {
    key: "displayTransactionDebug",
    value: function displayTransactionDebug(transaction) {
      console.log("version " + transaction.version.toString("hex"));
      transaction.inputs.forEach(function (input, i) {
        var prevout = input.prevout.toString("hex");
        var script = input.script.toString("hex");
        var sequence = input.sequence.toString("hex");
        console.log("input " + i + " prevout " + prevout + " script " + script + " sequence " + sequence);
      });
      (transaction.outputs || []).forEach(function (output, i) {
        var amount = output.amount.toString("hex");
        var script = output.script.toString("hex");
        console.log("output " + i + " amount " + amount + " script " + script);
      });
      if (typeof transaction.locktime !== "undefined") {
        console.log("locktime " + transaction.locktime.toString("hex"));
      }
    }
  }]);
  return Btc;
}();

/**
 */


exports.default = Btc;

/**
 */


/**
 */