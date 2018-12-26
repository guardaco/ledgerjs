"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _HttpTransport = require("./HttpTransport");

var _HttpTransport2 = _interopRequireDefault(_HttpTransport);

var _WebSocketTransport = require("./WebSocketTransport");

var _WebSocketTransport2 = _interopRequireDefault(_WebSocketTransport);

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var getTransport = function getTransport(url) {
  return !url.startsWith("ws") ? _HttpTransport2.default : _WebSocketTransport2.default;
};

var inferURLs = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(urls) {
    var r;
    return regeneratorRuntime.wrap(function _callee$(_context) {
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
    _inherits(StaticTransport, _Transport);

    function StaticTransport() {
      _classCallCheck(this, StaticTransport);

      return _possibleConstructorReturn(this, (StaticTransport.__proto__ || Object.getPrototypeOf(StaticTransport)).apply(this, arguments));
    }

    return StaticTransport;
  }(_hwTransport2.default);

  StaticTransport.isSupported = _HttpTransport2.default.isSupported;

  StaticTransport.list = function () {
    return inferURLs(urls).then(function (urls) {
      return Promise.all(urls.map(function (url) {
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
        return Promise.all(urls.map(function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
        return new Promise(function (success) {
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
//# sourceMappingURL=withStaticURLs.js.map