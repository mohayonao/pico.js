"use strict";

import stream from "stream";
import Speaker from "speaker";
import Player from "./player";

class NodeSpeakerPlayer extends Player {
  constructor(processor) {
    super(processor, 44100, 2048, "node");

    this._node = null;
  }

  play() {
    this._node = new stream.Readable();
    this._node._read = (n) => {
      var streamL = this.processor.streams[0];
      var streamR = this.processor.streams[1];
      var buf = new Buffer(n);

      this.processor.process(this.streamSize);

      for (var i = 0, imax = this.streamSize; i < imax; i++) {
        buf.writeFloatLE(streamL[i], i * 8 + 0);
        buf.writeFloatLE(streamR[i], i * 8 + 4);
      }

      this._node.push(buf);
    };
    this._node.pipe(new Speaker({
      sampleRate: this.sampleRate,
      samplesPerFrame: this.streamSize,
      channels: 2,
      float: true
    }));
  }

  pause() {
    process.nextTick(() => {
      this._node.emit("end");
      this._node = null;
    });
  }
}

export default NodeSpeakerPlayer;
