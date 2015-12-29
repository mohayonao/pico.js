const Driver = require("pico.driver.webaudio");
const AudioContext = global.AudioContext || global.webkitAudioContext;

class WebAudioPlayer {
  constructor(processor) {
    this._driver = new Driver();
    this._driver.setup({ context: new AudioContext(), bufferLength: 2048 });
    this._driver.processor = processor;

    this.env = "webaudio";
    this.bufferLength = this._driver.bufferLength;
    this.sampleRate = this._driver.sampleRate;
  }

  play() {
    this._driver.start();
  }

  pause() {
    this._driver.stop();
  }

  static get isEnabled() {
    return !!AudioContext;
  }
}

module.exports = WebAudioPlayer;
