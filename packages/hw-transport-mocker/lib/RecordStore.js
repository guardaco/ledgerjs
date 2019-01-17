"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RecordStore = function () {
  function RecordStore() {
    _classCallCheck(this, RecordStore);

    this.cache = {};
  }

  _createClass(RecordStore, [{
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