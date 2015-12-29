const SWFID = `PicoFlashFallbackPlayer${Date.now()}`;

class FlashFallbackPlayer {
  constructor(processor) {
    this.env = "flashfallback";
    this.sampleRate = 44100;
    this.bufferLength = 2048;
    this.processor = processor;

    this._timerId = 0;
    this._timerAPI = global;
  }

  play() {
    if (FlashFallbackPlayer.swf && this._timerId === 0) {
      let processor = this.processor;
      let bufferLength = this.bufferLength;
      let bufL = new Float32Array(bufferLength);
      let bufR = new Float32Array(bufferLength);
      let out = new Array(bufferLength * 2);
      let written = 0;
      let startTime = Date.now();
      let writtenIncr = bufferLength / this.sampleRate * 1000;

      this._timerId = this._timerAPI.setInterval(() => {
        if (written < Date.now() - startTime) {
          let x;

          processor.process(bufL, bufR);

          for (let i = 0, j = 0; i < bufferLength; i++) {
            x = (bufL[i] * 16384 + 32768)|0;
            x = Math.max(16384, Math.min(x, 49152));
            out[j++] = String.fromCharCode(x);

            x = (bufR[i] * 16384 + 32768)|0;
            x = Math.max(16384, Math.min(x, 49152));
            out[j++] = String.fromCharCode(x);
          }

          FlashFallbackPlayer.swf.write(out.join(""));

          written += writtenIncr;
        }
      }, 25);
      FlashFallbackPlayer.swf.play();
    }
  }

  pause() {
    if (FlashFallbackPlayer.swf && this._timerId !== 0) {
      this._timerAPI.clearInterval(this._timerId);
      this._timerId = 0;
      FlashFallbackPlayer.swf.pause();
    }
  }
}

function getPicoSwfUrl() {
  let scripts = global.document.getElementsByTagName("script");

  for (let i = 0; i < scripts.length; i++) {
    let matched = scripts[i].src.match(/^(.*\/)pico(?:\.min)?\.js$/);

    if (matched) {
      return matched[1] + "pico.swf";
    }
  }
  return "pico.swf";
}

function createFlashContainer(swfId) {
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
}

FlashFallbackPlayer.fallback = (Pico) => {
  global.picojs$flashfallback = () => {
    Pico.bind(FlashFallbackPlayer);
    delete global.picojs$flashfallback;
  };

  global.window.addEventListener("load", () => {
    global.document.body.appendChild(createFlashContainer(SWFID));
    FlashFallbackPlayer.swf = global.document.getElementById(SWFID);
  });
};

module.exports = FlashFallbackPlayer;
