/**
 * Demo for node.js (cross-platform)
 *
 * npm install node-pico
 */

require("node-pico");
require("../libs/PicoDelayNode");

var demo = require("./demo");

pico.play(demo());
