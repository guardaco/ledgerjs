"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RecordStore = function () {
  function RecordStore() {
    (0, _classCallCheck3.default)(this, RecordStore);
    this.cache = {};
  }

  (0, _createClass3.default)(RecordStore, [{
    key: "recordExchange",
    value: function recordExchange(apdu, out) {
      var cache = this.cache;

      var apduHex = apdu.toString("hex");
      var outHex = out.toString("hex");
      if (apduHex in cache && cache[apduHex] !== outHex) {
        console.warn("Found 2 same APDUs with different result. this can lead to mock issues.\nAPDU=" + apduHex);
      }
      cache[apduHex] = outHex;
    }
  }, {
    key: "reverseExchange",
    value: function reverseExchange(apdu) {
      var cache = this.cache;

      var apduHex = apdu.toString("hex");
      if (!(apduHex in cache)) {
        throw new Error("RecordStore missing cache for apdu=" + apduHex);
      }
      return Buffer.from(cache[apduHex], "hex");
    }
  }, {
    key: "toObject",
    value: function toObject() {
      var cache = this.cache;

      return { cache: cache };
    }
  }], [{
    key: "fromObject",
    value: function fromObject(obj) {
      var recordStore = new RecordStore();
      if (!obj.cache) {
        throw new Error("invalid json provided to RecordStore");
      }
      recordStore.cache = obj.cache;
      return recordStore;
    }
  }]);
  return RecordStore;
}();

exports.default = RecordStore;