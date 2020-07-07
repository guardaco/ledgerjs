"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInfosForServiceUuid = exports.getBluetoothServiceUuids = exports.identifyProductName = exports.identifyUSBProductId = exports.getDeviceModel = exports.ledgerUSBVendorId = exports.IIWebUSB = exports.IICCID = exports.IIU2F = exports.IIKeyboardHID = exports.IIGenericHID = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _values = require("babel-runtime/core-js/object/values");

var _values2 = _interopRequireDefault(_values);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The USB product IDs will be defined as MMII, encoding a model (MM) and an interface bitfield (II)
 *
 ** Model
 * Ledger Nano S : 0x10
 * Ledger Blue : 0x00
 * Ledger Nano X : 0x40
 *
 ** Interface support bitfield
 * Generic HID : 0x01
 * Keyboard HID : 0x02
 * U2F : 0x04
 * CCID : 0x08
 * WebUSB : 0x10
 */

var IIGenericHID = exports.IIGenericHID = 0x01;
var IIKeyboardHID = exports.IIKeyboardHID = 0x02;
var IIU2F = exports.IIU2F = 0x04;
var IICCID = exports.IICCID = 0x08;
var IIWebUSB = exports.IIWebUSB = 0x10;

var devices = {
  blue: {
    id: "blue",
    productName: "Ledger Blue",
    productIdMM: 0x00,
    legacyUsbProductId: 0x0000,
    usbOnly: true,
    memorySize: 480 * 1024,
    blockSize: 4 * 1024
  },
  nanoS: {
    id: "nanoS",
    productName: "Ledger Nano S",
    productIdMM: 0x10,
    legacyUsbProductId: 0x0001,
    usbOnly: true,
    memorySize: 320 * 1024,
    blockSize: 4 * 1024
  },
  nanoX: {
    id: "nanoX",
    productName: "Ledger Nano X",
    productIdMM: 0x40,
    legacyUsbProductId: 0x0004,
    usbOnly: false,
    memorySize: 2 * 1024 * 1024,
    blockSize: 4 * 1024,
    bluetoothSpec: [{
      // this is the legacy one (prototype version). we will eventually drop it.
      serviceUuid: "d973f2e0-b19e-11e2-9e96-0800200c9a66",
      notifyUuid: "d973f2e1-b19e-11e2-9e96-0800200c9a66",
      writeUuid: "d973f2e2-b19e-11e2-9e96-0800200c9a66"
    }, {
      serviceUuid: "13d63400-2c97-0004-0000-4c6564676572",
      notifyUuid: "13d63400-2c97-0004-0001-4c6564676572",
      writeUuid: "13d63400-2c97-0004-0002-4c6564676572"
    }]
  }
};

var productMap = {
  Blue: "blue",
  "Nano S": "nanoS",
  "Nano X": "nanoX"
};

// $FlowFixMe
var devicesList = (0, _values2.default)(devices);

/**
 *
 */
var ledgerUSBVendorId = exports.ledgerUSBVendorId = 0x2c97;

/**
 *
 */
var getDeviceModel = exports.getDeviceModel = function getDeviceModel(id) {
  var info = devices[id];
  if (!info) throw new Error("device '" + id + "' does not exist");
  return info;
};

/**
 *
 */
var identifyUSBProductId = exports.identifyUSBProductId = function identifyUSBProductId(usbProductId) {
  var legacy = devicesList.find(function (d) {
    return d.legacyUsbProductId === usbProductId;
  });
  if (legacy) return legacy;

  var mm = usbProductId >> 8;
  var deviceModel = devicesList.find(function (d) {
    return d.productIdMM === mm;
  });
  return deviceModel;
};

var identifyProductName = exports.identifyProductName = function identifyProductName(productName) {
  var productId = productMap[productName];
  var deviceModel = devicesList.find(function (d) {
    return d.id === productId;
  });

  return deviceModel;
};

var bluetoothServices = [];
var serviceUuidToInfos = {};

for (var _id in devices) {
  var _deviceModel = devices[_id];
  var _bluetoothSpec = _deviceModel.bluetoothSpec;

  if (_bluetoothSpec) {
    for (var i = 0; i < _bluetoothSpec.length; i++) {
      var spec = _bluetoothSpec[i];
      bluetoothServices.push(spec.serviceUuid);
      serviceUuidToInfos[spec.serviceUuid] = serviceUuidToInfos[spec.serviceUuid.replace(/-/g, "")] = (0, _extends3.default)({ deviceModel: _deviceModel }, spec);
    }
  }
}

/**
 *
 */
var getBluetoothServiceUuids = exports.getBluetoothServiceUuids = function getBluetoothServiceUuids() {
  return bluetoothServices;
};

/**
 *
 */
var getInfosForServiceUuid = exports.getInfosForServiceUuid = function getInfosForServiceUuid(uuid) {
  return serviceUuidToInfos[uuid.toLowerCase()];
};

/**
 *
 */


/**
 *
 */


/**
 *
 */