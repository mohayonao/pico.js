(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Pico = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _pico = require("./pico");

var _pico2 = _interopRequireDefault(_pico);

var _playerWebAudioPlayer = require("./player/web-audio-player");

var _playerWebAudioPlayer2 = _interopRequireDefault(_playerWebAudioPlayer);

var _playerFlashFallbackPlayer = require("./player/flash-fallback-player");

var _playerFlashFallbackPlayer2 = _interopRequireDefault(_playerFlashFallbackPlayer);

if (_playerWebAudioPlayer2["default"].isEnabled) {
  _pico2["default"].bind(_playerWebAudioPlayer2["default"]);
} else {
  _playerFlashFallbackPlayer2["default"].fallback(_pico2["default"]);
}

exports["default"] = _pico2["default"];
module.exports = exports["default"];
},{"./pico":2,"./player/flash-fallback-player":3,"./player/web-audio-player":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _processor = require("./processor");

var _processor2 = _interopRequireDefault(_processor);

var processor = new _processor2["default"]();

exports["default"] = new ((function () {
  function Pico() {
    _classCallCheck(this, Pico);
  }

  _createClass(Pico, [{
    key: "bind",
    value: function bind(klass) {
      processor.bind(klass);
    }
  }, {
    key: "play",
    value: function play(audioprocess) {
      processor.play(audioprocess);
    }
  }, {
    key: "pause",
    value: function pause() {
      processor.pause();
    }
  }, {
    key: "env",
    get: function get() {
      return processor.env;
    }
  }, {
    key: "sampleRate",
    get: function get() {
      return processor.sampleRate;
    }
  }, {
    key: "bufferSize",
    get: function get() {
      return processor.bufferSize;
    }
  }, {
    key: "isPlaying",
    get: function get() {
      return processor.isPlaying;
    }
  }]);

  return Pico;
})())();
module.exports = exports["default"];
},{"./processor":6}],3:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _player = require("./player");

var _player2 = _interopRequireDefault(_player);

var FlashFallbackPlayer = (function (_Player) {
  _inherits(FlashFallbackPlayer, _Player);

  function FlashFallbackPlayer(processor) {
    _classCallCheck(this, FlashFallbackPlayer);

    _get(Object.getPrototypeOf(FlashFallbackPlayer.prototype), "constructor", this).call(this, processor, 44100, 2048, "flashfallback");

    this._out = new Array(this.streamSize * 2);
    this._writtenIncr = this.streamSize / this.sampleRate * 1000;
    this._written = 0;
    this._start = 0;
    this._timerId = 0;
  }

  _createClass(FlashFallbackPlayer, [{
    key: "play",
    value: function play() {
      var _this = this;

      if (FlashFallbackPlayer.swf && this._timerId === 0) {
        this._written = 0;
        this._start = Date.now();
        this._timerId = setInterval(function () {
          _this.onaudioprocess(_this.streamSize);
        }, 25);
        FlashFallbackPlayer.swf.play();
      }
    }
  }, {
    key: "pause",
    value: function pause() {
      if (FlashFallbackPlayer.swf && this._timerId !== 0) {
        clearInterval(this._timerId);
        this._timerId = 0;
        FlashFallbackPlayer.swf.pause();
      }
    }
  }, {
    key: "onaudioprocess",
    value: function onaudioprocess(streamSize) {
      if (this._written < Date.now() - this._start) {
        var x = undefined;
        var streamL = this.processor.streams[0];
        var streamR = this.processor.streams[1];
        var out = this._out;

        this.processor.process(streamSize);

        for (var i = 0, j = 0; i < streamSize; i++) {
          x = streamL[i] * 16384 + 32768 | 0;
          x = Math.max(16384, Math.min(x, 49152));
          out[j++] = String.fromCharCode(x);

          x = streamR[i] * 16384 + 32768 | 0;
          x = Math.max(16384, Math.min(x, 49152));
          out[j++] = String.fromCharCode(x);
        }

        FlashFallbackPlayer.swf.write(out.join(""));

        this._written += this._writtenIncr;
      }
    }
  }]);

  return FlashFallbackPlayer;
})(_player2["default"]);

exports["default"] = FlashFallbackPlayer;

var swfId = "PicoFlashFallbackPlayer" + Date.now();

var getPicoSwfUrl = function getPicoSwfUrl() {
  var scripts = global.document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    var matched = scripts[i].src.match(/^(.*\/)pico(?:\.min)?\.js$/);
    if (matched) {
      return matched[1] + "pico.swf";
    }
  }
  return "pico.swf";
};

var createFlashContainer = function createFlashContainer() {
  var container = global.document.createElement("div");
  var object = global.document.createElement("object");
  var param = global.document.createElement("param");

  param.setAttribute("name", "allowScriptAccess");
  param.setAttribute("value", "always");

  object.id = swfId;
  object.classid = "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
  object.width = 1;
  object.height = 1;
  object.setAttribute("data", getPicoSwfUrl() + "?" + Date.now());
  object.setAttribute("type", "application/x-shockwave-flash");

  container.style.position = "fixed";
  container.style.left = 0;
  container.style.top = 0;
  container.style.width = "1px";
  container.style.height = "1px";

  object.appendChild(param);
  container.appendChild(object);

  return container;
};

