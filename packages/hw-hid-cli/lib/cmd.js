"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var main = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var unqueue = function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var cmd, res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _hwTransportNodeHid2.default.list();

          case 2:
            _ref2 = _context2.sent;
            _ref3 = _slicedToArray(_ref2, 1);
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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var rl = _readline2.default.createInterface({
  input: process.stdin,
  output: process.stdout
});

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
//# sourceMappingURL=cmd.js.map