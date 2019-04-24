"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInfosForServiceUuid = exports.getBluetoothServiceUuids = exports.identifyUSBProductId = exports.getDeviceModel = exports.ledgerUSBVendorId = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _values = require("babel-runtime/core-js/object/values");

var _values2 = _interopRequireDefault(_values);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var devices = {
  blue: {
    id: "blue",
    productName: "Ledger Blue",
    usbProductId: 0x0000,
    usbOnly: true
  },
  nanoS: {
    id: "nanoS",
    productName: "Ledger Nano S",
    usbProductId: 0x0001,
    usbOnly: true
  },
  nanoX: {
    id: "nanoX",
    productName: "Ledger Nano X",
    usbProductId: 0x0004,
    usbOnly: false,
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
  return devicesList.find(function (d) {
    return d.usbProductId === usbProductId;
  });
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
      serviceUuidToInfos[spec.serviceUuid] = (0, _extends3.default)({ deviceModel: _deviceModel }, spec);
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