"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusCodes = exports.DBNotReset = exports.DBWrongPassword = exports.NoDBPathGiven = exports.FirmwareOrAppUpdateRequired = exports.LedgerAPI5xx = exports.LedgerAPI4xx = exports.GenuineCheckFailed = exports.PairingFailed = exports.SyncError = exports.FeeRequired = exports.FeeNotLoaded = exports.CantScanQRCode = exports.ETHAddressNonEIP = exports.WrongDeviceForAccount = exports.WebsocketConnectionFailed = exports.WebsocketConnectionError = exports.DeviceShouldStayInApp = exports.TransportInterfaceNotAvailable = exports.TransportOpenUserCancelled = exports.UserRefusedOnDevice = exports.UserRefusedAllowManager = exports.UserRefusedFirmwareUpdate = exports.UserRefusedAddress = exports.UserRefusedDeviceNameChange = exports.UpdateYourApp = exports.UnexpectedBootloader = exports.TimeoutTagged = exports.PasswordIncorrectError = exports.PasswordsDontMatchError = exports.NotEnoughBalanceBecauseDestinationNotCreated = exports.NotEnoughBalance = exports.NoAddressesFound = exports.NetworkDown = exports.ManagerUninstallBTCDep = exports.ManagerNotEnoughSpaceError = exports.ManagerDeviceLockedError = exports.ManagerAppRelyOnBTCError = exports.ManagerAppAlreadyInstalledError = exports.LedgerAPINotAvailable = exports.LedgerAPIErrorWithMessage = exports.LedgerAPIError = exports.UnknownMCU = exports.LatestMCUInstalledError = exports.InvalidAddressBecauseDestinationIsAlsoSource = exports.InvalidAddress = exports.HardResetFail = exports.FeeEstimationFailed = exports.EthAppPleaseEnableContractData = exports.EnpointConfigError = exports.DisconnectedDeviceDuringOperation = exports.DisconnectedDevice = exports.DeviceSocketNoBulkStatus = exports.DeviceSocketFail = exports.DeviceNameInvalid = exports.DeviceHalted = exports.DeviceInOSUExpected = exports.DeviceOnDashboardExpected = exports.DeviceNotGenuineError = exports.DeviceGenuineSocketEarlyClose = exports.DeviceAppVerifyNotSupported = exports.CantOpenDevice = exports.BtcUnmatchedApp = exports.BluetoothRequired = exports.AccountNameRequiredError = exports.createCustomErrorClass = exports.deserializeError = exports.serializeError = undefined;

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

