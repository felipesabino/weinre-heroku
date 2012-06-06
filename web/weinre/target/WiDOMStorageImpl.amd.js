;modjewel.define("weinre/target/WiDOMStorageImpl", function(require, exports, module) { var HookSites, Weinre, WiDOMStorageImpl, _getStorageArea, _storageEventHandler;

Weinre = require('../common/Weinre');

HookSites = require('./HookSites');

module.exports = WiDOMStorageImpl = (function() {

  function WiDOMStorageImpl() {}

  WiDOMStorageImpl.prototype.getDOMStorageEntries = function(storageId, callback) {
    var i, key, length, result, storageArea, val;
    storageArea = _getStorageArea(storageId);
    if (!storageArea) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid storageId: " + storageId);
      return;
    }
    result = [];
    length = storageArea.length;
    i = 0;
    while (i < length) {
      key = storageArea.key(i);
      val = storageArea.getItem(key);
      result.push([key, val]);
      i++;
    }
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
    }
  };

  WiDOMStorageImpl.prototype.setDOMStorageItem = function(storageId, key, value, callback) {
    var result, storageArea;
    storageArea = _getStorageArea(storageId);
    if (!storageArea) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid storageId: " + storageId);
      return;
    }
    result = true;
    try {
      HookLib.ignoreHooks(function() {
        if (storageArea === window.localStorage) {
          return localStorage.setItem(key, value);
        } else if (storageArea === window.sessionStorage) {
          return sessionStorage.setItem(key, value);
        }
      });
    } catch (e) {
      result = false;
    }
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
    }
  };

  WiDOMStorageImpl.prototype.removeDOMStorageItem = function(storageId, key, callback) {
    var result, storageArea;
    storageArea = _getStorageArea(storageId);
    if (!storageArea) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid storageId: " + storageId);
      return;
    }
    result = true;
    try {
      HookLib.ignoreHooks(function() {
        if (storageArea === window.localStorage) {
          return localStorage.removeItem(key);
        } else if (storageArea === window.sessionStorage) {
          return sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      result = false;
    }
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
    }
  };

  WiDOMStorageImpl.prototype.initialize = function() {
    if (window.localStorage) {
      Weinre.wi.DOMStorageNotify.addDOMStorage({
        id: 1,
        host: window.location.host,
        isLocalStorage: true
      });
      HookSites.LocalStorage_setItem.addHooks({
        after: function() {
          return _storageEventHandler({
            storageArea: window.localStorage
          });
        }
      });
      HookSites.LocalStorage_removeItem.addHooks({
        after: function() {
          return _storageEventHandler({
            storageArea: window.localStorage
          });
        }
      });
      HookSites.LocalStorage_clear.addHooks({
        after: function() {
          return _storageEventHandler({
            storageArea: window.localStorage
          });
        }
      });
    }
    if (window.sessionStorage) {
      Weinre.wi.DOMStorageNotify.addDOMStorage({
        id: 2,
        host: window.location.host,
        isLocalStorage: false
      });
      HookSites.SessionStorage_setItem.addHooks({
        after: function() {
          return _storageEventHandler({
            storageArea: window.sessionStorage
          });
        }
      });
      HookSites.SessionStorage_removeItem.addHooks({
        after: function() {
          return _storageEventHandler({
            storageArea: window.sessionStorage
          });
        }
      });
      HookSites.SessionStorage_clear.addHooks({
        after: function() {
          return _storageEventHandler({
            storageArea: window.sessionStorage
          });
        }
      });
    }
    return document.addEventListener("storage", _storageEventHandler, false);
  };

  return WiDOMStorageImpl;

})();

_getStorageArea = function(storageId) {
  if (storageId === 1) {
    return window.localStorage;
  } else if (storageId === 2) {
    return window.sessionStorage;
  }
  return null;
};

_storageEventHandler = function(event) {
  var storageId;
  if (event.storageArea === window.localStorage) {
    storageId = 1;
  } else if (event.storageArea === window.sessionStorage) {
    storageId = 2;
  } else {
    return;
  }
  return Weinre.wi.DOMStorageNotify.updateDOMStorage(storageId);
};

require("../common/MethodNamer").setNamesForClass(module.exports);

});