import assert from "power-assert";
import Player from "../src/player/player";
import Pico from "../src/pico";

describe("Pico", () => {
  describe("bind", () => {
    it("(klass: function): void", () => {
      assert(typeof Pico.bind === "function");
      assert(Pico.bind(Player) === void 0);
    });
  });
  describe("play", () => {
    it("(audioprocess: function): void", () => {
      assert(typeof Pico.play === "function");
      assert(Pico.play() === void 0);
    });
  });
  describe("pause", () => {
    it("(): void", () => {
      assert(typeof Pico.pause === "function");
      assert(Pico.pause() === void 0);
    });
  });
  describe("env", () => {
    it("getter: string", () => {
      assert(typeof Pico.env === "string");
    });
  });
  describe("sampleRate", () => {
    it("getter: number", () => {
      assert(typeof Pico.sampleRate === "number");
    });
  });
  describe("bufferSize", () => {
    it("getter: number", () => {
      assert(typeof Pico.bufferSize === "number");
    });
  });
  describe("isPlaying", () => {
    it("getter: boolean", () => {
      assert(typeof Pico.isPlaying === "boolean");
    });
  });
});
