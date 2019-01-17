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

exports.default = function (DecoratedTransport, recordStore) {
  var TransportRecorder = function (_Transport) {
    _inherits(TransportRecorder, _Transport);

    _createClass(TransportRecorder, [{
      key: "setScrambleKey",
      value: function setScrambleKey() {}
    }, {
      key: "close",
      value: function close() {
        return this.transport.close();
      }
    }]);

    function TransportRecorder(t) {
      _classCallCheck(this, TransportRecorder);

      var _this = _possibleConstructorReturn(this, (TransportRecorder.__proto__ || Object.getPrototypeOf(TransportRecorder)).call(this));

      _this.transport = t;
      return _this;
    }

    _createClass(TransportRecorder, [{
      key: "exchange",
      value: function exchange(apdu) {
        var output = this.transport.exchange(apdu);
        output.then(function (out) {
          recordStore.recordExchange(apdu, out);
        });
        return output;
      }
    }]);

    return TransportRecorder;
  }(_hwTransport2.default);

  TransportRecorder.isSupported = DecoratedTransport.isSupported;
  TransportRecorder.list = DecoratedTransport.list;
  TransportRecorder.listen = DecoratedTransport.listen;

  TransportRecorder.open = function () {
    return DecoratedTransport.open.apply(DecoratedTransport, arguments).then(function (t) {
      return new TransportRecorder(t);
    });
  };

  return TransportRecorder;
};