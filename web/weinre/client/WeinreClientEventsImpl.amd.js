;modjewel.define("weinre/client/WeinreClientEventsImpl", function(require, exports, module) { var Callback, Weinre, WeinreClientEventsImpl, WeinreExtraTargetEventsImpl, titleConnectedPrefix, titleNotConnected;

Callback = require('../common/Callback');

Weinre = require('../common/Weinre');

WeinreExtraTargetEventsImpl = require('./WeinreExtraTargetEventsImpl');

titleNotConnected = "weinre: target not connected";

titleConnectedPrefix = "weinre: ";

document.title = titleNotConnected;

module.exports = WeinreClientEventsImpl = (function() {

  function WeinreClientEventsImpl(client) {
    this.client = client;
  }

  WeinreClientEventsImpl.prototype.clientRegistered = function(clientDescription) {
    if (this.client.uiAvailable()) {
      return WebInspector.panels.remote.addClient(clientDescription);
    }
  };

  WeinreClientEventsImpl.prototype.targetRegistered = function(targetDescription) {
    if (this.client.uiAvailable()) {
      WebInspector.panels.remote.addTarget(targetDescription);
    }
    if (!Weinre.client.autoConnect()) return;
    if (!Weinre.messageDispatcher) return;
    return Weinre.WeinreClientCommands.connectTarget(Weinre.messageDispatcher.channel, targetDescription.channel);
  };

  WeinreClientEventsImpl.prototype.clientUnregistered = function(clientChannel) {
    if (this.client.uiAvailable()) {
      return WebInspector.panels.remote.removeClient(clientChannel);
    }
  };

  WeinreClientEventsImpl.prototype.targetUnregistered = function(targetChannel) {
    if (this.client.uiAvailable()) {
      return WebInspector.panels.remote.removeTarget(targetChannel);
    }
  };

  WeinreClientEventsImpl.prototype.connectionCreated = function(clientChannel, targetChannel) {
    var target;
    if (!this.client.uiAvailable()) return;
    WebInspector.panels.remote.setClientState(clientChannel, "connected");
    WebInspector.panels.remote.setTargetState(targetChannel, "connected");
    if (clientChannel !== Weinre.messageDispatcher.channel) return;
    WebInspector.panels.elements.reset();
    WebInspector.panels.timeline._clearPanel();
    WebInspector.panels.resources.reset();
    target = WebInspector.panels.remote.getTarget(targetChannel);
    if (!target) return;
    document.title = titleConnectedPrefix + target.url;
    WebInspector.inspectedURLChanged(target.url);
    return Weinre.WeinreExtraClientCommands.getDatabases(function(databaseRecords) {
      return WeinreExtraTargetEventsImpl.addDatabaseRecords(databaseRecords);
    });
  };

  WeinreClientEventsImpl.prototype.connectionDestroyed = function(clientChannel, targetChannel) {
    var nextTargetChannel;
    if (!this.client.uiAvailable()) return;
    WebInspector.panels.remote.setClientState(clientChannel, "not-connected");
    WebInspector.panels.remote.setTargetState(targetChannel, "not-connected");
    if (clientChannel !== Weinre.messageDispatcher.channel) return;
    document.title = titleNotConnected;
    if (!Weinre.client.autoConnect()) return;
    if (!this.client.uiAvailable()) return;
    nextTargetChannel = WebInspector.panels.remote.getNewestTargetChannel(targetChannel);
    if (!nextTargetChannel) return;
    Weinre.WeinreClientCommands.connectTarget(Weinre.messageDispatcher.channel, nextTargetChannel);
    return Weinre.logInfo("autoconnecting to " + nextTargetChannel);
  };

  WeinreClientEventsImpl.prototype.sendCallback = function(callbackId, result) {
    return Callback.invoke(callbackId, result);
  };

  WeinreClientEventsImpl.prototype.serverProperties = function(properties) {
    if (this.client.uiAvailable()) {
      return WebInspector.panels.remote.setServerProperties(properties);
    }
  };

  return WeinreClientEventsImpl;

})();

require("../common/MethodNamer").setNamesForClass(module.exports);

});