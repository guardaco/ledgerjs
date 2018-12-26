"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createLedgerSubprovider;

var _hwAppEth = require("@ledgerhq/hw-app-eth");

var _hwAppEth2 = _interopRequireDefault(_hwAppEth);

var _hookedWallet = require("web3-provider-engine/dist/es5/subproviders/hooked-wallet");

var _hookedWallet2 = _interopRequireDefault(_hookedWallet);

var _stripHexPrefix = require("strip-hex-prefix");

var _stripHexPrefix2 = _interopRequireDefault(_stripHexPrefix);

var _ethereumjsTx = require("ethereumjs-tx");

var _ethereumjsTx2 = _interopRequireDefault(_ethereumjsTx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var allowedHdPaths = ["44'/1'", "44'/60'", "44'/61'"];

function makeError(msg, id) {
  var err = new Error(msg);
  // $FlowFixMe
  err.id = id;
  return err;
}

function obtainPathComponentsFromDerivationPath(derivationPath) {
  // check if derivation path follows 44'/60'/x'/n pattern
  var regExp = /^(44'\/(?:1|60|61)'\/\d+'?\/)(\d+)$/;
  var matchResult = regExp.exec(derivationPath);
  if (matchResult === null) {
    throw makeError("To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/n ", "InvalidDerivationPath");
  }
  return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
}

/**
 */


var defaultOptions = {
  networkId: 1, // mainnet
  path: "44'/60'/0'/0", // ledger default derivation path
  askConfirm: false,
  accountsLength: 1,
  accountsOffset: 0
};

/**
 * Create a HookedWalletSubprovider for Ledger devices.
 * @param getTransport gets lazily called each time the device is needed. It is a function that returns a Transport instance. You can typically give `()=>TransportU2F.create()`
 * @example
import Web3 from "web3";
import createLedgerSubprovider from "@ledgerhq/web3-subprovider";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import ProviderEngine from "web3-provider-engine";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";
const engine = new ProviderEngine();
const getTransport = () => TransportU2F.create();
const ledger = createLedgerSubprovider(getTransport, {
  accountsLength: 5
});
engine.addProvider(ledger);
engine.addProvider(new RpcSubprovider({ rpcUrl }));
engine.start();
const web3 = new Web3(engine);
 */
function createLedgerSubprovider(getTransport, options) {
  var _getAccounts = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var transport, eth, addresses, i, _path, address;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return getTransport();

            case 2:
              transport = _context.sent;
              _context.prev = 3;
              eth = new _hwAppEth2.default(transport);
              addresses = {};
              i = accountsOffset;

            case 7:
              if (!(i < accountsOffset + accountsLength)) {
                _context.next = 17;
                break;
              }

              _path = pathComponents.basePath + (pathComponents.index + i).toString();
              _context.next = 11;
              return eth.getAddress(_path, askConfirm, false);

            case 11:
              address = _context.sent;

              addresses[_path] = address.address;
              addressToPathMap[address.address.toLowerCase()] = _path;

            case 14:
              i++;
              _context.next = 7;
              break;

            case 17:
              return _context.abrupt("return", addresses);

            case 18:
              _context.prev = 18;

              transport.close();
              return _context.finish(18);

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[3,, 18, 21]]);
    }));

    return function _getAccounts() {
      return _ref.apply(this, arguments);
    };
  }();

  var _signPersonalMessage = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(msgData) {
      var path, transport, eth, result, v, vHex;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              path = addressToPathMap[msgData.from.toLowerCase()];

              if (path) {
                _context2.next = 3;
                break;
              }

              throw new Error("address unknown '" + msgData.from + "'");

            case 3:
              _context2.next = 5;
              return getTransport();

            case 5:
              transport = _context2.sent;
              _context2.prev = 6;
              eth = new _hwAppEth2.default(transport);
              _context2.next = 10;
              return eth.signPersonalMessage(path, (0, _stripHexPrefix2.default)(msgData.data));

            case 10:
              result = _context2.sent;
              v = parseInt(result.v, 10) - 27;
              vHex = v.toString(16);

              if (vHex.length < 2) {
                vHex = "0" + v;
              }
              return _context2.abrupt("return", "0x" + result.r + result.s + vHex);

            case 15:
              _context2.prev = 15;

              transport.close();
              return _context2.finish(15);

            case 18:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[6,, 15, 18]]);
    }));

    return function _signPersonalMessage(_x) {
      return _ref2.apply(this, arguments);
    };
  }();

  var _signTransaction = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(txData) {
      var path, transport, eth, tx, result, signedChainId, validChainId;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              path = addressToPathMap[txData.from.toLowerCase()];

              if (path) {
                _context3.next = 3;
                break;
              }

              throw new Error("address unknown '" + txData.from + "'");

            case 3:
              _context3.next = 5;
              return getTransport();

            case 5:
              transport = _context3.sent;
              _context3.prev = 6;
              eth = new _hwAppEth2.default(transport);
              tx = new _ethereumjsTx2.default(txData);

              // Set the EIP155 bits

              tx.raw[6] = Buffer.from([networkId]); // v
              tx.raw[7] = Buffer.from([]); // r
              tx.raw[8] = Buffer.from([]); // s

              // Pass hex-rlp to ledger for signing
              _context3.next = 14;
              return eth.signTransaction(path, tx.serialize().toString("hex"));

            case 14:
              result = _context3.sent;


              // Store signature in transaction
              tx.v = Buffer.from(result.v, "hex");
              tx.r = Buffer.from(result.r, "hex");
              tx.s = Buffer.from(result.s, "hex");

              // EIP155: v should be chain_id * 2 + {35, 36}
              signedChainId = Math.floor((tx.v[0] - 35) / 2);
              validChainId = networkId & 0xff; // FIXME this is to fixed a current workaround that app don't support > 0xff

              if (!(signedChainId !== validChainId)) {
                _context3.next = 22;
                break;
              }

              throw makeError("Invalid networkId signature returned. Expected: " + networkId + ", Got: " + signedChainId, "InvalidNetworkId");

            case 22:
              return _context3.abrupt("return", "0x" + tx.serialize().toString("hex"));

            case 23:
              _context3.prev = 23;

              transport.close();
              return _context3.finish(23);

            case 26:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this, [[6,, 23, 26]]);
    }));

    return function _signTransaction(_x2) {
      return _ref3.apply(this, arguments);
    };
  }();

  var _defaultOptions$optio = _extends({}, defaultOptions, options),
      networkId = _defaultOptions$optio.networkId,
      path = _defaultOptions$optio.path,
      askConfirm = _defaultOptions$optio.askConfirm,
      accountsLength = _defaultOptions$optio.accountsLength,
      accountsOffset = _defaultOptions$optio.accountsOffset;

  if (!allowedHdPaths.some(function (hdPref) {
    return path.startsWith(hdPref);
  })) {
    throw makeError("Ledger derivation path allowed are " + allowedHdPaths.join(", ") + ". " + path + " is not supported", "InvalidDerivationPath");
  }

  var pathComponents = obtainPathComponentsFromDerivationPath(path);

  var addressToPathMap = {};

  var subprovider = new _hookedWallet2.default({
    getAccounts: function getAccounts(callback) {
      _getAccounts().then(function (res) {
        return callback(null, Object.values(res));
      }).catch(function (err) {
        return callback(err, null);
      });
    },
    signPersonalMessage: function signPersonalMessage(txData, callback) {
      _signPersonalMessage(txData).then(function (res) {
        return callback(null, res);
      }).catch(function (err) {
        return callback(err, null);
      });
    },
    signTransaction: function signTransaction(txData, callback) {
      _signTransaction(txData).then(function (res) {
        return callback(null, res);
      }).catch(function (err) {
        return callback(err, null);
      });
    }
  });

  return subprovider;
}
//# sourceMappingURL=index.js.map