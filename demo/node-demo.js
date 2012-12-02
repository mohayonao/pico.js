/**
 * Mac版の node.js 用のデモです.
 * node-macaudio をインストールすると,
 * node.js用プレイヤー実装クラス PicoNodePlayer が使用可能になります.
 * 
 * npm install macaudio
 *
 * node-macaudio 
 * https://github.com/mohayonao/node-macaudio
 */

var pico = require("../pico");
require("../libs/PicoNodePlayer");
require("../libs/PicoDelayNode");

var demo = require("./demo");

pico.bind(pico.NodePlayer).play(demo());
