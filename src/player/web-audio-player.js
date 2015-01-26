"use strict";

import Player from "./player";

var AudioContext = global.AudioContext || global.webkitAudioContext;

class WebAudioPlayer extends Player {
  constructor(processor) {
    super(processor, 44100, 2048, "webaudio");

    this._context = new AudioContext();
    this._bufSrc = null;
    this._jsNode = null;

    this.sampleRate = this._context.sampleRate;
  }

  play() {
    this._jsNode = this._context.createScriptProcessor(this.streamSize, 1, 2);
    this._jsNode.onaudioprocess = (e) => {
      this.processor.process(this.streamSize);
      e.outputBuffer.getChannelData(0).set(this.processor.streams[0]);
      e.outputBuffer.getChannelData(1).set(this.processor.streams[1]);
    };
    this._jsNode.connect(this._context.destination);

    this._bufSrc = this._context.createBufferSource();
    this._bufSrc.start(0);
    this._bufSrc.connect(this._jsNode);
  }

  pause() {
    this._bufSrc.stop(0);
    this._bufSrc.disconnect();
    this._jsNode.disconnect();
  }
}

WebAudioPlayer.isEnabled = !!AudioContext;

export default WebAudioPlayer;
