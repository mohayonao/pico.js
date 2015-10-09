import Player from "./player";

export default class FlashFallbackPlayer extends Player {
  constructor(processor) {
    super(processor, 44100, 2048, "flashfallback");

    this._out = new Array(this.streamSize * 2);
    this._writtenIncr = this.streamSize / this.sampleRate * 1000;
    this._written = 0;
    this._start = 0;
    this._timerId = 0;
  }

  play() {
    if (FlashFallbackPlayer.swf && this._timerId === 0) {
      this._written = 0;
      this._start = Date.now();
      this._timerId = setInterval(() => {
        this.onaudioprocess(this.streamSize);
      }, 25);
      FlashFallbackPlayer.swf.play();
    }
  }

  pause() {
    if (FlashFallbackPlayer.swf && this._timerId !== 0) {
      clearInterval(this._timerId);
      this._timerId = 0;
      FlashFallbackPlayer.swf.pause();
    }
  }

  onaudioprocess(streamSize) {
    if (this._written < Date.now() - this._start) {
      let x;
      let streamL = this.processor.streams[0];
      let streamR = this.processor.streams[1];
      let out = this._out;

      this.processor.process(streamSize);

      for (let i = 0, j = 0; i < streamSize; i++) {
        x = (streamL[i] * 16384 + 32768)|0;
        x = Math.max(16384, Math.min(x, 49152));
        out[j++] = String.fromCharCode(x);

        x = (streamR[i] * 16384 + 32768)|0;
        x = Math.max(16384, Math.min(x, 49152));
        out[j++] = String.fromCharCode(x);
      }

      FlashFallbackPlayer.swf.write(out.join(""));

      this._written += this._writtenIncr;
    }
  }
}

let swfId = `PicoFlashFallbackPlayer${Date.now()}`;

let getPicoSwfUrl = () => {
  let scripts = global.document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    let matched = scripts[i].src.match(/^(.*\/)pico(?:\.min)?\.js$/);
    if (matched) {
      return matched[1] + "pico.swf";
    }
  }
  return "pico.swf";
};

let createFlashContainer = () => {
  let container = global.document.createElement("div");
  let object = global.document.createElement("object");
  let param = global.document.createElement("param");

  param.setAttribute("name", "allowScriptAccess");
  param.setAttribute("value", "always");

  object.id = swfId;
  object.classid = "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
  object.width = 1;
  object.height = 1;
  object.setAttribute("data", `${getPicoSwfUrl()}?${Date.now()}`);
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

FlashFallbackPlayer.fallback = (Pico) => {
  global.picojs$flashfallback = () => {
    Pico.bind(FlashFallbackPlayer);
    delete global.picojs$flashfallback;
  };

  global.window.addEventListener("load", () => {
    global.document.body.appendChild(createFlashContainer());
    FlashFallbackPlayer.swf = global.document.getElementById(swfId);
  });
};
