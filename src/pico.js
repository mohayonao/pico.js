"use strict";

import Processor from "./processor";

var processor = new Processor();

export default new class Pico {
  bind(klass) {
    processor.bind(klass);
  }

  play(audioprocess) {
    processor.play(audioprocess);
  }

  pause() {
    processor.pause();
  }

  get env() {
    return processor.env;
  }

  get sampleRate() {
    return processor.sampleRate;
  }

  get bufferSize() {
    return processor.bufferSize;
  }

  get isPlaying() {
    return processor.isPlaying;
  }
}();
