;modjewel.define("weinre/target/Timeline", function(require, exports, module) { var Ex, HookLib, HookSites, IDGenerator, Running, StackTrace, Timeline, TimelineRecordType, TimerIntervals, TimerTimeouts, Weinre, addStackTrace, addTimer, getXhrEventHandler, instrumentedTimerCode, removeTimer;

Ex = require('../common/Ex');

Weinre = require('../common/Weinre');

IDGenerator = require('../common/IDGenerator');

StackTrace = require('../common/StackTrace');

HookLib = require('../common/HookLib');

HookSites = require('./HookSites');

Running = false;

TimerTimeouts = {};

TimerIntervals = {};

TimelineRecordType = {
  EventDispatch: 0,
  Layout: 1,
  RecalculateStyles: 2,
  Paint: 3,
  ParseHTML: 4,
  TimerInstall: 5,
  TimerRemove: 6,
  TimerFire: 7,
  XHRReadyStateChange: 8,
  XHRLoad: 9,
  EvaluateScript: 10,
  Mark: 11,
  ResourceSendRequest: 12,
  ResourceReceiveResponse: 13,
  ResourceFinish: 14,
  FunctionCall: 15,
  ReceiveResourceData: 16,
  GCEvent: 17,
  MarkDOMContent: 18,
  MarkLoad: 19,
  ScheduleResourceRequest: 20
};

module.exports = Timeline = (function() {

  function Timeline() {}

  Timeline.start = function() {
    return Running = true;
  };

  Timeline.stop = function() {
    return Running = false;
  };

  Timeline.isRunning = function() {
    return Running;
  };

  Timeline.addRecord_Mark = function(message) {
    var record;
    if (!Timeline.isRunning()) return;
    record = {};
    record.type = TimelineRecordType.Mark;
    record.category = {
      name: "scripting"
    };
    record.startTime = Date.now();
    record.data = {
      message: message
    };
    addStackTrace(record, 3);
    return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
  };

  Timeline.addRecord_EventDispatch = function(event, name, category) {
    var record;
    if (!Timeline.isRunning()) return;
    if (!category) category = "scripting";
    record = {};
    record.type = TimelineRecordType.EventDispatch;
    record.category = {
      name: category
    };
    record.startTime = Date.now();
    record.data = {
      type: event.type
    };
    return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
  };

  Timeline.addRecord_TimerInstall = function(id, timeout, singleShot) {
    var record;
    if (!Timeline.isRunning()) return;
    record = {};
    record.type = TimelineRecordType.TimerInstall;
    record.category = {
      name: "scripting"
    };
    record.startTime = Date.now();
    record.data = {
      timerId: id,
      timeout: timeout,
      singleShot: singleShot
    };
    addStackTrace(record, 4);
    return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
  };

  Timeline.addRecord_TimerRemove = function(id, timeout, singleShot) {
    var record;
    if (!Timeline.isRunning()) return;
    record = {};
    record.type = TimelineRecordType.TimerRemove;
    record.category = {
      name: "scripting"
    };
    record.startTime = Date.now();
    record.data = {
      timerId: id,
      timeout: timeout,
      singleShot: singleShot
    };
    addStackTrace(record, 4);
    return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
  };

  Timeline.addRecord_TimerFire = function(id, timeout, singleShot) {
    var record;
    if (!Timeline.isRunning()) return;
    record = {};
    record.type = TimelineRecordType.TimerFire;
    record.category = {
      name: "scripting"
    };
    record.startTime = Date.now();
    record.data = {
      timerId: id,
      timeout: timeout,
      singleShot: singleShot
    };
    return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
  };

  Timeline.addRecord_XHRReadyStateChange = function(method, url, id, xhr) {
    var contentLength, record;
    if (!Timeline.isRunning()) return;
    record = {};
    record.startTime = Date.now();
    record.category = {
      name: "loading"
    };
    contentLength = xhr.getResponseHeader("Content-Length");
    contentLength = parseInt(contentLength);
    if (xhr.readyState === XMLHttpRequest.OPENED) {
      record.type = TimelineRecordType.ResourceSendRequest;
      record.data = {
        identifier: id,
        url: url,
        requestMethod: method
      };
    } else if (xhr.readyState === XMLHttpRequest.DONE) {
      record.type = TimelineRecordType.ResourceReceiveResponse;
      record.data = {
        identifier: id,
        statusCode: xhr.status,
        mimeType: xhr.getResponseHeader("Content-Type"),
        url: url
      };
      if (!isNaN(contentLength)) record.data.expectedContentLength = contentLength;
    } else {
      return;
    }
    return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
  };

  Timeline.installGlobalListeners = function() {
    if (applicationCache) {
      applicationCache.addEventListener("checking", (function(e) {
        return Timeline.addRecord_EventDispatch(e, "applicationCache.checking", "loading");
      }), false);
      applicationCache.addEventListener("error", (function(e) {
        return Timeline.addRecord_EventDispatch(e, "applicationCache.error", "loading");
      }), false);
      applicationCache.addEventListener("noupdate", (function(e) {
        return Timeline.addRecord_EventDispatch(e, "applicationCache.noupdate", "loading");
      }), false);
      applicationCache.addEventListener("downloading", (function(e) {
        return Timeline.addRecord_EventDispatch(e, "applicationCache.downloading", "loading");
      }), false);
      applicationCache.addEventListener("progress", (function(e) {
        return Timeline.addRecord_EventDispatch(e, "applicationCache.progress", "loading");
      }), false);
      applicationCache.addEventListener("updateready", (function(e) {
        return Timeline.addRecord_EventDispatch(e, "applicationCache.updateready", "loading");
      }), false);
      applicationCache.addEventListener("cached", (function(e) {
        return Timeline.addRecord_EventDispatch(e, "applicationCache.cached", "loading");
      }), false);
      applicationCache.addEventListener("obsolete", (function(e) {
        return Timeline.addRecord_EventDispatch(e, "applicationCache.obsolete", "loading");
      }), false);
    }
    window.addEventListener("error", (function(e) {
      return Timeline.addRecord_EventDispatch(e, "window.error");
    }), false);
    window.addEventListener("hashchange", (function(e) {
      return Timeline.addRecord_EventDispatch(e, "window.hashchange");
    }), false);
    window.addEventListener("message", (function(e) {
      return Timeline.addRecord_EventDispatch(e, "window.message");
    }), false);
    window.addEventListener("offline", (function(e) {
      return Timeline.addRecord_EventDispatch(e, "window.offline");
    }), false);
    window.addEventListener("online", (function(e) {
      return Timeline.addRecord_EventDispatch(e, "window.online");
    }), false);
    return window.addEventListener("scroll", (function(e) {
      return Timeline.addRecord_EventDispatch(e, "window.scroll");
    }), false);
  };

  Timeline.installNativeHooks = function() {
    HookSites.window_setInterval.addHooks({
      before: function(receiver, args) {
        var code, interval;
        code = args[0];
        if (typeof code !== "function") return;
        interval = args[1];
        code = instrumentedTimerCode(code, interval, false);
        args[0] = code;
        this.userData = {};
        this.userData.code = code;
        return this.userData.interval = interval;
      },
      after: function(receiver, args, result) {
        var code, id;
        code = this.userData.code;
        if (typeof code !== "function") return;
        id = result;
        code.__timerId = id;
        return addTimer(id, this.userData.interval, false);
      }
    });
    HookSites.window_clearInterval.addHooks({
      before: function(receiver, args) {
        var id;
        id = args[0];
        return removeTimer(id, false);
      }
    });
    HookSites.window_setTimeout.addHooks({
      before: function(receiver, args) {
        var code, interval;
        code = args[0];
        if (typeof code !== "function") return;
        interval = args[1];
        code = instrumentedTimerCode(code, interval, true);
        args[0] = code;
        this.userData = {};
        this.userData.code = code;
        return this.userData.interval = interval;
      },
      after: function(receiver, args, result) {
        var code, id;
        code = this.userData.code;
        if (typeof code !== "function") return;
        id = result;
        code.__timerId = id;
        return addTimer(id, this.userData.interval, true);
      }
    });
    HookSites.window_clearTimeout.addHooks({
      before: function(receiver, args) {
        var id;
        id = args[0];
        return removeTimer(id, true);
      }
    });
    return HookSites.XMLHttpRequest_open.addHooks({
      before: function(receiver, args) {
        var xhr;
        xhr = receiver;
        IDGenerator.getId(xhr);
        xhr.__weinre_method = args[0];
        xhr.__weinre_url = args[1];
        return xhr.addEventListener("readystatechange", getXhrEventHandler(xhr), false);
      }
    });
  };

  return Timeline;

})();

getXhrEventHandler = function(xhr) {
  return function(event) {
    return Timeline.addRecord_XHRReadyStateChange(xhr.__weinre_method, xhr.__weinre_url, IDGenerator.getId(xhr), xhr);
  };
};

addTimer = function(id, timeout, singleShot) {
  var timerSet;
  timerSet = (singleShot ? TimerTimeouts : TimerIntervals);
  timerSet[id] = {
    id: id,
    timeout: timeout,
    singleShot: singleShot
  };
  return Timeline.addRecord_TimerInstall(id, timeout, singleShot);
};

removeTimer = function(id, singleShot) {
  var timer, timerSet;
  timerSet = (singleShot ? TimerTimeouts : TimerIntervals);
  timer = timerSet[id];
  if (!timer) return;
  Timeline.addRecord_TimerRemove(id, timer.timeout, singleShot);
  return delete timerSet[id];
};

instrumentedTimerCode = function(code, timeout, singleShot) {
  var instrumentedCode;
  if (typeof code !== "function") return code;
  instrumentedCode = function() {
    var id, result;
    result = code.apply(this, arguments);
    id = arguments.callee.__timerId;
    Timeline.addRecord_TimerFire(id, timeout, singleShot);
    return result;
  };
  instrumentedCode.displayName = code.name || code.displayName;
  return instrumentedCode;
};

addStackTrace = function(record, skip) {
  var i, trace, _results;
  if (!skip) skip = 1;
  trace = new StackTrace(arguments).trace;
  record.stackTrace = [];
  i = skip;
  _results = [];
  while (i < trace.length) {
    record.stackTrace.push({
      functionName: trace[i],
      scriptName: "",
      lineNumber: ""
    });
    _results.push(i++);
  }
  return _results;
};

Timeline.installGlobalListeners();

Timeline.installNativeHooks();

require("../common/MethodNamer").setNamesForClass(module.exports);

});