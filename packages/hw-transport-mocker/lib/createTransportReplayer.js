"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (recordStore) {
  var TransportReplayer = function (_Transport) {
    _inherits(TransportReplayer, _Transport);

    function TransportReplayer() {
      _classCallCheck(this, TransportReplayer);

      return _possibleConstructorReturn(this, (TransportReplayer.__proto__ || Object.getPrototypeOf(TransportReplayer)).apply(this, arguments));
    }

    _createClass(TransportReplayer, [{
      key: "setScrambleKey",
      value: function setScrambleKey() {}
    }, {
      key: "close",
      value: function close() {
        return Promise.resolve();
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
          return Promise.resolve(buffer);
        } catch (e) {
          if (this.debug) console.error("<= " + e);
          return Promise.reject(e);
        }
      }
    }]);

    return TransportReplayer;
  }(_hwTransport2.default);

  TransportReplayer.isSupported = function () {
    return Promise.resolve(true);
  };

  TransportReplayer.list = function () {
    return Promise.resolve([null]);
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
    return Promise.resolve(new TransportReplayer());
  };

  return TransportReplayer;
};