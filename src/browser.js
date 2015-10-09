import Pico from "./pico";
import WebAudioPlayer from "./player/web-audio-player";
import FlashFallbackPlayer from "./player/flash-fallback-player";

if (WebAudioPlayer.isEnabled) {
  Pico.bind(WebAudioPlayer);
} else {
  FlashFallbackPlayer.fallback(Pico);
}

export default Pico;
