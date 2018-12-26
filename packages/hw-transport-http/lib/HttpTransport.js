"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * HTTP transport implementation
 */
var HttpTransport = function (_Transport) {
  _inherits(HttpTransport, _Transport);

  _createClass(HttpTransport, null, [{
    key: "open",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, timeout) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
    _classCallCheck(this, HttpTransport);

    var _this = _possibleConstructorReturn(this, (HttpTransport.__proto__ || Object.getPrototypeOf(HttpTransport)).call(this));

    _this.url = url;
    return _this;
  }

  _createClass(HttpTransport, [{
    key: "exchange",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(apdu) {
        var response, body;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
                  data: JSON.stringify({ apduHex: apdu.toString("hex") })
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
      return Promise.resolve();
    }
  }]);

  return HttpTransport;
}(_hwTransport2.default);

HttpTransport.isSupported = function () {
  return Promise.resolve(typeof fetch === "function");
};

HttpTransport.list = function () {
  return Promise.resolve([]);
};

HttpTransport.listen = function (_observer) {
  return {
    unsubscribe: function unsubscribe() {}
  };
};

HttpTransport.check = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(url) {
    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
    var response;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
//# sourceMappingURL=HttpTransport.js.map