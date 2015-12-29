/* eslint-disable no-undefined */

const assert = require("power-assert");
const Player = require("../src/player/player");
const Pico = require("../src/pico");

describe("Pico", () => {
  describe("bind", () => {
    it("(klass: function): void", () => {
      assert(typeof Pico.bind === "function");
      assert(Pico.bind(Player) === undefined);
    });
  });
  describe("play", () => {
    it("(audioprocess: function): void", () => {
      assert(typeof Pico.play === "function");
      assert(Pico.play() === undefined);
    });
  });
  describe("pause", () => {
    it("(): void", () => {
      assert(typeof Pico.pause === "function");
      assert(Pico.pause() === undefined);
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
