;modjewel.define("weinre/target/WiDOMImpl", function(require, exports, module) { var Weinre, WiDOMImpl;

Weinre = require('../common/Weinre');

module.exports = WiDOMImpl = (function() {

  function WiDOMImpl() {}

  WiDOMImpl.prototype.getChildNodes = function(nodeId, callback) {
    var children, node;
    node = Weinre.nodeStore.getNode(nodeId);
    if (!node) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
      return;
    }
    children = Weinre.nodeStore.serializeNodeChildren(node, 1);
    Weinre.wi.DOMNotify.setChildNodes(nodeId, children);
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiDOMImpl.prototype.setAttribute = function(elementId, name, value, callback) {
    var element;
    element = Weinre.nodeStore.getNode(elementId);
    if (!element) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid elementId: " + elementId);
      return;
    }
    element.setAttribute(name, value);
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiDOMImpl.prototype.removeAttribute = function(elementId, name, callback) {
    var element;
    element = Weinre.nodeStore.getNode(elementId);
    if (!element) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid elementId: " + elementId);
      return;
    }
    element.removeAttribute(name);
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiDOMImpl.prototype.setTextNodeValue = function(nodeId, value, callback) {
    var node;
    node = Weinre.nodeStore.getNode(nodeId);
    if (!node) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
      return;
    }
    node.nodeValue = value;
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiDOMImpl.prototype.getEventListenersForNode = function(nodeId, callback) {
    return Weinre.notImplemented(arguments.callee.signature);
  };

  WiDOMImpl.prototype.copyNode = function(nodeId, callback) {
    return Weinre.notImplemented(arguments.callee.signature);
  };

  WiDOMImpl.prototype.removeNode = function(nodeId, callback) {
    var node;
    node = Weinre.nodeStore.getNode(nodeId);
    if (!node) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
      return;
    }
    if (!node.parentNode) {
      Weinre.logWarning(arguments.callee.signature + " passed a parentless node: " + node);
      return;
    }
    node.parentNode.removeChild(node);
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiDOMImpl.prototype.changeTagName = function(nodeId, newTagName, callback) {
    return Weinre.notImplemented(arguments.callee.signature);
  };

  WiDOMImpl.prototype.getOuterHTML = function(nodeId, callback) {
    var node, value;
    node = Weinre.nodeStore.getNode(nodeId);
    if (!node) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
      return;
    }
    value = node.outerHTML;
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [value]);
    }
  };

  WiDOMImpl.prototype.setOuterHTML = function(nodeId, outerHTML, callback) {
    var node;
    node = Weinre.nodeStore.getNode(nodeId);
    if (!node) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
      return;
    }
    node.outerHTML = outerHTML;
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiDOMImpl.prototype.addInspectedNode = function(nodeId, callback) {
    Weinre.nodeStore.addInspectedNode(nodeId);
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiDOMImpl.prototype.performSearch = function(query, runSynchronously, callback) {
    return Weinre.notImplemented(arguments.callee.signature);
  };

  WiDOMImpl.prototype.searchCanceled = function(callback) {
    return Weinre.notImplemented(arguments.callee.signature);
  };

  WiDOMImpl.prototype.pushNodeByPathToFrontend = function(path, callback) {
    var childNodeIds, curr, currId, i, index, nodeId, nodeName, parts, _ref;
    parts = path.split(",");
    curr = document;
    currId = null;
    nodeId = Weinre.nodeStore.getNodeId(curr);
    this.getChildNodes(nodeId);
    for (i = 0, _ref = parts.length; i < _ref; i += 2) {
      index = parseInt(parts[i]);
      nodeName = parts[i + 1];
      if (isNaN(index)) return;
      childNodeIds = Weinre.nodeStore.childNodeIds(curr);
      currId = childNodeIds[index];
      if (!currId) return;
      this.getChildNodes(currId);
      curr = Weinre.nodeStore.getNode(currId);
      if (curr.nodeName !== nodeName) return;
    }
    if (callback && currId) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [currId]);
    }
  };

  WiDOMImpl.prototype.resolveNode = function(nodeId, callback) {
    var result;
    result = Weinre.injectedScript.resolveNode(nodeId);
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
    }
  };

  WiDOMImpl.prototype.getNodeProperties = function(nodeId, propertiesArray, callback) {
    var result;
    propertiesArray = JSON.stringify(propertiesArray);
    result = Weinre.injectedScript.getNodeProperties(nodeId, propertiesArray);
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
    }
  };

  WiDOMImpl.prototype.getNodePrototypes = function(nodeId, callback) {
    var result;
    result = Weinre.injectedScript.getNodePrototypes(nodeId);
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
    }
  };

  WiDOMImpl.prototype.pushNodeToFrontend = function(objectId, callback) {
    var result;
    objectId = JSON.stringify(objectId);
    result = Weinre.injectedScript.pushNodeToFrontend(objectId);
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
    }
  };

  return WiDOMImpl;

})();

require("../common/MethodNamer").setNamesForClass(module.exports);

});