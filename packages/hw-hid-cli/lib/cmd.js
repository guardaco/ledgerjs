"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var unqueue = function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var cmd, res;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!unqueueRunning) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                unqueueRunning = true;
                _context.prev = 3;

              case 4:
                if (!queue.length) {
                  _context.next = 12;
                  break;
                }

                cmd = queue.shift();
                _context.next = 8;
                return transport.exchange(cmd);

              case 8:
                res = _context.sent;

                console.log(res.toString("hex"));
                _context.next = 4;
                break;

              case 12:
                _context.next = 18;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](3);

                console.error("transport.exchange failed", _context.t0);
                process.exit(1);

              case 18:
                unqueueRunning = false;

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[3, 14]]);
      }));

      return function unqueue() {
        return _ref4.apply(this, arguments);
      };
    }();

    var _ref2, _ref3, descriptor, transport, queue, unqueueRunning;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _hwTransportNodeHid2.default.list();

          case 2:
            _ref2 = _context2.sent;
            _ref3 = (0, _slicedToArray3.default)(_ref2, 1);
            descriptor = _ref3[0];

            if (descriptor) {
              _context2.next = 7;
              break;
            }

            throw new Error("no device found");

          case 7:
            _context2.next = 9;
            return _hwTransportNodeHid2.default.open(descriptor);

          case 9:
            transport = _context2.sent;
            queue = [], unqueueRunning = false;

            rl.on("line", function (input) {
              input.split("\n").forEach(function (line) {
                return queue.push(Buffer.from(line, "hex"));
              });
              unqueue();
            });

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var _hwTransportNodeHid = require("@ledgerhq/hw-transport-node-hid");

var _hwTransportNodeHid2 = _interopRequireDefault(_hwTransportNodeHid);

var _readline = require("readline");

var _readline2 = _interopRequireDefault(_readline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rl = _readline2.default.createInterface({
  input: process.stdin,
  output: process.stdout
});

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});