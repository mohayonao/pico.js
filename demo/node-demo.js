/**
 * Demo for node.js (cross-platform)
 * 
 * dependencies
 * ============
 * - node-speaker
 *   Output raw PCM audio data to the speakers 
 *   https://github.com/TooTallNate/node-speaker
 *
 *   npm install speaker
 *
 * node v0.8.x compat
 * - readable-stream
 *   https://github.com/isaacs/readable-stream
 *
 *   npm install readable-stream
 */

var pico = require("../pico");
require("../libs/PicoNodePlayer");
require("../libs/PicoDelayNode");

var demo = require("./demo");

pico.bind(pico.NodePlayer).play(demo());
