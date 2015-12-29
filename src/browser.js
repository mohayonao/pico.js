const Pico = require("./pico");
const WebAudioPlayer = require("./player/web-audio-player");
const FlashFallbackPlayer = require("./player/flash-fallback-player");

if (WebAudioPlayer.isEnabled) {
  Pico.bind(WebAudioPlayer);
} else {
  FlashFallbackPlayer.fallback(Pico);
}

module.exports = Pico;
