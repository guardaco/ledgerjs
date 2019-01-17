"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * HTTP transport implementation
 */
var HttpTransport = function (_Transport) {
  (0, _inherits3.default)(HttpTransport, _Transport);
  (0, _createClass3.default)(HttpTransport, null, [{
    key: "open",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url, timeout) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return HttpTransport.check(url, timeout);

              case 2:
                return _context.abrupt("return", new HttpTransport(url));

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function open(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return open;
    }()

    // this transport is not discoverable

  }]);

  function HttpTransport(url) {
    (0, _classCallCheck3.default)(this, HttpTransport);

    var _this = (0, _possibleConstructorReturn3.default)(this, (HttpTransport.__proto__ || (0, _getPrototypeOf2.default)(HttpTransport)).call(this));

    _this.url = url;
    return _this;
  }

  (0, _createClass3.default)(HttpTransport, [{
    key: "exchange",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(apdu) {
        var response, body;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _axios2.default)({
                  method: "POST",
                  url: this.url,
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                  },
                  data: (0, _stringify2.default)({ apduHex: apdu.toString("hex") })
                });

              case 2:
                response = _context2.sent;

                if (!(response.status !== 200)) {
                  _context2.next = 5;
                  break;
                }

                throw new _hwTransport.TransportError("failed to communicate to server. code=" + response.status, "HttpTransportStatus" + response.status);

              case 5:
                _context2.next = 7;
                return response.data;

              case 7:
                body = _context2.sent;

                if (!body.error) {
                  _context2.next = 10;
                  break;
                }

                throw body.error;

              case 10:
                return _context2.abrupt("return", Buffer.from(body.data, "hex"));

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function exchange(_x3) {
        return _ref2.apply(this, arguments);
      }

      return exchange;
    }()
  }, {
    key: "setScrambleKey",
    value: function setScrambleKey() {}
  }, {
    key: "close",
    value: function close() {
      return _promise2.default.resolve();
    }
  }]);
  return HttpTransport;
}(_hwTransport2.default);

HttpTransport.isSupported = function () {
  return _promise2.default.resolve(typeof fetch === "function");
};

HttpTransport.list = function () {
  return _promise2.default.resolve([]);
};

HttpTransport.listen = function (_observer) {
  return {
    unsubscribe: function unsubscribe() {}
  };
};

HttpTransport.check = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(url) {
    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
    var response;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _axios2.default)({ url: url, timeout: timeout });

          case 2:
            response = _context3.sent;

            if (!(response.status !== 200)) {
              _context3.next = 5;
              break;
            }

            throw new _hwTransport.TransportError("failed to access HttpTransport(" + url + "): status " + response.status, "HttpTransportNotAccessible");

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x4) {
    return _ref3.apply(this, arguments);
  };
}();

exports.default = HttpTransport;