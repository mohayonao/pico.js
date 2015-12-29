/* eslint-disable consistent-this */
/* eslint-disable no-undefined */

const assert = require("power-assert");
const sinon = require("sinon");
const Processor = require("../src/processor");

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

describe("Processor", () => {
  describe("constructor", () => {
    it("()", () => {
      let processor = new Processor();

      processor.player = new Player();

      assert(processor instanceof Processor);
    });
  });
  describe("env", () => {
    it("getter: string", () => {
      let processor = new Processor();

      processor.player = new Player();

      assert(typeof processor.env === "string");
    });
  });
  describe("sampleRate", () => {
    it("getter: number", () => {
      let processor = new Processor();

      processor.player = new Player();

      assert(typeof processor.sampleRate === "number");
    });
  });
  describe("bufferSize", () => {
    it("getter: number", () => {
      let processor = new Processor();

      processor.player = new Player();

      assert(typeof processor.bufferSize === "number");
    });
  });
  describe("bind", () => {
    it("(klass: function): void", () => {
      let processor = new Processor();

      assert(typeof processor.bind === "function");
      assert(processor.bind(Player) === undefined);
    });
  });
  describe("play", () => {
    it("(audioprocess: function): void", () => {
      let processor = new Processor();

      processor.player = new Player();

      assert(typeof processor.play === "function");
      assert(processor.play() === undefined);
    });
  });
  describe("pause", () => {
    it("(): void", () => {
      let processor = new Processor();

      processor.player = new Player();

      assert(typeof processor.pause === "function");
      assert(processor.pause() === undefined);
    });
  });
  describe("works", () => {
    let testPlayer;

    class TestPlayer extends Player {
      constructor(processor) {
        super(processor, 44100, 2048, "test");
        testPlayer = this;
      }
    }

    beforeEach(() => {
      testPlayer = null;
    });

    it("audioprocess", () => {
      let processor = new Processor();
      let audioprocess = sinon.spy();
      let bufL = new Float32Array(2048);
      let bufR = new Float32Array(2048);

      assert(testPlayer === null);

      processor.bind(TestPlayer);

      sinon.spy(testPlayer, "play");
      sinon.spy(testPlayer, "pause");

      assert(processor.env === "test");
      assert(processor.sampleRate === 44100);

      assert(testPlayer.play.callCount === 0);
      assert(testPlayer.pause.callCount === 0);

      processor.pause();
      assert(testPlayer.pause.callCount === 0);

      processor.play(audioprocess);
      assert(testPlayer.play.callCount === 1);

      processor.play(null);
      assert(testPlayer.play.callCount === 1);

      processor.process(bufL, bufR);
      assert(audioprocess.callCount === 2048 / processor.bufferSize);

      let e = audioprocess.args[0][0];

      assert(e.bufferSize === processor.bufferSize);
      assert(Array.isArray(e.buffers));
      assert(e.buffers.length === 2);
      assert(e.buffers[0] instanceof Float32Array);
      assert(e.buffers[1] instanceof Float32Array);
      assert(e.buffers[0].length === processor.bufferSize);
      assert(e.buffers[1].length === processor.bufferSize);

      processor.pause();
      assert(testPlayer.pause.callCount === 1);

      processor.pause();
      assert(testPlayer.pause.callCount === 1);

      processor.play(audioprocess);
      assert(testPlayer.play.callCount === 2);

      processor.pause();
      assert(testPlayer.pause.callCount === 2);
    });
  });
});
