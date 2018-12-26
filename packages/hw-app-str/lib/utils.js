"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.splitPath = splitPath;
exports.foreach = foreach;
exports.crc16xmodem = crc16xmodem;
exports.encodeEd25519PublicKey = encodeEd25519PublicKey;
exports.verifyEd25519Signature = verifyEd25519Signature;
exports.hash = hash;
exports.checkStellarBip32Path = checkStellarBip32Path;

var _base = require("base32.js");

var _base2 = _interopRequireDefault(_base);

var _tweetnacl = require("tweetnacl");

var _tweetnacl2 = _interopRequireDefault(_tweetnacl);

var _sha = require("sha.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO use bip32-path library
function splitPath(path) {
  var result = [];
  var components = path.split("/");
  components.forEach(function (element) {
    var number = parseInt(element, 10);
    if (isNaN(number)) {
      return; // FIXME shouldn't it throws instead?
    }
    if (element.length > 1 && element[element.length - 1] === "'") {
      number += 0x80000000;
    }
    result.push(number);
  });
  return result;
} /********************************************************************************
   *   Ledger Node JS API
   *   (c) 2017-2018 Ledger
   *
   *  Licensed under the Apache License, Version 2.0 (the "License");
   *  you may not use this file except in compliance with the License.
   *  You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   *  Unless required by applicable law or agreed to in writing, software
   *  distributed under the License is distributed on an "AS IS" BASIS,
   *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *  See the License for the specific language governing permissions and
   *  limitations under the License.
   ********************************************************************************/


function foreach(arr, callback) {
  function iterate(index, array, result) {
    if (index >= array.length) {
      return result;
    } else {
      return callback(array[index], index).then(function (res) {
        result.push(res);
        return iterate(index + 1, array, result);
      });
    }
  }
  return Promise.resolve().then(function () {
    return iterate(0, arr, []);
  });
}

function crc16xmodem(buf, previous) {
  var crc = typeof previous !== "undefined" ? ~~previous : 0x0;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    var code = crc >>> 8 & 0xff;

    code ^= byte & 0xff;
    code ^= code >>> 4;
    crc = crc << 8 & 0xffff;
    crc ^= code;
    code = code << 5 & 0xffff;
    crc ^= code;
    code = code << 7 & 0xffff;
    crc ^= code;
  }

  return crc;
}

function encodeEd25519PublicKey(rawPublicKey) {
  var versionByte = 6 << 3; // 'G'
  var data = Buffer.from(rawPublicKey);
  var versionBuffer = Buffer.from([versionByte]);
  var payload = Buffer.concat([versionBuffer, data]);
  var checksum = Buffer.alloc(2);
  checksum.writeUInt16LE(crc16xmodem(payload), 0);
  var unencoded = Buffer.concat([payload, checksum]);
  return _base2.default.encode(unencoded);
}

function verifyEd25519Signature(data, signature, publicKey) {
  return _tweetnacl2.default.sign.detached.verify(new Uint8Array(data.toJSON().data), new Uint8Array(signature.toJSON().data), new Uint8Array(publicKey.toJSON().data));
}

function hash(data) {
  var hasher = new _sha.sha256();
  hasher.update(data, "utf8");
  return hasher.digest();
}

function checkStellarBip32Path(path) {
  path.split("/").forEach(function (element) {
    if (!element.toString().endsWith("'")) {
      throw new Error("Detected a non-hardened path element in requested BIP32 path." + " Non-hardended paths are not supported at this time. Please use an all-hardened path." + " Example: 44'/148'/0'");
    }
  });
}
//# sourceMappingURL=utils.js.map