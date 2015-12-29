class Player {
  constructor(processor, sampleRate = 0, streamSize = 0, env = "") {
    this.processor = processor;
    this.sampleRate = sampleRate;
    this.streamSize = streamSize;
    this.env = env;
  }

  play() {}

  pause() {}
}

module.exports = Player;