exports.TransportError = TransportError;
exports.getAltStatusMessage = getAltStatusMessage;
exports.TransportStatusError = TransportStatusError;

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.serializeError = _helpers.serializeError;
exports.deserializeError = _helpers.deserializeError;
exports.createCustomErrorClass = _helpers.createCustomErrorClass;
var AccountNameRequiredError = exports.AccountNameRequiredError = (0, _helpers.createCustomErrorClass)("AccountNameRequired");
var BluetoothRequired = exports.BluetoothRequired = (0, _helpers.createCustomErrorClass)("BluetoothRequired");
var BtcUnmatchedApp = exports.BtcUnmatchedApp = (0, _helpers.createCustomErrorClass)("BtcUnmatchedApp");
var CantOpenDevice = exports.CantOpenDevice = (0, _helpers.createCustomErrorClass)("CantOpenDevice");
var DeviceAppVerifyNotSupported = exports.DeviceAppVerifyNotSupported = (0, _helpers.createCustomErrorClass)("DeviceAppVerifyNotSupported");
var DeviceGenuineSocketEarlyClose = exports.DeviceGenuineSocketEarlyClose = (0, _helpers.createCustomErrorClass)("DeviceGenuineSocketEarlyClose");
var DeviceNotGenuineError = exports.DeviceNotGenuineError = (0, _helpers.createCustomErrorClass)("DeviceNotGenuine");
var DeviceOnDashboardExpected = exports.DeviceOnDashboardExpected = (0, _helpers.createCustomErrorClass)("DeviceOnDashboardExpected");
var DeviceInOSUExpected = exports.DeviceInOSUExpected = (0, _helpers.createCustomErrorClass)("DeviceInOSUExpected");
var DeviceHalted = exports.DeviceHalted = (0, _helpers.createCustomErrorClass)("DeviceHalted");
var DeviceNameInvalid = exports.DeviceNameInvalid = (0, _helpers.createCustomErrorClass)("DeviceNameInvalid");
var DeviceSocketFail = exports.DeviceSocketFail = (0, _helpers.createCustomErrorClass)("DeviceSocketFail");
var DeviceSocketNoBulkStatus = exports.DeviceSocketNoBulkStatus = (0, _helpers.createCustomErrorClass)("DeviceSocketNoBulkStatus");
var DisconnectedDevice = exports.DisconnectedDevice = (0, _helpers.createCustomErrorClass)("DisconnectedDevice");
var DisconnectedDeviceDuringOperation = exports.DisconnectedDeviceDuringOperation = (0, _helpers.createCustomErrorClass)("DisconnectedDeviceDuringOperation");
var EnpointConfigError = exports.EnpointConfigError = (0, _helpers.createCustomErrorClass)("EnpointConfig");
var EthAppPleaseEnableContractData = exports.EthAppPleaseEnableContractData = (0, _helpers.createCustomErrorClass)("EthAppPleaseEnableContractData");
var FeeEstimationFailed = exports.FeeEstimationFailed = (0, _helpers.createCustomErrorClass)("FeeEstimationFailed");
var HardResetFail = exports.HardResetFail = (0, _helpers.createCustomErrorClass)("HardResetFail");
var InvalidAddress = exports.InvalidAddress = (0, _helpers.createCustomErrorClass)("InvalidAddress");
var InvalidAddressBecauseDestinationIsAlsoSource = exports.InvalidAddressBecauseDestinationIsAlsoSource = (0, _helpers.createCustomErrorClass)("InvalidAddressBecauseDestinationIsAlsoSource");
var LatestMCUInstalledError = exports.LatestMCUInstalledError = (0, _helpers.createCustomErrorClass)("LatestMCUInstalledError");
var UnknownMCU = exports.UnknownMCU = (0, _helpers.createCustomErrorClass)("UnknownMCU");
var LedgerAPIError = exports.LedgerAPIError = (0, _helpers.createCustomErrorClass)("LedgerAPIError");
var LedgerAPIErrorWithMessage = exports.LedgerAPIErrorWithMessage = (0, _helpers.createCustomErrorClass)("LedgerAPIErrorWithMessage");
var LedgerAPINotAvailable = exports.LedgerAPINotAvailable = (0, _helpers.createCustomErrorClass)("LedgerAPINotAvailable");
var ManagerAppAlreadyInstalledError = exports.ManagerAppAlreadyInstalledError = (0, _helpers.createCustomErrorClass)("ManagerAppAlreadyInstalled");
var ManagerAppRelyOnBTCError = exports.ManagerAppRelyOnBTCError = (0, _helpers.createCustomErrorClass)("ManagerAppRelyOnBTC");
var ManagerDeviceLockedError = exports.ManagerDeviceLockedError = (0, _helpers.createCustomErrorClass)("ManagerDeviceLocked");
var ManagerNotEnoughSpaceError = exports.ManagerNotEnoughSpaceError = (0, _helpers.createCustomErrorClass)("ManagerNotEnoughSpace");
var ManagerUninstallBTCDep = exports.ManagerUninstallBTCDep = (0, _helpers.createCustomErrorClass)("ManagerUninstallBTCDep");
var NetworkDown = exports.NetworkDown = (0, _helpers.createCustomErrorClass)("NetworkDown");
var NoAddressesFound = exports.NoAddressesFound = (0, _helpers.createCustomErrorClass)("NoAddressesFound");
var NotEnoughBalance = exports.NotEnoughBalance = (0, _helpers.createCustomErrorClass)("NotEnoughBalance");
var NotEnoughBalanceBecauseDestinationNotCreated = exports.NotEnoughBalanceBecauseDestinationNotCreated = (0, _helpers.createCustomErrorClass)("NotEnoughBalanceBecauseDestinationNotCreated");
var PasswordsDontMatchError = exports.PasswordsDontMatchError = (0, _helpers.createCustomErrorClass)("PasswordsDontMatch");
var PasswordIncorrectError = exports.PasswordIncorrectError = (0, _helpers.createCustomErrorClass)("PasswordIncorrect");
var TimeoutTagged = exports.TimeoutTagged = (0, _helpers.createCustomErrorClass)("TimeoutTagged");
var UnexpectedBootloader = exports.UnexpectedBootloader = (0, _helpers.createCustomErrorClass)("UnexpectedBootloader");
var UpdateYourApp = exports.UpdateYourApp = (0, _helpers.createCustomErrorClass)("UpdateYourApp");
var UserRefusedDeviceNameChange = exports.UserRefusedDeviceNameChange = (0, _helpers.createCustomErrorClass)("UserRefusedDeviceNameChange");
var UserRefusedAddress = exports.UserRefusedAddress = (0, _helpers.createCustomErrorClass)("UserRefusedAddress");
var UserRefusedFirmwareUpdate = exports.UserRefusedFirmwareUpdate = (0, _helpers.createCustomErrorClass)("UserRefusedFirmwareUpdate");
var UserRefusedAllowManager = exports.UserRefusedAllowManager = (0, _helpers.createCustomErrorClass)("UserRefusedAllowManager");
var UserRefusedOnDevice = exports.UserRefusedOnDevice = (0, _helpers.createCustomErrorClass)("UserRefusedOnDevice"); // TODO rename because it's just for transaction refusal
var TransportOpenUserCancelled = exports.TransportOpenUserCancelled = (0, _helpers.createCustomErrorClass)("TransportOpenUserCancelled");
var TransportInterfaceNotAvailable = exports.TransportInterfaceNotAvailable = (0, _helpers.createCustomErrorClass)("TransportInterfaceNotAvailable");
var DeviceShouldStayInApp = exports.DeviceShouldStayInApp = (0, _helpers.createCustomErrorClass)("DeviceShouldStayInApp");
var WebsocketConnectionError = exports.WebsocketConnectionError = (0, _helpers.createCustomErrorClass)("WebsocketConnectionError");
var WebsocketConnectionFailed = exports.WebsocketConnectionFailed = (0, _helpers.createCustomErrorClass)("WebsocketConnectionFailed");
var WrongDeviceForAccount = exports.WrongDeviceForAccount = (0, _helpers.createCustomErrorClass)("WrongDeviceForAccount");
var ETHAddressNonEIP = exports.ETHAddressNonEIP = (0, _helpers.createCustomErrorClass)("ETHAddressNonEIP");
var CantScanQRCode = exports.CantScanQRCode = (0, _helpers.createCustomErrorClass)("CantScanQRCode");
var FeeNotLoaded = exports.FeeNotLoaded = (0, _helpers.createCustomErrorClass)("FeeNotLoaded");
var FeeRequired = exports.FeeRequired = (0, _helpers.createCustomErrorClass)("FeeRequired");
var SyncError = exports.SyncError = (0, _helpers.createCustomErrorClass)("SyncError");
var PairingFailed = exports.PairingFailed = (0, _helpers.createCustomErrorClass)("PairingFailed");
var GenuineCheckFailed = exports.GenuineCheckFailed = (0, _helpers.createCustomErrorClass)("GenuineCheckFailed");
var LedgerAPI4xx = exports.LedgerAPI4xx = (0, _helpers.createCustomErrorClass)("LedgerAPI4xx");
var LedgerAPI5xx = exports.LedgerAPI5xx = (0, _helpers.createCustomErrorClass)("LedgerAPI5xx");
var FirmwareOrAppUpdateRequired = exports.FirmwareOrAppUpdateRequired = (0, _helpers.createCustomErrorClass)("FirmwareOrAppUpdateRequired");

