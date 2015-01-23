(function() {
  "use strict";

  var ImplClass = null;

  var AudioContext = (function() {
    if (typeof window !== "undefined") {
      return window.webkitAudioContext || window.AudioContext;
    }
  })();

  if (typeof AudioContext !== "undefined") {
    ImplClass = function(sys) {
      var context = new AudioContext();
      var bufSrc, jsNode;

      this.sampleRate = context.sampleRate;
      this.env = "webkit";

      this.play = function() {
        bufSrc = context.createBufferSource();
        jsNode = context.createScriptProcessor(sys.streamsize, 2, sys.channels);
        jsNode.onaudioprocess = function(e) {
          var outs = e.outputBuffer;
          sys.process();
          outs.getChannelData(0).set(sys.strmL);
          outs.getChannelData(1).set(sys.strmR);
        };

        bufSrc.start(0);
        bufSrc.connect(jsNode);

        jsNode.connect(context.destination);
      };

      this.pause = function() {
        bufSrc.disconnect();
        jsNode.disconnect();
      };
    };
  } else {
    ImplClass = function(sys) {
      this.sampleRate = 44100;
      this.env = "nop";
      this.play  = function() {};
      this.pause = function() {};
    };
  }

  function SoundSystem(opts) {
    this.impl = null;
    this.isPlaying  = false;
    this.sampleRate = 44100;
    this.channels   = 2;
    this.cellsize   = 128;
    this.streammsec = 20;
    this.streamsize = 0;

    this.generator  = null;
  }

  SoundSystem.prototype.bind = function(klass, opts) {
    if (typeof klass === "function") {
      var player = new klass(this, opts);
      if (typeof player.play === "function" && typeof player.pause === "function") {
        this.impl = player;
        if (this.impl.sampleRate) {
          this.sampleRate = this.impl.sampleRate;
        }
      }
    }
    return this;
  };

  SoundSystem.prototype.setup = function(params) {
    return this;
  };

  SoundSystem.prototype.play = function(generator) {
    if (this.isPlaying || typeof generator !== "object") {
      return this;
    }
    this.isPlaying = true;

    this.generator  = generator;
    this.streamsize = this.getAdjustSamples();
    this.strmL = new Float32Array(this.streamsize);
    this.strmR = new Float32Array(this.streamsize);
    this.cellL = new Float32Array(this.cellsize);
    this.cellR = new Float32Array(this.cellsize);

    this.impl.play();
    return this;
  };

  SoundSystem.prototype.pause = function() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.impl.pause();
    }
    return this;
  };

  SoundSystem.prototype.process = function() {
    var cellL = this.cellL, cellR = this.cellR;
    var strmL = this.strmL, strmR = this.strmR;
    var generator = this.generator;
    var i, imax = cellL.length;
    var j = 0, n = this.streamsize / this.cellsize;
    var x;

    while (n--) {
      generator.process(cellL, cellR);
      for (i = 0; i < imax; ++i, ++j) {
        x = cellL[i];
        strmL[j] = (x < -1) ? -1 : (x > 1) ? 1 : x;
        x = cellR[i];
        strmR[j] = (x < -1) ? -1 : (x > 1) ? 1 : x;
      }
    }
  };

  var instance = new SoundSystem().bind(ImplClass);

  var exports = {
    setup: function(opts) {
      instance.setup(opts);
      return this;
    },
    bind: function(klass, opts) {
      instance.bind(klass, opts);
      return this;
    },
    play: function(generator) {
      instance.play(generator);
      return this;
    },
    pause: function() {
      instance.pause();
      return this;
    }
  };
  Object.defineProperties(exports, {
    env: {
      get: function() {
        return instance.impl.env;
      }
    },
    sampleRate: {
      get: function() {
        return instance.sampleRate;
      }
    },
    channels: {
      get: function() {
        return instance.channels;
      }
    },
    cellsize: {
      get: function() {
        return instance.cellsize;
      }
    },
    isPlaying: {
      get: function() {
        return instance.isPlaying;
      }
    }
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.pico = exports;
  } else if (typeof window !== "undefined") {
    exports.noConflict = (function() {
      var _ = window.pico;
      return function() {
        if (window.pico === exports) {
          window.pico = _;
        }
        return exports;
      };
    })();
    window.pico = exports;
  }

  // Flash fallback
  (function() {
    if (typeof window === "undefined" || window.pico.env !== "nop") {
      return;
    }
    var nav = navigator;

    /*jshint latedef:true */
    if (getFlashPlayerVersion(0) < 10) {
      return;
    }
    /*jshint latedef:false */

    var swf, PlayerDivID = "PicoFlashPlayerDiv";
    var src = (function() {
      var scripts = document.getElementsByTagName("script");
      if (scripts && scripts.length) {
        for (var m, i = 0, imax = scripts.length; i < imax; ++i) {
          if ((m = /^(.*\/)pico(?:\.dev)?\.js$/i.exec(scripts[i].src))) {
            return m[1] + "pico.swf";
          }
        }
      }
    })();

    window.picojs_flashfallback_init = function() {
      function PicoFlashPlayer(sys) {
        var timerId = 0;

        this.sampleRate = 44100;
        this.env = "flash";

        this.play = function() {
          var onaudioprocess;
          var interleaved = new Array(sys.streamsize * sys.channels);
          var streammsec  = sys.streammsec;
          var written = 0;
          var writtenIncr = sys.streamsize / sys.sampleRate * 1000;
          var start = Date.now();

          onaudioprocess = function() {
            if (written > Date.now() - start) {
              return;
            }
            var inL = sys.strmL;
            var inR = sys.strmR;
            var i = interleaved.length;
            var j = inL.length;
            sys.process();
            while (j--) {
              interleaved[--i] = (inR[j] * 32768)|0;
              interleaved[--i] = (inL[j] * 32768)|0;
            }
            swf.writeAudio(interleaved.join(" "));
            written += writtenIncr;
          };

          if (swf.setup) {
            swf.setup(sys.channels, sys.sampleRate);
            timerId = setInterval(onaudioprocess, streammsec);
          } else {
            console.warn("Cannot find " + src);
          }
        };

        this.pause = function() {
          if (timerId !== 0) {
            swf.cancel();
            clearInterval(timerId);
            timerId = 0;
          }
        };
      }
      instance.bind(PicoFlashPlayer);
      delete window.picojs_flashfallback_init;
    };

    var o, p;
    var swfSrc  = src;
    var swfName = swfSrc + "?" + (+new Date());
    var swfId   = "PicoFlashPlayer";
    var div = document.createElement("div");
    div.id = PlayerDivID;
    div.style.display = "inline";
    div.width = div.height = 1;

    if (nav.plugins && nav.mimeTypes && nav.mimeTypes.length) {
      // ns
      o = document.createElement("object");
      o.id = swfId;
      o.classid = "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
      o.width = o.height = 1;
      o.setAttribute("data", swfName);
      o.setAttribute("type", "application/x-shockwave-flash");
      p = document.createElement("param");
      p.setAttribute("name", "allowScriptAccess");
      p.setAttribute("value", "always");
      o.appendChild(p);
      div.appendChild(o);
    } else {
      // ie
      /*jshint quotmark:single */
      div.innerHTML = '<object id="' + swfId + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="1" height="1"><param name="movie" value="' + swfName + '" /><param name="bgcolor" value="#FFFFFF" /><param name="quality" value="high" /><param name="allowScriptAccess" value="always" /></object>';
      /*jshint quotmark:double */
    }
    window.addEventListener("load", function() {
      document.body.appendChild(div);
      swf = document[swfId];
    });

    function getFlashPlayerVersion(subs) {
      /*global ActiveXObject:true */
      try {
        if (nav.plugins && nav.mimeTypes && nav.mimeTypes.length) {
          return nav.plugins["Shockwave Flash"].description.match(/([0-9]+)/)[subs];
        }
        return (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")).GetVariable("$version").match(/([0-9]+)/)[subs];
      } catch (e) {
        return -1;
      }
      /*global ActiveXObject:false */
    }
  })();

})();
