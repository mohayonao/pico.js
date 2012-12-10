/**
 * Demo for node.js (cross-platform)
 *
 * npm install node-pico
 */

var pico;

try {
    pico = require("node-pico");
} catch (e) {
    pico = require("../pico");
    
    require("../libs/PicoNodePlayer");
    pico.bind(pico.NodePlayer);
}

require("../libs/PicoDelayNode");

var demo = require("./demo");

pico.play(demo());
