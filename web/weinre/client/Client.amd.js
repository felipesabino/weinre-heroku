;modjewel.define("weinre/client/Client", function(require, exports, module) { var AutoConnect, Binding, Callback, Client, IDGenerator, IDLTools, InspectorBackendImpl, InspectorFrontendHostImpl, MessageDispatcher, RemotePanel, Weinre, WeinreClientEventsImpl, WeinreExtraTargetEventsImpl, addHack_DOMNotify_setChildNodes, installWebInspectorAPIsource, new_DOMNotify_setChildNodes, old_DOMNotify_setChildNodes;

IDLTools = require('../common/IDLTools');

Callback = require('../common/Callback');

Weinre = require('../common/Weinre');

MessageDispatcher = require('../common/MessageDispatcher');

Binding = require('../common/Binding');

IDGenerator = require('../common/IDGenerator');

InspectorBackendImpl = require('./InspectorBackendImpl');

InspectorFrontendHostImpl = require('./InspectorFrontendHostImpl');

WeinreClientEventsImpl = require('./WeinreClientEventsImpl');

WeinreExtraTargetEventsImpl = require('./WeinreExtraTargetEventsImpl');

RemotePanel = require('./RemotePanel');

AutoConnect = true;

Weinre.showNotImplemented();

module.exports = Client = (function() {

  function Client() {}

  Client.prototype.initialize = function() {
    var messageDispatcher;
    addHack_DOMNotify_setChildNodes();
    window.addEventListener('load', Binding(this, 'onLoaded'), false);
    messageDispatcher = new MessageDispatcher('../ws/client', this._getId());
    Weinre.messageDispatcher = messageDispatcher;
    InspectorBackendImpl.setupProxies();
    Weinre.WeinreClientCommands = messageDispatcher.createProxy('WeinreClientCommands');
    Weinre.WeinreExtraClientCommands = messageDispatcher.createProxy('WeinreExtraClientCommands');
    messageDispatcher.registerInterface('WeinreExtraTargetEvents', new WeinreExtraTargetEventsImpl(), false);
    messageDispatcher.registerInterface('WebInspector', WebInspector, false);
    messageDispatcher.registerInterface('WeinreClientEvents', new WeinreClientEventsImpl(this), false);
    messageDispatcher.registerInterface('InspectorFrontendHost', InspectorFrontendHost, false);
    WebInspector.mainResource = {};
    return WebInspector.mainResource.url = location.href;
  };

  Client.prototype._getId = function() {
    var hash;
    hash = location.href.split('#')[1];
    if (hash) return hash;
    return 'anonymous';
  };

  Client.prototype.uiAvailable = function() {
    return WebInspector.panels && WebInspector.panels.remote;
  };

  Client.prototype.autoConnect = function(value) {
    if (arguments.length >= 1) AutoConnect = !!value;
    return AutoConnect;
  };

  Client.prototype._installRemotePanel = function() {
    var button, panel, toolButtonToHide, toolButtonsToHide, toolbar, _i, _len;
    WebInspector.panels.remote = new RemotePanel();
    panel = WebInspector.panels.remote;
    toolbar = document.getElementById('toolbar');
    WebInspector.addPanelToolbarIcon(toolbar, panel, toolbar.childNodes[1]);
    WebInspector.panelOrder.unshift(WebInspector.panelOrder.pop());
    WebInspector.currentPanel = panel;
    toolButtonsToHide = ['scripts'];
    for (_i = 0, _len = toolButtonsToHide.length; _i < _len; _i++) {
      toolButtonToHide = toolButtonsToHide[_i];
      if (!WebInspector.panels[toolButtonToHide]) continue;
      if (!WebInspector.panels[toolButtonToHide].toolbarItem) continue;
      WebInspector.panels[toolButtonToHide].toolbarItem.style.display = 'none';
    }
    button = document.getElementById('dock-status-bar-item');
    if (button) return button.style.display = 'none';
  };

  Client.prototype.onLoaded = function() {
    Weinre.WeinreClientCommands.registerClient(Binding(this, this.cb_registerClient));
    return this._installRemotePanel();
  };

  Client.prototype.cb_registerClient = function(clientDescription) {
    Weinre.clientDescription = clientDescription;
    if (this.uiAvailable()) {
      WebInspector.panels.remote.setCurrentClient(clientDescription.channel);
      WebInspector.panels.remote.afterInitialConnection();
    }
    return Weinre.messageDispatcher.getWebSocket().addEventListener('close', Binding(this, this.cb_webSocketClosed));
  };

  Client.prototype.cb_webSocketClosed = function() {
    return setTimeout((function() {
      WebInspector.panels.remote.connectionClosed();
      return WebInspector.currentPanel = WebInspector.panels.remote;
    }), 1000);
  };

  Client.main = function() {
    Weinre.client = new Client();
    Weinre.client.initialize();
    return window.installWebInspectorAPIsource = installWebInspectorAPIsource;
  };

  return Client;

})();

old_DOMNotify_setChildNodes = null;

new_DOMNotify_setChildNodes = function(parentId, payloads) {
  var domNode;
  domNode = this._domAgent._idToDOMNode[parentId];
  if (domNode.children) if (domNode.children.length > 0) return;
  return old_DOMNotify_setChildNodes.call(this, parentId, payloads);
};

addHack_DOMNotify_setChildNodes = function() {
  old_DOMNotify_setChildNodes = WebInspector.DOMDispatcher.prototype.setChildNodes;
  return WebInspector.DOMDispatcher.prototype.setChildNodes = new_DOMNotify_setChildNodes;
};

installWebInspectorAPIsource = function() {
  var extensionAPI, id;
  if ('webInspector' in window) return;
  extensionAPI = window.parent.InspectorFrontendHost.getExtensionAPI();
  extensionAPI = extensionAPI.replace('location.hostname + location.port', "location.hostname + ':' + location.port");
  id = IDGenerator.next();
  console.log("installing webInspector with injectedScriptId: " + id);
  extensionAPI += "(null, null, " + id + ")";
  return extensionAPI;
};

require('../common/MethodNamer').setNamesForClass(module.exports);

});