// db stuff, no need to translate
var NoDBPathGiven = exports.NoDBPathGiven = (0, _helpers.createCustomErrorClass)("NoDBPathGiven");
var DBWrongPassword = exports.DBWrongPassword = (0, _helpers.createCustomErrorClass)("DBWrongPassword");
var DBNotReset = exports.DBNotReset = (0, _helpers.createCustomErrorClass)("DBNotReset");

/**
 * TransportError is used for any generic transport errors.
 * e.g. Error thrown when data received by exchanges are incorrect or if exchanged failed to communicate with the device for various reason.
 */
function TransportError(message, id) {
  this.name = "TransportError";
  this.message = message;
  this.stack = new Error().stack;
  this.id = id;
}
//$FlowFixMe
TransportError.prototype = new Error();

var StatusCodes = exports.StatusCodes = {
  PIN_REMAINING_ATTEMPTS: 0x63c0,
  INCORRECT_LENGTH: 0x6700,
  COMMAND_INCOMPATIBLE_FILE_STRUCTURE: 0x6981,
  SECURITY_STATUS_NOT_SATISFIED: 0x6982,
  CONDITIONS_OF_USE_NOT_SATISFIED: 0x6985,
  INCORRECT_DATA: 0x6a80,
  NOT_ENOUGH_MEMORY_SPACE: 0x6a84,
  REFERENCED_DATA_NOT_FOUND: 0x6a88,
  FILE_ALREADY_EXISTS: 0x6a89,
  INCORRECT_P1_P2: 0x6b00,
  INS_NOT_SUPPORTED: 0x6d00,
  CLA_NOT_SUPPORTED: 0x6e00,
  TECHNICAL_PROBLEM: 0x6f00,
  OK: 0x9000,
  MEMORY_PROBLEM: 0x9240,
  NO_EF_SELECTED: 0x9400,
  INVALID_OFFSET: 0x9402,
  FILE_NOT_FOUND: 0x9404,
  INCONSISTENT_FILE: 0x9408,
  ALGORITHM_NOT_SUPPORTED: 0x9484,
  INVALID_KCV: 0x9485,
  CODE_NOT_INITIALIZED: 0x9802,
  ACCESS_CONDITION_NOT_FULFILLED: 0x9804,
  CONTRADICTION_SECRET_CODE_STATUS: 0x9808,
  CONTRADICTION_INVALIDATION: 0x9810,
  CODE_BLOCKED: 0x9840,
  MAX_VALUE_REACHED: 0x9850,
  GP_AUTH_FAILED: 0x6300,
  LICENSING: 0x6f42,
  HALTED: 0x6faa
};

