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

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _HttpTransport = require("./HttpTransport");

var _HttpTransport2 = _interopRequireDefault(_HttpTransport);

var _WebSocketTransport = require("./WebSocketTransport");

var _WebSocketTransport2 = _interopRequireDefault(_WebSocketTransport);

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getTransport = function getTransport(url) {
  return !url.startsWith("ws") ? _HttpTransport2.default : _WebSocketTransport2.default;
};


var inferURLs = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(urls) {
    var r;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return typeof urls === "function" ? urls() : urls;

          case 2:
            r = _context.sent;
            return _context.abrupt("return", typeof r === "string" ? [r] : r);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function inferURLs(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = function (urls) {
  var StaticTransport = function (_Transport) {
    (0, _inherits3.default)(StaticTransport, _Transport);

    function StaticTransport() {
      (0, _classCallCheck3.default)(this, StaticTransport);
      return (0, _possibleConstructorReturn3.default)(this, (StaticTransport.__proto__ || (0, _getPrototypeOf2.default)(StaticTransport)).apply(this, arguments));
    }

    return StaticTransport;
  }(_hwTransport2.default);

  StaticTransport.isSupported = _HttpTransport2.default.isSupported;

  StaticTransport.list = function () {
    return inferURLs(urls).then(function (urls) {
      return _promise2.default.all(urls.map(function (url) {
        return getTransport(url).check(url).then(function () {
          return [url];
        }).catch(function () {
          return [];
        });
      }));
    }).then(function (arrs) {
      return arrs.reduce(function (acc, a) {
        return acc.concat(a);
      }, []);
    });
  };

  StaticTransport.listen = function (observer) {
    var unsubscribed = false;
    var seen = {};
    function checkLoop() {
      var _this2 = this;

      if (unsubscribed) return;
      inferURLs(urls).then(function (urls) {
        return _promise2.default.all(urls.map(function () {
          var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(url) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!unsubscribed) {
                      _context2.next = 2;
                      break;
                    }

                    return _context2.abrupt("return");

                  case 2:
                    _context2.prev = 2;
                    _context2.next = 5;
                    return getTransport(url).check(url);

                  case 5:
                    if (!unsubscribed) {
                      _context2.next = 7;
                      break;
                    }

                    return _context2.abrupt("return");

                  case 7:
                    if (!seen[url]) {
                      seen[url] = 1;
                      observer.next({ type: "add", descriptor: url });
                    }
                    _context2.next = 13;
                    break;

                  case 10:
                    _context2.prev = 10;
                    _context2.t0 = _context2["catch"](2);

                    // nothing
                    if (seen[url]) {
                      delete seen[url];
                      observer.next({ type: "remove", descriptor: url });
                    }

                  case 13:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2, _this2, [[2, 10]]);
          }));

          return function (_x2) {
            return _ref2.apply(this, arguments);
          };
        }()));
      }).then(function () {
        return new _promise2.default(function (success) {
          return setTimeout(success, 5000);
        });
      }).then(checkLoop);
    }
    checkLoop();
    return {
      unsubscribe: function unsubscribe() {
        unsubscribed = true;
      }
    };
  };

  StaticTransport.open = function (url) {
    return getTransport(url).open(url);
  };

  return StaticTransport;
};