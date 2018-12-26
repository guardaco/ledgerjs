"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hwTransport = require("@ledgerhq/hw-transport");

var _hwTransport2 = _interopRequireDefault(_hwTransport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocket = global.WebSocket || require("ws");

/**
 * WebSocket transport implementation
 */

var WebSocketTransport = function (_Transport) {
  _inherits(WebSocketTransport, _Transport);

  _createClass(WebSocketTransport, null, [{
    key: "open",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
        var exchangeMethods;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return new Promise(function (resolve, reject) {
                  try {
                    var socket = new WebSocket(url);
                    var _exchangeMethods = {
                      resolveExchange: function resolveExchange(_b) {},
                      rejectExchange: function rejectExchange(_e) {},
                      onDisconnect: function onDisconnect() {},
                      close: function close() {
                        return socket.close();
                      },
                      send: function send(msg) {
                        return socket.send(msg);
                      }
                    };
                    socket.onopen = function () {
                      socket.send("open");
                    };
                    socket.onerror = function (e) {
                      _exchangeMethods.onDisconnect();
                      reject(e);
                    };
                    socket.onclose = function () {
                      _exchangeMethods.onDisconnect();
                      reject(new _hwTransport.TransportError("OpenFailed", "OpenFailed"));
                    };
                    socket.onmessage = function (e) {
                      if (typeof e.data !== "string") return;
                      var data = JSON.parse(e.data);
                      switch (data.type) {
                        case "opened":
                          return resolve(_exchangeMethods);
                        case "error":
                          reject(new Error(data.error));
                          return _exchangeMethods.rejectExchange(new _hwTransport.TransportError(data.error, "WSError"));
                        case "response":
                          return _exchangeMethods.resolveExchange(Buffer.from(data.data, "hex"));
                      }
                    };
                  } catch (e) {
                    reject(e);
                  }
                });

              case 2:
                exchangeMethods = _context.sent;
                return _context.abrupt("return", new WebSocketTransport(exchangeMethods));

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function open(_x) {
        return _ref.apply(this, arguments);
      }

      return open;
    }()

    // this transport is not discoverable

  }]);

  function WebSocketTransport(hook) {
    _classCallCheck(this, WebSocketTransport);

    var _this = _possibleConstructorReturn(this, (WebSocketTransport.__proto__ || Object.getPrototypeOf(WebSocketTransport)).call(this));

    _this.hook = hook;
    hook.onDisconnect = function () {
      _this.emit("disconnect");
      _this.hook.rejectExchange(new _hwTransport.TransportError("WebSocket disconnected", "WSDisconnect"));
    };
    return _this;
  }

  _createClass(WebSocketTransport, [{
    key: "exchange",
    value: function exchange(apdu) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.hook.rejectExchange = function (e) {
          return reject(e);
        };
        _this2.hook.resolveExchange = function (b) {
          return resolve(b);
        };
        _this2.hook.send(apdu.toString("hex"));
      });
    }
  }, {
    key: "setScrambleKey",
    value: function setScrambleKey() {}
  }, {
    key: "close",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.hook.close();
                return _context2.abrupt("return", new Promise(function (success) {
                  setTimeout(success, 200);
                }));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function close() {
        return _ref2.apply(this, arguments);
      }

      return close;
    }()
  }]);

  return WebSocketTransport;
}(_hwTransport2.default);

WebSocketTransport.isSupported = function () {
  return Promise.resolve(typeof WebSocket === "function");
};

WebSocketTransport.list = function () {
  return Promise.resolve([]);
};

WebSocketTransport.listen = function (_observer) {
  return {
    unsubscribe: function unsubscribe() {}
  };
};

WebSocketTransport.check = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(url) {
    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", new Promise(function (resolve, reject) {
              var socket = new WebSocket(url);
              var success = false;
              setTimeout(function () {
                socket.close();
              }, timeout);
              socket.onopen = function () {
                success = true;
                socket.close();
              };
              socket.onclose = function () {
                if (success) resolve();else {
                  reject(new _hwTransport.TransportError("failed to access WebSocketTransport(" + url + ")", "WebSocketTransportNotAccessible"));
                }
              };
              socket.onerror = function () {
                reject(new _hwTransport.TransportError("failed to access WebSocketTransport(" + url + "): error", "WebSocketTransportNotAccessible"));
              };
            }));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x2) {
    return _ref3.apply(this, arguments);
  };
}();

exports.default = WebSocketTransport;
//# sourceMappingURL=WebSocketTransport.js.map