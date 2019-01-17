"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (recordStore) {
  var TransportReplayer = function (_Transport) {
    (0, _inherits3.default)(TransportReplayer, _Transport);

    function TransportReplayer() {
      (0, _classCallCheck3.default)(this, TransportReplayer);
      return (0, _possibleConstructorReturn3.default)(this, (TransportReplayer.__proto__ || (0, _getPrototypeOf2.default)(TransportReplayer)).apply(this, arguments));
    }

    (0, _createClass3.default)(TransportReplayer, [{
      key: "setScrambleKey",
      value: function setScrambleKey() {}
    }, {
      key: "close",
      value: function close() {
        return _promise2.default.resolve();
      }
    }, {
      key: "exchange",
      value: function exchange(apdu) {
        if (this.debug) {
          console.log("=> " + apdu.toString("hex"));
        }
        try {
          var buffer = recordStore.reverseExchange(apdu);
          if (this.debug) console.error("<= " + buffer.toString("hex"));
          return _promise2.default.resolve(buffer);
        } catch (e) {
          if (this.debug) console.error("<= " + e);
          return _promise2.default.reject(e);
        }
      }
    }]);
    return TransportReplayer;
  }(_hwTransport2.default);

  TransportReplayer.isSupported = function () {
    return _promise2.default.resolve(true);
  };

  TransportReplayer.list = function () {
    return _promise2.default.resolve([null]);
  };

  TransportReplayer.listen = function (o) {
    var unsubscribed = void 0;
    setTimeout(function () {
      if (unsubscribed) return;
      o.next({ type: "add", descriptor: null });
      o.complete();
    }, 0);
    return {
      unsubscribe: function unsubscribe() {
        unsubscribed = true;
      }
    };
  };

  TransportReplayer.open = function () {
    return _promise2.default.resolve(new TransportReplayer());
  };

  return TransportReplayer;
};