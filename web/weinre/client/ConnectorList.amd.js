;modjewel.define("weinre/client/ConnectorList", function(require, exports, module) { var ConnectorList, dt;

dt = require('./DOMTemplates');

module.exports = ConnectorList = (function() {

  function ConnectorList(title) {
    this.connectors = {};
    this.noneItem = dt.LI("none");
    this.ulConnectors = dt.UL(this.noneItem);
    this.div = dt.DIV(dt.H1(title), this.ulConnectors);
    this.noneItem.addStyleClass("weinre-connector-item");
  }

  ConnectorList.prototype.getElement = function() {
    return this.div;
  };

  ConnectorList.prototype.add = function(connector) {
    var insertionPoint, li;
    if (this.connectors[connector.channel]) return;
    this.connectors[connector.channel] = connector;
    li = this.getListItem(connector);
    li.addStyleClass("weinre-fadeable");
    this.noneItem.style.display = "none";
    insertionPoint = this.getConnectorInsertionPoint(connector);
    if (!insertionPoint) {
      return this.ulConnectors.appendChild(li);
    } else {
      return this.ulConnectors.insertBefore(li, insertionPoint);
    }
  };

  ConnectorList.prototype.get = function(channel) {
    return this.connectors[channel];
  };

  ConnectorList.prototype.getNewestConnectorChannel = function(ignoring) {
    var connectorChannel, newest;
    newest = 0;
    for (connectorChannel in this.connectors) {
      if (connectorChannel === ignoring) continue;
      if (connectorChannel > newest) newest = connectorChannel;
    }
    if (newest === 0) return null;
    return newest;
  };

  ConnectorList.prototype.getConnectorInsertionPoint = function(connector) {
    var childNode, i, _i, _len, _ref;
    i = 0;
    _ref = this.ulConnectors.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      childNode = _ref[_i];
      if (null === childNode.connectorChannel) continue;
      if (childNode.connectorChannel < connector.channel) return childNode;
    }
    return null;
  };

  ConnectorList.prototype.remove = function(channel, fast) {
    var connector, element, self;
    self = this;
    element = this.getConnectorElement(channel);
    if (!element) return;
    connector = this.connectors[channel];
    if (connector) connector.closed = true;
    delete this.connectors[channel];
    if (fast) {
      return this._remove(element);
    } else {
      this.setState(element, "closed");
      element.addStyleClass("weinre-fade");
      return window.setTimeout((function() {
        return self._remove(element);
      }), 5000);
    }
  };

  ConnectorList.prototype._remove = function(element) {
    this.ulConnectors.removeChild(element);
    if (this.getConnectors().length === 0) {
      return this.noneItem.style.display = "list-item";
    }
  };

  ConnectorList.prototype.removeAll = function() {
    var connector, _i, _len, _ref, _results;
    _ref = this.getConnectors();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connector = _ref[_i];
      _results.push(this.remove(connector.channel, true));
    }
    return _results;
  };

  ConnectorList.prototype.getConnectors = function() {
    var channel, result;
    result = [];
    for (channel in this.connectors) {
      if (!this.connectors.hasOwnProperty(channel)) continue;
      result.push(this.connectors[channel]);
    }
    return result;
  };

  ConnectorList.prototype.getConnectorElement = function(channel) {
    var connector;
    connector = this.connectors[channel];
    if (!connector) return null;
    return connector.element;
  };

  ConnectorList.prototype.setCurrent = function(channel) {
    var connector, element, _i, _len, _ref;
    _ref = this.getConnectors();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connector = _ref[_i];
      connector.element.removeStyleClass("current");
    }
    element = this.getConnectorElement(channel);
    if (null === element) return;
    return element.addStyleClass("current");
  };

  ConnectorList.prototype.setState = function(channel, state) {
    var element;
    if (typeof channel === "string") {
      element = this.getConnectorElement(channel);
    } else {
      element = channel;
    }
    if (!element) return;
    element.removeStyleClass("error");
    element.removeStyleClass("closed");
    element.removeStyleClass("connected");
    element.removeStyleClass("not-connected");
    return element.addStyleClass(state);
  };

  return ConnectorList;

})();

require("../common/MethodNamer").setNamesForClass(module.exports);

});