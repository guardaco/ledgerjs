"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ips = undefined;

var _hwTransportNodeHid = require("@ledgerhq/hw-transport-node-hid");

var _hwTransportNodeHid2 = _interopRequireDefault(_hwTransportNodeHid);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _cors = require("cors");

var _cors2 = _interopRequireDefault(_cors);

var _ws = require("ws");

var _ws2 = _interopRequireDefault(_ws);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var ifaces = _os2.default.networkInterfaces();
var ips = exports.ips = Object.keys(ifaces).reduce(function (acc, ifname) {
  return acc.concat(ifaces[ifname].map(function (iface) {
    if ("IPv4" !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
    return iface.address;
  }));
}, []).filter(function (a) {
  return a;
});

var PORT = process.env.PORT || "8435";

var app = (0, _express2.default)();
var server = _http2.default.createServer(app);
var wss = new _ws2.default.Server({ server: server });

app.use((0, _cors2.default)());

app.get("/", function (req, res) {
  res.sendStatus(200);
});

var pending = false;
app.post("/", _bodyParser2.default.json(), function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var data, error, transport, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (req.body) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return", res.sendStatus(400));

          case 2:
            data = null, error = null;

            if (!pending) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", res.status(400).json({ error: "an exchange query was already pending" }));

          case 5:
            pending = true;
            _context.prev = 6;
            _context.next = 9;
            return _hwTransportNodeHid2.default.create(5000);

          case 9:
            transport = _context.sent;
            _context.prev = 10;
            _context.next = 13;
            return transport.exchange(Buffer.from(req.body.apduHex, "hex"));

          case 13:
            data = _context.sent;

          case 14:
            _context.prev = 14;

            transport.close();
            return _context.finish(14);

          case 17:
            _context.next = 22;
            break;

          case 19:
            _context.prev = 19;
            _context.t0 = _context["catch"](6);

            error = _context.t0.toString();

          case 22:
            pending = false;
            result = { data: data, error: error };

            if (data) {
              console.log("HTTP:", req.body.apduHex, "=>", data.toString("hex"));
            } else {
              console.log("HTTP:", req.body.apduHex, "=>", error);
            }
            res.json(result);

          case 26:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[6, 19], [10,, 14, 17]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

var wsIndex = 0;
var wsBusyIndex = 0;

wss.on("connection", function (ws) {
  var index = ++wsIndex;
  try {
    var transport = void 0,
        transportP = void 0;
    var destroyed = false;

    var onClose = function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!destroyed) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return");

              case 2:
                destroyed = true;

                if (!(wsBusyIndex === index)) {
                  _context2.next = 8;
                  break;
                }

                console.log("WS(" + index + "): close");
                _context2.next = 7;
                return transportP.then(function (transport) {
                  return transport.close();
                }, function () {});

              case 7:
                wsBusyIndex = 0;

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, undefined);
      }));

      return function onClose() {
        return _ref2.apply(this, arguments);
      };
    }();

    ws.on("close", onClose);

    ws.on("message", function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(apduHex) {
        var res;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!destroyed) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return");

              case 2:
                if (!(apduHex === "open")) {
                  _context3.next = 26;
                  break;
                }

                if (!wsBusyIndex) {
                  _context3.next = 8;
                  break;
                }

                ws.send(JSON.stringify({
                  error: "WebSocket is busy (previous session not closed)"
                }));
                ws.close();
                destroyed = true;
                return _context3.abrupt("return");

              case 8:
                transportP = _hwTransportNodeHid2.default.create(5000);
                wsBusyIndex = index;

                console.log("WS(" + index + "): opening...");
                _context3.prev = 11;
                _context3.next = 14;
                return transportP;

              case 14:
                transport = _context3.sent;

                transport.on("disconnect", function () {
                  return ws.close();
                });
                console.log("WS(" + index + "): opened!");
                ws.send(JSON.stringify({ type: "opened" }));
                _context3.next = 25;
                break;

              case 20:
                _context3.prev = 20;
                _context3.t0 = _context3["catch"](11);

                console.log("WS(" + index + "): open failed! " + _context3.t0);
                ws.send(JSON.stringify({
                  error: _context3.t0.message
                }));
                ws.close();

              case 25:
                return _context3.abrupt("return");

              case 26:
                if (!(wsBusyIndex !== index)) {
                  _context3.next = 29;
                  break;
                }

                console.warn("ignoring message because busy transport");
                return _context3.abrupt("return");

              case 29:
                if (transport) {
                  _context3.next = 32;
                  break;
                }

                console.warn("received message before device was opened");
                return _context3.abrupt("return");

              case 32:
                _context3.prev = 32;
                _context3.next = 35;
                return transport.exchange(Buffer.from(apduHex, "hex"));

              case 35:
                res = _context3.sent;

                console.log("WS(" + index + "): " + apduHex + " => " + res.toString("hex"));

                if (!destroyed) {
                  _context3.next = 39;
                  break;
                }

                return _context3.abrupt("return");

              case 39:
                ws.send(JSON.stringify({ type: "response", data: res.toString("hex") }));
                _context3.next = 48;
                break;

              case 42:
                _context3.prev = 42;
                _context3.t1 = _context3["catch"](32);

                console.log("WS(" + index + "): " + apduHex + " =>", _context3.t1);

                if (!destroyed) {
                  _context3.next = 47;
                  break;
                }

                return _context3.abrupt("return");

              case 47:
                ws.send(JSON.stringify({ type: "error", error: _context3.t1.message }));

              case 48:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, undefined, [[11, 20], [32, 42]]);
      }));

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    }());
  } catch (e) {
    ws.close();
  }
});

console.log("DEBUG_COMM_HTTP_PROXY=" + ["localhost"].concat(_toConsumableArray(ips)).map(function (ip) {
  return "ws://" + ip + ":" + PORT;
}).join("|"));

server.listen(PORT, function () {
  console.log("\nNano S proxy started on " + ips[0] + "\n");
});