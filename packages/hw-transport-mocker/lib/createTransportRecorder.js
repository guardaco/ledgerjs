"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (DecoratedTransport, recordStore) {
  var TransportRecorder = function (_Transport) {
    (0, _inherits3.default)(TransportRecorder, _Transport);
    (0, _createClass3.default)(TransportRecorder, [{
      key: "setScrambleKey",
      value: function setScrambleKey() {}
    }, {
      key: "close",
      value: function close() {
        return this.transport.close();
      }
    }]);

    function TransportRecorder(t) {
      (0, _classCallCheck3.default)(this, TransportRecorder);

      var _this = (0, _possibleConstructorReturn3.default)(this, (TransportRecorder.__proto__ || (0, _getPrototypeOf2.default)(TransportRecorder)).call(this));

      _this.transport = t;
      return _this;
    }

    (0, _createClass3.default)(TransportRecorder, [{
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