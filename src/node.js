const Pico = require("./pico");
const NodeSpeakerPlayer = require("./player/node-speaker-player");

Pico.bind(NodeSpeakerPlayer);

module.exports = Pico;