function getAltStatusMessage(code) {
  switch (code) {
    // improve text of most common errors
    case 0x6700:
      return "Incorrect length";
    case 0x6982:
      return "Security not satisfied (dongle locked or have invalid access rights)";
    case 0x6985:
      return "Condition of use not satisfied (denied by the user?)";
    case 0x6a80:
      return "Invalid data received";
    case 0x6b00:
      return "Invalid parameter received";
  }
  if (0x6f00 <= code && code <= 0x6fff) {
    return "Internal error, please report";
  }
}

/**
 * Error thrown when a device returned a non success status.
 * the error.statusCode is one of the `StatusCodes` exported by this library.
 */
function TransportStatusError(statusCode) {
  this.name = "TransportStatusError";
  var statusText = (0, _keys2.default)(StatusCodes).find(function (k) {
    return StatusCodes[k] === statusCode;
  }) || "UNKNOWN_ERROR";
  var smsg = getAltStatusMessage(statusCode) || statusText;
  var statusCodeStr = statusCode.toString(16);
  this.message = "Ledger device: " + smsg + " (0x" + statusCodeStr + ")";
  this.stack = new Error().stack;
  this.statusCode = statusCode;
  this.statusText = statusText;
}
//$FlowFixMe
TransportStatusError.prototype = new Error();