FlashFallbackPlayer.fallback = function (Pico) {
  global.picojs$flashfallback = function () {
    Pico.bind(FlashFallbackPlayer);
    delete global.picojs$flashfallback;
  };

  global.window.addEventListener("load", function () {
    global.document.body.appendChild(createFlashContainer());
    FlashFallbackPlayer.swf = global.document.getElementById(swfId);
  });
};
module.exports = exports["default"];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./player":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Player = (function () {
  function Player(processor) {
    var sampleRate = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var streamSize = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var env = arguments.length <= 3 || arguments[3] === undefined ? "" : arguments[3];

    _classCallCheck(this, Player);

    this.processor = processor;
    this.sampleRate = sampleRate;
    this.streamSize = streamSize;
    this.env = env;
  }

  _createClass(Player, [{
    key: "play",
    value: function play() {}
  }, {
    key: "pause",
    value: function pause() {}
  }]);

  return Player;
})();

exports["default"] = Player;
module.exports = exports["default"];
},{}],5:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _player = require("./player");

var _player2 = _interopRequireDefault(_player);

var AudioContext = global.AudioContext || global.webkitAudioContext;

var WebAudioPlayer = (function (_Player) {
  _inherits(WebAudioPlayer, _Player);

  function WebAudioPlayer(processor) {
    _classCallCheck(this, WebAudioPlayer);

    _get(Object.getPrototypeOf(WebAudioPlayer.prototype), "constructor", this).call(this, processor, 44100, 2048, "webaudio");

    this._context = new AudioContext();
    this._bufSrc = null;
    this._jsNode = null;

    this.sampleRate = this._context.sampleRate;
  }

  _createClass(WebAudioPlayer, [{
    key: "play",
    value: function play() {
      var _this = this;

      this._jsNode = this._context.createScriptProcessor(this.streamSize, 1, 2);
      this._jsNode.onaudioprocess = function (e) {
        _this.processor.process(_this.streamSize);
        e.outputBuffer.getChannelData(0).set(_this.processor.streams[0]);
        e.outputBuffer.getChannelData(1).set(_this.processor.streams[1]);
      };
      this._jsNode.connect(this._context.destination);

      this._bufSrc = this._context.createBufferSource();
      this._bufSrc.start(0);
      this._bufSrc.connect(this._jsNode);
    }
  }, {
    key: "pause",
    value: function pause() {
      this._bufSrc.stop(0);
      this._bufSrc.disconnect();
      this._jsNode.disconnect();
    }
  }]);

  return WebAudioPlayer;
})(_player2["default"]);

exports["default"] = WebAudioPlayer;

WebAudioPlayer.isEnabled = !!AudioContext;
module.exports = exports["default"];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./player":4}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _playerPlayer = require("./player/player");

var _playerPlayer2 = _interopRequireDefault(_playerPlayer);

var BUFFER_SIZE = 64;

var Processor = (function () {
  function Processor() {
    _classCallCheck(this, Processor);

    this.player = new _playerPlayer2["default"](this);
    this.audioprocess = null;
    this.isPlaying = false;
    this.streams = null;
    this.buffers = null;
  }

  _createClass(Processor, [{
    key: "bind",
    value: function bind(klass) {
      this.player = new klass(this);
    }
  }, {
    key: "play",
    value: function play(audioprocess) {
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.streams = [new Float32Array(this.player.streamSize), new Float32Array(this.player.streamSize)];
        this.buffers = [new Float32Array(BUFFER_SIZE), new Float32Array(BUFFER_SIZE)];
        this.audioprocess = audioprocess;
        this.player.play();
      }
    }
  }, {
    key: "pause",
    value: function pause() {
      if (this.isPlaying) {
        this.isPlaying = false;
        this.player.pause();
        this.streams = null;
        this.buffers = null;
        this.audioprocess = null;
      }
    }
  }, {
    key: "process",
    value: function process(streamSize) {
      var audioprocess = this.audioprocess;
      var streamL = this.streams[0];
      var streamR = this.streams[1];
      var buffers = this.buffers;
      var bufferL = buffers[0];
      var bufferR = buffers[1];
      var n = streamSize / BUFFER_SIZE;

      for (var i = 0; i < n; i++) {
        audioprocess({
          bufferSize: BUFFER_SIZE,
          buffers: buffers
        });
        streamL.set(bufferL, i * BUFFER_SIZE);
        streamR.set(bufferR, i * BUFFER_SIZE);
      }
    }
  }, {
    key: "env",
    get: function get() {
      return this.player.env;
    }
  }, {
    key: "sampleRate",
    get: function get() {
      return this.player.sampleRate;
    }
  }, {
    key: "bufferSize",
    get: function get() {
      return BUFFER_SIZE;
    }
  }]);

  return Processor;
})();

exports["default"] = Processor;
module.exports = exports["default"];
},{"./player/player":4}]},{},[1])(1)
});