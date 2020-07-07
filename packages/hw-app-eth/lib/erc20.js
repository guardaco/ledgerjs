"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = exports.byContractAddress = undefined;

var _erc = require("./data/erc20.js");

var _erc2 = _interopRequireDefault(_erc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Retrieve the token information by a given contract address if any
 */
var byContractAddress = exports.byContractAddress = function byContractAddress(contract) {
  return get().byContract(asContractAddress(contract));
};

/**
 * list all the ERC20 tokens informations
 */

var list = exports.list = function list() {
  return get().list();
};

var asContractAddress = function asContractAddress(addr) {
  var a = addr.toLowerCase();
  return a.startsWith("0x") ? a : "0x" + a;
};

// this internal get() will lazy load and cache the data from the erc20 data blob
var get = function () {
  var cache = void 0;
  return function () {
    if (cache) return cache;
    var buf = Buffer.from(_erc2.default, "base64");
    var byContract = {};
    var entries = [];
    var i = 0;
    while (i < buf.length) {
      var length = buf.readUInt32BE(i);
      i += 4;
      var item = buf.slice(i, i + length);
      var j = 0;
      var tickerLength = item.readUInt8(j);
      j += 1;
      var _ticker = item.slice(j, j + tickerLength).toString("ascii");
      j += tickerLength;
      var _contractAddress = asContractAddress(item.slice(j, j + 20).toString("hex"));
      j += 20;
      var _decimals = item.readUInt32BE(j);
      j += 4;
      var _chainId = item.readUInt32BE(j);
      j += 4;
      var _signature = item.slice(j);
      var entry = {
        ticker: _ticker,
        contractAddress: _contractAddress,
        decimals: _decimals,
        chainId: _chainId,
        signature: _signature,
        data: item
      };
      entries.push(entry);
      byContract[_contractAddress] = entry;
      i += length;
    }
    var api = {
      list: function list() {
        return entries;
      },
      byContract: function (_byContract) {
        function byContract(_x) {
          return _byContract.apply(this, arguments);
        }

        byContract.toString = function () {
          return _byContract.toString();
        };

        return byContract;
      }(function (contractAddress) {
        return byContract[contractAddress];
      })
    };
    cache = api;
    return api;
  };
}();