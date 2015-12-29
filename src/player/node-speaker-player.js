const Driver = require("pico.driver.nodeaudio");

class NodeSpeakerPlayer {
  constructor(processor) {
    this._driver = new Driver();
    this._driver.setup({ sampleRate: 44100, bufferLength: 2048 });
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
}

module.exports = NodeSpeakerPlayer;
