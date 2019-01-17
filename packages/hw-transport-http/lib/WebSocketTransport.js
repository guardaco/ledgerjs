"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebSocket = global.WebSocket || require("ws");

/**
 * WebSocket transport implementation
 */

var WebSocketTransport = function (_Transport) {
  (0, _inherits3.default)(WebSocketTransport, _Transport);
  (0, _createClass3.default)(WebSocketTransport, null, [{
    key: "open",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url) {
        var exchangeMethods;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return new _promise2.default(function (resolve, reject) {
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
    (0, _classCallCheck3.default)(this, WebSocketTransport);

    var _this = (0, _possibleConstructorReturn3.default)(this, (WebSocketTransport.__proto__ || (0, _getPrototypeOf2.default)(WebSocketTransport)).call(this));

    _this.hook = hook;
    hook.onDisconnect = function () {
      _this.emit("disconnect");
      _this.hook.rejectExchange(new _hwTransport.TransportError("WebSocket disconnected", "WSDisconnect"));
    };
    return _this;
  }

  (0, _createClass3.default)(WebSocketTransport, [{
    key: "exchange",
    value: function exchange(apdu) {
      var _this2 = this;

      return new _promise2.default(function (resolve, reject) {
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
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.hook.close();
                return _context2.abrupt("return", new _promise2.default(function (success) {
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
  return _promise2.default.resolve(typeof WebSocket === "function");
};

WebSocketTransport.list = function () {
  return _promise2.default.resolve([]);
};

WebSocketTransport.listen = function (_observer) {
  return {
    unsubscribe: function unsubscribe() {}
  };
};

WebSocketTransport.check = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(url) {
    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", new _promise2.default(function (resolve, reject) {
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