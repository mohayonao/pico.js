import assert from "power-assert";
import sinon from "sinon";
import Player from "../lib/player/player";
import Processor from "../lib/processor";

describe("Processor", () => {
  describe("constructor", () => {
    it("()", () => {
      let processor = new Processor();

      assert(processor instanceof Processor);
    });
  });
  describe("env", () => {
    it("getter: string", () => {
      let processor = new Processor();

      assert(typeof processor.env === "string");
    });
  });
  describe("sampleRate", () => {
    it("getter: number", () => {
      let processor = new Processor();

      assert(typeof processor.sampleRate === "number");
    });
  });
  describe("bufferSize", () => {
    it("getter: number", () => {
      let processor = new Processor();

      assert(typeof processor.bufferSize === "number");
    });
  });
  describe("bind", () => {
    it("(klass: function): void", () => {
      let processor = new Processor();

      assert(typeof processor.bind === "function");
      assert(processor.bind(Player) === void 0);
    });
  });
  describe("play", () => {
    it("(audioprocess: function): void", () => {
      let processor = new Processor();

      assert(typeof processor.play === "function");
      assert(processor.play() === void 0);
    });
  });
  describe("pause", () => {
    it("(): void", () => {
      let processor = new Processor();

      assert(typeof processor.pause === "function");
      assert(processor.pause() === void 0);
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

      processor.process(2048);
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
