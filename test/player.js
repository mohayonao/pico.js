"use strict";

import assert from "power-assert";
import Player from "../lib/player/player";

describe("Player", () => {
  describe("constructor", () => {
    it("(processor, sampleRate, streamSize, env)", () => {
      var player = new Player(null, 44100, 2048, "test");

      assert(player instanceof Player);
      assert(player.sampleRate === 44100);
      assert(player.streamSize === 2048);
      assert(player.env === "test");
    });
  });
  describe("play", () => {
    it("(): void", () => {
      var player = new Player();

      assert(typeof player.play === "function");
      assert(player.play() === void 0);
    });
  });
  describe("pause", () => {
    it("(): void", () => {
      var player = new Player();

      assert(typeof player.pause === "function");
      assert(player.pause() === void 0);
    });
  });
});
